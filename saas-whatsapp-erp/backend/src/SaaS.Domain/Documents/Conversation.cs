using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SaaS.Domain.Enums;

namespace SaaS.Domain.Documents;

/// <summary>
/// Conversación de WhatsApp con un cliente
/// Multi-tenant: Cada conversación pertenece a una Company
/// </summary>
public class Conversation
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
    /// ID del cliente
    /// </summary>
    [BsonElement("customerId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CustomerId { get; set; } = string.Empty;

    /// <summary>
    /// Canal de comunicación (WhatsApp por ahora)
    /// </summary>
    [BsonElement("channel")]
    public string Channel { get; set; } = "WhatsApp";

    /// <summary>
    /// Último mensaje de la conversación
    /// </summary>
    [BsonElement("lastMessage")]
    public string? LastMessage { get; set; }

    /// <summary>
    /// Estado comercial actual en esta conversación
    /// </summary>
    [BsonElement("lastState")]
    [BsonRepresentation(BsonType.String)]
    public CommercialState LastState { get; set; } = CommercialState.LEAD;

    /// <summary>
    /// Número de teléfono del cliente
    /// </summary>
    [BsonElement("customerPhone")]
    public string CustomerPhone { get; set; } = string.Empty;

    /// <summary>
    /// ID de WhatsApp (JID) para identificar la conversación en el provider
    /// </summary>
    [BsonElement("remoteJid")]
    public string? RemoteJid { get; set; }

    /// <summary>
    /// Indica si hay mensajes sin leer
    /// </summary>
    [BsonElement("hasUnreadMessages")]
    public bool HasUnreadMessages { get; set; } = false;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("lastActivityAt")]
    public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;
}
