# 🚨 FASE DE CORRECCIÓN CRÍTICA - WAR ROOM

**Fecha de Inicio**: 2026-01-21
**Objetivo**: Completar los 3 pilares críticos para el MVP vendible.

---

## 🏎️ Puntos de Enfoque

### 1. SaaS / Subscriptions (Backend)
*Implementar la lógica de negocio que permite cobrar y limitar el uso.*

- [x] **Documentos de Dominio**:
    - [x] `Subscription.cs` (Managed via PlanType in Company for now)
    - [x] `PlanType.cs` (Starter, Pro, Growth)
    - [x] `UsageCounters.cs`
- [x] **Lógica de Calculo y Control**:
    - [x] `PlanLimits.cs` centralizing rules.
    - [x] `PlanService` for validation and tracking.
    - [x] `IUsageCountersRepository` for persistence.
- [ ] **API**:
    - [ ] `SubscriptionsController` (Ver plan actual, historial).

### 2. WhatsApp End-to-End (Operations / Backend)
*Conexión real para que el producto sea "WhatsApp-First".*

- [x] **Integración API**:
    - [x] `IWhatsAppProvider` interface and Mock implementation for BYON.
    - [x] `WhatsAppNumber` repository and entity.
- [x] **Recepcion**:
    - [x] `WhatsAppWebhooksController` for incoming messages.
    - [x] `HandleIncomingMessageAsync` in `ConversationService` for incoming persistence.
- [x] **Envío**:
    - [x] `SendWhatsAppAsync` in `InvoiceService` implemented.
    - [x] `GeneratePdfAsync` (Placeholder) for invoice delivery.
- [x] **Respeto de Límites**:
    - [x] Integration with `PlanService` in both outgoing (Filter) and incoming (Service).

### 3. Frontend Core - Demo < 3 minutos (Frontend)
*Flujo visual que "venda" el producto.*

- [x] **Auth**:
    - [x] Login y Register conectados al backend con diseño premium.
- [x] **Dashboard / Inbox**:
    - [x] Pantalla principal de WhatsApp integrada con datos reales.
- [x] **Flujo Comercial End-to-End**:
    - [x] Flujo: Chat -> POS (Venta) -> Facturacion -> Envio WhatsApp.
    - [x] Feedback visual de éxito y límites de plan visibles.

---

## 📈 Tablero de Tareas Inmediatas

| Tarea | Prioridad | Agente | Estado |
| :--- | :--- | :--- | :--- |
| Definir esquema de `Subscription` y `PlanType` | 🔴 Alta | @backend | ✅ HECHO |
| Middleware de Control de Límites | 🔴 Alta | @backend | ✅ HECHO |
| Setup de Webhook para WhatsApp | 🔴 Alta | @operations | ✅ HECHO |
| Pantalla de Login (Frontend) | 🔴 Alta | @frontend | ✅ HECHO |
| Mock/Setup de Envío de Mensajes WhatsApp | 🔴 Alta | @backend | ✅ HECHO |

---

## 📝 Notas del Orchestrator
- **Cero Over-engineering**: Si el límite es 300 facturas, un simple contador en MongoDB basta para el MVP.
- **Demo-First**: Si el backend tarda, el frontend puede usar mocks transitorios para validar la UX, pero el objetivo final es integración real.
- **Seguridad**: No olvidar que todo debe filtrar por `CompanyId`.
