# SERVER-SIDE FILTERING, SEARCH & PAGINATION

**Última actualización:** 2026-01-22  
**Estado:** Reglas obligatorias para el MVP

---

## Principio Fundamental

**TODO debe ejecutarse server-side usando OData.**

**NUNCA:**
- ❌ Cargar todos los registros en memoria
- ❌ Filtrar en frontend
- ❌ Paginar en frontend
- ❌ Buscar en arrays JavaScript

**SIEMPRE:**
- ✅ Usar OData `$filter`, `$skip`, `$top`
- ✅ Ejecutar queries en MongoDB
- ✅ Retornar solo los datos necesarios
- ✅ Incluir metadata de paginación

---

## OData Query Structure

### Formato Estándar

```
GET /api/products?$filter=contains(name,'laptop')&$skip=0&$top=20&$orderby=name asc
```

### Componentes

| Parámetro | Propósito | Ejemplo |
|-----------|-----------|---------|
| `$filter` | Filtrado | `contains(name,'laptop')` |
| `$skip` | Offset para paginación | `0`, `20`, `40` |
| `$top` | Cantidad de registros | `10`, `20`, `50`, `100` |
| `$orderby` | Ordenamiento | `name asc`, `createdAt desc` |
| `$count` | Incluir total de registros | `true` |

---

## 1️⃣ Búsqueda (Search)

### Implementación Backend

**Usar OData `contains()` function:**

```csharp
// ❌ INCORRECTO (en memoria)
var results = allProducts.Where(p => p.Name.Contains(searchTerm));

// ✅ CORRECTO (OData en MongoDB)
var query = collection.AsQueryable();
if (!string.IsNullOrEmpty(searchTerm))
{
    query = query.Where(p => p.Name.Contains(searchTerm));
}
var results = await query.ToListAsync();
```

### Query OData

```
$filter=contains(tolower(name), tolower('laptop'))
```

**Características:**
- Case-insensitive (usando `tolower()`)
- Búsqueda parcial (substring match)
- Ejecutado en MongoDB

### Frontend

```typescript
const searchProducts = async (searchTerm: string) => {
  const filter = searchTerm 
    ? `contains(tolower(name), tolower('${searchTerm}'))` 
    : '';
  
  const response = await api.get(`/products?$filter=${filter}&$top=20`);
  return response.data;
};
```

---

## 2️⃣ Filtros (Filters)

### Tipos de Filtros

#### Filtro por Campo Exacto

```
$filter=type eq 'Tangible'
```

#### Filtro por Rango

```
$filter=basePrice ge 100 and basePrice le 500
```

#### Filtro por Booleano

```
$filter=isActive eq true
```

#### Filtros Combinados

```
$filter=type eq 'Service' and isActive eq true and basePrice le 1000
```

### Implementación Backend

```csharp
// ✅ CORRECTO
var query = collection.AsQueryable();

if (type.HasValue)
{
    query = query.Where(p => p.Type == type.Value);
}

if (isActive.HasValue)
{
    query = query.Where(p => p.IsActive == isActive.Value);
}

var results = await query.ToListAsync();
```

### Frontend

```typescript
interface ProductFilters {
  type?: ProductType;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

const buildFilterString = (filters: ProductFilters): string => {
  const conditions: string[] = [];
  
  if (filters.type) {
    conditions.push(`type eq '${filters.type}'`);
  }
  
  if (filters.isActive !== undefined) {
    conditions.push(`isActive eq ${filters.isActive}`);
  }
  
  if (filters.minPrice !== undefined) {
    conditions.push(`basePrice ge ${filters.minPrice}`);
  }
  
  if (filters.maxPrice !== undefined) {
    conditions.push(`basePrice le ${filters.maxPrice}`);
  }
  
  return conditions.join(' and ');
};
```

---

## 3️⃣ Paginación (Pagination)

### Configuración

**Tamaños de página permitidos:**
- 10 registros
- 20 registros (default)
- 50 registros
- 100 registros

### Implementación Backend

