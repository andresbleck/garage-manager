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
  if (days < 0)  return { label: 'Vencido',      cls: 'bg-red-100 text-red-700',       dot: 'bg-red-500'     };
  if (days === 0) return { label: 'Hoy',          cls: 'bg-red-100 text-red-700',       dot: 'bg-red-500'     };
  if (days <= 5)  return { label: `${days}d`,     cls: 'bg-red-100 text-red-700',       dot: 'bg-red-400'     };
  if (days <= 15) return { label: `${days}d`,     cls: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400'  };
  if (days <= 30) return { label: `${days}d`,     cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400'  };
  return               { label: `${days}d`,       cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' };
}

const StatCard = ({ label, value, sub, accent }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-1 border-l-4 ${accent}`}>
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
    <p className="text-3xl font-extrabold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500">{sub}</p>
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

  // Stats
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
        <div className="rounded-2xl bg-white px-8 py-6 shadow-xl border border-slate-100 text-base font-medium text-slate-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Bienvenida */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Buen día, {user?.displayName}</h2>
        <p className="text-slate-400 text-sm mt-0.5">Familia {user?.familyName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Vehículos" value={vehicles.length} sub="En tu garage" accent="border-l-blue-400" />
        <StatCard label="Documentos" value={totalDocs} sub="Archivados" accent="border-l-slate-400" />
        <StatCard
          label="Alertas activas"
          value={alerts.length}
          sub={alerts.length === 0 ? 'Todo en orden' : `${vencidos.length} vencido${vencidos.length !== 1 ? 's' : ''}, ${alerts.length - vencidos.length} próximo${alerts.length - vencidos.length !== 1 ? 's' : ''}`}
          accent={alerts.length > 0 ? 'border-l-red-400' : 'border-l-emerald-400'}
        />
        <StatCard
          label="Próximo vencimiento"
          value={nextDays !== null ? `${nextDays}d` : '—'}
          sub={nextLabel}
          accent="border-l-orange-400"
        />
      </div>

      {/* Vehículos con resumen */}
      {vehicles.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-slate-400 mb-4">No tenés vehículos registrados</p>
          <Link to="/vehicles" className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
            Agregar vehículo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Tus vehículos</h3>
          {vehicles.map(v => {
            const exps = expByVehicle[v.id] || [];
            const vigenteExps = exps.filter(e => e.estado === 'vigente');
            const alertExps = vigenteExps.filter(e => daysUntil(e.fecha_vencimiento) <= 30);
            const hasProblems = alertExps.some(e => daysUntil(e.fecha_vencimiento) < 0);

            return (
              <div key={v.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                {alertExps.length > 0 && (
                  <div className={`h-1 w-full ${hasProblems ? 'bg-red-500' : 'bg-yellow-400'}`} />
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg leading-tight">{v.marca} {v.modelo}</h4>
                      <p className="text-slate-400 text-sm">{v.patente} · {v.año}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {docsByVehicle[v.id] > 0 && (
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Docs</p>
                          <p className="text-sm font-bold text-slate-700">{docsByVehicle[v.id]}</p>
                        </div>
                      )}
                      <Link
                        to={`/vehicle/${v.id}`}
                        className="inline-flex items-center bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>

                  {/* Vencimientos activos */}
                  {vigenteExps.length === 0 ? (
                    <p className="text-slate-400 text-xs">Sin vencimientos registrados</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {vigenteExps.map(exp => {
                        const days = daysUntil(exp.fecha_vencimiento);
                        const pill = getExpPill(days);
                        const label = exp.tipo === 'otro' ? (exp.tipo_personalizado || 'Otro') : TIPO_LABELS[exp.tipo];
                        return (
                          <div key={exp.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${pill.dot}`} />
                              <span className="text-sm font-medium text-slate-700">{label}</span>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pill.cls}`}>
                              {pill.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Alertas */}
                  {alertExps.length > 0 && (
                    <div className={`mt-3 rounded-xl px-4 py-2.5 flex items-center justify-between ${hasProblems ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'}`}>
                      <p className={`text-xs font-semibold ${hasProblems ? 'text-red-700' : 'text-yellow-700'}`}>
                        {alertExps.length} alerta{alertExps.length !== 1 ? 's' : ''} activa{alertExps.length !== 1 ? 's' : ''}
                      </p>
                      <Link to={`/vehicle/${v.id}`} className={`text-xs font-semibold underline ${hasProblems ? 'text-red-600' : 'text-yellow-600'}`}>
                        Resolver
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
  );
};

export default Dashboard;
