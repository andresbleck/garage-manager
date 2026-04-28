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

  useEffect(() => {
    fetchVehicle();
  }, [id]);

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
        <div className="text-lg">Cargando vehículo...</div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Vehículo no encontrado'}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          ← Volver a vehículos
        </button>

        <div className="bg-white shadow-2xl rounded-3xl p-6 border border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 mb-1">
                {vehicle.marca} {vehicle.modelo}
              </h2>
              <p className="text-lg text-slate-600 mb-1">{vehicle.patente}</p>
              <p className="text-slate-500 text-sm">Año {vehicle.año}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/edit-vehicle/${vehicle.id}`)}
                className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors text-sm"
              >
                Editar
              </button>
              <Link
                to="/seguros"
                className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
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
                className="w-full h-64 object-cover rounded-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
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
