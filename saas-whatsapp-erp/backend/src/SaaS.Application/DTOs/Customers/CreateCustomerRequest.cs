using System.ComponentModel.DataAnnotations;

namespace SaaS.Application.DTOs.Customers;

public class CreateCustomerRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    public string? TaxId { get; set; }

    public string? Address { get; set; }
}
