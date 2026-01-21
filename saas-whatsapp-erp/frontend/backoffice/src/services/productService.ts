import api from './api';
import { Product } from '../types/product';
import { PagedResponse } from '../types/pagination';

export const productService = {
    getAll: (page: number = 1, pageSize: number = 20) =>
        api.get<PagedResponse<Product>>(`/products?page=${page}&pageSize=${pageSize}`),

    getById: (id: string) => api.get<Product>(`/products/${id}`),

    create: (data: any) => api.post<Product>('/products', data),

    update: (id: string, data: any) => api.put<Product>(`/products/${id}`, data),

    delete: (id: string) => api.delete(`/products/${id}`)
};
