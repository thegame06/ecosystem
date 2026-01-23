import React, { useState, useEffect } from 'react';
import { Settings, Building2, MessageSquare, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { companyService, CompanyInfo } from '../../services/companyService';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'company' | 'whatsapp'>('company');
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadCompany();
    }, []);

    const loadCompany = async () => {
        setIsLoading(true);
        try {
            const response = await companyService.getMe();
            setCompany(response.data);
        } catch (error) {
            console.error('Error loading company:', error);
            setMessage({ type: 'error', text: 'Error al cargar la configuración' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company) return;

        setIsSaving(true);
        setMessage(null);
        try {
            await companyService.updateMe(company);
            setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error saving company:', error);
            setMessage({ type: 'error', text: 'Error al guardar la configuración' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <Settings size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuración</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Administra la configuración de tu empresa y servicios</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 bg-slate-50 p-2 rounded-3xl w-fit border border-slate-100">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'company'
                        ? 'bg-white text-primary-600 shadow-lg shadow-slate-200/50'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Building2 size={18} />
                    Empresa
                </button>
                <button
                    onClick={() => setActiveTab('whatsapp')}
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'whatsapp'
                        ? 'bg-white text-primary-600 shadow-lg shadow-slate-200/50'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <MessageSquare size={18} />
                    WhatsApp
                </button>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`p-5 rounded-3xl flex items-center gap-4 animate-fade-in border-2 ${message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <span className="text-sm font-black">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                {activeTab === 'company' && company && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nombre de la Empresa"
                                required
                                value={company.name}
                                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                            />
                            <Input
                                label="País"
                                required
                                value={company.country}
                                onChange={(e) => setCompany({ ...company, country: e.target.value })}
                            />
                            <Input
                                label="Símbolo de Moneda"
                                required
                                value={company.currencySymbol}
                                onChange={(e) => setCompany({ ...company, currencySymbol: e.target.value })}
                                placeholder="ej. $, C$, €"
                            />
                            <div className="space-y-2">
                                <label className="block text-sm font-black text-slate-700 uppercase tracking-wider text-[10px]">Tasa de Impuesto (IVA)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="block w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-700 font-bold"
                                        value={company.taxRate}
                                        onChange={(e) => setCompany({ ...company, taxRate: parseFloat(e.target.value) })}
                                    />
                                    <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-max">
                                        <input
                                            id="tax-enabled"
                                            type="checkbox"
                                            className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500 transition-all"
                                            checked={company.isTaxEnabled}
                                            onChange={(e) => setCompany({ ...company, isTaxEnabled: e.target.checked })}
                                        />
                                        <label htmlFor="tax-enabled" className="ml-3 block text-xs font-black text-slate-600 uppercase tracking-wider">IVA Habilitado</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'whatsapp' && company && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 space-y-6">
                        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-3xl flex gap-4">
                            <AlertCircle className="text-blue-600 shrink-0" size={24} />
                            <div>
                                <h4 className="text-sm font-black text-blue-900 uppercase tracking-wider">Conexión WhatsApp Cloud API (Oficial)</h4>
                                <p className="text-xs text-blue-700 mt-2 leading-relaxed font-medium">
                                    Esta integración conecta tu empresa directamente con los servidores de Meta.
                                    <br />
                                    <strong className="font-black">⚠️ IMPORTANTE:</strong> Requiere un número telefónico dedicado. Si conectas un número que ya usas en tu celular, <strong className="font-black">la App de WhatsApp dejará de funcionar en tu dispositivo</strong>.
                                </p>
                                <a
                                    href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-black text-blue-800 hover:text-blue-950 underline mt-3 inline-block"
                                >
                                    📚 ¿Cómo obtener mis credenciales? (Guía Oficial)
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Phone Number ID"
                                value={company.whatsAppSettings?.phoneNumberId || ''}
                                onChange={(e) => setCompany({
                                    ...company,
                                    whatsAppSettings: { ...company.whatsAppSettings, phoneNumberId: e.target.value }
                                })}
                            />
                            <Input
                                label="Business Account ID"
                                value={company.whatsAppSettings?.businessAccountId || ''}
                                onChange={(e) => setCompany({
                                    ...company,
                                    whatsAppSettings: { ...company.whatsAppSettings, businessAccountId: e.target.value }
                                })}
                            />
                            <div className="md:col-span-2">
                                <Input
                                    label="System User Access Token"
                                    type="password"
                                    value={company.whatsAppSettings?.accessToken || ''}
                                    onChange={(e) => setCompany({
                                        ...company,
                                        whatsAppSettings: { ...company.whatsAppSettings, accessToken: e.target.value }
                                    })}
                                />
                            </div>
                            <Input
                                label="Webhook Verify Token"
                                value={company.whatsAppSettings?.verifyToken || ''}
                                onChange={(e) => setCompany({
                                    ...company,
                                    whatsAppSettings: { ...company.whatsAppSettings, verifyToken: e.target.value }
                                })}
                            />
                            <div className="space-y-2">
                                <label className="block text-sm font-black text-slate-700 uppercase tracking-wider text-[10px]">Estado de WhatsApp</label>
                                <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <input
                                        id="whatsapp-active"
                                        type="checkbox"
                                        className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500 transition-all"
                                        checked={company.whatsAppSettings?.isActive || false}
                                        onChange={(e) => setCompany({
                                            ...company,
                                            whatsAppSettings: { ...company.whatsAppSettings, isActive: e.target.checked }
                                        })}
                                    />
                                    <label htmlFor="whatsapp-active" className="ml-3 block text-xs font-black text-slate-600 uppercase tracking-wider">
                                        WhatsApp Activo
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">
                                    Activa esta opción solo cuando hayas configurado correctamente todas las credenciales
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary-900/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                        {isSaving ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save size={20} />
                        )}
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
