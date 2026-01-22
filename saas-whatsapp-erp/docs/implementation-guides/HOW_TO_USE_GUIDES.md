# 🚀 GUÍA RÁPIDA: Cómo Usar las Guías de Implementación

**Fecha:** 2026-01-22

---

## 📋 Resumen

Se han creado **guías de implementación paso a paso** para cada agente especializado.
Estas guías son **órdenes de trabajo completas** con código, validaciones y checklists.

---

## 📂 Ubicación de las Guías

```
docs/
└── implementation-guides/
    ├── BACKEND_IMPLEMENTATION_GUIDE.md
    └── FRONTEND_IMPLEMENTATION_GUIDE.md
```

---

## 🎯 Cómo Invocar a los Agentes

### Opción 1: Invocación Directa con Contexto

```
@[/backend] Implementa las correcciones documentadas en:
docs/implementation-guides/BACKEND_IMPLEMENTATION_GUIDE.md

Prioriza la FASE 1 (Payment Methods) y FASE 2 (OData).
```

### Opción 2: Invocación por Fase Específica

```
@[/backend] Implementa la FASE 1 de:
docs/implementation-guides/BACKEND_IMPLEMENTATION_GUIDE.md

Sigue exactamente los pasos del 1.1 al 1.7.
Reporta cuando completes cada paso.
```

### Opción 3: Invocación con Validación

```
@[/backend] Implementa FASE 1 y FASE 2 de la guía de backend.
Al terminar, ejecuta el checklist de validación y reporta resultados.
```

---

## 🔧 Para Backend (@/backend)

### Guía Completa
```
@[/backend] Lee y ejecuta:
docs/implementation-guides/BACKEND_IMPLEMENTATION_GUIDE.md
```

### Por Fases

**FASE 1: Payment Methods (Crítico)**
```
@[/backend] Implementa FASE 1 de BACKEND_IMPLEMENTATION_GUIDE.md
- Crear enum PaymentMethod
- Actualizar Sale document
- Actualizar DTOs
- Configurar mapping
- Agregar validaciones
- Crear tests
```

**FASE 2: OData (Alto)**
```
@[/backend] Implementa FASE 2 de BACKEND_IMPLEMENTATION_GUIDE.md
- Configurar OData
- Crear PagedResult
- Actualizar ProductsController
- Actualizar SalesController
- Crear índices MongoDB
```

**FASE 3: IVA Fixes (Alto)**
```
@[/backend] Implementa FASE 3 de BACKEND_IMPLEMENTATION_GUIDE.md
- Verificar persistencia de Product.IsTaxable
- Agregar logs de debugging
- Corregir bug
```

**FASE 4: Sales History (Medio)**
```
@[/backend] Implementa FASE 4 de BACKEND_IMPLEMENTATION_GUIDE.md
- Incluir Customer Name en SaleDto
- Actualizar GetSales con lookup
```

---

## 🎨 Para Frontend (@/frontend)

### Guía Completa
```
@[/frontend] Lee y ejecuta:
docs/implementation-guides/FRONTEND_IMPLEMENTATION_GUIDE.md
```

### Por Fases

**FASE 1: POS - Payment & IVA (Crítico)**
```
@[/frontend] Implementa FASE 1 de FRONTEND_IMPLEMENTATION_GUIDE.md
- Actualizar types
- Agregar selector de forma de pago
- Agregar toggle de IVA
- Agregar descuento global
- Actualizar cálculos
- Actualizar submit
```

**FASE 2: Server-Side Pagination (Alto)**
```
@[/frontend] Implementa FASE 2 de FRONTEND_IMPLEMENTATION_GUIDE.md
- Crear hook useServerPagination
- Actualizar ProductsPage
- Actualizar SalesPage
```

**FASE 3: Sales History Fixes (Alto)**
```
@[/frontend] Implementa FASE 3 de FRONTEND_IMPLEMENTATION_GUIDE.md
- Corregir display de customer name
- Corregir display de estado
- Arreglar botón de acciones
- Crear SaleDetailModal
```

**FASE 4: Product Organization (Medio)**
```
@[/frontend] Implementa FASE 4 de FRONTEND_IMPLEMENTATION_GUIDE.md
- Agrupar productos por tipo en POS
- Mejorar búsqueda
```

---

## 🔍 Para Support/QA (@/support)

### Validación de Implementación

```
@[/support] Valida la implementación de:
- FASE 1 Backend (Payment Methods)
- FASE 1 Frontend (POS)

Criterios:
1. Puedo crear una venta con forma de pago
2. La forma de pago se persiste
3. El toggle de IVA funciona
4. Los cálculos son correctos según pricing_calculation_rules.md
```

### Debugging de Bugs Específicos

```
@[/support] Investiga y corrige el bug de IVA en productos:

Síntoma: Al editar un producto y marcar IVA = 0, al volver a editarlo 
el sistema muestra IVA aplicado incorrectamente.

Referencia: docs/pending-updates-and-corrections.md - Sección 4
```

