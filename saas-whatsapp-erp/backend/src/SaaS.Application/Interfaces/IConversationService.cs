using SaaS.Application.DTOs.Conversations;
using SaaS.Application.DTOs.Customers;

namespace SaaS.Application.Interfaces;

public interface IConversationService
{
    Task<List<ConversationResponse>> GetAllAsync(string companyId);
    Task<ConversationResponse?> GetByIdAsync(string id, string companyId);
    Task<ConversationResponse> CreateAsync(CreateConversationRequest request, string companyId);
    Task<ConversationResponse?> UpdateAsync(string id, UpdateConversationRequest request, string companyId);
    Task<CustomerResponse?> GetCustomerAsync(string conversationId, string companyId);
}
