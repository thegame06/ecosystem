using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SaaS.Domain.Enums;

namespace SaaS.Domain.Documents;

public class ConversationMessage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("companyId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CompanyId { get; set; } = string.Empty;

    [BsonElement("conversationId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string ConversationId { get; set; } = string.Empty;

    [BsonElement("customerId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CustomerId { get; set; } = string.Empty;

    [BsonElement("externalId")]
    public string ExternalId { get; set; } = string.Empty; // ID from WhatsApp (id)

    [BsonElement("remoteJid")]
    public string RemoteJid { get; set; } = string.Empty; // Sender/Recipient JID
    
    // Sender Information
    [BsonElement("fromMe")]
    public bool FromMe { get; set; }

    [BsonElement("senderName")]
    public string SenderName { get; set; } = string.Empty; // PushName or System
    
    // Content
    [BsonElement("content")]
    public string Content { get; set; } = string.Empty;

    [BsonElement("type")]
    [BsonRepresentation(BsonType.String)]
    public MessageType Type { get; set; } = MessageType.TEXT;

    [BsonElement("mediaUrl")]
    public string? MediaUrl { get; set; }

    [BsonElement("mediaMimeType")]
    public string? MediaMimeType { get; set; }

    [BsonElement("caption")]
    public string? Caption { get; set; }

    // Status
    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public MessageStatus Status { get; set; } = MessageStatus.SENT;

    [BsonElement("messageTimestamp")]
    public DateTime MessageTimestamp { get; set; } // Timeline from WhatsApp

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Bidirectional Traceability
    [BsonElement("relatedDocuments")]
    public List<string> RelatedDocuments { get; set; } = new(); // ["Invoice:123", "Sale:456"]
}
