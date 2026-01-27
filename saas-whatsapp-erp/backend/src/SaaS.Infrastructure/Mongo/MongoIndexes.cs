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
        try
        {
            // Products indexes
            var productsCollection = database.GetCollection<Product>("products");
            await productsCollection.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<Product>(Builders<Product>.IndexKeys.Ascending(p => p.CompanyId).Ascending(p => p.Name)),
                new CreateIndexModel<Product>(Builders<Product>.IndexKeys.Ascending(p => p.CompanyId).Ascending(p => p.Type)),
                new CreateIndexModel<Product>(Builders<Product>.IndexKeys.Ascending(p => p.CompanyId).Ascending(p => p.IsActive))
            });
        }
        catch (Exception ex) { Console.WriteLine($"Index warning (products): {ex.Message}"); }

        try
        {
            // Sales indexes
            var salesCollection = database.GetCollection<Sale>("sales");
            await salesCollection.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<Sale>(Builders<Sale>.IndexKeys.Ascending(s => s.CompanyId).Ascending(s => s.CustomerId)),
                new CreateIndexModel<Sale>(Builders<Sale>.IndexKeys.Ascending(s => s.CompanyId).Ascending(s => s.State)),
                new CreateIndexModel<Sale>(Builders<Sale>.IndexKeys.Ascending(s => s.CompanyId).Descending(s => s.CreatedAt))
            });
        }
        catch (Exception ex) { Console.WriteLine($"Index warning (sales): {ex.Message}"); }

        try
        {
            // Customers indexes
            var customersCollection = database.GetCollection<Customer>("customers");
            await customersCollection.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<Customer>(Builders<Customer>.IndexKeys.Ascending(c => c.CompanyId).Ascending(c => c.Name)),
                new CreateIndexModel<Customer>(Builders<Customer>.IndexKeys.Ascending(c => c.CompanyId).Ascending(c => c.Phone))
            });
        }
        catch (Exception ex) { Console.WriteLine($"Index warning (customers): {ex.Message}"); }

        try
        {
            // Invoices indexes
            var invoicesCollection = database.GetCollection<Invoice>("invoices");
            await invoicesCollection.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<Invoice>(Builders<Invoice>.IndexKeys.Ascending(i => i.CompanyId).Ascending(i => i.SaleId)),
                new CreateIndexModel<Invoice>(
                    Builders<Invoice>.IndexKeys.Ascending(i => i.CompanyId).Ascending(i => i.Number),
                    new CreateIndexOptions { Unique = true }
                ),
                new CreateIndexModel<Invoice>(Builders<Invoice>.IndexKeys.Ascending(i => i.CompanyId).Ascending(i => i.Status))
            });
        }
        catch (Exception ex) { Console.WriteLine($"Index warning (invoices): {ex.Message}"); }

        try
        {
            // Users indexes
            var usersCollection = database.GetCollection<User>("users");
            await usersCollection.Indexes.CreateManyAsync(new[]
            {
                new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.Email), new CreateIndexOptions { Unique = true }),
                new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.CompanyId))
            });
        }
        catch (Exception ex) { Console.WriteLine($"Index warning (users): {ex.Message}"); }

        try
        {
            // Companies indexes
            var companiesCollection = database.GetCollection<Company>("companies");
            await companiesCollection.Indexes.CreateOneAsync(new CreateIndexModel<Company>(Builders<Company>.IndexKeys.Ascending(c => c.Name)));
        }
        catch (Exception ex) { Console.WriteLine($"Index warning (companies): {ex.Message}"); }
    }
}
