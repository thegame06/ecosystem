# 📄 Actualizaciones y Correcciones Pendientes – MVP

**Fecha de creación:** 2026-01-22  
**Estado:** En progreso  
**Prioridad:** Alta

---

## 🎯 Objetivo General

Mejorar claridad operativa, alinear UI/UX, corregir bugs funcionales, mantener 100% server-side (OData) y preparar el MVP para demo y uso real.

---

## 1️⃣ Documentación

### 📋 Tareas

- [ ] **Actualizar `/docs` con el estado real del MVP**
  - Revisar y actualizar todos los documentos para reflejar funcionalidades actuales
  - Alinear documentación con el comportamiento real del POS, Ventas y Productos
  - Validar que no existan referencias a funcionalidades no implementadas

### 🎯 Criterios de Aceptación

- La documentación refleja exactamente lo que está implementado
- No hay discrepancias entre documentación y código
- Los flujos documentados coinciden con los flujos reales del sistema

### 📝 Notas

- Priorizar documentos de dominio: `domain_model.md`, `sales_flow.md`, `use_cases.md`
- Actualizar documentos de UI: `uiscreenssales.md`, `uiscreensproducts.md`

---

## 2️⃣ POS – Reglas del MVP

### 📋 Tareas

#### 2.1 Formas de Pago

- [ ] **Implementar soporte para 3 formas de pago:**
  - [ ] Efectivo
  - [ ] Transferencia
  - [ ] Tarjeta

- [ ] **Backend: Actualizar `Sale` document**
  - Agregar campo `PaymentMethod` (enum: Cash, Transfer, Card)
  - Validar que se persista correctamente

- [ ] **Frontend: Actualizar `POSModal.tsx`**
  - Agregar selector de forma de pago
  - Validar selección antes de crear venta
  - Mostrar forma de pago en resumen de venta

#### 2.2 IVA (Impuesto)

- [ ] **Opción de generar ventas con IVA o sin IVA**
  - [ ] Backend: Validar que `Company.IsTaxEnabled` se respete
  - [ ] Frontend: Agregar toggle "Aplicar IVA" en POS
  - [ ] Recalcular totales dinámicamente según selección

- [ ] **El cálculo debe respetar la configuración de la empresa**
  - [ ] Validar que `Company.TaxRate` se aplique correctamente
  - [ ] Validar que productos con `IsTaxable = false` no apliquen IVA
  - [ ] Seguir estrictamente `pricing_calculation_rules.md`

#### 2.3 Descuentos

- [ ] **Descuento por producto (si está habilitado)**
  - [ ] Validar que `Product.AllowDiscount` se respete
  - [ ] Mostrar campo de descuento solo si está permitido
  - [ ] Soportar descuento fijo y porcentaje

- [ ] **Opción para deshabilitar descuentos a nivel producto**
  - [ ] Backend: Validar que `AllowDiscount = false` bloquee descuentos
  - [ ] Frontend: Ocultar/deshabilitar campo de descuento según producto

- [ ] **Descuento global a la venta**
  - [ ] Agregar campo de descuento global en POS
  - [ ] Aplicar después de descuentos por línea
  - [ ] Distribuir proporcionalmente según `pricing_calculation_rules.md`

### 🎯 Criterios de Aceptación

- Las 3 formas de pago están disponibles y se persisten correctamente
- El IVA se calcula correctamente según configuración de empresa y producto
- Los descuentos se aplican según las reglas definidas
- El cálculo de totales es 100% determinístico y sigue `pricing_calculation_rules.md`

### 📝 Notas

- **CRÍTICO:** Cualquier discrepancia en cálculos de dinero es un bug crítico
- Validar con casos de prueba específicos antes de marcar como completo

---

## 3️⃣ Historial de Ventas – Problemas Detectados

### 📋 Tareas

- [ ] **Botón de acciones no funciona**
  - [ ] Identificar causa del problema
  - [ ] Implementar acciones: Ver detalle, Generar factura, Cancelar (si aplica)

- [ ] **Estado de la venta no se visualiza correctamente**
  - [ ] Mapear correctamente `CommercialState` a labels visuales
  - [ ] Agregar indicadores visuales (badges, colores)
  - [ ] Estados: LEAD, SALE_CREATED, INVOICED, PAID

- [ ] **Nombre del cliente muestra ID en lugar del nombre real**
  - [ ] Verificar que el backend incluya `Customer.Name` en la respuesta
  - [ ] Actualizar frontend para mostrar `customerName` en lugar de `customerId`
  - [ ] Agregar fallback si el nombre no está disponible

