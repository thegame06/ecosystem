using SaaS.Domain.Documents;

namespace SaaS.Application.Interfaces;

public interface IProductRepository
{
    Task<Product> CreateAsync(Product product);
    Task<Product?> GetByIdAsync(string id);
    Task<List<Product>> GetByCompanyIdAsync(string companyId);
    Task<Product> UpdateAsync(Product product);
    Task<bool> DeleteAsync(string id);
}
