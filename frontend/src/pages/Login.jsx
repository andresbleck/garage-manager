import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      auth.login(response.data);
      toast.success('Bienvenido de nuevo');
      navigate(from, { replace: true });
    } catch (error) {
      const message = error.response?.data?.error || 'Credenciales inválidas';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Marca */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">GarageManager</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de vehículos familiares</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-1">Iniciar sesión</h2>
          <p className="text-slate-500 text-sm mb-6">Ingresá con tu cuenta familiar para acceder al tablero compartido.</p>

          {/* Demo credentials */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-xs text-blue-400 font-semibold mb-1">Cuenta de prueba</p>
            <p className="text-xs text-slate-400 font-mono">admingarage@gmail.com</p>
            <p className="text-xs text-slate-400 font-mono">GarageManager</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="familia@dominio.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 mt-2 shadow-lg shadow-blue-500/20"
            >
              {loading ? 'Validando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500 text-center">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Crear cuenta familiar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