```csharp
public async Task<PagedResult<Product>> GetProductsAsync(
    int skip = 0, 
    int top = 20,
    string filter = null)
{
    var query = _collection.AsQueryable();
    
    // Aplicar filtro si existe
    if (!string.IsNullOrEmpty(filter))
    {
        // Parsear y aplicar filtro OData
        query = ApplyODataFilter(query, filter);
    }
    
    // Contar total ANTES de paginar
    var totalCount = await query.CountAsync();
    
    // Aplicar paginación
    var items = await query
        .Skip(skip)
        .Take(top)
        .ToListAsync();
    
    return new PagedResult<Product>
    {
        Items = items,
        TotalCount = totalCount,
        Skip = skip,
        Top = top
    };
}
```

### Modelo de Respuesta

```csharp
public class PagedResult<T>
{
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int Skip { get; set; }
    public int Top { get; set; }
    public int PageNumber => (Skip / Top) + 1;
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / Top);
    public bool HasPreviousPage => Skip > 0;
    public bool HasNextPage => (Skip + Top) < TotalCount;
}
```

### Frontend

```typescript
interface PaginationState {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const fetchPage = async (pageNumber: number, pageSize: number) => {
  const skip = (pageNumber - 1) * pageSize;
  const response = await api.get(
    `/products?$skip=${skip}&$top=${pageSize}&$count=true`
  );
  
  return {
    items: response.data.items,
    pagination: {
      pageNumber: response.data.pageNumber,
      pageSize: response.data.top,
      totalCount: response.data.totalCount,
      totalPages: response.data.totalPages
    }
  };
};
```

---

## 4️⃣ Ordenamiento (Sorting)

### OData Syntax

```
$orderby=name asc
$orderby=createdAt desc
$orderby=basePrice desc, name asc
```

### Implementación Backend

```csharp
var query = collection.AsQueryable();

if (!string.IsNullOrEmpty(orderBy))
{
    query = orderBy.ToLower() switch
    {
        "name asc" => query.OrderBy(p => p.Name),
        "name desc" => query.OrderByDescending(p => p.Name),
        "price asc" => query.OrderBy(p => p.BasePrice),
        "price desc" => query.OrderByDescending(p => p.BasePrice),
        _ => query.OrderBy(p => p.CreatedAt)
    };
}
```

---

## 5️⃣ Combinando Todo

### Query Completa

```
GET /api/products?
  $filter=contains(tolower(name),'laptop') and type eq 'Tangible' and isActive eq true
  &$skip=20
  &$top=20
  &$orderby=name asc
  &$count=true
```

### Implementación Backend Completa

```csharp
[HttpGet]
public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts(
    [FromQuery] string search = null,
    [FromQuery] ProductType? type = null,
    [FromQuery] bool? isActive = null,
    [FromQuery] int skip = 0,
    [FromQuery] int top = 20,
    [FromQuery] string orderBy = "name asc")
{
    // Validar pageSize
    if (!new[] { 10, 20, 50, 100 }.Contains(top))
    {
        top = 20;
    }
    
    var companyId = GetCurrentCompanyId();
    
    var query = _collection
        .AsQueryable()
        .Where(p => p.CompanyId == companyId);
    
    // Búsqueda
    if (!string.IsNullOrEmpty(search))
    {
        query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()));
    }
    
    // Filtros
    if (type.HasValue)
    {
        query = query.Where(p => p.Type == type.Value);
    }
    
    if (isActive.HasValue)
    {
        query = query.Where(p => p.IsActive == isActive.Value);
    }
    
    // Ordenamiento
    query = ApplyOrdering(query, orderBy);
    
    // Contar total
    var totalCount = await query.CountAsync();
    
    // Paginar
    var items = await query
        .Skip(skip)
        .Take(top)
        .ToListAsync();
    
    var dtos = items.Select(p => _mapper.Map<ProductDto>(p)).ToList();
    
    return Ok(new PagedResult<ProductDto>
    {
        Items = dtos,
        TotalCount = totalCount,
        Skip = skip,
        Top = top
    });
}
```

---

## 6️⃣ Frontend: Hook Reutilizable

