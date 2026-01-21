namespace SaaS.Application.DTOs.Common;

/// <summary>
/// Respuesta paginada estándar tipo OData
/// </summary>
public class ResponsePagination<T>
{
    /// <summary>
    /// Resultados de la página actual
    /// </summary>
    public List<T> Result { get; set; } = new();
    
    /// <summary>
    /// Número de registros omitidos ($skip)
    /// </summary>
    public int Page { get; set; }
    
    /// <summary>
    /// Cantidad de registros por página ($top)
    /// </summary>
    public int RowsPerPage { get; set; }
    
    /// <summary>
    /// Total de registros disponibles ($count)
    /// </summary>
    public long TotalRows { get; set; }
}
