export interface Customer {
    id: string;
    companyId: string;
    name: string; // Single name field from Backend
    firstName?: string; // UI Compat
    lastName?: string; // UI Compat
    phone: string;
    currentState?: string; // CommercialState Enum
    taxId?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    isActive?: boolean;
    whatsappConsent: boolean; // Added for MVP
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCustomerRequest {
    name: string;
    phone: string;
    email?: string;
    taxId?: string;
    address?: string;
    whatsappConsent: boolean;
}

export interface UpdateCustomerRequest {
    name?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    address?: string;
    city?: string;
    notes?: string;
    whatsappConsent?: boolean;
}
