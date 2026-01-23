namespace SaaS.Application.DTOs.Common;

/// <summary>
/// Generic API response wrapper for consistent response structure
/// </summary>
/// <typeparam name="T">Type of data being returned</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// The actual data payload. Can be null if no data is available.
    /// </summary>
    public T? Data { get; set; }
    
    /// <summary>
    /// Indicates if the operation was successful
    /// </summary>
    public bool Success { get; set; }
    
    /// <summary>
    /// Optional message providing additional context
    /// </summary>
    public string? Message { get; set; }
    
    /// <summary>
    /// Optional error details if Success is false
    /// </summary>
    public string[]? Errors { get; set; }
}
