import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api';

function daysUntil(fecha) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(fecha + 'T12:00:00');
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp - today) / 86400000);
}

const VehicleCard = ({ vehicle, onDelete, insuranceDocsCount = 0 }) => {
  const [expirations, setExpirations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/vehicles/${vehicle.id}/expirations`)
      .then(r => setExpirations(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vehicle.id]);

  const activeAlerts = loading ? [] : expirations.filter(exp => {
    if (exp.estado === 'regularizado') return false;
    return daysUntil(exp.fecha_vencimiento) <= 30;
  });

  const hasVencido = activeAlerts.some(e => daysUntil(e.fecha_vencimiento) < 0);
  const alertCount = activeAlerts.length;

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md max-w-[450px] w-full mx-auto">
      {alertCount > 0 && (
        <div className={`h-1 w-full ${hasVencido ? 'bg-red-500' : 'bg-yellow-400'}`} />
      )}

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {vehicle.marca} {vehicle.modelo}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-slate-500 text-sm font-medium">{vehicle.patente}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400 text-sm">{vehicle.año}</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center min-w-[60px]">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Docs</p>
            <p className="text-lg font-bold text-slate-900">{insuranceDocsCount}</p>
          </div>
        </div>

        {!loading && alertCount > 0 && (
          <div className={`rounded-xl px-4 py-3 text-sm ${hasVencido ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
            <p className="font-semibold mb-0.5">
              {hasVencido ? 'Atención requerida' : 'Próximos vencimientos'}
            </p>
            <p className="text-xs opacity-80">
              {alertCount} vencimiento{alertCount !== 1 ? 's' : ''} {hasVencido ? 'con problemas' : 'próximos'}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Link
            to={`/vehicle/${vehicle.id}`}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Ver detalles
          </Link>
          <div className="flex gap-2">
            <Link
              to={`/edit-vehicle/${vehicle.id}`}
              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Editar
            </Link>
            <button
              onClick={() => onDelete(vehicle.id)}
              className="inline-flex items-center rounded-full bg-red-50 border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
