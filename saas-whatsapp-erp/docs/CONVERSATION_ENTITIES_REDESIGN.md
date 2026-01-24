# 🔄 REDISEÑO DE ENTIDADES DE CONVERSACIÓN

**Fecha:** 2026-01-23  
**Problema:** Gaps críticos en tracking de mensajes y gestión del ciclo de vida de conversaciones  
**Estado:** PROPUESTA DE MEJORA  

---

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. **Falta de Tracking de Mensajes**
**Problema actual:**
- Solo se guarda `lastMessage` en la conversación
- No hay historial de mensajes enviados/recibidos
- No hay relación con documentos enviados (facturas, órdenes)
- Imposible hacer búsquedas históricas

### 2. **Gestión de Estado de Conversaciones**
**Problema actual:**
- No hay lógica clara de apertura/cierre automático
- Una vez facturada, no se pregunta si cerrar la conversación
- Cliente puede seguir escribiendo en la misma conversación sin crear nueva venta

### 3. **Falta de Trazabilidad Bidireccional**
**Problema actual:**
- Sistema no puede mostrar qué facturas/órdenes se enviaron en cada conversación
- Cliente no puede ver historial completo de sus órdenes
- No hay relación entre archivos enviados y conversaciones

---

## ✅ PROPUESTA DE MEJORA

### 🆕 NUEVA ENTIDAD: ConversationMessage

```csharp
public class ConversationMessage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// ID de la conversación a la que pertenece
    /// </summary>
    [BsonElement("conversationId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string ConversationId { get; set; } = string.Empty;

    /// <summary>
    /// ID de la empresa (Multi-tenant)
    /// </summary>
    [BsonElement("companyId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CompanyId { get; set; } = string.Empty;

    /// <summary>
    /// Dirección del mensaje: INBOUND (del cliente) | OUTBOUND (de la empresa)
    /// </summary>
    [BsonElement("direction")]
    [BsonRepresentation(BsonType.String)]
    public MessageDirection Direction { get; set; }

    /// <summary>
    /// Tipo de mensaje: TEXT | IMAGE | DOCUMENT | AUDIO | VIDEO | TEMPLATE
    /// </summary>
    [BsonElement("messageType")]
    [BsonRepresentation(BsonType.String)]
    public MessageType MessageType { get; set; }

    /// <summary>
    /// Contenido del mensaje (texto)
    /// </summary>
    [BsonElement("content")]
    public string? Content { get; set; }

    /// <summary>
    /// URL del archivo adjunto (si aplica)
    /// </summary>
    [BsonElement("mediaUrl")]
    public string? MediaUrl { get; set; }

    /// <summary>
    /// Nombre del archivo adjunto
    /// </summary>
    [BsonElement("fileName")]
    public string? FileName { get; set; }

    /// <summary>
    /// ID de WhatsApp del mensaje
    /// </summary>
    [BsonElement("whatsAppMessageId")]
    public string? WhatsAppMessageId { get; set; }

    /// <summary>
    /// Estado del mensaje: SENT | DELIVERED | READ | FAILED
    /// </summary>
    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public MessageStatus Status { get; set; } = MessageStatus.SENT;

    /// <summary>
    /// ID de la venta relacionada (si el mensaje es sobre una venta específica)
    /// </summary>
    [BsonElement("relatedSaleId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? RelatedSaleId { get; set; }

    /// <summary>
    /// ID de la factura relacionada (si el mensaje incluye una factura)
    /// </summary>
    [BsonElement("relatedInvoiceId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? RelatedInvoiceId { get; set; }

    /// <summary>
    /// Indica si es un mensaje automático del sistema
    /// </summary>
    [BsonElement("isAutomatic")]
    public bool IsAutomatic { get; set; } = false;

    /// <summary>
    /// ID del usuario que envió el mensaje (para OUTBOUND)
    /// </summary>
    [BsonElement("sentByUserId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? SentByUserId { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("readAt")]
    public DateTime? ReadAt { get; set; }
}
```

### 🔄 CONVERSACIÓN ACTUALIZADA

