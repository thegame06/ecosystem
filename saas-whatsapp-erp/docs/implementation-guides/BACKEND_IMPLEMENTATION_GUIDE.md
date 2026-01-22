# 🔧 BACKEND IMPLEMENTATION GUIDE

**Fecha:** 2026-01-22  
**Agente:** @/backend  
**Prioridad:** Alta  
**Estimación:** 2-3 días

---

## 📋 Contexto

Implementar las correcciones y actualizaciones documentadas en:
- `pending-updates-and-corrections.md`
- `domain-model.md` (actualizado)
- `server-side-data-operations.md`

---

## 🎯 Objetivos

1. ✅ Agregar soporte para formas de pago en ventas
2. ✅ Implementar filtros/búsqueda/paginación OData en todos los endpoints
3. ✅ Validar y corregir reglas de IVA
4. ✅ Corregir bug de persistencia de IVA en productos

---

## 📦 FASE 1: Payment Methods (Prioridad: Crítica)

### Paso 1.1: Crear Enum PaymentMethod

**Archivo:** `backend/src/SaaS.Domain/Enums/PaymentMethod.cs`

```csharp
namespace SaaS.Domain.Enums;

/// <summary>
/// Payment methods available for sales
/// </summary>
public enum PaymentMethod
{
    /// <summary>
    /// Cash payment (Efectivo)
    /// </summary>
    Cash = 1,
    
    /// <summary>
    /// Bank transfer (Transferencia)
    /// </summary>
    Transfer = 2,
    
    /// <summary>
    /// Credit/Debit card (Tarjeta)
    /// </summary>
    Card = 3
}
```

**Validación:**
- [ ] Archivo creado
- [ ] Namespace correcto
- [ ] Valores definidos

---

### Paso 1.2: Actualizar Sale Document

**Archivo:** `backend/src/SaaS.Domain/Documents/Sale.cs`

**Agregar campo:**

```csharp
/// <summary>
/// Payment method used for this sale
/// </summary>
[BsonElement("paymentMethod")]
[BsonRepresentation(BsonType.String)]
public PaymentMethod PaymentMethod { get; set; }
```

**Ubicación:** Después del campo `CustomerId`, antes de `Items`

**Validación:**
- [ ] Campo agregado
- [ ] BsonElement configurado
- [ ] BsonRepresentation como String

---

### Paso 1.3: Actualizar CreateSaleDto

**Archivo:** `backend/src/SaaS.Application/DTOs/Sales/CreateSaleDto.cs`

**Agregar propiedad:**

```csharp
/// <summary>
/// Payment method for this sale
/// </summary>
[Required(ErrorMessage = "Payment method is required")]
public PaymentMethod PaymentMethod { get; set; }
```

**Validación:**
- [ ] Propiedad agregada
- [ ] Validación Required
- [ ] Mensaje de error en español

---

### Paso 1.4: Actualizar SaleDto (Response)

**Archivo:** `backend/src/SaaS.Application/DTOs/Sales/SaleDto.cs`

**Agregar propiedad:**

```csharp
/// <summary>
/// Payment method used
/// </summary>
public PaymentMethod PaymentMethod { get; set; }
```

**Validación:**
- [ ] Propiedad agregada
- [ ] Mapeo en AutoMapper configurado

---

### Paso 1.5: Actualizar Mapping Profile

**Archivo:** `backend/src/SaaS.Application/Mappings/SaleMappingProfile.cs`

**Verificar mapeo:**

```csharp
CreateMap<CreateSaleDto, Sale>()
    .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.PaymentMethod))
    // ... otros mapeos

CreateMap<Sale, SaleDto>()
    .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.PaymentMethod))
    // ... otros mapeos
```

**Validación:**
- [ ] Mapeo CreateSaleDto → Sale
- [ ] Mapeo Sale → SaleDto

---

### Paso 1.6: Actualizar Validaciones en CreateSaleUseCase

**Archivo:** `backend/src/SaaS.Application/UseCases/Sales/CreateSaleUseCase.cs`

**Agregar validación:**

