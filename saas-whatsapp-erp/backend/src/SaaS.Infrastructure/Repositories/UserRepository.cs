using MongoDB.Driver;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Infrastructure.Configuration;

namespace SaaS.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _users = database.GetCollection<User>("users");

        // Crear índices
        var emailIndex = Builders<User>.IndexKeys.Ascending(u => u.Email);
        var emailIndexModel = new CreateIndexModel<User>(emailIndex, new CreateIndexOptions { Unique = true });
        
        var companyIndex = Builders<User>.IndexKeys.Ascending(u => u.CompanyId);
        var companyIndexModel = new CreateIndexModel<User>(companyIndex);

        _users.Indexes.CreateManyAsync(new[] { emailIndexModel, companyIndexModel });
    }

    public async Task<User> CreateAsync(User user)
    {
        await _users.InsertOneAsync(user);
        return user;
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
    }

    public async Task<List<User>> GetByCompanyIdAsync(string companyId)
    {
        return await _users.Find(u => u.CompanyId == companyId).ToListAsync();
    }
}
