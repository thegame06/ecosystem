using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SaaS.Domain.Enums;

namespace SaaS.Domain.Documents;

/// <summary>
/// Producto - Puede ser tangible, servicio o alquilable
/// Multi-tenant: Cada producto pertenece a una Company
/// </summary>
public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// ID de la empresa a la que pertenece este producto (Multi-tenant)
    /// </summary>
    [BsonElement("companyId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CompanyId { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Tipo de producto: Tangible, Servicio, Alquilable
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(BsonType.String)]
    public ProductType Type { get; set; } = ProductType.Tangible;

    /// <summary>
    /// Precio de venta
    /// </summary>
    [BsonElement("price")]
    public decimal Price { get; set; }

    /// <summary>
    /// Precio de compra (opcional)
    /// </summary>
    [BsonElement("costPrice")]
    public decimal? CostPrice { get; set; }

    /// <summary>
    /// Tasa de impuesto (IVA) específica del producto
    /// Si es null, usa la tasa de la empresa
    /// </summary>
    [BsonElement("taxRate")]
    public decimal? TaxRate { get; set; }

    /// <summary>
    /// Control de inventario (opcional)
    /// </summary>
    [BsonElement("trackInventory")]
    public bool TrackInventory { get; set; } = false;

    [BsonElement("stockQuantity")]
    public decimal StockQuantity { get; set; } = 0;

    /// <summary>
    /// Para productos alquilables
    /// </summary>
    [BsonElement("rentalPricePerDay")]
    public decimal? RentalPricePerDay { get; set; }

    [BsonElement("rentalPricePerHour")]
    public decimal? RentalPricePerHour { get; set; }

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