```typescript
interface UseServerPaginationOptions<T> {
  endpoint: string;
  pageSize?: number;
  filters?: Record<string, any>;
  searchTerm?: string;
  orderBy?: string;
}

const useServerPagination = <T>({
  endpoint,
  pageSize = 20,
  filters = {},
  searchTerm = '',
  orderBy = 'createdAt desc'
}: UseServerPaginationOptions<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    try {
      const skip = (pageNumber - 1) * pageSize;
      
      // Build filter string
      const filterConditions: string[] = [];
      
      if (searchTerm) {
        filterConditions.push(
          `contains(tolower(name), tolower('${searchTerm}'))`
        );
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filterConditions.push(`${key} eq '${value}'`);
        }
      });
      
      const filterString = filterConditions.join(' and ');
      
      // Build query
      const params = new URLSearchParams({
        $skip: skip.toString(),
        $top: pageSize.toString(),
        $orderby: orderBy,
        $count: 'true'
      });
      
      if (filterString) {
        params.append('$filter', filterString);
      }
      
      const response = await api.get(`${endpoint}?${params.toString()}`);
      
      setData(response.data.items);
      setPagination({
        pageNumber: response.data.pageNumber,
        pageSize: response.data.top,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1); // Reset to page 1 when filters change
  }, [searchTerm, JSON.stringify(filters), orderBy]);

  return {
    data,
    pagination,
    loading,
    goToPage: fetchData,
    refresh: () => fetchData(pagination.pageNumber)
  };
};
```

---

## 7️⃣ Performance Considerations

### Índices MongoDB

**Obligatorio crear índices para:**

```javascript
// Productos
db.products.createIndex({ companyId: 1, name: 1 });
db.products.createIndex({ companyId: 1, type: 1 });
db.products.createIndex({ companyId: 1, isActive: 1 });
db.products.createIndex({ companyId: 1, createdAt: -1 });

// Ventas
db.sales.createIndex({ companyId: 1, customerId: 1 });
db.sales.createIndex({ companyId: 1, state: 1 });
db.sales.createIndex({ companyId: 1, createdAt: -1 });

// Clientes
db.customers.createIndex({ companyId: 1, name: 1 });
db.customers.createIndex({ companyId: 1, phones: 1 });
```

### Límites de Seguridad

```csharp
// Máximo de registros por página
const int MAX_PAGE_SIZE = 100;

// Máximo de registros para exportación
const int MAX_EXPORT_SIZE = 10000;

// Timeout para queries
const int QUERY_TIMEOUT_SECONDS = 30;
```

---

## 8️⃣ Validaciones Obligatorias

### Backend

- [ ] Validar `$top` <= 100
- [ ] Validar `$skip` >= 0
- [ ] Sanitizar inputs de búsqueda (prevenir injection)
- [ ] Validar `companyId` en todos los queries
- [ ] Aplicar timeout a queries
- [ ] Loguear queries lentos (> 1 segundo)

### Frontend

- [ ] Debounce en búsqueda (300ms)
- [ ] Mostrar loading state
- [ ] Manejar errores gracefully
- [ ] Persistir preferencias de paginación (localStorage)
- [ ] Validar inputs antes de enviar

---

## 9️⃣ Reglas Finales

### PROHIBIDO

- ❌ `ToList()` antes de aplicar filtros
- ❌ `Where()` en arrays JavaScript
- ❌ Cargar todos los registros y filtrar en memoria
- ❌ Paginación en frontend con datos completos
- ❌ Búsqueda case-sensitive

### OBLIGATORIO

- ✅ Usar OData en todos los endpoints de listado
- ✅ Ejecutar queries en MongoDB
- ✅ Incluir metadata de paginación
- ✅ Crear índices apropiados
- ✅ Validar límites de seguridad
- ✅ Loguear performance

---

## 🔟 Checklist de Implementación

Antes de considerar un endpoint como completo:

- [ ] Soporta búsqueda server-side
- [ ] Soporta filtros server-side
- [ ] Soporta paginación server-side
- [ ] Soporta ordenamiento server-side
- [ ] Incluye metadata de paginación
- [ ] Tiene índices MongoDB apropiados
- [ ] Valida límites de seguridad
- [ ] Maneja errores correctamente
- [ ] Performance < 500ms con 1000+ registros
- [ ] Documentado en Swagger/OpenAPI

---

**REGLA DE ORO:**

**Si un query carga más de 100 registros en memoria sin paginación, es un bug crítico.**

---

**FIN DEL DOCUMENTO**
