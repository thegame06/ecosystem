# Product Requirements Document (PRD) - WhatsApp-First Sales SaaS

## Vision
Un SaaS que permite a las PYMEs vender, facturar y comunicarse con clientes
usando WhatsApp como canal principal, desde un solo sistema simple,
configurable y orientado a cerrar ventas más rápido.

---

## Problem Statement
- Ventas por WhatsApp sin control ni trazabilidad
- Facturación manual o desconectada del proceso de venta
- POS poco flexible para descuentos e impuestos
- Falta de integración entre comunicación y cobro
- Poca automatización operativa
- Pérdida de ventas, tiempo y seguimiento

---

## Value Proposition
**“Todo tu negocio: ventas, facturas y WhatsApp en un solo sistema.”**

Diferenciador clave:
- Facturación integrada a WhatsApp
- Descuentos e impuestos flexibles
- Flujo completo: conversación → venta → factura → envío

---

## User Personas
- Dueño del negocio
- Vendedor
- Administrativo
- Operador de renta (autos / equipos)

---

## Core Principles
- WhatsApp-first (no dashboard-first)
- Pro-first (el plan Pro es el producto real)
- Flexibilidad comercial (descuentos e impuestos)
- Simplicidad operativa
- Costos controlados
- Límites claros por plan

---

## System Modules

### Identity & Access
- Login email/password
- Google / Microsoft
- Roles y permisos
- Seguridad por módulo
- Multi-tenant por empresa

**MVP:**
- Auth básica
- Roles simples (Admin, Vendedor)

### Company & Configuration
- País (Nicaragua inicial)
- Moneda
- Configuración de IVA / impuestos
- Secuencias de facturación
- Métodos de pago
- Branding básico
- Configuración WhatsApp (BYON)
- Plan activo y límites

### Customers
- Personas o empresas
- Múltiples teléfonos (WhatsApp)
- Datos fiscales básicos
- Consentimiento WhatsApp
- Historial (Ventas, Facturas, Conversaciones)

### Products
- Tipos: Tangible, Servicio, Rental
- Unidades de medida flexibles
- Precio base, IVA aplicable, descuentos permitidos

### Sales & POS
- Quick POS (web)
- Descuentos por producto y globales
- Cálculo automático de impuestos
- Registro manual de pagos

### Billing (Facturación)
- Facturas desde ventas
- Estados: Draft, Issued, Sent, Paid, Cancelled
- PDFs y envío por WhatsApp

### WhatsApp & Communication (CORE)
- Conversaciones y mensajes
- Envío de facturas integrado

### Automation
- Emisión de eventos para automatización externa (n8n)

### Plans & Subscriptions
- Starter, Pro, Growth
- Límites por uso y add-ons

---

## MVP Scope (Exclusions)
- Contabilidad avanzada
- BI complejo
- Microservicios
- Pagos online automáticos
- Inventario avanzado
- Apps nativas

---

## Success Metrics
- Tiempo promedio para crear una venta < 30s
- Tasa de facturas enviadas por WhatsApp vs total generado
- Retención de usuarios en plan Pro
