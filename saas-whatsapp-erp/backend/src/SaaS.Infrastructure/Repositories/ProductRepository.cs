using MongoDB.Driver;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Infrastructure.Configuration;

namespace SaaS.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly IMongoCollection<Product> _products;

    public ProductRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _products = database.GetCollection<Product>("products");

        // Crear índices
        CreateIndexes();
    }

    private void CreateIndexes()
    {
        var indexModels = new[]
        {
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.CompanyId)),
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.Name)),
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Combine(
                    Builders<Product>.IndexKeys.Ascending(p => p.CompanyId),
                    Builders<Product>.IndexKeys.Ascending(p => p.Name)))
        };

        _products.Indexes.CreateManyAsync(indexModels);
    }

    public async Task<Product> CreateAsync(Product product)
    {
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        await _products.InsertOneAsync(product);
        return product;
    }

    public async Task<Product?> GetByIdAsync(string id)
    {
        return await _products.Find(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Product>> GetByCompanyIdAsync(string companyId)
    {
        return await _products
            .Find(p => p.CompanyId == companyId && p.IsActive)
            .SortBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<Product> UpdateAsync(Product product)
    {
        product.UpdatedAt = DateTime.UtcNow;
        await _products.ReplaceOneAsync(p => p.Id == product.Id, product);
        return product;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _products.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount > 0;
    }
}
