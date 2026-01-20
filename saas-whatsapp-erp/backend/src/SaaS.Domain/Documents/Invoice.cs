using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SaaS.Domain.Enums;

namespace SaaS.Domain.Documents;

/// <summary>
/// Factura - Documento fiscal generado desde una venta
/// Multi-tenant: Cada factura pertenece a una Company
/// </summary>
public class Invoice
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
    /// ID de la venta asociada
    /// </summary>
    [BsonElement("saleId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string SaleId { get; set; } = string.Empty;

    /// <summary>
    /// ID del cliente
    /// </summary>
    [BsonElement("customerId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CustomerId { get; set; } = string.Empty;

    /// <summary>
    /// Número de factura secuencial
    /// </summary>
    [BsonElement("number")]
    public string Number { get; set; } = string.Empty;

    /// <summary>
    /// Items de la factura (copiados desde la venta)
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
    /// Estado de la factura
    /// </summary>
    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

    /// <summary>
    /// Fecha de emisión
    /// </summary>
    [BsonElement("issuedAt")]
    public DateTime? IssuedAt { get; set; }

    /// <summary>
    /// Fecha de envío al cliente
    /// </summary>
    [BsonElement("sentAt")]
    public DateTime? SentAt { get; set; }

    /// <summary>
    /// Fecha de pago
    /// </summary>
    [BsonElement("paidAt")]
    public DateTime? PaidAt { get; set; }

    /// <summary>
    /// Fecha de vencimiento
    /// </summary>
    [BsonElement("dueDate")]
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Método de pago
    /// </summary>
    [BsonElement("paymentMethod")]
    public string? PaymentMethod { get; set; }

    [BsonElement("notes")]
    public string? Notes { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
