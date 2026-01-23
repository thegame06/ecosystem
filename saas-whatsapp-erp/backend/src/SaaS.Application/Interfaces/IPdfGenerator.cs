namespace SaaS.Application.Interfaces;

/// <summary>
/// Contract for PDF generation services
/// </summary>
public interface IPdfGenerator
{
    /// <summary>
    /// Generates an invoice PDF document
    /// </summary>
    /// <param name="invoice">Invoice to generate PDF for</param>
    /// <param name="company">Company information</param>
    /// <param name="customer">Customer information</param>
    /// <returns>PDF document as byte array</returns>
    byte[] GenerateInvoicePdf(
        Domain.Documents.Invoice invoice,
        Domain.Documents.Company company,
        Domain.Documents.Customer customer);
}