```csharp
public class Conversation
{
    // ... campos existentes ...

    /// <summary>
    /// Estado de la conversación: ACTIVE | CLOSED | ARCHIVED
    /// </summary>
    [BsonElement("conversationStatus")]
    [BsonRepresentation(BsonType.String)]
    public ConversationStatus ConversationStatus { get; set; } = ConversationStatus.ACTIVE;

    /// <summary>
    /// Fecha de cierre de la conversación
    /// </summary>
    [BsonElement("closedAt")]
    public DateTime? ClosedAt { get; set; }

    /// <summary>
    /// Motivo de cierre: SALE_COMPLETED | CUSTOMER_INACTIVE | MANUAL_CLOSE
    /// </summary>
    [BsonElement("closeReason")]
    [BsonRepresentation(BsonType.String)]
    public ConversationCloseReason? CloseReason { get; set; }

    /// <summary>
    /// ID de la venta que causó el cierre (si aplica)
    /// </summary>
    [BsonElement("closingRationalSaleId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ClosingRationalSaleId { get; set; }

    /// <summary>
    /// Contador de mensajes no leídos por el equipo
    /// </summary>
    [BsonElement("unreadCount")]
    public int UnreadCount { get; set; } = 0;

    /// <summary>
    /// Número secuencial de la conversación para este cliente
    /// </summary>
    [BsonElement("conversationNumber")]
    public int ConversationNumber { get; set; } = 1;
}
```

### 🆕 NUEVOS ENUMS

```csharp
public enum MessageDirection
{
    INBOUND = 1,   // Del cliente hacia la empresa
    OUTBOUND = 2   // De la empresa hacia el cliente
}

public enum MessageType
{
    TEXT = 1,
    IMAGE = 2,
    DOCUMENT = 3,
    AUDIO = 4,
    VIDEO = 5,
    TEMPLATE = 6,   // Plantilla de WhatsApp Business
    LOCATION = 7,
    CONTACT = 8
}

public enum MessageStatus
{
    SENT = 1,      // Enviado
    DELIVERED = 2, // Entregado
    READ = 3,      // Leído
    FAILED = 4     // Falló el envío
}

public enum ConversationStatus
{
    ACTIVE = 1,    // Conversación activa
    CLOSED = 2,    // Cerrada pero puede reactivarse
    ARCHIVED = 3   // Archivada (histórica)
}

public enum ConversationCloseReason
{
    SALE_COMPLETED = 1,      // Venta completada y facturada
    CUSTOMER_INACTIVE = 2,   // Cliente no responde por X tiempo
    MANUAL_CLOSE = 3,        // Cerrada manualmente por el equipo
    CUSTOMER_REQUESTED = 4   // Cliente pidió terminar
}
```

---

## 🔄 FLUJO DE GESTIÓN MEJORADO

### **Apertura de Conversación**

```csharp
// Cuando llega un mensaje de WhatsApp
public async Task<Conversation> GetOrCreateActiveConversation(string customerId, string customerPhone)
{
    // Buscar conversación activa existente
    var activeConversation = await _conversationRepository
        .GetActiveConversationByCustomer(customerId);
    
    if (activeConversation != null)
        return activeConversation;
    
    // Si no hay activa, crear nueva
    var conversationNumber = await GetNextConversationNumber(customerId);
    
    var newConversation = new Conversation
    {
        CompanyId = GetCurrentCompanyId(),
        CustomerId = customerId,
        CustomerPhone = customerPhone,
        ConversationStatus = ConversationStatus.ACTIVE,
        ConversationNumber = conversationNumber,
        LastState = CommercialState.LEAD
    };
    
    return await _conversationRepository.CreateAsync(newConversation);
}
```

### **Cierre Automático por Venta Facturada**

```csharp
// Cuando una venta se marca como PAID (facturada)
public async Task<ConversationClosePrompt> OnSalePaid(string saleId)
{
    var sale = await _saleRepository.GetByIdAsync(saleId);
    var conversation = await _conversationRepository
        .GetActiveConversationByCustomer(sale.CustomerId);
    
    if (conversation == null) 
        return null;
    
    // Crear prompt para el usuario
    return new ConversationClosePrompt
    {
        ConversationId = conversation.Id,
        SaleId = saleId,
        CustomerName = await GetCustomerName(sale.CustomerId),
        Message = $"La venta #{sale.Number} ha sido pagada. ¿Deseas cerrar la conversación con {customerName}? Si la cierras, el próximo mensaje del cliente iniciará una nueva conversación.",
        AutoCloseInHours = 24 // Se cierra automáticamente en 24h si no responde
    };
}
```

### **Tracking de Mensajes con Archivos**

