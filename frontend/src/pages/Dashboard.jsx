import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const TIPO_LABELS = { seguro: 'Seguro', vtv: 'VTV', matafuegos: 'Matafuegos', otro: 'Otro' };

function daysUntil(fecha) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(fecha + 'T12:00:00');
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp - today) / 86400000);
}

function getExpPill(days) {
  if (days < 0)   return { label: 'Vencido', cls: 'bg-red-500/10 text-slate-200 border-red-500/40',     dot: 'bg-red-500'     };
  if (days === 0) return { label: 'Hoy',     cls: 'bg-red-500/10 text-slate-200 border-red-500/40',     dot: 'bg-red-500'     };
  if (days <= 5)  return { label: `${days}d`, cls: 'bg-red-500/10 text-slate-200 border-red-500/40',    dot: 'bg-red-400'     };
  if (days <= 15) return { label: `${days}d`, cls: 'bg-amber-500/10 text-slate-200 border-amber-500/40', dot: 'bg-amber-400'  };
  if (days <= 30) return { label: `${days}d`, cls: 'bg-yellow-500/10 text-slate-200 border-yellow-500/40', dot: 'bg-yellow-400' };
  return               { label: `${days}d`,   cls: 'bg-slate-800 text-slate-300 border-slate-700',       dot: 'bg-emerald-500' };
}

