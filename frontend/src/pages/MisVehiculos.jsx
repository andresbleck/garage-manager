import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';

const MisVehiculos = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [docsByVehicle, setDocsByVehicle] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const [vehiclesRes, countsRes] = await Promise.all([
        api.get('/api/vehicles'),
        api.get('/api/documents/counts'),
      ]);
      setVehicles(vehiclesRes.data);
      setDocsByVehicle(countsRes.data);
    } catch (err) {
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
    } catch {
      toast.error('No se pudo eliminar el vehículo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Cargando vehículos...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Mis vehículos</h2>
          <p className="text-slate-500 text-sm mt-1">
            <span className="text-slate-400 font-medium">{vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}</span>
            {' · '}Familia <span className="text-slate-400 font-medium">{user?.familyName}</span>
          </p>
        </div>
        <Link
          to="/add-vehicle"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Agregar vehículo
        </Link>
      </div>

      {/* Grid */}
      {vehicles.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 border-dashed p-16 text-center">
          <p className="text-5xl mb-4">🚗</p>
          <p className="text-white font-semibold mb-1">Tu garage está vacío</p>
          <p className="text-slate-500 text-sm mb-6">Agregá tu primer vehículo para empezar a gestionar tus documentos y vencimientos</p>
          <Link
            to="/add-vehicle"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
          >
            Agregar primer vehículo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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

export default MisVehiculos;
