import api from './api';
import { Product, CreateProductRequest, UpdateProductRequest, ProductType } from '../types/product';

// UI Helper to adapt Backend Response to UI Model if needed
const adaptProduct = (p: Product): Product => ({
    ...p,
    sku: p.id.substring(0, 8).toUpperCase(), // Fake SKU if missing
    stock: p.stock ?? 0,
    taxRate: p.taxRate ?? 0
});

export const productService = {
  getAll: async (): Promise<Product[]> => {
      const response = await api.get<Product[]>('/products');
      return response.data.map(adaptProduct);
  },
  getById: async (id: string): Promise<Product | undefined> => {
      const response = await api.get<Product>(`/products/${id}`);
      return adaptProduct(response.data);
  },
  create: async (data: CreateProductRequest): Promise<Product> => {
      const response = await api.post<Product>('/products', data);
      return adaptProduct(response.data);
  },
  update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
       const response = await api.put<Product>(`/products/${id}`, data);
       return adaptProduct(response.data);
  },
  delete: async (id: string) => {
      return api.delete(`/products/${id}`);
  }
};
