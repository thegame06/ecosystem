# 🎨 FRONTEND IMPLEMENTATION GUIDE

**Fecha:** 2026-01-22  
**Agente:** @/frontend  
**Prioridad:** Alta  
**Estimación:** 3-4 días

---

## 📋 Contexto

Implementar las correcciones y actualizaciones documentadas en:
- `pending-updates-and-corrections.md`
- `uiscreens-pos.md`
- `server-side-data-operations.md`

---

## 🎯 Objetivos

1. ✅ Actualizar POS con formas de pago, IVA flexible y descuentos
2. ✅ Implementar filtros/búsqueda/paginación server-side
3. ✅ Corregir bugs del Historial de Ventas
4. ✅ Organizar productos por tipo en POS
5. ✅ Alinear UI de Productos con UI de Ventas

---

## 📦 FASE 1: POS - Payment Methods & IVA (Prioridad: Crítica)

### Paso 1.1: Actualizar Types

**Archivo:** `frontend/backoffice/src/types/sale.ts`

```typescript
// NOTA: Usar el enum de src/types/enums.ts
import { PaymentMethod } from './enums';

export interface CreateSaleRequest {
  customerId: string;
  items: SaleItem[];
  paymentMethod: PaymentMethod;  // NUEVO
  applyTax?: boolean;             // NUEVO
  globalDiscount?: {              // NUEVO
    type: 'Fixed' | 'Percentage';
    value: number;
  };
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;  // NUEVO
  items: SaleItem[];
  paymentMethod: PaymentMethod;  // NUEVO
  subtotal: number;
  taxTotal: number;
  total: number;
  state: CommercialState;
  createdAt: string;
}
```

**Validación:**
- [ ] Types actualizados
- [ ] No hay errores de TypeScript

---

### Paso 1.2: Actualizar POSModal - Agregar Payment Method Selector

**Archivo:** `frontend/backoffice/src/components/sales/POSModal.tsx`

**Agregar estado:**

```typescript
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
const [applyTax, setApplyTax] = useState<boolean>(true);
const [globalDiscount, setGlobalDiscount] = useState<{type: 'Fixed' | 'Percentage', value: number} | null>(null);
```

**Agregar sección de forma de pago (antes del resumen):**

```tsx
{/* Payment Method Section */}
<div className="payment-method-section">
  <h3>Forma de Pago</h3>
  <div className="payment-buttons">
    <button
      type="button"
      className={`payment-btn ${paymentMethod === PaymentMethod.Cash ? 'active' : ''}`}
      onClick={() => setPaymentMethod(PaymentMethod.Cash)}
    >
      <DollarSign size={20} />
      Efectivo
    </button>
    <button
      type="button"
      className={`payment-btn ${paymentMethod === PaymentMethod.Transfer ? 'active' : ''}`}
      onClick={() => setPaymentMethod(PaymentMethod.Transfer)}
    >
      <CreditCard size={20} />
      Transferencia
    </button>
    <button
      type="button"
      className={`payment-btn ${paymentMethod === PaymentMethod.Card ? 'active' : ''}`}
      onClick={() => setPaymentMethod(PaymentMethod.Card)}
    >
      <CreditCard size={20} />
      Tarjeta
    </button>
  </div>
</div>
```

**Validación:**
- [ ] Selector visible
- [ ] Botones funcionan
- [ ] Estado se actualiza

---

### Paso 1.3: Agregar Toggle de IVA

**En POSModal.tsx, agregar:**

```tsx
{/* Tax Toggle */}
<div className="tax-toggle-section">
  <label className="toggle-label">
    <input
      type="checkbox"
      checked={applyTax}
      onChange={(e) => setApplyTax(e.target.checked)}
    />
    <span>Aplicar IVA ({company?.taxRate ? (company.taxRate * 100).toFixed(0) : 15}%)</span>
  </label>
</div>
```

**Actualizar cálculo de totales:**

