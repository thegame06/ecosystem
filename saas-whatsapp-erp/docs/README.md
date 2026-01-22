# 📚 DOCUMENTATION INDEX – MVP

**Última actualización:** 2026-01-22  
**Estado:** Actualizado con correcciones pendientes

---

## 🎯 Propósito

Este índice organiza toda la documentación del proyecto SaaS WhatsApp ERP.
Cada documento tiene un propósito específico y es la fuente de verdad para su área.

---

## 📋 Documentos Principales

### 1️⃣ Contexto del Proyecto

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| [domain-model.md](context/domain-model.md) | Define todas las entidades, campos y enums del dominio | ✅ Actualizado |
| [mvp-architecture.md](context/mvp-architecture.md) | Arquitectura técnica del MVP | ✅ Vigente |
| [product-definition.md](context/product-definition.md) | Definición del producto, módulos y alcance del MVP | ✅ Actualizado |
| [sales-flow.md](context/sales-flow.md) | Flujo comercial oficial: Lead → Sale → Invoice → Paid | ✅ Vigente |
| [use-cases.md](context/use-cases.md) | Casos de uso oficiales del MVP | ✅ Vigente |
| [pricing_calculation_rules.md](context/pricing_calculation_rules.md) | Reglas de cálculo de precios, descuentos e impuestos | ✅ Vigente |

---

### 2️⃣ WhatsApp Integration

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| [whatsapp-integration.md](context/whatsapp-integration.md) | Integración de WhatsApp: alcance, límites y riesgos | ✅ Actualizado |
| [whatsapp-settings-implementation.md](whatsapp-settings-implementation.md) | Implementación técnica de configuración WhatsApp | ✅ Vigente |

---

### 3️⃣ UI/UX Specifications

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| [uiscreens-pos.md](context/uiscreens-pos.md) | Especificación completa del POS (Point of Sale) | ✅ **NUEVO** |
| [server-side-data-operations.md](context/server-side-data-operations.md) | Reglas de filtros, búsqueda y paginación server-side | ✅ **NUEVO** |

---

### 4️⃣ Correcciones y Actualizaciones

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| [pending-updates-and-corrections.md](pending-updates-and-corrections.md) | Lista de correcciones y actualizaciones pendientes | ✅ **NUEVO** |

---

### 5️⃣ Infrastructure

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| [cloudflare-tunnel-setup.md](cloudflare-tunnel-setup.md) | Configuración de Cloudflare Tunnel | ✅ Vigente |

---

### 6️⃣ Implementation Guides ⭐

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| [HOW_TO_USE_GUIDES.md](implementation-guides/HOW_TO_USE_GUIDES.md) | **Guía rápida de uso** - Cómo invocar agentes con las guías | ✅ **NUEVO** |
| [BACKEND_IMPLEMENTATION_GUIDE.md](implementation-guides/BACKEND_IMPLEMENTATION_GUIDE.md) | Guía paso a paso para @/backend - Payment Methods, OData, IVA fixes | ✅ **NUEVO** |
| [FRONTEND_IMPLEMENTATION_GUIDE.md](implementation-guides/FRONTEND_IMPLEMENTATION_GUIDE.md) | Guía paso a paso para @/frontend - POS updates, Pagination, Sales fixes | ✅ **NUEVO** |

**💡 Inicio Rápido:**
```
@[/backend] Implementa FASE 1 de:
docs/implementation-guides/BACKEND_IMPLEMENTATION_GUIDE.md
```

Ver [HOW_TO_USE_GUIDES.md](implementation-guides/HOW_TO_USE_GUIDES.md) para más ejemplos.

---

## 🔄 Documentos Actualizados (2026-01-22)

### Cambios Realizados

#### 1. **domain-model.md**
- ✅ Agregado campo `PaymentMethod` a entidad `Sale`
- ✅ Agregado enum `PaymentMethod` (Cash, Transfer, Card)

#### 2. **product-definition.md**
- ✅ Actualizada sección "Sales & POS" con:
  - 3 formas de pago (Efectivo, Transferencia, Tarjeta)
  - Reglas de IVA (multinivel: empresa, producto, venta)
  - Reglas de descuentos (por producto y global)
  - IVA flexible (con/sin IVA por venta)

#### 3. **uiscreens-pos.md** (NUEVO)
- ✅ Especificación completa del POS
- ✅ Organización de productos por tipo
- ✅ Reglas de búsqueda en POS
- ✅ Reglas de IVA multinivel
- ✅ Reglas de descuentos
- ✅ Formas de pago
- ✅ Validaciones y manejo de errores

