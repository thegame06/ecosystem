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
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'response' in err) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setError((err as any).response?.data?.message || 'Credenciales inválidas');
      } else {
          setError('Error de conexión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[480px] z-10 bg-white relative">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-tr from-green-600 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
              </div>
              <span>SaaS<span className="text-green-600">ERP</span></span>
            </h1>
            <h2 className="mt-8 text-3xl font-bold text-slate-900">Bienvenido de nuevo</h2>
            <p className="mt-3 text-sm text-slate-500">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-medium text-green-600 hover:text-green-500 transition-colors underline decoration-2 decoration-transparent hover:decoration-green-200">
                Comienza tu prueba gratis
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-pulse">
                 <div className="mt-0.5"><Lock size={16} /></div>
                 <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Profesional
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white sm:text-sm transition-all shadow-sm hover:border-slate-300"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white sm:text-sm transition-all shadow-sm hover:border-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500 hover:underline decoration-green-200 decoration-2">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-green-900/10 text-sm font-bold text-white transition-all transform
                  ${isLoading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 hover:bg-slate-800 hover:scale-[1.01] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 active:scale-[0.98]'
                  }`}
              >
                {isLoading ? 'Iniciando sesión...' : 'Ingresar al Dashboard'}
                {!isLoading && <ArrowRight size={18} className="ml-2" />}
              </button>
            </div>
          </form>

          <div className="mt-10 border-t border-slate-100 pt-6">
             <p className="text-xs text-center text-slate-400 mx-auto max-w-xs leading-relaxed">
               Protegido por reCAPTCHA y sujeto a la Política de Privacidad y Términos de Servicio.
             </p>
          </div>
        </div>
      </div>

      {/* Right Side - Artistic/Marketing */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950"></div>
          
          {/* Abstract Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" 
              style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>
          
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-green-500/10 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[100px]"></div>

          <div className="absolute inset-0 flex flex-col justify-center px-20 text-white z-20">
             <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                   Nueva Versión 2.0
                </div>
                <h3 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                  Gestiona tu negocio en <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">WhatsApp</span> como un <span className="underline decoration-green-500/30 decoration-8 underline-offset-4">Profesional</span>.
                </h3>
                <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-md">
                   La plataforma todo-en-un para escalar tus ventas, automatizar mensajes y gestionar inventario sin salir del chat.
                </p>

                <ul className="space-y-5">
                   {[
                     "CRM integrado con mensajería real",
                     "Pipeline de ventas automatizado",
                     "Facturación y POS en un click"
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-green-400 group-hover:bg-green-500/10 group-hover:border-green-500/30 transition-all">
                           <CheckCircle2 size={20} />
                        </div>
                        <span className="text-lg font-medium text-slate-200 group-hover:text-white transition-colors">{item}</span>
                     </li>
                   ))}
                </ul>
             </div>
          </div>
          
          {/* Glass Effect Card Abstract */}
          <div className="absolute bottom-10 right-10 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-80 shadow-2xl skew-x-[-2deg] skew-y-[-2deg] opacity-60 z-10 hidden xl:block">
             <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                 <div>
                    <div className="h-2 w-24 bg-white/20 rounded mb-1.5"></div>
                    <div className="h-2 w-16 bg-white/10 rounded"></div>
                 </div>
             </div>
             <div className="space-y-2">
                <div className="h-2 w-full bg-white/5 rounded"></div>
                <div className="h-2 w-full bg-white/5 rounded"></div>
                <div className="h-2 w-2/3 bg-white/5 rounded"></div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default LoginPage;
