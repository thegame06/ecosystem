import api from './api';
import { PagedResponse } from '../types/pagination';
import { InvoiceStatus } from '../types/enums';

export const invoiceService = {
    getAll: (page: number = 1, pageSize: number = 20) =>
        api.get<PagedResponse<Invoice>>(`/invoices?page=${page}&pageSize=${pageSize}`),

    getById: (id: string) => api.get<Invoice>(`/invoices/${id}`),

    create: (saleId: string) => api.post<Invoice>('/invoices', { saleId }),

    sendWhatsApp: (id: string) => api.post(`/invoices/${id}/send-whatsapp`),

    downloadPdf: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
    updateStatus: (id: string, status: InvoiceStatus | string) => api.put(`/invoices/${id}/status`, { status }),
};

export interface Invoice {
    id: string;
    saleId: string;
    customerId: string;
    number: string;
    total: number;
    status: InvoiceStatus;
    issuedAt: string;
}
