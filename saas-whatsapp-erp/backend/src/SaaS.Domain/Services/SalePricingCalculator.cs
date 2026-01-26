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

        // 1. Calcular subtotales de cada línea con su descuento individual
        var intermediateLines = new List<(SaleItemInput input, decimal rawSubtotal, decimal afterLineDiscount, decimal lineDiscountAmount)>();
        foreach (var item in items)
        {
            decimal rawSubtotal = item.Quantity * item.UnitPrice;
            decimal lineDiscountAmount = 0;

            if (item.DiscountType == DiscountType.Percentage)
                lineDiscountAmount = rawSubtotal * (item.DiscountValue / 100);
            else if (item.DiscountType == DiscountType.Fixed)
                lineDiscountAmount = item.DiscountValue;

            lineDiscountAmount = Math.Min(lineDiscountAmount, rawSubtotal);
            decimal afterLineDiscount = rawSubtotal - lineDiscountAmount;

            intermediateLines.Add((item, rawSubtotal, afterLineDiscount, lineDiscountAmount));
        }

        decimal totalAfterLineDiscounts = intermediateLines.Sum(x => x.afterLineDiscount);

        // 2. Calcular descuento global total (aplicado sobre el total después de descuentos por línea)
        decimal totalGlobalDiscountAmount = 0;
        if (globalDiscountType == DiscountType.Percentage)
            totalGlobalDiscountAmount = totalAfterLineDiscounts * (globalDiscountValue / 100);
        else if (globalDiscountType == DiscountType.Fixed)
            totalGlobalDiscountAmount = globalDiscountValue;

        totalGlobalDiscountAmount = Math.Min(totalGlobalDiscountAmount, totalAfterLineDiscounts);

        // 3. Distribuir descuento global y calcular impuestos por línea
        foreach (var (input, rawSubtotal, afterLineDiscount, lineDiscountAmount) in intermediateLines)
        {
            // Distribución proporcional del descuento global
            decimal globalDiscountShare = totalAfterLineDiscounts > 0
                ? (afterLineDiscount / totalAfterLineDiscounts) * totalGlobalDiscountAmount
                : 0;

            decimal baseForTax = afterLineDiscount - globalDiscountShare;
            decimal taxRate = input.TaxRate ?? companyTaxRate;

            decimal lineSubtotal;
            decimal lineTaxAmount;

            // REGLA CRÍTICA: PriceIncludesTax (Debe descomponerse del valor final que el cliente paga)
            if (input.PriceIncludesTax)
            {
                // El total de línea ya incluye IVA. 
                // Asumimos que el descuento se aplica al total con IVA y luego se descompone.
                decimal lineTotal = baseForTax;
                lineSubtotal = lineTotal / (1 + taxRate);
                lineTaxAmount = lineTotal - lineSubtotal;
            }
            else
            {
                // Precio NO incluye IVA - se calcula sobre el subtotal descontado
                lineSubtotal = baseForTax;
                lineTaxAmount = 0;

                if (applyTax && input.IsTaxable)
                {
                    lineTaxAmount = lineSubtotal * taxRate;
                }
            }

            // Redondeo a 2 decimales
            result.Items.Add(new SaleItemCalculation
            {
                ProductId = input.ProductId,
                ProductName = input.ProductName,
                Unit = input.Unit,
                Quantity = input.Quantity,
                UnitPrice = input.UnitPrice,
                // Nota: Guardamos el descuento total (línea + global) para simplificar en Invoice
                DiscountType = globalDiscountType,
                DiscountValue = Math.Round(lineDiscountAmount + globalDiscountShare, 2),
                DiscountedSubtotal = Math.Round(lineSubtotal, 2),
                TaxRate = taxRate,
                TaxAmount = Math.Round(lineTaxAmount, 2),
                Total = Math.Round(lineSubtotal + lineTaxAmount, 2)
            });
        }

        // 4. Calcular totales de la venta
        result.Subtotal = Math.Round(result.Items.Sum(i => i.DiscountedSubtotal), 2);
        result.TaxTotal = Math.Round(result.Items.Sum(i => i.TaxAmount), 2);
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
    public DiscountType DiscountType { get; set; } = DiscountType.None;
    public decimal DiscountValue { get; set; }
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
