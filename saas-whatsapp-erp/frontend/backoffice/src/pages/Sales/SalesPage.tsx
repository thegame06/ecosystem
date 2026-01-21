import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    Trash2,
    CheckCircle,
    Package,
    User,
    AlertCircle,
    TrendingUp
} from 'lucide-react';
import { Product } from '../../types/product';
import { Customer } from '../../types/customer';
import { CartItem, CreateSaleRequest, SaleError } from '../../types/sale';
import { productService } from '../../services/productService';
import { customerService } from '../../services/customerService';
import { saleService } from '../../services/saleService';

/**
 * POS RÁPIDO - CREAR VENTA
 * 
 * Objetivo: Venta completa en < 30 segundos
 * Diseño: WhatsApp-First, optimizado para tablet/touch
 * 
 * Flujo:
 * 1. Seleccionar Cliente
 * 2. Agregar Productos
 * 3. Ver Total Automático
 * 4. Confirmar Venta
 * 
 * Manejo de Errores:
 * - HTTP 403 → Límite de plan alcanzado
 * - HTTP 401 → Sesión expirada
 * - HTTP 400 → Validación
 * - HTTP 500 → Error servidor
 */
const SalesPage: React.FC = () => {
    // ============================================
    // STATE
    // ============================================

    // Products
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // Customers
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

    // Cart
    const [cart, setCart] = useState<CartItem[]>([]);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<SaleError | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ============================================
    // EFFECTS
    // ============================================

    useEffect(() => {
        loadProducts();
        loadCustomers();
    }, []);

    // Auto-hide success message
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Auto-hide error message
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 8000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // ============================================
    // DATA LOADING
    // ============================================

    const loadProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await productService.getAll();
            // Handle OData response structure
            const items = response.data?.result || response.data || [];
            // Filter only active products
            setProducts(items.filter((p: Product) => p.isActive));
        } catch (err) {
            console.error('Error loading products:', err);
            setError({ message: 'Error al cargar productos' });
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const loadCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (err) {
            console.error('Error loading customers:', err);
            setError({ message: 'Error al cargar clientes' });
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    // ============================================
    // CART LOGIC
    // ============================================

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                // Increment quantity
                return prev.map(item =>
                    item.productId === product.id
                        ? calculateItemTotals({ ...item, quantity: item.quantity + 1 })
                        : item
                );
            } else {
                // Add new item
                const newItem: CartItem = {
                    productId: product.id,
                    productName: product.name,
                    unit: product.unit || 'unidad',
                    quantity: 1,
                    unitPrice: product.price,
                    isTaxable: product.taxRate !== null && product.taxRate !== undefined,
                    taxRate: product.taxRate || 0.15, // Default 15% for Nicaragua
                    subtotal: 0,
                    taxAmount: 0,
                    total: 0,
                };
                return [...prev, calculateItemTotals(newItem)];
            }
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return calculateItemTotals({ ...item, quantity: newQty });
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setSelectedCustomer(null);
        setCustomerSearch('');
        setProductSearch('');
    };

    /**
     * Calcula totales de un item según pricing_calculation_rules.md
     */
    const calculateItemTotals = (item: CartItem): CartItem => {
        // 1. Subtotal = quantity × unitPrice
        const subtotal = item.quantity * item.unitPrice;

        // 2. Tax = subtotal × taxRate (solo si es taxable)
        const taxAmount = item.isTaxable ? subtotal * item.taxRate : 0;

        // 3. Total = subtotal + tax
        const total = subtotal + taxAmount;

        return {
            ...item,
            subtotal,
            taxAmount,
            total,
        };
    };

    // ============================================
    // TOTALS CALCULATION
    // ============================================

    const cartSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const cartTaxTotal = cart.reduce((acc, item) => acc + item.taxAmount, 0);
    const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

    // ============================================
    // SUBMIT SALE
    // ============================================

    const handleSubmit = async () => {
        // Validation
        if (!selectedCustomer) {
            setError({
                code: 'VALIDATION_ERROR',
                message: 'Por favor selecciona un cliente'
            });
            return;
        }

        if (cart.length === 0) {
            setError({
                code: 'VALIDATION_ERROR',
                message: 'El carrito está vacío'
            });
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const request: CreateSaleRequest = {
                customerId: selectedCustomer.id,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
            };

            const response = await saleService.create(request);

            // Success!
            setSuccessMessage(`¡Venta creada exitosamente! ID: ${response.id}`);
            clearCart();

        } catch (err) {
            // Error handling (403, 401, 400, 500)
            setError(err as SaleError);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================
    // HELPERS
    // ============================================

    const getCustomerDisplayName = (customer: Customer): string => {
        if (customer.name) return customer.name;
        return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Sin nombre';
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const filteredCustomers = customers.filter(c =>
        getCustomerDisplayName(c).toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone?.toLowerCase().includes(customerSearch.toLowerCase())
    );

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="h-[calc(100vh-4rem)] flex gap-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100">
            {/* LEFT PANEL: Product Catalog */}
            <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                    <h2 className="text-2xl font-black flex items-center gap-3 mb-4">
                        <Package size={28} />
                        Catálogo de Productos
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/60 focus:ring-4 focus:ring-white/30 focus:border-white/50 transition-all"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoadingProducts ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-slate-400 animate-pulse">Cargando productos...</div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Package size={64} className="opacity-20 mb-4" />
                            <p className="text-lg font-bold">No se encontraron productos</p>
                            <p className="text-sm">Intenta con otra búsqueda</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="group bg-white p-4 rounded-2xl border-2 border-slate-100 hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-900/10 transition-all cursor-pointer"
                                >
                                    <div className="w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:from-primary-50 group-hover:to-primary-100 group-hover:text-primary-500 transition-all mb-3">
                                        <Package size={40} />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black text-primary-600">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {product.unit || 'unidad'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus size={14} />
                                        Agregar
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Cart & Checkout */}
            <div className="w-[480px] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <ShoppingCart size={28} />
                            Nueva Venta
                        </h2>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-xs font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors"
                            >
                                Vaciar
                            </button>
                        )}
                    </div>

                    {/* Customer Selector */}
                    <div className="relative">
                        {selectedCustomer ? (
                            <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <User size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">
                                            {getCustomerDisplayName(selectedCustomer)}
                                        </div>
                                        <div className="text-xs text-white/60">
                                            {selectedCustomer.phone}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCustomer(null);
                                        setCustomerSearch('');
                                    }}
                                    className="text-xs font-black text-white/60 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Cambiar
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar cliente..."
                                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/60 focus:ring-4 focus:ring-white/30 focus:border-white/50 transition-all"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                                />
                                {showCustomerDropdown && customerSearch && (
                                    <div className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 z-10">
                                        {filteredCustomers.length === 0 ? (
                                            <div className="p-4 text-center text-slate-400 text-sm">
                                                No se encontraron clientes
                                            </div>
                                        ) : (
                                            filteredCustomers.map(customer => (
                                                <div
                                                    key={customer.id}
                                                    onClick={() => {
                                                        setSelectedCustomer(customer);
                                                        setShowCustomerDropdown(false);
                                                        setCustomerSearch('');
                                                    }}
                                                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                                                >
                                                    <div className="font-bold text-slate-800 text-sm">
                                                        {getCustomerDisplayName(customer)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {customer.phone}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!selectedCustomer && (
                        <div className="flex items-center gap-2 text-xs text-amber-300 mt-3">
                            <AlertCircle size={14} />
                            <span>Selecciona un cliente para continuar</span>
                        </div>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <ShoppingCart size={64} className="opacity-20 mb-4" />
                            <p className="text-lg font-bold">Carrito vacío</p>
                            <p className="text-sm text-center px-8">
                                Selecciona productos del catálogo para comenzar
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div
                                    key={item.productId}
                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-slate-800 text-sm flex-1 pr-2">
                                            {item.productName}
                                        </h4>
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                                            <button
                                                onClick={() => updateQuantity(item.productId, -1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-md transition-colors"
                                            >
                                                <Minus size={14} className="text-slate-600" />
                                            </button>
                                            <span className="w-10 text-center font-black text-sm text-slate-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-md transition-colors"
                                            >
                                                <Plus size={14} className="text-slate-600" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400 font-bold">
                                                ${item.unitPrice.toFixed(2)} × {item.quantity}
                                            </div>
                                            <div className="text-lg font-black text-slate-900">
                                                ${item.total.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer: Totals & Submit */}
                <div className="p-6 bg-slate-50 border-t-2 border-slate-200">
                    {/* Totals */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span className="font-bold">Subtotal:</span>
                            <span className="font-bold">${cartSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span className="font-bold">IVA (15%):</span>
                            <span className="font-bold">${cartTaxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black text-slate-900 pt-2 border-t-2 border-slate-300">
                            <span>TOTAL:</span>
                            <span className="text-primary-600">${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={`mb-4 p-4 rounded-2xl border-2 ${error.code === 'PLAN_LIMIT_REACHED'
                                ? 'bg-amber-50 border-amber-500 text-amber-900'
                                : 'bg-red-50 border-red-500 text-red-900'
                            }`}>
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="font-black text-sm mb-1">{error.message}</div>
                                    {error.details && (
                                        <div className="text-xs opacity-75">{error.details}</div>
                                    )}
                                    {error.code === 'PLAN_LIMIT_REACHED' && (
                                        <button className="mt-2 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                                            <TrendingUp size={12} />
                                            Actualizar Plan
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-4 p-4 rounded-2xl border-2 bg-green-50 border-green-500 text-green-900">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={20} className="flex-shrink-0" />
                                <div className="font-black text-sm">{successMessage}</div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || cart.length === 0 || !selectedCustomer}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black py-4 rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={24} />
                                CONFIRMAR VENTA
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesPage;
