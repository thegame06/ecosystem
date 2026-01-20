using SaaS.Application.DTOs.Invoices;
using SaaS.Application.DTOs.Sales;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Services;

public class SaleService : ISaleService
{
    private readonly ISaleRepository _saleRepository;
    private readonly IProductRepository _productRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IInvoiceRepository _invoiceRepository;

    public SaleService(
        ISaleRepository saleRepository,
        IProductRepository productRepository,
        ICustomerRepository customerRepository, 
        IInvoiceRepository invoiceRepository)
    {
        _saleRepository = saleRepository;
        _productRepository = productRepository;
        _customerRepository = customerRepository;
        _invoiceRepository = invoiceRepository;
    }

    public async Task<List<SaleResponse>> GetAllAsync(string companyId)
    {
        var sales = await _saleRepository.GetByCompanyIdAsync(companyId);
        return sales.Select(MapToResponse).ToList();
    }

    public async Task<SaleResponse?> GetByIdAsync(string id, string companyId)
    {
        var sale = await _saleRepository.GetByIdAsync(id);
        if (sale == null || sale.CompanyId != companyId)
            return null;

        return MapToResponse(sale);
    }

    public async Task<SaleResponse> CreateAsync(CreateSaleRequest request, string companyId)
    {
        // Validar cliente
        var customer = await _customerRepository.GetByIdAsync(request.CustomerId);
        if (customer == null || customer.CompanyId != companyId)
            throw new ArgumentException("Invalid customer");
        
        var sale = new Sale
        {
            CompanyId = companyId,
            CustomerId = request.CustomerId,
            Date = DateTime.UtcNow,
            State = CommercialState.SALE_CREATED,
            Items = new List<SaleItem>()
        };

        // Procesar items
        foreach (var itemRequest in request.Items)
        {
            var product = await _productRepository.GetByIdAsync(itemRequest.ProductId);
            if (product == null || product.CompanyId != companyId)
                throw new ArgumentException($"Invalid product {itemRequest.ProductId}");
            
            // Validar inventario si aplica
            if (product.TrackInventory && product.StockQuantity < itemRequest.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product {product.Name}");

            var price = itemRequest.UnitPrice ?? product.Price;
            var taxRate = product.TaxRate ?? 0.16m; // TODO: Usar defaults de Company

            sale.Items.Add(new SaleItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = itemRequest.Quantity,
                UnitPrice = price,
                TaxRate = taxRate,
                Subtotal = itemRequest.Quantity * price
            });
        }

        // Calcular totales
        sale.Subtotal = sale.Items.Sum(i => i.Subtotal);
        sale.TaxAmount = sale.Items.Sum(i => i.Subtotal * i.TaxRate);
        sale.Total = sale.Subtotal + sale.TaxAmount;

        // Generar número simple (TODO: Mejorar generador de secuencias)
        sale.Number = "S-" + DateTime.UtcNow.Ticks.ToString().Substring(10); 

        var created = await _saleRepository.CreateAsync(sale);

        // Actualizar estado cliente
        if (customer.CurrentState == CommercialState.LEAD)
        {
            customer.CurrentState = CommercialState.SALE_CREATED;
            await _customerRepository.UpdateAsync(customer);
        }

        return MapToResponse(created);
    }

    public async Task<SaleResponse?> UpdateAsync(string id, UpdateSaleRequest request, string companyId)
    {
        var sale = await _saleRepository.GetByIdAsync(id);
        if (sale == null || sale.CompanyId != companyId)
            return null;

        if (sale.State == CommercialState.INVOICED || sale.State == CommercialState.PAID)
             throw new InvalidOperationException("Cannot update a finalized sale");

        if (request.Items != null)
        {
             // Logica similar a Create para recalcular
             sale.Items.Clear();
             foreach(var itemRequest in request.Items)
             {
                 var product = await _productRepository.GetByIdAsync(itemRequest.ProductId);
                 if (product == null || product.CompanyId != companyId)
                     throw new ArgumentException($"Invalid product {itemRequest.ProductId}");
                 
                 var price = itemRequest.UnitPrice ?? product.Price;
                 var taxRate = product.TaxRate ?? 0;

                 sale.Items.Add(new SaleItem
                 {
                     ProductId = product.Id,
                     ProductName = product.Name,
                     Quantity = itemRequest.Quantity,
                     UnitPrice = price,
                     TaxRate = taxRate,
                     Subtotal = itemRequest.Quantity * price
                 });
             }
             sale.Subtotal = sale.Items.Sum(i => i.Subtotal);
            sale.TaxAmount = sale.Items.Sum(i => i.Subtotal * i.TaxRate);
            sale.Total = sale.Subtotal + sale.TaxAmount;
        }

        // TODO Notes...

        var updated = await _saleRepository.UpdateAsync(sale);
        return MapToResponse(updated);
    }

    public async Task<InvoiceResponse?> GetInvoiceAsync(string saleId, string companyId)
    {
        var sale = await _saleRepository.GetByIdAsync(saleId);
        if (sale == null || sale.CompanyId != companyId) 
            return null;

        var invoice = await _invoiceRepository.GetBySaleIdAsync(saleId);
        if (invoice == null) 
            return null;
        
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

    private SaleResponse MapToResponse(Sale sale)
    {
        return new SaleResponse
        {
            Id = sale.Id,
            CompanyId = sale.CompanyId,
            CustomerId = sale.CustomerId,
            Number = sale.Number,
            Date = sale.Date,
            Subtotal = sale.Subtotal,
            TaxAmount = sale.TaxAmount,
            Total = sale.Total,
            Status = sale.State.ToString(),
            Items = sale.Items.Select(i => new SaleItemResponse
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
