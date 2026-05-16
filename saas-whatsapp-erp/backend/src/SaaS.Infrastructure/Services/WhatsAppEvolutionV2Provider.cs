using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using SaaS.Application.Interfaces;

namespace SaaS.Infrastructure.Services;

public class WhatsAppEvolutionV2Provider : IWhatsAppProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WhatsAppEvolutionV2Provider> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _baseUrl;
    private readonly string _apiKey;

    public WhatsAppEvolutionV2Provider(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<WhatsAppEvolutionV2Provider> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _baseUrl = configuration["EvolutionAPI:BaseUrl"] ?? "http://localhost:8080";
        _apiKey = configuration["EvolutionAPI:ApiKey"] ?? "SaaS_Super_Secret_Token_2026";
    }

    public async Task<string> GetQrCodeAsync(string companyId)
    {
        try
        {
            var instanceName = $"comp_{companyId}";

            // 1. Check if instance exists, if not create
            await CreateInstanceIfNotExists(instanceName);

            // 2. Try to Fetch QR
            var qr = await FetchQrFromConnect(instanceName);
            if (!string.IsNullOrEmpty(qr)) return qr;

            // 3. If failed (e.g. "count:0"), try Logout/Cleanup then Connect again
            _logger.LogWarning("V2: standard connect failed. Retrying with Logout...");
            await LogoutAsync(companyId); 
            await Task.Delay(1500);
            
            return await FetchQrFromConnect(instanceName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "V2: Error getting QR code for {CompanyId}", companyId);
            return string.Empty;
        }
    }

    private async Task<string> FetchQrFromConnect(string instanceName)
    {
        var url = $"{_baseUrl}/instance/connect/{instanceName}";
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("apikey", _apiKey);

        var response = await _httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        if (response.IsSuccessStatusCode)
        {
            using var doc = JsonDocument.Parse(content);
            if (doc.RootElement.TryGetProperty("base64", out var base64Prop)) return base64Prop.GetString() ?? "";
            if (doc.RootElement.TryGetProperty("code", out var code)) return code.GetString() ?? "";
            if (doc.RootElement.TryGetProperty("qrcode", out var qrObj))
            {
                if (qrObj.ValueKind == JsonValueKind.Object && qrObj.TryGetProperty("base64", out var b64)) return b64.GetString() ?? "";
                if (qrObj.ValueKind == JsonValueKind.String) return qrObj.GetString() ?? "";
            }
        }
        _logger.LogWarning("V2 FetchQr failed. Body: {Body}", content);
        return string.Empty;
    }

    public async Task<bool> IsConnectedAsync(string companyId)
    {
        try
        {
            var instanceName = $"comp_{companyId}";
            var url = $"{_baseUrl}/instance/connectionState/{instanceName}";

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("apikey", _apiKey);

            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                // v2 format: { "instance": { "state": "open" } }
                using var doc = JsonDocument.Parse(content);
                if (doc.RootElement.TryGetProperty("instance", out var instProp) &&
                    instProp.TryGetProperty("state", out var stateProp))
                {
                    var state = stateProp.GetString();
                    return state == "open";
                }
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> SendTextMessageAsync(string companyId, string toNumber, string message)
    {
        try
        {
            var instanceName = $"comp_{companyId}";
            var url = $"{_baseUrl}/message/sendText/{instanceName}";

            // v2: Ensure number format. LIDs are handled same way but usually require specific options
            var payload = new
            {
                number = toNumber,
                text = message, // v2 often uses 'text' or 'textMessage': { 'text': ... }
                // Checking v2 documentation usually: { "number": "...", "text": "..." } or { "number": "...", "textMessage": { "text": "..." } }
                // Evolution v2 tends to standardize on textMessage object for consistency
                textMessage = new { text = message },
                options = new { delay = 1200, linkPreview = false }
            };

            return await SendPostRequestAsync(url, payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "V2: Error sending text message");
            return false;
        }
    }

    public async Task<bool> SendPdfAsync(string companyId, string toNumber, byte[] pdfBytes, string fileName)
    {
        try
        {
            var instanceName = $"comp_{companyId}";
            var url = $"{_baseUrl}/message/sendMedia/{instanceName}";

            var base64File = Convert.ToBase64String(pdfBytes);

            var payload = new
            {
                number = toNumber,
                mediaMessage = new
                {
                    mediatype = "document",
                    media = base64File,
                    fileName = fileName,
                    caption = fileName
                }
            };

            return await SendPostRequestAsync(url, payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "V2: Error sending PDF");
            return false;
        }
    }

    public async Task<bool> LogoutAsync(string companyId)
    {
        try
        {
            var instanceName = $"comp_{companyId}";
            var url = $"{_baseUrl}/instance/logout/{instanceName}";
            
            var request = new HttpRequestMessage(HttpMethod.Delete, url);
            request.Headers.Add("apikey", _apiKey);
            
            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "V2: Error logging out");
            return false;
        }
    }

    public async Task<bool> SyncWebhookAsync(string companyId)
    {
        var instanceName = $"comp_{companyId}";
        await SetWebhookAsync(instanceName);
        return true;
    }

    private async Task CreateInstanceIfNotExists(string instanceName)
    {
        // Check existence logic is same, or use fetchInstances
        var fetchUrl = $"{_baseUrl}/instance/fetchInstances?instanceName={instanceName}";
        var fetchRequest = new HttpRequestMessage(HttpMethod.Get, fetchUrl);
        fetchRequest.Headers.Add("apikey", _apiKey);

        var response = await _httpClient.SendAsync(fetchRequest);
        bool exists = false;
        
        if (response.IsSuccessStatusCode)
        {
            // v2 usually returns array or object. If empty array -> not found
            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            // Assuming if it returns the instance object, it exists.
            exists = content.Contains(instanceName); 
        }

        if (!exists)
        {
            var payload = new
            {
                instanceName = instanceName,
                token = instanceName,
                qrcode = true,
                integration = "WHATSAPP-BAILEYS", // v2 specific
                reject_call = false,
                groups_ignore = true,
                always_online = true
            };

            await SendPostRequestAsync($"{_baseUrl}/instance/create", payload);
            await Task.Delay(2000);
        }
        
        // Ensure webhook is set
        await SetWebhookAsync(instanceName);
    }
    
    private async Task SetWebhookAsync(string instanceName)
    {
        var webhookUrl = _configuration["EvolutionAPI:WebhookBaseUrl"];
        if (string.IsNullOrEmpty(webhookUrl)) return;

        webhookUrl = webhookUrl.TrimEnd('/');
        var fullWebhookUrl = $"{webhookUrl}/api/webhooks/whatsapp/byon/{instanceName.Replace("comp_", "")}";

        var payload = new
        {
            webhook = new
            {
                url = fullWebhookUrl,
                enabled = true,
                events = new[]
                {
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE", 
                    "MESSAGES_DELETE",
                    "SEND_MESSAGE",
                    "CONNECTION_UPDATE",
                    "CONTACTS_UPDATE"
                },
                byEvents = false
            }
        };

        // En v2, la ruta ha variado entre versiones menores.
        // v2.0-v2.1: /webhook/instance/{instance}
        // v2.2+: A veces revertido o alias /webhook/set/{instance}
        // Vamos a probar /webhook/set/{instanceName} que suele ser el más compatible si el otro dio 404.
        await SendPostRequestAsync($"{_baseUrl}/webhook/set/{instanceName}", payload, suppressErrorLog: false);
    }

    private async Task<bool> SendPostRequestAsync(string url, object payload, bool suppressErrorLog = false)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Add("apikey", _apiKey);
        request.Content = JsonContent.Create(payload);

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode && !suppressErrorLog)
        {
            var body = await response.Content.ReadAsStringAsync();
            _logger.LogError("V2 POST Error: {Code} body: {Body}", response.StatusCode, body);
            return false;
        }
        return true;
    }
}
