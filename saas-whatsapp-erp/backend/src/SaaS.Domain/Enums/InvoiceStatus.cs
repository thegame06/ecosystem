namespace SaaS.Domain.Enums;

/// <summary>
/// Estados de una factura
/// </summary>
public enum InvoiceStatus
{
    /// <summary>
    /// Borrador, aún no emitida
    /// </summary>
    Draft = 1,
    
    /// <summary>
    /// Emitida
    /// </summary>
    Issued = 2,
    
    /// <summary>
    /// Enviada al cliente
    /// </summary>
    Sent = 3,
    
    /// <summary>
    /// Pagada
    /// </summary>
    Paid = 4,
    
    /// <summary>
    /// Cancelada
    /// </summary>
    Cancelled = 5
}
