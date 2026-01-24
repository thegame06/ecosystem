namespace SaaS.Application.Interfaces;

public interface IWhatsAppProvider
{
    Task<bool> SendTextMessageAsync(string companyId, string toNumber, string message);
    Task<bool> SendPdfAsync(string companyId, string toNumber, byte[] pdfBytes, string fileName);
    Task<string> GetQrCodeAsync(string companyId);
    Task<bool> IsConnectedAsync(string companyId);
    Task<bool> LogoutAsync(string companyId);
}




