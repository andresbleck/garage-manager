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
    <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-0.5 max-w-[450px] w-full mx-auto flex flex-col">

      {alertCount > 0 && (
        <div className={`h-0.5 w-full ${hasVencido ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'}`} />
      )}

      {/* Header */}
      <div className="relative px-6 pt-5 pb-4 border-b border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-white text-lg leading-tight truncate">{vehicle.marca} {vehicle.modelo}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-mono font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{vehicle.patente}</span>
              <span className="text-xs text-slate-500">{vehicle.año}</span>
            </div>
          </div>
          {insuranceDocsCount > 0 && (
            <div className="text-center shrink-0 bg-slate-800 rounded-xl px-3 py-2">
              <p className="text-[9px] text-slate-500 uppercase tracking-wide leading-none mb-0.5">Docs</p>
              <p className="text-base font-bold text-slate-300">{insuranceDocsCount}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Estado */}
        {!loading && (
          alertCount > 0 ? (
            <div className={`rounded-xl px-4 py-3 border ${
              hasVencido
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <p className="text-xs font-semibold">
                {hasVencido ? 'Atención requerida' : 'Próximos vencimientos'}
              </p>
              <p className="text-xs opacity-70 mt-0.5">
                {alertCount} vencimiento{alertCount !== 1 ? 's' : ''} {hasVencido ? 'con problemas' : 'próximos'}
              </p>
            </div>
          ) : (
            <div className="rounded-xl px-4 py-3 bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs font-semibold text-emerald-400">Todo en orden</p>
              <p className="text-xs text-emerald-400/60 mt-0.5">Sin vencimientos próximos</p>
            </div>
          )
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <Link
            to={`/vehicle/${vehicle.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm shadow-blue-500/20"
          >
            Ver detalles
          </Link>
          <div className="flex gap-2">
            <Link
              to={`/edit-vehicle/${vehicle.id}`}
              className="inline-flex items-center rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              Editar
            </Link>
            <button
              onClick={() => onDelete(vehicle.id)}
              className="inline-flex items-center rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
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
