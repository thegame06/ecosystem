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

    public async Task<List<Company>> GetAllAsync()
    {
        return await _companies.Find(_ => true).ToListAsync();
    }

    public async Task<Company?> GetByPhoneNumberIdAsync(string phoneNumberId)
    {
        return await _companies.Find(c => c.WhatsAppSettings != null && c.WhatsAppSettings.PhoneNumberId == phoneNumberId).FirstOrDefaultAsync();
    }

    public async Task UpdateAsync(Company company)
    {
        await _companies.ReplaceOneAsync(c => c.Id == company.Id, company);
    }

    public async Task UpdatePlanAsync(string companyId, SaaS.Domain.Enums.PlanType plan)
    {
        var update = Builders<Company>.Update.Set(c => c.Plan, plan);
        await _companies.UpdateOneAsync(c => c.Id == companyId, update);
    }
}