- [ ] **No existe vista de detalle de la venta (read-only)**
  - [ ] Crear componente `SaleDetailModal.tsx` o página dedicada
  - [ ] Mostrar:
    - Información del cliente
    - Items de la venta con precios y descuentos
    - Subtotal, IVA, Total
    - Forma de pago
    - Estado comercial
    - Fecha de creación
  - [ ] Agregar botón "Generar Factura" si aplica

### 🎯 Criterios de Aceptación

- El botón de acciones ejecuta las acciones correctamente
- El estado de la venta se muestra claramente con indicadores visuales
- El nombre del cliente se muestra correctamente en todas las vistas
- Existe una vista de detalle completa y clara de cada venta

### 📝 Notas

- La vista de detalle debe ser consistente con el diseño de la pantalla de Ventas
- Considerar reutilizar componentes existentes

---

## 4️⃣ Productos – Bug de IVA

### 📋 Tareas

- [ ] **Al editar un producto y marcar IVA = 0, al volver a editarlo:**
  - [ ] Investigar por qué el sistema muestra IVA aplicado incorrectamente
  - [ ] Verificar persistencia en MongoDB
  - [ ] Verificar mapeo en backend (DTOs)
  - [ ] Verificar estado del formulario en frontend

- [ ] **El valor de IVA debe persistir correctamente según configuración**
  - [ ] Validar que `Product.IsTaxable` se guarde correctamente
  - [ ] Validar que el formulario de edición cargue el valor correcto
  - [ ] Agregar logs para debugging si es necesario

### 🎯 Criterios de Aceptación

- Al editar un producto con `IsTaxable = false`, el checkbox/toggle se muestra desmarcado
- Al guardar un producto con `IsTaxable = false`, el valor persiste correctamente
- Al recargar el formulario de edición, el valor se muestra correctamente

### 📝 Notas

- Este es un bug de persistencia o mapeo, no de cálculo
- Validar el flujo completo: Frontend → Backend → MongoDB → Backend → Frontend

---

## 5️⃣ UI / UX – Consistencia Visual

### 📋 Tareas

- [ ] **La UI de la pantalla de Ventas es correcta y debe tomarse como referencia visual**
  - [ ] Documentar componentes y estilos de referencia
  - [ ] Crear guía de estilo basada en `SalesPage.tsx`

- [ ] **La UI de Productos debe alinearse al mismo diseño**
  - [ ] Actualizar `ProductsPage.tsx` para que coincida con `SalesPage.tsx`
  - [ ] Unificar:
    - [ ] Layout (grid, spacing, containers)
    - [ ] Botones (tamaños, colores, iconos)
    - [ ] Espaciados (padding, margin, gaps)
    - [ ] Comportamiento de filtros (posición, estilo, interacción)

### 🎯 Criterios de Aceptación

- La pantalla de Productos tiene el mismo look & feel que la de Ventas
- Los componentes reutilizables están identificados y documentados
- La experiencia de usuario es consistente entre módulos

### 📝 Notas

- Considerar crear componentes compartidos: `PageHeader`, `ActionButton`, `FilterBar`, etc.
- Mantener la consistencia en toda la aplicación

---

## 6️⃣ Filtros, Búsqueda y Paginación (Server-side)

### 📋 Tareas

#### 6.1 Filtros

- [ ] **El botón de filtro actualmente no tiene efecto**
  - [ ] Identificar causa del problema
  - [ ] Implementar lógica de filtrado server-side usando OData
  - [ ] Validar que los filtros se apliquen correctamente en el backend

#### 6.2 Búsqueda

- [ ] **La búsqueda debe ser server-side, no en memoria**
  - [ ] Implementar búsqueda usando OData `$filter` con `contains()`
  - [ ] Aplicar búsqueda directamente en MongoDB
  - [ ] NO filtrar en frontend ni en memoria

#### 6.3 Paginación

- [ ] **Usar OData aplicado directamente en base de datos**
  - [ ] Implementar `$skip` y `$top` en queries
  - [ ] Validar que la paginación se ejecute en MongoDB, no en memoria

- [ ] **Paginación configurable por el usuario:**
  - [ ] Agregar selector de tamaño de página: 10 / 20 / 50 / 100 items
  - [ ] Persistir preferencia del usuario (localStorage o backend)
  - [ ] El tamaño de página debe impactar correctamente el query server-side