```typescript
const calculateTotals = () => {
  let subtotal = 0;
  let taxTotal = 0;
  
  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return;
    
    const rawSubtotal = item.quantity * item.unitPrice;
    const discount = calculateDiscount(item);
    const discountedSubtotal = rawSubtotal - discount;
    
    subtotal += discountedSubtotal;
    
    // Aplicar IVA solo si:
    // 1. La empresa tiene IVA habilitado
    // 2. El producto es taxable
    // 3. El toggle de IVA está activado
    if (company?.isTaxEnabled && product.isTaxable && applyTax) {
      taxTotal += discountedSubtotal * (company.taxRate || 0.15);
    }
  });
  
  // Aplicar descuento global si existe
  if (globalDiscount) {
    const discountAmount = globalDiscount.type === 'Percentage'
      ? subtotal * (globalDiscount.value / 100)
      : globalDiscount.value;
    subtotal -= discountAmount;
  }
  
  const total = subtotal + taxTotal;
  
  return { subtotal, taxTotal, total };
};
```

**Validación:**
- [ ] Toggle funciona
- [ ] Totales se recalculan correctamente
- [ ] IVA se aplica según reglas

---

### Paso 1.4: Agregar Descuento Global

**En POSModal.tsx:**

```tsx
{/* Global Discount */}
<div className="global-discount-section">
  <h4>Descuento Global</h4>
  <div className="discount-inputs">
    <select
      value={globalDiscount?.type || ''}
      onChange={(e) => {
        if (!e.target.value) {
          setGlobalDiscount(null);
        } else {
          setGlobalDiscount({
            type: e.target.value as 'Fixed' | 'Percentage',
            value: globalDiscount?.value || 0
          });
        }
      }}
    >
      <option value="">Sin descuento</option>
      <option value="Fixed">Monto fijo</option>
      <option value="Percentage">Porcentaje</option>
    </select>
    
    {globalDiscount && (
      <input
        type="number"
        min="0"
        step="0.01"
        value={globalDiscount.value}
        onChange={(e) => setGlobalDiscount({
          ...globalDiscount,
          value: parseFloat(e.target.value) || 0
        })}
        placeholder={globalDiscount.type === 'Percentage' ? '%' : '$'}
      />
    )}
  </div>
</div>
```

**Validación:**
- [ ] Selector funciona
- [ ] Input aparece/desaparece
- [ ] Cálculo correcto

---

### Paso 1.5: Actualizar Submit para incluir Payment Method

**En POSModal.tsx:**

```typescript
const handleSubmit = async () => {
  if (!selectedCustomer) {
    toast.error('Seleccione un cliente');
    return;
  }
  
  if (items.length === 0) {
    toast.error('Agregue al menos un producto');
    return;
  }
  
  try {
    const { subtotal, taxTotal, total } = calculateTotals();
    
    const request: CreateSaleRequest = {
      customerId: selectedCustomer.id,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountType: item.discountType,
        discountValue: item.discountValue
      })),
      paymentMethod,  // NUEVO
      applyTax,       // NUEVO (opcional, backend puede inferir)
      globalDiscount  // NUEVO
    };
    
    await salesService.createSale(request);
    toast.success('Venta creada exitosamente');
    onClose();
    onSuccess?.();
  } catch (error: any) {
    if (error.response?.status === 403) {
      toast.error('Límite de ventas alcanzado. Actualice su plan.');
    } else {
      toast.error('Error al crear la venta');
    }
  }
};
```

**Validación:**
- [ ] Request incluye paymentMethod
- [ ] Error 403 se maneja correctamente

---

### Paso 1.6: Agregar Estilos para Payment Buttons

**Archivo:** `frontend/backoffice/src/components/sales/POSModal.css`

```css
.payment-method-section {
  margin: 20px 0;
}

.payment-method-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f2937;
}

.payment-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.payment-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.payment-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.payment-btn.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.tax-toggle-section {
  margin: 16px 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
```

**Validación:**
- [ ] Estilos aplicados
- [ ] Botones se ven bien
- [ ] Hover funciona

---

