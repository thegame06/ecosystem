import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Package, DollarSign, CreditCard, Receipt, FileText, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../Common/Modal';
import InvoiceModal from '../WhatsApp/InvoiceModal';
import { saleService } from '../../services/saleService';
import { Sale, SaleResponse } from '../../types/sale';
import { COMMERCIAL_STATE_LABELS, COMMERCIAL_STATE_COLORS, PAYMENT_METHOD_LABELS, PaymentMethod, CommercialState } from '../../types/enums';
import { toast } from 'react-hot-toast';

interface SaleDetailModalProps {
    saleId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ saleId, isOpen, onClose }) => {
    const navigate = useNavigate();
    const [sale, setSale] = useState<SaleResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [hasInvoice, setHasInvoice] = useState(false);

    useEffect(() => {
        if (isOpen && saleId) {
            fetchSale();
            checkInvoice();
        }
    }, [isOpen, saleId]);

    const fetchSale = async () => {
        setLoading(true);
        try {
            const data = await saleService.getById(saleId!);
            setSale(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar detalle de venta');
        } finally {
            setLoading(false);
        }
    };

    const checkInvoice = async () => {
        try {
            const response = await saleService.getInvoice(saleId!);
            setHasInvoice(!!response.data);
        } catch (error) {
            setHasInvoice(false);
        }
    };

    if (!isOpen) return null;

    const handleInvoiceSuccess = () => {
        setShowInvoiceModal(false);
        toast.success('¡Factura procesada exitosamente!');
        fetchSale(); // Refresh sale data to update state
        checkInvoice(); // Refresh invoice status
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={sale ? `Detalle de Venta #${sale.id.slice(-6).toUpperCase()}` : 'Cargando...'}
                size="lg"
                footer={
                    sale && sale.state !== CommercialState.PAID ? (
                        <div className="flex justify-end gap-3 w-full">
                            {sale.state === CommercialState.LEAD || sale.state === CommercialState.SALE_CREATED ? (
                                <>
                                    <button
                                        onClick={() => navigate('/pos', { state: { editSaleId: sale.id } })}
                                        className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-50 transition-all flex items-center gap-2"
                                    >
                                        <ArrowRightLeft size={16} />
                                        Editar Orden
                                    </button>
                                    <button
                                        onClick={() => setShowInvoiceModal(true)}
                                        className="btn-primary flex items-center gap-2"
                                        disabled={loading}
                                    >
                                        <FileText size={20} />
                                        {hasInvoice ? 'Ver Factura' : 'Generar Factura'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowInvoiceModal(true)}
                                    className="btn-primary flex items-center gap-2"
                                    disabled={loading}
                                >
                                    <FileText size={20} />
                                    Ver Factura
                                </button>
                            )}
                        </div>
                    ) : undefined
                }
            >
                {loading ? (
                    <div className="py-20 text-center text-slate-400 font-bold animate-pulse">
                        Cargando información...
                    </div>
                ) : sale ? (
                    <div className="space-y-8">
                        {/* Status Header */}
                        <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${COMMERCIAL_STATE_COLORS[sale.state]}`}>
                                    {COMMERCIAL_STATE_LABELS[sale.state]}
                                </div>
                                <div className="text-slate-400 font-bold text-sm">
                                    {new Date(sale.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Venta</div>
                                <div className="text-3xl font-black text-slate-900">${(sale.total ?? 0).toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {/* Customer Info */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Información del Cliente</h4>
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-900">{sale.customerName || 'Cliente Desconocido'}</div>
                                        <div className="text-xs text-slate-400 font-bold">ID: {sale.customerId}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Forma de Pago</h4>
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                                        {sale.paymentMethod === 1 ? <DollarSign size={24} /> : <CreditCard size={24} />}
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-900">{PAYMENT_METHOD_LABELS[sale.paymentMethod as PaymentMethod] || 'No especificada'}</div>
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Confirmado</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Productos y Servicios</h4>
                            <div className="border border-slate-200 rounded-3xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Descripción</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Cant.</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Unitario</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sale.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 text-sm">{item.nameSnapshot}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase font-black">{item.unit}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-slate-600">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-600">${(item.unitPrice ?? 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-black text-slate-900">${(item.total ?? 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals Summary */}
                        <div className="flex justify-end pt-4">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                    <span>Subtotal</span>
                                    <span>${(sale.subtotal ?? 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                    <span>Impuestos (IVA)</span>
                                    <span>${(sale.taxTotal ?? 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200 font-black text-xl text-slate-900">
                                    <span>Total</span>
                                    <span>${(sale.total ?? 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400">Error al cargar datos.</div>
                )}
            </Modal>

            {/* Invoice Modal */}
            {sale && (
                <InvoiceModal
                    isOpen={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                    saleId={sale.id}
                    customerName={sale.customerName || 'Cliente'}
                    onSuccess={handleInvoiceSuccess}
                />
            )}
        </>
    );
};
