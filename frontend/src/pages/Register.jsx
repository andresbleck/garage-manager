import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [familyName, setFamilyName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/auth/register', {
        familyName,
        displayName,
        email,
        password,
        confirmPassword,
      });
      auth.login(response.data);
      toast.success('Cuenta familiar creada con éxito');
      navigate('/', { replace: true });
    } catch (error) {
      const message = error.response?.data?.error || 'Error al crear la cuenta';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-3xl p-8 mt-12 border border-slate-200">
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">Crear cuenta familiar</h2>
      <p className="text-slate-600 mb-6">Configura una cuenta de familia para que todos puedan usar la misma app.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-slate-700">
          <span className="text-sm font-medium">Nombre de familia</span>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Familia Pérez"
          />
        </label>

        <label className="block text-slate-700">
          <span className="text-sm font-medium">Tu nombre</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Juan"
          />
        </label>

        <label className="block text-slate-700">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="familia@dominio.com"
          />
        </label>

        <label className="block text-slate-700">
          <span className="text-sm font-medium">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </label>

        <label className="block text-slate-700">
          <span className="text-sm font-medium">Confirmar contraseña</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Ya tenés cuenta familiar?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
};

export default Register;
