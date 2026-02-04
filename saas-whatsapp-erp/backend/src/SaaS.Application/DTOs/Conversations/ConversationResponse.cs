using SaaS.Domain.Enums;

namespace SaaS.Application.DTOs.Conversations;

public class ConversationResponse
{
    public string Id { get; set; } = string.Empty;
    public string CompanyId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? RemoteJid { get; set; }
    public string Channel { get; set; } = string.Empty;
    public string? LastMessage { get; set; }
    public CommercialState LastState { get; set; }
    public DateTime LastActivityAt { get; set; }
    public bool IsActive { get; set; }
}
