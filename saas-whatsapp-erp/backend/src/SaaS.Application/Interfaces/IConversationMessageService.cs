using SaaS.Application.DTOs.Conversations;

namespace SaaS.Application.Interfaces;

public interface IConversationMessageService
{
    Task<ConversationMessageResponse> CreateMessageAsync(string companyId, CreateMessageRequest request);
    Task<List<ConversationMessageResponse>> GetMessagesByConversationAsync(string companyId, string conversationId);
    
    // Métodos para trazabilidad futura
    Task<List<ConversationMessageResponse>> GetMessagesByRelatedSaleAsync(string companyId, string saleId);
    Task<List<ConversationMessageResponse>> GetMessagesByRelatedInvoiceAsync(string companyId, string invoiceId);
    
    // Acciones de negocio especiales
    Task<ConversationMessageResponse> SendSaleOrderToCustomerAsync(string companyId, string conversationId, string saleId);
    Task<ConversationMessageResponse> SendInvoiceToCustomerAsync(string companyId, string conversationId, string invoiceId);
}