## 📦 FASE 2: Server-Side Pagination (Prioridad: Alta)

### Paso 2.1: Crear Hook useServerPagination

**Archivo:** `frontend/backoffice/src/hooks/useServerPagination.ts`

```typescript
import { useState, useEffect } from 'react';
import api from '../services/api';

interface UseServerPaginationOptions<T> {
  endpoint: string;
  pageSize?: number;
  filters?: Record<string, any>;
  searchTerm?: string;
  orderBy?: string;
}

interface PaginationState {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const useServerPagination = <T>({
  endpoint,
  pageSize = 20,
  filters = {},
  searchTerm = '',
  orderBy = 'createdAt desc'
}: UseServerPaginationOptions<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageNumber: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQueryString = (pageNumber: number): string => {
    const skip = (pageNumber - 1) * pageSize;
    const params = new URLSearchParams({
      skip: skip.toString(),
      top: pageSize.toString(),
      orderBy: orderBy
    });

    // Búsqueda
    if (searchTerm) {
      params.append('search', searchTerm);
    }

    // Filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return params.toString();
  };

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryString = buildQueryString(pageNumber);
      const response = await api.get(`${endpoint}?${queryString}`);
      
      setData(response.data.items);
      setPagination({
        pageNumber: response.data.pageNumber,
        pageSize: response.data.top,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1); // Reset to page 1 when filters change
  }, [searchTerm, JSON.stringify(filters), orderBy, pageSize]);

  return {
    data,
    pagination,
    loading,
    error,
    goToPage: fetchData,
    refresh: () => fetchData(pagination.pageNumber)
  };
};
```

**Validación:**
- [ ] Hook creado
- [ ] TypeScript sin errores

---

### Paso 2.2: Actualizar ProductsPage con Server-Side Pagination

**Archivo:** `frontend/backoffice/src/pages/ProductsPage.tsx`

```typescript
import { useServerPagination } from '../hooks/useServerPagination';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    isActive: ''
  });
  const [pageSize, setPageSize] = useState(20);

  const {
    data: products,
    pagination,
    loading,
    error,
    goToPage,
    refresh
  } = useServerPagination<Product>({
    endpoint: '/products',
    pageSize,
    filters,
    searchTerm,
    orderBy: 'name asc'
  });

  return (
    <div className="products-page">
      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filters">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Todos los tipos</option>
          <option value="Tangible">Tangible</option>
          <option value="Service">Servicio</option>
          <option value="Rental">Alquiler</option>
        </select>

        <select
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {/* Products List */}
      {loading && <div>Cargando...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && products.length === 0 && <div>No hay productos</div>}
      
      {!loading && products.length > 0 && (
        <>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() => goToPage(pagination.pageNumber - 1)}
            >
              Anterior
            </button>
            
            <span>
              Página {pagination.pageNumber} de {pagination.totalPages}
              ({pagination.totalCount} productos)
            </span>
            
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => goToPage(pagination.pageNumber + 1)}
            >
              Siguiente
            </button>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
            >
              <option value="10">10 por página</option>
              <option value="20">20 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};
```

**Validación:**
- [ ] Búsqueda funciona
- [ ] Filtros funcionan
- [ ] Paginación funciona
- [ ] Page size funciona
- [ ] NO se cargan todos los productos en memoria

---

### Paso 2.3: Aplicar mismo patrón a SalesPage

**Archivo:** `frontend/backoffice/src/pages/SalesPage.tsx`

**Usar `useServerPagination` con:**
- Búsqueda por customer name
- Filtro por estado
- Filtro por rango de fechas
- Paginación

**Validación:**
- [ ] Implementado
- [ ] Funciona correctamente

---

## 📦 FASE 3: Sales History Fixes (Prioridad: Alta)

### Paso 3.1: Corregir Display de Customer Name

**Archivo:** `frontend/backoffice/src/pages/SalesPage.tsx`

**Verificar que se muestre:**

```tsx
<td>{sale.customerName || 'Desconocido'}</td>
```

**En lugar de:**

