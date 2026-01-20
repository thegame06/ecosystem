import React, { useState } from 'react';
import { MessageCircle, FileText, ShoppingCart } from 'lucide-react';
import { Conversation, CommercialState } from '../../types/conversation';
import Button from '../../components/Common/Button';

// Mock Data
const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: '1',
        companyId: '123',
        customerId: 'c1',
        customerName: 'Juan Pérez',
        customerPhone: '+505 8888 8888',
        channel: 'WhatsApp',
        lastMessage: 'Hola, me interesa el producto X...',
        lastState: CommercialState.LEAD,
        hasUnreadMessages: true,
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        companyId: '123',
        customerId: 'c2',
        customerName: 'María García',
        customerPhone: '+505 7777 7777',
        channel: 'WhatsApp',
        lastMessage: 'Ya realicé el pago de la factura.',
        lastState: CommercialState.INVOICED,
        hasUnreadMessages: false,
        updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: '3',
        companyId: '123',
        customerId: 'c3',
        customerName: 'Carlos López',
        customerPhone: '+505 5555 5555',
        channel: 'WhatsApp',
        lastMessage: '¿Tienen servicio de entrega?',
        lastState: CommercialState.SALE_CREATED,
        hasUnreadMessages: false,
        updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
];

const getStateColor = (state: CommercialState) => {
    switch (state) {
        case CommercialState.LEAD: return 'bg-green-100 text-green-800';
        case CommercialState.SALE_CREATED: return 'bg-yellow-100 text-yellow-800';
        case CommercialState.INVOICED: return 'bg-blue-100 text-blue-800';
        case CommercialState.PAID: return 'bg-emerald-100 text-emerald-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const ConversationsPage: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const conversations = MOCK_CONVERSATIONS; // Replace with API call later

    const selectedConversation = conversations.find(c => c.id === selectedId);

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                        <MessageCircle size={18} />
                        Conversaciones
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <div 
                            key={conv.id}
                            onClick={() => setSelectedId(conv.id)}
                            className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedId === conv.id ? 'bg-blue-50 hover:bg-blue-50 border-blue-100' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-medium ${conv.hasUnreadMessages ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                                    {conv.customerName}
                                </h3>
                                <span className="text-xs text-gray-400">
                                    {new Date(conv.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <p className={`text-sm mb-2 line-clamp-1 ${conv.hasUnreadMessages ? 'text-gray-800' : 'text-gray-500'}`}>
                                {conv.lastMessage}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStateColor(conv.lastState)}`}>
                                {conv.lastState}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="font-bold text-gray-800 text-lg">{selectedConversation.customerName}</h2>
                                <p className="text-sm text-gray-500">{selectedConversation.customerPhone}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(selectedConversation.lastState)}`}>
                                {selectedConversation.lastState}
                            </div>
                        </div>

                        {/* Chat Placeholder */}
                        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                            <div className="space-y-4">
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-md">
                                        <p className="text-gray-800 text-sm">Hola, ¿qué precio tiene el producto X?</p>
                                        <span className="text-xs text-gray-400 mt-1 block">10:30 AM</span>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none shadow-sm max-w-md text-white">
                                        <p className="text-sm">Hola {selectedConversation.customerName}, el precio es de $50 + IVA.</p>
                                        <span className="text-xs text-blue-200 mt-1 block text-right">10:32 AM</span>
                                    </div>
                                </div>
                                {/* Last message */}
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-md">
                                        <p className="text-gray-800 text-sm">{selectedConversation.lastMessage}</p>
                                        <span className="text-xs text-gray-400 mt-1 block">10:35 AM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Panel (Bottom) */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="secondary" className="flex items-center justify-center gap-2">
                                    <ShoppingCart size={18} />
                                    Crear Venta
                                </Button>
                                <Button variant="primary" className="flex items-center justify-center gap-2">
                                    <FileText size={18} />
                                    Generar Factura
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle size={48} className="mb-4 opacity-50" />
                        <p>Selecciona una conversación para comenzar</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationsPage;
