using SaaS.Domain.Enums;
using SaaS.Application.DTOs.Sales;

namespace SaaS.Application.DTOs.Invoices;

public class InvoiceResponse
{
    public string Id { get; set; } = string.Empty;
    public string SaleId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string CompanyId { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public InvoiceStatus Status { get; set; }
    public DateTime? IssuedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal Total { get; set; }
    public List<SaleItemResponse> Items { get; set; } = new();
}
