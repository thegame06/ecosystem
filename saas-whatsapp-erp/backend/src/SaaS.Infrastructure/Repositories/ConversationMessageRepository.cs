using MongoDB.Driver;
using SaaS.Application.DTOs.Conversations;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Infrastructure.Configuration;

namespace SaaS.Infrastructure.Repositories;

public class ConversationMessageRepository : IConversationMessageRepository
{
    private readonly IMongoCollection<ConversationMessage> _messages;

    public ConversationMessageRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _messages = database.GetCollection<ConversationMessage>("conversation_messages");

        CreateIndexes();
    }

    private void CreateIndexes()
    {
        var indexModels = new[]
        {
            new CreateIndexModel<ConversationMessage>(
                Builders<ConversationMessage>.IndexKeys.Ascending(m => m.ConversationId)),
            new CreateIndexModel<ConversationMessage>(
                Builders<ConversationMessage>.IndexKeys.Ascending(m => m.ExternalId)), // Idempotencia
            new CreateIndexModel<ConversationMessage>(
                Builders<ConversationMessage>.IndexKeys.Descending(m => m.MessageTimestamp))
        };

        _messages.Indexes.CreateManyAsync(indexModels);
    }

    public async Task<ConversationMessage> CreateAsync(ConversationMessage message)
    {
        message.CreatedAt = DateTime.UtcNow;
        if (message.MessageTimestamp == default)
            message.MessageTimestamp = DateTime.UtcNow;
            
        await _messages.InsertOneAsync(message);
        return message;
    }

    public async Task<List<ConversationMessage>> GetMessagesByConversationAsync(string conversationId)
    {
        return await _messages
            .Find(m => m.ConversationId == conversationId)
            .SortBy(m => m.MessageTimestamp)
            .ToListAsync();
    }

    // Buscar mensaje por ID externo (para evitar duplicados de WhatsApp)
    public async Task<ConversationMessage?> GetByExternalIdAsync(string externalId)
    {
        return await _messages
            .Find(m => m.ExternalId == externalId)
            .FirstOrDefaultAsync();
    }

    // Implementaciones placeholder para trazabilidad futura
    public async Task<List<ConversationMessage>> GetMessagesByRelatedSaleAsync(string saleId)
    {
        var filter = Builders<ConversationMessage>.Filter.AnyEq(m => m.RelatedDocuments, $"Sale:{saleId}");
        return await _messages.Find(filter).SortBy(m => m.MessageTimestamp).ToListAsync();
    }

    public async Task<List<ConversationMessage>> GetMessagesByRelatedInvoiceAsync(string invoiceId)
    {
        var filter = Builders<ConversationMessage>.Filter.AnyEq(m => m.RelatedDocuments, $"Invoice:{invoiceId}");
        return await _messages.Find(filter).SortBy(m => m.MessageTimestamp).ToListAsync();
    }
}
