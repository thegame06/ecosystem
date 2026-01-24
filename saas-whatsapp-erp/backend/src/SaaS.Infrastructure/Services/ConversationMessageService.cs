using SaaS.Application.DTOs.Conversations;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;

namespace SaaS.Infrastructure.Services;

public class ConversationMessageService : IConversationMessageService
{
    private readonly IConversationMessageRepository _messageRepository;

    public ConversationMessageService(IConversationMessageRepository messageRepository)
    {
        _messageRepository = messageRepository;
    }

    public async Task<ConversationMessageResponse> CreateMessageAsync(string companyId, CreateMessageRequest request)
    {
        var message = MapToDocument(request);
        message.CompanyId = companyId; // Asegurar tenant
        
        // Ensure timestamp if not provided
        if (message.MessageTimestamp == default)
            message.MessageTimestamp = DateTime.UtcNow;

        var created = await _messageRepository.CreateAsync(message);
        return MapToResponse(created);
    }

    public async Task<List<ConversationMessageResponse>> GetMessagesByConversationAsync(string companyId, string conversationId)
    {
        var messages = await _messageRepository.GetMessagesByConversationAsync(conversationId);
        return messages.Select(MapToResponse).ToList();
    }

    public async Task<List<ConversationMessageResponse>> GetMessagesByRelatedSaleAsync(string companyId, string saleId)
    {
        var messages = await _messageRepository.GetMessagesByRelatedSaleAsync(saleId);
        return messages.Select(MapToResponse).ToList();
    }

    public async Task<List<ConversationMessageResponse>> GetMessagesByRelatedInvoiceAsync(string companyId, string invoiceId)
    {
        var messages = await _messageRepository.GetMessagesByRelatedInvoiceAsync(invoiceId);
        return messages.Select(MapToResponse).ToList();
    }

    public async Task<ConversationMessageResponse> SendInvoiceToCustomerAsync(string companyId, string conversationId, string invoiceId)
    {
        // TODO: Implement actual sending via WhatsApp Provider
        throw new NotImplementedException("SendInvoiceToCustomerAsync not implemented yet");
    }

    public async Task<ConversationMessageResponse> SendSaleOrderToCustomerAsync(string companyId, string conversationId, string saleId)
    {
        // TODO: Implement actual sending via WhatsApp Provider
        throw new NotImplementedException("SendSaleOrderToCustomerAsync not implemented yet");
    }

    private ConversationMessage MapToDocument(CreateMessageRequest request)
    {
        return new ConversationMessage
        {
            ConversationId = request.ConversationId,
            CustomerId = request.CustomerId,
            ExternalId = request.ExternalId ?? string.Empty,
            RemoteJid = request.RemoteJid,
            FromMe = request.FromMe,
            SenderName = request.SenderName,
            Content = request.Content,
            Type = request.Type,
            MediaUrl = request.MediaUrl,
            MediaMimeType = request.MediaMimeType,
            Caption = request.Caption,
            MessageTimestamp = request.Timestamp ?? DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
    }

    private ConversationMessageResponse MapToResponse(ConversationMessage message)
    {
        return new ConversationMessageResponse
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            FromMe = message.FromMe,
            SenderName = message.SenderName,
            Content = message.Content,
            Type = message.Type,
            MediaUrl = message.MediaUrl,
            Status = message.Status,
            MessageTimestamp = message.MessageTimestamp
        };
    }
}
