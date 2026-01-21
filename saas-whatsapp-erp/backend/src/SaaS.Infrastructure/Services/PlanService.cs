using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Domain.SaaS;

namespace SaaS.Infrastructure.Services;

public class PlanService : IPlanService
{
    private readonly IUsageCountersRepository _countersRepository;
    private readonly ICompanyRepository _companyRepository;

    public PlanService(IUsageCountersRepository countersRepository, ICompanyRepository companyRepository)
    {
        _countersRepository = countersRepository;
        _companyRepository = companyRepository;
    }

    public async Task<bool> CanConsumeAsync(string companyId, string resourceType)
    {
        var company = await _companyRepository.GetByIdAsync(companyId);
        if (company == null) return false;

        var period = DateTime.UtcNow.ToString("yyyy-MM");
        var counters = await _countersRepository.GetCurrentAsync(companyId, period);
        
        var limits = PlanLimits.GetLimits(company.Plan);

        return resourceType.ToLower() switch
        {
            "messages" => (counters?.MessagesUsed ?? 0) < limits.MaxMessages,
            "conversations" => (counters?.ConversationsUsed ?? 0) < limits.MaxConversations,
            "invoices" => (counters?.InvoicesUsed ?? 0) < limits.MaxInvoices,
            "users" => (counters?.UsersUsed ?? 0) < limits.MaxUsers,
            _ => true
        };
    }

    public async Task TrackConsumptionAsync(string companyId, string resourceType, int amount = 1)
    {
        var period = DateTime.UtcNow.ToString("yyyy-MM");
        var field = resourceType.ToLower() switch
        {
            "messages" => "messagesUsed",
            "conversations" => "conversationsUsed",
            "invoices" => "invoicesUsed",
            "users" => "usersUsed",
            _ => throw new ArgumentException("Invalid resource type")
        };

        await _countersRepository.IncrementAsync(companyId, period, field, amount);
    }
}
