using System.ComponentModel.DataAnnotations;
using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Sales;

public class CreateSaleItemRequest
{
    [Required]
    public string ProductId { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Quantity { get; set; }

    public decimal? UnitPrice { get; set; }

    public DiscountType DiscountType { get; set; } = DiscountType.None;
    public decimal DiscountValue { get; set; }
}

public class CreateSaleRequest
{
    [Required]
    public string CustomerId { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public List<CreateSaleItemRequest> Items { get; set; } = new();

    /// <summary>
    /// Payment method for this sale
    /// </summary>
    [Required(ErrorMessage = "Payment method is required")]
    public PaymentMethod PaymentMethod { get; set; }

    public bool ApplyTax { get; set; } = true;

    public DiscountRequest? GlobalDiscount { get; set; }

    public string Channel { get; set; } = "POS";
}
