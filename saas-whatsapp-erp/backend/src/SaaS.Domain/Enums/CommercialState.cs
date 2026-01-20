namespace SaaS.Domain.Enums;

/// <summary>
/// Estados comerciales del flujo de ventas
/// </summary>
public enum CommercialState
{
    /// <summary>
    /// Cliente potencial, aún no ha comprado
    /// </summary>
    LEAD = 1,
    
    /// <summary>
    /// Venta creada pero no facturada
    /// </summary>
    SALE_CREATED = 2,
    
    /// <summary>
    /// Factura emitida
    /// </summary>
    INVOICED = 3,
    
    /// <summary>
    /// Factura pagada
    /// </summary>
    PAID = 4
}
