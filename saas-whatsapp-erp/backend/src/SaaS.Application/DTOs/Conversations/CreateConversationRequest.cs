using System.ComponentModel.DataAnnotations;

namespace SaaS.Application.DTOs.Conversations;

public class CreateConversationRequest
{
    [Required]
    [Phone]
    public string CustomerPhone { get; set; } = string.Empty;

    public string? CustomerName { get; set; } // Optional, for auto-creation

    [Required]
    public string InitialMessage { get; set; } = string.Empty;
}
