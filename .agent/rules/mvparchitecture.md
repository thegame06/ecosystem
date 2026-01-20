---
trigger: always_on
---

# MVP ARCHITECTURE – WhatsApp-First Sales SaaS (MongoDB)

## Objetivo
Construir un MVP vendible en semanas, usando MongoDB Free Tier,
sin bloquear la evolución al modelo unicornio.

---

## 1️⃣ Principio fundador

Arquitectura simple, clara y disciplinada.
MongoDB se usa como base de datos de documentos,
NO como un cajón sin reglas.

---

## 2️⃣ Stack definitivo del MVP

### Backend
- .NET 10
- ASP.NET Web API
- Clean Architecture (ligera)
- MongoDB (Free Tier)
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

/backend
└── src
├── Api
│ ├── Controllers
│ └── Program.cs
│
├── Application
│ ├── UseCases
│ ├── DTOs
│ └── Interfaces
│
├── Domain
│ ├── Documents
│ ├── Enums
│ └── ValueObjects
│
└── Infrastructure
├── Mongo
├── Repositories
└── Integrations

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


---

## 4️⃣ MODELO DE DATOS (DOCUMENTOS)

### Company (colección: companies)
- _id
- name
- country
- taxRate
- invoiceSequence
- createdAt

Índices:
- name
- country

---

### User (users)
- _id
- companyId
- email
- passwordHash
- role
- createdAt

Índices:
- companyId
- email (unique)

---

### Customer (customers)
- _id
- companyId
- name
- phone
- currentState
- createdAt

Índices:
- companyId
- phone

---

### Conversation (conversations)
- _id
- companyId
- customerId
- channel (WhatsApp)
- lastMessage
- lastState
- updatedAt

Índices:
- companyId
- customerId
- updatedAt

---

### Sale (sales)
- _id
- companyId
- customerId
- items[]
- total
- state
- createdAt

Índices:
- companyId
- customerId
- state

---

### Invoice (invoices)
- _id
- companyId
- saleId
- number
- total
- status
- createdAt

Índices:
- companyId
- saleId
- number

---

### Product (products)
- _id
- companyId
- name
- price
- taxRate
- createdAt

Índices:
- companyId
- name

---

## 5️⃣ Estados comerciales (MVP)

```text
LEAD
SALE_CREATED
INVOICED
PAID


---

## 4️⃣ MODELO DE DATOS (DOCUMENTOS)

### Company (colección: companies)
- _id
- name
- country
- taxRate
- invoiceSequence
- createdAt

Índices:
- name
- country

---

### User (users)
- _id
- companyId
- email
- passwordHash
- role
- createdAt

Índices:
- companyId
- email (unique)

---

### Customer (customers)
- _id
- companyId
- name
- phone
- currentState
- createdAt

Índices:
- companyId
- phone

---

### Conversation (conversations)
- _id
- companyId
- customerId
- channel (WhatsApp)
- lastMessage
- lastState
- updatedAt

Índices:
- companyId
- customerId
- updatedAt

---

### Sale (sales)
- _id
- companyId
- customerId
- items[]
- total
- state
- createdAt

Índices:
- companyId
- customerId
- state

---

### Invoice (invoices)
- _id
- companyId
- saleId
- number
- total
- status
- createdAt

Índices:
- companyId
- saleId
- number

---

### Product (products)
- _id
- companyId
- name
- price
- taxRate
- createdAt

Índices:
- companyId
- name

---

## 5️⃣ Estados comerciales (MVP)

```text
LEAD
SALE_CREATED
INVOICED
PAID