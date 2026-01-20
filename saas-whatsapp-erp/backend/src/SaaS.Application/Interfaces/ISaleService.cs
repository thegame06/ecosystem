using SaaS.Application.DTOs.Sales;
using SaaS.Application.DTOs.Invoices;

namespace SaaS.Application.Interfaces;

public interface ISaleService
{
    Task<List<SaleResponse>> GetAllAsync(string companyId);
    Task<SaleResponse?> GetByIdAsync(string id, string companyId);
    Task<SaleResponse> CreateAsync(CreateSaleRequest request, string companyId);
    Task<SaleResponse?> UpdateAsync(string id, UpdateSaleRequest request, string companyId);
    Task<InvoiceResponse?> GetInvoiceAsync(string saleId, string companyId);
}
