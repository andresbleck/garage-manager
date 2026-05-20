import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ExpirationSection from '../components/ExpirationSection';
import RepairSection from '../components/RepairSection';

const VehicleDetail = () => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => { fetchVehicle(); }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/api/vehicles/${id}`);
      setVehicle(response.data);
    } catch (err) {
      setError('Error al cargar el vehículo');
      console.error('Error fetching vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Cargando vehículo...
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
        {error || 'Vehículo no encontrado'}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-slate-500 hover:text-slate-300 font-medium text-sm transition-colors"
        >
          ← Volver
        </button>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-1">
                {vehicle.marca} {vehicle.modelo}
              </h2>
              <span className="inline-block text-sm font-mono font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded mb-1">{vehicle.patente}</span>
              <p className="text-slate-500 text-sm">Año {vehicle.año}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/edit-vehicle/${vehicle.id}`)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors text-sm font-medium"
              >
                Editar
              </button>
              <Link
                to="/seguros"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-semibold shadow-sm shadow-blue-500/20"
              >
                Ver seguros
              </Link>
            </div>
          </div>

          {vehicle.foto_url && (
            <div className="mt-6">
              <img
                src={vehicle.foto_url}
                alt={`${vehicle.marca} ${vehicle.modelo}`}
                className="w-full h-64 object-cover rounded-xl"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpirationSection vehicleId={vehicle.id} />
        <RepairSection vehicleId={vehicle.id} />
      </div>
    </div>
  );
};

export default VehicleDetail;
