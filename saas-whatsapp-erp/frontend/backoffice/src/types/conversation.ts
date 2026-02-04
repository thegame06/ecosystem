import { CommercialState } from './enums';

export interface Conversation {
    id: string;
    companyId: string;
    customerId: string;
    customerPhone: string;
    remoteJid?: string;
    channel: string;
    lastMessage: string | null;
    lastState: CommercialState;
    lastActivityAt: string;
    isActive: boolean;
}
