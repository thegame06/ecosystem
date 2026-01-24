using SaaS.Domain.Documents;

namespace SaaS.Application.Interfaces;

public interface IConversationMessageRepository
{
    Task<ConversationMessage> CreateAsync(ConversationMessage message);
    Task<List<ConversationMessage>> GetMessagesByConversationAsync(string conversationId);
    Task<ConversationMessage?> GetByExternalIdAsync(string externalId);
    Task<List<ConversationMessage>> GetMessagesByRelatedSaleAsync(string saleId);
    Task<List<ConversationMessage>> GetMessagesByRelatedInvoiceAsync(string invoiceId);
}
