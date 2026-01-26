using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Sales;

public class CalculateSaleRequest
{
    public List<CalculateSaleItemRequest> Items { get; set; } = new();
    public bool ApplyTax { get; set; } = true;
    public DiscountRequest? GlobalDiscount { get; set; }
}

public class CalculateSaleItemRequest
{
    public string ProductId { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public DiscountType DiscountType { get; set; } = DiscountType.None;
    public decimal DiscountValue { get; set; }
}

public class SaleCalculationResponse
{
    public List<SaleItemCalculationResponse> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal Total { get; set; }
    public decimal DiscountTotal { get; set; }
}

public class SaleItemCalculationResponse
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
}
