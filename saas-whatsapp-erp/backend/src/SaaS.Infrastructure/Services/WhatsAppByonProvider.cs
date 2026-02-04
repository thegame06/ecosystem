using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;

namespace SaaS.Infrastructure.Services;

public class WhatsAppByonProvider : IWhatsAppProvider
{
    private readonly HttpClient _httpClient;
    private readonly ICompanyRepository _companyRepository;
    private readonly ILogger<WhatsAppByonProvider> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _baseUrl;
    private readonly string _apiKey;

    public WhatsAppByonProvider(
        HttpClient httpClient,
        ICompanyRepository companyRepository,
        IConfiguration configuration,
        ILogger<WhatsAppByonProvider> logger)
    {
        _httpClient = httpClient;
        _companyRepository = companyRepository;
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

            // 2. Connect (this generates the QR)
            var url = $"{_baseUrl}/instance/connect/{instanceName}";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("apikey", _apiKey);

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                using var doc = JsonDocument.Parse(content);

                if (doc.RootElement.TryGetProperty("base64", out var base64Prop))
                {
                    return base64Prop.GetString() ?? string.Empty;
                }

                if (doc.RootElement.TryGetProperty("code", out var codeProp))
                {
                    return codeProp.GetString() ?? string.Empty;
                }

                // V2 nested structure: qrcode.base64
                if (doc.RootElement.TryGetProperty("qrcode", out var qrObj))
                {
                    if (qrObj.TryGetProperty("base64", out var b64)) return b64.GetString() ?? string.Empty;
                }
            }

            _logger.LogWarning("Failed to extract QR code for {CompanyId}. Status: {Code}, Body: {Body}",
                companyId, response.StatusCode, content);
            return string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting QR code for {CompanyId}", companyId);
            return string.Empty;
        }
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
                using var doc = JsonDocument.Parse(content);
                if (doc.RootElement.TryGetProperty("instance", out var instProp) &&
                    instProp.TryGetProperty("state", out var stateProp))
                {
                    var state = stateProp.GetString();
                    return state == "open" || state == "connected";
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

            var isLid = toNumber.Contains("@lid");
            var payload = new
            {
                number = toNumber,
                textMessage = new { text = message },
                options = new 
                { 
                    delay = 1200, 
                    linkPreview = false,
                    checkContact = false // Crucial para LIDs en v1.8.2
                }
            };

            if (isLid)
            {
                _logger.LogInformation("[BYON] Sending message to LID JID: {Jid}", toNumber);
            }

            return await SendPostRequestAsync(url, payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending BYON text message");
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
                mediatype = "document",
                media = base64File,
                fileName = fileName,
                caption = fileName
            };

            return await SendPostRequestAsync(url, payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending BYON PDF");
            return false;
        }
    }

    private async Task CreateInstanceIfNotExists(string instanceName)
    {
        var fetchUrl = $"{_baseUrl}/instance/fetchInstances?instanceName={instanceName}";
        var fetchRequest = new HttpRequestMessage(HttpMethod.Get, fetchUrl);
        fetchRequest.Headers.Add("apikey", _apiKey);

        var response = await _httpClient.SendAsync(fetchRequest);
        var exists = false;

        // In v1.8.2, fetchInstances?instanceName=X returns:
        // - 200 OK (Object) if exists
        // - 404 Not Found if NOT exists
        if (response.IsSuccessStatusCode)
        {
            exists = true;
        }
        else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            exists = false;
        }

        if (!exists)
        {
            _logger.LogInformation("Creating Evolution API v1.x instance: {InstanceName}", instanceName);
            
            // Evolution API v1.8.2 simple create payload
            var payload = new
            {
                instanceName = instanceName,
                token = instanceName,
                qrcode = true
            };

            var success = await SendPostRequestAsync($"{_baseUrl}/instance/create", payload);
            if (success)
            {
                _logger.LogInformation("✅ Instance {InstanceName} created successfully", instanceName);
                await Task.Delay(2000); // Give it time to initialize
            }
            else 
            {
                _logger.LogWarning("⚠️ Could not create instance {InstanceName}. Webhook setup might fail.", instanceName);
                return; // Don't proceed to set webhook if creation failed
            }
        }

        // Set webhook after instance exists
        await SetWebhookAsync(instanceName);
    }


    public async Task SetWebhookAsync(string instanceName)
    {
        var webhookUrl = _configuration["EvolutionAPI:WebhookBaseUrl"];
        if (string.IsNullOrEmpty(webhookUrl)) return;

        webhookUrl = webhookUrl.TrimEnd('/');
        var fullWebhookUrl = $"{webhookUrl}/api/webhooks/whatsapp/byon/{instanceName.Replace("comp_", "")}";

        _logger.LogInformation("--- EVOLUTION v1.8.2 DEBUG: Configurando Webhook para {InstanceName} en {Url}", instanceName, fullWebhookUrl);

        var payload = new
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
            }
        };

        var success = await SendPostRequestAsync($"{_baseUrl}/webhook/set/{instanceName}", payload);
        
        if (!success)
        {
            _logger.LogError("--- EVOLUTION v1.8.2 DEBUG: Error configurando webhook para {InstanceName}. URL intento: {Url}", instanceName, $"{_baseUrl}/webhook/set/{instanceName}");
        }
    }


    private async Task<bool> SendPostRequestAsync(string url, object payload, bool suppressErrorLog = false)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Add("apikey", _apiKey);
        request.Content = JsonContent.Create(payload);

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            if (!suppressErrorLog)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Evolution API POST error: {Code}, {Body}", response.StatusCode, errorBody);
            }
            return false;
        }

        return true;
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
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Error logging out instance {Instance}: {Body}", instanceName, errorBody);
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception during logout for {CompanyId}", companyId);
            return false;
        }
    }

    public async Task<bool> SyncWebhookAsync(string companyId)
    {
        try
        {
            var instanceName = $"comp_{companyId}";
            
            // Check if instance exists first
            var fetchUrl = $"{_baseUrl}/instance/fetchInstances?instanceName={instanceName}";
            var fetchRequest = new HttpRequestMessage(HttpMethod.Get, fetchUrl);
            fetchRequest.Headers.Add("apikey", _apiKey);

            var response = await _httpClient.SendAsync(fetchRequest);
            
            // In v1.8.2: 200 OK = Exists, 404 = Not Found
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogWarning("Instance {InstanceName} does not exist. User needs to connect WhatsApp first.", instanceName);
                return false;
            }
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Error checking instance {InstanceName}: {StatusCode}", instanceName, response.StatusCode);
                return false;
            }

            await SetWebhookAsync(instanceName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing webhook for {CompanyId}", companyId);
            return false;
        }
    }
}
