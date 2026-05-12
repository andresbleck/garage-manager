import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconWrench = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FEATURES = [
  {
    Icon: IconCalendar,
    title: 'Control de vencimientos',
    desc: 'Seguro, VTV, matafuegos y más. Recordatorios automáticos por email antes de que venzan.',
  },
  {
    Icon: IconWrench,
    title: 'Historial de reparaciones',
    desc: 'Registrá cada intervención con fecha, costo y kilometraje. Todo en un solo lugar.',
  },
  {
    Icon: IconFile,
    title: 'Gestión de documentos',
    desc: 'Guardá PDFs y fotos del seguro, cédula verde o cualquier documento del vehículo.',
  },
  {
    Icon: IconUsers,
    title: 'Cuenta familiar',
    desc: 'Una sola cuenta accesible desde cualquier dispositivo. Todos en la familia al tanto.',
  },
];

const LandingPage = () => (
  <div className="relative overflow-hidden">
    {/* Fondo con gradiente sutil */}
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
    <div className="absolute -top-40 -right-40 -z-10 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl" />
    <div className="absolute -bottom-40 -left-40 -z-10 w-96 h-96 rounded-full bg-slate-100/60 blur-3xl" />

    {/* Hero */}
    <div className="max-w-4xl mx-auto pt-12 pb-16 px-4 text-center">
      <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
        Gestión vehicular familiar
      </div>

      <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
        Tus vehículos,
        <br />
        <span className="text-blue-600">siempre al día</span>
      </h2>

      <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
        Vencimientos, reparaciones y documentos de todos los autos de la familia en un solo lugar. Con recordatorios automáticos para que nunca se te pase nada.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
        <Link
          to="/register"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/25"
        >
          Crear cuenta familiar
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all shadow-sm"
        >
          Iniciar sesión
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {FEATURES.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-100 transition-colors">
              <Icon />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Home = () => {
  const { user, isAuthenticated, initialized } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [docsByVehicle, setDocsByVehicle] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) { setLoading(false); return; }
    fetchVehicles();
  }, [initialized, isAuthenticated]);

  const fetchVehicles = async () => {
    try {
      const [vehiclesRes, countsRes] = await Promise.all([
        api.get('/api/vehicles'),
        api.get('/api/documents/counts'),
      ]);
      setVehicles(vehiclesRes.data);
      setDocsByVehicle(countsRes.data);
    } catch (err) {
      setError('Error al cargar los vehículos');
      toast.error('No se pudo cargar la lista de vehículos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar este vehículo?')) return;
    try {
      await api.delete(`/api/vehicles/${vehicleId}`);
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      toast.success('Vehículo eliminado correctamente');
    } catch (err) {
      toast.error('No se pudo eliminar el vehículo');
      console.error(err);
    }
  };

  if (!initialized || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-xl border border-slate-100 text-base font-medium text-slate-500">
          Cargando...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LandingPage />;

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Panel de {user?.displayName}</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Familia {user?.familyName} · {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} registrado{vehicles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/add-vehicle"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
        >
          + Agregar Vehículo
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-100">
          <p className="text-slate-400 text-base mb-5">No tenés vehículos registrados todavía</p>
          <Link
            to="/add-vehicle"
            className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Agregar primer vehículo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onDelete={handleDeleteVehicle}
              insuranceDocsCount={docsByVehicle[vehicle.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
