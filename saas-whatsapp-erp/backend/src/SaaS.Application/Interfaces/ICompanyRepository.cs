using SaaS.Domain.Documents;

namespace SaaS.Application.Interfaces;

public interface ICompanyRepository
{
    Task<Company> CreateAsync(Company company);
    Task<Company?> GetByIdAsync(string id);
    Task<Company?> GetByNameAsync(string name);
}