```csharp
// Validar PaymentMethod
if (!Enum.IsDefined(typeof(PaymentMethod), request.PaymentMethod))
{
    return Result<SaleDto>.Failure("Invalid payment method");
}
```

**Ubicación:** En el método `ExecuteAsync`, después de validar Customer

**Validación:**
- [ ] Validación agregada
- [ ] Mensaje de error claro

---

### Paso 1.7: Testing

**Crear test:**

```csharp
[Fact]
public async Task CreateSale_WithValidPaymentMethod_ShouldSucceed()
{
    // Arrange
    var dto = new CreateSaleDto
    {
        CustomerId = "valid-customer-id",
        PaymentMethod = PaymentMethod.Cash,
        Items = new List<SaleItemDto> { /* ... */ }
    };
    
    // Act
    var result = await _useCase.ExecuteAsync(dto);
    
    // Assert
    Assert.True(result.IsSuccess);
    Assert.Equal(PaymentMethod.Cash, result.Value.PaymentMethod);
}

[Fact]
public async Task CreateSale_WithoutPaymentMethod_ShouldFail()
{
    // Arrange
    var dto = new CreateSaleDto
    {
        CustomerId = "valid-customer-id",
        // PaymentMethod no especificado
        Items = new List<SaleItemDto> { /* ... */ }
    };
    
    // Act & Assert
    await Assert.ThrowsAsync<ValidationException>(() => _useCase.ExecuteAsync(dto));
}
```

**Validación:**
- [ ] Tests pasan
- [ ] Cobertura > 80%

---

## 📦 FASE 2: Server-Side OData (Prioridad: Alta)

### Paso 2.1: Instalar Paquete OData (si no está)

```bash
cd backend/src/SaaS.Api
dotnet add package Microsoft.AspNetCore.OData
```

**Validación:**
- [ ] Paquete instalado
- [ ] Versión compatible con .NET 10

---

### Paso 2.2: Configurar OData en Program.cs

**Archivo:** `backend/src/SaaS.Api/Program.cs`

```csharp
using Microsoft.AspNetCore.OData;
using Microsoft.AspNetCore.OData.Query;

// ... existing code

builder.Services.AddControllers()
    .AddOData(options => options
        .Select()
        .Filter()
        .OrderBy()
        .SetMaxTop(100)
        .Count()
    );
```

**Validación:**
- [ ] OData configurado
- [ ] MaxTop = 100
- [ ] Count habilitado

---

### Paso 2.3: Crear PagedResult Generic

**Archivo:** `backend/src/SaaS.Application/DTOs/Common/PagedResult.cs`

```csharp
namespace SaaS.Application.DTOs.Common;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Skip { get; set; }
    public int Top { get; set; }
    public int PageNumber => (Skip / Top) + 1;
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / Top);
    public bool HasPreviousPage => Skip > 0;
    public bool HasNextPage => (Skip + Top) < TotalCount;
}
```

**Validación:**
- [ ] Clase creada
- [ ] Propiedades calculadas correctas

---

### Paso 2.4: Actualizar ProductsController con OData

**Archivo:** `backend/src/SaaS.Api/Controllers/ProductsController.cs`

**Reemplazar método GetProducts:**

