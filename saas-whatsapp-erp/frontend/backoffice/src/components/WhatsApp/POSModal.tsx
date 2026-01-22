import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle, Package, User } from 'lucide-react';
import Modal from '../Common/Modal';
import { Product } from '../../types/product';
import { productService } from '../../services/productService';
import { saleService } from '../../services/saleService';
import { companyService, CompanyInfo } from '../../services/companyService';
import { CreateSaleRequest, CartItem } from '../../types/sale';

interface POSModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
    customerName: string;
    onSuccess: (saleId: string) => void;
}

const POSModal: React.FC<POSModalProps> = ({ isOpen, onClose, customerId, customerName, onSuccess }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            fetchCompanyInfo();
        }
    }, [isOpen]);

    const fetchCompanyInfo = async () => {
        try {
            const response = await companyService.getMe();
            setCompanyInfo(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await productService.getAll();
            const items = response.data?.result || response.data || [];
            setProducts(items.filter((p: Product) => p.isActive));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
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
            }
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

    const cartSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const cartTaxTotal = cart.reduce((acc, item) => acc + item.taxAmount, 0);
    const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

    const handleSubmit = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);
        try {
            const request: CreateSaleRequest = {
                customerId,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                }))
            };
            const response = await saleService.create(request);
            onSuccess(response.id);
            setCart([]);
            onClose();
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.code === 'PLAN_LIMIT_REACHED'
                ? 'Has alcanzado el límite de tu plan. Actualiza para continuar.'
                : err.message || 'Error al crear la venta. Intenta nuevamente.';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Nueva Venta para ${customerName}`}
            size="xl"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div className="flex gap-8 text-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                            <span className="text-xl font-bold">{companyInfo?.currencySymbol || '$'}{cartSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IVA ({((companyInfo?.taxRate || 0.15) * 100).toFixed(0)}%)</span>
                            <span className="text-xl font-bold">{companyInfo?.currencySymbol || '$'}{cartTaxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-primary-600">Total a Pagar</span>
                            <span className="text-3xl font-black text-slate-900">{companyInfo?.currencySymbol || '$'}{cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={cart.length === 0 || isSubmitting}
                        className="bg-primary-600 px-10 py-4 rounded-2xl text-white font-black hover:bg-primary-700 transition-all flex items-center gap-3 disabled:bg-slate-300 shadow-xl"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Procesando...</span>
                        ) : (
                            <>
                                <CheckCircle size={24} />
                                CONFIRMAR VENTA
                            </>
                        )}
                    </button>
                </div>
            }
        >
            <div className="flex gap-8 h-[60vh]">
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar productos o servicios..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-4 h-fit">
                        {isLoading ? (
                            <div className="col-span-2 text-center py-10 text-slate-400 animate-pulse">Cargando productos...</div>
                        ) : filteredProducts.map(product => (
                            <div key={product.id} onClick={() => addToCart(product)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary-500 hover:shadow-xl transition-all cursor-pointer group flex gap-4 items-center">
                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors">
                                    <Package size={24} />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <h4 className="font-bold text-slate-800 truncate text-sm">{product.name}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-lg font-black text-slate-900">{companyInfo?.currencySymbol || '$'}{product.price.toFixed(2)}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{product.unit || 'pza'}</span>
                                    </div>
                                    {product.priceIncludesTax && <div className="text-[8px] text-green-600 font-black">IVA INC.</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-96 flex flex-col bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
                        <h3 className="font-black text-slate-800 flex items-center gap-2 italic">
                            <ShoppingCart className="text-primary-600" size={20} /> Carrito ({cart.length})
                        </h3>
                        <button onClick={() => setCart([])} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Vaciar</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-6">
                                <ShoppingCart size={48} className="mb-4 opacity-10" />
                                <p className="text-sm font-bold opacity-50">Carrito vacío</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.productId} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800 text-xs truncate flex-1">{item.productName}</h4>
                                        <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 border border-slate-200 rounded hover:bg-slate-50"><Minus size={12} /></button>
                                            <span className="font-bold text-sm text-slate-800">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 border border-slate-200 rounded hover:bg-slate-50"><Plus size={12} /></button>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-slate-900">{companyInfo?.currencySymbol || '$'}{item.total.toFixed(2)}</div>
                                            {item.priceIncludesTax && <div className="text-[8px] text-green-600 font-bold">IVA INC.</div>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default POSModal;
