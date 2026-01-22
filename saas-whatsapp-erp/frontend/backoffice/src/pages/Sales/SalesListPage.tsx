import React, { useState, useEffect } from 'react';
import {
    FileStack,
    Plus,
    Search,
    Calendar,
    User,
    ArrowRight,
    Filter,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saleService } from '../../services/saleService';
import { SaleResponse } from '../../types/sale';
import { COMMERCIAL_STATE_LABELS, COMMERCIAL_STATE_COLORS, CommercialState } from '../../types/enums';
import { companyService, CompanyInfo } from '../../services/companyService';
import Button from '../../components/Common/Button';

const SalesListPage: React.FC = () => {
    const navigate = useNavigate();
    const [sales, setSales] = useState<SaleResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [salesRes, companyRes] = await Promise.all([
                saleService.search({ top: 50, orderBy: 'CreatedAt desc' }),
                companyService.getMe()
            ]);
            setSales(salesRes.result || []);
            setCompanyInfo(companyRes.data);
        } catch (error) {
            console.error('Error loading sales:', error);
        } finally {
            setIsLoading(false);
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

    const filteredSales = sales.filter(s =>
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerId.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por ID, cliente..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                    <Filter size={18} />
                    Filtros
                </button>
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
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">Cargando ventas...</td></tr>
                        ) : filteredSales.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">No se encontraron ventas.</td></tr>
                        ) : filteredSales.map((sale) => (
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
                                        <div className="font-bold text-slate-700">Cliente {sale.customerId.slice(-4)}</div>
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
                                <td className="px-8 py-6 text-right">
                                    <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-primary-600 transition-all border border-transparent hover:border-slate-200">
                                        <ArrowRight size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesListPage;
