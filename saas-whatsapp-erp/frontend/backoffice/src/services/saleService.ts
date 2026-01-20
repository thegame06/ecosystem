import api from './api';
import { Sale, CreateSaleDto } from '../types/sale';

export const saleService = {
    getAll: async (): Promise<Sale[]> => {
        const response = await api.get<Sale[]>('/sales');
        return response.data;
    },

    create: async (saleData: CreateSaleDto): Promise<Sale> => {
        const response = await api.post<Sale>('/sales', saleData);
        return response.data;
    }
};
