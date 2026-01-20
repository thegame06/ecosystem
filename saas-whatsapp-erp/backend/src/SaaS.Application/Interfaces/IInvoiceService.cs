using SaaS.Application.DTOs.Invoices;

namespace SaaS.Application.Interfaces;

public interface IInvoiceService
{
    Task<List<InvoiceResponse>> GetAllAsync(string companyId);
    Task<InvoiceResponse?> GetByIdAsync(string id, string companyId);
    Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest request, string companyId);
    Task<InvoiceResponse?> UpdateStatusAsync(string id, UpdateInvoiceStatusRequest request, string companyId);
    Task<byte[]> GeneratePdfAsync(string id, string companyId); // Placeholder
    Task<bool> SendWhatsAppAsync(string id, string companyId); // Placeholder
}
