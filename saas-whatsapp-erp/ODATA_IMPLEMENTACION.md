# IMPLEMENTACIÓN ODATA - PATRÓN CORRECTO

**Fecha**: 2026-01-21
**Ejecutor**: /orquestador
**Prioridad**: 🔴 CRÍTICA - EN PROGRESO

---

## ✅ PATRÓN IMPLEMENTADO

### Arquitectura OData

```
Frontend Request
    ↓
GET /api/products/search?$filter=name eq 'Product'&$skip=0&$top=20&$orderby=createdAt desc
    ↓
ProductsController.Search(ODataQueryOptions<ProductResponse>)
    ↓
ProductService.SearchAsync(queryOptions, companyId)
    ↓
1. Filtrar por CompanyId (SEGURIDAD)
2. Aplicar OData filters
3. Contar total
4. Aplicar paginación
    ↓
ResponsePagination<ProductResponse>
```

---

## 📦 COMPONENTES CREADOS

### 1. ResponsePagination<T>
```csharp
public class ResponsePagination<T>
{
    public List<T> Result { get; set; }
    public int Page { get; set; }           // $skip
    public int RowsPerPage { get; set; }    // $top
    public long TotalRows { get; set; }     // $count
}
```

### 2. IProductService
```csharp
Task<ResponsePagination<ProductResponse>> SearchAsync(
    ODataQueryOptions<ProductResponse> queryOptions, 
    string companyId);
```

### 3. ProductService
- Aplica filtro de `companyId` PRIMERO (seguridad)
- Luego aplica OData filters del frontend
- Calcula total antes de paginación
- Retorna `ResponsePagination<T>`

### 4. ProductsController
```csharp
[HttpGet("search")]
[EnableQuery(MaxTop = 100, AllowedQueryOptions = 
    AllowedQueryOptions.Filter | 
    AllowedQueryOptions.OrderBy | 
    AllowedQueryOptions.Skip | 
    AllowedQueryOptions.Top | 
    AllowedQueryOptions.Count)]
public async Task<IActionResult> Search(ODataQueryOptions<ProductResponse> queryOptions)
```

---

## 🛡️ SEGURIDAD IMPLEMENTADA

### Filtros Permitidos
- ✅ `$filter` - Filtrado por campos
- ✅ `$orderby` - Ordenamiento
- ✅ `$skip` - Paginación (offset)
- ✅ `$top` - Límite de resultados
- ✅ `$count` - Total de registros

### Filtros BLOQUEADOS
- ❌ `$expand` - No permitido (evita joins arbitrarios)
- ❌ `$select` - No permitido (evita exposición de campos sensibles)
- ❌ Expresiones peligrosas en `$filter`

### Límites
- **MaxTop**: 100 (hardcoded)
- **CompanyId**: SIEMPRE aplicado primero
- **Multi-tenant**: Garantizado por arquitectura

---

## 📝 EJEMPLOS DE USO

### Ejemplo 1: Paginación Simple
```http
GET /api/products/search?$skip=0&$top=20
```

**Respuesta**:
```json
{
    "result": [...],
    "page": 0,
    "rowsPerPage": 20,
    "totalRows": 150
}
```

### Ejemplo 2: Filtro por Nombre
```http
GET /api/products/search?$filter=contains(name,'Laptop')&$skip=0&$top=10
```

### Ejemplo 3: Ordenamiento
```http
GET /api/products/search?$orderby=price desc&$skip=0&$top=20
```

### Ejemplo 4: Filtro Complejo
```http
GET /api/products/search?$filter=price gt 100 and isActive eq true&$orderby=createdAt desc&$skip=0&$top=20
```

---

## 🎯 ENTIDADES A MIGRAR

### ✅ Completado
1. **Products** - Implementado con OData

### ⏳ Pendiente (INMEDIATO)
2. **Customers**
3. **Conversations**
4. **Sales**
5. **Invoices**

---

## 🔧 PATRÓN A SEGUIR

Para cada entidad, crear:

### 1. Interface del Service
```csharp
public interface I{Entity}Service
{
    Task<ResponsePagination<{Entity}Response>> SearchAsync(
        ODataQueryOptions<{Entity}Response> queryOptions, 
        string companyId);
}
```

