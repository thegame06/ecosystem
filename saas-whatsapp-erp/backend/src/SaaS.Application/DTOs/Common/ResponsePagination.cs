using System;

namespace SaaS.Application.DTOs.Common;

/// <summary>
/// Respuesta paginada estándar tipo OData
/// </summary>
public class ResponsePagination<T>
{
    /// <summary>
    /// Resultados de la página actual
    /// </summary>
    public List<T> Items { get; set; } = new();
    
    /// <summary>
    /// Número de registros omitidos ($skip) / número de página actual
    /// </summary>
    public int PageNumber { get; set; }
    
    /// <summary>
    /// Cantidad de registros por página ($top)
    /// </summary>
    public int RowsPerPage { get; set; }
    
    /// <summary>
    /// Total de registros disponibles ($count)
    /// </summary>
    public long TotalCount { get; set; }

    public int TotalPages => RowsPerPage > 0 ? (int)Math.Ceiling((double)TotalCount / RowsPerPage) : 0;
    public bool HasNextPage => PageNumber * RowsPerPage < TotalCount;
    public bool HasPreviousPage => PageNumber > 1;
}
