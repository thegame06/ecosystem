using MongoDB.Driver;
using SaaS.Application.Interfaces;
using SaaS.Infrastructure.Configuration;

namespace SaaS.Infrastructure.Repositories;

/// <summary>
/// Generic MongoDB repository implementation
/// </summary>
public class MongoRepository<T> : IMongoRepository<T> where T : class
{
    protected readonly IMongoCollection<T> _collection;

    public MongoRepository(IMongoClient mongoClient, MongoDbSettings settings)
    {
        var database = mongoClient.GetDatabase(settings.DatabaseName);
        _collection = database.GetCollection<T>(GetCollectionName());
    }

    public virtual async Task<T?> GetByIdAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("_id", MongoDB.Bson.ObjectId.Parse(id));
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public virtual async Task<List<T>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }

    public virtual async Task<T> CreateAsync(T entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public virtual async Task<T> UpdateAsync(T entity)
    {
        var idProperty = typeof(T).GetProperty("Id");
        if (idProperty == null)
            throw new InvalidOperationException($"Type {typeof(T).Name} does not have an Id property");
        
        var id = idProperty.GetValue(entity)?.ToString();
        if (string.IsNullOrEmpty(id))
            throw new InvalidOperationException("Entity Id cannot be null or empty");

        var filter = Builders<T>.Filter.Eq("_id", MongoDB.Bson.ObjectId.Parse(id));
        await _collection.ReplaceOneAsync(filter, entity);
        return entity;
    }

    public virtual async Task DeleteAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("_id", MongoDB.Bson.ObjectId.Parse(id));
        await _collection.DeleteOneAsync(filter);
    }

    private static string GetCollectionName()
    {
        var type = typeof(T);
        return type.Name.ToLowerInvariant() + "s";
    }
}
