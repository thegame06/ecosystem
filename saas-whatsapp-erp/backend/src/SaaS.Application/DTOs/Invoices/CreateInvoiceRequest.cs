using System.ComponentModel.DataAnnotations;

namespace SaaS.Application.DTOs.Invoices;

public class CreateInvoiceRequest
{
    [Required]
    public string SaleId { get; set; } = string.Empty;
}
