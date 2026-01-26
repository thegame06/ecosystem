import React from 'react';
import { DollarSign, CreditCard, ArrowRightLeft, CheckCircle, Percent } from 'lucide-react';
import { PaymentMethod, DiscountType } from '../../types/enums';

interface POSControlsProps {
    paymentMethod: PaymentMethod;
    setPaymentMethod: (method: PaymentMethod) => void;
    applyTax: boolean;
    setApplyTax: (apply: boolean) => void;
    globalDiscount: { type: DiscountType, value: number } | null;
    setGlobalDiscount: (discount: { type: DiscountType, value: number } | null) => void;
    taxRate: number;
}

const POSControls: React.FC<POSControlsProps> = ({
    paymentMethod,
    setPaymentMethod,
    applyTax,
    setApplyTax,
    globalDiscount,
    setGlobalDiscount,
    taxRate
}) => {
    const handleDiscountClick = () => {
        if (globalDiscount) {
            setGlobalDiscount(null);
        } else {
            const val = prompt('Descuento (%) o Monto ($). Escribe "10%" o "50"');
            if (val) {
                if (val.includes('%')) {
                    setGlobalDiscount({ type: DiscountType.Percentage, value: parseFloat(val.replace('%', '')) });
                } else {
                    setGlobalDiscount({ type: DiscountType.Fixed, value: parseFloat(val) });
                }
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Payment Method Selector */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Forma de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setPaymentMethod(PaymentMethod.Cash)}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${paymentMethod === PaymentMethod.Cash ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-100 bg-slate-50 text-slate-400 grayscale'}`}
                    >
                        <DollarSign size={20} className="mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Efectivo</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod(PaymentMethod.Transfer)}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${paymentMethod === PaymentMethod.Transfer ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-100 bg-slate-50 text-slate-400 grayscale'}`}
                    >
                        <ArrowRightLeft size={20} className="mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Transf.</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod(PaymentMethod.Card)}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${paymentMethod === PaymentMethod.Card ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-slate-100 bg-slate-50 text-slate-400 grayscale'}`}
                    >
                        <CreditCard size={20} className="mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Tarjeta</span>
                    </button>
                </div>
            </div>

            {/* Options: Tax & Discount */}
            <div className="flex gap-2">
                <button
                    onClick={() => setApplyTax(!applyTax)}
                    className={`flex-1 py-3 px-3 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${applyTax ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}
                >
                    <CheckCircle size={16} className={applyTax ? 'opacity-100' : 'opacity-0'} />
                    IVA {(taxRate * 100).toFixed(0)}%
                </button>

                <button
                    onClick={handleDiscountClick}
                    className={`flex-1 py-3 px-3 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${globalDiscount ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-white text-slate-400 border-slate-100'}`}
                >
                    <Percent size={16} />
                    {globalDiscount ? (globalDiscount.type === DiscountType.Percentage ? `-${globalDiscount.value}%` : `-$${globalDiscount.value}`) : 'Descuento'}
                </button>
            </div>
        </div>
    );
};

export default POSControls;
