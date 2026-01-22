using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Sales;
using SaaS.Application.DTOs.Invoices;

namespace SaaS.Application.Interfaces;

public interface ISaleService
{
    Task<ResponsePagination<SaleResponse>> SearchAsync(ODataQueryOptions<SaleResponse> queryOptions, string companyId);
    Task<List<SaleResponse>> GetAllAsync(string companyId);
    Task<SaleResponse?> GetByIdAsync(string id, string companyId);
    Task<SaleResponse> CreateAsync(CreateSaleRequest request, string companyId, string userId);
    Task<SaleResponse?> UpdateAsync(string id, UpdateSaleRequest request, string companyId, string userId);
    Task<InvoiceResponse?> GetInvoiceAsync(string saleId, string companyId);
}
