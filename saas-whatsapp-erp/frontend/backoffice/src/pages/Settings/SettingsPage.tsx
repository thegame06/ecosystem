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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="text-primary-600" />
                        Configuración
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Administra la configuración de tu empresa y servicios</p>
                </div>
            </div>

            <div className="flex space-x-1 bg-surface-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'company'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Building2 size={18} />
                    Empresa
                </button>
                <button
                    onClick={() => setActiveTab('whatsapp')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'whatsapp'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <MessageSquare size={18} />
                    WhatsApp
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {activeTab === 'company' && company && (
                    <div className="card-premium p-6 space-y-6">
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
                                <label className="block text-sm font-medium text-gray-700">Tasa de Impuesto (IVA)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={company.taxRate}
                                        onChange={(e) => setCompany({ ...company, taxRate: parseFloat(e.target.value) })}
                                    />
                                    <div className="flex items-center gap-2 min-w-max">
                                        <input
                                            id="tax-enabled"
                                            type="checkbox"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            checked={company.isTaxEnabled}
                                            onChange={(e) => setCompany({ ...company, isTaxEnabled: e.target.checked })}
                                        />
                                        <label htmlFor="tax-enabled" className="text-sm text-gray-700">IVA Habilitado</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'whatsapp' && company && (
                    <div className="card-premium p-6 space-y-6">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                            <AlertCircle className="text-blue-600 shrink-0" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-blue-900">Configuración Meta Business</h4>
                                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                    Ingresa las credenciales de tu aplicación en Meta for Developers para habilitar el envío y recepción de mensajes.
                                </p>
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
                )}

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving} className="w-auto flex items-center gap-2">
                        {isSaving ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save size={18} />
                        )}
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