```csharp
[HttpGet]
[EnableQuery(MaxTop = 100, AllowedQueryOptions = AllowedQueryOptions.All)]
public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts(
    [FromQuery] string? search = null,
    [FromQuery] ProductType? type = null,
    [FromQuery] bool? isActive = null,
    [FromQuery] int skip = 0,
    [FromQuery] int top = 20,
    [FromQuery] string orderBy = "name")
{
    // Validar pageSize
    if (!new[] { 10, 20, 50, 100 }.Contains(top))
    {
        top = 20;
    }
    
    var companyId = GetCurrentCompanyId();
    
    var query = _productRepository
        .AsQueryable()
        .Where(p => p.CompanyId == companyId);
    
    // Búsqueda
    if (!string.IsNullOrWhiteSpace(search))
    {
        var searchLower = search.ToLower();
        query = query.Where(p => p.Name.ToLower().Contains(searchLower));
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
    query = orderBy.ToLower() switch
    {
        "name" or "name asc" => query.OrderBy(p => p.Name),
        "name desc" => query.OrderByDescending(p => p.Name),
        "price" or "price asc" => query.OrderBy(p => p.BasePrice),
        "price desc" => query.OrderByDescending(p => p.BasePrice),
        "createdat" or "createdat asc" => query.OrderBy(p => p.CreatedAt),
        "createdat desc" => query.OrderByDescending(p => p.CreatedAt),
        _ => query.OrderBy(p => p.Name)
    };
    
    // Contar total ANTES de paginar
    var totalCount = await query.CountAsync();
    
    // Paginar
    var items = await query
        .Skip(skip)
        .Take(top)
        .ToListAsync();
    
    var dtos = _mapper.Map<List<ProductDto>>(items);
    
    return Ok(new PagedResult<ProductDto>
    {
        Items = dtos,
        TotalCount = totalCount,
        Skip = skip,
        Top = top
    });
}
```

**Validación:**
- [ ] Método actualizado
- [ ] Búsqueda server-side
- [ ] Filtros server-side
- [ ] Paginación server-side
- [ ] Ordenamiento server-side

---

### Paso 2.5: Aplicar mismo patrón a SalesController

**Archivo:** `backend/src/SaaS.Api/Controllers/SalesController.cs`

**Actualizar GetSales con:**
- Búsqueda por customer name
- Filtro por estado (CommercialState)
- Filtro por rango de fechas
- Paginación
- Ordenamiento

**Validación:**
- [ ] Método actualizado
- [ ] Incluir customer name en response (join o lookup)

---

### Paso 2.6: Aplicar mismo patrón a CustomersController

**Archivo:** `backend/src/SaaS.Api/Controllers/CustomersController.cs`

**Actualizar GetCustomers con:**
- Búsqueda por nombre y teléfono
- Filtro por estado comercial
- Paginación
- Ordenamiento

**Validación:**
- [ ] Método actualizado

---

### Paso 2.7: Crear Índices MongoDB

**Archivo:** `backend/src/SaaS.Infrastructure/Mongo/MongoIndexes.cs`

```csharp
public static class MongoIndexes
{
    public static async Task CreateIndexesAsync(IMongoDatabase database)
    {
        // Products
        var productsCollection = database.GetCollection<Product>("products");
        await productsCollection.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys
                    .Ascending(p => p.CompanyId)
                    .Ascending(p => p.Name)
            ),
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys
                    .Ascending(p => p.CompanyId)
                    .Ascending(p => p.Type)
            ),
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys
                    .Ascending(p => p.CompanyId)
                    .Ascending(p => p.IsActive)
            )
        });
        
        // Sales
        var salesCollection = database.GetCollection<Sale>("sales");
        await salesCollection.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Sale>(
                Builders<Sale>.IndexKeys
                    .Ascending(s => s.CompanyId)
                    .Ascending(s => s.CustomerId)
            ),
            new CreateIndexModel<Sale>(
                Builders<Sale>.IndexKeys
                    .Ascending(s => s.CompanyId)
                    .Ascending(s => s.State)
            ),
            new CreateIndexModel<Sale>(
                Builders<Sale>.IndexKeys
                    .Ascending(s => s.CompanyId)
                    .Descending(s => s.CreatedAt)
            )
        });
        
        // Customers
        var customersCollection = database.GetCollection<Customer>("customers");
        await customersCollection.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Customer>(
                Builders<Customer>.IndexKeys
                    .Ascending(c => c.CompanyId)
                    .Ascending(c => c.Name)
            ),
            new CreateIndexModel<Customer>(
                Builders<Customer>.IndexKeys
                    .Ascending(c => c.CompanyId)
                    .Ascending(c => c.Phones)
            )
        });
    }
}
```

**Llamar en Program.cs:**

```csharp
// Después de configurar MongoDB
await MongoIndexes.CreateIndexesAsync(mongoDatabase);
```

