using System.Threading.Tasks;
using MongoDB.Driver;
using SaaS.Domain.Documents;

namespace SaaS.Infrastructure.Mongo;

/// <summary>
/// MongoDB indexes configuration for optimal query performance
/// </summary>
public static class MongoIndexes
{
    public static async Task CreateIndexesAsync(IMongoDatabase database)
    {
        // Products indexes
        var productsCollection = database.GetCollection<Product>("products");
        await productsCollection.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys
                    .Ascending(p => p.CompanyId)
                    .Ascending(p => p.Name)
            ),
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys
                    .Ascending(p => p.CompanyId)
                    .Ascending(p => p.Type)
            ),
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys
                    .Ascending(p => p.CompanyId)
                    .Ascending(p => p.IsActive)
            )
        });
        
        // Sales indexes
        var salesCollection = database.GetCollection<Sale>("sales");
        await salesCollection.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Sale>(
                Builders<Sale>.IndexKeys
                    .Ascending(s => s.CompanyId)
                    .Ascending(s => s.CustomerId)
            ),
            new CreateIndexModel<Sale>(
                Builders<Sale>.IndexKeys
                    .Ascending(s => s.CompanyId)
                    .Ascending(s => s.State)
            ),
            new CreateIndexModel<Sale>(
                Builders<Sale>.IndexKeys
                    .Ascending(s => s.CompanyId)
                    .Descending(s => s.CreatedAt)
            )
        });
        
        // Customers indexes
        var customersCollection = database.GetCollection<Customer>("customers");
        await customersCollection.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Customer>(
                Builders<Customer>.IndexKeys
                    .Ascending(c => c.CompanyId)
                    .Ascending(c => c.Name)
            ),
            new CreateIndexModel<Customer>(
                Builders<Customer>.IndexKeys
                    .Ascending(c => c.CompanyId)
                    .Ascending(c => c.Phone)
            )
        });

        // Invoices indexes
        var invoicesCollection = database.GetCollection<Invoice>("invoices");
        await invoicesCollection.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Invoice>(
                Builders<Invoice>.IndexKeys
                    .Ascending(i => i.CompanyId)
                    .Ascending(i => i.SaleId)
            ),
            new CreateIndexModel<Invoice>(
                Builders<Invoice>.IndexKeys
                    .Ascending(i => i.CompanyId)
                    .Ascending(i => i.Number),
                new CreateIndexOptions { Unique = true }
            ),
            new CreateIndexModel<Invoice>(
                Builders<Invoice>.IndexKeys
                    .Ascending(i => i.CompanyId)
                    .Ascending(i => i.Status)
            )
        });

        // Users indexes
        var usersCollection = database.GetCollection<User>("users");
        await usersCollection.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Unique = true }
            ),
            new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.CompanyId)
            )
        });

        // Companies indexes
        var companiesCollection = database.GetCollection<Company>("companies");
        await companiesCollection.Indexes.CreateOneAsync(
            new CreateIndexModel<Company>(
                Builders<Company>.IndexKeys.Ascending(c => c.Name)
            )
        );
    }
}
