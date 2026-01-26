using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Conversations;

public class ConversationMessageResponse
{
    public string Id { get; set; } = string.Empty;
    public string ConversationId { get; set; } = string.Empty;
    public bool FromMe { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public MessageType Type { get; set; }
    public string? MediaUrl { get; set; }
    public MessageStatus Status { get; set; }
    public DateTime MessageTimestamp { get; set; }
}

public class CreateMessageRequest
{
    public string ConversationId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string? ExternalId { get; set; }
    public string? RemoteJid { get; set; }
    public string? PushName { get; set; }
    public string? CustomerPhone { get; set; }
    public bool FromMe { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public MessageType Type { get; set; } = MessageType.TEXT;
    public string? MediaUrl { get; set; }
    public string? MediaMimeType { get; set; }
    public string? Caption { get; set; }
    public DateTime? Timestamp { get; set; }
    public MessageStatus? Status { get; set; }
}

