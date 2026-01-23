namespace SaaS.Application.Interfaces;

/// <summary>
/// Generic repository interface for MongoDB entities
/// </summary>
public interface IMongoRepository<T> where T : class
{
    Task<T?> GetByIdAsync(string id);
    Task<List<T>> GetAllAsync();
    Task<T> CreateAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(string id);
}
