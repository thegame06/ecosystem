using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using System.Linq;
using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Common;
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
    private readonly ICompanyRepository _companyRepository;

    public SaleService(
        ISaleRepository saleRepository,
        IProductRepository productRepository,
        ICustomerRepository customerRepository, 
        IInvoiceRepository invoiceRepository,
        ICompanyRepository companyRepository)
    {
        _saleRepository = saleRepository;
        _productRepository = productRepository;
        _customerRepository = customerRepository;
        _invoiceRepository = invoiceRepository;
        _companyRepository = companyRepository;
    }

    public async Task<ResponsePagination<SaleResponse>> SearchAsync(
        ODataQueryOptions<SaleResponse> queryOptions, 
        string companyId)
    {
        // 1. Obtener IQueryable filtrado por companyId (NO carga datos en memoria)
        var salesQuery = _saleRepository.GetQueryable(companyId);
        
        // 2. Mapear a DTOs (aún en IQueryable, no ejecutado)
        var saleResponses = salesQuery.Select(sale => new SaleResponse
        {
            Id = sale.Id,
            CompanyId = sale.CompanyId,
            CustomerId = sale.CustomerId,
            Number = sale.Number,
            Date = sale.Date,
            Subtotal = sale.Subtotal,
            TaxAmount = sale.TaxAmount,
            Total = sale.Total,
            State = sale.State,
            PaymentMethod = sale.PaymentMethod,
            CreatedAt = sale.CreatedAt,
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
        });

        // 3. Aplicar OData (filtros, orden) - TODAVÍA en MongoDB
        var filteredQuery = queryOptions.ApplyTo(saleResponses) as IQueryable<SaleResponse>;
        
        // 4. Contar total (ejecuta query COUNT en MongoDB)
        var totalCount = filteredQuery?.LongCount() ?? 0;

        // 5. Extraer skip y top
        var skip = queryOptions.Skip?.Value ?? 0;
        var top = queryOptions.Top?.Value ?? 20;

        // 6. Aplicar paginación y AHORA SÍ ejecutar query (solo trae los registros necesarios)
        var results = filteredQuery?
            .Skip(skip)
            .Take(top)
            .ToList() ?? new List<SaleResponse>();

        // 7. Enriquecer con nombres de clientes
        if (results.Any())
        {
            var customerIds = results.Select(r => r.CustomerId).Distinct().ToList();
            var customers = await _customerRepository.GetByCompanyIdAsync(companyId); // Podríamos optimizar esto a GetByIds si existiera
            var customerDict = customers.Where(c => customerIds.Contains(c.Id))
                                       .ToDictionary(c => c.Id, c => c.Name);

            foreach (var sale in results)
            {
                if (customerDict.TryGetValue(sale.CustomerId, out var name))
                {
                    sale.CustomerName = name;
                }
                else
                {
                    sale.CustomerName = "Unknown";
                }
            }
        }

        return new ResponsePagination<SaleResponse>
        {
            Items = results,
            PageNumber = skip / top + 1,
            RowsPerPage = top,
            TotalCount = totalCount
        };
    }

    public async Task<List<SaleResponse>> GetAllAsync(string companyId)
    {
        var sales = await _saleRepository.GetByCompanyIdAsync(companyId);
        var customers = await _customerRepository.GetByCompanyIdAsync(companyId);
        var customerDict = customers.ToDictionary(c => c.Id, c => c.Name);

        return sales.Select(s => MapToResponse(s, customerDict.GetValueOrDefault(s.CustomerId, "Unknown"))).ToList();
    }

    public async Task<SaleResponse?> GetByIdAsync(string id, string companyId)
    {
        var sale = await _saleRepository.GetByIdAsync(id);
        if (sale == null || sale.CompanyId != companyId)
            return null;

        var customer = await _customerRepository.GetByIdAsync(sale.CustomerId);
        return MapToResponse(sale, customer?.Name ?? "Unknown");
    }

    public async Task<SaleResponse> CreateAsync(CreateSaleRequest request, string companyId, string userId)
    {
        if (!Enum.IsDefined(typeof(PaymentMethod), request.PaymentMethod))
            throw new ArgumentException("Invalid payment method");

        // Validar cliente
        var customer = await _customerRepository.GetByIdAsync(request.CustomerId);
        if (customer == null || customer.CompanyId != companyId)
            throw new ArgumentException("Invalid customer");
        
        var sale = new Sale
        {
            CompanyId = companyId,
            CustomerId = request.CustomerId,
            CreatedByUserId = userId,
            Date = DateTime.UtcNow,
            State = CommercialState.SALE_CREATED,
            PaymentMethod = request.PaymentMethod,
            Items = new List<SaleItem>()
        };

        var company = await _companyRepository.GetByIdAsync(companyId);
        var companyTaxRate = company?.TaxRate ?? 0.15m;

        // Procesar items
        foreach (var itemRequest in request.Items)
        {
            var product = await _productRepository.GetByIdAsync(itemRequest.ProductId);
            if (product == null || product.CompanyId != companyId)
                throw new ArgumentException($"Invalid product {itemRequest.ProductId}");
            
            // Validar inventario si aplica
            if (product.TrackInventory && product.StockQuantity < itemRequest.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product {product.Name}");

            var unitPrice = itemRequest.UnitPrice ?? product.Price;
            var taxRate = product.TaxRate ?? companyTaxRate;
            
            decimal lineSubtotal, lineTaxAmount, lineTotal;

            if (product.PriceIncludesTax)
            {
                // Precio ya incluye IVA
                lineTotal = itemRequest.Quantity * unitPrice;
                lineSubtotal = lineTotal / (1 + taxRate);
                lineTaxAmount = lineTotal - lineSubtotal;
            }
            else
            {
                // Precio NO incluye IVA
                lineSubtotal = itemRequest.Quantity * unitPrice;
                lineTaxAmount = lineSubtotal * taxRate;
                lineTotal = lineSubtotal + lineTaxAmount;
            }

            sale.Items.Add(new SaleItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = itemRequest.Quantity,
                UnitPrice = unitPrice,
                TaxRate = taxRate,
                Subtotal = Math.Round(lineSubtotal, 2),
                TaxAmount = Math.Round(lineTaxAmount, 2),
                Total = Math.Round(lineTotal, 2)
            });
        }

        // Calcular totales
        sale.Subtotal = sale.Items.Sum(i => i.Subtotal);
        sale.TaxAmount = sale.Items.Sum(i => i.TaxAmount);
        sale.Total = sale.Items.Sum(i => i.Total);

        // Generar número simple (TODO: Mejorar generador de secuencias)
        sale.Number = "S-" + DateTime.UtcNow.Ticks.ToString().Substring(10); 

        var created = await _saleRepository.CreateAsync(sale);

        // Actualizar estado cliente
        if (customer.CurrentState == CommercialState.LEAD)
        {
            customer.CurrentState = CommercialState.SALE_CREATED;
            await _customerRepository.UpdateAsync(customer);
        }

        return MapToResponse(created, customer.Name);
    }

    public async Task<SaleResponse?> UpdateAsync(string id, UpdateSaleRequest request, string companyId, string userId)
    {
        var sale = await _saleRepository.GetByIdAsync(id);
        if (sale == null || sale.CompanyId != companyId)
            return null;

        if (sale.State == CommercialState.INVOICED || sale.State == CommercialState.PAID)
             throw new InvalidOperationException("Cannot update a finalized sale");

        if (request.Items != null)
        {
             var company = await _companyRepository.GetByIdAsync(companyId);
             var companyTaxRate = company?.TaxRate ?? 0.15m;
             
             sale.Items.Clear();
             foreach(var itemRequest in request.Items)
             {
                 var product = await _productRepository.GetByIdAsync(itemRequest.ProductId);
                 if (product == null || product.CompanyId != companyId)
                     throw new ArgumentException($"Invalid product {itemRequest.ProductId}");
                 
                 var unitPrice = itemRequest.UnitPrice ?? product.Price;
                 var taxRate = product.TaxRate ?? companyTaxRate;

                 decimal lineSubtotal, lineTaxAmount, lineTotal;

                 if (product.PriceIncludesTax)
                 {
                     lineTotal = itemRequest.Quantity * unitPrice;
                     lineSubtotal = lineTotal / (1 + taxRate);
                     lineTaxAmount = lineTotal - lineSubtotal;
                 }
                 else
                 {
                     lineSubtotal = itemRequest.Quantity * unitPrice;
                     lineTaxAmount = lineSubtotal * taxRate;
                     lineTotal = lineSubtotal + lineTaxAmount;
                 }

                 sale.Items.Add(new SaleItem
                 {
                     ProductId = product.Id,
                     ProductName = product.Name,
                     Quantity = itemRequest.Quantity,
                     UnitPrice = unitPrice,
                     TaxRate = taxRate,
                     Subtotal = Math.Round(lineSubtotal, 2),
                     TaxAmount = Math.Round(lineTaxAmount, 2),
                     Total = Math.Round(lineTotal, 2)
                 });
             }
             sale.Subtotal = sale.Items.Sum(i => i.Subtotal);
             sale.TaxAmount = sale.Items.Sum(i => i.TaxAmount);
             sale.Total = sale.Items.Sum(i => i.Total);
        }

        // TODO Notes...

        var updated = await _saleRepository.UpdateAsync(sale);
        var customer = await _customerRepository.GetByIdAsync(sale.CustomerId);
        return MapToResponse(updated, customer?.Name ?? "Unknown");
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

    private SaleResponse MapToResponse(Sale sale, string customerName)
    {
        return new SaleResponse
        {
            Id = sale.Id,
            CompanyId = sale.CompanyId,
            CustomerId = sale.CustomerId,
            CustomerName = customerName,
            Number = sale.Number,
            Date = sale.Date,
            Subtotal = sale.Subtotal,
            TaxAmount = sale.TaxAmount,
            Total = sale.Total,
            State = sale.State,
            PaymentMethod = sale.PaymentMethod,
            CreatedAt = sale.CreatedAt,
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
