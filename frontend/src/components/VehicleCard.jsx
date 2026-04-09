import { Link } from 'react-router-dom';
import api from '../api';
import { useState, useEffect } from 'react';

const VehicleCard = ({ vehicle, onDelete }) => {
  const [expirations, setExpirations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpirations();
  }, [vehicle.id]);

  const fetchExpirations = async () => {
    try {
      const response = await api.get(`/vehicles/${vehicle.id}/expirations`);
      setExpirations(response.data);
    } catch (error) {
      console.error('Error fetching expirations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpirationStatus = (fechaVencimiento) => {
    const today = new Date();
    const expirationDate = new Date(fechaVencimiento);
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'vencido', color: 'red', text: 'Vencido' };
    } else if (diffDays <= 30) {
      return { status: 'por-vencer', color: 'yellow', text: `Por vencer (${diffDays} días)` };
    } else {
      return { status: 'ok', color: 'green', text: 'OK' };
    }
  };

  const hasNearExpiration = () => {
    if (loading) return false;
    return expirations.some(exp => {
      const status = getExpirationStatus(exp.fecha_vencimiento);
      return status.status === 'vencido' || status.status === 'por-vencer';
    });
  };

  const getExpirationBadge = () => {
    if (loading) return null;
    
    const vencidos = expirations.filter(exp => 
      getExpirationStatus(exp.fecha_vencimiento).status === 'vencido'
    ).length;
    
    const porVencer = expirations.filter(exp => 
      getExpirationStatus(exp.fecha_vencimiento).status === 'por-vencer'
    ).length;

    if (vencidos > 0) {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {vencidos} vencido{vencidos > 1 ? 's' : ''}
        </span>
      );
    } else if (porVencer > 0) {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {porVencer} por vencer
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {vehicle.marca} {vehicle.modelo}
          </h3>
          <p className="text-gray-600 font-medium">{vehicle.patente}</p>
          <p className="text-gray-500 text-sm">Año {vehicle.año}</p>
        </div>
        {getExpirationBadge()}
      </div>

      {vehicle.foto_url && (
        <div className="mb-4">
          <img
            src={vehicle.foto_url}
            alt={`${vehicle.marca} ${vehicle.modelo}`}
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <Link
          to={`/vehicle/${vehicle.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver detalles
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/edit-vehicle/${vehicle.id}`}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors text-sm"
          >
            Editar
          </Link>
          <button
            onClick={() => onDelete(vehicle.id)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>

      {hasNearExpiration() && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ Hay vencimientos próximos o vencidos
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
