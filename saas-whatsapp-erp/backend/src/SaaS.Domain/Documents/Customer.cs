using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SaaS.Domain.Enums;

namespace SaaS.Domain.Documents;

/// <summary>
/// Cliente - Persona o empresa que compra
/// Multi-tenant: Cada cliente pertenece a una Company
/// </summary>
public class Customer
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// ID de la empresa a la que pertenece este cliente (Multi-tenant)
    /// </summary>
    [BsonElement("companyId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CompanyId { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Teléfono principal (WhatsApp)
    /// </summary>
    [BsonElement("phone")]
    public string Phone { get; set; } = string.Empty;

    /// <summary>
    /// Estado comercial actual del cliente
    /// </summary>
    [BsonElement("currentState")]
    [BsonRepresentation(BsonType.String)]
    public CommercialState CurrentState { get; set; } = CommercialState.LEAD;

    /// <summary>
    /// Datos fiscales opcionales
    /// </summary>
    [BsonElement("taxId")]
    public string? TaxId { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("address")]
    public string? Address { get; set; }

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
