import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Search, User, CreditCard, Banknote, Building, AlertCircle } from 'lucide-react';
import { Product } from '../../types/product';
import { Customer } from '../../types/customer';
import { productService } from '../../services/productService';
import { customerService } from '../../services/customerService';
import { saleService } from '../../services/saleService';
import { SaleItem } from '../../types/sale';

interface CartItem extends SaleItem {
    // Extiende SaleItem si necesitamos propiedades temporales UI
}

const SalesPage: React.FC = () => {
    // Catalog State
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // Customer State
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
    const [isProcessing, setIsProcessing] = useState(false);

    // Load Initial Data
    useEffect(() => {
        loadProducts();
        loadCustomers();
    }, []);

    useEffect(() => {
        let result = products;
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p => 
                p.name.toLowerCase().includes(lowerTerm) || 
                (p.sku && p.sku.toLowerCase().includes(lowerTerm))
            );
        }
        setFilteredProducts(result);
    }, [searchTerm, products]);

    const loadProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const data = await productService.getAll();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const loadCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to load customers", error);
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    // Helper for customer display
    const getCustomerName = (c: Customer) => {
        if (c.name) return c.name;
        return `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Desconocido';
    };

    // Cart Logic
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                // Update quantity
                return prev.map(item => 
                    item.productId === product.id 
                    ? updateItemCalculations({ ...item, quantity: item.quantity + 1 })
                    : item
                );
            } else {
                // Add new
                const newItem: CartItem = {
                    productId: product.id,
                    productName: product.name,
                    quantity: 1,
                    unitPrice: product.price, // Assuming price includes tax or logic needs split
                    discount: product.discount || 0,
                    taxRate: product.taxRate || 0.15,
                    subtotal: 0,
                    taxAmount: 0,
                    total: 0
                };
                return [...prev, updateItemCalculations(newItem)];
            }
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return updateItemCalculations({ ...item, quantity: newQty });
            }
            return item;
        }));
    };

    const updateDiscount = (productId: string, discount: number) => {
         setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                // Limit discount 0-100
                const validDiscount = Math.min(100, Math.max(0, discount));
                return updateItemCalculations({ ...item, discount: validDiscount });
            }
            return item;
        }));
    };

    const updateItemCalculations = (item: CartItem): CartItem => {
        // Simple logic: Unit Price is Net
        const discountPercent = item.discount || 0;
        const grossTotal = item.unitPrice * item.quantity;
        const discountAmount = grossTotal * (discountPercent / 100);
        const subtotal = grossTotal - discountAmount;
        
        const taxAmount = subtotal * item.taxRate;
        const total = subtotal + taxAmount;
        return { ...item, subtotal, taxAmount, total };
    };

    // Totals
    const cartSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const cartTax = cart.reduce((acc, item) => acc + item.taxAmount, 0);
    const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

    const handleCheckout = async () => {
        if (!selectedCustomer) {
            alert("Por favor selecciona un cliente");
            return;
        }
        if (cart.length === 0) {
            alert("El carrito está vacío");
            return;
        }

        setIsProcessing(true);
        try {
            await saleService.create({
                customerId: selectedCustomer.id,
                paymentMethod,
                items: cart.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    discount: i.discount
                }))
            });
            
            alert("Venta realizada con éxito!");
            setCart([]);
            setSelectedCustomer(null);
            setPaymentMethod('cash');
        } catch (error) {
            console.error(error);
            alert("Error al procesar la venta");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex gap-4 p-4 overflow-hidden">
            {/* LEFT: Product Catalog */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Catálogo de Productos</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {isLoadingProducts ? (
                        <div className="flex justify-center p-10"><span className="text-gray-500">Cargando catálogo...</span></div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredProducts.map(product => (
                                <div 
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="bg-white p-3 rounded-lg border border-gray-200 hover:border-green-500 cursor-pointer transition shadow-sm hover:shadow-md flex flex-col"
                                >
                                    <div className="h-24 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400">
                                        Img
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate" title={product.name}>{product.name}</h3>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="text-xs text-gray-500">{product.sku || 'SIN SKU'}</span>
                                        <span className="font-bold text-green-600">${product.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Cart / POS */}
            <div className="w-96 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 text-gray-800 font-bold mb-4">
                        <ShoppingCart size={20} />
                        <h2>Nueva Venta</h2>
                    </div>

                    {/* Customer Selector */}
                    <div className="relative">
                        {selectedCustomer ? (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-green-700"/>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-green-900">{getCustomerName(selectedCustomer)}</span>
                                        <span className="text-xs text-green-700">{selectedCustomer.phone}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="text-xs text-red-500 hover:underline">Cambiar</button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="flex items-center border rounded-lg bg-white overflow-hidden focus-within:ring-2 ring-green-500">
                                    <div className="pl-3 text-gray-400"><Search size={16} /></div>
                                    <input 
                                        type="text"
                                        placeholder="Buscar Cliente..."
                                        className="w-full p-2 outline-none text-sm"
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        onFocus={() => setIsCustomerDropdownOpen(true)}
                                    />
                                </div>
                                {isCustomerDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border rounded shadow-lg z-10">
                                        {customers
                                            .filter(c => getCustomerName(c).toLowerCase().includes(customerSearch.toLowerCase()))
                                            .map(c => (
                                                <div 
                                                    key={c.id} 
                                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-0"
                                                    onClick={() => {
                                                        setSelectedCustomer(c);
                                                        setIsCustomerDropdownOpen(false);
                                                        setCustomerSearch("");
                                                    }}
                                                >
                                                    <div className="font-medium">{getCustomerName(c)}</div>
                                                    <div className="text-xs text-gray-500">{c.phone}</div>
                                                </div>
                                            ))
                                        }
                                        <div className="p-2 text-xs text-center text-gray-400 italic border-t">
                                            Resultados limitados
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {!selectedCustomer && (
                             <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                                <AlertCircle size={12} />
                                <span>Selecciona un cliente para facturar</span>
                             </div>
                        )}
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 content-start">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <ShoppingCart size={48} className="opacity-20" />
                            <p>Carrito vacío</p>
                            <p className="text-xs">Agrega productos del catálogo</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.productId} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.productName}</h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <div className="text-xs text-gray-500">${item.unitPrice} x {item.quantity}</div>
                                            <div className="flex items-center gap-1 bg-gray-50 rounded px-1 border border-gray-100">
                                                 <span className="text-[10px] text-gray-400">Desc%</span>
                                                 <input 
                                                    type="number" 
                                                    min="0" 
                                                    max="100" 
                                                    value={item.discount || 0}
                                                    onChange={(e) => updateDiscount(item.productId, parseFloat(e.target.value))}
                                                    className="w-10 text-xs border-none bg-transparent p-0 text-right focus:ring-0"
                                                 />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-bold text-gray-800">${item.total.toFixed(2)}</span>
                                        <div className="flex items-center gap-2 bg-gray-100 rounded px-1">
                                            <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-white rounded"><Minus size={12} /></button>
                                            <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-white rounded"><Plus size={12} /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.productId)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1">
                                            <Trash2 size={10} /> Quitar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Totals */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${cartSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Impuestos (21%):</span>
                            <span>${cartTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2 mt-2 border-gray-300">
                            <span>Total:</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <button 
                            onClick={() => setPaymentMethod('cash')}
                            className={`flex flex-col items-center justify-center p-2 rounded border ${paymentMethod === 'cash' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                            <Banknote size={20} />
                            <span className="text-[10px] uppercase font-bold mt-1">Efectivo</span>
                        </button>
                        <button 
                             onClick={() => setPaymentMethod('card')}
                             className={`flex flex-col items-center justify-center p-2 rounded border ${paymentMethod === 'card' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                            <CreditCard size={20} />
                            <span className="text-[10px] uppercase font-bold mt-1">Tarjeta</span>
                        </button>
                        <button 
                             onClick={() => setPaymentMethod('transfer')}
                             className={`flex flex-col items-center justify-center p-2 rounded border ${paymentMethod === 'transfer' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                            <Building size={20} />
                            <span className="text-[10px] uppercase font-bold mt-1">Transf.</span>
                        </button>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={isProcessing || cart.length === 0}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? 'Procesando...' : 'Completar Venta'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesPage;
