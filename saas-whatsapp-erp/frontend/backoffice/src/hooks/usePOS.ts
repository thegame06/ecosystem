import { useState, useCallback, useMemo } from 'react';
import { Product } from '../types/product';
import { Customer } from '../types/customer';
import { CartItem, CreateSaleRequest, SaleError } from '../types/sale';
import { PaymentMethod, DiscountType } from '../types/enums';
import { saleService } from '../services/saleService';
import { CompanyInfo } from '../services/companyService';

interface UsePOSOptions {
    initialCustomerId?: string;
    onSuccess?: (saleId: string) => void;
    companyInfo: CompanyInfo | null;
}

export const usePOS = ({ initialCustomerId, onSuccess, companyInfo }: UsePOSOptions) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [applyTax, setApplyTax] = useState<boolean>(true);
    const [globalDiscount, setGlobalDiscount] = useState<{ type: DiscountType, value: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<SaleError | null>(null);

    const calculateItemTotals = useCallback((item: CartItem): CartItem => {
        let subtotal = 0;
        let taxAmount = 0;
        let total = 0;

        // Note: isTaxable here refers to if the PRODUCT is taxable. 
        // Company-level tax enabling is handled in the final totals calculation.
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
            subtotal: Math.round(subtotal * 100) / 100,
            taxAmount: Math.round(taxAmount * 100) / 100,
            total: Math.round(total * 100) / 100,
        };
    }, []);

    const addToCart = useCallback((product: Product) => {
        const effectiveTaxRate = product.taxRate !== undefined && product.taxRate !== null
            ? product.taxRate
            : (companyInfo?.taxRate ?? 0.15);

        const isTaxable = product.isTaxable ?? true;

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
    }, [companyInfo, calculateItemTotals]);

    const updateQuantity = useCallback((productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(0.01, item.quantity + delta);
                return calculateItemTotals({ ...item, quantity: newQty });
            }
            return item;
        }));
    }, [calculateItemTotals]);

    const removeFromCart = useCallback((productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setGlobalDiscount(null);
        setPaymentMethod(PaymentMethod.Cash);
    }, []);

    const totals = useMemo(() => {
        const rawSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);

        let discountAmount = 0;
        if (globalDiscount) {
            if (globalDiscount.type === DiscountType.Percentage) {
                discountAmount = rawSubtotal * (globalDiscount.value / 100);
            } else {
                discountAmount = globalDiscount.value;
            }
        }

        discountAmount = Math.min(discountAmount, rawSubtotal);

        let finalSubtotal = 0;
        let finalTaxTotal = 0;

        cart.forEach(item => {
            const lineDiscountShare = rawSubtotal > 0
                ? (item.subtotal / rawSubtotal) * discountAmount
                : 0;

            const subtotalAfterDiscount = item.subtotal - lineDiscountShare;
            const taxRate = item.taxRate || companyInfo?.taxRate || 0.15;

            let lineSubtotal: number;
            let lineTaxAmount: number;

            if (item.priceIncludesTax) {
                const lineTotal = subtotalAfterDiscount;
                lineSubtotal = lineTotal / (1 + taxRate);
                lineTaxAmount = lineTotal - lineSubtotal;
            } else {
                lineSubtotal = subtotalAfterDiscount;
                lineTaxAmount = 0;
                if (applyTax && item.isTaxable) {
                    lineTaxAmount = lineSubtotal * taxRate;
                }
            }

            finalSubtotal += lineSubtotal;
            finalTaxTotal += lineTaxAmount;
        });

        const subtotal = Math.round(finalSubtotal * 100) / 100;
        const taxTotal = Math.round(finalTaxTotal * 100) / 100;
        const total = Math.round((subtotal + taxTotal) * 100) / 100;

        return { subtotal, taxTotal, total, discountAmount, rawSubtotal };
    }, [cart, globalDiscount, applyTax, companyInfo]);

    const submitSale = async (channel: string, editSaleId?: string | null) => {
        const customerId = selectedCustomer?.id || initialCustomerId;
        if (!customerId || cart.length === 0) return null;

        setIsSubmitting(true);
        setError(null);
        try {
            const request: CreateSaleRequest = {
                customerId,
                paymentMethod,
                applyTax,
                globalDiscount: globalDiscount || undefined,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
                channel
            };

            const response = editSaleId
                ? await saleService.update(editSaleId, request)
                : await saleService.create(request);

            const saleId = editSaleId || response.id;
            if (onSuccess) onSuccess(saleId);

            return saleId;
        } catch (err: any) {
            setError(err as SaleError);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const rehydrate = useCallback((sale: any) => {
        if (sale.items) {
            const cartItems: CartItem[] = sale.items.map((item: any) => {
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
        if (sale.globalDiscountType && sale.globalDiscountType !== DiscountType.None) {
            setGlobalDiscount({
                type: sale.globalDiscountType,
                value: sale.globalDiscountValue
            });
        }
    }, [companyInfo]);

    return {
        cart,
        setCart,
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
        setError,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totals,
        submitSale,
        calculateItemTotals,
        rehydrate
    };
};
