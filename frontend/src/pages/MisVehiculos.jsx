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
        <div className="rounded-2xl bg-white px-8 py-6 shadow-xl border border-slate-100 text-base font-medium text-slate-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mis vehículos</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} · Familia {user?.familyName}
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

export default MisVehiculos;
