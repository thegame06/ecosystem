using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Invoices;

namespace SaaS.Application.Interfaces;

public interface IInvoiceService
{
    Task<ResponsePagination<InvoiceResponse>> SearchAsync(ODataQueryOptions<InvoiceResponse> queryOptions, string companyId);
    Task<List<InvoiceResponse>> GetAllAsync(string companyId);
    Task<InvoiceResponse?> GetByIdAsync(string id, string companyId);
    Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest request, string companyId);
    Task<InvoiceResponse?> UpdateStatusAsync(string id, UpdateInvoiceStatusRequest request, string companyId);
    Task<byte[]?> GeneratePdfAsync(string id, string companyId);
    Task SendWhatsAppAsync(string id, string companyId);
}
