using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.WhatsApp; // New DTO namespace
using SaaS.Application.Interfaces;
using SaaS.Domain.Enums;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/webhooks/whatsapp")]
public class WhatsAppWebhooksController : ControllerBase
{
    private readonly IConversationService _conversationService;
    private readonly IPlanService _planService;
    private readonly ICompanyRepository _companyRepository; // Inject CompanyRepository

    public WhatsAppWebhooksController(IConversationService conversationService, IPlanService planService, ICompanyRepository companyRepository)
    {
        _conversationService = conversationService;
        _planService = planService;
        _companyRepository = companyRepository;
    }

    /// <summary>
    /// Recibe mensajes de WhatsApp (Oficial API)
    /// </summary>
    [HttpPost("{companyId}")]
    public async Task<IActionResult> ReceiveMessage(string companyId, [FromBody] WhatsAppWebhookPayload payload)
    {
        try 
        {
            var entry = payload.Entry?.FirstOrDefault();
            var change = entry?.Changes?.FirstOrDefault();
            var value = change?.Value;
            var message = value?.Messages?.FirstOrDefault();

            if (message != null && message.Type == "text" && message.Text != null)
            {
                 // Confirmar que el mensaje es para esta compañia (Opcional por seguridad)
                 // var phoneNumberId = value.Metadata.PhoneNumberId;
                 
                 await _conversationService.HandleIncomingMessageAsync(companyId, message.From, message.Text.Body);
            }
            
            return Ok();
        }
        catch (Exception ex)
        {
            // Log error
            return Ok(); // Siempre retornar Ok a Meta para evitar retries infinitos
        }
    }

    /// <summary>
    /// Verificación de webhook (Requerido por Meta/Facebook)
    /// </summary>
    [HttpGet("{companyId}")]
    public async Task<IActionResult> VerifyWebhook(string companyId,
                                     [FromQuery(Name = "hub.mode")] string mode,
                                     [FromQuery(Name = "hub.verify_token")] string token,
                                     [FromQuery(Name = "hub.challenge")] string challenge)
    {
        if (string.IsNullOrEmpty(mode) || string.IsNullOrEmpty(token))
        {
            return BadRequest("Missing params");
        }

        var company = await _companyRepository.GetByIdAsync(companyId);
        if (company == null || company.WhatsAppSettings == null)
        {
            return NotFound("Company or WhatsApp settings not found");
        }

        if (mode == "subscribe" && token == company.WhatsAppSettings.VerifyToken)
        {
            return Ok(int.Parse(challenge)); // Meta espera el entero challenge (o string)
        }
        
        return StatusCode(403);
    }
}
