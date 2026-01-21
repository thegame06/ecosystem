using SaaS.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace SaaS.Infrastructure.Services;

public class WhatsAppProviderMock : IWhatsAppProvider
{
    private readonly ILogger<WhatsAppProviderMock> _logger;

    public WhatsAppProviderMock(ILogger<WhatsAppProviderMock> logger)
    {
        _logger = logger;
    }

    public async Task<bool> SendTextMessageAsync(string companyId, string toNumber, string message)
    {
        _logger.LogInformation("WhatsApp SEND [BYON] Company: {CompanyId}, To: {To}, Message: {Message}", companyId, toNumber, message);
        
        // Simular latencia de red
        await Task.Delay(200);
        
        return true;
    }

    public async Task<bool> SendPdfAsync(string companyId, string toNumber, byte[] pdfBytes, string fileName)
    {
        _logger.LogInformation("WhatsApp SEND PDF [BYON] Company: {CompanyId}, To: {To}, File: {FileName}, Size: {Size} bytes", 
            companyId, toNumber, fileName, pdfBytes.Length);
        
        // Simular latencia
        await Task.Delay(500);
        
        return true;
    }
}
