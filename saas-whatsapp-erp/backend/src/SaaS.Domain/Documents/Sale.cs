using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SaaS.Domain.Enums;

namespace SaaS.Domain.Documents;

/// <summary>
/// Item de una venta
/// </summary>
public class SaleItem
{
    [BsonElement("productId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string ProductId { get; set; } = string.Empty;

    [BsonElement("productName")]
    public string ProductName { get; set; } = string.Empty;

    [BsonElement("quantity")]
    public decimal Quantity { get; set; }

    [BsonElement("unitPrice")]
    public decimal UnitPrice { get; set; }

    [BsonElement("taxRate")]
    public decimal TaxRate { get; set; }

    [BsonElement("subtotal")]
    public decimal Subtotal { get; set; }

    [BsonElement("taxAmount")]
    public decimal TaxAmount { get; set; }

    [BsonElement("total")]
    public decimal Total { get; set; }
}

/// <summary>
/// Venta - Orden de venta creada desde WhatsApp o POS
/// Multi-tenant: Cada venta pertenece a una Company
/// </summary>
public class Sale
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// ID de la empresa (Multi-tenant)
    /// </summary>
    [BsonElement("companyId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CompanyId { get; set; } = string.Empty;

    /// <summary>
    /// Número de orden
    /// </summary>
    [BsonElement("number")]
    public string Number { get; set; } = string.Empty;

    /// <summary>
    /// Fecha de la venta
    /// </summary>
    [BsonElement("date")]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// ID del cliente
    /// </summary>
    [BsonElement("customerId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CustomerId { get; set; } = string.Empty;

    /// <summary>
    /// ID del usuario que creó la venta
    /// </summary>
    [BsonElement("createdByUserId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CreatedByUserId { get; set; } = string.Empty;

    /// <summary>
    /// Items de la venta
    /// </summary>
    [BsonElement("items")]
    public List<SaleItem> Items { get; set; } = new();

    [BsonElement("subtotal")]
    public decimal Subtotal { get; set; }

    [BsonElement("taxAmount")]
    public decimal TaxAmount { get; set; }

    [BsonElement("total")]
    public decimal Total { get; set; }

    /// <summary>
    /// Estado comercial de la venta
    /// </summary>
    [BsonElement("state")]
    [BsonRepresentation(BsonType.String)]
    public CommercialState State { get; set; } = CommercialState.SALE_CREATED;

    [BsonElement("paymentMethod")]
    public string? PaymentMethod { get; set; }

    [BsonElement("notes")]
    public string? Notes { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
