# MVP ARCHITECTURE – WhatsApp-First Sales SaaS (MongoDB)

## Objetivo
Construir un MVP vendible en semanas, usando MongoDB Free Tier,
permitiendo a las PYMEs vender, facturar y comunicarse por WhatsApp,
sin bloquear la evolución al modelo unicornio.

---

## 1️⃣ Principio fundador

Arquitectura simple, clara y disciplinada.  
MongoDB se usa como base de datos de documentos,  
**NO como un cajón sin reglas**.

El MVP prioriza:
- Flujo real de ventas
- Cálculos correctos de dinero
- Costos controlados
- Simplicidad operativa

---

## 2️⃣ Stack definitivo del MVP

### Backend
- .NET 10 (or latest LTS available in workspace)
- ASP.NET Web API
- Clean Architecture (ligera)
- MongoDB Atlas (Free Tier)
- MongoDB Driver oficial

### Frontend
- React
- TypeScript

### Infra
- 1 backend
- 1 MongoDB cluster (free)
- 1 frontend
- Un solo deploy

---

## 3️⃣ Estructura backend (monolito modular)

```text
/backend
└── src
    ├── Api
    │   ├── Controllers
    │   └── Program.cs
    │
    ├── Application
    │   ├── UseCases
    │   ├── DTOs
    │   └── Interfaces
    │
    ├── Domain
    │   ├── Documents
    │   ├── Enums
    │   └── ValueObjects
    │
    └── Infrastructure
        ├── Mongo
        ├── Repositories
        └── Integrations


```text
/frontend
 ├── src
 │   ├── pages
 │   │   ├── WhatsApp
 │   │   ├── Sales
 │   │   ├── Invoices
 │   │   └── Settings
 │   │
 │   ├── components
 │   ├── services (API)
 │   └── auth

```

---

## 4️⃣ MODELO DE DATOS (DOCUMENTOS)

### Company (colección: companies)
- `_id`
- `name`
- `country`
- `taxRate`                // IVA %
- `isTaxEnabled`           // permite ventas/facturas sin IVA
- `invoiceSequence`
- `plan`                   // Starter | Pro | Growth
- `billingCycleStart`      // inicio del ciclo de límites
- `createdAt`

**Índices**: `name`, `country`

---

### User (users)
- `_id`
- `companyId`
- `email`
- `passwordHash`
- `role`                   // Admin | Seller
- `createdAt`

**Índices**: `companyId`, `email` (unique)

---

### Customer (customers)
- `_id`
- `companyId`
- `name`
- `phones[]`               // WhatsApp principal primero
- `taxId` (opcional)
- `whatsappConsent`        // true / false
- `currentState`
- `createdAt`

**Índices**: `companyId`, `phones`

---

### Conversation (conversations)
- `_id`
- `companyId`
- `customerId`
- `channel` (WhatsApp)
- `lastMessage`
- `lastState`
- `updatedAt`

**Índices**: `companyId`, `customerId`, `updatedAt`

---

### Product (products)
- `_id`
- `companyId`
- `name`
- `basePrice`              // precio por unidad
- `unit`                   // Unit, Hour, Day, Kg, etc
- `isTaxable`              // true / false
- `allowDiscount`          // true / false
- `type`                   // Tangible | Service | Rental
- `isActive`
- `createdAt`

**Índices**: `companyId`, `name`

---

### Sale (sales)
- `_id`
- `companyId`
- `customerId`
- `items[]`
- `subtotal`
- `taxTotal`
- `total`
- `state`
- `createdAt`

**Índices**: `companyId`, `customerId`, `state`

---

### SaleItem (embebido en Sale.items[])
- `productId`
- `nameSnapshot`
- `unit`
- `quantity`
- `unitPrice`
- `discountType`           // None | Fixed | Percentage
- `discountValue`
- `discountedSubtotal`
- `taxAmount`
- `total`

---

### Invoice (invoices)
- `_id`
- `companyId`
- `saleId`
- `number`
- `subtotal`
- `taxTotal`
- `total`
- `status`
- `sentAt`
- `paidAt`
- `createdAt`

**Índices**: `companyId`, `saleId`, `number`

---

### UsageCounters (usage_counters)
- `_id`
- `companyId`
- `period`                 // YYYY-MM
- `messagesUsed`
- `conversationsUsed`
- `invoicesUsed`
- `usersUsed`
- `createdAt`

**Índices**: `companyId + period` (unique)

---

### WhatsAppNumber (whatsapp_numbers)
- `_id`
- `companyId`
- `phoneNumber`
- `providerType`           // BYON | External
- `isActive`
- `createdAt`

**Índices**: `companyId`, `phoneNumber`

---

### Event (events)
- `_id`
- `companyId`
- `type`
- `entityType`
- `entityId`
- `payload`
- `createdAt`

**Índices**: `companyId`, `type`, `createdAt`

---

## 5️⃣ Estados comerciales (MVP)

1. LEAD  
2. SALE_CREATED  
3. INVOICED  
4. PAID  
