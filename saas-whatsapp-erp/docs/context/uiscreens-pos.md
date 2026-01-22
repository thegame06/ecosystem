# UI SCREENS – POS (Point of Sale)

**Última actualización:** 2026-01-22  
**Estado:** Actualizado con reglas del MVP

---

## Propósito

El POS es el corazón operativo del sistema. Debe permitir crear ventas en **menos de 30 segundos** con una experiencia fluida, táctil y sin fricción.

---

## Screen: POS Modal / Quick Sale

### Objetivo
Crear una venta completa con todos los datos necesarios en el menor tiempo posible.

---

## Flujo Mínimo

1. **Cliente** (auto-seleccionado desde chat o selección manual)
2. **Agregar productos/servicios**
   - Productos agrupados por tipo (Tangible, Service, Rental)
   - Búsqueda rápida (ignora agrupación)
   - Mostrar tipo de producto en resultados de búsqueda
3. **Configurar líneas de venta**
   - Cantidad
   - Precio unitario (editable)
   - Descuento (solo si `Product.AllowDiscount = true`)
4. **Descuento global** (opcional)
5. **Aplicar IVA** (toggle on/off)
6. **Forma de pago** (Efectivo, Transferencia, Tarjeta)
7. **Ver totales** (Subtotal, IVA, Total)
8. **Guardar venta**

---

## Organización de Productos

### Agrupación por Tipo

Los productos deben mostrarse agrupados por `ProductType`:

- **Tangible** (Productos físicos)
- **Service** (Servicios)
- **Rental** (Alquileres - metadata only en MVP)

**Reglas:**
- Solo mostrar tipos que tengan productos activos
- Mostrar cantidad de productos por tipo
- Vista colapsable/expandible por tipo
- Si un tipo no tiene productos, no se muestra

### Búsqueda en POS

Cuando el usuario busca un producto:

- **Ignorar la agrupación**
- Mostrar directamente los productos coincidentes
- **Indicar visualmente el tipo** de cada producto:
  - Badge con el nombre del tipo
  - Color distintivo por tipo
  - Icono representativo

**Ejemplo visual:**
```
🔍 Búsqueda: "laptop"

Resultados:
┌─────────────────────────────────────┐
│ 💻 Laptop Dell XPS 13               │
│ [Tangible] · $1,200.00              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 🛠️ Soporte técnico laptop           │
│ [Service] · $50.00/hora             │
└─────────────────────────────────────┘
```

---

## Reglas de IVA

### Configuración Multinivel

1. **Nivel Empresa** (`Company.IsTaxEnabled`)
   - Si `false`: No se puede aplicar IVA en ninguna venta
   - Si `true`: El IVA está disponible

2. **Nivel Producto** (`Product.IsTaxable`)
   - Si `false`: El producto es exento de IVA
   - Si `true`: El producto puede tener IVA

3. **Nivel Venta** (Toggle en POS)
   - El usuario puede elegir aplicar o no IVA en la venta actual
   - Si está desactivado, no se aplica IVA aunque el producto sea taxable

### Cálculo de IVA

**Regla estricta:** Seguir `pricing_calculation_rules.md`

```
Para cada línea:
1. rawSubtotal = quantity × unitPrice
2. discountedSubtotal = rawSubtotal - discount
3. SI (Company.IsTaxEnabled AND Product.IsTaxable AND ApplyTaxToggle):
     taxAmount = discountedSubtotal × Company.TaxRate
   SINO:
     taxAmount = 0
4. lineTotal = discountedSubtotal + taxAmount
```

### UI del Toggle IVA

- **Posición:** Visible y accesible en todo momento
- **Estado por defecto:** ON (si la empresa tiene IVA habilitado)
- **Feedback visual:** Recalcular totales inmediatamente al cambiar
- **Label claro:** "Aplicar IVA (15%)" o similar

---

## Reglas de Descuentos

### Descuento por Producto

- **Solo disponible si** `Product.AllowDiscount = true`
- **Tipos:**
  - Fijo (monto en moneda)
  - Porcentaje (%)
- **Validación:** No puede dejar subtotal negativo

