import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, ArrowRightLeft } from 'lucide-react';
import Modal from '../Common/Modal';
import { Product } from '../../types/product';
import { productService } from '../../services/productService';
import { saleService } from '../../services/saleService';
import { companyService, CompanyInfo } from '../../services/companyService';
import { usePOS } from '../../hooks/usePOS';

// Shared components
import POSCartItem from '../POS/POSCartItem';
import POSPricingSummary from '../POS/POSPricingSummary';
import POSControls from '../POS/POSControls';
import POSCatalog from '../POS/POSCatalog';

interface POSModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
    customerName: string;
    editSaleId?: string;
    channel?: string;
    onSuccess: (saleId: string) => void;
}

const POSModal: React.FC<POSModalProps> = ({ isOpen, onClose, customerId, customerName, editSaleId, channel, onSuccess }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // THE CORE POS HOOK
    const {
        cart,
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
        initialCustomerId: customerId,
        companyInfo,
        onSuccess: (saleId) => {
            onSuccess(saleId);
        }
    });

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                await Promise.all([
                    fetchProducts(),
                    fetchCompanyInfo()
                ]);

                if (editSaleId) {
                    loadExistingSale(editSaleId);
                } else {
                    clearCart();
                }
            };
            loadData();
        }
    }, [isOpen, editSaleId]);

    const loadExistingSale = async (id: string) => {
        try {
            setIsLoading(true);
            const sale = await saleService.getById(id);
            rehydrate(sale);
        } catch (err) {
            console.error('Error loading sale for POS:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCompanyInfo = async () => {
        try {
            const response = await companyService.getMe();
            setCompanyInfo(response.data);
            setApplyTax(response.data.isTaxEnabled);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await productService.getAll();
            const items = response.data?.items || response.data || [];
            setProducts(items.filter((p: Product) => p.isActive));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        try {
            const saleId = await submitSale(channel || 'WhatsApp', editSaleId);
            if (saleId) onClose();
        } catch (err) {
            // Error handled by hook
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editSaleId ? "Gestionar Orden Existente" : `Nueva Venta para ${customerName}`}
            size="xl"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="flex gap-8 text-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Subtotal</span>
                            <span className="text-xl font-bold">{companyInfo?.currencySymbol || '$'}{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">IVA</span>
                            <span className="text-xl font-bold">{companyInfo?.currencySymbol || '$'}{totals.taxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none mb-1">Total</span>
                            <span className="text-3xl font-black text-slate-900 leading-none">{companyInfo?.currencySymbol || '$'}{totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleFinalSubmit()}
                            disabled={cart.length === 0 || isSubmitting}
                            className={`${editSaleId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary-600 hover:bg-primary-700'} px-10 py-4 rounded-2xl text-white font-black transition-all flex items-center gap-2 disabled:bg-slate-300 shadow-xl flex-1 text-sm uppercase tracking-widest`}
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Procesando...</span>
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    {editSaleId ? 'Actualizar Orden' : 'Vender y Cobrar'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            }
        >
            {editSaleId && (
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in text-left">
                    <div className="flex items-center gap-4">
                        <ArrowRightLeft size={20} className="text-amber-500 animate-pulse" />
                        <div>
                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1 underline decoration-2 underline-offset-4">Modo Edición</div>
                            <div className="text-sm font-black text-amber-900">Orden #{editSaleId.slice(-6).toUpperCase()} ({channel})</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-8 h-[65vh]">
                {/* HOMOLOGATED CATALOG COMPONENT */}
                <POSCatalog
                    products={products}
                    isLoading={isLoading}
                    onAddToCart={addToCart}
                    currencySymbol={companyInfo?.currencySymbol || '$'}
                />

                <div className="w-96 flex flex-col bg-slate-50/50 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-inner">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-md">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 italic uppercase tracking-tighter">
                            <ShoppingCart className="text-primary-600" size={20} /> Carrito ({cart.length})
                        </h3>
                        <button onClick={() => clearCart()} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Vaciar</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-6">
                                <ShoppingCart size={48} className="mb-4 opacity-5 transition-all group-hover:scale-110" />
                                <p className="text-xs font-bold opacity-30 uppercase tracking-widest italic">El carrito está esperando...</p>
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

                    <div className="p-6 bg-white border-t border-slate-100 space-y-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
                        <POSControls
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            applyTax={applyTax}
                            setApplyTax={setApplyTax}
                            globalDiscount={globalDiscount}
                            setGlobalDiscount={setGlobalDiscount}
                            taxRate={companyInfo?.taxRate || 0.15}
                        />

                        <POSPricingSummary
                            subtotal={totals.subtotal}
                            taxTotal={totals.taxTotal}
                            total={totals.total}
                            discountAmount={totals.discountAmount}
                            rawSubtotal={totals.rawSubtotal}
                            companyInfo={companyInfo}
                            applyTax={applyTax}
                        />

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-600 uppercase tracking-widest leading-relaxed animate-bounce-short text-left">
                                {error.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default POSModal;
