export enum ProductType {
    Tangible = 1,
    Service = 2,
    Rentable = 3
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    [ProductType.Tangible]: 'Producto',
    [ProductType.Service]: 'Servicio',
    [ProductType.Rentable]: 'Renta'
};

export interface Product {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    type: ProductType;
    price: number;
    costPrice?: number;
    taxRate?: number;
    imageUrl?: string;
    unit?: string;
    discount?: number;
    trackInventory: boolean;
    stock: number;
    rentalPricePerDay?: number;
    rentalPricePerHour?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    // UI Helpers
    sku?: string; 
}

export interface CreateProductRequest {
    name: string;
    description?: string;
    type: ProductType;
    price: number;
    costPrice?: number;
    taxRate: number; // e.g. 0.15 for 15%
    imageUrl?: string;
    unit?: string;
    discount?: number;
    trackInventory: boolean;
    stock?: number;
}

export interface UpdateProductRequest extends CreateProductRequest {
    id: string;
}