### 🎯 Criterios de Aceptación

- Los filtros funcionan correctamente y se aplican server-side
- La búsqueda se ejecuta en MongoDB usando OData
- La paginación es configurable y se ejecuta server-side
- NO se cargan todos los registros en memoria en ningún momento

### 📝 Notas

- **CRÍTICO:** Todo debe ser server-side para soportar grandes volúmenes de datos
- Validar performance con datasets grandes (1000+ registros)

---

## 7️⃣ POS – Organización de Productos

### 📋 Tareas

#### 7.1 Agrupación por Tipo

- [ ] **Los productos deben agruparse por tipo (categoría)**
  - [ ] Backend: Agregar endpoint que devuelva productos agrupados por `ProductType`
  - [ ] Frontend: Mostrar productos agrupados en POS

- [ ] **Mostrar:**
  - [ ] Tipo de producto (Tangible, Service, Rental)
  - [ ] Cantidad de productos por tipo
  - [ ] Productos dentro de cada grupo

- [ ] **Si un tipo no tiene productos, no debe mostrarse**
  - [ ] Filtrar grupos vacíos en backend o frontend

- [ ] **Evitar saturar el POS mostrando todos los productos sin agrupar**
  - [ ] Implementar vista colapsable/expandible por tipo
  - [ ] Mostrar solo tipos con productos activos

#### 7.2 Búsqueda en POS

- [ ] **La búsqueda debe:**
  - [ ] Ignorar la agrupación
  - [ ] Mostrar directamente los productos coincidentes
  - [ ] Indicar visualmente el tipo de producto al que pertenecen (badge, color, icono)

### 🎯 Criterios de Aceptación

- Los productos se muestran agrupados por tipo en el POS
- Solo se muestran tipos con productos activos
- La búsqueda funciona correctamente y muestra el tipo de cada producto
- La experiencia de usuario es fluida y no saturada

### 📝 Notas

- Considerar UX para negocios con muchos productos (50+)
- La búsqueda debe ser rápida y responsiva

---

## 📊 Resumen de Prioridades

| # | Área | Prioridad | Impacto | Esfuerzo |
|---|------|-----------|---------|----------|
| 1 | Documentación | Alta | Alto | Medio |
| 2 | POS – Reglas del MVP | **Crítica** | **Crítico** | Alto |
| 3 | Historial de Ventas | Alta | Alto | Medio |
| 4 | Productos – Bug de IVA | Alta | Medio | Bajo |
| 5 | UI/UX – Consistencia | Media | Medio | Medio |
| 6 | Filtros/Búsqueda/Paginación | Alta | Alto | Alto |
| 7 | POS – Organización | Media | Medio | Medio |

---

## 🚀 Plan de Ejecución Sugerido

### Fase 1: Correcciones Críticas (1-2 días)
1. **POS – Reglas del MVP** (Formas de pago, IVA, Descuentos)
2. **Productos – Bug de IVA**
3. **Historial de Ventas – Bugs visuales**

### Fase 2: Mejoras de UX (1-2 días)
4. **Filtros, Búsqueda y Paginación server-side**
5. **POS – Organización de Productos**
6. **UI/UX – Consistencia visual**

### Fase 3: Documentación (1 día)
7. **Actualizar documentación completa**

---

## 📝 Notas Finales

- **REGLA DE ORO:** Cualquier discrepancia en cálculos de dinero es un bug crítico y debe resolverse inmediatamente
- **REGLA DE SERVER-SIDE:** TODO debe ejecutarse server-side usando OData. NO filtrar/paginar en memoria
- **REGLA DE CONSISTENCIA:** La UI de Ventas es la referencia. Todas las pantallas deben alinearse a ese diseño
- **REGLA DE DOCUMENTACIÓN:** La documentación debe reflejar exactamente lo que está implementado

---

## 🔄 Estado de Actualización

**Última actualización:** 2026-01-22  
**Actualizado por:** Documentation Owner  
**Próxima revisión:** Después de completar Fase 1

---

## ✅ Checklist de Validación Final

Antes de considerar estas correcciones como completas, validar:

- [ ] Todos los cálculos de dinero son correctos y determinísticos
- [ ] Todas las queries son server-side (OData)
- [ ] La UI es consistente en todas las pantallas
- [ ] Los bugs reportados están resueltos
- [ ] La documentación está actualizada
- [ ] El flujo de demo funciona sin errores
- [ ] El sistema está listo para uso real y demostración

---

**FIN DEL DOCUMENTO**
