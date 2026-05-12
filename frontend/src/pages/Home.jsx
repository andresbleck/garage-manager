import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '📅', title: 'Vencimientos', desc: 'Seguimiento de seguro, VTV, matafuegos y más. Recordatorios automáticos por email.' },
  { icon: '🔧', title: 'Historial de reparaciones', desc: 'Registrá cambios de aceite, batería, ruedas y cualquier trabajo realizado.' },
  { icon: '📄', title: 'Documentos', desc: 'Guardá PDFs y fotos del seguro, cédula verde y lo que necesites.' },
  { icon: '👨‍👩‍👧', title: 'Por familia', desc: 'Una sola cuenta accesible desde cualquier dispositivo de la familia.' },
];

const LandingPage = () => (
  <div className="max-w-3xl mx-auto text-center py-8">
    <h2 className="text-4xl font-bold text-slate-900 mb-4">Mantené tus vehículos al día</h2>
    <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
      GarageManager te ayuda a recordar vencimientos, registrar reparaciones y organizar los documentos de todos los autos de la familia.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10 text-left">
      {FEATURES.map((f) => (
        <div key={f.title} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex gap-4 items-start">
          <span className="text-3xl">{f.icon}</span>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
            <p className="text-slate-500 text-sm">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link
        to="/register"
        className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-full text-base font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
      >
        Crear cuenta familiar
      </Link>
      <Link
        to="/login"
        className="inline-flex items-center justify-center bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-full text-base font-semibold hover:bg-slate-50 transition-colors"
      >
        Iniciar sesión
      </Link>
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
        <div className="rounded-3xl bg-white/90 px-8 py-6 shadow-xl border border-slate-200 text-lg font-medium text-slate-700">
          Cargando...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LandingPage />;

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Panel de {user?.displayName}</h2>
          <p className="text-slate-500 mt-1">
            Familia {user?.familyName} · {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} registrado{vehicles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/add-vehicle"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-colors"
        >
          + Agregar Vehículo
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-xl border border-slate-200">
          <p className="text-slate-500 text-lg mb-4">No tenés vehículos registrados todavía</p>
          <Link
            to="/add-vehicle"
            className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
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
