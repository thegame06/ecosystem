import api from './api';
import { Sale, CreateSaleRequest } from '../types/sale';
import { PagedResponse } from '../types/pagination';

export const saleService = {
    getAll: (page: number = 1, pageSize: number = 20) =>
        api.get<PagedResponse<Sale>>(`/sales?page=${page}&pageSize=${pageSize}`),

    getById: (id: string) => api.get<Sale>(`/sales/${id}`),

    create: (data: CreateSaleRequest) => api.post<Sale>('/sales', data),

    getInvoice: (id: string) => api.get(`/sales/${id}/invoice`),
};
