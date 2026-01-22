import api from './api';
import { PlanType } from '../types/enums';

export interface UsageCounters {
    messagesUsed: number;
    conversationsUsed: number;
    invoicesUsed: number;
    usersUsed: number;
}

export interface WhatsAppSettings {
    phoneNumberId?: string;
    accessToken?: string;
    verifyToken?: string;
    businessAccountId?: string;
}

export interface CompanyInfo {
    id: string;
    name: string;
    plan: PlanType;
    isTaxEnabled: boolean;
    taxRate: number;
    country: string;
    currencySymbol: string;
    whatsAppSettings?: WhatsAppSettings;
}

export const companyService = {
    getMe: () => api.get<CompanyInfo>('/companies/me'),
    updateMe: (data: Partial<CompanyInfo>) => api.put<CompanyInfo>('/companies/me', data),
    getUsage: () => api.get<UsageCounters>('/companies/usage'),
    getLimits: () => api.get<any>('/companies/limits'),
};
