import api from './api';
import { CreateSaleRequest, SaleResponse, SaleError } from '../types/sale';
import { PagedResponse } from '../types/pagination';
import { AxiosError } from 'axios';

/**
 * Servicio para gestión de ventas
 * Maneja la comunicación con el backend y errores específicos
 */
export const saleService = {
    /**
     * Obtener todas las ventas con paginación OData
     */
    search: async (params?: {
        filter?: string;
        orderBy?: string;
        skip?: number;
        top?: number;
    }): Promise<PagedResponse<SaleResponse>> => {
        const queryParams = new URLSearchParams();
        if (params?.filter) queryParams.append('$filter', params.filter);
        if (params?.orderBy) queryParams.append('$orderby', params.orderBy);
        if (params?.skip !== undefined) queryParams.append('$skip', params.skip.toString());
        if (params?.top !== undefined) queryParams.append('$top', params.top.toString());
        queryParams.append('$count', 'true');

        const response = await api.get<PagedResponse<SaleResponse>>(
            `/sales/search?${queryParams.toString()}`
        );
        return response.data;
    },

    /**
     * Obtener venta por ID
     */
    getById: async (id: string): Promise<SaleResponse> => {
        const response = await api.get<SaleResponse>(`/sales/${id}`);
        return response.data;
    },

    /**
     * Crear nueva venta
     * @throws {SaleError} Si hay error de validación, límite de plan, etc.
     */
    create: async (data: CreateSaleRequest): Promise<SaleResponse> => {
        try {
            const response = await api.post<SaleResponse>('/sales', data);
            return response.data;
        } catch (error) {
            throw parseSaleError(error);
        }
    },

    /**
     * Actualizar venta (solo si no está facturada)
     */
    update: async (id: string, data: CreateSaleRequest): Promise<SaleResponse> => {
        try {
            const response = await api.put<SaleResponse>(`/sales/${id}`, data);
            return response.data;
        } catch (error) {
            throw parseSaleError(error);
        }
    },

    /**
     * Obtener factura de una venta
     */
    getInvoice: async (id: string) => {
        const response = await api.get(`/sales/${id}/invoice`);
        return response.data;
    },

    /**
     * Simular cálculo de venta (Centralizado en Backend)
     */
    calculate: async (data: any): Promise<any> => {
        const response = await api.post('/sales/calculate', data);
        return response.data;
    },
};

/**
 * Parsea errores de la API y los convierte en SaleError
 */
function parseSaleError(error: unknown): SaleError {
    if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        switch (status) {
            case 403:
                return {
                    code: 'PLAN_LIMIT_REACHED',
                    message: 'Has alcanzado el límite de tu plan. Actualiza para continuar.',
                    details: message,
                };
            case 400:
                return {
                    code: 'VALIDATION_ERROR',
                    message: message || 'Datos inválidos',
                    details: error.response?.data?.details,
                };
            case 401:
                return {
                    code: 'UNAUTHORIZED',
                    message: 'Sesión expirada. Por favor inicia sesión nuevamente.',
                };
            case 500:
                return {
                    code: 'SERVER_ERROR',
                    message: 'Error del servidor. Intenta nuevamente.',
                    details: message,
                };
            default:
                return {
                    message: message || 'Error desconocido',
                };
        }
    }

    return {
        message: 'Error inesperado',
        details: String(error),
    };
}

