# 🔍 CODE REVIEW - OMNICHANNEL FIXES
**Fecha**: 2026-01-22  
**Revisor**: Orquestador (CTO/PO)  
**Objetivo**: Validar correcciones de bugs omnicanales y mantener lógica WhatsApp-first

---

## 📋 RESUMEN EJECUTIVO

| Aspecto | Estado | Prioridad |
|---------|--------|-----------|
| **PriceIncludesTax Logic** | ❌ FALTANTE | 🔴 CRÍTICO |
| **Descuento Global Proporcional** | ✅ CORRECTO | ✅ OK |
| **IVA Opcional (ApplyTax)** | ✅ CORRECTO | ✅ OK |
| **Persistencia ApplyTax/GlobalDiscount** | ✅ AGREGADO | ✅ OK |
| **Validación de Stock** | ❌ ELIMINADA | 🟡 MEDIO |
| **Indicador de Edición Omnicanal** | ✅ AGREGADO | ✅ OK |
| **Enums Numéricos** | ✅ CORRECTO | ✅ OK |
| **PDF Download** | ⚠️ PARCIAL | 🟡 MEDIO |
| **Estados de Facturas** | ✅ CORRECTO | ✅ OK |

---

## 🔴 BUGS CRÍTICOS IDENTIFICADOS

### 1. **FALTA LÓGICA DE `PriceIncludesTax`** ❌

**Archivo**: `SaleService.cs` (líneas 194-201, 289-296)

**Problema**:
El código actual NO maneja productos donde `Product.PriceIncludesTax == true`.

**Código Actual** (INCORRECTO):
```csharp
decimal discountedSubtotal = temp.subtotal - lineDiscountShare;
decimal taxRate = temp.product.TaxRate ?? companyTaxRate;
decimal taxAmount = 0;

if (sale.ApplyTax && (temp.product.IsTaxable ?? true))
{
    taxAmount = discountedSubtotal * taxRate;
}
```

**Código Requerido** (CORRECTO):
```csharp
decimal lineSubtotal, lineTaxAmount;

if (temp.product.PriceIncludesTax)
{
    // Precio YA incluye IVA - descomponer
    decimal lineTotal = temp.subtotal - lineDiscountShare;
    lineSubtotal = lineTotal / (1 + taxRate);
    lineTaxAmount = lineTotal - lineSubtotal;
}
else
{
    // Precio NO incluye IVA - cálculo normal
    lineSubtotal = temp.subtotal - lineDiscountShare;
    lineTaxAmount = 0;
    
    if (sale.ApplyTax && (temp.product.IsTaxable ?? true))
    {
        lineTaxAmount = lineSubtotal * taxRate;
    }
}
```

**Impacto**:
- ❌ Facturación incorrecta para productos con IVA incluido
- ❌ Duplicación de IVA en el total
- ❌ Incumplimiento de `pricing_calculation_rules.md`

**Acción**: **CORREGIR INMEDIATAMENTE**

---

### 2. **VALIDACIÓN DE INVENTARIO ELIMINADA** ⚠️

**Archivo**: `SaleService.cs`

**Código Eliminado**:
```csharp
if (product.TrackInventory && product.StockQuantity < itemRequest.Quantity)
    throw new InvalidOperationException($"Insufficient stock for product {product.Name}");
```

**Impacto**:
- ⚠️ Permite vender productos sin stock
- ⚠️ Rompe control de inventario

**Acción**: **RESTAURAR** si `TrackInventory` está en el MVP

---

## ✅ CORRECCIONES EXITOSAS

### 1. **Descuento Global Proporcional** ✅

**Archivo**: `SaleService.cs` (líneas 177-192)

