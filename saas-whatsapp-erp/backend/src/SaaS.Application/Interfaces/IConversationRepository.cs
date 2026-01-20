using SaaS.Domain.Documents;

namespace SaaS.Application.Interfaces;

public interface IConversationRepository
{
    Task<Conversation> CreateAsync(Conversation conversation);
    Task<Conversation?> GetByIdAsync(string id);
    Task<List<Conversation>> GetByCompanyIdAsync(string companyId);
    Task<Conversation?> GetByCustomerIdAsync(string companyId, string customerId);
    Task<Conversation> UpdateAsync(Conversation conversation);
}
