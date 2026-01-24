using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;

namespace SaaS.Infrastructure.Services;

public class WhatsAppCloudApiProvider : IWhatsAppProvider
{
    private readonly HttpClient _httpClient;
    private readonly ICompanyRepository _companyRepository;
    private readonly ILogger<WhatsAppCloudApiProvider> _logger;
    private const string GraphApiVersion = "v21.0";

    public WhatsAppCloudApiProvider(HttpClient httpClient, ICompanyRepository companyRepository, ILogger<WhatsAppCloudApiProvider> logger)
    {
        _httpClient = httpClient;
        _companyRepository = companyRepository;
        _logger = logger;
    }

    public async Task<bool> SendTextMessageAsync(string companyId, string toNumber, string message)
    {
        try
        {
            var settings = await GetSettingsAsync(companyId);
            if (settings == null) return false;

            var url = $"https://graph.facebook.com/{GraphApiVersion}/{settings.PhoneNumberId}/messages";
            
            var payload = new
            {
                messaging_product = "whatsapp",
                recipient_type = "individual",
                to = toNumber,
                type = "text",
                text = new { body = message }
            };

            return await SendRequestAsync(url, settings.AccessToken, payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending WhatsApp text message for Company {CompanyId}", companyId);
            return false;
        }
    }

    public async Task<bool> SendPdfAsync(string companyId, string toNumber, byte[] pdfBytes, string fileName)
    {
        try
        {
            var settings = await GetSettingsAsync(companyId);
            if (settings == null) return false;

            // 1. Upload Media
            var mediaId = await UploadMediaAsync(settings, pdfBytes, fileName, "application/pdf");
            if (string.IsNullOrEmpty(mediaId)) return false;

            // 2. Send Message with Media ID
            var url = $"https://graph.facebook.com/{GraphApiVersion}/{settings.PhoneNumberId}/messages";
            var payload = new
            {
                messaging_product = "whatsapp",
                recipient_type = "individual",
                to = toNumber,
                type = "document",
                document = new 
                { 
                    id = mediaId,
                    filename = fileName
                }
            };

            return await SendRequestAsync(url, settings.AccessToken, payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending WhatsApp PDF for Company {CompanyId}", companyId);
            return false;
        }
    }

    private async Task<WhatsAppSettings?> GetSettingsAsync(string companyId)
    {
        var company = await _companyRepository.GetByIdAsync(companyId);
        if (company == null || company.WhatsAppSettings == null)
        {
            _logger.LogWarning("WhatsApp settings not found for Company {CompanyId}", companyId);
            return null;
        }
        return company.WhatsAppSettings;
    }

    private async Task<string?> UploadMediaAsync(WhatsAppSettings settings, byte[] fileBytes, string fileName, string mimeType)
    {
        try 
        {
            var url = $"https://graph.facebook.com/{GraphApiVersion}/{settings.PhoneNumberId}/media";
            
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", settings.AccessToken);

            using var content = new MultipartFormDataContent();
            using var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(mimeType);
            
            content.Add(new StringContent("whatsapp"), "messaging_product");
            content.Add(fileContent, "file", fileName);
            
            request.Content = content;

            var response = await _httpClient.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("WhatsApp Media Upload Failed: {StatusCode}, {Body}", response.StatusCode, responseBody);
                return null;
            }

            using var doc = JsonDocument.Parse(responseBody);
            if (doc.RootElement.TryGetProperty("id", out var idElement))
            {
                return idElement.GetString();
            }
            return null;
        }
        catch (Exception ex)
        {
             _logger.LogError(ex, "Exception uploading WhatsApp media");
             return null;
        }
    }

    private async Task<bool> SendRequestAsync(string url, string accessToken, object payload)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        request.Content = JsonContent.Create(payload);

        var response = await _httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("WhatsApp API Error: {StatusCode} {Body}", response.StatusCode, responseBody);
            return false;
        }

        return true;
    }

    public Task<string> GetQrCodeAsync(string companyId) => Task.FromResult<string>(string.Empty);

    public async Task<bool> IsConnectedAsync(string companyId)
    {
        // For Cloud API, we assume it's connected if settings exist and are active
        return true;
    }
}