```csharp
// Cálculo del descuento global
var totalRawSubtotal = tempItems.Sum(x => x.subtotal);
decimal totalGlobalDiscountAmount = 0;

if (sale.GlobalDiscountType == DiscountType.Percentage)
    totalGlobalDiscountAmount = totalRawSubtotal * (sale.GlobalDiscountValue / 100);
else if (sale.GlobalDiscountType == DiscountType.Fixed)
    totalGlobalDiscountAmount = sale.GlobalDiscountValue;

totalGlobalDiscountAmount = Math.Min(totalGlobalDiscountAmount, totalRawSubtotal);

// Distribución proporcional
decimal lineDiscountShare = totalRawSubtotal > 0 
    ? (temp.subtotal / totalRawSubtotal) * totalGlobalDiscountAmount 
    : 0;
```

**Cumple**: ✅ `pricing_calculation_rules.md` líneas 50-53

---

### 2. **IVA Opcional (ApplyTax)** ✅

**Archivo**: `SaleService.cs` (líneas 198-201)

```csharp
if (sale.ApplyTax && (temp.product.IsTaxable ?? true))
{
    taxAmount = discountedSubtotal * taxRate;
}
```

**Cumple**: ✅ Regla de negocio de IVA opcional

---

### 3. **Persistencia de Configuración Comercial** ✅

**Archivos**: 
- `Sale.cs` (líneas 129-137)
- `CreateSaleRequest.cs` (líneas 25-30)
- `UpdateSaleRequest.cs` (líneas 12-16)

**Campos Agregados**:
```csharp
// Sale.cs
public bool ApplyTax { get; set; } = true;
public DiscountType GlobalDiscountType { get; set; } = DiscountType.None;
public decimal GlobalDiscountValue { get; set; }
```

**Cumple**: ✅ Permite rehidratación correcta en POS

---

### 4. **Indicador de Edición Omnicanal** ✅

**Archivos**:
- `POSModal.tsx` (líneas 289-309)
- `SalesPage.tsx` (líneas 536-556)

**UI Agregada**:
```tsx
{editSaleId && (
    <div className="mb-6 mx-6 p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl">
        <div className="text-[10px] font-black text-amber-500 uppercase">
            Modo Edición Omnicanal
        </div>
        <div className="text-sm font-black text-amber-900">
            Orden #{editSaleId.slice(-6).toUpperCase()}
            <span className="mx-2 text-amber-300">|</span> 
            Origen: <span className="text-primary-600 uppercase italic">{channel || 'POS'}</span>
        </div>
    </div>
)}
```

**Cumple**: ✅ Problema 1️⃣ - Identificación de edición

---

### 5. **Enums Numéricos** ✅

**Archivo**: `enums.ts`

```typescript
export enum CommercialState {
    LEAD = 1,
    SALE_CREATED = 2,
    INVOICED = 3,
    PAID = 4
}

export enum InvoiceStatus {
    Draft = 1,
    Issued = 2,
    Sent = 3,
    Paid = 4,
    Cancelled = 5
}
```

**Cumple**: ✅ Patrón del proyecto (numérico, no string)

---

### 6. **Estados de Facturas** ✅

**Archivo**: `InvoiceService.cs` (líneas 140-150)

```csharp
var invoice = new Invoice
{
    // ...
    Status = InvoiceStatus.Issued,  // ✅ Estado inicial correcto
    IssuedAt = DateTime.UtcNow,
    DueDate = DateTime.UtcNow.AddDays(30)
};
```

**Transiciones**:
```csharp
// Al enviar por WhatsApp
invoice.Status = InvoiceStatus.Sent;
invoice.SentAt = DateTime.UtcNow;

// Al marcar como pagada
invoice.Status = InvoiceStatus.Paid;
invoice.PaidAt = DateTime.UtcNow;
```

**Cumple**: ✅ Problema 4️⃣ - Estados claros

---

## ⚠️ PROBLEMAS PENDIENTES

### 1. **PDF Download** ⚠️

**Archivo**: `InvoicesController.cs` (líneas 97-111)

