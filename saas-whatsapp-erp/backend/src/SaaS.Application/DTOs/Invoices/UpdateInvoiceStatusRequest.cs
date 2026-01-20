using System.ComponentModel.DataAnnotations;
using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Invoices;

public class UpdateInvoiceStatusRequest
{
    [Required]
    public InvoiceStatus Status { get; set; }
}
