import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

const ExpirationSection = ({ vehicleId }) => {
  const [expirations, setExpirations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpiration, setEditingExpiration] = useState(null);
  const [formData, setFormData] = useState({
    tipo: 'seguro',
    tipo_personalizado: '',
    fecha_vencimiento: '',
    observaciones: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpirations();
  }, [vehicleId]);

  const fetchExpirations = async () => {
    try {
      const response = await api.get(`/api/vehicles/${vehicleId}/expirations`);
      setExpirations(response.data);
    } catch (error) {
      toast.error('No se pudieron cargar los vencimientos');
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
      return {
        status: 'vencido',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        text: 'Vencido'
      };
    } else if (diffDays <= 30) {
      return {
        status: 'por-vencer',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        text: `Por vencer (${diffDays} días)`
      };
    }
    return {
      status: 'ok',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      text: 'OK'
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingExpiration) {
        await api.put(`/api/expirations/${editingExpiration.id}`, formData);
        toast.warning('Vencimiento actualizado correctamente');
      } else {
        await api.post(`/api/vehicles/${vehicleId}/expirations`, formData);
        toast.success('Vencimiento agregado correctamente');
      }
      fetchExpirations();
      resetForm();
    } catch (err) {
      setError('Error al guardar el vencimiento');
      toast.error('No se pudo guardar el vencimiento');
      console.error('Error saving expiration:', err);
    }
  };

  const handleEdit = (expiration) => {
    setEditingExpiration(expiration);
    setFormData({
      tipo: expiration.tipo,
      tipo_personalizado: expiration.tipo_personalizado || '',
      fecha_vencimiento: expiration.fecha_vencimiento,
      observaciones: expiration.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (expirationId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vencimiento?')) {
      try {
        await api.delete(`/api/expirations/${expirationId}`);
        setExpirations(expirations.filter(e => e.id !== expirationId));
        toast.success('Vencimiento eliminado correctamente');
      } catch (err) {
        setError('Error al eliminar el vencimiento');
        toast.error('No se pudo eliminar el vencimiento');
        console.error('Error deleting expiration:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'seguro',
      tipo_personalizado: '',
      fecha_vencimiento: '',
      observaciones: ''
    });
    setEditingExpiration(null);
    setShowForm(false);
    setError(null);
  };

  const tipoLabels = {
    seguro: 'Seguro',
    vtv: 'VTV',
    matafuegos: 'Matafuegos',
    otro: 'Otro'
  };

  if (loading) {
    return <div className="text-center py-4">Cargando vencimientos...</div>;
  }

  return (
    <div className="bg-white shadow-2xl rounded-3xl p-6 border border-slate-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-xl font-semibold text-slate-900">Vencimientos</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm"
        >
          {showForm ? 'Cerrar formulario' : 'Agregar Vencimiento'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-3xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2 text-sm">
                Tipo *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
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
                  name="tipo_personalizado"
                  value={formData.tipo_personalizado}
                  onChange={(e) => setFormData({...formData, tipo_personalizado: e.target.value})}
                  placeholder="Ej: Cédula verde"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 mt-2"
                />
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2 text-sm">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-slate-700 font-medium mb-2 text-sm">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm"
            >
              {editingExpiration ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full hover:bg-slate-300 transition-colors text-sm"
            >
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
            const status = getExpirationStatus(expiration.fecha_vencimiento);
            return (
              <div key={expiration.id} className="border border-slate-200 rounded-3xl p-4 bg-slate-50 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-medium text-slate-900">
                        {expiration.tipo === 'otro'
                          ? expiration.tipo_personalizado || 'Otro'
                          : tipoLabels[expiration.tipo]
                        }
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.bgColor} ${status.textColor}`}>
                        {status.text}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">
                      Vence: {new Date(expiration.fecha_vencimiento).toLocaleDateString('es-AR')}
                    </p>
                    {expiration.observaciones && (
                      <p className="text-slate-500 text-sm mt-2">
                        {expiration.observaciones}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(expiration)}
                      className="text-sky-600 hover:text-sky-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(expiration.id)}
                      className="text-rose-600 hover:text-rose-800 text-sm"
                    >
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