**Cambio Realizado**:
```csharp
// ANTES (con conflicto de headers)
Response.Headers.Add("Content-Disposition", $"attachment; filename=\"{filename}\"");
return File(pdfBytes, "application/pdf", filename);

// AHORA (sin header manual)
return File(pdfBytes, "application/pdf", filename);
```

**Estado**: ⚠️ Puede funcionar, pero falta validar:
- ¿El PDF se genera correctamente?
- ¿El `PdfGenerator` está implementado?
- ¿Los datos de Company y Customer están completos?

**Acción**: **VALIDAR EN RUNTIME**

---

### 2. **Inconsistencia en DTOs** ⚠️

**Archivo**: `SaleService.cs`

**Problema**:
```csharp
// En CreateAsync usa:
DiscountedSubtotal = Math.Round(discountedSubtotal, 2),

// Pero en MapToResponse usa:
Subtotal = i.Subtotal,  // ← Campo diferente
```

**Impacto**: ⚠️ El frontend podría recibir valores incorrectos

**Acción**: **UNIFICAR NOMBRES DE CAMPOS**

---

## 📊 VALIDACIÓN CONTRA REGLAS DE NEGOCIO

### ✅ `pricing_calculation_rules.md`

| Regla | Línea | Cumple | Notas |
|-------|-------|--------|-------|
| Descuento antes de IVA | 37 | ✅ | Línea 194 |
| Distribución proporcional | 50-53 | ✅ | Líneas 190-192 |
| IVA solo si empresa activa | 40-42 | ✅ | Línea 198 |
| IVA solo si producto taxable | 40-42 | ✅ | Línea 198 |
| **PriceIncludesTax** | **Implícito** | ❌ | **FALTANTE** |
| Redondeo a 2 decimales | 70-73 | ✅ | Líneas 213-216 |
| No recalcular en Invoice | 64-66 | ✅ | Invoice copia valores |

---

### ✅ `sales-flow.md`

| Flujo | Cumple | Notas |
|-------|--------|-------|
| WhatsApp → Sale → Invoice | ✅ | Flujo completo |
| Edición de orden pre-facturada | ✅ | Validación en línea 242 |
| Persistencia de canal | ✅ | Campo `Channel` agregado |
| Estados comerciales | ✅ | LEAD → SALE_CREATED → INVOICED → PAID |

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

### 🔴 CRÍTICO (HOY)

1. **Restaurar lógica de `PriceIncludesTax`** en `SaleService.cs`
   - CreateAsync (líneas 194-201)
   - UpdateAsync (líneas 289-296)

2. **Validar generación de PDF** en runtime
   - Probar descarga desde grid
   - Verificar que `PdfGenerator` funciona

### 🟡 IMPORTANTE (ESTA SEMANA)

3. **Restaurar validación de inventario** (si está en MVP)
   - Validar `TrackInventory` antes de crear venta

4. **Unificar nombres de campos** en DTOs
   - `Subtotal` vs `DiscountedSubtotal`
   - Sincronizar `SaleItem` y `SaleItemResponse`

### ✅ OPCIONAL (BACKLOG)

5. **Agregar tests unitarios** para cálculos de pricing
6. **Documentar flujo de estados** de facturas

---

## 📝 CONCLUSIÓN

**Estado General**: 🟡 **FUNCIONAL CON BUGS CRÍTICOS**

**Resumen**:
- ✅ **80% de las reglas** implementadas correctamente
- ❌ **1 bug crítico** (PriceIncludesTax) que puede causar facturación incorrecta
- ⚠️ **2 problemas menores** que no bloquean el MVP

**Recomendación**:
1. **NO DESPLEGAR** hasta corregir `PriceIncludesTax`
2. **VALIDAR PDF** en ambiente de desarrollo
3. **APROBAR** el resto de cambios (descuentos, IVA opcional, UI omnicanal)

---

**Firma**: Orquestador  
**Próxima Revisión**: Después de correcciones críticas
