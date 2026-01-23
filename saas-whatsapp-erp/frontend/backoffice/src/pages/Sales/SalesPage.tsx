import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
    TrendingUp,
    DollarSign,
    CreditCard,
    ArrowRightLeft,
    Percent
} from 'lucide-react';
import { Product } from '../../types/product';
import { Customer } from '../../types/customer';
import { PaymentMethod, DiscountType } from '../../types/enums';
import { CartItem, CreateSaleRequest, SaleError } from '../../types/sale';
import { productService } from '../../services/productService';
import { customerService } from '../../services/customerService';
import { saleService } from '../../services/saleService';
import { companyService, CompanyInfo } from '../../services/companyService';
import InvoiceModal from '../../components/WhatsApp/InvoiceModal';

/**
 * POS RÁPIDO - CREAR VENTA
 * 
 * Objetivo: Venta completa en < 30 segundos
 */
const SalesPage: React.FC = () => {
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

    // Cart & Settings
    const [cart, setCart] = useState<CartItem[]>([]);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<SaleError | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Payment & Conditions
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [applyTax, setApplyTax] = useState<boolean>(true);
    const [globalDiscount, setGlobalDiscount] = useState<{ type: DiscountType, value: number } | null>(null);

    const location = useLocation();
    const [editSaleId, setEditSaleId] = useState<string | null>(null);
    const [editSaleChannel, setEditSaleChannel] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
        loadCustomers();
        loadCompanyInfo();

        const state = location.state as { editSaleId?: string };
        if (state?.editSaleId) {
            setEditSaleId(state.editSaleId);
            loadSaleForEdit(state.editSaleId);
        }
    }, [location.state]);

    const loadSaleForEdit = async (saleId: string) => {
        try {
            setIsLoadingProducts(true);
            const sale = await saleService.getById(saleId);

            // Cargar cliente
            if (sale.customerId) {
                const customer = await customerService.getById(sale.customerId);
                setSelectedCustomer(customer || null);
            }

            // Cargar items
            if (sale.items) {
                const cartItems: CartItem[] = sale.items.map(item => {
                    const subtotal = item.discountedSubtotal || (item.quantity * item.unitPrice);
                    const taxRate = (item.taxAmount > 0 && subtotal > 0)
                        ? (item.taxAmount / subtotal)
                        : (companyInfo?.taxRate || 0.15);

                    return {
                        productId: item.productId,
                        productName: item.nameSnapshot,
                        unit: item.unit || 'pza',
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        isTaxable: item.taxAmount > 0,
                        taxRate: taxRate,
                        priceIncludesTax: false,
                        subtotal: subtotal,
                        taxAmount: item.taxAmount,
                        total: item.total
                    };
                });
                setCart(cartItems);
            }

            setPaymentMethod(sale.paymentMethod);
            if (sale.taxTotal !== undefined) {
                setApplyTax(sale.taxTotal > 0);
            }

            // Global discount rehydration (if available in the backend response)
            // Note: SaleResponse might need to include globalDiscount info to be perfect
            // For now, we use the values we have.

            setEditSaleChannel(sale.channel || 'POS');
            setSuccessMessage(null);
            setError(null);

        } catch (err) {
            console.error('Error loading sale for edit:', err);
            setError({ message: 'Error al cargar la venta para editar' });
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const loadCompanyInfo = async () => {
        try {
            const response = await companyService.getMe();
            setCompanyInfo(response.data);
        } catch (err) {
            console.error('Error loading company info:', err);
        }
    };

    const loadProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await productService.getAll();
            const items = response.data?.items || response.data || [];
            setProducts(items.filter((p: Product) => p.isActive));
        } catch (err) {
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
            setError({ message: 'Error al cargar clientes' });
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    const addToCart = (product: Product) => {
        const effectiveTaxRate = product.taxRate !== undefined && product.taxRate !== null
            ? product.taxRate
            : (companyInfo?.taxRate ?? 0.15);
        const isTaxable = companyInfo?.isTaxEnabled ?? true;

        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? calculateItemTotals({ ...item, quantity: item.quantity + 1 })
                        : item
                );
            } else {
                const newItem: CartItem = {
                    productId: product.id,
                    productName: product.name,
                    unit: product.unit || 'pza',
                    quantity: 1,
                    unitPrice: product.price,
                    isTaxable: isTaxable,
                    taxRate: effectiveTaxRate,
                    priceIncludesTax: product.priceIncludesTax || false,
                    subtotal: 0,
                    taxAmount: 0,
                    total: 0,
                };
                return [...prev, calculateItemTotals(newItem)];
            }
        });
    };

    const calculateItemTotals = (item: CartItem): CartItem => {
        let subtotal = 0;
        let taxAmount = 0;
        let total = 0;

        if (item.isTaxable) {
            if (item.priceIncludesTax) {
                total = item.quantity * item.unitPrice;
                subtotal = total / (1 + item.taxRate);
                taxAmount = total - subtotal;
            } else {
                subtotal = item.quantity * item.unitPrice;
                taxAmount = subtotal * item.taxRate;
                total = subtotal + taxAmount;
            }
        } else {
            subtotal = item.quantity * item.unitPrice;
            taxAmount = 0;
            total = subtotal;
        }

        return {
            ...item,
            subtotal: Number(subtotal.toFixed(2)),
            taxAmount: Number(taxAmount.toFixed(2)),
            total: Number(total.toFixed(2)),
        };
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
    };

    const rawSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);

    // Calculate global discount amount
    let discountAmount = 0;
    if (globalDiscount) {
        if (globalDiscount.type === DiscountType.Percentage) {
            discountAmount = rawSubtotal * (globalDiscount.value / 100);
        } else {
            discountAmount = globalDiscount.value;
        }
    }

    // Apply discount cap
    discountAmount = Math.min(discountAmount, rawSubtotal);

    // CRÍTICO: Calcular totales IGUAL que el backend (SalePricingCalculator)
    let finalSubtotal = 0;
    let finalTaxTotal = 0;

    cart.forEach(item => {
        // Distribución proporcional del descuento global
        const lineDiscountShare = rawSubtotal > 0
            ? (item.subtotal / rawSubtotal) * discountAmount
            : 0;

        const subtotalAfterDiscount = item.subtotal - lineDiscountShare;
        const taxRate = item.taxRate || companyInfo?.taxRate || 0.15;

        let lineSubtotal: number;
        let lineTaxAmount: number;

        // REGLA CRÍTICA: PriceIncludesTax (igual que backend)
        if (item.priceIncludesTax) {
            // Precio YA incluye IVA - descomponer
            const lineTotal = subtotalAfterDiscount;
            lineSubtotal = lineTotal / (1 + taxRate);
            lineTaxAmount = lineTotal - lineSubtotal;
        } else {
            // Precio NO incluye IVA - cálculo normal
            lineSubtotal = subtotalAfterDiscount;
            lineTaxAmount = 0;

            // Aplicar IVA solo si empresa y producto lo permiten
            if (applyTax && item.isTaxable) {
                lineTaxAmount = lineSubtotal * taxRate;
            }
        }

        finalSubtotal += lineSubtotal;
        finalTaxTotal += lineTaxAmount;
    });

    // Redondear a 2 decimales (igual que backend)
    finalSubtotal = Math.round(finalSubtotal * 100) / 100;
    finalTaxTotal = Math.round(finalTaxTotal * 100) / 100;
    const finalTotal = Math.round((finalSubtotal + finalTaxTotal) * 100) / 100;

    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [lastSaleId, setLastSaleId] = useState<string | null>(null);

    const handleSubmit = async (autoInvoice: boolean = false) => {
        if (!selectedCustomer || cart.length === 0) return;
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
                paymentMethod: paymentMethod,
                applyTax,
                globalDiscount: globalDiscount || undefined
            };
            const response = editSaleId
                ? await saleService.update(editSaleId, request)
                : await saleService.create(request);

            const saleId = editSaleId || response.id;

            if (autoInvoice) {
                setLastSaleId(saleId);
                setShowInvoiceModal(true);
            } else {
                setSuccessMessage(editSaleId ? `¡Orden actualizada exitosamente!` : `¡Venta creada exitosamente!`);
            }

            clearCart();
            setEditSaleId(null);
            setGlobalDiscount(null);
            setApplyTax(true);
            setPaymentMethod(PaymentMethod.Cash);
        } catch (err) {
            setError(err as SaleError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCustomerDisplayName = (customer: Customer): string => {
        return customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    const filteredCustomers = customers.filter(c =>
        getCustomerDisplayName(c).toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    );

    return (
        <div className="h-[calc(100vh-4rem)] flex gap-6 p-6 bg-slate-50">
            {/* LEFT: Products */}
            <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-6 bg-primary-600 text-white">
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                        <Package size={28} /> Catálogo
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full bg-white/20 border-white/30 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/60 focus:ring-4 focus:ring-white/30 transition-all outline-none"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start content-start">
                    {filteredProducts.map(product => (
                        <div key={product.id} onClick={() => addToCart(product)} className="bg-white p-4 rounded-2xl border-2 border-slate-100 hover:border-primary-500 hover:shadow-xl transition-all cursor-pointer group">
                            <div className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-500 mb-3">
                                <Package size={40} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm mb-2 h-10 line-clamp-2">{product.name}</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-black text-primary-600">{companyInfo?.currencySymbol || '$'}{product.price.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{product.unit}</span>
                            </div>
                            {product.priceIncludesTax && <div className="text-[9px] text-green-600 font-bold mt-1">IVA INCLUIDO</div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Cart */}
            <div className="w-[450px] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-900 text-white">
                    <h2 className="text-2xl font-black flex items-center gap-3 mb-4">
                        <ShoppingCart size={28} /> Carrito
                    </h2>
                    <div className="relative">
                        {selectedCustomer ? (
                            <div className="p-4 bg-white/10 rounded-2xl flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><User size={20} /></div>
                                    <div>
                                        <div className="text-sm font-bold">{getCustomerDisplayName(selectedCustomer)}</div>
                                        <div className="text-xs text-white/60">{selectedCustomer.phone}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="text-xs font-bold text-white/60 hover:text-white uppercase">Cambiar</button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                                <input
                                    type="text"
                                    placeholder="Seleccionar cliente..."
                                    className="w-full bg-white/10 border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/60"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                                />
                                {showCustomerDropdown && customerSearch && (
                                    <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white rounded-xl shadow-2xl z-20">
                                        {filteredCustomers.map(c => (
                                            <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 text-slate-800">
                                                <div className="font-bold text-sm">{getCustomerDisplayName(c)}</div>
                                                <div className="text-xs text-slate-500">{c.phone}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {cart.map(item => (
                        <div key={item.productId} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-4">
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-sm mb-2">{item.productName}</h4>
                                <div className="flex items-center gap-3 bg-white w-fit p-1 rounded-lg border border-slate-200">
                                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-slate-50 rounded"><Minus size={14} /></button>
                                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-slate-50 rounded"><Plus size={14} /></button>
                                </div>
                            </div>
                            <div className="text-right">
                                <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500 mb-2"><Trash2 size={16} /></button>
                                <div className="text-sm font-black text-slate-900">{companyInfo?.currencySymbol || '$'}{item.total.toFixed(2)}</div>
                                {item.priceIncludesTax && <div className="text-[8px] text-green-600 font-black">IVA INC.</div>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-50 border-t-2 border-slate-200 space-y-4">
                    {/* Payment Method Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Forma de Pago</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setPaymentMethod(PaymentMethod.Cash)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${paymentMethod === PaymentMethod.Cash ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300'}`}
                            >
                                <DollarSign size={20} className="mb-1" />
                                <span className="text-[10px] font-bold">Efectivo</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod(PaymentMethod.Transfer)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${paymentMethod === PaymentMethod.Transfer ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300'}`}
                            >
                                <ArrowRightLeft size={20} className="mb-1" />
                                <span className="text-[10px] font-bold">Transf.</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod(PaymentMethod.Card)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${paymentMethod === PaymentMethod.Card ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300'}`}
                            >
                                <CreditCard size={20} className="mb-1" />
                                <span className="text-[10px] font-bold">Tarjeta</span>
                            </button>
                        </div>
                    </div>

                    {/* Options: Tax & Discount */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setApplyTax(!applyTax)}
                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${applyTax ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200'}`}
                        >
                            <CheckCircle size={14} className={applyTax ? 'opacity-100' : 'opacity-0'} />
                            Aplicar IVA
                        </button>

                        <div className="relative flex-1">
                            <button
                                onClick={() => {
                                    if (globalDiscount) setGlobalDiscount(null);
                                    else {
                                        const val = prompt('Descuento (%) o Monto ($). Escribe "10%" o "50"');
                                        if (val) {
                                            if (val.includes('%')) {
                                                setGlobalDiscount({ type: DiscountType.Percentage, value: parseFloat(val.replace('%', '')) });
                                            } else {
                                                setGlobalDiscount({ type: DiscountType.Fixed, value: parseFloat(val) });
                                            }
                                        }
                                    }
                                }}
                                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${globalDiscount ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-white text-slate-400 border-slate-200'}`}
                            >
                                <Percent size={14} />
                                {globalDiscount ? (globalDiscount.type === DiscountType.Percentage ? `-${globalDiscount.value}%` : `-$${globalDiscount.value}`) : 'Descuento'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500 font-bold">
                            <span>Subtotal</span>
                            <span>{companyInfo?.currencySymbol || '$'}{rawSubtotal.toFixed(2)}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-xs text-amber-600 font-bold">
                                <span>Descuento</span>
                                <span>-{companyInfo?.currencySymbol || '$'}{discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-xs text-slate-700 font-bold border-t border-slate-200 pt-1 mt-1">
                                <span>Subtotal Neto</span>
                                <span>{companyInfo?.currencySymbol || '$'}{(rawSubtotal - discountAmount).toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-xs text-slate-500 font-bold">
                            <span>IVA {applyTax ? `(${((companyInfo?.taxRate || 0.15) * 100).toFixed(0)}%)` : '(0%)'}</span>
                            <span>{companyInfo?.currencySymbol || '$'}{finalTaxTotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-2xl font-black text-slate-900 pt-2 border-t border-slate-200 mt-1">
                            <span>TOTAL</span>
                            <span className="text-primary-600">{companyInfo?.currencySymbol || '$'}{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {error && (
                        <div className={`p-4 rounded-xl border-2 flex gap-3 ${error.code === 'PLAN_LIMIT_REACHED' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                            <AlertCircle size={20} className="shrink-0" />
                            <div>
                                <div className="text-sm font-black">{error.message}</div>
                                {error.code === 'PLAN_LIMIT_REACHED' && <button className="mt-1 text-[10px] font-black uppercase flex items-center gap-1 hover:underline"><TrendingUp size={12} /> Mejorar Plan</button>}
                            </div>
                        </div>
                    )}

                    {successMessage && <div className="p-4 rounded-xl border-2 bg-green-50 border-green-200 text-green-900 flex gap-3"><CheckCircle size={20} className="shrink-0" /> <div className="text-sm font-black">{successMessage}</div></div>}

                    {editSaleId && (
                        <div className="mb-6 mx-6 p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                    <ArrowRightLeft size={20} className="animate-pulse" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Modo Edición Omnicanal</div>
                                    <div className="text-sm font-black text-amber-900">
                                        Orden #{editSaleId.slice(-6).toUpperCase()}
                                        <span className="mx-2 text-amber-300">|</span>
                                        Origen: <span className="text-primary-600 uppercase italic">{editSaleChannel || 'POS'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setEditSaleId(null); clearCart(); }}
                                className="text-[10px] font-black text-amber-600 hover:text-amber-800 uppercase tracking-widest underline"
                            >
                                Cancelar Edición
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 p-6 pt-0">
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting || cart.length === 0 || !selectedCustomer}
                            className={`${editSaleId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-800 hover:bg-slate-900'} text-white font-black py-4 rounded-2xl shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2`}
                        >
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{editSaleId ? <CheckCircle size={20} /> : <Plus size={20} />} {editSaleId ? 'ACTUALIZAR ORDEN' : 'CREAR ORDEN'}</>}
                        </button>

                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={isSubmitting || cart.length === 0 || !selectedCustomer}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={20} /> {editSaleId ? 'ACTUALIZAR Y COBRAR' : 'VENDER Y COBRAR'}</>}
                        </button>
                    </div>
                </div>
            </div>

            {lastSaleId && (
                <InvoiceModal
                    isOpen={showInvoiceModal}
                    onClose={() => {
                        setShowInvoiceModal(false);
                        setSuccessMessage('¡Venta facturada exitosamente!');
                    }}
                    saleId={lastSaleId}
                    customerName={selectedCustomer ? getCustomerDisplayName(selectedCustomer) : 'Cliente'}
                    onSuccess={() => {
                        setShowInvoiceModal(false);
                        setSuccessMessage('¡Factura enviada exitosamente!');
                    }}
                />
            )}
        </div>
    );
};

export default SalesPage;
