import api from './api';
import { Invoice } from './invoiceService';
import { PagedResponse } from '../types/pagination';

export const invoiceService = {
    getAll: (page: number = 1, pageSize: number = 20) =>
        api.get<PagedResponse<Invoice>>(`/invoices?page=${page}&pageSize=${pageSize}`),

    getById: (id: string) => api.get<Invoice>(`/invoices/${id}`),

    create: (saleId: string) => api.post<Invoice>('/invoices', { saleId }),

    sendWhatsApp: (id: string) => api.post(`/invoices/${id}/send-whatsapp`),

    downloadPdf: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

export interface Invoice {
    id: string;
    saleId: string;
    customerId: string;
    number: string;
    total: number;
    status: string;
    issuedAt: string;
}