**UI:**
- Si `AllowDiscount = false`: Campo deshabilitado o oculto
- Si `AllowDiscount = true`: Campo habilitado con selector de tipo

### Descuento Global

- Se aplica **después** de descuentos por línea
- Se aplica **antes** de calcular IVA
- Se distribuye proporcionalmente entre líneas
- **Tipos:** Fijo o Porcentaje

**UI:**
- Campo visible en resumen de venta
- Recalcula totales inmediatamente

---

## Formas de Pago

### Opciones Disponibles (MVP)

1. **Efectivo** (Cash)
2. **Transferencia** (Transfer)
3. **Tarjeta** (Card)

### UI

- **Selector obligatorio** antes de guardar venta
- Puede ser:
  - Radio buttons
  - Botones grandes (mejor para táctil)
  - Dropdown (menos recomendado)

**Validación:**
- No se puede guardar venta sin seleccionar forma de pago

---

## Resumen de Totales

Debe mostrarse en todo momento, actualizado en tiempo real:

```
┌─────────────────────────────────────┐
│ Subtotal:        $1,000.00          │
│ Descuento:       -$100.00           │
│ Subtotal desc.:  $900.00            │
│ IVA (15%):       $135.00            │
│ ─────────────────────────────────   │
│ TOTAL:           $1,035.00          │
└─────────────────────────────────────┘
```

**Reglas:**
- Mostrar solo líneas relevantes (si no hay descuento, no mostrar)
- **TOTAL** debe destacarse visualmente
- Actualización inmediata al cambiar cualquier valor

---

## Restricciones del MVP

### NO Incluido

- ❌ Formularios largos
- ❌ Pasos innecesarios
- ❌ Navegación a otras pantallas durante la venta
- ❌ Inventario en tiempo real
- ❌ Validación de stock
- ❌ Múltiples formas de pago en una venta
- ❌ Pagos parciales
- ❌ Propinas
- ❌ Notas extensas

### SÍ Incluido

- ✅ Selección rápida de productos
- ✅ Búsqueda instantánea
- ✅ Agrupación por tipo
- ✅ Descuentos flexibles
- ✅ IVA configurable
- ✅ 3 formas de pago
- ✅ Cálculos determinísticos
- ✅ Feedback visual inmediato

---

## Validaciones Obligatorias

Antes de guardar la venta:

- [ ] Cliente seleccionado
- [ ] Al menos 1 producto agregado
- [ ] Todas las cantidades > 0
- [ ] Forma de pago seleccionada
- [ ] Totales calculados correctamente
- [ ] Límites de plan no excedidos

---

## Manejo de Errores

### Error 403: Límite de Plan Excedido

**Mensaje:**
```
⚠️ Límite de ventas alcanzado

Has alcanzado el límite de tu plan Starter (300 ventas/mes).

[Actualizar a Plan Pro]  [Cancelar]
```

**Comportamiento:**
- No permitir guardar la venta
- Mostrar mensaje claro
- Ofrecer upgrade inmediato

### Otros Errores

- Validación de campos en tiempo real
- Mensajes claros y accionables
- No bloquear la UI completa

---

## Performance

### Objetivos

- Carga inicial del POS: < 1 segundo
- Búsqueda de productos: < 200ms
- Recalculo de totales: instantáneo (< 50ms)
- Guardado de venta: < 2 segundos

### Optimizaciones

- Cargar solo productos activos
- Paginación en búsqueda (si > 100 productos)
- Debounce en búsqueda (300ms)
- Cálculos en frontend (validados en backend)

---

## Consistencia Visual

### Referencia de Diseño

**La UI de la pantalla de Ventas es la referencia visual.**

El POS debe alinearse con:
- Layout (grid, spacing, containers)
- Botones (tamaños, colores, iconos)
- Espaciados (padding, margin, gaps)
- Tipografía
- Colores
- Comportamiento de modales

---

## Regla Final

**Si el usuario no puede crear una venta completa en menos de 30 segundos, el POS no está optimizado.**

El POS es la herramienta más usada del sistema. Debe ser:
- **Rápido**
- **Intuitivo**
- **Sin fricción**
- **Visualmente claro**

---

**FIN DEL DOCUMENTO**
