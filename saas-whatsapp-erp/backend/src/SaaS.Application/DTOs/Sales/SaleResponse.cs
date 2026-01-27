using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Sales;

public class SaleItemResponse
{
    public string ProductId { get; set; } = string.Empty;
    public string NameSnapshot { get; set; } = string.Empty;
    public string Unit { get; set; } = "Unidad";
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal DiscountedSubtotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
}

public class SaleResponse
{
    public string Id { get; set; } = string.Empty;
    public string CompanyId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal Total { get; set; }
    public CommercialState State { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public bool ApplyTax { get; set; }
    public DiscountType GlobalDiscountType { get; set; }
    public decimal GlobalDiscountValue { get; set; }
    public string Channel { get; set; } = "POS";
    public DateTime CreatedAt { get; set; }
    public List<SaleItemResponse> Items { get; set; } = new();
}
