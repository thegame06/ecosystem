using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Products;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;

    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ResponsePagination<ProductResponse>> SearchAsync(
        ODataQueryOptions<ProductResponse> queryOptions, 
        string companyId)
    {
        // 1. Obtener IQueryable filtrado por companyId (NO carga datos)
        var productsQuery = _productRepository.GetQueryable(companyId);
        
        // 2. Mapear a DTOs inline (aún NO ejecuta query)
        var productResponses = productsQuery.Select(product => new ProductResponse
        {
            Id = product.Id,
            CompanyId = product.CompanyId,
            Name = product.Name,
            Description = product.Description,
            Type = product.Type,
            Price = product.Price,
            CostPrice = product.CostPrice,
            TaxRate = product.TaxRate,
            ImageUrl = product.ImageUrl,
            Unit = product.Unit,
            Discount = product.Discount,
            TrackInventory = product.TrackInventory,
            Stock = product.StockQuantity,
            RentalPricePerDay = product.RentalPricePerDay,
            RentalPricePerHour = product.RentalPricePerHour,
            PriceIncludesTax = product.PriceIncludesTax,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        });

        // 3. Aplicar OData (TODAVÍA en MongoDB)
        var filteredQuery = queryOptions.ApplyTo(productResponses) as IQueryable<ProductResponse>;
        
        // 4. Contar total (ejecuta COUNT en MongoDB)
        var totalCount = filteredQuery?.LongCount() ?? 0;

        // 5. Extraer skip y top
        var skip = queryOptions.Skip?.Value ?? 0;
        var top = queryOptions.Top?.Value ?? 20;

        // 6. Aplicar paginación y ejecutar (solo trae registros necesarios)
        var results = filteredQuery?
            .Skip(skip)
            .Take(top)
            .ToList() ?? new List<ProductResponse>();

        return new ResponsePagination<ProductResponse>
        {
            Result = results,
            Page = skip,
            RowsPerPage = top,
            TotalRows = totalCount
        };
    }

    public async Task<ProductResponse?> GetByIdAsync(string id, string companyId)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null || product.CompanyId != companyId)
            return null;

        return MapToResponse(product);
    }

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request, string companyId)
    {
        var product = new Product
        {
            CompanyId = companyId,
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Price = request.Price,
            CostPrice = request.CostPrice,
            TaxRate = request.TaxRate,
            ImageUrl = request.ImageUrl,
            Unit = request.Unit,
            Discount = request.Discount,
            TrackInventory = request.TrackInventory,
            StockQuantity = request.Stock,
            PriceIncludesTax = request.PriceIncludesTax
        };

        var created = await _productRepository.CreateAsync(product);
        return MapToResponse(created);
    }

    public async Task<ProductResponse?> UpdateAsync(string id, UpdateProductRequest request, string companyId)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null || product.CompanyId != companyId)
            return null;

        product.Name = request.Name;
        product.Description = request.Description;
        product.Type = request.Type;
        product.Price = request.Price;
        product.CostPrice = request.CostPrice;
        product.TaxRate = request.TaxRate;
        product.ImageUrl = request.ImageUrl;
        product.Unit = request.Unit;
        product.Discount = request.Discount;
        product.TrackInventory = request.TrackInventory;
        product.StockQuantity = request.Stock;
        product.PriceIncludesTax = request.PriceIncludesTax;
        product.IsActive = request.IsActive;

        var updated = await _productRepository.UpdateAsync(product);
        return MapToResponse(updated);
    }

    public async Task<bool> DeleteAsync(string id, string companyId)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null || product.CompanyId != companyId)
            return false;

        await _productRepository.DeleteAsync(id);
        return true;
    }

    private static ProductResponse MapToResponse(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            CompanyId = product.CompanyId,
            Name = product.Name,
            Description = product.Description,
            Type = product.Type,
            Price = product.Price,
            CostPrice = product.CostPrice,
            TaxRate = product.TaxRate,
            ImageUrl = product.ImageUrl,
            Unit = product.Unit,
            Discount = product.Discount,
            TrackInventory = product.TrackInventory,
            Stock = product.StockQuantity,
            PriceIncludesTax = product.PriceIncludesTax,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }
}