```tsx
<td>{sale.customerId}</td>
```

**Validación:**
- [ ] Nombre se muestra correctamente
- [ ] Fallback funciona

---

### Paso 3.2: Corregir Display de Estado

**Crear helper:**

```typescript
const getStateLabel = (state: CommercialState): string => {
  const labels = {
    [CommercialState.LEAD]: 'Lead',
    [CommercialState.SALE_CREATED]: 'Venta Creada',
    [CommercialState.INVOICED]: 'Facturada',
    [CommercialState.PAID]: 'Pagada'
  };
  return labels[state] || state;
};

const getStateBadgeClass = (state: CommercialState): string => {
  const classes = {
    [CommercialState.LEAD]: 'badge-gray',
    [CommercialState.SALE_CREATED]: 'badge-blue',
    [CommercialState.INVOICED]: 'badge-yellow',
    [CommercialState.PAID]: 'badge-green'
  };
  return classes[state] || 'badge-gray';
};
```

**Usar en tabla:**

```tsx
<td>
  <span className={`badge ${getStateBadgeClass(sale.state)}`}>
    {getStateLabel(sale.state)}
  </span>
</td>
```

**Agregar estilos:**

```css
.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-gray {
  background: #f3f4f6;
  color: #6b7280;
}

.badge-blue {
  background: #dbeafe;
  color: #1e40af;
}

.badge-yellow {
  background: #fef3c7;
  color: #92400e;
}

.badge-green {
  background: #d1fae5;
  color: #065f46;
}
```

**Validación:**
- [ ] Estados se muestran con labels correctos
- [ ] Colores aplicados

---

### Paso 3.3: Arreglar Botón de Acciones

**En SalesPage.tsx:**

```tsx
<td>
  <button
    className="action-btn"
    onClick={() => handleViewSale(sale.id)}
  >
    <Eye size={16} />
    Ver
  </button>
  
  {sale.state === CommercialState.SALE_CREATED && (
    <button
      className="action-btn primary"
      onClick={() => handleGenerateInvoice(sale.id)}
    >
      <FileText size={16} />
      Facturar
    </button>
  )}
</td>
```

**Implementar handlers:**

```typescript
const handleViewSale = (saleId: string) => {
  setSelectedSaleId(saleId);
  setShowDetailModal(true);
};

const handleGenerateInvoice = async (saleId: string) => {
  try {
    await invoiceService.generateInvoice(saleId);
    toast.success('Factura generada');
    refresh();
  } catch (error) {
    toast.error('Error al generar factura');
  }
};
```

**Validación:**
- [ ] Botones funcionan
- [ ] Modal se abre
- [ ] Factura se genera

---

### Paso 3.4: Crear SaleDetailModal

**Archivo:** `frontend/backoffice/src/components/sales/SaleDetailModal.tsx`

