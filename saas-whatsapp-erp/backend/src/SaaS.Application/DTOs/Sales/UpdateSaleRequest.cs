using System.ComponentModel.DataAnnotations;

namespace SaaS.Application.DTOs.Sales;

public class UpdateSaleRequest
{
    // Normalmente permitir modificar items si aun no esta facturada/finalizada
    public List<CreateSaleItemRequest>? Items { get; set; }
    
    // O tal vez notas, fecha, etc.
    public string? Notes { get; set; }
}
