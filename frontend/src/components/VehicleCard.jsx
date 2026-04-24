import { Link } from 'react-router-dom';
import api from '../api';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const VehicleCard = ({ vehicle, onDelete, insuranceDocsCount = 0 }) => {
  const { isAuthenticated } = useAuth();
  const [expirations, setExpirations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpirations();
  }, [vehicle.id]);

  const fetchExpirations = async () => {
    try {
      const response = await api.get(`/api/vehicles/${vehicle.id}/expirations`);
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
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md max-w-[450px] w-full mx-auto">
      <div className="space-y-5 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-2xl font-semibold text-slate-900">
              {vehicle.marca} {vehicle.modelo}
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="truncate text-2xl font-semibold text-slate-900">
                {vehicle.patente}
              </p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                Año {vehicle.año}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center sm:w-28">
            <p className="text-[9px] uppercase tracking-[0.22em] text-slate-400">Documentos</p>
            <p className="text-xl font-semibold text-slate-900">{insuranceDocsCount}</p>
            <p className="text-[10px] text-slate-500">archivo{insuranceDocsCount === 1 ? '' : 's'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            to={`/vehicle/${vehicle.id}`}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Ver detalles
          </Link>
          {isAuthenticated && (
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/edit-vehicle/${vehicle.id}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Editar
              </Link>
              <button
                onClick={() => onDelete(vehicle.id)}
                className="inline-flex items-center justify-center rounded-full bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>

        {hasNearExpiration() && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
            <p className="font-medium">⚠️ Hay vencimientos próximos o vencidos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
