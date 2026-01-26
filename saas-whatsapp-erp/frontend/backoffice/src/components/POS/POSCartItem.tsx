import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItem } from '../../types/sale';

interface POSCartItemProps {
    item: CartItem;
    currencySymbol: string;
    onUpdateQuantity: (productId: string, delta: number) => void;
    onRemove: (productId: string) => void;
}

const POSCartItem: React.FC<POSCartItemProps> = ({ item, currencySymbol, onUpdateQuantity, onRemove }) => {
    return (
        <div key={item.productId} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 text-xs truncate flex-1">{item.productName}</h4>
                <button onClick={() => onRemove(item.productId)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onUpdateQuantity(item.productId, -1)}
                        className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Minus size={12} />
                    </button>
                    <span className="font-black text-sm text-slate-800 min-w-[20px] text-center">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.productId, 1)}
                        className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>
                <div className="text-right">
                    <div className="text-sm font-black text-slate-900">{currencySymbol}{item.total.toFixed(2)}</div>
                    {item.priceIncludesTax && <div className="text-[8px] text-green-600 font-black uppercase tracking-tighter">IVA Inc.</div>}
                </div>
            </div>
        </div>
    );
};

export default POSCartItem;
