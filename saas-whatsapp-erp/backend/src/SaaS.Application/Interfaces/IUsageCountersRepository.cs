using SaaS.Domain.Documents;

namespace SaaS.Application.Interfaces;

public interface IUsageCountersRepository
{
    Task<UsageCounters?> GetCurrentAsync(string companyId, string period);
    Task CreateAsync(UsageCounters counters);
    Task IncrementAsync(string companyId, string period, string field, int amount = 1);
}
