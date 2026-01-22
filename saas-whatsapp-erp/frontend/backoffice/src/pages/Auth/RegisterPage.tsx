import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Lock, Mail, ArrowRight, CheckCircle2, Building, User } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.register(formData);
      // Backend automatically logs in or we use the token returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Redirect to dashboard (root) as requested
        navigate('/');
      } else {
        // Fallback if no token is returned immediately (e.g. email verification required)
        navigate('/login');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error en el registro. Verifique sus datos e intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Left Side - Artistic/Marketing */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900 border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950"></div>

        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-[100px]"></div>

        <div className="absolute inset-0 flex flex-col justify-center px-20 text-white z-20">
          <div className="max-w-xl">
            <h3 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Convierte tu <span className="text-primary-400">WhatsApp</span> en una <span className="underline decoration-primary-500/30 decoration-8 underline-offset-4">Máquina de Ventas</span>.
            </h3>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-md">
              Únete a cientos de empresas que ya están facturando y cerrando ventas directamente desde el chat.
            </p>

            <ul className="space-y-6">
              {[
                { title: "Prueba de 14 días gratis", desc: "Sin tarjeta de crédito. Acceso total." },
                { title: "Configuración en 2 minutos", desc: "Conecta tu número y empieza a vender." },
                { title: "Soporte en tu idioma", desc: "Acompañamiento real para tu negocio." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 group-hover:bg-primary-500/10 group-hover:border-primary-500/30 transition-all shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 group-hover:text-white transition-colors uppercase tracking-widest text-xs mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[500px] relative">
        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <MessageSquare size={24} fill="white" />
              </div>
              <span>SaaS<span className="text-primary-600">ERP</span></span>
            </h1>
            <h2 className="mt-8 text-3xl font-black text-slate-900">Crea tu cuenta</h2>
            <p className="mt-3 text-sm text-slate-500">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-bold animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nombre de tu Empresa</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-100 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                  placeholder="Ej. Mi Tienda S.A."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Tu Nombre</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full px-4 py-3.5 border border-slate-100 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Apellido</label>
                <input
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full px-4 py-3.5 border border-slate-100 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-100 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                  placeholder="juan@empresa.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña Segura</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-100 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-4 px-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all transform shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.98]
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Creando cuenta...' : 'Comenzar Prueba Gratis'}
                {!isLoading && <ArrowRight size={20} className="ml-2" />}
              </button>
            </div>

            <p className="mt-6 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest px-4">
              Al registrarte aceptas nuestros <a href="#" className="underline">Términos de Servicio</a> y <a href="#" className="underline">Política de Privacidad</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

// Internal icon import for this file
const MessageSquare = ({ size, fill, className }: any) => (
  <svg viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2.5" className={className} width={size} height={size}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export default RegisterPage;