```csharp
// Cuando se envía una factura por WhatsApp
public async Task SendInvoiceToCustomer(string conversationId, string invoiceId)
{
    var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
    var pdfUrl = await _invoiceService.GeneratePdfUrl(invoiceId);
    
    // Enviar a WhatsApp
    var whatsAppResult = await _whatsAppService.SendDocument(
        conversationId, 
        pdfUrl, 
        $"Factura #{invoice.Number}.pdf"
    );
    
    // Guardar mensaje con relación
    var message = new ConversationMessage
    {
        ConversationId = conversationId,
        Direction = MessageDirection.OUTBOUND,
        MessageType = MessageType.DOCUMENT,
        Content = $"Factura #{invoice.Number}",
        MediaUrl = pdfUrl,
        FileName = $"Factura_{invoice.Number}.pdf",
        RelatedInvoiceId = invoiceId,
        RelatedSaleId = invoice.SaleId,
        WhatsAppMessageId = whatsAppResult.MessageId,
        IsAutomatic = true
    };
    
    await _messageRepository.CreateAsync(message);
    
    // Actualizar conversación
    await UpdateConversationLastActivity(conversationId);
}
```

---

## 🔍 BÚSQUEDAS Y REPORTES MEJORADOS

### **Historial por Cliente**

```csharp
public async Task<CustomerConversationHistory> GetCustomerHistory(string customerId)
{
    var conversations = await _conversationRepository
        .GetConversationsByCustomer(customerId);
    
    var history = new CustomerConversationHistory
    {
        CustomerId = customerId,
        Conversations = new List<ConversationSummary>()
    };
    
    foreach (var conv in conversations)
    {
        var messages = await _messageRepository
            .GetMessagesByConversation(conv.Id);
        
        var relatedSales = messages
            .Where(m => m.RelatedSaleId != null)
            .Select(m => m.RelatedSaleId)
            .Distinct()
            .ToList();
        
        var relatedInvoices = messages
            .Where(m => m.RelatedInvoiceId != null)
            .Select(m => m.RelatedInvoiceId)
            .Distinct()
            .ToList();
        
        history.Conversations.Add(new ConversationSummary
        {
            ConversationId = conv.Id,
            ConversationNumber = conv.ConversationNumber,
            StartDate = conv.CreatedAt,
            EndDate = conv.ClosedAt,
            Status = conv.ConversationStatus,
            MessageCount = messages.Count,
            RelatedSaleIds = relatedSales,
            RelatedInvoiceIds = relatedInvoices
        });
    }
    
    return history;
}
```

### **Búsqueda de Conversaciones por Factura**

```csharp
public async Task<List<ConversationMessage>> GetMessagesByInvoice(string invoiceId)
{
    return await _messageRepository
        .GetMessagesByRelatedInvoice(invoiceId);
}

public async Task<List<ConversationMessage>> GetMessagesBySale(string saleId)
{
    return await _messageRepository
        .GetMessagesByRelatedSale(saleId);
}
```

---

## 📱 MEJORAS EN FRONTEND

### **Nueva Página: Historial de Cliente**

```typescript
interface CustomerConversationHistory {
    customerId: string;
    customerName: string;
    conversations: ConversationSummary[];
}

interface ConversationSummary {
    conversationId: string;
    conversationNumber: number;
    startDate: string;
    endDate?: string;
    status: ConversationStatus;
    messageCount: number;
    relatedSaleIds: string[];
    relatedInvoiceIds: string[];
    lastMessage?: string;
}
```

### **Modal de Cierre de Conversación**

```typescript
interface ConversationClosePrompt {
    conversationId: string;
    saleId: string;
    customerName: string;
    message: string;
    autoCloseInHours: number;
}

// Componente que aparece después de marcar venta como PAID
const ConversationCloseModal: React.FC<{prompt: ConversationClosePrompt}> = ({prompt}) => {
    const handleCloseConversation = async () => {
        await conversationService.closeConversation(prompt.conversationId, {
            reason: ConversationCloseReason.SALE_COMPLETED,
            relatedSaleId: prompt.saleId
        });
        // Refresh conversations list
    };
    
    const handleKeepOpen = async () => {
        await conversationService.markAsKeptOpen(prompt.conversationId);
    };
    
    return (
        <Modal title="¿Cerrar Conversación?">
            <p>{prompt.message}</p>
            <div className="flex gap-4">
                <Button onClick={handleCloseConversation} variant="primary">
                    Cerrar Conversación
                </Button>
                <Button onClick={handleKeepOpen} variant="secondary">
                    Mantener Abierta
                </Button>
            </div>
        </Modal>
    );
};
```

