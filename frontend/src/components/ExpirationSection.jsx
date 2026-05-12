import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

const TIPO_LABELS = {
  seguro: 'Seguro',
  vtv: 'VTV',
  matafuegos: 'Matafuegos',
  otro: 'Otro',
};

function getExpirationStatus(fechaVencimiento, estado) {
  if (estado === 'regularizado') {
    return { status: 'regularizado', bgColor: 'bg-teal-100', textColor: 'text-teal-800', text: 'Regularizado' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(fechaVencimiento);
  exp.setHours(0, 0, 0, 0);
  const diffDays = Math.round((exp - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'vencido', bgColor: 'bg-red-100', textColor: 'text-red-800', text: 'Vencido' };
  }
  if (diffDays === 0) {
    return { status: 'hoy', bgColor: 'bg-red-100', textColor: 'text-red-800', text: 'Vence hoy' };
  }
  if (diffDays <= 5) {
    return { status: 'urgente', bgColor: 'bg-red-100', textColor: 'text-red-800', text: `Vence en ${diffDays} día${diffDays !== 1 ? 's' : ''}` };
  }
  if (diffDays <= 15) {
    return { status: 'por-vencer', bgColor: 'bg-orange-100', textColor: 'text-orange-800', text: `Vence en ${diffDays} días` };
  }
  if (diffDays <= 30) {
    return { status: 'pronto', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', text: `Vence en ${diffDays} días` };
  }
  return { status: 'ok', bgColor: 'bg-green-100', textColor: 'text-green-800', text: 'Al día' };
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
      const response = await api.get(`/api/vehicles/${vehicleId}/expirations`);
      setExpirations(response.data);
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
      const msg = err.response?.data?.error || 'Error al guardar el vencimiento';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleEdit = (expiration) => {
    setEditingExpiration(expiration);
    setFormData({
      tipo: expiration.tipo,
      tipo_personalizado: expiration.tipo_personalizado || '',
      fecha_vencimiento: expiration.fecha_vencimiento,
      observaciones: expiration.observaciones || '',
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
      toast.error('No se pudo eliminar el vencimiento');
    }
  };

  const handleRegularizar = async (id) => {
    try {
      const { data } = await api.patch(`/api/expirations/${id}/regularizar`);
      setExpirations(expirations.map(exp => exp.id === id ? data : exp));
      toast.success('Marcado como regularizado');
    } catch {
      toast.error('No se pudo regularizar el vencimiento');
    }
  };

  const handleActivar = async (id) => {
    try {
      const { data } = await api.patch(`/api/expirations/${id}/activar`);
      setExpirations(expirations.map(exp => exp.id === id ? data : exp));
      toast.info('Vencimiento reactivado');
    } catch {
      toast.error('No se pudo reactivar el vencimiento');
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingExpiration(null);
    setShowForm(false);
    setError(null);
  };

  if (loading) return <div className="text-center py-4 text-slate-500">Cargando vencimientos...</div>;

  return (
    <div className="bg-white shadow-2xl rounded-3xl p-6 border border-slate-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-xl font-semibold text-slate-900">Vencimientos</h3>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm"
        >
          {showForm ? 'Cerrar formulario' : 'Agregar Vencimiento'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-3xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2 text-sm">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 mt-2"
                />
              )}
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-2 text-sm">Fecha de Vencimiento *</label>
              <input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-slate-700 font-medium mb-2 text-sm">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows="2"
              className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm">
              {editingExpiration ? 'Actualizar' : 'Guardar'}
            </button>
            <button type="button" onClick={resetForm} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full hover:bg-slate-300 transition-colors text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {expirations.length === 0 ? (
        <p className="text-slate-500 text-center py-4">No hay vencimientos registrados</p>
      ) : (
        <div className="space-y-3">
          {expirations.map((expiration) => {
            const statusInfo = getExpirationStatus(expiration.fecha_vencimiento, expiration.estado);
            const isRegularizado = expiration.estado === 'regularizado';
            return (
              <div
                key={expiration.id}
                className={`border rounded-3xl p-4 shadow-sm ${isRegularizado ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-medium text-slate-900">
                        {expiration.tipo === 'otro'
                          ? expiration.tipo_personalizado || 'Otro'
                          : TIPO_LABELS[expiration.tipo]}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">
                      Vence: {new Date(expiration.fecha_vencimiento + 'T12:00:00').toLocaleDateString('es-AR')}
                    </p>
                    {expiration.observaciones && (
                      <p className="text-slate-500 text-sm mt-1">{expiration.observaciones}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    {isRegularizado ? (
                      <button
                        onClick={() => handleActivar(expiration.id)}
                        className="text-slate-500 hover:text-slate-700 text-xs underline"
                      >
                        Reactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegularizar(expiration.id)}
                        className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-teal-700 transition-colors"
                      >
                        Regularizar
                      </button>
                    )}
                    <button onClick={() => handleEdit(expiration)} className="text-sky-600 hover:text-sky-800 text-sm">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(expiration.id)} className="text-rose-600 hover:text-rose-800 text-sm">
                      Eliminar
                    </button>
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
