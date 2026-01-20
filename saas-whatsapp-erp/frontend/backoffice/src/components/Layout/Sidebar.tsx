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
  LogOut
} from 'lucide-react';
import { authService } from '../../services/authService';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'WhatsApp', path: '/whatsapp', icon: MessageSquare },
    { name: 'Ventas / POS', path: '/sales', icon: ShoppingCart },
    { name: 'Clientes', path: '/customers', icon: Users },
    { name: 'Facturas', path: '/invoices', icon: FileText },
    { name: 'Productos', path: '/products', icon: Package },
    { name: 'Web Pública', path: '/public-web', icon: Globe }, // Placeholder path
    { name: 'Configuración', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-wider text-blue-400">SaaS ERP</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
