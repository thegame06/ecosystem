import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle, Package } from 'lucide-react';
import Modal from '../Common/Modal';
import { Product } from '../../types/product';
import { productService } from '../../services/productService';
import { saleService } from '../../services/saleService';
import { CreateSaleRequest } from '../../types/sale';

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
    const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await productService.getAll();
            setProducts(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let taxTotal = 0;

        cart.forEach(item => {
            const lineSubtotal = item.product.basePrice * item.quantity;
            subtotal += lineSubtotal;
            if (item.product.isTaxable) {
                taxTotal += lineSubtotal * 0.15; // Assume 15% for NI
            }
        });

        return {
            subtotal,
            taxTotal,
            total: subtotal + taxTotal
        };
    };

    const totals = calculateTotals();

    const handleSubmit = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);
        try {
            const request: CreateSaleRequest = {
                customerId,
                items: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: item.product.basePrice,
                    taxRate: item.product.isTaxable ? 0.15 : 0
                }))
            };
            const response = await saleService.create(request);
            onSuccess(response.data.id);
            setCart([]);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Error al crear la venta. Verifique los límites de su plan.');
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
                    <div className="flex gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                            <span className="text-xl font-bold text-slate-600">${totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IVA (15%)</span>
                            <span className="text-xl font-bold text-slate-600">${totals.taxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-primary-600">Total a Pagar</span>
                            <span className="text-3xl font-black text-slate-900">${totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={cart.length === 0 || isSubmitting}
                        className="btn-primary flex items-center gap-3 disabled:bg-slate-300 shadow-xl"
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
                {/* Product Search & List */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar productos o servicios..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {isLoading ? (
                            <div className="text-center py-10 text-slate-400 animate-pulse">Cargando productos...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <p>No se encontraron productos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary-500 hover:shadow-xl hover:shadow-primary-900/5 transition-all cursor-pointer group flex gap-4 items-center"
                                    >
                                        <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                                            <Package size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <h4 className="font-bold text-slate-800 truncate">{product.name}</h4>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-lg font-black text-slate-900">${product.basePrice.toFixed(2)}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.unit}</span>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                            <Plus size={18} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart Summary */}
                <div className="w-96 flex flex-col glass rounded-3xl border-slate-200 overflow-hidden">
                    <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-black text-slate-800 flex items-center gap-2">
                            <ShoppingCart className="text-primary-600" size={20} />
                            Carrito ({cart.length})
                        </h3>
                        <button onClick={() => setCart([])} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Vaciar</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center px-6">
                                <ShoppingCart size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-bold">Tu carrito está vacío.<br />Selecciona productos a la izquierda.</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.product.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{item.product.name}</h4>
                                        <button onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100 text-slate-900">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-slate-400 block">${item.product.basePrice.toFixed(2)} c/u</span>
                                            <span className="text-base font-black text-slate-900">${(item.product.basePrice * item.quantity).toFixed(2)}</span>
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
