using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Products;

public class CreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProductType Type { get; set; } = ProductType.Tangible;
    public decimal Price { get; set; }
    public decimal? CostPrice { get; set; }
    public decimal? TaxRate { get; set; }
    public string? ImageUrl { get; set; }
    public string? Unit { get; set; }
    public decimal? Discount { get; set; }
    public bool TrackInventory { get; set; } = false;
    public decimal Stock { get; set; } = 0;
    public decimal? RentalPricePerDay { get; set; }
    public decimal? RentalPricePerHour { get; set; }
}

public class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProductType Type { get; set; }
    public decimal Price { get; set; }
    public decimal? CostPrice { get; set; }
    public decimal? TaxRate { get; set; }
    public string? ImageUrl { get; set; }
    public string? Unit { get; set; }
    public decimal? Discount { get; set; }
    public bool TrackInventory { get; set; }
    public decimal Stock { get; set; }
    public decimal? RentalPricePerDay { get; set; }
    public decimal? RentalPricePerHour { get; set; }
    public bool IsActive { get; set; }
}

public class ProductResponse
{
    public string Id { get; set; } = string.Empty;
    public string CompanyId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProductType Type { get; set; }
    public decimal Price { get; set; }
    public decimal? CostPrice { get; set; }
    public decimal? TaxRate { get; set; }
    public string? ImageUrl { get; set; }
    public string? Unit { get; set; }
    public decimal? Discount { get; set; }
    public bool TrackInventory { get; set; }
    public decimal Stock { get; set; }
    public decimal? RentalPricePerDay { get; set; }
    public decimal? RentalPricePerHour { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