#### 4. **server-side-data-operations.md** (NUEVO)
- ✅ Reglas obligatorias de server-side
- ✅ Implementación OData
- ✅ Búsqueda, filtros, paginación
- ✅ Ejemplos de código backend y frontend
- ✅ Performance y seguridad

#### 5. **pending-updates-and-corrections.md** (NUEVO)
- ✅ Lista completa de correcciones pendientes
- ✅ Organizado por áreas
- ✅ Prioridades y plan de ejecución

---

## 📊 Estado del MVP

### ✅ Documentación Completa

- [x] Modelo de dominio
- [x] Arquitectura
- [x] Definición del producto
- [x] Flujo de ventas
- [x] Casos de uso
- [x] Reglas de pricing
- [x] Integración WhatsApp
- [x] Especificación POS
- [x] Reglas server-side

### 🚧 Implementación Pendiente

Ver [pending-updates-and-corrections.md](pending-updates-and-corrections.md) para detalles completos.

**Resumen de prioridades:**

1. **POS – Reglas del MVP** (Crítico)
   - Formas de pago
   - IVA flexible
   - Descuentos

2. **Historial de Ventas** (Alto)
   - Botón de acciones
   - Estado de venta
   - Nombre del cliente
   - Vista de detalle

3. **Productos – Bug de IVA** (Alto)
   - Persistencia correcta de `IsTaxable`

4. **Filtros/Búsqueda/Paginación** (Alto)
   - Implementación server-side OData

5. **POS – Organización de Productos** (Medio)
   - Agrupación por tipo
   - Búsqueda mejorada

6. **UI/UX – Consistencia** (Medio)
   - Alineación con diseño de Ventas

---

## 🎯 Reglas de Uso

### Para Desarrolladores

1. **Antes de implementar una feature:**
   - Leer el documento de dominio correspondiente
   - Validar que esté en el alcance del MVP
   - Seguir las reglas definidas

2. **Al encontrar discrepancias:**
   - Reportar en [pending-updates-and-corrections.md](pending-updates-and-corrections.md)
   - Actualizar documentación si es necesario
   - Validar con el equipo

3. **Al agregar funcionalidad:**
   - Actualizar documentación correspondiente
   - Agregar a casos de uso si aplica
   - Validar contra principios del MVP

### Para Product Owner / CTO

1. **Antes de aprobar una feature:**
   - Validar que esté documentada
   - Validar que siga las reglas del MVP
   - Validar impacto en costos

2. **Al cambiar alcance:**
   - Actualizar documentación primero
   - Comunicar cambios al equipo
   - Validar impacto en timeline

---

## 📖 Cómo Leer Esta Documentación

### Orden Recomendado (Nuevo en el Proyecto)

1. **product-definition.md** - Entender qué es el producto
2. **domain-model.md** - Entender el modelo de datos
3. **sales-flow.md** - Entender el flujo comercial
4. **pricing_calculation_rules.md** - Entender cálculos de dinero
5. **whatsapp-integration.md** - Entender WhatsApp
6. **use-cases.md** - Entender funcionalidades
7. **mvp-architecture.md** - Entender arquitectura técnica

### Para Implementar Features Específicas

| Feature | Documentos a Leer |
|---------|-------------------|
| POS | `uiscreens-pos.md`, `pricing_calculation_rules.md`, `domain-model.md` |
| Ventas | `sales-flow.md`, `use-cases.md`, `domain-model.md` |
| Productos | `product-definition.md`, `domain-model.md` |
| WhatsApp | `whatsapp-integration.md`, `sales-flow.md` |
| Filtros/Búsqueda | `server-side-data-operations.md` |

---

## ⚠️ Reglas Finales

### Documentación es Fuente de Verdad

- Si algo no está documentado, no existe en el MVP
- Si hay conflicto entre código y documentación, la documentación gana
- Si la documentación está desactualizada, es un bug

### Actualización Obligatoria

- Toda feature nueva DEBE actualizar documentación
- Toda corrección DEBE validarse contra documentación
- Toda discrepancia DEBE reportarse

### Prohibiciones

- ❌ Implementar features no documentadas
- ❌ Ignorar reglas documentadas
- ❌ Asumir comportamientos no especificados

---

## 📞 Contacto

Para preguntas sobre documentación:
- Revisar primero este índice
- Leer el documento correspondiente
- Si persiste la duda, consultar con el equipo

---

**ÚLTIMA ACTUALIZACIÓN:** 2026-01-22  
**PRÓXIMA REVISIÓN:** Después de completar Fase 1 de correcciones

---

**FIN DEL DOCUMENTO**
