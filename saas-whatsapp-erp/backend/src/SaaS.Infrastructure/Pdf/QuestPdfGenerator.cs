using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;

namespace SaaS.Infrastructure.Pdf;

/// <summary>
/// QuestPDF implementation of invoice PDF generator
/// Follows pricing_calculation_rules.md - NO recalculation allowed
/// </summary>
public class QuestPdfGenerator : IPdfGenerator
{
    public QuestPdfGenerator()
    {
        // QuestPDF License - Community License for development
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateInvoicePdf(Invoice invoice, Company company, Customer customer)
    {
        try
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.Letter);
                    page.Margin(40);
                    // Standard safety: Use a basic font
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header().Element(c => ComposeHeader(c, invoice, company));
                    page.Content().Element(c => ComposeContent(c, invoice, company, customer));
                    page.Footer().Element(ComposeFooter);
                });
            });

            return document.GeneratePdf();
        }
        catch (Exception ex)
        {
            // In a real environment, we would log this to a proper logger
            Console.WriteLine($"FATAL ERROR in PDF Generation: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            throw;
        }
    }

    private void ComposeHeader(IContainer container, Invoice invoice, Company company)
    {
        container.Column(column =>
        {
            column.Item().Row(row =>
            {
                // Company info
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text(company.Name)
                        .FontSize(16)
                        .Bold()
                        .FontColor(Colors.Blue.Darken2);

                    col.Item().Text($"País: {company.Country}");
                });

                // Invoice number and date
                row.RelativeItem().AlignRight().Column(col =>
                {
                    col.Item().Text("FACTURA")
                        .FontSize(18)
                        .Bold()
                        .FontColor(Colors.Blue.Darken2);

                    col.Item().Text($"No. {invoice.Number}")
                        .FontSize(14)
                        .Bold();

                    col.Item().Text($"Fecha: {invoice.CreatedAt:dd/MM/yyyy}");

                    col.Item().Text($"Estado: {TranslateStatus(invoice.Status)}")
                        .FontColor(GetStatusColor(invoice.Status));
                });
            });

            column.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
        });
    }

    private void ComposeContent(IContainer container, Invoice invoice, Company company, Customer customer)
    {
        container.Column(column =>
        {
            // Customer info
            column.Item().PaddingBottom(15).Column(col =>
            {
                col.Item().Text("CLIENTE").FontSize(12).Bold();
                col.Item().Text(customer.Name).FontSize(11);

                if (!string.IsNullOrEmpty(customer.Phone))
                {
                    col.Item().Text($"Tel: {customer.Phone}");
                }

                if (!string.IsNullOrEmpty(customer.TaxId))
                {
                    col.Item().Text($"RUC: {customer.TaxId}");
                }
            });

            // Items table
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3); // Product
                    columns.RelativeColumn(1); // Quantity
                    columns.RelativeColumn(1); // Unit
                    columns.RelativeColumn(1.5f); // Price
                    columns.RelativeColumn(1.5f); // Discount
                    columns.RelativeColumn(1.5f); // Subtotal
                    columns.RelativeColumn(1.5f); // Tax
                    columns.RelativeColumn(2); // Total
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Producto").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Cant.").Bold();
                    header.Cell().Element(CellStyle).Text("Unidad").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Precio").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Desc.").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Subtotal").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("IVA").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Total").Bold();
                });

                // Items - NO RECALCULATION (critical rule)
                foreach (var item in invoice.Items)
                {
                    table.Cell().Element(CellStyle).Text(item.NameSnapshot);
                    table.Cell().Element(CellStyle).AlignRight().Text(item.Quantity.ToString("N2"));
                    table.Cell().Element(CellStyle).Text(item.Unit);
                    table.Cell().Element(CellStyle).AlignRight().Text(FormatCurrency(item.UnitPrice, company.CurrencySymbol));
                    table.Cell().Element(CellStyle).AlignRight().Text(FormatDiscount(item));
                    table.Cell().Element(CellStyle).AlignRight().Text(FormatCurrency(item.DiscountedSubtotal, company.CurrencySymbol));
                    table.Cell().Element(CellStyle).AlignRight().Text(FormatCurrency(item.TaxAmount, company.CurrencySymbol));
                    table.Cell().Element(CellStyle).AlignRight().Text(FormatCurrency(item.Total, company.CurrencySymbol)).Bold();
                }
            });

            // Totals section
            column.Item().PaddingTop(15).AlignRight().Column(col =>
            {
                col.Item().Row(row =>
                {
                    row.AutoItem().Width(150).Text("Subtotal:");
                    row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(invoice.Subtotal, company.CurrencySymbol));
                });

                col.Item().Row(row =>
                {
                    row.AutoItem().Width(150).Text($"IVA ({company.TaxRate * 100:N0}%):");
                    row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(invoice.TaxAmount, company.CurrencySymbol));
                });

                col.Item().PaddingTop(5).LineHorizontal(1);

                col.Item().PaddingTop(5).Row(row =>
                {
                    row.AutoItem().Width(150).Text("TOTAL:").FontSize(12).Bold();
                    row.AutoItem().Width(100).AlignRight().Text(FormatCurrency(invoice.Total, company.CurrencySymbol))
                        .FontSize(12).Bold().FontColor(Colors.Blue.Darken2);
                });
            });

            // Payment info
            if (invoice.Status == Domain.Enums.InvoiceStatus.Paid && invoice.PaidAt.HasValue)
            {
                column.Item().PaddingTop(20).Column(col =>
                {
                    col.Item().Text("INFORMACIÓN DE PAGO").FontSize(11).Bold();
                    col.Item().Text($"Fecha de pago: {invoice.PaidAt.Value:dd/MM/yyyy HH:mm}");
                });
            }
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Column(column =>
        {
            column.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
            column.Item().PaddingTop(5).Text("Documento generado electrónicamente")
                .FontSize(8)
                .FontColor(Colors.Grey.Medium);
        });
    }

    private IContainer CellStyle(IContainer container)
    {
        return container
            .Border(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Padding(5);
    }

    private string FormatCurrency(decimal amount, string symbol)
    {
        return $"{symbol} {amount:N2}";
    }

    private string FormatDiscount(SaleItem item)
    {
        return item.DiscountType switch
        {
            Domain.Enums.DiscountType.None => "-",
            Domain.Enums.DiscountType.Fixed => $"{item.DiscountValue:N2}",
            Domain.Enums.DiscountType.Percentage => $"{item.DiscountValue:N0}%",
            _ => "-"
        };
    }

    private string TranslateStatus(Domain.Enums.InvoiceStatus status)
    {
        return status switch
        {
            Domain.Enums.InvoiceStatus.Draft => "Borrador",
            Domain.Enums.InvoiceStatus.Issued => "Emitida",
            Domain.Enums.InvoiceStatus.Sent => "Enviada",
            Domain.Enums.InvoiceStatus.Paid => "Pagada",
            Domain.Enums.InvoiceStatus.Cancelled => "Cancelada",
            _ => status.ToString()
        };
    }

    private string GetStatusColor(Domain.Enums.InvoiceStatus status)
    {
        return status switch
        {
            Domain.Enums.InvoiceStatus.Draft => Colors.Grey.Medium,
            Domain.Enums.InvoiceStatus.Issued => Colors.Blue.Medium,
            Domain.Enums.InvoiceStatus.Sent => Colors.Orange.Medium,
            Domain.Enums.InvoiceStatus.Paid => Colors.Green.Medium,
            Domain.Enums.InvoiceStatus.Cancelled => Colors.Red.Medium,
            _ => Colors.Grey.Medium
        };
    }
}
