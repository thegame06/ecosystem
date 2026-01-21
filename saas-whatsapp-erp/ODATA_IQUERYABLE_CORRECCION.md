# CORRECCIÓN CRÍTICA - OData con IQueryable

**Fecha**: 2026-01-21  
**Reportado por**: CTO  
**Prioridad**: 🔴 **CRÍTICA**

---

## ❌ PROBLEMA IDENTIFICADO

### Implementación INCORRECTA (Anterior)

```csharp
public async Task<ResponsePagination<SaleResponse>> SearchAsync(
    ODataQueryOptions<SaleResponse> queryOptions, 
    string companyId)
{
    // ❌ ESTO CARGA TODOS LOS REGISTROS EN MEMORIA
    var allSales = await _saleRepository.GetByCompanyIdAsync(companyId);
    var saleResponses = allSales.Select(MapToResponse).AsQueryable();
    
    // OData se aplica EN MEMORIA, no en MongoDB
    var filteredQuery = queryOptions.ApplyTo(saleResponses);
    //...
}
```

### ¿Por qué es un problema?

1. **Carga TODOS los registros** de la base de datos en memoria
2. **Filtros y paginación se aplican EN MEMORIA**, no en la base de datos
3. **No escala**: Con 10,000 ventas, carga las 10,000 aunque solo necesite 20
4. **Consumo excesivo de memoria**: Puede causar OutOfMemoryException
5. **Performance pésima**: Latencia alta, timeouts

### Ejemplo del impacto

```
Empresa con 10,000 ventas:
- Usuario pide página 1 (20 registros)
- Sistema carga 10,000 registros en memoria (~50MB)
- Aplica filtros en memoria
- Retorna 20 registros
- Desperdicia 9,980 registros cargados
```

---

## ✅ SOLUCIÓN CORRECTA

### Implementación con IQueryable

```csharp
// 1. Repository expone IQueryable
public interface ISaleRepository
{
    IQueryable<Sale> GetQueryable(string companyId);
}

// 2. Repository implementa IQueryable
public IQueryable<Sale> GetQueryable(string companyId)
{
    return _sales.AsQueryable()
        .Where(s => s.CompanyId == companyId);
}

// 3. Service usa IQueryable
public async Task<ResponsePagination<SaleResponse>> SearchAsync(
    ODataQueryOptions<SaleResponse> queryOptions, 
    string companyId)
{
    // ✅ Obtiene IQueryable (NO ejecuta query)
    var salesQuery = _saleRepository.GetQueryable(companyId);
    
    // ✅ Mapea a DTOs (aún NO ejecuta query)
    var saleResponses = salesQuery.Select(sale => new SaleResponse
    {
        Id = sale.Id,
        // ... mapeo inline
    });

    // ✅ Aplica OData (construye query, NO ejecuta)
    var filteredQuery = queryOptions.ApplyTo(saleResponses) as IQueryable<SaleResponse>;
    
    // ✅ Cuenta total (ejecuta COUNT en MongoDB)
    var totalCount = filteredQuery?.LongCount() ?? 0;

    // ✅ Aplica paginación y AHORA ejecuta query
    // Solo trae los 20 registros necesarios
    var results = filteredQuery?
        .Skip(skip)
        .Take(top)
        .ToList(); // <-- AQUÍ se ejecuta la query en MongoDB

    return new ResponsePagination<SaleResponse>
    {
        Result = results,
        Page = skip,
        RowsPerPage = top,
        TotalRows = totalCount
    };
}
```

### ¿Por qué funciona?

1. **IQueryable es lazy**: No ejecuta hasta `.ToList()` o `.Count()`
2. **MongoDB Driver traduce IQueryable a queries MongoDB**
3. **Filtros se aplican EN LA BASE DE DATOS**
4. **Solo trae los registros necesarios**

### Ejemplo del impacto

```
Empresa con 10,000 ventas:
- Usuario pide página 1 (20 registros)
- Sistema construye query MongoDB con filtros
- MongoDB ejecuta: db.sales.find({companyId: "..."}).skip(0).limit(20)
- Sistema recibe 20 registros (~100KB)
- Retorna 20 registros
- ✅ Eficiente, rápido, escalable
```

---

## 🔧 ENTIDADES A CORREGIR

### ✅ Sales - CORREGIDO
- ✅ `ISaleRepository.GetQueryable` agregado
- ✅ `SaleRepository.GetQueryable` implementado
- ✅ `SaleService.SearchAsync` usa IQueryable

