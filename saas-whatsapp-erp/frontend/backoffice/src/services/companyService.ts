import api from './api';
import { PlanType } from '../types/auth';

export interface UsageCounters {
    messagesUsed: number;
    conversationsUsed: number;
    invoicesUsed: number;
    usersUsed: number;
}

export interface CompanyInfo {
    id: string;
    name: string;
    plan: PlanType;
    isTaxEnabled: boolean;
    taxRate: number;
}

export const companyService = {
    getMe: () => api.get<CompanyInfo>('/companies/me'), // I need to verify if this endpoint exists
    getUsage: () => api.get<UsageCounters>('/companies/usage'), // I need to verify if this endpoint exists
};
