import { CommercialState } from './conversation';

export interface SaleItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number; // e.g. 0.15
    subtotal: number;
    total: number;
}

export interface Sale {
    id: string;
    companyId: string;
    customerId: string;
    items: SaleItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    state: CommercialState;
    createdAt: string;
}

export interface CreateSaleRequest {
    customerId: string;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }[];
}
