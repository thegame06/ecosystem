using MongoDB.Driver;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Infrastructure.Configuration;

namespace SaaS.Infrastructure.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly IMongoCollection<Invoice> _invoices;

    public InvoiceRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _invoices = database.GetCollection<Invoice>("invoices");

        // Crear índices
        CreateIndexes();
    }

    private void CreateIndexes()
    {
        var indexModels = new[]
        {
            new CreateIndexModel<Invoice>(
                Builders<Invoice>.IndexKeys.Ascending(i => i.CompanyId)),
            new CreateIndexModel<Invoice>(
                Builders<Invoice>.IndexKeys.Ascending(i => i.SaleId)),
            new CreateIndexModel<Invoice>(
                Builders<Invoice>.IndexKeys.Ascending(i => i.Number)),
            new CreateIndexModel<Invoice>(
                Builders<Invoice>.IndexKeys.Combine(
                    Builders<Invoice>.IndexKeys.Ascending(i => i.CompanyId),
                    Builders<Invoice>.IndexKeys.Ascending(i => i.Number)),
                new CreateIndexOptions { Unique = true })
        };

        _invoices.Indexes.CreateManyAsync(indexModels);
    }

    public async Task<Invoice> CreateAsync(Invoice invoice)
    {
        invoice.CreatedAt = DateTime.UtcNow;
        invoice.UpdatedAt = DateTime.UtcNow;
        await _invoices.InsertOneAsync(invoice);
        return invoice;
    }

    public async Task<Invoice?> GetByIdAsync(string id)
    {
        return await _invoices.Find(i => i.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Invoice>> GetByCompanyIdAsync(string companyId)
    {
        return await _invoices
            .Find(i => i.CompanyId == companyId)
            .SortByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<Invoice?> GetBySaleIdAsync(string saleId)
    {
        return await _invoices
            .Find(i => i.SaleId == saleId)
            .FirstOrDefaultAsync();
    }

    public async Task<Invoice?> GetByNumberAsync(string companyId, string number)
    {
        return await _invoices
            .Find(i => i.CompanyId == companyId && i.Number == number)
            .FirstOrDefaultAsync();
    }

    public async Task<Invoice> UpdateAsync(Invoice invoice)
    {
        invoice.UpdatedAt = DateTime.UtcNow;
        await _invoices.ReplaceOneAsync(i => i.Id == invoice.Id, invoice);
        return invoice;
    }
}
