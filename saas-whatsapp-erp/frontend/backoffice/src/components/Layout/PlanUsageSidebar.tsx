import React, { useState, useEffect } from 'react';
import { companyService, UsageCounters, CompanyInfo } from '../../services/companyService';
import { Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

const PlanUsageSidebar: React.FC = () => {
    const [usage, setUsage] = useState<UsageCounters | null>(null);
    const [company, setCompany] = useState<CompanyInfo | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [companyRes, usageRes] = await Promise.all([
                companyService.getMe(),
                companyService.getUsage()
            ]);
            setCompany(companyRes.data);
            setUsage(usageRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (!usage || !company) return null;

    const limits = {
        Starter: { messages: 300, conversations: 150, invoices: 300 },
        Pro: { messages: 1000, conversations: 700, invoices: 1000 },
        Growth: { messages: 3000, conversations: 10000, invoices: 10000 }
    }[company.plan] || { messages: 0, conversations: 0, invoices: 0 };

    const getProgress = (used: number, limit: number) => Math.min(100, (used / limit) * 100);

    return (
        <div className="mt-auto p-6 border-t border-white/5 bg-slate-950/40">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tu Plan</h4>
                        <p className="text-sm font-black text-white">{company.plan}</p>
                    </div>
                </div>
                {company.plan === 'Starter' && (
                    <span className="text-[9px] font-black bg-primary-600 text-white px-2 py-0.5 rounded-full animate-bounce">UPGRADE</span>
                )}
            </div>

            <div className="space-y-4">
                <UsageItem
                    label="Mensajes"
                    used={usage.messagesUsed}
                    limit={limits.messages}
                    color="bg-primary-500"
                />
                <UsageItem
                    label="Conversaciones"
                    used={usage.conversationsUsed}
                    limit={limits.conversations}
                    color="bg-indigo-500"
                />
                <UsageItem
                    label="Facturas"
                    used={usage.invoicesUsed}
                    limit={limits.invoices}
                    color="bg-blue-500"
                />
            </div>

            <button className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                Ver Detalles de Consumo
            </button>
        </div>
    );
};

interface UsageItemProps {
    label: string;
    used: number;
    limit: number;
    color: string;
}

const UsageItem: React.FC<UsageItemProps> = ({ label, used, limit, color }) => {
    const progress = Math.min(100, (used / limit) * 100);
    const isCritical = progress > 90;

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black">
                <span className="text-slate-400 uppercase tracking-widest">{label}</span>
                <span className={isCritical ? 'text-red-400' : 'text-slate-300'}>{used} / {limit}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${isCritical ? 'bg-red-500' : color} transition-all duration-1000`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default PlanUsageSidebar;
