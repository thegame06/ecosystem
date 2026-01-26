import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    ShoppingCart,
    Search,
    Package,
    User,
    TrendingUp,
    ArrowRightLeft,
    Plus,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { Product } from '../../types/product';
import { Customer } from '../../types/customer';
import { productService } from '../../services/productService';
import { customerService } from '../../services/customerService';
import { saleService } from '../../services/saleService';
import { companyService, CompanyInfo } from '../../services/companyService';
import InvoiceModal from '../../components/WhatsApp/InvoiceModal';
import { usePOS } from '../../hooks/usePOS';

// Shared components
import POSCartItem from '../../components/POS/POSCartItem';
import POSPricingSummary from '../../components/POS/POSPricingSummary';
import POSControls from '../../components/POS/POSControls';

/**
 * POS RÁPIDO - CREAR VENTA (HOMOLOGADO)
 * 
 * Objetivo: Venta completa en < 30 segundos compartiendo lógica con WhatsApp POS
 */
const SalesPage: React.FC = () => {
    // Shared Company Info
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

    // Products & Customers data loading
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

    // Invoice Modal control
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [lastSaleId, setLastSaleId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Local state for navigation/edit mode
    const location = useLocation();
    const [editSaleId, setEditSaleId] = useState<string | null>(null);
    const [editSaleChannel, setEditSaleChannel] = useState<string | null>(null);

    // THE CORE POS HOOK
    const {
        cart,
        selectedCustomer,
        setSelectedCustomer,
        paymentMethod,
        setPaymentMethod,
        applyTax,
        setApplyTax,
        globalDiscount,
        setGlobalDiscount,
        isSubmitting,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totals,
        submitSale,
        rehydrate
    } = usePOS({
        companyInfo,
        onSuccess: (saleId) => {
            setLastSaleId(saleId);
        }
    });

    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([
                loadCompanyInfo(),
                loadProducts(),
                loadCustomers()
            ]);

            const state = location.state as { editSaleId?: string };
            if (state?.editSaleId) {
                setEditSaleId(state.editSaleId);
                loadSaleForEdit(state.editSaleId);
            }
        };

        loadInitialData();
    }, [location.state]);

    const loadCompanyInfo = async () => {
        try {
            const response = await companyService.getMe();
            setCompanyInfo(response.data);
            setApplyTax(response.data.isTaxEnabled);
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
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const loadCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    const loadSaleForEdit = async (saleId: string) => {
        try {
            const sale = await saleService.getById(saleId);

            // Rehydrate specific POS state
            rehydrate(sale);

            // Rehydrate customer
            if (sale.customerId) {
                const customer = await customerService.getById(sale.customerId);
                setSelectedCustomer(customer || null);
            }

            setEditSaleChannel(sale.channel || 'POS');
            setSuccessMessage(null);
        } catch (err) {
            console.error('Error rehydrating sale:', err);
        }
    };

    const handleFinalSubmit = async (autoInvoice: boolean) => {
        try {
            const saleId = await submitSale('POS', editSaleId);
            if (saleId) {
                if (autoInvoice) {
                    setShowInvoiceModal(true);
                } else {
                    setSuccessMessage(editSaleId ? '¡Orden actualizada exitosamente!' : '¡Venta creada exitosamente!');
                    setTimeout(() => setSuccessMessage(null), 3000);
                }
                clearCart();
                setSelectedCustomer(null);
                setEditSaleId(null);
            }
        } catch (err) {
            // Error is handled by the hook (error state)
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
        <div className="h-[calc(100vh-4rem)] flex gap-6 p-6 bg-slate-50 animate-fade-in">
            {/* LEFT: Products */}
            <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-6 bg-primary-600 text-white">
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-3 italic uppercase tracking-tighter">
                        <Package size={28} /> Catálogo de Productos
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar productos o servicios..."
                            className="w-full bg-white/20 border-white/30 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/60 focus:ring-4 focus:ring-white/30 transition-all outline-none font-medium"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start content-start">
                    {isLoadingProducts ? (
                        <div className="col-span-full py-20 text-center text-slate-400 animate-pulse font-bold">Cargando productos...</div>
                    ) : (
                        filteredProducts.map(product => (
                            <div key={product.id} onClick={() => addToCart(product)} className="bg-white p-4 rounded-2xl border-2 border-slate-100 hover:border-primary-500 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1 active:scale-95">
                                <div className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-500 mb-3 transition-colors relative overflow-hidden">
                                    <Package size={40} />
                                    {product.priceIncludesTax && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-700 text-[8px] font-black rounded-lg uppercase tracking-tighter">IVA Inc.</div>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm mb-2 h-10 line-clamp-2 leading-tight">{product.name}</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-black text-primary-600">{companyInfo?.currencySymbol || '$'}{product.price.toFixed(2)}</span>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{product.unit || 'pza'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: Cart */}
            <div className="w-[450px] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-900 text-white">
                    <h2 className="text-2xl font-black flex items-center gap-3 mb-4 italic uppercase tracking-tighter">
                        <ShoppingCart size={28} className="text-primary-400" /> Carrito
                    </h2>
                    <div className="relative">
                        {selectedCustomer ? (
                            <div className="p-4 bg-white/10 rounded-2xl flex justify-between items-center border border-white/10 shadow-inner">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg"><User size={20} /></div>
                                    <div>
                                        <div className="text-sm font-black">{getCustomerDisplayName(selectedCustomer)}</div>
                                        <div className="text-[10px] text-white/60 font-medium uppercase tracking-widest">{selectedCustomer.phone}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all">Cambiar</button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                                <input
                                    type="text"
                                    placeholder="Seleccionar cliente..."
                                    className="w-full bg-white/10 border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-white/60 font-medium outline-none focus:bg-white/20 transition-all"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                                />
                                {showCustomerDropdown && (customerSearch || customers.length > 0) && (
                                    <div className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white rounded-2xl shadow-2xl z-20 border border-slate-100 p-2 animate-fade-in">
                                        {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                            <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }} className="p-3 hover:bg-primary-50 rounded-xl cursor-pointer transition-all border-b border-slate-50 last:border-0 text-slate-800">
                                                <div className="font-black text-sm">{getCustomerDisplayName(c)}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{c.phone}</div>
                                            </div>
                                        )) : (
                                            <div className="p-4 text-center text-slate-400 text-xs font-bold italic">No hay clientes sugeridos</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 italic">
                            <ShoppingCart size={64} className="mb-4 opacity-10" />
                            <p className="font-bold opacity-30">El carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <POSCartItem
                                key={item.productId}
                                item={item}
                                currencySymbol={companyInfo?.currencySymbol || '$'}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeFromCart}
                            />
                        ))
                    )}
                </div>

                <div className="p-6 bg-white border-t-2 border-slate-100 space-y-6">
                    {/* Reusable Controls */}
                    <POSControls
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        applyTax={applyTax}
                        setApplyTax={setApplyTax}
                        globalDiscount={globalDiscount}
                        setGlobalDiscount={setGlobalDiscount}
                        taxRate={companyInfo?.taxRate || 0.15}
                    />

                    {/* Reusable Totals */}
                    <POSPricingSummary
                        subtotal={totals.subtotal}
                        taxTotal={totals.taxTotal}
                        total={totals.total}
                        discountAmount={totals.discountAmount}
                        rawSubtotal={totals.rawSubtotal}
                        companyInfo={companyInfo}
                        applyTax={applyTax}
                    />

                    {/* Feedback & Error Handling */}
                    {error && (
                        <div className={`p-4 rounded-2xl border-2 flex gap-3 animate-bounce-short ${error.code === 'PLAN_LIMIT_REACHED' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                            <AlertCircle size={20} className="shrink-0" />
                            <div>
                                <div className="text-sm font-black">{error.message}</div>
                                {error.code === 'PLAN_LIMIT_REACHED' && <button className="mt-1 text-[10px] font-black uppercase flex items-center gap-1 hover:underline"><TrendingUp size={12} /> Mejorar Plan</button>}
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-4 rounded-2xl border-2 bg-green-50 border-green-200 text-green-900 flex gap-3 animate-fade-in shadow-lg">
                            <CheckCircle size={20} className="shrink-0" />
                            <div className="text-sm font-black">{successMessage}</div>
                        </div>
                    )}

                    {/* Submission Actions */}
                    {editSaleId && (
                        <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in mb-4">
                            <div className="flex items-center gap-4">
                                <ArrowRightLeft size={20} className="text-amber-500 animate-pulse" />
                                <div>
                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Modo Edición</div>
                                    <div className="text-xs font-black text-amber-900">Orden #{editSaleId.slice(-6).toUpperCase()} ({editSaleChannel})</div>
                                </div>
                            </div>
                            <button onClick={() => { setEditSaleId(null); clearCart(); setSelectedCustomer(null); }} className="text-[10px] font-black text-amber-600 hover:underline uppercase tracking-widest">Cancelar</button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleFinalSubmit(false)}
                            disabled={isSubmitting || cart.length === 0 || !selectedCustomer}
                            className={`${editSaleId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-800 hover:bg-slate-900'} text-white font-black py-4 rounded-2xl shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest`}
                        >
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{editSaleId ? <CheckCircle size={18} /> : <Plus size={18} />} {editSaleId ? 'Actualizar' : 'Crear Orden'}</>}
                        </button>

                        <button
                            onClick={() => handleFinalSubmit(true)}
                            disabled={isSubmitting || cart.length === 0 || !selectedCustomer}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                        >
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={18} /> {editSaleId ? 'Cobrar' : 'Vender y Cobrar'}</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
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
