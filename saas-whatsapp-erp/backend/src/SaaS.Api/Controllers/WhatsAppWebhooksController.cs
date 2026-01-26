using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.WhatsApp;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Domain.Enums;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/webhooks/whatsapp")]
public class WhatsAppWebhooksController : ControllerBase
{
    private readonly IConversationService _conversationService;
    private readonly IPlanService _planService;
    private readonly ICompanyRepository _companyRepository;
    private readonly ILogger<WhatsAppWebhooksController> _logger;

    public WhatsAppWebhooksController(
        IConversationService conversationService,
        IPlanService planService,
        ICompanyRepository companyRepository,
        ILogger<WhatsAppWebhooksController> logger)
    {
        _conversationService = conversationService;
        _planService = planService;
        _companyRepository = companyRepository;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/webhooks/whatsapp/{companyId}
    /// Verificación de webhook (Requerido por Meta)
    /// </summary>
    [HttpGet("{companyId}")]
    public async Task<IActionResult> VerifyWebhook(
        string companyId,
        [FromQuery(Name = "hub.mode")] string mode,
        [FromQuery(Name = "hub.verify_token")] string token,
        [FromQuery(Name = "hub.challenge")] string challenge)
    {
        _logger.LogInformation("[Webhook] Verification request received for company {CompanyId}", companyId);
        _logger.LogInformation("[Webhook] Mode: {Mode}, Token: {Token}, Challenge: {Challenge}", mode, token?.Substring(0, Math.Min(10, token?.Length ?? 0)), challenge);

        if (string.IsNullOrEmpty(mode) || string.IsNullOrEmpty(token))
        {
            _logger.LogWarning("[Webhook] Missing required parameters");
            return BadRequest(new { error = "Missing hub.mode or hub.verify_token" });
        }

        var company = await _companyRepository.GetByIdAsync(companyId);
        if (company == null)
        {
            _logger.LogWarning("[Webhook] Company {CompanyId} not found", companyId);
            return NotFound(new { error = "Company not found" });
        }

        if (company.WhatsAppSettings == null)
        {
            _logger.LogWarning("[Webhook] WhatsApp settings not configured for company {CompanyId}", companyId);
            return NotFound(new { error = "WhatsApp settings not configured" });
        }

        if (!company.WhatsAppSettings.IsActive)
        {
            _logger.LogWarning("[Webhook] WhatsApp is not active for company {CompanyId}", companyId);
            return StatusCode(403, new { error = "WhatsApp integration is not active" });
        }

        if (mode == "subscribe" && token == company.WhatsAppSettings.VerifyToken)
        {
            _logger.LogInformation("[Webhook] ✅ Verification successful for company {CompanyId}", companyId);
            return Content(challenge); // Meta expects the challenge as plain text
        }

        _logger.LogWarning("[Webhook] ❌ Verification failed - Invalid token for company {CompanyId}", companyId);
        return StatusCode(403, new { error = "Invalid verify token" });
    }

    /// <summary>
    /// POST /api/webhooks/whatsapp/{companyId}
    /// Recibe mensajes de WhatsApp (Meta Cloud API)
    /// </summary>
    [HttpPost("{companyId}")]
    public async Task<IActionResult> ReceiveMessage(string companyId, [FromBody] WhatsAppWebhookPayload payload)
    {
        _logger.LogInformation("[Webhook] Message received for company {CompanyId}", companyId);

        try
        {
            if (payload?.Entry == null || !payload.Entry.Any())
            {
                _logger.LogWarning("[Webhook] Empty payload received");
                return Ok(); // Always return 200 to Meta
            }

            var entry = payload.Entry.FirstOrDefault();
            var change = entry?.Changes?.FirstOrDefault();
            var value = change?.Value;
            var message = value?.Messages?.FirstOrDefault();

            if (message == null)
            {
                _logger.LogInformation("[Webhook] No message in payload (might be status update)");
                return Ok();
            }

            _logger.LogInformation("[Webhook] Message type: {Type}, From: {From}", message.Type, message.From);

            if (message.Type == "text" && message.Text != null)
            {
                var phoneNumberId = value?.Metadata?.PhoneNumberId;
                _logger.LogInformation("[Webhook] Text message received from {From}: {Body}", message.From, message.Text.Body);

                // Validate company WhatsApp settings
                var company = await _companyRepository.GetByIdAsync(companyId);
                if (company?.WhatsAppSettings == null || !company.WhatsAppSettings.IsActive)
                {
                    _logger.LogWarning("[Webhook] WhatsApp not active for company {CompanyId}", companyId);
                    return Ok(); // Still return 200 to avoid Meta retries
                }

                // Validate phone number ID matches
                if (!string.IsNullOrEmpty(phoneNumberId) && phoneNumberId != company.WhatsAppSettings.PhoneNumberId)
                {
                    _logger.LogWarning("[Webhook] Phone number ID mismatch. Expected: {Expected}, Received: {Received}",
                        company.WhatsAppSettings.PhoneNumberId, phoneNumberId);
                    return Ok();
                }

                await _conversationService.HandleIncomingMessageAsync(companyId, message.From, message.Text.Body);
                _logger.LogInformation("[Webhook] ✅ Message processed successfully");
            }
            else
            {
                _logger.LogInformation("[Webhook] Non-text message type: {Type}", message.Type);
            }

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Webhook] ❌ Error processing message for company {CompanyId}", companyId);
            return Ok(); // Always return 200 to Meta to avoid infinite retries
        }
    }

