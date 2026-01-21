using MongoDB.Driver;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Infrastructure.Configuration;

namespace SaaS.Infrastructure.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly IMongoCollection<Conversation> _conversations;

    public ConversationRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _conversations = database.GetCollection<Conversation>("conversations");

        // Crear índices
        CreateIndexes();
    }

    private void CreateIndexes()
    {
        var indexModels = new[]
        {
            new CreateIndexModel<Conversation>(
                Builders<Conversation>.IndexKeys.Ascending(c => c.CompanyId)),
            new CreateIndexModel<Conversation>(
                Builders<Conversation>.IndexKeys.Ascending(c => c.CustomerId)),
            new CreateIndexModel<Conversation>(
                Builders<Conversation>.IndexKeys.Descending(c => c.UpdatedAt)),
            new CreateIndexModel<Conversation>(
                Builders<Conversation>.IndexKeys.Combine(
                    Builders<Conversation>.IndexKeys.Ascending(c => c.CompanyId),
                    Builders<Conversation>.IndexKeys.Ascending(c => c.CustomerId)))
        };

        _conversations.Indexes.CreateManyAsync(indexModels);
    }

    public async Task<Conversation> CreateAsync(Conversation conversation)
    {
        conversation.CreatedAt = DateTime.UtcNow;
        conversation.UpdatedAt = DateTime.UtcNow;
        await _conversations.InsertOneAsync(conversation);
        return conversation;
    }

    public async Task<Conversation?> GetByIdAsync(string id)
    {
        return await _conversations.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Conversation>> GetByCompanyIdAsync(string companyId)
    {
        return await _conversations
            .Find(c => c.CompanyId == companyId)
            .SortByDescending(c => c.UpdatedAt)
            .ToListAsync();
    }

    public async Task<Conversation?> GetByCustomerIdAsync(string companyId, string customerId)
    {
        return await _conversations
            .Find(c => c.CompanyId == companyId && c.CustomerId == customerId)
            .FirstOrDefaultAsync();
    }

    public IQueryable<Conversation> GetQueryable(string companyId)
    {
        return _conversations.AsQueryable()
            .Where(c => c.CompanyId == companyId);
    }

    public async Task<Conversation> UpdateAsync(Conversation conversation)
    {
        conversation.UpdatedAt = DateTime.UtcNow;
        await _conversations.ReplaceOneAsync(c => c.Id == conversation.Id, conversation);
        return conversation;
    }
}