---

## 📊 Tracking de Progreso

### Checklist de Alto Nivel

```
Backend:
- [ ] FASE 1: Payment Methods
- [ ] FASE 2: OData
- [ ] FASE 3: IVA Fixes
- [ ] FASE 4: Sales History

Frontend:
- [ ] FASE 1: POS Updates
- [ ] FASE 2: Server-Side Pagination
- [ ] FASE 3: Sales History Fixes
- [ ] FASE 4: Product Organization
```

### Reportar Progreso

```
@[/backend] Reporta el estado de implementación de tu guía.
Indica qué fases están completas y cuáles están pendientes.
```

---

## 🎯 Ejemplos de Uso Real

### Ejemplo 1: Implementación Completa Backend

```
@[/backend] 

Implementa todas las fases de:
docs/implementation-guides/BACKEND_IMPLEMENTATION_GUIDE.md

Orden de prioridad:
1. FASE 1 (Crítico)
2. FASE 2 (Alto)
3. FASE 3 (Alto)
4. FASE 4 (Medio)

Al completar cada fase:
- Ejecuta el checklist de validación
- Ejecuta los tests
- Reporta resultados

Si encuentras algún blocker, repórtalo inmediatamente.
```

### Ejemplo 2: Implementación Específica Frontend

```
@[/frontend]

Implementa SOLO la FASE 1 de:
docs/implementation-guides/FRONTEND_IMPLEMENTATION_GUIDE.md

Enfócate en:
- Selector de forma de pago (Paso 1.2)
- Toggle de IVA (Paso 1.3)
- Cálculos correctos (Paso 1.3)

Valida que los totales se calculen correctamente según:
docs/context/pricing_calculation_rules.md

No implementes descuento global todavía.
```

### Ejemplo 3: Validación Cruzada

```
@[/support]

Valida la integración Backend + Frontend para Payment Methods:

Backend: FASE 1 completa
Frontend: FASE 1 Pasos 1.1-1.5 completos

Casos de prueba:
1. Crear venta con Efectivo
2. Crear venta con Transferencia
3. Crear venta con Tarjeta
4. Verificar que se persiste correctamente
5. Verificar que aparece en el listado

Reporta cualquier discrepancia.
```

### Ejemplo 4: Debugging Específico

```
@[/support]

Investiga por qué el botón de acciones en Sales History no funciona.

Referencia:
- docs/pending-updates-and-corrections.md - Sección 3
- docs/implementation-guides/FRONTEND_IMPLEMENTATION_GUIDE.md - FASE 3, Paso 3.3

Pasos:
1. Reproduce el bug
2. Identifica la causa
3. Propón solución
4. Implementa fix
5. Valida que funciona
```

---

## 💡 Tips para Mejores Resultados

### 1. Sé Específico
❌ "Implementa las correcciones"
✅ "Implementa FASE 1 de BACKEND_IMPLEMENTATION_GUIDE.md"

### 2. Referencia Documentos
❌ "Arregla el POS"
✅ "Implementa Paso 1.2 de FRONTEND_IMPLEMENTATION_GUIDE.md (Payment Method Selector)"

### 3. Incluye Criterios de Validación
❌ "Implementa y avísame"
✅ "Implementa y valida que el checklist de FASE 1 esté completo"

### 4. Prioriza
❌ "Haz todo"
✅ "Prioriza FASE 1 (Crítico), luego FASE 2 (Alto)"

### 5. Pide Reportes
❌ "Hazlo"
✅ "Hazlo y reporta cuando completes cada paso"

---

## 📝 Template de Invocación

```
@[/AGENTE]

Implementa [FASE X] de:
docs/implementation-guides/[AGENTE]_IMPLEMENTATION_GUIDE.md

Pasos específicos:
- [Paso X.X]
- [Paso X.X]

Validaciones:
- [ ] [Criterio 1]
- [ ] [Criterio 2]

Reporta cuando completes.
```

---

## 🚨 Manejo de Errores

Si un agente reporta un blocker:

```
@[/support]

El agente @[/backend] reporta blocker en FASE 2, Paso 2.4.

Error: [descripción del error]

Investiga y propón solución.
```

---

## ✅ Validación Final

Cuando todas las fases estén completas:

```
@[/support]

Valida que todas las correcciones de:
docs/pending-updates-and-corrections.md

Estén implementadas correctamente.

Ejecuta el "Checklist de Validación Final" de ese documento.
Reporta resultados.
```

---

## 🎓 Resumen

**Las guías de implementación son:**
- ✅ Paso a paso
- ✅ Con código completo
- ✅ Con validaciones
- ✅ Con checklists
- ✅ Priorizadas

**Para usarlas:**
1. Referencia el archivo específico
2. Especifica la fase o paso
3. Incluye criterios de validación
4. Pide reporte de progreso

---

**¡Listo para implementar! 🚀**