### **Vista de Mensajes con Archivos Relacionados**

```typescript
const MessageThread: React.FC<{conversationId: string}> = ({conversationId}) => {
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    
    const renderMessage = (message: ConversationMessage) => (
        <div className={`message ${message.direction}`}>
            <div className="content">{message.content}</div>
            
            {message.relatedSaleId && (
                <div className="related-sale">
                    📋 Relacionado con Venta #{message.relatedSaleId.slice(-6)}
                    <Link to={`/sales/${message.relatedSaleId}`}>Ver Detalle</Link>
                </div>
            )}
            
            {message.relatedInvoiceId && (
                <div className="related-invoice">
                    📄 Factura adjunta
                    <Button onClick={() => downloadInvoice(message.relatedInvoiceId!)}>
                        Descargar PDF
                    </Button>
                </div>
            )}
            
            {message.mediaUrl && (
                <div className="attachment">
                    📎 {message.fileName}
                    <a href={message.mediaUrl} target="_blank">Abrir</a>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="message-thread">
            {messages.map(renderMessage)}
        </div>
    );
};
```

---

## 🗄️ ÍNDICES DE MONGO DB

```javascript
// Colección: conversationMessages
db.conversationMessages.createIndex({ "companyId": 1, "conversationId": 1 });
db.conversationMessages.createIndex({ "companyId": 1, "createdAt": -1 });
db.conversationMessages.createIndex({ "relatedSaleId": 1 });
db.conversationMessages.createIndex({ "relatedInvoiceId": 1 });
db.conversationMessages.createIndex({ "companyId": 1, "direction": 1, "createdAt": -1 });

// Colección: conversations (actualizada)
db.conversations.createIndex({ "companyId": 1, "customerId": 1, "conversationStatus": 1 });
db.conversations.createIndex({ "companyId": 1, "conversationStatus": 1, "lastActivityAt": -1 });
db.conversations.createIndex({ "closingRationalSaleId": 1 });
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### **Fase 1: Entidades y Repositorios (1-2 días)**
- [ ] Crear `ConversationMessage` entity
- [ ] Crear nuevos enums
- [ ] Actualizar `Conversation` entity
- [ ] Crear `ConversationMessageRepository`
- [ ] Actualizar `ConversationRepository`

### **Fase 2: Lógica de Negocio (2-3 días)**
- [ ] Implementar flujo de apertura/cierre automático
- [ ] Crear servicio de tracking de mensajes
- [ ] Implementar envío de archivos con relaciones
- [ ] Crear queries de búsqueda histórica

### **Fase 3: APIs (1 día)**
- [ ] Actualizar `ConversationsController`
- [ ] Crear `ConversationMessagesController`
- [ ] Crear DTOs para nuevas funcionalidades

### **Fase 4: Frontend (2-3 días)**
- [ ] Actualizar tipos TypeScript
- [ ] Crear modal de cierre de conversación
- [ ] Implementar vista de historial de mensajes
- [ ] Agregar búsqueda de conversaciones por factura/venta

### **Fase 5: Migración de Datos (1 día)**
- [ ] Migrar conversaciones existentes
- [ ] Establecer números de conversación
- [ ] Crear mensajes históricos básicos

---

## 🎯 BENEFICIOS ESPERADOS

### **Para el Negocio**
- **Trazabilidad completa** de todas las interacciones con clientes
- **Ciclo de vida claro** de conversaciones (abierta → venta → facturada → cerrada)
- **Búsqueda eficiente** de conversaciones por factura o venta
- **Análisis mejorado** del comportamiento del cliente

### **Para el Usuario**
- **Historial completo** de todas sus compras y comunicaciones
- **Acceso directo** a facturas y órdenes desde WhatsApp
- **Nueva conversación** automática después de cada venta completada

### **Para el Equipo de Ventas**
- **Contexto completo** en cada interacción
- **Relación clara** entre mensajes y documentos
- **Automatización** del cierre de conversaciones
- **Reportes detallados** de interacciones

---

**Prioridad:** 🔥 **ALTA** - Crítico para operación omnicanal  
**Esfuerzo:** 📅 **7-10 días** de desarrollo  
**Impacto:** 📈 **ALTO** - Mejora significativa en trazabilidad y UX