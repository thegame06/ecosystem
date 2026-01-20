---
trigger: always_on
---

# PRODUCT DEFINITION – SaaS Ventas + Facturación + WhatsApp

## Visión
Un SaaS que permite a las PYMEs vender, facturar y comunicarse con clientes
usando WhatsApp como canal principal, desde un solo sistema.

## Problema que resuelve
- Ventas por WhatsApp sin control
- Facturación manual o desconectada
- Falta de POS moderno
- Falta de web pública
- Poca automatización
- Pérdida de ventas y tiempo

## Propuesta de valor
"Todo tu negocio: ventas, facturas y WhatsApp en un solo sistema."

## Usuarios
- Dueño del negocio
- Vendedor
- Administrativo
- Operador de renta (autos / equipos)

## Módulos del sistema

### Identity & Access
- Login email/password
- Google / Microsoft
- Roles y permisos
- Seguridad por módulo
- Multi-tenant

### Company & Configuration
- País (Nicaragua inicial)
- Moneda
- IVA / impuestos
- Secuencias
- Métodos de pago
- Branding básico
- Configuración WhatsApp
- Configuración n8n
- Plan y límites

### Customers
- Personas o empresas
- Múltiples teléfonos (WhatsApp)
- Datos fiscales
- Historial:
  - Ventas
  - Facturas
  - Conversaciones
  - Reservas
- Consentimiento WhatsApp

### Products
Tipos:
- Producto tangible
- Servicio
- Producto alquilable

Características:
- Precio compra
- Precio venta fijo o % de ganancia
- IVA configurable
- Inventario opcional
- Variantes
- Alquiler por hora o día
- Calendario y disponibilidad

### Sales & POS
- Órdenes de venta
- POS rápido (web + app)
- Descuentos
- Gift cards
- Métodos de pago:
  - Efectivo
  - Transferencia
  - Tarjeta (registro)

### Billing (Facturación)
- Facturas
- Estados:
  - Draft
  - Issued
  - Sent
  - Paid
  - Cancelled
- Impuestos
- Notas de crédito básicas
- Preparado para facturación electrónica

### WhatsApp & Communication (CORE)
- Conversaciones
- Mensajes
- Plantillas
- Envío de facturas
- Logs
- Control de consumo
- Consentimiento

### Automation (n8n)
- Registro de integración del cliente
- Webhooks
- Eventos:
  - Invoice.Created
  - Invoice.Sent
  - Message.Received
  - Reservation.Created
- Workflows viven en la cuenta del cliente

### Public Web
- Página pública por empresa
- Catálogo
- Detalle de productos
- Reservas
- Botón WhatsApp
- SEO básico

### Mobile App
- POS móvil
- Crear ventas
- Enviar facturas por WhatsApp
- Ver conversaciones
- Confirmar reservas

### Plans & Subscriptions
- Plan Starter / Pro
- Límites:
  - Usuarios
  - Facturas
  - Mensajes WhatsApp
  - Conversaciones
  - Storage
  - Automatizaciones
- Tracking mensual
- Bloqueo al exceder límites
- Upsell

### Admin Interno (SaaS)
- Ver empresas
- Ver consumo
- Cambiar planes
- Registrar pagos (transferencia)
- Suspender / reactivar
- Ver errores WhatsApp
- Métricas SaaS

## MVP incluye
- Ventas
- POS
- Facturación
- WhatsApp
- Web pública
- Productos flexibles
- App básica
- Planes y límites
- Admin interno

## MVP NO incluye
- Contabilidad avanzada
- BI complejo
- Microservicios
- IA propietaria
- Pagos online automáticos

## Regla final
Si una funcionalidad no mejora ventas, facturación o comunicación,
no es parte del producto.

## Propuesta de valor (COMERCIAL)

Lo que el cliente realmente compra es:

- Vender más usando WhatsApp
- Responder clientes más rápido
- Enviar facturas sin fricción
- Tener control básico del negocio sin un ERP complejo
- Tener una web simple incluida

El cliente NO compra módulos.
El cliente compra resultados:
ventas, comunicación y facturación.
