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
- Historial: Ventas, Facturas, Conversaciones, Reservas
- Consentimiento WhatsApp

### Products
**Tipos**: Tangible, Servicio, Alquilable
**Características**: Precio, IVA, Inventario (opcional), Variantes, Calendario.

### Sales & POS
- Órdenes de venta
- POS rápido (web + app)
- Descuentos
- Gift cards
- Pagos: Efectivo, Transferencia, Tarjeta

### Billing (Facturación)
- Facturas
- Estados: Draft, Issued, Sent, Paid, Cancelled
- Impuestos
- Notas de crédito básicas
- Facturación electrónica (ready)

### WhatsApp & Communication (CORE)
- Conversaciones
- Mensajes
- Plantillas
- Envío de facturas

### Automation (n8n)
- Webhooks
- Eventos: Invoice.Created, Invoice.Sent, ...

### Public Web
- Página pública por empresa
- Catálogo
- Reservas
- Botón WhatsApp

### Plans & Subscriptions
- Starter / Pro
- Límites de cuotas

### Admin Interno (SaaS)
- Gestión de tenants
- Métricas

## MVP NO incluye
- Contabilidad avanzada
- BI complejo
- Microservicios
- IA propietaria
- Pagos online automáticos
