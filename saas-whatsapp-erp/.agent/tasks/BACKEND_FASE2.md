# 🎯 TAREA BACKEND - FASE 2

**Asignado a**: @backend  
**Prioridad**: 🔴 ALTA  
**Tiempo estimado**: 2 semanas  
**Dependencias**: Ninguna (puede iniciar inmediatamente)

---

## 📋 OBJETIVO

Completar los **4 controllers core** y **3 servicios de negocio** para que el frontend pueda consumir la API completa y demostrar el flujo comercial.

---

## ✅ TAREAS

### **1. CustomersController** (2 días)

**Endpoints requeridos**:
```
GET    /api/customers           - Listar clientes de la empresa
GET    /api/customers/{id}      - Obtener cliente por ID
POST   /api/customers           - Crear cliente
PUT    /api/customers/{id}      - Actualizar cliente
DELETE /api/customers/{id}      - Eliminar cliente (soft delete)
GET    /api/customers/{id}/sales - Historial de ventas del cliente
```

**DTOs necesarios**:
- `CreateCustomerRequest`
- `UpdateCustomerRequest`
- `CustomerResponse`
- `CustomerDetailResponse` (con ventas, facturas, conversaciones)

**Validaciones**:
- Teléfono único por empresa
- Nombre requerido
- CompanyId del token JWT

---

### **2. SalesController** (3 días)

**Endpoints requeridos**:
```
GET    /api/sales              - Listar ventas de la empresa
GET    /api/sales/{id}         - Obtener venta por ID
POST   /api/sales              - Crear venta (POS)
PUT    /api/sales/{id}         - Actualizar venta
GET    /api/sales/{id}/invoice - Obtener factura de la venta
```

**DTOs necesarios**:
- `CreateSaleRequest`
  - CustomerId
  - Items[] (ProductId, Quantity, UnitPrice)
- `UpdateSaleRequest`
- `SaleResponse`
- `SaleItemDto`

**Lógica de negocio**:
- Calcular subtotal, impuestos, total
- Validar que productos existen
- Validar stock si `TrackInventory = true`
- Actualizar estado comercial del cliente

---

### **3. InvoicesController** (3 días)

**Endpoints requeridos**:
```
GET    /api/invoices           - Listar facturas de la empresa
GET    /api/invoices/{id}      - Obtener factura por ID
POST   /api/invoices           - Generar factura desde venta
PUT    /api/invoices/{id}/status - Cambiar estado (Issued, Sent, Paid)
GET    /api/invoices/{id}/pdf  - Descargar PDF
POST   /api/invoices/{id}/send-whatsapp - Enviar por WhatsApp
```

**DTOs necesarios**:
- `CreateInvoiceRequest` (SaleId)
- `UpdateInvoiceStatusRequest`
- `InvoiceResponse`

**Lógica de negocio**:
- Generar número secuencial único por empresa
- Copiar items desde la venta
- Cambiar estado de venta a `INVOICED`
- Actualizar estado comercial del cliente

---

### **4. ConversationsController** (2 días)

**Endpoints requeridos**:
```
GET    /api/conversations      - Listar conversaciones de la empresa
GET    /api/conversations/{id} - Obtener conversación por ID
POST   /api/conversations      - Crear conversación
PUT    /api/conversations/{id} - Actualizar conversación
GET    /api/conversations/{id}/customer - Obtener cliente de la conversación
```

**DTOs necesarios**:
- `CreateConversationRequest`
- `UpdateConversationRequest`
- `ConversationResponse`
- `ConversationDetailResponse` (con cliente, última venta, última factura)

**Lógica de negocio**:
- Crear cliente automáticamente si no existe (por teléfono)
- Actualizar `UpdatedAt` al recibir mensaje
- Marcar mensajes como leídos

---

### **5. SaleService** (2 días)

**Responsabilidades**:
- Calcular totales (subtotal, impuestos, total)
- Validar stock de productos
- Actualizar stock si `TrackInventory = true`
- Actualizar estado comercial del cliente a `SALE_CREATED`

