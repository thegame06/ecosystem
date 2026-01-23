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
using SaaS.Domain.Services;

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
            Channel = sale.Channel,
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

        var customer = await _customerRepository.GetByIdAsync(request.CustomerId);
        if (customer == null || customer.CompanyId != companyId)
            throw new ArgumentException("Invalid customer");

        var company = await _companyRepository.GetByIdAsync(companyId);
        var companyTaxRate = company?.TaxRate ?? 0.15m;

        // Cargar productos y validar
        var saleItemInputs = new List<SaleItemInput>();
        foreach (var itemReq in request.Items)
        {
            var product = await _productRepository.GetByIdAsync(itemReq.ProductId);
            if (product == null || product.CompanyId != companyId)
                throw new ArgumentException($"Invalid product {itemReq.ProductId}");

            // RESTAURADO: Validación de inventario
            if (product.TrackInventory && product.StockQuantity < itemReq.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product {product.Name}. Available: {product.StockQuantity}, Requested: {itemReq.Quantity}");

            var unitPrice = itemReq.UnitPrice ?? product.Price;

            saleItemInputs.Add(new SaleItemInput
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Unit = product.Unit ?? "Unidad",
                Quantity = itemReq.Quantity,
                UnitPrice = unitPrice,
                TaxRate = product.TaxRate,
                IsTaxable = product.IsTaxable,
                PriceIncludesTax = product.PriceIncludesTax  // CORREGIDO: Ahora se usa
            });
        }

        // USAR HELPER DE CÁLCULO (Single Source of Truth)
        var calculation = SalePricingCalculator.Calculate(
            saleItemInputs,
            companyTaxRate,
            request.ApplyTax ?? true,
            request.GlobalDiscount?.Type ?? DiscountType.None,
            request.GlobalDiscount?.Value ?? 0
        );

        // Crear entidad Sale con resultados del cálculo
        var sale = new Sale
        {
            CompanyId = companyId,
            CustomerId = request.CustomerId,
            CreatedByUserId = userId,
            Date = DateTime.UtcNow,
            State = CommercialState.SALE_CREATED,
            PaymentMethod = request.PaymentMethod,
            Channel = request.Channel ?? "POS",
            ApplyTax = request.ApplyTax ?? true,
            GlobalDiscountType = request.GlobalDiscount?.Type ?? DiscountType.None,
            GlobalDiscountValue = request.GlobalDiscount?.Value ?? 0,
            Number = "S-" + DateTime.UtcNow.Ticks.ToString().Substring(10),
            Items = calculation.Items.Select(calc => new SaleItem
            {
                ProductId = calc.ProductId,
                NameSnapshot = calc.ProductName,
                ProductName = calc.ProductName,
                Unit = calc.Unit,
                Quantity = calc.Quantity,
                UnitPrice = calc.UnitPrice,
                DiscountType = calc.DiscountType,
                DiscountValue = calc.DiscountValue,
                DiscountedSubtotal = calc.DiscountedSubtotal,
                Subtotal = calc.DiscountedSubtotal, // Compatibilidad
                TaxRate = calc.TaxRate,
                TaxAmount = calc.TaxAmount,
                Total = calc.Total
            }).ToList(),
            Subtotal = calculation.Subtotal,
            TaxAmount = calculation.TaxTotal,
            Total = calculation.Total
        };

        var created = await _saleRepository.CreateAsync(sale);

        // Actualizar estado del cliente
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

        // Actualizar campos básicos (configuración comercial)
        if (request.PaymentMethod.HasValue) sale.PaymentMethod = request.PaymentMethod.Value;
        if (request.ApplyTax.HasValue) sale.ApplyTax = request.ApplyTax.Value;
        if (request.Notes != null) sale.Notes = request.Notes;
        if (request.GlobalDiscount != null)
        {
            sale.GlobalDiscountType = request.GlobalDiscount.Type;
            sale.GlobalDiscountValue = request.GlobalDiscount.Value;
        }

        // Si se actualizan items, RECALCULAR usando helper
        if (request.Items != null)
        {
            var company = await _companyRepository.GetByIdAsync(companyId);
            var companyTaxRate = company?.TaxRate ?? 0.15m;

            // Cargar productos y validar
            var saleItemInputs = new List<SaleItemInput>();
            foreach (var itemReq in request.Items)
            {
                var product = await _productRepository.GetByIdAsync(itemReq.ProductId);
                if (product == null || product.CompanyId != companyId)
                    throw new ArgumentException($"Invalid product {itemReq.ProductId}");

                // RESTAURADO: Validación de inventario en UPDATE
                if (product.TrackInventory && product.StockQuantity < itemReq.Quantity)
                    throw new InvalidOperationException($"Insufficient stock for product {product.Name}. Available: {product.StockQuantity}, Requested: {itemReq.Quantity}");

                var unitPrice = itemReq.UnitPrice ?? product.Price;

                saleItemInputs.Add(new SaleItemInput
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Unit = product.Unit ?? "Unidad",
                    Quantity = itemReq.Quantity,
                    UnitPrice = unitPrice,
                    TaxRate = product.TaxRate,
                    IsTaxable = product.IsTaxable,
                    PriceIncludesTax = product.PriceIncludesTax  // CORREGIDO: Ahora se usa
                });
            }

            // USAR HELPER DE CÁLCULO (Single Source of Truth)
            var calculation = SalePricingCalculator.Calculate(
                saleItemInputs,
                companyTaxRate,
                sale.ApplyTax,
                sale.GlobalDiscountType,
                sale.GlobalDiscountValue
            );

            // Actualizar items y totales con resultados del cálculo
            sale.Items.Clear();
            sale.Items.AddRange(calculation.Items.Select(calc => new SaleItem
            {
                ProductId = calc.ProductId,
                NameSnapshot = calc.ProductName,
                ProductName = calc.ProductName,
                Unit = calc.Unit,
                Quantity = calc.Quantity,
                UnitPrice = calc.UnitPrice,
                DiscountType = calc.DiscountType,
                DiscountValue = calc.DiscountValue,
                DiscountedSubtotal = calc.DiscountedSubtotal,
                Subtotal = calc.DiscountedSubtotal, // Compatibilidad
                TaxRate = calc.TaxRate,
                TaxAmount = calc.TaxAmount,
                Total = calc.Total
            }));

            sale.Subtotal = calculation.Subtotal;
            sale.TaxAmount = calculation.TaxTotal;
            sale.Total = calculation.Total;
        }

        sale.UpdatedAt = DateTime.UtcNow;
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
            Channel = sale.Channel,
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
