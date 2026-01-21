using Microsoft.AspNetCore.Mvc;
using SaaS.Application.Interfaces;
using SaaS.Domain.Enums;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/webhooks/whatsapp")]
public class WhatsAppWebhooksController : ControllerBase
{
    private readonly IConversationService _conversationService;
    private readonly IPlanService _planService;

    public WhatsAppWebhooksController(IConversationService conversationService, IPlanService planService)
    {
        _conversationService = conversationService;
        _planService = planService;
    }

    /// <summary>
    /// Recibe mensajes de WhatsApp (BYON)
    /// </summary>
    [HttpPost("{companyId}")]
    public async Task<IActionResult> ReceiveMessage(string companyId, [FromBody] WhatsAppMessagePayload payload)
    {
        // 1. Validar límites de mensajes entrantes (Opcional, pero bueno para el SaaS)
        // En el MVP, los mensajes entrantes a veces no se cuentan contra el límite, 
        // pero vamos a trackear la conversación si es nueva.
        
        try 
        {
            // 2. Procesar mensaje y actualizar conversación
            // Este es un flujo simplificado para la demo
            await _conversationService.HandleIncomingMessageAsync(companyId, payload.From, payload.Text);
            
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Verificación de webhook (Requerido por Meta/Facebook)
    /// </summary>
    [HttpGet("{companyId}")]
    public IActionResult VerifyWebhook([FromQuery(Name = "hub.mode")] string mode,
                                     [FromQuery(Name = "hub.verify_token")] string token,
                                     [FromQuery(Name = "hub.challenge")] string challenge)
    {
        // En el MVP usaremos un verify token simple o configurable per company
        return Ok(challenge);
    }
}

public class WhatsAppMessagePayload
{
    public string From { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
}
