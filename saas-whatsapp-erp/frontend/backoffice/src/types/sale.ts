import { CommercialState, PaymentMethod, DiscountType } from './enums';

// ============================================
// REQUEST TYPES (Frontend → Backend)
// ============================================

/**
 * Item para crear una venta
 * Alineado con CreateSaleItemRequest del backend
 */
export interface CreateSaleItemRequest {
    productId: string;
    quantity: number;
    unitPrice?: number;
    discountType?: DiscountType;
    discountValue?: number;
}

/**
 * Request para crear una venta
 * Alineado con CreateSaleRequest del backend
 */
export interface CreateSaleRequest {
    customerId: string;
    items: CreateSaleItemRequest[];
    paymentMethod: PaymentMethod;
    applyTax?: boolean;
    globalDiscount?: {
        type: DiscountType;
        value: number;
    };
    channel?: string;
}

// ============================================
// RESPONSE TYPES (Backend → Frontend)
// ============================================

/**
 * Item de venta en la respuesta
 */
export interface SaleItemResponse {
    productId: string;
    nameSnapshot: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    discountType: DiscountType;
    discountValue: number;
    discountedSubtotal: number;
    taxAmount: number;
    total: number;
}

/**
 * Respuesta de venta del backend
 * Actualizada para coincidir con la interfaz Sale de la guía
 */
export interface Sale {
    id: string;
    companyId: string;
    customerId: string;
    customerName: string;
    items: SaleItemResponse[];
    paymentMethod: PaymentMethod;
    subtotal: number;
    taxTotal: number;
    total: number;
    state: CommercialState;
    applyTax: boolean;
    globalDiscountType: DiscountType;
    globalDiscountValue: number;
    channel: string;
    createdAt: string;
}

export type SaleResponse = Sale;

// ============================================
// UI TYPES (Solo para frontend)
// ============================================

/**
 * Item del carrito en la UI
 * Incluye información adicional para mostrar en pantalla
 */
export interface CartItem {
    productId: string;
    productName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    isTaxable: boolean;
    taxRate: number; // e.g. 0.15
    priceIncludesTax: boolean;
    discountType?: DiscountType;
    discountValue?: number;
    // Calculados
    subtotal: number;
    taxAmount: number;
    total: number;
}

// ============================================
// ERROR TYPES
// ============================================

export interface SaleError {
    message: string;
    code?: 'PLAN_LIMIT_REACHED' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'UNAUTHORIZED';
    details?: string;
}
