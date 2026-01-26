import React from 'react';
import { CompanyInfo } from '../../services/companyService';

interface POSPricingSummaryProps {
    subtotal: number;
    taxTotal: number;
    total: number;
    discountAmount: number;
    rawSubtotal: number;
    companyInfo: CompanyInfo | null;
    applyTax: boolean;
}

const POSPricingSummary: React.FC<POSPricingSummaryProps> = ({
    subtotal,
    taxTotal,
    total,
    discountAmount,
    rawSubtotal,
    companyInfo,
    applyTax
}) => {
    const currency = companyInfo?.currencySymbol || '$';
    const taxRatePercent = ((companyInfo?.taxRate || 0.15) * 100).toFixed(0);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500 font-bold">
                <span>Subtotal</span>
                <span>{currency}{rawSubtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-amber-600 font-bold">
                    <span>Descuento</span>
                    <span>-{currency}{discountAmount.toFixed(2)}</span>
                </div>
            )}

            {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-slate-700 font-bold border-t border-slate-200 pt-1 mt-1">
                    <span>Subtotal Neto</span>
                    <span>{currency}{(rawSubtotal - discountAmount).toFixed(2)}</span>
                </div>
            )}

            <div className="flex justify-between text-xs text-slate-500 font-bold">
                <span>IVA {applyTax ? `(${taxRatePercent}%)` : '(0%)'}</span>
                <span>{currency}{taxTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-2xl font-black text-slate-900 pt-2 border-t border-slate-200 mt-1">
                <span>TOTAL</span>
                <span className="text-primary-600">{currency}{total.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default POSPricingSummary;
