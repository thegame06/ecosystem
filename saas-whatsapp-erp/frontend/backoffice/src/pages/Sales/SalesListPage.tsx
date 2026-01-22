import React, { useState, useEffect } from 'react';
import {
    FileStack,
    Plus,
    Search,
    Calendar,
    User,
    ArrowUpRight,
    TrendingUp,
    Eye,
    FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saleService } from '../../services/saleService';
import { SaleResponse } from '../../types/sale';
import { COMMERCIAL_STATE_LABELS, COMMERCIAL_STATE_COLORS, CommercialState } from '../../types/enums';
import { companyService, CompanyInfo } from '../../services/companyService';
import Button from '../../components/Common/Button';
import { useServerPagination } from '../../hooks/useServerPagination';
import { SaleDetailModal } from '../../components/sales/SaleDetailModal';
import { toast } from 'react-hot-toast';
import { invoiceService } from '../../services/invoiceService';

const SalesListPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        state: '',
        startDate: '',
        endDate: ''
    });
    const [pageSize, setPageSize] = useState(20);

    const {
        data: sales,
        pagination,
        loading,
        error,
        goToPage,
        refresh
    } = useServerPagination<SaleResponse>({
        endpoint: '/sales',
        pageSize,
        filters,
        searchTerm,
        searchField: 'customerName',
        orderBy: 'createdAt desc'
    });

    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchCompanyInfo();
    }, []);

    const fetchCompanyInfo = async () => {
        try {
            const res = await companyService.getMe();
            setCompanyInfo(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-NI', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleViewSale = (saleId: string) => {
        setSelectedSaleId(saleId);
        setShowDetailModal(true);
    };

    const handleGenerateInvoice = async (saleId: string) => {
        try {
            await invoiceService.create(saleId);
            toast.success('Factura generada exitosamente');
            refresh();
        } catch (err) {
            toast.error('Error al generar la factura');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <FileStack size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ventas</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Gestiona y consulta el historial de transacciones de tu negocio.</p>
                </div>
                <button
                    onClick={() => navigate('/pos')}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-xl shadow-primary-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    NUEVA VENTA (POS)
                </button>
            </div>

            {/* Stats Summary (Mini) */}
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: 'Total Ventas', value: sales.length, icon: FileStack, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Facturado', value: sales.filter(s => s.state >= CommercialState.INVOICED).length, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Pendiente', value: sales.filter(s => s.state < CommercialState.INVOICED).length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Ingresos (Muestra)', value: `${companyInfo?.currencySymbol || '$'}${sales.reduce((acc, s) => acc + s.total, 0).toLocaleString()}`, icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por cliente o ID..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-700 font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-6 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.state}
                        onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                    >
                        <option value="">Todos los estados</option>
                        {Object.entries(COMMERCIAL_STATE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fecha Desde</span>
                        <input
                            type="date"
                            className="flex-1 px-4 py-2 bg-slate-50 border-none rounded-xl font-bold text-slate-600 outline-none"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fecha Hasta</span>
                        <input
                            type="date"
                            className="flex-1 px-4 py-2 bg-slate-50 border-none rounded-xl font-bold text-slate-600 outline-none"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Fecha</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">Cargando ventas...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={5} className="px-8 py-12 text-center text-red-400 font-bold">{error}</td></tr>
                        ) : sales.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">No se encontraron ventas.</td></tr>
                        ) : sales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-slate-900 mb-1">#{sale.id.slice(-6).toUpperCase()}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar size={12} /> {formatDate(sale.createdAt)}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                            <User size={18} />
                                        </div>
                                        <div className="font-bold text-slate-700">{sale.customerName || `Cliente ${sale.customerId.slice(-4)}`}</div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${COMMERCIAL_STATE_COLORS[sale.state]}`}>
                                        {COMMERCIAL_STATE_LABELS[sale.state]}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right font-black text-slate-900 text-lg">
                                    {companyInfo?.currencySymbol || '$'}{sale.total.toFixed(2)}
                                </td>
                                <td className="px-8 py-6 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => handleViewSale(sale.id)}
                                        className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-primary-600 transition-all border border-transparent hover:border-slate-200"
                                        title="Ver detalle"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    {sale.state === CommercialState.SALE_CREATED && (
                                        <button
                                            onClick={() => handleGenerateInvoice(sale.id)}
                                            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200"
                                            title="Generar Factura"
                                        >
                                            <FileText size={20} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && sales.length > 0 && (
                    <div className="bg-slate-50 px-8 py-6 flex items-center justify-between border-t border-slate-100">
                        <p className="text-sm text-slate-500 font-bold">
                            Mostrando <span className="text-slate-900">{sales.length}</span> de <span className="text-slate-900">{pagination.totalCount}</span> ventas
                        </p>
                        <div className="flex items-center gap-4">
                            <select
                                className="bg-white border-2 border-slate-200 rounded-xl px-3 py-1 text-sm font-bold text-slate-600 outline-none"
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => goToPage(pagination.pageNumber - 1)}
                                    disabled={!pagination.hasPreviousPage}
                                    className="p-2 bg-white border-2 border-slate-200 rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:border-primary-500"
                                >
                                    &larr;
                                </button>
                                <div className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-black text-slate-900 text-sm">
                                    {pagination.pageNumber} / {pagination.totalPages}
                                </div>
                                <button
                                    onClick={() => goToPage(pagination.pageNumber + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="p-2 bg-white border-2 border-slate-200 rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:border-primary-500"
                                >
                                    &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedSaleId && (
                <SaleDetailModal
                    saleId={selectedSaleId}
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
};

export default SalesListPage;
