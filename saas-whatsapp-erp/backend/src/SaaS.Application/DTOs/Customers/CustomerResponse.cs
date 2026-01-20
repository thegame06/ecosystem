using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Customers;

public class CustomerResponse
{
    public string Id { get; set; } = string.Empty;
    public string CompanyId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public CommercialState CurrentState { get; set; }
    public string? TaxId { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
}
