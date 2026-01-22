using MongoDB.Driver;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Infrastructure.Configuration;

namespace SaaS.Infrastructure.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly IMongoCollection<Customer> _customers;

    public CustomerRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _customers = database.GetCollection<Customer>("customers");

        // Crear índices
        CreateIndexes();
    }

    private void CreateIndexes()
    {
        var indexModels = new[]
        {
            new CreateIndexModel<Customer>(
                Builders<Customer>.IndexKeys.Ascending(c => c.CompanyId)),
            new CreateIndexModel<Customer>(
                Builders<Customer>.IndexKeys.Ascending(c => c.Phone)),
            new CreateIndexModel<Customer>(
                Builders<Customer>.IndexKeys.Combine(
                    Builders<Customer>.IndexKeys.Ascending(c => c.CompanyId),
                    Builders<Customer>.IndexKeys.Ascending(c => c.Phone)))
        };

        _customers.Indexes.CreateManyAsync(indexModels);
    }

    public async Task<Customer> CreateAsync(Customer customer)
    {
        customer.CreatedAt = DateTime.UtcNow;
        customer.UpdatedAt = DateTime.UtcNow;
        await _customers.InsertOneAsync(customer);
        return customer;
    }

    public async Task<Customer?> GetByIdAsync(string id)
    {
        return await _customers.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Customer>> GetByCompanyIdAsync(string companyId)
    {
        return await _customers
            .Find(c => c.CompanyId == companyId && c.IsActive)
            .SortByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Customer?> GetByPhoneAsync(string companyId, string phone)
    {
        return await _customers
            .Find(c => c.CompanyId == companyId && c.Phone == phone)
            .FirstOrDefaultAsync();
    }

    public IQueryable<Customer> GetQueryable(string companyId)
    {
        return _customers.AsQueryable()
            .Where(c => c.CompanyId == companyId && c.IsActive);
    }

    public async Task<Customer> UpdateAsync(Customer customer)
    {
        customer.UpdatedAt = DateTime.UtcNow;
        await _customers.ReplaceOneAsync(c => c.Id == customer.Id, customer);
        return customer;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _customers.UpdateOneAsync(
            c => c.Id == id,
            Builders<Customer>.Update.Set(c => c.IsActive, false).Set(c => c.UpdatedAt, DateTime.UtcNow)
        );
        return result.ModifiedCount > 0;
    }
}
