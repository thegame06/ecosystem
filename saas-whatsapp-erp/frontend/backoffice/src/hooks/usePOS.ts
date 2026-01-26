import { useState, useCallback, useMemo, useEffect } from 'react';
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
                        ? { ...item, quantity: item.quantity + 1 }
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
                discountType: product.discount ? DiscountType.Percentage : DiscountType.None,
                discountValue: product.discount || 0,
                subtotal: 0,
                taxAmount: 0,
                total: 0,
            };
            return [...prev, newItem];
        });
    }, [companyInfo]);

    const updateQuantity = useCallback((productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(0.01, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setGlobalDiscount(null);
        setPaymentMethod(PaymentMethod.Cash);
    }, []);

    const [calculationResult, setCalculationResult] = useState<any>(null);

    useEffect(() => {
        if (cart.length === 0) {
            setCalculationResult(null);
            return;
        }

        const fetchTotals = async () => {
            const request = {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discountType: item.discountType || DiscountType.None,
                    discountValue: item.discountValue || 0,
                })),
                applyTax,
                globalDiscount: globalDiscount || undefined
            };

            try {
                const result = await saleService.calculate(request);
                setCalculationResult(result);
            } catch (err) {
                console.error('Error calculating totals from backend:', err);
            }
        };

        const timer = setTimeout(fetchTotals, 300);
        return () => clearTimeout(timer);
    }, [cart, applyTax, globalDiscount]);

    const totals = useMemo(() => {
        if (!calculationResult) {
            return { subtotal: 0, taxTotal: 0, total: 0, discountAmount: 0, rawSubtotal: 0 };
        }
        return {
            subtotal: calculationResult.subtotal,
            taxTotal: calculationResult.taxTotal,
            total: calculationResult.total,
            discountAmount: calculationResult.discountTotal,
            rawSubtotal: calculationResult.items.reduce((acc: number, i: any) => acc + (i.quantity * i.unitPrice), 0)
        };
    }, [calculationResult]);

    // Homologar los items del carrito con los calculados por el backend para la UI
    const displayCart = useMemo(() => {
        if (!calculationResult) return cart;
        return cart.map(item => {
            const calculated = calculationResult.items.find((i: any) => i.productId === item.productId);
            if (calculated) {
                return {
                    ...item,
                    subtotal: calculated.subtotal,
                    taxAmount: calculated.taxAmount,
                    total: calculated.total
                };
            }
            return item;
        });
    }, [cart, calculationResult]);

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
                    discountType: item.discountType || DiscountType.None,
                    discountValue: item.discountValue || 0,
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
                    discountType: item.discountType || DiscountType.None,
                    discountValue: item.discountValue || 0,
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
        cart: displayCart,
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
        rehydrate
    };
};
