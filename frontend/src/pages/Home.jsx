import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';
import { loadInsuranceDocs } from '../utils/insuranceStorage';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [docsByVehicle, setDocsByVehicle] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (user?.familyId) {
      setDocsByVehicle(loadInsuranceDocs(user.familyId));
    }
  }, [user, vehicles.length]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/api/vehicles');
      setVehicles(response.data);
    } catch (err) {
      setError('Error al cargar los vehículos');
      toast.error('No se pudo cargar la lista de vehículos');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      try {
        await api.delete(`/api/vehicles/${vehicleId}`);
        setVehicles(vehicles.filter(v => v.id !== vehicleId));
        toast.error('Vehículo eliminado correctamente');
      } catch (err) {
        setError('Error al eliminar el vehículo');
        toast.error('No se pudo eliminar el vehículo');
        console.error('Error deleting vehicle:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="rounded-3xl bg-white/90 px-8 py-6 shadow-xl border border-slate-200 text-lg font-medium text-slate-700">
          Cargando vehículos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">Bienvenido a GarageManager</h2>
          <p className="text-slate-600 mb-8">
            Para agregar y gestionar vehículos, necesitas iniciar sesión o crear una cuenta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-slate-600 text-white px-6 py-3 rounded-full hover:bg-slate-700 transition-colors"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Panel de {user?.displayName}</h2>
          <p className="text-slate-600 mt-2">
            Familia {user?.familyName} · Accede rápido a los vehículos registrados y revisa vencimientos importantes.
          </p>
        </div>
        <Link
          to="/add-vehicle"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-colors"
        >
          Agregar Vehículo
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-xl border border-slate-200">
          <p className="text-slate-500 text-lg mb-4">No tienes vehículos registrados</p>
          <Link
            to="/add-vehicle"
            className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
          >
            Agregar Primer Vehículo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onDelete={handleDeleteVehicle}
              insuranceDocsCount={(docsByVehicle[vehicle.id] || []).length}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