**Métodos**:
```csharp
Task<Sale> CreateSaleAsync(CreateSaleRequest request, string companyId, string userId);
Task<SaleCalculation> CalculateTotalsAsync(List<SaleItemDto> items, string companyId);
Task ValidateStockAsync(List<SaleItemDto> items, string companyId);
Task UpdateCustomerStateAsync(string customerId, CommercialState newState);
```

---

### **6. InvoiceService** (2 días)

**Responsabilidades**:
- Generar número de factura secuencial único
- Crear factura desde venta
- Cambiar estados de factura
- Actualizar estado comercial del cliente

**Métodos**:
```csharp
Task<Invoice> CreateInvoiceFromSaleAsync(string saleId, string companyId);
Task<string> GenerateInvoiceNumberAsync(string companyId);
Task<Invoice> UpdateInvoiceStatusAsync(string invoiceId, InvoiceStatus newStatus);
Task<byte[]> GenerateInvoicePdfAsync(string invoiceId);
```

---

### **7. Validaciones con FluentValidation** (1 día)

**Validators necesarios**:
- `CreateCustomerRequestValidator`
- `CreateSaleRequestValidator`
- `CreateInvoiceRequestValidator`

**Reglas comunes**:
- Campos requeridos no vacíos
- Emails válidos
- Teléfonos con formato correcto
- Precios > 0
- Cantidades > 0

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### **Funcionales**
- ✅ Todos los endpoints responden correctamente
- ✅ Multi-tenancy verificado en cada operación
- ✅ Cálculos de totales correctos
- ✅ Números de factura únicos por empresa
- ✅ Estados comerciales se actualizan correctamente

### **Técnicos**
- ✅ Código sigue Clean Architecture
- ✅ DTOs bien definidos
- ✅ Validaciones con FluentValidation
- ✅ Manejo de errores consistente
- ✅ Swagger documentado

### **Seguridad**
- ✅ JWT requerido en todos los endpoints
- ✅ CompanyId verificado en cada operación
- ✅ Retorna 403 Forbid si recurso no pertenece a la empresa
- ✅ No hay SQL injection (MongoDB)

---

## 📊 ENTREGABLES

1. **Controllers** (4 archivos):
   - `CustomersController.cs`
   - `SalesController.cs`
   - `InvoicesController.cs`
   - `ConversationsController.cs`

2. **Servicios** (2 archivos):
   - `SaleService.cs`
   - `InvoiceService.cs`

3. **DTOs** (12+ archivos):
   - Carpetas: `DTOs/Customers/`, `DTOs/Sales/`, `DTOs/Invoices/`, `DTOs/Conversations/`

4. **Validators** (3 archivos):
   - `Validators/CreateCustomerRequestValidator.cs`
   - `Validators/CreateSaleRequestValidator.cs`
   - `Validators/CreateInvoiceRequestValidator.cs`

5. **Interfaces** (2 archivos):
   - `ISaleService.cs`
   - `IInvoiceService.cs`

6. **Tests** (opcional pero recomendado):
   - Tests unitarios de servicios
   - Tests de integración de controllers

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

```
DÍA 1-2:   CustomersController + DTOs
DÍA 3-4:   SaleService + Validaciones
DÍA 5-7:   SalesController + DTOs
DÍA 8-9:   InvoiceService
DÍA 10-12: InvoicesController + DTOs
DÍA 13-14: ConversationsController + Ajustes finales
```

---

## 🔗 INTEGRACIÓN CON FRONTEND

Una vez completado, el frontend podrá:
1. ✅ Listar y crear clientes
2. ✅ Crear ventas desde POS
3. ✅ Generar facturas desde ventas
4. ✅ Ver conversaciones de WhatsApp
5. ✅ Demostrar flujo completo: WhatsApp → Venta → Factura

---

## 📝 NOTAS IMPORTANTES

1. **Multi-Tenancy**: SIEMPRE verificar `CompanyId` del token
2. **Cálculos**: Usar `decimal` para dinero, nunca `float`
3. **Estados**: Actualizar estados comerciales del cliente
4. **Números de factura**: Usar secuencia atómica de MongoDB
5. **Validaciones**: FluentValidation antes de lógica de negocio

---

**Asignado por**: Agente Orquestador  
**Fecha límite**: 2 semanas desde inicio  
**Revisión**: Al completar cada controller
