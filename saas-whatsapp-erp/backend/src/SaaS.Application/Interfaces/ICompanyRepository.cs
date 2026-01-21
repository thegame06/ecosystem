using SaaS.Domain.Documents;
using SaaS.Domain.Enums;

namespace SaaS.Application.Interfaces;

public interface ICompanyRepository
{
    Task<Company> CreateAsync(Company company);
    Task<Company?> GetByIdAsync(string id);
    Task<Company?> GetByPhoneNumberIdAsync(string phoneNumberId);
    Task UpdateAsync(Company company);
    Task UpdatePlanAsync(string companyId, PlanType plan);
}