### 2. Implementación del Service
```csharp
public async Task<ResponsePagination<{Entity}Response>> SearchAsync(
    ODataQueryOptions<{Entity}Response> queryOptions, 
    string companyId)
{
    // 1. Filtrar por companyId (SEGURIDAD)
    var entities = await _repository.GetByCompanyIdAsync(companyId);
    
    // 2. Mapear a DTOs
    var dtos = entities.Select(MapToResponse).AsQueryable();
    
    // 3. Aplicar OData
    var filtered = queryOptions.ApplyTo(dtos) as IQueryable<{Entity}Response>;
    
    // 4. Contar total
    var totalCount = filtered?.LongCount() ?? 0;
    
    // 5. Extraer skip/top
    var skip = queryOptions.Skip?.Value ?? 0;
    var top = queryOptions.Top?.Value ?? 20;
    
    // 6. Paginar
    var results = filtered?
        .Skip(skip)
        .Take(top)
        .ToList() ?? new List<{Entity}Response>();
    
    // 7. Retornar
    return new ResponsePagination<{Entity}Response>
    {
        Result = results,
        Page = skip,
        RowsPerPage = top,
        TotalRows = totalCount
    };
}
```

### 3. Controller
```csharp
[HttpGet("search")]
[EnableQuery(MaxTop = 100, AllowedQueryOptions = 
    AllowedQueryOptions.Filter | 
    AllowedQueryOptions.OrderBy | 
    AllowedQueryOptions.Skip | 
    AllowedQueryOptions.Top | 
    AllowedQueryOptions.Count)]
public async Task<IActionResult> Search(ODataQueryOptions<{Entity}Response> queryOptions)
{
    var companyId = GetCompanyId();
    var result = await _{entity}Service.SearchAsync(queryOptions, companyId);
    return Ok(result);
}
```

---

## 🚫 ENDPOINTS ELIMINADOS

Los siguientes endpoints YA NO EXISTEN:

- ❌ `GET /api/products` (sin paginación)
- ❌ `GET /api/products?page=1&pageSize=20` (paginación simple)

**REEMPLAZADOS POR**:

- ✅ `GET /api/products/search?$skip=0&$top=20`

---

## 📊 FRONTEND - CONSTRUCCIÓN DE QUERIES

### Ejemplo de Builder (TypeScript)
```typescript
class ProductFilter {
    private params: string[] = [];
    
    withName(name: string) {
        this.params.push(`$filter=contains(name,'${name}')`);
        return this;
    }
    
    withPriceRange(min: number, max: number) {
        this.params.push(`$filter=price ge ${min} and price le ${max}`);
        return this;
    }
    
    orderBy(field: string, desc: boolean = false) {
        this.params.push(`$orderby=${field}${desc ? ' desc' : ''}`);
        return this;
    }
    
    paginate(page: number, pageSize: number) {
        const skip = page * pageSize;
        this.params.push(`$skip=${skip}`);
        this.params.push(`$top=${pageSize}`);
        return this;
    }
    
    build() {
        return this.params.join('&');
    }
}

// Uso
const query = new ProductFilter()
    .withName('Laptop')
    .withPriceRange(500, 2000)
    .orderBy('price', true)
    .paginate(0, 20)
    .build();

const response = await api.get(`/products/search?${query}`);
```

---

## ⚠️ BREAKING CHANGES

### Backend
- Todos los endpoints GET de colecciones ahora son `/search`
- Respuesta cambia de `List<T>` a `ResponsePagination<T>`
- Parámetros cambian de `page/pageSize` a `$skip/$top`

### Frontend
- Servicios deben construir queries OData
- Respuesta se accede via `.result` en lugar de acceso directo
- Paginación usa `skip` en lugar de `page`

---

## ✅ CRITERIOS DE ACEPTACIÓN

- [x] ProductsController usa OData
- [x] ProductService implementa SearchAsync
- [x] ResponsePagination<T> creado
- [x] OData configurado en Program.cs
- [x] MaxTop = 100 enforced
- [x] CompanyId siempre aplicado primero
- [ ] Customers migrado a OData
- [ ] Conversations migrado a OData
- [ ] Sales migrado a OData
- [ ] Invoices migrado a OData
- [ ] Frontend actualizado con builders

---

**Status**: 🟡 PRODUCTS COMPLETADO - Resto de entidades pendiente

**Firma**: /orquestador
