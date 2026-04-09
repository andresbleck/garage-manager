import { useState, useEffect } from 'react';
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
        color: 'red', 
        text: 'Vencido',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      };
    } else if (diffDays <= 30) {
      return { 
        status: 'por-vencer', 
        color: 'yellow', 
        text: `Por vencer (${diffDays} días)`,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      };
    } else {
      return { 
        status: 'ok', 
        color: 'green', 
        text: 'OK',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingExpiration) {
        await api.put(`/api/expirations/${editingExpiration.id}`, formData);
      } else {
        await api.post(`/api/vehicles/${vehicleId}/expirations`, formData);
      }
      
      fetchExpirations();
      resetForm();
    } catch (err) {
      setError('Error al guardar el vencimiento');
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
      } catch (err) {
        setError('Error al eliminar el vencimiento');
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
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Vencimientos</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          {showForm ? 'Cancelar' : 'Agregar Vencimiento'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Tipo *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                />
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {editingExpiration ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {expirations.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay vencimientos registrados</p>
      ) : (
        <div className="space-y-3">
          {expirations.map((expiration) => {
            const status = getExpirationStatus(expiration.fecha_vencimiento);
            return (
              <div key={expiration.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-800">
                        {expiration.tipo === 'otro' 
                          ? expiration.tipo_personalizado || 'Otro'
                          : tipoLabels[expiration.tipo]
                        }
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                        {status.text}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Vence: {new Date(expiration.fecha_vencimiento).toLocaleDateString('es-AR')}
                    </p>
                    {expiration.observaciones && (
                      <p className="text-gray-500 text-sm mt-1">
                        {expiration.observaciones}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(expiration)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(expiration.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
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