**Validación:**
- [ ] Índices creados
- [ ] Performance mejorada

---

## 📦 FASE 3: Correcciones de IVA (Prioridad: Alta)

### Paso 3.1: Verificar Persistencia de Product.IsTaxable

**Archivo:** `backend/src/SaaS.Application/UseCases/Products/UpdateProductUseCase.cs`

**Verificar que el mapeo incluya:**

```csharp
existingProduct.IsTaxable = request.IsTaxable;
```

**Validación:**
- [ ] Campo se actualiza correctamente
- [ ] Se persiste en MongoDB
- [ ] Test de actualización pasa

---

### Paso 3.2: Agregar Logs de Debugging

**Temporal, para identificar el bug:**

```csharp
_logger.LogInformation(
    "Updating product {ProductId}: IsTaxable from {OldValue} to {NewValue}",
    existingProduct.Id,
    existingProduct.IsTaxable,
    request.IsTaxable
);

await _repository.UpdateAsync(existingProduct);

_logger.LogInformation(
    "Product {ProductId} updated. Verifying IsTaxable = {Value}",
    existingProduct.Id,
    existingProduct.IsTaxable
);
```

**Validación:**
- [ ] Logs agregados
- [ ] Verificar en runtime

---

## 📦 FASE 4: Sales History Improvements (Prioridad: Media)

### Paso 4.1: Incluir Customer Name en SaleDto

**Archivo:** `backend/src/SaaS.Application/DTOs/Sales/SaleDto.cs`

**Agregar:**

```csharp
/// <summary>
/// Customer name (denormalized for display)
/// </summary>
public string CustomerName { get; set; } = string.Empty;
```

**Validación:**
- [ ] Propiedad agregada

---

### Paso 4.2: Actualizar GetSales para incluir Customer Name

**Archivo:** `backend/src/SaaS.Application/UseCases/Sales/GetSalesUseCase.cs`

```csharp
var sales = await query.ToListAsync();
var customerIds = sales.Select(s => s.CustomerId).Distinct().ToList();

var customers = await _customerRepository
    .AsQueryable()
    .Where(c => customerIds.Contains(c.Id))
    .ToListAsync();

var customerDict = customers.ToDictionary(c => c.Id, c => c.Name);

var dtos = sales.Select(s => 
{
    var dto = _mapper.Map<SaleDto>(s);
    dto.CustomerName = customerDict.GetValueOrDefault(s.CustomerId, "Unknown");
    return dto;
}).ToList();
```

**Validación:**
- [ ] Customer name incluido
- [ ] Performance aceptable (< 500ms)

---

## ✅ Checklist Final

### Fase 1: Payment Methods
- [ ] Enum creado
- [ ] Sale document actualizado
- [ ] DTOs actualizados
- [ ] Mapping configurado
- [ ] Validaciones agregadas
- [ ] Tests pasan

### Fase 2: OData
- [ ] OData configurado
- [ ] PagedResult creado
- [ ] ProductsController actualizado
- [ ] SalesController actualizado
- [ ] CustomersController actualizado
- [ ] Índices MongoDB creados

### Fase 3: IVA
- [ ] Persistencia verificada
- [ ] Bug identificado y corregido
- [ ] Tests pasan

### Fase 4: Sales History
- [ ] Customer name incluido
- [ ] Performance validada

---

## 🧪 Testing

**Ejecutar:**

```bash
cd backend
dotnet test --filter "Category=Sales|Category=Products"
```

**Validar:**
- [ ] Todos los tests pasan
- [ ] Cobertura > 80%

---

## 📊 Criterios de Aceptación

1. ✅ Puedo crear una venta con forma de pago
2. ✅ La forma de pago se persiste correctamente
3. ✅ Los endpoints de listado usan OData
4. ✅ La búsqueda es server-side
5. ✅ La paginación es server-side
6. ✅ Los filtros son server-side
7. ✅ El bug de IVA está corregido
8. ✅ El nombre del cliente aparece en el listado de ventas

---

**FIN DE LA GUÍA**
