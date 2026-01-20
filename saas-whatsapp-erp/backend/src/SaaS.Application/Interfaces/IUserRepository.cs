using SaaS.Domain.Documents;

namespace SaaS.Application.Interfaces;

public interface IUserRepository
{
    Task<User> CreateAsync(User user);
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<List<User>> GetByCompanyIdAsync(string companyId);
}