    /// <summary>
    /// POST /api/webhooks/whatsapp/byon/{companyId}
    /// Recibe mensajes de WhatsApp (BYON / Unofficial)
    /// </summary>
    [HttpPost("byon/{companyId}")]
    public async Task<IActionResult> ReceiveMessageByon(string companyId, [FromBody] JsonElement payload)
    {
        var rawText = payload.ToString();
        _logger.LogInformation("[Webhook BYON] RAW PAYLOAD ({CompanyId}): {Payload}", companyId, rawText);

        try
        {
            // Note: Different BYON providers have different structures. 
            // This is a generic implementation that expects basic fields or needs mapping.
            // For now, let's assume a simple structure: { "from": "...", "text": "..." }

            string from = "";
            string text = "";
            string eventType = payload.TryGetProperty("event", out var e) ? e.GetString() ?? "" : "";

            if (eventType.Equals("connection.update", StringComparison.OrdinalIgnoreCase) ||
                eventType.Equals("CONNECTION_UPDATE", StringComparison.OrdinalIgnoreCase))
            {
                if (payload.TryGetProperty("data", out var dataProp) && dataProp.TryGetProperty("state", out var stateProp))
                {
                    var state = stateProp.GetString();
                    _logger.LogInformation("[Webhook BYON] Connection update for {CompanyId}: {State}", companyId, state);

                    if (state == "open")
                    {
                        var company = await _companyRepository.GetByIdAsync(companyId);
                        if (company != null)
                        {
                            if (company.WhatsAppSettings == null)
                                company.WhatsAppSettings = new WhatsAppSettings();

                            company.WhatsAppSettings.IsActive = true;
                            company.WhatsAppSettings.ProviderType = WhatsAppProviderType.Unofficial;

                            // Track that we are connected
                            await _companyRepository.UpdateAsync(company);
                            _logger.LogInformation("[Webhook BYON] ✅ Company {CompanyId} marked as ACTIVE/CONNECTED", companyId);
                        }
                    }
                    else if (state == "close" || state == "connecting")
                    {
                        // Optionally mark as inactive, but we might want to wait for "close" specifically
                        var company = await _companyRepository.GetByIdAsync(companyId);
                        if (company != null && company.WhatsAppSettings != null && company.WhatsAppSettings.IsActive)
                        {
                            company.WhatsAppSettings.IsActive = false;
                            await _companyRepository.UpdateAsync(company);
                            _logger.LogInformation("[Webhook BYON] ⚠️ Company {CompanyId} marked as INACTIVE (disconnected)", companyId);
                        }
                    }
                }
            }
            else if (eventType.Equals("messages.upsert", StringComparison.OrdinalIgnoreCase) ||
                     eventType.Equals("MESSAGES_UPSERT", StringComparison.OrdinalIgnoreCase))
            {
                if (payload.TryGetProperty("data", out var dataProp))
                {
                    // For MESSAGES_UPSERT, data is often an array in some versions or a single object in others
                    JsonElement messageData = dataProp;
                    if (dataProp.ValueKind == JsonValueKind.Array && dataProp.GetArrayLength() > 0)
                    {
                        messageData = dataProp[0];
                    }

                    // Get sender JID
                    if (messageData.TryGetProperty("key", out var keyProp) && keyProp.TryGetProperty("remoteJid", out var jidProp))
                    {
                        var fullJid = jidProp.GetString() ?? "";
                        from = fullJid.Split('@')[0]; // Clean "@s.whatsapp.net"
                    }

                    // Check if it's from me (avoid loops)
                    if (messageData.TryGetProperty("key", out var keyProp2) && keyProp2.TryGetProperty("fromMe", out var fromMeProp) && fromMeProp.GetBoolean())
                    {
                        _logger.LogInformation("[Webhook BYON] Ignoring message from ME");
                        return Ok();
                    }

                    // Get message body
                    if (messageData.TryGetProperty("message", out var msgProp))
                    {
                        if (msgProp.TryGetProperty("conversation", out var convProp))
                        {
                            text = convProp.GetString() ?? "";
                        }
                        else if (msgProp.TryGetProperty("extendedTextMessage", out var extProp) && extProp.TryGetProperty("text", out var tProp))
                        {
                            text = tProp.GetString() ?? "";
                        }
                        else if (msgProp.TryGetProperty("imageMessage", out var imgProp) && imgProp.TryGetProperty("caption", out var capProp))
                        {
                            text = capProp.GetString() ?? "[Imagen]";
                        }
                    }
                }
            }


            if (!string.IsNullOrEmpty(from) && !string.IsNullOrEmpty(text))
            {
                // Extract additional tracking info
                string? pushName = null;
                string? externalId = null;
                string? remoteJid = null;
                DateTime? timestamp = null;

                if (payload.TryGetProperty("data", out var d))
                {
                    if (d.TryGetProperty("pushName", out var pn)) pushName = pn.GetString();
                    if (d.TryGetProperty("key", out var k) && k.TryGetProperty("id", out var id)) externalId = id.GetString();
                    if (d.TryGetProperty("key", out var z) && z.TryGetProperty("remoteJid", out var rJid)) remoteJid = rJid.GetString();
                    if (d.TryGetProperty("messageTimestamp", out var ts) && ts.TryGetInt64(out var tsVal))
                    {
                        timestamp = DateTimeOffset.FromUnixTimeSeconds(tsVal).UtcDateTime;
                    }
                }

                // Ensure we handle international format correctly
                await _conversationService.HandleIncomingMessageAsync(companyId, from, text, pushName, remoteJid, externalId, timestamp);
                _logger.LogInformation("[Webhook BYON] ✅ Message processed from {PushName} ({From}): {Text}", pushName ?? "Unknown", from, text);
            }

            return Ok();

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Webhook BYON] ❌ Error processing message for company {CompanyId}", companyId);
            return Ok();
        }
    }
}

