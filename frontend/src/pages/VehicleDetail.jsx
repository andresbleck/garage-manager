import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
          className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Volver a vehículos
        </button>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {vehicle.marca} {vehicle.modelo}
              </h2>
              <p className="text-xl text-gray-600 mb-1">{vehicle.patente}</p>
              <p className="text-gray-500">Año {vehicle.año}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/edit-vehicle/${vehicle.id}`)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Editar
              </button>
            </div>
          </div>

          {vehicle.foto_url && (
            <div className="mt-6">
              <img
                src={vehicle.foto_url}
                alt={`${vehicle.marca} ${vehicle.modelo}`}
                className="w-full h-64 object-cover rounded-lg"
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
