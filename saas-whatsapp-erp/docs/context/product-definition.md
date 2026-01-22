# PRODUCT DEFINITION – Annonai Flow

## Visión
**Annonai Flow** es un SaaS que permite a las PYMEs vender, facturar y comunicarse con clientes
usando WhatsApp como canal principal, desde un solo sistema simple,
configurable y orientado a cerrar ventas más rápido.

---

## Problema que resuelve
- Ventas por WhatsApp sin control ni trazabilidad
- Facturación manual o desconectada del proceso de venta
- POS poco flexible para descuentos e impuestos
- Falta de integración entre comunicación y cobro
- Poca automatización operativa
- Pérdida de ventas, tiempo y seguimiento

---

## Propuesta de valor
**“Todo tu negocio: ventas, facturas y WhatsApp en un solo sistema.”**

Diferenciador clave:
- Facturación integrada a WhatsApp
- Descuentos e impuestos flexibles
- Flujo completo: conversación → venta → factura → envío

---

## Usuarios
- Dueño del negocio
- Vendedor
- Administrativo
- Operador de renta (autos / equipos)

---

## Principios del producto
- WhatsApp-first (no dashboard-first)
- Pro-first (el plan Pro es el producto real)
- Flexibilidad comercial (descuentos e impuestos)
- Simplicidad operativa
- Costos controlados
- Límites claros por plan

---

## Módulos del sistema

### Identity & Access
- Login email/password
- Google / Microsoft (futuro)
- Roles y permisos
- Seguridad por módulo
- Multi-tenant por empresa

**MVP:**
- Auth básica
- Roles simples (Admin, Vendedor)

---

### Company & Configuration
- País (Nicaragua inicial)
- Moneda
- Configuración de IVA / impuestos
  - Tasa por defecto
  - Posibilidad de no cobrar IVA
- Secuencias de facturación
- Métodos de pago (efectivo, transferencia)
- Branding básico
- Configuración WhatsApp (BYON)
- Configuración n8n
- Plan activo y límites de uso

**MVP:**
- Configuración mínima necesaria para vender y facturar
- IVA configurable a nivel empresa

---

### Customers
- Personas o empresas
- Múltiples teléfonos (WhatsApp)
- Datos fiscales básicos (opcional)
- Consentimiento WhatsApp
- Historial:
  - Ventas
  - Facturas
  - Conversaciones

**MVP:**
- Un teléfono principal
- Consentimiento WhatsApp simple

---

### Products

**Tipos conceptuales:**
- Tangible (productos físicos)
- Servicio (trabajo, mano de obra, consultoría)
- Alquilable (renta por tiempo – futuro)

**Unidades de medida:**
- Unidad
- Hora
- Día
- Kilogramo
- Libra
- Quintal
- Caja
- Personalizada (texto libre)

**Características del producto:**
- Precio base
- Unidad de medida
- IVA aplicable o exento
- Permite descuento (sí / no)
- Tipo de producto (metadata)
- Activo / inactivo

**Reglas de uso:**
- El precio se define por unidad de medida
- La cantidad en ventas siempre se expresa en la unidad del producto
- El total se calcula como:
  `cantidad × precio ± descuento ± impuestos`

**MVP:**
- Productos simples
- Una sola unidad de medida por producto
- Sin conversión entre unidades
- Sin inventario obligatorio
- Sin variantes
- Sin calendario de renta
- Tipo "Alquilable" solo como metadata (sin lógica de tiempo)

---

### Sales & POS
- Órdenes de venta
- POS rápido (web)
- Descuentos:
  - Por producto (si está habilitado en el producto)
  - Globales por venta
- Cálculo automático de impuestos
- Ventas con o sin IVA (configurable por venta)
- Formas de pago:
  - Efectivo
  - Transferencia
  - Tarjeta

**Reglas de IVA:**
- La empresa puede habilitar/deshabilitar IVA globalmente
- Cada producto puede ser taxable o exento
- El usuario puede elegir aplicar o no IVA en cada venta
- El cálculo sigue estrictamente `pricing_calculation_rules.md`

**Reglas de Descuentos:**
- Descuento por producto: solo si `Product.AllowDiscount = true`
- Descuento global: se aplica después de descuentos por línea
- Tipos: Fijo o Porcentaje
- No puede dejar subtotal negativo

**MVP:**
- POS web
- Descuentos simples (por producto y global)
- Registro manual de pagos (3 formas de pago)
- Sin conciliación bancaria
- IVA flexible (con/sin IVA por venta)

---

### Billing (Facturación)
- Facturas generadas desde ventas
- Estados:
  - Draft
  - Issued
  - Sent
  - Paid
  - Cancelled
- Impuestos calculados según configuración
- Facturas con o sin IVA
- PDFs
- Envío por WhatsApp

**MVP:**
- Facturación básica
- Sin facturación electrónica activa
- Estructura preparada para integración futura

---

### WhatsApp & Communication (CORE)

**⚠️ IMPORTANT**: See [whatsapp-integration.md](whatsapp-integration.md) for complete details.

**MVP Scope:**
- Manual 1-to-1 messaging only
- Invoice delivery via WhatsApp
- Conversation tracking
- BYON (Bring Your Own Number) model
- **Unofficial WhatsApp API** (NOT WhatsApp Business Cloud API)

**Features:**
- View conversations
- Send invoices to individual customers
- Track commercial state per conversation
- Usage limit enforcement (hard limits)

**Explicitly NOT Included in MVP:**
- ❌ Bots or automated responses
- ❌ Mass messaging / campaigns
- ❌ Automated workflows
- ❌ WhatsApp Business Cloud API
- ❌ Message templates (official)
- ❌ Interactive buttons

**Risk Warning:**
- WhatsApp may ban numbers using unofficial APIs
- Customer owns the number and assumes ban risk
- See [whatsapp-integration.md](whatsapp-integration.md) for full risk disclosure

---

### Automation (n8n)
- Webhooks
- Emisión de eventos:
  - Sale.Created
  - Invoice.Created
  - Invoice.Sent

**MVP:**
- Solo emisión de eventos
- No automatización compleja

---

### Public Web
- Página pública por empresa
- Catálogo
- Reservas
- Botón WhatsApp

**MVP:** NO incluido

---

### Plans & Subscriptions
- Starter
- Pro (plan principal)
- Growth
- Límites por uso
- Add-ons por consumo

**MVP:**
- Plan activo
- Límites duros
- Bloqueo al exceder

---

### Admin Interno (SaaS)
- Gestión de empresas
- Métricas básicas

**MVP:** NO incluido

---

## MVP NO incluye (explícito)
- Contabilidad avanzada
- BI complejo
- Microservicios
- IA propietaria
- Pagos online automáticos
- Facturación electrónica activa
- Web pública
- App móvil nativa
- Inventario avanzado
- Calendarios de renta

**WhatsApp (explícitamente excluido del MVP):**
- ❌ WhatsApp Business Cloud API (oficial)
- ❌ Bots o respuestas automáticas
- ❌ Envíos masivos / campañas
- ❌ Workflows automáticos
- ❌ Plantillas de mensajes (oficiales)
- ❌ Botones interactivos
- ❌ Integración de catálogo
- ❌ Integración de pagos
- ❌ Automatización basada en IA

---

## Regla final de alcance
Si una funcionalidad no está explícitamente marcada como **MVP**,
no se implementa en la primera versión.

El objetivo del MVP es:
**vender, facturar, enviar por WhatsApp y aprender del mercado**.