```typescript
interface SaleDetailModalProps {
  saleId: string;
  onClose: () => void;
}

export const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ saleId, onClose }) => {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const data = await salesService.getSaleById(saleId);
        setSale(data);
      } catch (error) {
        toast.error('Error al cargar la venta');
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [saleId]);

  if (loading) return <div>Cargando...</div>;
  if (!sale) return <div>Venta no encontrada</div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalle de Venta</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="modal-body">
          {/* Customer Info */}
          <section>
            <h3>Cliente</h3>
            <p>{sale.customerName}</p>
          </section>

          {/* Items */}
          <section>
            <h3>Productos</h3>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Descuento</th>
                  <th>Subtotal</th>
                  <th>IVA</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nameSnapshot}</td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>
                      {item.discountType !== 'None' && (
                        <span>
                          {item.discountType === 'Percentage' 
                            ? `${item.discountValue}%`
                            : `$${item.discountValue}`
                          }
                        </span>
                      )}
                    </td>
                    <td>${item.discountedSubtotal.toFixed(2)}</td>
                    <td>${item.taxAmount.toFixed(2)}</td>
                    <td>${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Totals */}
          <section className="totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>IVA:</span>
              <span>${sale.taxTotal.toFixed(2)}</span>
            </div>
            <div className="total-row total">
              <span>TOTAL:</span>
              <span>${sale.total.toFixed(2)}</span>
            </div>
          </section>

          {/* Payment & State */}
          <section>
            <div className="info-grid">
              <div>
                <label>Forma de Pago:</label>
                <span>{getPaymentMethodLabel(sale.paymentMethod)}</span>
              </div>
              <div>
                <label>Estado:</label>
                <span className={`badge ${getStateBadgeClass(sale.state)}`}>
                  {getStateLabel(sale.state)}
                </span>
              </div>
              <div>
                <label>Fecha:</label>
                <span>{new Date(sale.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          {sale.state === CommercialState.SALE_CREATED && (
            <button className="btn-primary" onClick={() => handleGenerateInvoice(sale.id)}>
              Generar Factura
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Validación:**
- [ ] Modal se muestra correctamente
- [ ] Todos los datos visibles
- [ ] Botones funcionan

---

## 📦 FASE 4: POS - Product Organization (Prioridad: Media)

### Paso 4.1: Agrupar Productos por Tipo en POS

**En POSModal.tsx:**

```typescript
const groupedProducts = useMemo(() => {
  const groups: Record<ProductType, Product[]> = {
    Tangible: [],
    Service: [],
    Rental: []
  };

  products.forEach(product => {
    if (product.isActive) {
      groups[product.type].push(product);
    }
  });

  // Filtrar grupos vacíos
  return Object.entries(groups)
    .filter(([_, products]) => products.length > 0)
    .map(([type, products]) => ({ type: type as ProductType, products }));
}, [products]);

const getTypeLabel = (type: ProductType): string => {
  const labels = {
    Tangible: 'Productos',
    Service: 'Servicios',
    Rental: 'Alquileres'
  };
  return labels[type];
};
```

**Renderizar agrupado:**

```tsx
{!searchTerm && groupedProducts.map(group => (
  <div key={group.type} className="product-group">
    <h4 className="group-title">
      {getTypeLabel(group.type)}
      <span className="count">({group.products.length})</span>
    </h4>
    <div className="products-grid">
      {group.products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={() => handleAddProduct(product)}
        />
      ))}
    </div>
  </div>
))}

{searchTerm && filteredProducts.map(product => (
  <ProductCard
    key={product.id}
    product={product}
    onSelect={() => handleAddProduct(product)}
    showType={true}  // Mostrar badge de tipo
  />
))}
```

**Validación:**
- [ ] Productos agrupados
- [ ] Grupos vacíos no se muestran
- [ ] Búsqueda ignora agrupación

---

## ✅ Checklist Final

### Fase 1: POS - Payment & Tax
- [ ] PaymentMethod types creados
- [ ] Selector de forma de pago implementado
- [ ] Toggle de IVA implementado
- [ ] Descuento global implementado
- [ ] Cálculos correctos
- [ ] Submit incluye nuevos campos

### Fase 2: Server-Side Pagination
- [ ] Hook useServerPagination creado
- [ ] ProductsPage actualizado
- [ ] SalesPage actualizado
- [ ] Búsqueda server-side
- [ ] Filtros server-side
- [ ] Paginación server-side

### Fase 3: Sales History
- [ ] Customer name se muestra
- [ ] Estado se muestra con badge
- [ ] Botón de acciones funciona
- [ ] SaleDetailModal creado
- [ ] Modal funciona correctamente

### Fase 4: Product Organization
- [ ] Productos agrupados por tipo
- [ ] Búsqueda ignora agrupación
- [ ] Badge de tipo en búsqueda

---

## 🧪 Testing

**Validar manualmente:**
- [ ] Crear venta con cada forma de pago
- [ ] Toggle de IVA funciona
- [ ] Descuento global funciona
- [ ] Búsqueda es rápida (< 200ms)
- [ ] Paginación funciona
- [ ] Modal de detalle se abre

---

**FIN DE LA GUÍA**
