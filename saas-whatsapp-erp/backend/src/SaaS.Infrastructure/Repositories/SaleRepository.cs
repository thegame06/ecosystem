using MongoDB.Driver;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Infrastructure.Configuration;

namespace SaaS.Infrastructure.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly IMongoCollection<Sale> _sales;

    public SaleRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _sales = database.GetCollection<Sale>("sales");

        CreateIndexes();
    }

    private void CreateIndexes()
    {
        var indexModels = new[]
        {
            new CreateIndexModel<Sale>(
                Builders<Sale>.IndexKeys.Ascending(s => s.CompanyId)),
            new CreateIndexModel<Sale>(
                Builders<Sale>.IndexKeys.Ascending(s => s.CustomerId)),
            new CreateIndexModel<Sale>(
                Builders<Sale>.IndexKeys.Ascending(s => s.State)),
            new CreateIndexModel<Sale>(
                Builders<Sale>.IndexKeys.Combine(
                    Builders<Sale>.IndexKeys.Ascending(s => s.CompanyId),
                    Builders<Sale>.IndexKeys.Ascending(s => s.CustomerId)))
        };

        _sales.Indexes.CreateManyAsync(indexModels);
    }

    public async Task<Sale> CreateAsync(Sale sale)
    {
        sale.CreatedAt = DateTime.UtcNow;
        sale.UpdatedAt = DateTime.UtcNow;
        await _sales.InsertOneAsync(sale);
        return sale;
    }

    public async Task<Sale?> GetByIdAsync(string id)
    {
        return await _sales.Find(s => s.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Sale>> GetByCompanyIdAsync(string companyId)
    {
        return await _sales
            .Find(s => s.CompanyId == companyId)
            .SortByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Obtiene IQueryable para aplicar filtros OData directamente en MongoDB
    /// </summary>
    public IQueryable<Sale> GetQueryable(string companyId)
    {
        return _sales.AsQueryable()
            .Where(s => s.CompanyId == companyId);
    }

    public async Task<List<Sale>> GetByCustomerIdAsync(string companyId, string customerId)
    {
        return await _sales
            .Find(s => s.CompanyId == companyId && s.CustomerId == customerId)
            .SortByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<Sale> UpdateAsync(Sale sale)
    {
        sale.UpdatedAt = DateTime.UtcNow;
        await _sales.ReplaceOneAsync(s => s.Id == sale.Id, sale);
        return sale;
    }
}
