using System.ComponentModel.DataAnnotations;
using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Customers;

public class UpdateCustomerRequest
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
    
    // Opcionalmente se puede permitir actualizar el estado manualmente
    // pero normalmente es resultado de operaciones. Lo dejo por si acaso.
    public CommercialState? CurrentState { get; set; }
}
