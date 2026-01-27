import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  ShoppingCart,
  Users,
  FileText,
  Package,
  Globe,
  Settings,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { authService } from '../../services/authService';
import PlanUsageSidebar from './PlanUsageSidebar';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'WhatsApp', path: '/whatsapp', icon: MessageSquare },
    { name: 'POS (Nueva Venta)', path: '/pos', icon: ShoppingCart },
    { name: 'Ventas (Historial)', path: '/sales', icon: FileText },
    { name: 'Clientes', path: '/customers', icon: Users },
    { name: 'Facturas', path: '/invoices', icon: FileText },
    { name: 'Productos', path: '/products', icon: Package },
    { name: 'Configuración', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="h-screen w-72 bg-surface-950 text-white flex flex-col fixed left-0 top-0 z-[60] shadow-2xl border-r border-white/5">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/50">
            <MessageSquare size={24} fill="white" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Annonai <span className="text-primary-500">Flow</span></h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Menú Principal</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={20} className="transition-transform group-hover:scale-110" />
            <span className="font-bold text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3.5 w-full text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      <PlanUsageSidebar />
    </div>
  );
};

export default Sidebar;
