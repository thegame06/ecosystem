using System.ComponentModel.DataAnnotations;

namespace SaaS.Application.DTOs.Sales;

public class CreateSaleItemRequest
{
    [Required]
    public string ProductId { get; set; } = string.Empty;
    
    [Range(0.01, double.MaxValue)]
    public decimal Quantity { get; set; }
    
    public decimal? UnitPrice { get; set; }
}

public class CreateSaleRequest
{
    [Required]
    public string CustomerId { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public List<CreateSaleItemRequest> Items { get; set; } = new();

    public string? PaymentMethod { get; set; }
}
