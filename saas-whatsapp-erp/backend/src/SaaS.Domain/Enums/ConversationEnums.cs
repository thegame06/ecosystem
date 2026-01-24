namespace SaaS.Domain.Enums;

/// <summary>
/// Dirección del mensaje en una conversación
/// </summary>
public enum MessageDirection
{
    /// <summary>
    /// Mensaje del cliente hacia la empresa
    /// </summary>
    INBOUND = 1,
    
    /// <summary>
    /// Mensaje de la empresa hacia el cliente
    /// </summary>
    OUTBOUND = 2
}

/// <summary>
/// Tipo de mensaje en WhatsApp
/// </summary>
public enum MessageType
{
    TEXT = 1,
    IMAGE = 2,
    DOCUMENT = 3,
    AUDIO = 4,
    VIDEO = 5,
    TEMPLATE = 6,    // Plantilla de WhatsApp Business
    LOCATION = 7,
    CONTACT = 8
}

/// <summary>
/// Estado del mensaje
/// </summary>
public enum MessageStatus
{
    SENT = 1,        // Enviado
    DELIVERED = 2,   // Entregado
    READ = 3,        // Leído
    FAILED = 4       // Falló el envío
}

/// <summary>
/// Estado de la conversación
/// </summary>
public enum ConversationStatus
{
    ACTIVE = 1,      // Conversación activa
    CLOSED = 2,      // Cerrada pero puede reactivarse
    ARCHIVED = 3     // Archivada (histórica)
}

/// <summary>
/// Motivo de cierre de conversación
/// </summary>
public enum ConversationCloseReason
{
    SALE_COMPLETED = 1,      // Venta completada y facturada
    CUSTOMER_INACTIVE = 2,   // Cliente no responde por X tiempo
    MANUAL_CLOSE = 3,        // Cerrada manualmente por el equipo
    CUSTOMER_REQUESTED = 4   // Cliente pidió terminar
}