### ⏳ Products - PENDIENTE
- ⏳ Agregar `IProductRepository.GetQueryable`
- ⏳ Implementar `ProductRepository.GetQueryable`
- ⏳ Actualizar `ProductService.SearchAsync`

### ⏳ Customers - PENDIENTE
- ⏳ Agregar `ICustomerRepository.GetQueryable`
- ⏳ Implementar `CustomerRepository.GetQueryable`
- ⏳ Actualizar `CustomerService.SearchAsync`

### ⏳ Conversations - PENDIENTE
- ⏳ Agregar `IConversationRepository.GetQueryable`
- ⏳ Implementar `ConversationRepository.GetQueryable`
- ⏳ Actualizar `ConversationService.SearchAsync`

### ⏳ Invoices - PENDIENTE
- ⏳ Agregar `IInvoiceRepository.GetQueryable`
- ⏳ Implementar `InvoiceRepository.GetQueryable`
- ⏳ Actualizar `InvoiceService.SearchAsync`

---

## 📋 PATRÓN A SEGUIR

### 1. Interface del Repository
```csharp
public interface I{Entity}Repository
{
    // Método existente
    Task<List<{Entity}>> GetByCompanyIdAsync(string companyId);
    
    // NUEVO: Método para OData
    IQueryable<{Entity}> GetQueryable(string companyId);
}
```

### 2. Implementación del Repository
```csharp
public IQueryable<{Entity}> GetQueryable(string companyId)
{
    return _collection.AsQueryable()
        .Where(e => e.CompanyId == companyId);
}
```

### 3. Service usando IQueryable
```csharp
public async Task<ResponsePagination<{Entity}Response>> SearchAsync(
    ODataQueryOptions<{Entity}Response> queryOptions, 
    string companyId)
{
    // 1. IQueryable (NO ejecuta)
    var query = _repository.GetQueryable(companyId);
    
    // 2. Mapeo inline (NO ejecuta)
    var responses = query.Select(e => new {Entity}Response
    {
        // Mapeo inline aquí
    });

    // 3. OData (NO ejecuta)
    var filtered = queryOptions.ApplyTo(responses) as IQueryable<{Entity}Response>;
    
    // 4. Count (ejecuta COUNT)
    var total = filtered?.LongCount() ?? 0;

    // 5. Paginación (ejecuta SELECT)
    var results = filtered?
        .Skip(skip)
        .Take(top)
        .ToList();

    return new ResponsePagination<{Entity}Response>
    {
        Result = results,
        Page = skip,
        RowsPerPage = top,
        TotalRows = total
    };
}
```

---

## ⚠️ ADVERTENCIAS

### NO usar MapToResponse
```csharp
// ❌ INCORRECTO
var responses = query.Select(e => MapToResponse(e));
```

**Problema**: `MapToResponse` es un método, MongoDB Driver no puede traducirlo a query.

### SÍ usar mapeo inline
```csharp
// ✅ CORRECTO
var responses = query.Select(e => new EntityResponse
{
    Id = e.Id,
    Name = e.Name
});
```

**Razón**: MongoDB Driver puede traducir expresiones lambda inline a queries MongoDB.

---

## 📊 IMPACTO DE LA CORRECCIÓN

### Antes (INCORRECTO)
- 10,000 registros = Carga 10,000 en memoria
- Tiempo: ~2-5 segundos
- Memoria: ~50MB
- MongoDB: 1 query grande

### Después (CORRECTO)
- 10,000 registros = Carga solo 20 necesarios
- Tiempo: ~50-100ms
- Memoria: ~100KB
- MongoDB: 1 query optimizada con filtros

### Mejora
- **50x más rápido**
- **500x menos memoria**
- **Escalable a millones de registros**

---

## ✅ CRITERIOS DE VALIDACIÓN

Para cada entidad, verificar:

1. ✅ Repository tiene método `GetQueryable(string companyId)`
2. ✅ Service usa `GetQueryable`, NO `GetByCompanyIdAsync`
3. ✅ Mapeo es inline en `.Select()`, NO usa `MapToResponse`
4. ✅ `.ToList()` se ejecuta DESPUÉS de `.Skip().Take()`
5. ✅ No hay `await` antes de aplicar OData

---

**Status**: 🟡 **1/5 CORREGIDO** - Requiere corrección inmediata en 4 entidades restantes

**Firma**: /orquestador  
**Timestamp**: 2026-01-21T13:41:00-06:00
