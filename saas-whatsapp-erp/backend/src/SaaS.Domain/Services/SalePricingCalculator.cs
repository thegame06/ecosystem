using SaaS.Domain.Documents;
using SaaS.Domain.Enums;

namespace SaaS.Domain.Services;

/// <summary>
/// Single Source of Truth para cálculos de pricing
/// NO tiene efectos secundarios, NO persiste, NO sabe de Create/Update
/// </summary>
public class SalePricingCalculator
{
    /// <summary>
    /// Calcula todos los montos de una venta según pricing_calculation_rules.md
    /// </summary>
    public static SaleCalculationResult Calculate(
        List<SaleItemInput> items,
        decimal companyTaxRate,
        bool applyTax,
        DiscountType globalDiscountType = DiscountType.None,
        decimal globalDiscountValue = 0)
    {
        if (items == null || !items.Any())
            throw new ArgumentException("Items cannot be empty");

        var result = new SaleCalculationResult
        {
            Items = new List<SaleItemCalculation>()
        };

        // 1. Calcular subtotales brutos de cada línea
        var tempItems = new List<(SaleItemInput input, decimal rawSubtotal)>();
        foreach (var item in items)
        {
            decimal rawSubtotal = item.Quantity * item.UnitPrice;
            tempItems.Add((item, rawSubtotal));
        }

        decimal totalRawSubtotal = tempItems.Sum(x => x.rawSubtotal);

        // 2. Calcular descuento global total
        decimal totalGlobalDiscountAmount = 0;
        if (globalDiscountType == DiscountType.Percentage)
            totalGlobalDiscountAmount = totalRawSubtotal * (globalDiscountValue / 100);
        else if (globalDiscountType == DiscountType.Fixed)
            totalGlobalDiscountAmount = globalDiscountValue;

        // Limitar descuento para no dejar total negativo
        totalGlobalDiscountAmount = Math.Min(totalGlobalDiscountAmount, totalRawSubtotal);

        // 3. Distribuir descuento proporcionalmente y calcular impuestos por línea
        foreach (var (input, rawSubtotal) in tempItems)
        {
            // Distribución proporcional del descuento global
            decimal lineDiscountShare = totalRawSubtotal > 0
                ? (rawSubtotal / totalRawSubtotal) * totalGlobalDiscountAmount
                : 0;

            decimal subtotalAfterDiscount = rawSubtotal - lineDiscountShare;
            decimal taxRate = input.TaxRate ?? companyTaxRate;

            decimal lineSubtotal;
            decimal lineTaxAmount;

            // REGLA CRÍTICA: PriceIncludesTax
            if (input.PriceIncludesTax)
            {
                // Precio YA incluye IVA - descomponer
                decimal lineTotal = subtotalAfterDiscount;
                lineSubtotal = lineTotal / (1 + taxRate);
                lineTaxAmount = lineTotal - lineSubtotal;
            }
            else
            {
                // Precio NO incluye IVA - cálculo normal
                lineSubtotal = subtotalAfterDiscount;
                lineTaxAmount = 0;

                // Aplicar IVA solo si:
                // 1. La empresa tiene IVA activo (applyTax)
                // 2. El producto es taxable
                if (applyTax && input.IsTaxable)
                {
                    lineTaxAmount = lineSubtotal * taxRate;
                }
            }

            // Redondeo a 2 decimales (pricing_calculation_rules.md línea 70-73)
            result.Items.Add(new SaleItemCalculation
            {
                ProductId = input.ProductId,
                ProductName = input.ProductName,
                Unit = input.Unit,
                Quantity = input.Quantity,
                UnitPrice = input.UnitPrice,
                DiscountType = globalDiscountType,
                DiscountValue = Math.Round(lineDiscountShare, 2),
                DiscountedSubtotal = Math.Round(lineSubtotal, 2),
                TaxRate = taxRate,
                TaxAmount = Math.Round(lineTaxAmount, 2),
                Total = Math.Round(lineSubtotal + lineTaxAmount, 2)
            });
        }

        // 4. Calcular totales de la venta
        result.Subtotal = result.Items.Sum(i => i.DiscountedSubtotal);
        result.TaxTotal = result.Items.Sum(i => i.TaxAmount);
        result.Total = Math.Round(result.Subtotal + result.TaxTotal, 2);

        return result;
    }
}

/// <summary>
/// Input para cálculo de una línea de venta
/// </summary>
public class SaleItemInput
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Unit { get; set; } = "Unidad";
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? TaxRate { get; set; }
    public bool IsTaxable { get; set; } = true;
    public bool PriceIncludesTax { get; set; } = false;
}

/// <summary>
/// Resultado del cálculo de pricing
/// </summary>
public class SaleCalculationResult
{
    public List<SaleItemCalculation> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal Total { get; set; }
}

/// <summary>
/// Cálculo de una línea individual
/// </summary>
public class SaleItemCalculation
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal DiscountedSubtotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
}
