using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Products;

namespace SaaS.Application.Interfaces;

public interface IProductService
{
    Task<ResponsePagination<ProductResponse>> SearchAsync(ODataQueryOptions<ProductResponse> queryOptions, string companyId);
    Task<ProductResponse?> GetByIdAsync(string id, string companyId);
    Task<ProductResponse> CreateAsync(CreateProductRequest request, string companyId);
    Task<ProductResponse?> UpdateAsync(string id, UpdateProductRequest request, string companyId);
    Task<bool> DeleteAsync(string id, string companyId);
}
