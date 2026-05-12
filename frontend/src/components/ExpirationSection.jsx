import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

const TIPO_LABELS = {
  seguro: 'Seguro',
  vtv: 'VTV',
  matafuegos: 'Matafuegos',
  otro: 'Otro',
};

function getStatusInfo(fechaVencimiento, estado) {
  if (estado === 'regularizado') {
    return {
      label: 'Regularizado',
      pill: 'bg-teal-100 text-teal-700',
      bar: 'bg-teal-400',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(fechaVencimiento + 'T12:00:00');
  exp.setHours(0, 0, 0, 0);
  const diff = Math.round((exp - today) / 86400000);

  if (diff < 0)  return { label: 'Vencido',          pill: 'bg-red-100 text-red-700',      bar: 'bg-red-500'     };
  if (diff === 0) return { label: 'Vence hoy',        pill: 'bg-red-100 text-red-700',      bar: 'bg-red-500'     };
  if (diff <= 5)  return { label: `${diff}d restantes`, pill: 'bg-red-100 text-red-700',    bar: 'bg-red-400'     };
  if (diff <= 15) return { label: `${diff}d restantes`, pill: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400' };
  if (diff <= 30) return { label: `${diff}d restantes`, pill: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400' };
  return           { label: 'Al día',               pill: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-400' };
}

function formatDate(fecha) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

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

  if (loading) return <div className="text-center py-4 text-slate-400 text-sm">Cargando vencimientos...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900">Vencimientos</h3>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
        >
          {showForm ? 'Cancelar' : '+ Agregar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl mb-4 text-sm">{error}</div>
      )}

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-600 font-medium mb-1.5 text-xs uppercase tracking-wide">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
                className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                />
              )}
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1.5 text-xs uppercase tracking-wide">Fecha de vencimiento *</label>
              <input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                required
                className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-slate-600 font-medium mb-1.5 text-xs uppercase tracking-wide">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows="2"
              placeholder="Notas adicionales..."
              className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
              {editingExpiration ? 'Actualizar' : 'Guardar'}
            </button>
            <button type="button" onClick={resetForm} className="bg-slate-200 text-slate-600 px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-300 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {expirations.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">No hay vencimientos registrados</div>
      ) : (
        <div className="space-y-3">
          {expirations.map((exp) => {
            const si = getStatusInfo(exp.fecha_vencimiento, exp.estado);
            const isRegularizado = exp.estado === 'regularizado';
            const tipoLabel = exp.tipo === 'otro' ? (exp.tipo_personalizado || 'Otro') : TIPO_LABELS[exp.tipo];

            return (
              <div
                key={exp.id}
                className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Barra de color superior */}
                <div className={`h-1 w-full ${si.bar}`} />

                <div className="p-4">
                  {/* Fila principal */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-base leading-tight">{tipoLabel}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{formatDate(exp.fecha_vencimiento)}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${si.pill}`}>
                      {si.label}
                    </span>
                  </div>

                  {exp.observaciones && (
                    <p className="text-slate-500 text-sm mb-3 leading-snug">{exp.observaciones}</p>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {isRegularizado ? (
                      <button
                        onClick={() => handleActivar(exp.id)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors"
                      >
                        Reactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegularizar(exp.id)}
                        className="inline-flex items-center gap-1.5 bg-teal-600 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-teal-700 active:scale-95 transition-all"
                      >
                        Regularizar
                      </button>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <span className="text-slate-200">·</span>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-slate-400 hover:text-red-500 text-xs font-medium transition-colors"
                      >
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
