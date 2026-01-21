using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Customers;
using SaaS.Application.DTOs.Sales;

namespace SaaS.Application.Interfaces;

public interface ICustomerService
{
    Task<ResponsePagination<CustomerResponse>> SearchAsync(ODataQueryOptions<CustomerResponse> queryOptions, string companyId);
    Task<CustomerResponse?> GetByIdAsync(string id, string companyId);
    Task<CustomerResponse> CreateAsync(CreateCustomerRequest request, string companyId);
    Task<CustomerResponse?> UpdateAsync(string id, UpdateCustomerRequest request, string companyId);
    Task<bool> DeleteAsync(string id, string companyId);
    Task<List<SaleResponse>> GetSalesByCustomerAsync(string customerId, string companyId);
}
