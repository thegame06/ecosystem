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

    public InvoiceService(
        IInvoiceRepository invoiceRepository,
        ISaleRepository saleRepository,
        ICustomerRepository customerRepository)
    {
        _invoiceRepository = invoiceRepository;
        _saleRepository = saleRepository;
        _customerRepository = customerRepository;
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

    public Task<byte[]> GeneratePdfAsync(string id, string companyId)
    {
        // Placeholder
        return Task.FromResult(new byte[0]);
    }

    public Task<bool> SendWhatsAppAsync(string id, string companyId)
    {
        // Placeholder
        return Task.FromResult(true);
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
