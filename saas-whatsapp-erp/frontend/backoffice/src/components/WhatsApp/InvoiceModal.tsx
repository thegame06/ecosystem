import React, { useState, useEffect } from 'react';
import { FileText, Send, Download, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Modal from '../Common/Modal';
import { invoiceService, Invoice } from '../../services/invoiceService';
import { saleService } from '../../services/saleService';
import { Sale } from '../../types/sale';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    saleId: string | null;
    customerName: string;
    onSuccess: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, saleId, customerName, onSuccess }) => {
    const [sale, setSale] = useState<Sale | null>(null);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [step, setStep] = useState<'preview' | 'generated' | 'sent'>('preview');

    useEffect(() => {
        if (isOpen && saleId) {
            fetchSale();
            checkExistingInvoice();
        } else {
            setStep('preview');
            setInvoice(null);
        }
    }, [isOpen, saleId]);

    const fetchSale = async () => {
        if (!saleId) return;
        try {
            setIsLoading(true);
            const response = await saleService.getById(saleId);
            setSale(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const checkExistingInvoice = async () => {
        if (!saleId) return;
        try {
            const response = await saleService.getInvoice(saleId);
            if (response.data) {
                setInvoice(response.data);
                setStep('generated');
            }
        } catch (err) {
            // No invoice yet, that's fine
        }
    };

    const handleGenerate = async () => {
        if (!saleId) return;
        setIsGenerating(true);
        try {
            const response = await invoiceService.create(saleId);
            setInvoice(response.data);
            setStep('generated');
        } catch (err) {
            console.error(err);
            alert('Error al generar la factura. Verifique los límites de su plan.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!invoice) return;
        setIsSending(true);
        try {
            await invoiceService.sendWhatsApp(invoice.id);
            setStep('sent');
            onSuccess();
        } catch (err) {
            console.error(err);
            alert('Error al enviar por WhatsApp. Verifique el estado del número.');
        } finally {
            setIsSending(false);
        }
    };

    const handleDownload = async () => {
        if (!invoice) return;
        try {
            const response = await invoiceService.downloadPdf(invoice.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `factura-${invoice.number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={step === 'sent' ? '¡Factura Enviada!' : 'Procesar Facturación'}
            footer={
                <div className="flex justify-end gap-3 w-full">
                    {step === 'preview' && (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !sale}
                            className="btn-primary flex items-center gap-2"
                        >
                            <FileText size={20} />
                            {isGenerating ? 'Generando...' : 'Generar Factura Ahora'}
                        </button>
                    )}
                    {step === 'generated' && (
                        <>
                            <button onClick={handleDownload} className="btn-secondary flex items-center gap-2 border-2">
                                <Download size={20} />
                                Descargar PDF
                            </button>
                            <button
                                onClick={handleSendWhatsApp}
                                disabled={isSending}
                                className="btn-primary flex items-center gap-2 bg-primary-600 shadow-primary-200"
                            >
                                <Send size={20} />
                                {isSending ? 'Enviando...' : 'Enviar por WhatsApp'}
                            </button>
                        </>
                    )}
                    {step === 'sent' && (
                        <button onClick={onClose} className="btn-primary">
                            Finalizar Demo
                        </button>
                    )}
                </div>
            }
        >
            <div className="min-h-[40vh] flex flex-col items-center justify-center">
                {isLoading ? (
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full"></div>
                        <div className="h-4 w-48 bg-slate-100 rounded"></div>
                    </div>
                ) : step === 'preview' ? (
                    <div className="w-full space-y-8 animate-fade-in text-center">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                            <Clock size={40} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-800 mb-2">Resumen de Venta Pendiente</h4>
                            <p className="text-slate-500 max-w-sm mx-auto">Confirma los detalles antes de generar el documento fiscal para <strong>{customerName}</strong>.</p>
                        </div>
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 max-w-md mx-auto">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total de Venta</span>
                                <span className="text-3xl font-black text-slate-900">${sale?.total.toFixed(2)}</span>
                            </div>
                            <div className="space-y-2 border-t border-slate-200 pt-4">
                                {sale?.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-slate-500">{item.quantity} x {item.productName}</span>
                                        <span className="font-bold text-slate-700">${item.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : step === 'generated' ? (
                    <div className="w-full space-y-8 animate-fade-in text-center">
                        <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle2 size={40} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-800 mb-2">Factura Generada: {invoice?.number}</h4>
                            <p className="text-slate-500 max-w-sm mx-auto">El documento está listo. ¿Cómo quieres entregarlo?</p>
                        </div>
                        <div className="relative group max-w-sm mx-auto">
                            <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            <div className="relative glass p-10 rounded-[2.5rem] border-2 border-white shadow-2xl">
                                <FileText size={64} className="text-slate-200 mx-auto mb-4" />
                                <div className="text-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Monto Total</span>
                                    <span className="text-4xl font-black text-slate-900">${invoice?.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full space-y-8 animate-fade-in text-center">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200 animate-bounce">
                                <Send size={48} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                                <CheckCircle2 size={24} className="text-emerald-500" />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-slate-900 mb-2">¡Todo listo!</h4>
                            <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                                La factura ha sido enviada con éxito al WhatsApp de <strong>{customerName}</strong>.
                                <br /><span className="text-emerald-600 font-bold">Flujo completado en tiempo récord.</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default InvoiceModal;
