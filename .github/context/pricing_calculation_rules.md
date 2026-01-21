# PRICING CALCULATION RULES (MVP)

Este documento define la ÚNICA forma válida de calcular precios,
descuentos, impuestos y totales en el sistema.

---

## Principios
- Cálculos determinísticos
- Mismas reglas para POS, Sale, Invoice, PDF y WhatsApp
- Sin supuestos implícitos
- Sin redondeos ocultos

---

## Unidades
- Cada producto tiene UNA unidad de medida
- No existe conversión de unidades en MVP
- Cantidad > 0

---

## Precio base
- `basePrice` es precio por unidad
- No incluye impuestos

---

## Cálculo por línea (SaleItem)

1. `rawSubtotal = quantity × unitPrice`

2. Descuento por línea:
   - Tipo: fijo o porcentaje
   - No puede dejar subtotal negativo

3. `discountedSubtotal = rawSubtotal - discount`

4. Impuesto:
   - Aplica solo si:
     - Empresa tiene IVA activo
     - Producto es taxable

5. `taxAmount = discountedSubtotal × taxRate`

6. `lineTotal = discountedSubtotal + taxAmount`

---

## Descuento global
- Se aplica después de descuentos por línea
- Antes de impuestos
- Se distribuye proporcionalmente

---

## Totales de venta
- `subtotal = suma discountedSubtotals`
- `taxTotal = suma taxAmounts`
- `total = subtotal + taxTotal`

---

## Facturas
- Copian valores de la venta
- NO recalculan montos

---

## Redondeo
- Solo al final de línea y total
- 2 decimales
- Half-up

---

## Prohibido
- Recalcular en invoice
- Impuestos antes de descuentos
- Totales negativos
- Suposiciones automáticas

---

## Regla final
Si dos totales difieren en cualquier lugar,
es un bug crítico.
