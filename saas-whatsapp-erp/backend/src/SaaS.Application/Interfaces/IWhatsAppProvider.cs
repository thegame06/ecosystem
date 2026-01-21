namespace SaaS.Application.Interfaces;

public interface IWhatsAppProvider
{
    Task<bool> SendTextMessageAsync(string fromNumber, string toNumber, string message);
    Task<bool> SendPdfAsync(string fromNumber, string toNumber, byte[] pdfBytes, string fileName);
}
