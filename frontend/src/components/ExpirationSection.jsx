import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

const TIPO_LABELS = { seguro: 'Seguro', vtv: 'VTV', matafuegos: 'Matafuegos', otro: 'Otro' };

function getStatusInfo(fechaVencimiento, estado) {
  if (estado === 'regularizado') return {
    label: 'Regularizado',
    pill: 'bg-teal-500/10 text-slate-200 border-teal-500/30',
    bar: 'bg-teal-500',
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(fechaVencimiento + 'T12:00:00');
  exp.setHours(0, 0, 0, 0);
  const diff = Math.round((exp - today) / 86400000);

  if (diff < 0)   return { label: 'Vencido',           pill: 'bg-red-500/10 text-slate-200 border-red-500/40',    bar: 'bg-red-500'    };
  if (diff === 0) return { label: 'Vence hoy',          pill: 'bg-red-500/10 text-slate-200 border-red-500/40',    bar: 'bg-red-500'    };
  if (diff <= 5)  return { label: `${diff}d restantes`, pill: 'bg-red-500/10 text-slate-200 border-red-500/40',    bar: 'bg-red-400'    };
  if (diff <= 15) return { label: `${diff}d restantes`, pill: 'bg-amber-500/10 text-slate-200 border-amber-500/40', bar: 'bg-amber-400' };
  if (diff <= 30) return { label: `${diff}d restantes`, pill: 'bg-yellow-500/10 text-slate-200 border-yellow-500/40', bar: 'bg-yellow-400' };
  return           { label: 'Al día',                   pill: 'bg-slate-800 text-slate-300 border-slate-700',      bar: 'bg-emerald-500' };
}

function formatDate(fecha) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const inputCls = 'w-full px-3 py-2.5 border border-slate-700 bg-slate-800 text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500';
const labelCls = 'block text-slate-500 font-medium mb-1.5 text-xs uppercase tracking-wide';

const EMPTY_FORM = { tipo: 'seguro', tipo_personalizado: '', fecha_vencimiento: '', observaciones: '' };

const ExpirationSection = ({ vehicleId }) => {
  const [expirations, setExpirations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpiration, setEditingExpiration] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);

  useEffect(() => { fetchExpirations(); }, [vehicleId]);

  const fetchExpirations = async () => {
    try {
      const { data } = await api.get(`/api/vehicles/${vehicleId}/expirations`);
      setExpirations(data);
    } catch {
      toast.error('No se pudieron cargar los vencimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingExpiration) {
        const { data } = await api.put(`/api/expirations/${editingExpiration.id}`, formData);
        setExpirations(expirations.map(exp => exp.id === data.id ? data : exp));
        toast.success('Vencimiento actualizado');
      } else {
        const { data } = await api.post(`/api/vehicles/${vehicleId}/expirations`, formData);
        setExpirations([...expirations, data]);
        toast.success('Vencimiento agregado');
      }
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al guardar';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleEdit = (exp) => {
    setEditingExpiration(exp);
    setFormData({
      tipo: exp.tipo,
      tipo_personalizado: exp.tipo_personalizado || '',
      fecha_vencimiento: exp.fecha_vencimiento,
      observaciones: exp.observaciones || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este vencimiento?')) return;
    try {
      await api.delete(`/api/expirations/${id}`);
      setExpirations(expirations.filter(e => e.id !== id));
      toast.success('Vencimiento eliminado');
    } catch {
      toast.error('No se pudo eliminar');
    }
  };

  const handleRegularizar = async (id) => {
    try {
      const { data } = await api.patch(`/api/expirations/${id}/regularizar`);
      setExpirations(expirations.map(e => e.id === id ? data : e));
      toast.success('Marcado como regularizado');
    } catch {
      toast.error('No se pudo regularizar');
    }
  };

  const handleActivar = async (id) => {
    try {
      const { data } = await api.patch(`/api/expirations/${id}/activar`);
      setExpirations(expirations.map(e => e.id === id ? data : e));
      toast.info('Vencimiento reactivado');
    } catch {
      toast.error('No se pudo reactivar');
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingExpiration(null);
    setShowForm(false);
    setError(null);
  };

  if (loading) return <div className="text-center py-4 text-slate-500 text-sm">Cargando vencimientos...</div>;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white">Vencimientos</h3>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-500 active:scale-95 transition-all"
        >
          {showForm ? 'Cancelar' : '+ Agregar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl mb-4 text-sm">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-5 bg-slate-800/50 rounded-2xl border border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
                className={inputCls}
              >
                <option value="seguro">Seguro</option>
                <option value="vtv">VTV</option>
                <option value="matafuegos">Matafuegos</option>
                <option value="otro">Otro</option>
              </select>
              {formData.tipo === 'otro' && (
                <input
                  type="text"
                  value={formData.tipo_personalizado}
                  onChange={(e) => setFormData({ ...formData, tipo_personalizado: e.target.value })}
                  placeholder="Ej: Cédula verde"
                  required
                  className={`${inputCls} mt-2`}
                />
              )}
            </div>
            <div>
              <label className={labelCls}>Fecha de vencimiento *</label>
              <input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                required
                className={inputCls}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className={labelCls}>Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows="2"
              placeholder="Notas adicionales..."
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors">
              {editingExpiration ? 'Actualizar' : 'Guardar'}
            </button>
            <button type="button" onClick={resetForm} className="bg-slate-700 text-slate-300 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-600 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {expirations.length === 0 ? (
        <div className="text-center py-8 text-slate-600 text-sm">No hay vencimientos registrados</div>
      ) : (
        <div className="space-y-3">
          {expirations.map((exp) => {
            const si = getStatusInfo(exp.fecha_vencimiento, exp.estado);
            const isRegularizado = exp.estado === 'regularizado';
            const tipoLabel = exp.tipo === 'otro' ? (exp.tipo_personalizado || 'Otro') : TIPO_LABELS[exp.tipo];

            return (
              <div key={exp.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-colors duration-200">
                <div className={`h-0.5 w-full ${si.bar}`} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-base leading-tight">{tipoLabel}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{formatDate(exp.fecha_vencimiento)}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${si.pill}`}>
                      {si.label}
                    </span>
                  </div>

                  {exp.observaciones && (
                    <p className="text-slate-400 text-sm mb-3 leading-snug">{exp.observaciones}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    {isRegularizado ? (
                      <button onClick={() => handleActivar(exp.id)} className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">
                        Reactivar
                      </button>
                    ) : (
                      <button onClick={() => handleRegularizar(exp.id)} className="inline-flex items-center gap-1.5 bg-teal-600/80 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-teal-500 active:scale-95 transition-all">
                        Regularizar
                      </button>
                    )}
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(exp)} className="text-slate-400 hover:text-blue-400 text-xs font-medium transition-colors">
                        Editar
                      </button>
                      <span className="text-slate-700">·</span>
                      <button onClick={() => handleDelete(exp.id)} className="text-slate-500 hover:text-red-400 text-xs font-medium transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExpirationSection;
