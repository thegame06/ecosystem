import React, { useState, useEffect } from 'react';
import { MessageCircle, ShoppingCart, FileText, Send, User, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { conversationService } from '../../services/conversationService';
import { Conversation } from '../../types/conversation';
import { CommercialState } from '../../types/enums';
import { Customer } from '../../types/customer';
import POSModal from '../../components/WhatsApp/POSModal';
import InvoiceModal from '../../components/WhatsApp/InvoiceModal';

const ConversationsPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [isPOSOpen, setIsPOSOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

    useEffect(() => {
        fetchConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            const response = await conversationService.getAll();
            const items = response.data?.items || [];
            setConversations(items);
            if (items.length > 0 && !selectedId) {
                // Auto select first one for demo
                setSelectedId(items[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedId) {
            fetchCustomer(selectedId);
        }
    }, [selectedId]);

    const fetchCustomer = async (id: string) => {
        try {
            const response = await conversationService.getCustomer(id);
            setSelectedCustomer(response.data);
        } catch (err) {
            console.error('Error fetching customer', err);
        }
    };

    const selectedConversation = conversations.find(c => c.id === selectedId);

    const getStateBadge = (state: CommercialState) => {
        switch (state) {
            case CommercialState.LEAD:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-tighter">Nuevo Lead</span>;
            case CommercialState.SALE_CREATED:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-tighter">Venta Abierta</span>;
            case CommercialState.INVOICED:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-tighter">Facturado</span>;
            case CommercialState.PAID:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-tighter">Pagado</span>;
            default: return null;
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] animate-pulse">
            <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-10rem)] flex gap-4 animate-fade-in">
            {/* Sidebar List */}
            <div className="w-96 flex flex-col glass rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="p-6 bg-white flex items-center justify-between border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <MessageCircle className="text-primary-600" size={24} />
                        Chats
                    </h2>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-600 border border-primary-100">
                        <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                        <span className="text-xs font-black">LIVE</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white/50 space-y-1 p-2">
                    {conversations.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            <p className="text-sm">No hay conversaciones activas</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedId(conv.id)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 relative group
                  ${selectedId === conv.id
                                        ? 'bg-white shadow-lg border border-slate-100'
                                        : 'hover:bg-white/60 hover:translate-x-1'
                                    }`}
                            >
                                {/* {conv.hasUnreadMessages && (
                                    <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary-500 rounded-full ring-4 ring-primary-100"></div>
                                )} */}
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                        {selectedCustomer?.name[0] || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className="font-bold text-slate-800 truncate leading-tight">
                                                {conv.customerPhone}
                                            </h3>
                                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                                <Clock size={10} />
                                                {new Date(conv.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs truncate text-slate-500">
                                            {conv.lastMessage || 'Empieza a chatear...'}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            {getStateBadge(conv.lastState)}
                                            <ChevronRight size={14} className={`text-slate-300 transition-transform ${selectedId === conv.id ? 'translate-x-1 text-primary-500' : ''}`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail Chat */}
            <div className="flex-1 glass rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col relative">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-200">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">
                                        {selectedCustomer?.name || selectedConversation.customerPhone}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-400">{selectedConversation.customerPhone}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedConversation.channel}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end mr-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado Comercial</span>
                                    {getStateBadge(selectedConversation.lastState)}
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 bg-slate-50/50 p-8 overflow-y-auto space-y-6 relative">
                            {/* Simulated patterns */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
                            </div>

                            <div className="flex justify-center my-4">
                                <span className="px-4 py-1.5 rounded-full bg-slate-200/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">Hoy</span>
                            </div>

                            {/* Real Last Message */}
                            <div className="flex justify-start">
                                <div className="group space-y-1">
                                    <div className="max-w-md bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow">
                                        <p className="text-slate-800 text-sm leading-relaxed">
                                            {selectedConversation.lastMessage || "¡Hola! Estoy interesado en contratar sus servicios."}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 ml-1">
                                        {new Date(selectedConversation.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <CheckCircle2 size={12} className="text-primary-500" />
                                    </span>
                                </div>
                            </div>

                            {/* Simulated historical to fill space but clearly different */}
                            <div className="flex justify-center opacity-40 italic text-xs text-slate-400 py-4">
                                Fin del historial reciente
                            </div>
                        </div>

                        <div className="p-8 bg-white border-t border-slate-100">
                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    onClick={() => setIsPOSOpen(true)}
                                    className="flex items-center justify-center gap-3 py-5 px-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-sm hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20"
                                >
                                    <ShoppingCart size={22} className="text-primary-400" />
                                    Crear Venta POS
                                </button>
                                <button
                                    onClick={() => setIsInvoiceOpen(true)}
                                    className="flex items-center justify-center gap-3 py-5 px-6 rounded-2xl bg-white text-slate-900 border-2 border-slate-100 font-black uppercase tracking-widest text-sm hover:border-primary-500 hover:text-primary-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-200/20"
                                >
                                    <FileText size={22} className="text-indigo-500" />
                                    Generar Factura
                                </button>
                            </div>

                            {/* Quick Reply Bar */}
                            <div className="mt-8 flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                                        placeholder="Escribe un mensaje aquí..."
                                    />
                                </div>
                                <button className="w-14 h-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all">
                                    <Send size={24} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center border-4 border-dashed border-slate-200">
                            <MessageCircle size={48} />
                        </div>
                        <p className="text-lg font-bold">Selecciona un chat para vender</p>
                    </div>
                )}

                {/* Floating Number Status as requested by orchestrator */}
                {selectedConversation && (
                    <div className="absolute top-24 right-8 z-50">
                        <div className="px-3 py-1.5 glass rounded-xl flex items-center gap-2 border-primary-500/30">
                            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">WhatsApp Activo</span>
                        </div>
                    </div>
                )}

                {/* Modals */}
                {selectedCustomer && (
                    <POSModal
                        isOpen={isPOSOpen}
                        onClose={() => setIsPOSOpen(false)}
                        customerId={selectedCustomer.id}
                        customerName={selectedCustomer.name}
                        onSuccess={(saleId) => {
                            setSelectedSaleId(saleId);
                            setIsPOSOpen(false);
                            setIsInvoiceOpen(true);
                            fetchConversations(); // Refresh state
                        }}
                    />
                )}

                {selectedCustomer && (
                    <InvoiceModal
                        isOpen={isInvoiceOpen}
                        onClose={() => setIsInvoiceOpen(false)}
                        saleId={selectedSaleId}
                        customerName={selectedCustomer.name}
                        onSuccess={() => {
                            fetchConversations(); // Refresh states
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ConversationsPage;
