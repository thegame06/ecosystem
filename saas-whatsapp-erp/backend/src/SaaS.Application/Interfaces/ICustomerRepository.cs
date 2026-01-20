using SaaS.Domain.Documents;

namespace SaaS.Application.Interfaces;

public interface ICustomerRepository
{
    Task<Customer> CreateAsync(Customer customer);
    Task<Customer?> GetByIdAsync(string id);
    Task<List<Customer>> GetByCompanyIdAsync(string companyId);
    Task<Customer?> GetByPhoneAsync(string companyId, string phone);
    Task<Customer> UpdateAsync(Customer customer);
    Task<bool> DeleteAsync(string id);
}
