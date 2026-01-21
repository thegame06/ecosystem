import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/whatsapp');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Credenciales inválidas. Revise su email y contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[480px] z-10 bg-white relative">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-fade-in">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-900/20">
                <MessageSquare size={24} fill="white" />
              </div>
              <span>SaaS<span className="text-primary-600">ERP</span></span>
            </h1>
            <h2 className="mt-8 text-3xl font-black text-slate-900 leading-tight">Bienvenido de nuevo</h2>
            <p className="mt-3 text-sm text-slate-500 font-medium">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 transition-colors">
                Comienza tu prueba gratis
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-bold animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Email Profesional
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-100 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                  placeholder="nombre@empresa.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-100 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 font-medium cursor-pointer">
                  Recordarme
                </label>
              </div>
              <a href="#" className="text-sm font-bold text-primary-600 hover:text-primary-500">¿Olvidaste tu contraseña?</a>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-4 px-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all transform shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98]
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Iniciando sesión...' : 'Ingresar al Dashboard'}
                {!isLoading && <ArrowRight size={20} className="ml-2" />}
              </button>
            </div>
          </form>

          <footer className="mt-12 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
            © 2026 SaaS ERP • Todos los derechos reservados.
          </footer>
        </div>
      </div>

      {/* Right Side - Artistic */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-910">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-primary-950"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-primary-600/10 blur-[100px]"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-[100px]"></div>

        <div className="absolute inset-0 flex flex-col justify-center px-24 text-white z-20">
          <div className="max-w-md">
            <h3 className="text-6xl font-black tracking-tight mb-8 leading-[1.05]">
              Vende más,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300">factura</span> más rápido.
            </h3>
            <p className="text-xl text-slate-400 mb-12 font-medium leading-relaxed">
              Gestiona todo tu negocio desde el canal que tus clientes ya usan.
            </p>

            <div className="space-y-6">
              {[
                "Integración nativa con WhatsApp",
                "POS ultra-rápido para móviles",
                "Facturación fiscal automática"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 group-hover:bg-primary-500/10 transition-all">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="text-lg font-bold text-slate-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon import
const MessageSquare = ({ size, fill, className }: any) => (
  <svg viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2.5" className={className} width={size} height={size}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export default LoginPage;
