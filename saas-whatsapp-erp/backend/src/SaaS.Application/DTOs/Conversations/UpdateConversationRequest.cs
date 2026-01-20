namespace SaaS.Application.DTOs.Conversations;

public class UpdateConversationRequest
{
    public string? LastMessage { get; set; }
    public bool? HasUnreadMessages { get; set; }
}
