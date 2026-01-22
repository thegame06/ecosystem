import { CommercialState } from './enums';

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
    unitPrice?: number; // Opcional: si no se envía, backend usa precio del producto
}

/**
 * Request para crear una venta
 * Alineado con CreateSaleRequest del backend
 */
export interface CreateSaleRequest {
    customerId: string;
    items: CreateSaleItemRequest[];
    paymentMethod?: string;
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
    discountType: string;
    discountValue: number;
    discountedSubtotal: number;
    taxAmount: number;
    total: number;
}

/**
 * Respuesta de venta del backend
 */
export interface SaleResponse {
    id: string;
    companyId: string;
    customerId: string;
    items: SaleItemResponse[];
    subtotal: number;
    taxTotal: number;
    total: number;
    state: CommercialState;
    createdAt: string;
}

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
