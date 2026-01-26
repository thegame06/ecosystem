import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, Plus, CheckCircle, Package, ChevronRight, ArrowLeft, Wrench, Truck, ArrowRightLeft } from 'lucide-react';
import Modal from '../Common/Modal';
import { Product } from '../../types/product';
import { productService } from '../../services/productService';
import { saleService } from '../../services/saleService';
import { companyService, CompanyInfo } from '../../services/companyService';
import { ProductType, PRODUCT_TYPE_LABELS } from '../../types/enums';
import { usePOS } from '../../hooks/usePOS';

// Shared components
import POSCartItem from '../POS/POSCartItem';
import POSPricingSummary from '../POS/POSPricingSummary';
import POSControls from '../POS/POSControls';

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
    const [search, setSearch] = useState('');
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // UI Local State
    const [selectedCategory, setSelectedCategory] = useState<ProductType | null>(null);
    const [filterType, setFilterType] = useState<ProductType | 'all'>('all');

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

                // Reset UI filters
                setSelectedCategory(null);
                setFilterType('all');
                setSearch('');
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

    // UI Helpers
    const getTypeIcon = (type: ProductType) => {
        switch (type) {
            case ProductType.Tangible: return <Package size={24} className="text-primary-600" />;
            case ProductType.Service: return <Wrench size={24} className="text-blue-600" />;
            case ProductType.Rentable: return <Truck size={24} className="text-amber-600" />;
            default: return <Package size={24} className="text-slate-600" />;
        }
    };

    const getStockIndicator = (product: Product) => {
        if (!product.trackInventory) return <span className="text-[10px] font-bold text-slate-400">♾️ Ilimitado</span>;
        const stock = product.stock || 0;
        if (stock === 0) return <span className="text-[10px] font-bold text-red-500">❌ Sin stock</span>;
        if (stock <= 3) return <span className="text-[10px] font-bold text-amber-500">⚠️ Solo {stock}</span>;
        return <span className="text-[10px] font-bold text-green-600">✅ {stock} disp.</span>;
    };

    const groupedProducts = useMemo(() => {
        const groups: Record<ProductType, Product[]> = {
            [ProductType.Tangible]: [],
            [ProductType.Service]: [],
            [ProductType.Rentable]: []
        };
        products.forEach(p => {
            if (p.type !== undefined && groups[p.type]) groups[p.type].push(p);
        });
        return groups;
    }, [products]);

    const displayProducts = useMemo(() => {
        let filtered = products;
        if (selectedCategory !== null) filtered = filtered.filter(p => p.type === selectedCategory);
        if (selectedCategory === null && filterType !== 'all') filtered = filtered.filter(p => p.type === filterType);
        if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        return filtered;
    }, [products, search, filterType, selectedCategory]);

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
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
                    <div className="flex items-center gap-4">
                        <ArrowRightLeft size={20} className="text-amber-500 animate-pulse" />
                        <div>
                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Modo Edición</div>
                            <div className="text-sm font-black text-amber-900">Orden #{editSaleId.slice(-6).toUpperCase()} ({channel})</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-8 h-[60vh]">
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder={selectedCategory ? `Buscar en ${PRODUCT_TYPE_LABELS[selectedCategory]}s...` : "Buscar productos..."}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {!selectedCategory && (
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'all' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todos ({products.length})</button>
                            <button onClick={() => setFilterType(ProductType.Tangible)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === ProductType.Tangible ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Productos</button>
                            <button onClick={() => setFilterType(ProductType.Service)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === ProductType.Service ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Servicios</button>
                        </div>
                    )}

                    {selectedCategory && (
                        <button onClick={() => setSelectedCategory(null)} className="mb-4 flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700">
                            <ArrowLeft size={16} /> Volver a categorías
                        </button>
                    )}

                    <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-4 h-fit">
                        {isLoading ? (
                            <div className="col-span-2 text-center py-10 text-slate-400 animate-pulse font-bold">Cargando...</div>
                        ) : selectedCategory === null && filterType === 'all' && !search ? (
                            Object.entries(groupedProducts).map(([type, items]) => {
                                const productType = Number(type) as ProductType;
                                if (items.length === 0) return null;
                                return (
                                    <div key={type} onClick={() => setSelectedCategory(productType)} className="p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-primary-500 hover:shadow-xl transition-all cursor-pointer group col-span-2 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors">{getTypeIcon(productType)}</div>
                                            <div>
                                                <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{PRODUCT_TYPE_LABELS[productType]}s</h4>
                                                <p className="text-sm text-slate-500 font-medium">{items.length} ítems</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={24} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
                                    </div>
                                );
                            })
                        ) : (
                            displayProducts.map(product => {
                                const canAdd = !product.trackInventory || (product.stock && product.stock > 0);
                                return (
                                    <div key={product.id} onClick={() => canAdd && addToCart(product)} className={`p-4 bg-white border border-slate-100 rounded-2xl transition-all flex gap-4 items-center ${canAdd ? 'hover:border-primary-500 hover:shadow-xl cursor-pointer group' : 'opacity-50 cursor-not-allowed'}`}>
                                        <div className={`w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center transition-colors ${canAdd ? 'text-slate-400 group-hover:text-primary-500' : 'text-slate-300'}`}><Package size={24} /></div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 truncate text-sm leading-tight">{product.name}</h4>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-lg font-black text-slate-900">{companyInfo?.currencySymbol || '$'}{product.price.toFixed(2)}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{product.unit || 'pza'}</span>
                                            </div>
                                            {getStockIndicator(product)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="w-96 flex flex-col bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 italic uppercase tracking-tighter">
                            <ShoppingCart className="text-primary-600" size={20} /> Carrito ({cart.length})
                        </h3>
                        <button onClick={() => clearCart()} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Vaciar</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-6">
                                <ShoppingCart size={48} className="mb-4 opacity-10" />
                                <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Carrito vacío</p>
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

                    <div className="p-4 bg-white border-t border-slate-100 space-y-6">
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
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-600 uppercase tracking-widest leading-relaxed">
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