const StatCard = ({ label, value, sub, accentBorder, valueClass }) => (
  <div className={`rounded-2xl bg-slate-900 border border-slate-800 border-l-4 ${accentBorder} p-5 flex flex-col gap-2 hover:border-r-slate-700 hover:border-t-slate-700 hover:border-b-slate-700 transition-colors duration-200`}>
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
    <p className={`text-3xl font-extrabold ${valueClass}`}>{value}</p>
    <p className="text-xs text-slate-500 leading-tight">{sub}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [expByVehicle, setExpByVehicle] = useState({});
  const [docsByVehicle, setDocsByVehicle] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [vRes, docsRes] = await Promise.all([
        api.get('/api/vehicles'),
        api.get('/api/documents/counts'),
      ]);
      const vs = vRes.data;
      setVehicles(vs);
      setDocsByVehicle(docsRes.data);
      const expResults = await Promise.all(
        vs.map(v => api.get(`/api/vehicles/${v.id}/expirations`).then(r => ({ id: v.id, exps: r.data })))
      );
      const map = {};
      expResults.forEach(({ id, exps }) => { map[id] = exps; });
      setExpByVehicle(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const allExps = Object.values(expByVehicle).flat();
  const vigentes = allExps.filter(e => e.estado === 'vigente');
  const alerts = vigentes.filter(e => daysUntil(e.fecha_vencimiento) <= 30);
  const vencidos = alerts.filter(e => daysUntil(e.fecha_vencimiento) < 0);
  const totalDocs = Object.values(docsByVehicle).reduce((a, b) => a + b, 0);

  const nextExp = vigentes
    .filter(e => daysUntil(e.fecha_vencimiento) >= 0)
    .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))[0];
  const nextDays = nextExp ? daysUntil(nextExp.fecha_vencimiento) : null;
  const nextVehicle = nextExp ? vehicles.find(v => v.id === nextExp.vehicle_id) : null;
  const nextLabel = nextExp
    ? `${nextExp.tipo === 'otro' ? nextExp.tipo_personalizado : TIPO_LABELS[nextExp.tipo]} · ${new Date(nextExp.fecha_vencimiento + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}${nextVehicle ? ` · ${nextVehicle.patente}` : ''}`
    : 'Sin vencimientos';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Cargando...
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Bienvenida */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{greeting}</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{user?.displayName}</h2>
          <p className="text-slate-500 text-sm mt-1">Familia <span className="text-slate-400 font-medium">{user?.familyName}</span></p>
        </div>
        <p className="hidden sm:block text-xs text-slate-600 uppercase tracking-widest">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Vehículos"
          value={vehicles.length}
          sub="En tu garage"
          accentBorder="border-l-blue-500"
          valueClass="text-blue-400"
        />
        <StatCard
          label="Documentos"
          value={totalDocs}
          sub="Archivados"
          accentBorder="border-l-slate-500"
          valueClass="text-slate-300"
        />
        <StatCard
          label="Alertas"
          value={alerts.length}
          sub={alerts.length === 0
            ? 'Todo en orden'
            : `${vencidos.length} vencido${vencidos.length !== 1 ? 's' : ''}, ${alerts.length - vencidos.length} próximo${alerts.length - vencidos.length !== 1 ? 's' : ''}`}
          accentBorder={alerts.length > 0 ? 'border-l-red-500' : 'border-l-emerald-500'}
          valueClass={alerts.length > 0 ? 'text-red-400' : 'text-emerald-400'}
        />
        <StatCard
          label="Próximo"
          value={nextDays !== null ? `${nextDays}d` : '—'}
          sub={nextLabel}
          accentBorder="border-l-orange-500"
          valueClass="text-orange-400"
        />
      </div>

      {/* Vehículos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Tus vehículos</h3>
          <Link to="/vehicles" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Ver todos →
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="rounded-2xl bg-slate-900 border border-dashed border-slate-700 p-12 text-center">
            <p className="text-slate-400 mb-5 text-sm">No tenés vehículos registrados</p>
            <Link to="/vehicles" className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
              Agregar vehículo
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map(v => {
              const exps = expByVehicle[v.id] || [];
              const vigenteExps = exps.filter(e => e.estado === 'vigente');
              const alertExps = vigenteExps.filter(e => daysUntil(e.fecha_vencimiento) <= 30);
              const hasProblems = alertExps.some(e => daysUntil(e.fecha_vencimiento) < 0);

              return (
                <div
                  key={v.id}
                  className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all duration-200 hover:shadow-xl hover:shadow-black/20"
                >
                  {alertExps.length > 0 && (
                    <div className={`h-0.5 w-full ${hasProblems ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'}`} />
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4 gap-4">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-base leading-tight truncate">{v.marca} {v.modelo}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{v.patente}</span>
                          <span className="text-xs text-slate-500">{v.año}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {docsByVehicle[v.id] > 0 && (
                          <div className="text-center bg-slate-800 rounded-lg px-2.5 py-1.5">
                            <p className="text-[9px] text-slate-500 uppercase tracking-wide leading-none mb-0.5">Docs</p>
                            <p className="text-sm font-bold text-slate-300">{docsByVehicle[v.id]}</p>
                          </div>
                        )}
                        <Link
                          to={`/vehicle/${v.id}`}
                          className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-500 transition-colors shadow-sm shadow-blue-500/20"
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </div>

                    {vigenteExps.length === 0 ? (
                      <p className="text-slate-600 text-xs">Sin vencimientos registrados</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {vigenteExps.map(exp => {
                          const days = daysUntil(exp.fecha_vencimiento);
                          const pill = getExpPill(days);
                          const label = exp.tipo === 'otro' ? (exp.tipo_personalizado || 'Otro') : TIPO_LABELS[exp.tipo];
                          return (
                            <div key={exp.id} className={`flex items-center justify-between rounded-xl px-3 py-2 border ${pill.cls}`}>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pill.dot}`} />
                                <span className="text-xs font-medium truncate">{label}</span>
                              </div>
                              <span className="text-xs font-bold ml-2 shrink-0">{pill.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {alertExps.length > 0 && (
                      <div className={`mt-3 rounded-xl px-4 py-2.5 flex items-center justify-between border ${
                        hasProblems
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-amber-500/10 border-amber-500/30'
                      }`}>
                        <p className="text-xs font-semibold text-slate-300">
                          {alertExps.length} alerta{alertExps.length !== 1 ? 's' : ''} activa{alertExps.length !== 1 ? 's' : ''}
                        </p>
                        <Link
                          to={`/vehicle/${v.id}`}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-200 hover:underline transition-colors"
                        >
                          Resolver →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
