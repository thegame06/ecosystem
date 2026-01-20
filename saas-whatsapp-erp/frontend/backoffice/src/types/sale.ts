export interface SaleItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number; // 0 to 1 (e.g., 0.21)
    subtotal: number;
    taxAmount: number;
    total: number;
}

export interface Sale {
    id: string;
    companyId: string;
    customerId: string;
    number: string;
    customerName?: string; // Helper for UI
    date: string; // ISO Date
    items: SaleItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    status: string;
    paymentMethod?: 'cash' | 'transfer' | 'card';
}

export interface CreateSaleDto {
    customerId: string;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number; // Snapshot price
    }[];
    paymentMethod: 'cash' | 'transfer' | 'card';
}
