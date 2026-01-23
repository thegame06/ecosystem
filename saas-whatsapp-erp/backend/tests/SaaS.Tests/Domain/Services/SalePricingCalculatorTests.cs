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
