# REPORTE DE AUDITORÍA - Frontend Type Safety & Backend Alignment

**Fecha**: 2026-01-21
**Auditor**: Orquestador
**Prioridad**: 🔴 CRÍTICA

---

## 1️⃣ PROBLEMAS IDENTIFICADOS

### A. Enums Mal Definidos
**Problema**: Los enums en el frontend estaban definidos como strings, cuando el backend usa valores numéricos.

**Ejemplo Incorrecto**:
```typescript
export enum CommercialState {
    LEAD = 'LEAD',  // ❌ String
    SALE_CREATED = 'SALE_CREATED'
}
```

**Ejemplo Correcto**:
```typescript
export enum CommercialState {
    LEAD = 1,  // ✅ Numeric
    SALE_CREATED = 2
}
```

**Impacto**: Incompatibilidad total con el backend. Las comparaciones fallarían.

---

### B. Falta de Labels de Traducción
**Problema**: Los valores de enum se mostraban directamente en la UI sin traducción.

**Solución Implementada**:
```typescript
export const COMMERCIAL_STATE_LABELS: Record<CommercialState, string> = {
    [CommercialState.LEAD]: 'Nuevo Lead',
    [CommercialState.SALE_CREATED]: 'Venta Creada',
    // ...
};

export const COMMERCIAL_STATE_COLORS: Record<CommercialState, string> = {
    [CommercialState.LEAD]: 'bg-blue-100 text-blue-700',
    // ...
};
```

---

### C. Falta de Paginación
**Problema**: Endpoints que retornan N valores no tienen soporte de paginación.

**Endpoints Afectados**:
- `GET /api/products` - Puede retornar cientos de productos
- `GET /api/conversations` - Puede retornar miles de conversaciones
- `GET /api/sales` - Puede retornar miles de ventas
- `GET /api/invoices` - Puede retornar miles de facturas
- `GET /api/customers` - Puede retornar miles de clientes

**Impacto**: Performance degradada, timeouts, consumo excesivo de memoria.

**Solución Requerida**:
```typescript
export interface PagedRequest {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface PagedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
```

---

### D. Inconsistencia Product Model
**Problema**: El `domain_model.md` define un Product simplificado, pero el backend real tiene un modelo más completo.

**Modelo en Documentación** (domain_model.md):
```
- BasePrice
- Unit
- IsTaxable
- AllowDiscount
```

**Modelo en Backend Real** (Product.cs):
```
- Price
- CostPrice
- TaxRate
- Unit
- Discount
- TrackInventory
- StockQuantity
- RentalPricePerDay
- RentalPricePerHour
```

**Decisión**: Actualicé el frontend para coincidir con el backend **real** (fuente de verdad ejecutable).

**Acción Requerida**: Actualizar `domain_model.md` para reflejar el modelo real.

---

## 2️⃣ CORRECCIONES IMPLEMENTADAS

### ✅ Archivo: `types/enums.ts` (NUEVO)
- Definidos todos los enums con valores numéricos
- Agregados labels de traducción en español
- Agregados mapas de colores para UI

### ✅ Archivo: `types/conversation.ts`
- Removido enum local CommercialState
- Importado desde enums.ts centralizados

### ✅ Archivo: `types/product.ts`
- Removido enum local ProductType
- Actualizado modelo Product para coincidir con backend real
- Corregidos CreateProductRequest y UpdateProductRequest

### ✅ Archivo: `types/auth.ts`
- Removido enum local PlanType
- Importado desde enums.ts centralizados

### ✅ Archivo: `types/pagination.ts` (NUEVO)
- Creados tipos genéricos para paginación
- Preparado para implementación backend

---

## 3️⃣ TRABAJO PENDIENTE (CRÍTICO)

### Backend - Agregar Paginación
**Prioridad**: 🔴 ALTA

Todos los endpoints GET que retornan colecciones deben soportar paginación:

```csharp
[HttpGet]
public async Task<ActionResult<PagedResponse<ProductResponse>>> GetAll(
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? sortBy = null,
    [FromQuery] bool sortDescending = false)
{
    // Implementation
}
```

**Endpoints a Modificar**:
1. `ProductsController.GetAll()`
2. `ConversationsController.GetAll()`
3. `SalesController.GetAll()`
4. `InvoicesController.GetAll()`
5. `CustomersController.GetAll()`

---

### Frontend - Implementar Paginación UI
**Prioridad**: 🔴 ALTA

Una vez que el backend soporte paginación, actualizar:

1. `ConversationsPage` - Agregar paginador
2. `ProductsPage` - Agregar paginador
3. Crear componente `<Paginator />` reutilizable

---

### Documentación - Actualizar domain_model.md
**Prioridad**: 🟡 MEDIA

Actualizar la definición de Product para reflejar el modelo real:

```markdown
### Product (`Product.cs`)
Representa un producto o servicio que puede ser vendido.

**Key Fields**:
- `Id`
- `CompanyId`
- `Name`
- `Description` (optional)
- `Type` (Tangible, Service, Rentable)
- `Price` (precio de venta)
- `CostPrice` (opcional)
- `TaxRate` (opcional, si null usa el de la empresa)
- `Unit` (opcional)
- `Discount` (opcional)
- `TrackInventory` (bool)
- `StockQuantity`
- `RentalPricePerDay` (opcional)
- `RentalPricePerHour` (opcional)
- `IsActive`
- `CreatedAt`
- `UpdatedAt`
```

---

## 4️⃣ REGLAS DE GOBERNANZA

### ✅ Regla 1: Enums Numéricos
Todos los enums deben usar valores numéricos que coincidan exactamente con el backend.

### ✅ Regla 2: Labels Separados
Los labels de traducción deben estar en mapas `Record<Enum, string>` separados.

### ✅ Regla 3: Paginación Obligatoria
Todo endpoint que retorne colecciones DEBE soportar paginación.

### ✅ Regla 4: Backend es la Fuente de Verdad
Si hay conflicto entre documentación y código backend, el código backend prevalece.

---

## 5️⃣ PRÓXIMOS PASOS

1. **Inmediato**: Implementar paginación en backend (Controllers)
2. **Inmediato**: Crear componente Paginator en frontend
3. **Corto Plazo**: Actualizar domain_model.md
4. **Corto Plazo**: Agregar tests de integración para paginación

---

**Firma**: /orquestador
**Status**: ⚠️ BLOQUEANTE - Requiere acción inmediata en paginación
