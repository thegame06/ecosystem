using Xunit;
using SaaS.Domain.Services;
using SaaS.Domain.Enums;

namespace SaaS.Tests.Domain.Services;

/// <summary>
/// Tests del SalePricingCalculator según pricing_calculation_rules.md
/// </summary>
public class SalePricingCalculatorTests
{
    private const decimal COMPANY_TAX_RATE = 0.15m; // 15% IVA Nicaragua

    [Fact]
    public void Calculate_PrecioSinIVA_ApplyTax_True_DebeAgregarIVA()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Producto A",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            }
        };

        // Act
        var result = SalePricingCalculator.Calculate(items, COMPANY_TAX_RATE, applyTax: true);

        // Assert
        Assert.Equal(100m, result.Subtotal);
        Assert.Equal(15m, result.TaxTotal);
        Assert.Equal(115m, result.Total);
    }

    [Fact]
    public void Calculate_PrecioConIVA_DebeDescomponerCorrectamente()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Producto B",
                Quantity = 1,
                UnitPrice = 115m, // Precio final con IVA incluido
                IsTaxable = true,
                PriceIncludesTax = true
            }
        };

        // Act
        var result = SalePricingCalculator.Calculate(items, COMPANY_TAX_RATE, applyTax: true);

        // Assert
        Assert.Equal(100m, result.Subtotal);
        Assert.Equal(15m, result.TaxTotal);
        Assert.Equal(115m, result.Total);
    }

    [Fact]
    public void Calculate_IVADesactivado_NoDebeCalcularIVA()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Producto C",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            }
        };

        // Act
        var result = SalePricingCalculator.Calculate(items, COMPANY_TAX_RATE, applyTax: false);

        // Assert
        Assert.Equal(100m, result.Subtotal);
        Assert.Equal(0m, result.TaxTotal);
        Assert.Equal(100m, result.Total);
    }

    [Fact]
    public void Calculate_ProductoNoTaxable_NoDebeCalcularIVA()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Producto Exento",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = false,
                PriceIncludesTax = false
            }
        };

        // Act
        var result = SalePricingCalculator.Calculate(items, COMPANY_TAX_RATE, applyTax: true);

        // Assert
        Assert.Equal(100m, result.Subtotal);
        Assert.Equal(0m, result.TaxTotal);
        Assert.Equal(100m, result.Total);
    }

    [Fact]
    public void Calculate_DescuentoPorcentaje_DebeAplicarAntesDeIVA()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Producto D",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            }
        };

        // Act - 10% de descuento
        var result = SalePricingCalculator.Calculate(
            items,
            COMPANY_TAX_RATE,
            applyTax: true,
            globalDiscountType: DiscountType.Percentage,
            globalDiscountValue: 10m
        );

        // Assert
        // Subtotal: 100 - 10% = 90
        // IVA: 90 * 15% = 13.50
        // Total: 90 + 13.50 = 103.50
        Assert.Equal(90m, result.Subtotal);
        Assert.Equal(13.50m, result.TaxTotal);
        Assert.Equal(103.50m, result.Total);
    }

    [Fact]
    public void Calculate_DescuentoFijo_DebeAplicarAntesDeIVA()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Producto E",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            }
        };

        // Act - $10 de descuento fijo
        var result = SalePricingCalculator.Calculate(
            items,
            COMPANY_TAX_RATE,
            applyTax: true,
            globalDiscountType: DiscountType.Fixed,
            globalDiscountValue: 10m
        );

        // Assert
        // Subtotal: 100 - 10 = 90
        // IVA: 90 * 15% = 13.50
        // Total: 90 + 13.50 = 103.50
        Assert.Equal(90m, result.Subtotal);
        Assert.Equal(13.50m, result.TaxTotal);
        Assert.Equal(103.50m, result.Total);
    }

    [Fact]
    public void Calculate_DescuentoProporcional_VariasLineas()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Producto A",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            },
            new SaleItemInput
            {
                ProductId = "2",
                ProductName = "Producto B",
                Quantity = 1,
                UnitPrice = 50m,
                IsTaxable = true,
                PriceIncludesTax = false
            }
        };

        // Act - $15 de descuento fijo sobre $150 total
        var result = SalePricingCalculator.Calculate(
            items,
            COMPANY_TAX_RATE,
            applyTax: true,
            globalDiscountType: DiscountType.Fixed,
            globalDiscountValue: 15m
        );

        // Assert
        // Producto A: 100/150 * 15 = 10 de descuento → 90
        // Producto B: 50/150 * 15 = 5 de descuento → 45
        // Subtotal: 135
        // IVA: 135 * 15% = 20.25
        // Total: 155.25
        Assert.Equal(135m, result.Subtotal);
        Assert.Equal(20.25m, result.TaxTotal);
        Assert.Equal(155.25m, result.Total);
    }

    [Fact]
    public void Calculate_PrecioConIVA_MasDescuento_DebeDescomponerCorrectamente()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Producto F",
                Quantity = 1,
                UnitPrice = 115m, // Precio con IVA incluido
                IsTaxable = true,
                PriceIncludesTax = true
            }
        };

        // Act - 10% de descuento
        var result = SalePricingCalculator.Calculate(
            items,
            COMPANY_TAX_RATE,
            applyTax: true,
            globalDiscountType: DiscountType.Percentage,
            globalDiscountValue: 10m
        );

        // Assert
        // Precio con descuento: 115 - 10% = 103.50
        // Descomposición: 103.50 / 1.15 = 90
        // IVA: 103.50 - 90 = 13.50
        Assert.Equal(90m, result.Subtotal);
        Assert.Equal(13.50m, result.TaxTotal);
        Assert.Equal(103.50m, result.Total);
    }

    [Fact]
    public void Calculate_Redondeo_DebeSerA2Decimales()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Producto G",
                Quantity = 3,
                UnitPrice = 33.33m, // Genera decimales largos
                IsTaxable = true,
                PriceIncludesTax = false
            }
        };

        // Act
        var result = SalePricingCalculator.Calculate(items, COMPANY_TAX_RATE, applyTax: true);

        // Assert - Todos los valores deben tener máximo 2 decimales
        Assert.Equal(2, BitConverter.GetBytes(decimal.GetBits(result.Subtotal)[3])[2]);
        Assert.Equal(2, BitConverter.GetBytes(decimal.GetBits(result.TaxTotal)[3])[2]);
        Assert.Equal(2, BitConverter.GetBytes(decimal.GetBits(result.Total)[3])[2]);

        // Validar que el total es correcto
        Assert.Equal(99.99m, result.Subtotal);
        Assert.Equal(15.00m, result.TaxTotal);
        Assert.Equal(114.99m, result.Total);
    }

    [Fact]
    public void Calculate_DescuentoMayorQueSubtotal_DebeLimitarseAlSubtotal()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Producto H",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            }
        };

        // Act - Descuento de $200 sobre $100
        var result = SalePricingCalculator.Calculate(
            items,
            COMPANY_TAX_RATE,
            applyTax: true,
            globalDiscountType: DiscountType.Fixed,
            globalDiscountValue: 200m
        );

        // Assert - El descuento se limita a $100
        Assert.Equal(0m, result.Subtotal);
        Assert.Equal(0m, result.TaxTotal);
        Assert.Equal(0m, result.Total);
    }

    [Fact]
    public void Calculate_ProductOverridesCompanyTaxRate_DebeUsarTasaDelProducto()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Especial",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                TaxRate = 0.10m, // Override: 10% instead of 15%
                PriceIncludesTax = false
            }
        };

        // Act
        var result = SalePricingCalculator.Calculate(items, COMPANY_TAX_RATE, applyTax: true);

        // Assert
        Assert.Equal(100m, result.Subtotal);
        Assert.Equal(10m, result.TaxTotal);
        Assert.Equal(110m, result.Total);
    }

    [Fact]
    public void Calculate_POSApplyTaxFalse_OverridesEverything_NoIVA()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Normal",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            }
        };

        // Act - POS turns off tax
        var result = SalePricingCalculator.Calculate(items, COMPANY_TAX_RATE, applyTax: false);

        // Assert
        Assert.Equal(100m, result.Subtotal);
        Assert.Equal(0m, result.TaxTotal);
        Assert.Equal(100m, result.Total);
    }

    [Fact]
    public void Calculate_MixedTaxableAndExempt_SoloCalculaIVAEnTaxable()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Taxable",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            },
            new SaleItemInput
            {
                ProductId = "2",
                ProductName = "Exempt",
                Quantity = 1,
                UnitPrice = 50m,
                IsTaxable = false,
                PriceIncludesTax = false
            }
        };

        // Act
        var result = SalePricingCalculator.Calculate(items, COMPANY_TAX_RATE, applyTax: true);

        // Assert
        // Item 1: 100 + 15 = 115
        // Item 2: 50 + 0 = 50
        // Totals: Sub=150, Tax=15, Total=165
        Assert.Equal(150m, result.Subtotal);
        Assert.Equal(15m, result.TaxTotal);
        Assert.Equal(165m, result.Total);
    }

    [Fact]
    public void Calculate_MixedTaxableExempt_ConDescuentoGlobal_CalculaIVAProporcional()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Taxable",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            },
            new SaleItemInput
            {
                ProductId = "2",
                ProductName = "Exempt",
                Quantity = 1,
                UnitPrice = 50m,
                IsTaxable = false,
                PriceIncludesTax = false
            }
        };

        // Act - $30 descuento global sobre $150 (20% de descuento)
        var result = SalePricingCalculator.Calculate(
            items,
            COMPANY_TAX_RATE,
            applyTax: true,
            globalDiscountType: DiscountType.Fixed,
            globalDiscountValue: 30m
        );

        // Assert
        // Taxable: 100/150 * 30 = 20 desc -> 80 subtotal. IVA = 80 * 15% = 12.
        // Exempt: 50/150 * 30 = 10 desc -> 40 subtotal. IVA = 0.
        // Subtotal = 80 + 40 = 120
        // TaxTotal = 12
        // Total = 132
        Assert.Equal(120m, result.Subtotal);
        Assert.Equal(12m, result.TaxTotal);
        Assert.Equal(132m, result.Total);
    }

    [Fact]
    public void Calculate_MixedInclusiveAndExclusive_CalculaCorrectamente()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Inclusive ($115 final)",
                Quantity = 1,
                UnitPrice = 115m,
                IsTaxable = true,
                PriceIncludesTax = true
            },
            new SaleItemInput
            {
                ProductId = "2",
                ProductName = "Exclusive ($100 + IVA)",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            }
        };

        // Act
        var result = SalePricingCalculator.Calculate(items, COMPANY_TAX_RATE, applyTax: true);

        // Assert
        // Item 1: Sub=100, Tax=15, Total=115
        // Item 2: Sub=100, Tax=15, Total=115
        // Totals: Sub=200, Tax=30, Total=230
        Assert.Equal(200m, result.Subtotal);
        Assert.Equal(30m, result.TaxTotal);
        Assert.Equal(230m, result.Total);
    }

    [Fact]
    public void Calculate_FullMixedScenario_ProportionalDiscountsAndMixedTaxTypes()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput // $100 Taxable Exclusive
            {
                ProductId = "1",
                ProductName = "Exclusive Taxable",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                PriceIncludesTax = false
            },
            new SaleItemInput // $115 Taxable Inclusive
            {
                ProductId = "2",
                ProductName = "Inclusive Taxable",
                Quantity = 1,
                UnitPrice = 115m,
                IsTaxable = true,
                PriceIncludesTax = true
            },
            new SaleItemInput // $50 Exempt
            {
                ProductId = "3",
                ProductName = "Exempt",
                Quantity = 1,
                UnitPrice = 50m,
                IsTaxable = false,
                PriceIncludesTax = false
            }
        };

        // Total Raw Subtotal: 100 + 115 + 50 = 265
        // Apply 20% Global Discount: 265 * 0.2 = $53

        // Act
        var result = SalePricingCalculator.Calculate(
            items,
            COMPANY_TAX_RATE,
            applyTax: true,
            globalDiscountType: DiscountType.Percentage,
            globalDiscountValue: 20m
        );

        // Assert
        // Distribution of $53 discount:
        // Item 1: 100/265 * 52 = 20 desc -> 80 subtotal. IVA (0.15) = 12. Total = 92
        // Item 2: 115/265 * 53 = 23 desc -> 92 total. Decomposition: Sub = 92/1.15 = 80. IVA = 12.
        // Item 3: 50/265 * 53 = 10 desc -> 40 subtotal. IVA = 0. Total = 40.

        // Global Totals:
        // Subtotal = 80 (I1) + 80 (I2) + 40 (I3) = 200
        // TaxTotal = 12 (I1) + 12 (I2) + 0 (I3) = 24
        // Total = 224

        Assert.Equal(200m, result.Subtotal);
        Assert.Equal(24m, result.TaxTotal);
        Assert.Equal(224m, result.Total);
    }

    [Fact]
    public void Calculate_PerItemDiscount_And_GlobalDiscount_DebeAplicarAmbos()
    {
        // Arrange
        var items = new List<SaleItemInput>
        {
            new SaleItemInput
            {
                ProductId = "1",
                ProductName = "Articulo con Descuento",
                Quantity = 1,
                UnitPrice = 100m,
                IsTaxable = true,
                DiscountType = DiscountType.Fixed,
                DiscountValue = 10m, // $10 de descuento lineal
                PriceIncludesTax = false
            }
        };

        // Act - $10 de descuento global sobre el remanente ($90)
        var result = SalePricingCalculator.Calculate(
            items,
            COMPANY_TAX_RATE,
            applyTax: true,
            globalDiscountType: DiscountType.Fixed,
            globalDiscountValue: 10m
        );

        // Assert
        // Raw: 100
        // After line discount: 100 - 10 = 90
        // After global discount: 90 - 10 = 80
        // IVA: 80 * 0.15 = 12
        // Total: 80 + 12 = 92
        Assert.Equal(80m, result.Subtotal);
        Assert.Equal(12m, result.TaxTotal);
        Assert.Equal(92m, result.Total);
        Assert.Equal(20m, result.Items[0].DiscountValue); // 10 lineal + 10 global
    }

    [Fact]
    public void Calculate_ItemsVacios_DebeLanzarExcepcion()
    {
        // Arrange
        var items = new List<SaleItemInput>();

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            SalePricingCalculator.Calculate(items, COMPANY_TAX_RATE, applyTax: true)
        );
    }
}
