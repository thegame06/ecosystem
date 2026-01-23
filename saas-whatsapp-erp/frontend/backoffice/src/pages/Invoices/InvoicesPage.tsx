import React, { useState, useEffect } from 'react';
import { FileText, Download, Send, Eye, Search, Calendar, DollarSign, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { invoiceService, Invoice } from '../../services/invoiceService';
import { toast } from 'react-hot-toast';

const InvoicesPage: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await invoiceService.getAll();
            setInvoices(response.data?.items || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Error al cargar facturas');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (invoiceId: string, invoiceNumber: string) => {
        try {
            const response = await invoiceService.downloadPdf(invoiceId);

            const contentDisposition = response.headers?.['content-disposition'];
            let filename = `Factura_${invoiceNumber}.pdf`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\\n]*=((['\"]).*?\\2|[^;\\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['\\"]/g, '');
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('PDF descargado exitosamente');
        } catch (error: any) {
            console.error('Error downloading PDF:', error);

            if (error.response?.status === 404) {
                toast.error('Factura no encontrada. Es posible que aún no se haya generado el PDF.');
            } else if (error.response?.status === 500) {
                toast.error('Error al generar el PDF. Por favor intente nuevamente.');
            } else {
                toast.error('Error al descargar PDF. Verifique su conexión.');
            }
        }
    };

    const handleSendWhatsApp = async (invoiceId: string) => {
        try {
            await invoiceService.sendWhatsApp(invoiceId);
            toast.success('Factura enviada por WhatsApp');
            fetchInvoices(); // Refresh to update status
        } catch (error) {
            console.error('Error sending WhatsApp:', error);
            toast.error('Error al enviar por WhatsApp');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
            'Draft': { label: 'Borrador', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: <Clock size={14} /> },
            'Issued': { label: 'Emitida', color: 'bg-blue-100 text-blue-600 border-blue-200', icon: <FileText size={14} /> },
            'Sent': { label: 'Enviada', color: 'bg-indigo-100 text-indigo-600 border-indigo-200', icon: <Send size={14} /> },
            'Paid': { label: 'Pagada', color: 'bg-emerald-100 text-emerald-600 border-emerald-200', icon: <CheckCircle2 size={14} /> },
            'Cancelled': { label: 'Cancelada', color: 'bg-red-100 text-red-600 border-red-200', icon: <XCircle size={14} /> },
        };

        const config = statusConfig[status] || statusConfig['Draft'];

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 ${config.color}`}>
                {config.icon}
                {config.label}
            </div>
        );
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.saleId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <FileText size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900">Facturas</h1>
                            <p className="text-slate-500 font-bold">Gestiona y consulta tus documentos fiscales</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por número o ID de venta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all font-bold text-slate-700"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all font-bold text-slate-700"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="Draft">Borrador</option>
                            <option value="Issued">Emitida</option>
                            <option value="Sent">Enviada</option>
                            <option value="Paid">Pagada</option>
                            <option value="Cancelled">Cancelada</option>
                        </select>
                    </div>
                </div>

                {/* Invoices List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold">Cargando facturas...</p>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center border border-slate-100">
                        <FileText size={64} className="text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-400 mb-2">No hay facturas</h3>
                        <p className="text-slate-400">
                            {searchTerm || statusFilter !== 'all'
                                ? 'No se encontraron facturas con los filtros aplicados'
                                : 'Genera tu primera factura desde una venta'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredInvoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    {/* Invoice Info */}
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                            <FileText size={28} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-black text-slate-900">{invoice.number}</h3>
                                                {getStatusBadge(invoice.status)}
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-slate-500 font-bold">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    {new Date(invoice.issuedAt).toLocaleDateString('es-NI', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign size={16} />
                                                    <span className="text-lg font-black text-slate-900">
                                                        ${(invoice.total ?? 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleDownload(invoice.id, invoice.number)}
                                            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all border-2 border-transparent hover:border-slate-300"
                                            title="Descargar PDF"
                                        >
                                            <Download size={20} />
                                        </button>

                                        {(invoice.status === 'Issued' || invoice.status === 'Sent') && (
                                            <button
                                                onClick={() => handleSendWhatsApp(invoice.id)}
                                                className="p-3 rounded-2xl bg-primary-100 hover:bg-primary-200 text-primary-600 hover:text-primary-700 transition-all border-2 border-transparent hover:border-primary-300"
                                                title="Enviar por WhatsApp"
                                            >
                                                <Send size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoicesPage;
