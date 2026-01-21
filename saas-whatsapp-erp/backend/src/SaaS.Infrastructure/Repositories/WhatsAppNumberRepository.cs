using MongoDB.Driver;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Infrastructure.Configuration;
using Microsoft.Extensions.Options;

namespace SaaS.Infrastructure.Repositories;

public class WhatsAppNumberRepository : IWhatsAppNumberRepository
{
    private readonly IMongoCollection<WhatsAppNumber> _collection;

    public WhatsAppNumberRepository(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
    {
        var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _collection = database.GetCollection<WhatsAppNumber>("whatsapp_numbers");
    }

    public async Task<WhatsAppNumber?> GetActiveByCompanyIdAsync(string companyId)
    {
        return await _collection.Find(n => n.CompanyId == companyId && n.IsActive).FirstOrDefaultAsync();
    }

    public async Task CreateAsync(WhatsAppNumber number)
    {
        await _collection.InsertOneAsync(number);
    }
}
