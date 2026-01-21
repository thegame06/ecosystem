import { ProductType } from './enums';

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
}

export interface CreateProductRequest {
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
    stock?: number;
    rentalPricePerDay?: number;
    rentalPricePerHour?: number;
}

export interface UpdateProductRequest extends CreateProductRequest {
    isActive: boolean;
}
