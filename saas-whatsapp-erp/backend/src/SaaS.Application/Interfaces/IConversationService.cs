using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Conversations;
using SaaS.Application.DTOs.Customers;

namespace SaaS.Application.Interfaces;

public interface IConversationService
{
    Task<ResponsePagination<ConversationResponse>> SearchAsync(ODataQueryOptions<ConversationResponse> queryOptions, string companyId);
    Task<List<ConversationResponse>> GetAllAsync(string companyId);
    Task<ConversationResponse?> GetByIdAsync(string id, string companyId);
    Task<ConversationResponse> CreateAsync(CreateConversationRequest request, string companyId);
    Task<ConversationResponse?> UpdateAsync(string id, UpdateConversationRequest request, string companyId);
    Task<CustomerResponse?> GetCustomerAsync(string conversationId, string companyId);
    Task HandleIncomingMessageAsync(string companyId, string customerPhone, string message);
}
