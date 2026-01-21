using MongoDB.Driver;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Infrastructure.Configuration;
using Microsoft.Extensions.Options;

namespace SaaS.Infrastructure.Repositories;

public class UsageCountersRepository : IUsageCountersRepository
{
    private readonly IMongoCollection<UsageCounters> _collection;

    public UsageCountersRepository(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
    {
        var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _collection = database.GetCollection<UsageCounters>("usage_counters");
        
        // Ensure index
        var indexKeysDefinition = Builders<UsageCounters>.IndexKeys.Ascending(c => c.CompanyId).Ascending(c => c.Period);
        var indexOptions = new CreateIndexOptions { Unique = true };
        _collection.Indexes.CreateOne(new CreateIndexModel<UsageCounters>(indexKeysDefinition, indexOptions));
    }

    public async Task<UsageCounters?> GetCurrentAsync(string companyId, string period)
    {
        return await _collection.Find(c => c.CompanyId == companyId && c.Period == period).FirstOrDefaultAsync();
    }

    public async Task CreateAsync(UsageCounters counters)
    {
        await _collection.InsertOneAsync(counters);
    }

    public async Task IncrementAsync(string companyId, string period, string field, int amount = 1)
    {
        var filter = Builders<UsageCounters>.Filter.And(
            Builders<UsageCounters>.Filter.Eq(c => c.CompanyId, companyId),
            Builders<UsageCounters>.Filter.Eq(c => c.Period, period)
        );

        var update = Builders<UsageCounters>.Update
            .Inc(field, amount)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        await _collection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
    }
}
