namespace SaaS.Domain.Enums;

/// <summary>
/// Payment methods available for sales
/// </summary>
public enum PaymentMethod
{
    /// <summary>
    /// Cash payment (Efectivo)
    /// </summary>
    Cash = 1,
    
    /// <summary>
    /// Bank transfer (Transferencia)
    /// </summary>
    Transfer = 2,
    
    /// <summary>
    /// Credit/Debit card (Tarjeta)
    /// </summary>
    Card = 3
}
