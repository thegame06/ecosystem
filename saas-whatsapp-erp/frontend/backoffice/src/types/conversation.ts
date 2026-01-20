export enum CommercialState {
    LEAD = 'LEAD',
    SALE_CREATED = 'SALE_CREATED',
    INVOICED = 'INVOICED',
    PAID = 'PAID'
}

export interface Conversation {
    id: string;
    companyId: string;
    customerId: string;
    customerName: string; // Enriched from customer
    customerPhone: string;
    channel: string;
    lastMessage: string;
    lastState: CommercialState;
    hasUnreadMessages: boolean;
    updatedAt: string;
}
