using System.ComponentModel.DataAnnotations;

namespace SaaS.Application.DTOs.Sales;

public class UpdateSaleRequest
{
    // Normalmente permitir modificar items si aun no esta facturada/finalizada
    public List<CreateSaleItemRequest>? Items { get; set; }
    
    public string? Notes { get; set; }

    public bool? ApplyTax { get; set; }

    public DiscountRequest? GlobalDiscount { get; set; }

    public SaaS.Domain.Enums.PaymentMethod? PaymentMethod { get; set; }
}

public class DiscountRequest
{
    public SaaS.Domain.Enums.DiscountType Type { get; set; }
    public decimal Value { get; set; }
}
