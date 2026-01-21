using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Invoices;
using SaaS.Application.DTOs.Sales;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IWhatsAppProvider _whatsappProvider;
    private readonly IWhatsAppNumberRepository _whatsappNumberRepository;

    public InvoiceService(
        IInvoiceRepository invoiceRepository,
        ISaleRepository saleRepository,
        ICustomerRepository customerRepository,
        IWhatsAppProvider whatsappProvider,
        IWhatsAppNumberRepository whatsappNumberRepository)
    {
        _invoiceRepository = invoiceRepository;
        _saleRepository = saleRepository;
        _customerRepository = customerRepository;
        _whatsappProvider = whatsappProvider;
        _whatsappNumberRepository = whatsappNumberRepository;
    }

    public async Task<ResponsePagination<InvoiceResponse>> SearchAsync(
        ODataQueryOptions<InvoiceResponse> queryOptions, 
        string companyId)
    {
        // 1. Obtener IQueryable filtrado por companyId (NO carga datos)
        var invoicesQuery = _invoiceRepository.GetQueryable(companyId);
        
        // 2. Mapear a DTOs inline (aún NO ejecuta query)
        var invoiceResponses = invoicesQuery.Select(invoice => new InvoiceResponse
        {
            Id = invoice.Id,
            SaleId = invoice.SaleId,
            CustomerId = invoice.CustomerId,
            CompanyId = invoice.CompanyId,
            Number = invoice.Number,
            Status = invoice.Status,
            IssuedAt = invoice.IssuedAt,
            DueDate = invoice.DueDate,
            Total = invoice.Total,
            Items = invoice.Items.Select(i => new SaleItemResponse
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TaxRate = i.TaxRate,
                Subtotal = i.Subtotal,
                Total = i.Total
            }).ToList()
        });

        // 3. Aplicar OData (TODAVÍA en MongoDB)
        var filteredQuery = queryOptions.ApplyTo(invoiceResponses) as IQueryable<InvoiceResponse>;
        
        // 4. Contar total (ejecuta COUNT en MongoDB)
        var totalCount = filteredQuery?.LongCount() ?? 0;

        // 5. Extraer skip y top
        var skip = queryOptions.Skip?.Value ?? 0;
        var top = queryOptions.Top?.Value ?? 20;

        // 6. Aplicar paginación y ejecutar (solo trae registros necesarios)
        var results = filteredQuery?
            .Skip(skip)
            .Take(top)
            .ToList() ?? new List<InvoiceResponse>();

        return new ResponsePagination<InvoiceResponse>
        {
            Result = results,
            Page = skip,
            RowsPerPage = top,
            TotalRows = totalCount
        };
    }

    public async Task<List<InvoiceResponse>> GetAllAsync(string companyId)
    {
        var invoices = await _invoiceRepository.GetByCompanyIdAsync(companyId);
        return invoices.Select(MapToResponse).ToList();
    }

    public async Task<InvoiceResponse?> GetByIdAsync(string id, string companyId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null || invoice.CompanyId != companyId)
            return null;

        return MapToResponse(invoice);
    }

    public async Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest request, string companyId)
    {
        var sale = await _saleRepository.GetByIdAsync(request.SaleId);
        if (sale == null || sale.CompanyId != companyId)
             throw new ArgumentException("Invalid sale");

        // Validar si ya existe factura
        var existing = await _invoiceRepository.GetBySaleIdAsync(sale.Id);
        if (existing != null)
             throw new InvalidOperationException("Invoice already exists for this sale");

        // Generar número (simple)
        var number = "INV-" + DateTime.UtcNow.Ticks.ToString().Substring(10);

        var invoice = new Invoice
        {
            CompanyId = companyId,
            SaleId = sale.Id,
            CustomerId = sale.CustomerId,
            Number = number,
            Items = sale.Items, // Copiar items
            Subtotal = sale.Subtotal,
            TaxAmount = sale.TaxAmount,
            Total = sale.Total,
            Status = InvoiceStatus.Issued,
            IssuedAt = DateTime.UtcNow,
            DueDate = DateTime.UtcNow.AddDays(30) // Configurable
        };

        var created = await _invoiceRepository.CreateAsync(invoice);

        // Actualizar estado de la venta
        sale.State = CommercialState.INVOICED;
        await _saleRepository.UpdateAsync(sale);

        // Actualizar estado cliente
        var customer = await _customerRepository.GetByIdAsync(sale.CustomerId);
        if (customer != null)
        {
            customer.CurrentState = CommercialState.INVOICED;
            await _customerRepository.UpdateAsync(customer);
        }

        return MapToResponse(created);
    }

    public async Task<InvoiceResponse?> UpdateStatusAsync(string id, UpdateInvoiceStatusRequest request, string companyId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null || invoice.CompanyId != companyId)
            return null;

        invoice.Status = request.Status;
        if (request.Status == InvoiceStatus.Sent && !invoice.SentAt.HasValue)
            invoice.SentAt = DateTime.UtcNow;
        if (request.Status == InvoiceStatus.Paid && !invoice.PaidAt.HasValue)
            invoice.PaidAt = DateTime.UtcNow;

        var updated = await _invoiceRepository.UpdateAsync(invoice);

        // Si se paga, marcar venta como pagada
        if(updated.Status == InvoiceStatus.Paid) 
        {
             var sale = await _saleRepository.GetByIdAsync(updated.SaleId);
             if (sale != null) 
             {
                 sale.State = CommercialState.PAID;
                 await _saleRepository.UpdateAsync(sale);
             }
             
             // Y el cliente tambien
             var customer = await _customerRepository.GetByIdAsync(updated.CustomerId);
             if (customer != null)
             {
                 customer.CurrentState = CommercialState.PAID;
                 await _customerRepository.UpdateAsync(customer);
             }
        }

        return MapToResponse(updated);
    }

    public Task<byte[]?> GeneratePdfAsync(string id, string companyId)
    {
        // Placeholder para el PDF de la factura
        // En una implementación real usaríamos iText7 o QuestPDF
        return Task.FromResult<byte[]?>(new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34 }); // PDF Header
    }

    public async Task SendWhatsAppAsync(string id, string companyId)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null || invoice.CompanyId != companyId) return;

        var customer = await _customerRepository.GetByIdAsync(invoice.CustomerId);
        if (customer == null) return;

        var waNumber = await _whatsappNumberRepository.GetActiveByCompanyIdAsync(companyId);
        if (waNumber == null) return;

        var pdfBytes = await GeneratePdfAsync(id, companyId);
        
        // 1. Enviar mensaje de texto inicial
        await _whatsappProvider.SendTextMessageAsync(companyId, customer.Phone, 
            $"Hola {customer.Name}, aquí tienes tu factura {invoice.Number} por un total de {invoice.Total:C}.");

        // 2. Enviar el PDF
        var success = await _whatsappProvider.SendPdfAsync(companyId, customer.Phone, pdfBytes ?? Array.Empty<byte>(), $"factura-{invoice.Number}.pdf");

        if (success)
        {
            invoice.Status = InvoiceStatus.Sent;
            invoice.SentAt = DateTime.UtcNow;
            await _invoiceRepository.UpdateAsync(invoice);
        }
    }

    private InvoiceResponse MapToResponse(Invoice invoice)
    {
        return new InvoiceResponse
        {
            Id = invoice.Id,
            SaleId = invoice.SaleId,
            CustomerId = invoice.CustomerId,
            CompanyId = invoice.CompanyId,
            Number = invoice.Number,
            Status = invoice.Status,
            IssuedAt = invoice.IssuedAt,
            DueDate = invoice.DueDate,
            Total = invoice.Total,
            Items = invoice.Items.Select(i => new SaleItemResponse
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TaxRate = i.TaxRate,
                Subtotal = i.Subtotal,
                Total = i.Total
            }).ToList()
        };
    }
}
