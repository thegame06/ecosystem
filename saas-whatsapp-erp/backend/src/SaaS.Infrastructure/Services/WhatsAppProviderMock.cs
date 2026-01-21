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

    public async Task<bool> SendTextMessageAsync(string fromNumber, string toNumber, string message)
    {
        _logger.LogInformation("WhatsApp SEND [BYON] From: {From}, To: {To}, Message: {Message}", fromNumber, toNumber, message);
        
        // Simular latencia de red
        await Task.Delay(200);
        
        return true;
    }

    public async Task<bool> SendPdfAsync(string fromNumber, string toNumber, byte[] pdfBytes, string fileName)
    {
        _logger.LogInformation("WhatsApp SEND PDF [BYON] From: {From}, To: {To}, File: {FileName}, Size: {Size} bytes", 
            fromNumber, toNumber, fileName, pdfBytes.Length);
        
        // Simular latencia
        await Task.Delay(500);
        
        return true;
    }
}
