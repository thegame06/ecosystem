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
    isActive?: boolean;
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

    // WhatsApp Settings específicos
    getWhatsAppSettings: () => api.get<WhatsAppSettings>('/companies/whatsapp-settings'),
    createWhatsAppSettings: (data: WhatsAppSettings) => api.post<WhatsAppSettings>('/companies/whatsapp-settings', data),
    updateWhatsAppSettings: (data: WhatsAppSettings) => api.put<WhatsAppSettings>('/companies/whatsapp-settings', data),
};
