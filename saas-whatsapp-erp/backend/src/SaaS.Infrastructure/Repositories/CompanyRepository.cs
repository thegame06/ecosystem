using MongoDB.Driver;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Infrastructure.Configuration;

namespace SaaS.Infrastructure.Repositories;

public class CompanyRepository : ICompanyRepository
{
    private readonly IMongoCollection<Company> _companies;

    public CompanyRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _companies = database.GetCollection<Company>("companies");

        // Crear índices
        var indexKeys = Builders<Company>.IndexKeys.Ascending(c => c.Name);
        var indexModel = new CreateIndexModel<Company>(indexKeys);
        _companies.Indexes.CreateOneAsync(indexModel);
    }

    public async Task<Company> CreateAsync(Company company)
    {
        await _companies.InsertOneAsync(company);
        return company;
    }

    public async Task<Company?> GetByIdAsync(string id)
    {
        return await _companies.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Company?> GetByNameAsync(string name)
    {
        return await _companies.Find(c => c.Name == name).FirstOrDefaultAsync();
    }
}
