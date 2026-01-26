import api from './api';
import { Conversation } from '../types/conversation';
import { Customer } from '../types/customer';
import { PagedResponse } from '../types/pagination';

export const conversationService = {
    getAll: (page: number = 1, pageSize: number = 20) =>
        api.get<PagedResponse<Conversation>>(`/conversations?page=${page}&pageSize=${pageSize}`),

    getById: (id: string) => api.get<Conversation>(`/conversations/${id}`),

    getCustomer: (id: string) => api.get<Customer>(`/conversations/${id}/customer`),

    sendMessage: (id: string, message: string) =>
        api.post<{ success: boolean }>(`/conversations/${id}/messages`, { message }),

    getMessages: (id: string) => api.get<any[]>(`/conversations/${id}/messages`),

    close: (id: string) => api.post<{ success: boolean }>(`/conversations/${id}/close`),
};


