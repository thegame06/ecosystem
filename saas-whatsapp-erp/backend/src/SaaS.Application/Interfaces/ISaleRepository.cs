using SaaS.Domain.Documents;

namespace SaaS.Application.Interfaces;

public interface ISaleRepository
{
    Task<Sale> CreateAsync(Sale sale);
    Task<Sale?> GetByIdAsync(string id);
    Task<List<Sale>> GetByCompanyIdAsync(string companyId);
    Task<List<Sale>> GetByCustomerIdAsync(string companyId, string customerId);
    Task<Sale> UpdateAsync(Sale sale);
}
