import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    ShoppingCart,
    Package,
    User,
    TrendingUp,
    ArrowRightLeft,
    Plus,
    CheckCircle,
    AlertCircle,
    Search
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
import POSCatalog from '../../components/POS/POSCatalog';

/**
 * POS RÁPIDO - CREAR VENTA (HOMOLOGADO)
 * 
 * Objetivo: Venta completa en < 30 segundos compartiendo lógica y componentes con WhatsApp POS
 */
const SalesPage: React.FC = () => {
    // Shared Company Info
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

    // Products & Customers data loading
    const [products, setProducts] = useState<Product[]>([]);
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

    const filteredCustomers = customers.filter(c =>
        getCustomerDisplayName(c).toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    );

    return (
        <div className="h-[calc(100vh-4rem)] flex gap-6 p-6 bg-slate-50 animate-fade-in overflow-hidden">
            {/* LEFT: Homologated Catalog */}
            <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden p-8">
                <h1 className="text-3xl font-black text-slate-800 mb-8 italic uppercase tracking-tighter flex items-center gap-4">
                    <Package size={36} className="text-primary-600" />
                    Catálogo de Venta
                </h1>

                <POSCatalog
                    products={products}
                    isLoading={isLoadingProducts}
                    onAddToCart={addToCart}
                    currencySymbol={companyInfo?.currencySymbol || '$'}
                />
            </div>

            {/* RIGHT: Cart */}
            <div className="w-[450px] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                <div className="p-8 bg-slate-900 text-white">
                    <h2 className="text-2xl font-black flex items-center gap-3 mb-6 italic uppercase tracking-tighter">
                        <ShoppingCart size={28} className="text-primary-400" /> Carrito
                    </h2>
                    <div className="relative">
                        {selectedCustomer ? (
                            <div className="p-4 bg-white/10 rounded-2xl flex justify-between items-center border border-white/10 shadow-inner group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"><User size={24} /></div>
                                    <div>
                                        <div className="text-base font-black leading-none mb-1">{getCustomerDisplayName(selectedCustomer)}</div>
                                        <div className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">{selectedCustomer.phone}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all">Cambiar</button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                                <input
                                    type="text"
                                    placeholder="Seleccionar cliente para facturar..."
                                    className="w-full bg-white/10 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/30 font-bold outline-none focus:bg-white/20 transition-all text-sm"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                                />
                                {showCustomerDropdown && (customerSearch || customers.length > 0) && (
                                    <div className="absolute top-full left-0 right-0 mt-3 max-h-64 overflow-y-auto bg-white rounded-2xl shadow-2xl z-20 border border-slate-100 p-2 animate-fade-in list-none">
                                        {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                            <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }} className="p-4 hover:bg-primary-50 rounded-2xl cursor-pointer transition-all border-b border-slate-50 last:border-0 text-slate-800">
                                                <div className="font-black text-sm mb-1">{getCustomerDisplayName(c)}</div>
                                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{c.phone}</div>
                                            </div>
                                        )) : (
                                            <div className="p-6 text-center text-slate-400 text-xs font-black italic uppercase tracking-widest">Sin coincidencias</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <ShoppingCart size={80} className="mb-6 opacity-5 animate-pulse" />
                            <p className="font-black uppercase tracking-widest opacity-20 text-xs">Añade productos del catálogo</p>
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

                <div className="p-8 bg-white border-t-2 border-slate-100 space-y-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.08)]">
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

                    {/* Error & Success Feedback */}
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-100 flex gap-4 animate-bounce-short text-left">
                            <AlertCircle size={24} className="shrink-0 text-red-500" />
                            <div>
                                <div className="text-xs font-black text-red-900 uppercase tracking-widest leading-relaxed">{error.message}</div>
                                {error.code === 'PLAN_LIMIT_REACHED' && (
                                    <button className="mt-2 text-[10px] font-black text-primary-600 uppercase tracking-tighter flex items-center gap-1 hover:underline">
                                        <TrendingUp size={12} /> Actualizar a Plan Pro
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-4 rounded-2xl bg-green-50 border-2 border-green-100 flex gap-4 animate-fade-in shadow-xl text-left">
                            <CheckCircle size={24} className="shrink-0 text-green-600" />
                            <div className="text-xs font-black text-green-900 uppercase tracking-widest leading-relaxed">{successMessage}</div>
                        </div>
                    )}

                    {/* Submission Actions */}
                    {editSaleId && (
                        <div className="p-5 bg-amber-50 border-2 border-amber-100 rounded-3xl flex items-center justify-between shadow-inner mb-4">
                            <div className="flex items-center gap-4">
                                <ArrowRightLeft size={24} className="text-amber-500 animate-pulse" />
                                <div>
                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] leading-none mb-1">Editando Orden</div>
                                    <div className="text-xs font-black text-amber-900 underline decoration-2 underline-offset-2 italic">#{editSaleId.slice(-6).toUpperCase()}</div>
                                </div>
                            </div>
                            <button onClick={() => { setEditSaleId(null); clearCart(); setSelectedCustomer(null); }} className="text-[10px] font-black text-amber-600 hover:text-amber-800 uppercase tracking-widest bg-white px-3 py-2 rounded-xl border border-amber-200 shadow-sm transition-all hover:scale-105 active:scale-95">Descartar</button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleFinalSubmit(false)}
                            disabled={isSubmitting || cart.length === 0 || !selectedCustomer}
                            className={`${editSaleId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-800 hover:bg-slate-900'} text-white font-black py-5 rounded-[1.5rem] shadow-[0_15px_30px_-10px_rgba(30,41,59,0.3)] disabled:opacity-30 disabled:shadow-none transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.15em] hover:-translate-y-1 active:scale-95`}
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>{editSaleId ? <CheckCircle size={20} /> : <Plus size={20} />} {editSaleId ? 'Confirmar' : 'Crear Orden'}</>
                            )}
                        </button>

                        <button
                            onClick={() => handleFinalSubmit(true)}
                            disabled={isSubmitting || cart.length === 0 || !selectedCustomer}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-[1.5rem] shadow-[0_15px_30px_-10px_rgba(37,99,235,0.3)] disabled:opacity-30 disabled:shadow-none transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.15em] hover:-translate-y-1 active:scale-95"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><CheckCircle size={20} /> {editSaleId ? 'Facturar' : 'Vender y Cobrar'}</>
                            )}
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
