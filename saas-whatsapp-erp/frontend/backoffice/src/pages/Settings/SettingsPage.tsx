import React, { useState, useEffect } from 'react';
import { Settings, Building2, MessageSquare, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { companyService, CompanyInfo } from '../../services/companyService';
import { WhatsAppProviderType } from '../../types/enums';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'company' | 'whatsapp'>('company');
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        let interval: any;

        const isUnofficial = company?.whatsAppSettings?.providerType === WhatsAppProviderType.Unofficial;

        if (activeTab === 'whatsapp' && company && !company.whatsAppSettings?.isActive && isUnofficial) {
            interval = setInterval(async () => {
                try {
                    const response = await companyService.checkWhatsAppStatus();
                    if (response.data.isActive) {
                        loadCompany(); // Refresh everything
                        setQrCode(null);
                        setMessage({ type: 'success', text: '¡WhatsApp vinculado con éxito!' });
                        setTimeout(() => setMessage(null), 5000);
                    }
                } catch (e) {
                    // Ignore polling errors
                }
            }, 5000);
        }

        return () => clearInterval(interval);
    }, [activeTab, company?.whatsAppSettings?.isActive, company?.whatsAppSettings?.providerType]);

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
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 space-y-8">
                        {/* Selector de Proveedor */}
                        <div className="space-y-4">
                            <label className="block text-sm font-black text-slate-700 uppercase tracking-wider text-[10px]">Método de Conexión</label>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    type="button"
                                    onClick={() => setCompany({
                                        ...company,
                                        whatsAppSettings: { ...company.whatsAppSettings, providerType: WhatsAppProviderType.Unofficial }
                                    })}
                                    className={`flex-1 min-w-[200px] p-6 rounded-3xl border-2 transition-all text-left ${company.whatsAppSettings?.providerType === WhatsAppProviderType.Unofficial
                                        ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-xl ${company.whatsAppSettings?.providerType === WhatsAppProviderType.Unofficial ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                            <MessageSquare size={20} />
                                        </div>
                                        <span className="font-black text-slate-900">Conexión QR (Rápida)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Recomendado para PYMEs. Usa tu número actual sin perder la App.</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCompany({
                                        ...company,
                                        whatsAppSettings: { ...company.whatsAppSettings, providerType: WhatsAppProviderType.Official }
                                    })}
                                    className={`flex-1 min-w-[200px] p-6 rounded-3xl border-2 transition-all text-left ${company.whatsAppSettings?.providerType === WhatsAppProviderType.Official
                                        ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-xl ${company.whatsAppSettings?.providerType === WhatsAppProviderType.Official ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                            <Building2 size={20} />
                                        </div>
                                        <span className="font-black text-slate-900">Cloud API (Oficial)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Para empresas escalables. Requiere verificación de Meta y número dedicado.</p>
                                </button>
                            </div>
                        </div>

                        {company.whatsAppSettings?.providerType === WhatsAppProviderType.Official ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-3xl flex gap-4">
                                    <AlertCircle className="text-blue-600 shrink-0" size={24} />
                                    <div>
                                        <h4 className="text-sm font-black text-blue-900 uppercase tracking-wider">Configuración Cloud API (Meta)</h4>
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
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-[2rem] text-center space-y-6 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-inner mb-4">
                                            <MessageSquare size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-emerald-900">Conexión via Código QR</h3>
                                        <p className="text-sm text-emerald-700 max-w-sm mx-auto font-medium leading-relaxed">
                                            Escanea el código con tu WhatsApp (Dispositivos Vinculados) para conectar este sistema con tu número personal.
                                        </p>

                                        <div className="mt-8 flex flex-col items-center">
                                            {isGeneratingQR ? (
                                                <div className="w-64 h-64 bg-white rounded-3xl border-2 border-emerald-100 flex flex-col items-center justify-center gap-4 animate-pulse shadow-xl shadow-emerald-200/50">
                                                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Generando sesión...</span>
                                                </div>
                                            ) : qrCode ? (
                                                <div className="relative group flex flex-col items-center">
                                                    <div className="absolute -inset-4 bg-emerald-500 blur-2xl opacity-10 animate-pulse"></div>
                                                    <div className="w-64 h-64 bg-white p-4 rounded-3xl border-2 border-emerald-500 shadow-2xl relative">
                                                        <img
                                                            src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                                                            alt="WhatsApp QR Code"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <p className="mt-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">Escanea ahora con tu WhatsApp</p>
                                                    <button
                                                        onClick={() => setQrCode(null)}
                                                        className="mt-2 text-[10px] text-emerald-600 font-black uppercase tracking-widest hover:underline"
                                                    >
                                                        Generar Nuevo Código
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-950/20 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                                    onClick={async () => {
                                                        setIsGeneratingQR(true);
                                                        try {
                                                            const response = await companyService.getWhatsAppQr();
                                                            setQrCode(response.data.qrCode);
                                                        } catch (err: any) {
                                                            alert('Error: ' + (err.response?.data?.message || 'No se pudo generar el QR. Verifique el motor de WhatsApp.'));
                                                        } finally {
                                                            setIsGeneratingQR(false);
                                                        }
                                                    }}
                                                >
                                                    <MessageSquare size={18} />
                                                    Vincular Nuevo Dispositivo
                                                </button>
                                            )}

                                        </div>
                                    </div>

                                    {/* Decoration */}
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full opacity-50 blur-3xl"></div>
                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-100 rounded-full opacity-50 blur-3xl"></div>
                                </div>
                            </div>
                        )}


                        <div className="pt-6 border-t border-slate-100">
                            <div className="space-y-4 max-w-md">
                                <label className="block text-sm font-black text-slate-700 uppercase tracking-wider text-[10px]">Estado de Conexión</label>

                                <div className={`flex items-center p-6 rounded-[2rem] border-2 transition-all ${company.whatsAppSettings?.isActive
                                    ? 'bg-emerald-50 border-emerald-100 shadow-inner'
                                    : 'bg-slate-50 border-slate-100'}`}>

                                    <div className="relative mr-4">
                                        <div className={`w-4 h-4 rounded-full ${company.whatsAppSettings?.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                        {company.whatsAppSettings?.isActive && (
                                            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <span className={`block text-xs font-black uppercase tracking-widest ${company.whatsAppSettings?.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                            {company.whatsAppSettings?.isActive ? 'Dispositivo Conectado' : 'Esperando Vinculación'}
                                        </span>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                            {company.whatsAppSettings?.isActive
                                                ? 'Tu sistema está listo para enviar mensajes reales.'
                                                : 'El sistema usará MOCK hasta que vincules un dispositivo.'}
                                        </p>
                                    </div>

                                    {company.whatsAppSettings?.isActive && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await companyService.logoutWhatsApp();
                                                    loadCompany(); // Reload state from server
                                                    setMessage({ type: 'success', text: 'WhatsApp desvinculado correctamente' });
                                                } catch (e) {
                                                    setMessage({ type: 'error', text: 'Error al desvincular WhatsApp' });
                                                }
                                            }}
                                            className="ml-4 px-3 py-1 bg-white border border-emerald-200 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-tighter hover:bg-emerald-100 transition-colors"
                                        >
                                            Desvincular
                                        </button>
                                    )}
                                </div>

                                {!company.whatsAppSettings?.isActive && company.whatsAppSettings?.providerType === WhatsAppProviderType.Unofficial && (
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                        <div className="flex gap-3">
                                            <AlertCircle className="text-amber-500 shrink-0" size={16} />
                                            <p className="text-[9px] font-black text-amber-700 uppercase leading-relaxed tracking-tight">
                                                Asegúrate de tener el Túnel Cloudflare activo y configurado en <code className="bg-amber-100 px-1 rounded">appsettings.json</code> para que la vinculación se detecte automáticamente.
                                            </p>
                                        </div>
                                    </div>
                                )}
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
