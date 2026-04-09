import { useState, useEffect } from 'react';
import api from '../api';

const RepairSection = ({ vehicleId }) => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [formData, setFormData] = useState({
    tipo: 'cambio_aceite',
    tipo_personalizado: '',
    descripcion: '',
    fecha: '',
    costo: '',
    kilometraje: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRepairs();
  }, [vehicleId]);

  const fetchRepairs = async () => {
    try {
      const response = await api.get(`/api/vehicles/${vehicleId}/repairs`);
      setRepairs(response.data);
    } catch (error) {
      console.error('Error fetching repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const repairData = {
        ...formData,
        costo: formData.costo ? parseFloat(formData.costo) : null,
        kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : null
      };

      if (editingRepair) {
        await api.put(`/api/repairs/${editingRepair.id}`, repairData);
      } else {
        await api.post(`/api/vehicles/${vehicleId}/repairs`, repairData);
      }
      
      fetchRepairs();
      resetForm();
    } catch (err) {
      setError('Error al guardar la reparación');
      console.error('Error saving repair:', err);
    }
  };

  const handleEdit = (repair) => {
    setEditingRepair(repair);
    setFormData({
      tipo: repair.tipo,
      tipo_personalizado: repair.tipo_personalizado || '',
      descripcion: repair.descripcion,
      fecha: repair.fecha,
      costo: repair.costo || '',
      kilometraje: repair.kilometraje || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (repairId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reparación?')) {
      try {
        await api.delete(`/api/repairs/${repairId}`);
        setRepairs(repairs.filter(r => r.id !== repairId));
      } catch (err) {
        setError('Error al eliminar la reparación');
        console.error('Error deleting repair:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'cambio_aceite',
      tipo_personalizado: '',
      descripcion: '',
      fecha: '',
      costo: '',
      kilometraje: ''
    });
    setEditingRepair(null);
    setShowForm(false);
    setError(null);
  };

  const tipoLabels = {
    cambio_bateria: 'Cambio de Batería',
    cambio_aceite: 'Cambio de Aceite',
    cambio_ruedas: 'Cambio de Ruedas',
    aire_acondicionado: 'Aire Acondicionado',
    otro: 'Otro'
  };

  if (loading) {
    return <div className="text-center py-4">Cargando reparaciones...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Reparaciones</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          {showForm ? 'Cancelar' : 'Agregar Reparación'}
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
                <option value="cambio_bateria">Cambio de Batería</option>
                <option value="cambio_aceite">Cambio de Aceite</option>
                <option value="cambio_ruedas">Cambio de Ruedas</option>
                <option value="aire_acondicionado">Aire Acondicionado</option>
                <option value="otro">Otro</option>
              </select>
              
              {formData.tipo === 'otro' && (
                <input
                  type="text"
                  name="tipo_personalizado"
                  value={formData.tipo_personalizado}
                  onChange={(e) => setFormData({...formData, tipo_personalizado: e.target.value})}
                  placeholder="Ej: Bujías"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                />
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Costo (opcional)
              </label>
              <input
                type="number"
                name="costo"
                value={formData.costo}
                onChange={(e) => setFormData({...formData, costo: e.target.value})}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Kilometraje (opcional)
              </label>
              <input
                type="number"
                name="kilometraje"
                value={formData.kilometraje}
                onChange={(e) => setFormData({...formData, kilometraje: e.target.value})}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe la reparación realizada..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {editingRepair ? 'Actualizar' : 'Guardar'}
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

      {repairs.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay reparaciones registradas</p>
      ) : (
        <div className="space-y-3">
          {repairs.map((repair) => (
            <div key={repair.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-800">
                      {repair.tipo === 'otro' 
                        ? repair.tipo_personalizado || 'Otro'
                        : tipoLabels[repair.tipo]
                      }
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(repair.fecha).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{repair.descripcion}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    {repair.costo && (
                      <span>Costo: ${parseFloat(repair.costo).toFixed(2)}</span>
                    )}
                    {repair.kilometraje && (
                      <span>Km: {repair.kilometraje.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(repair)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(repair.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepairSection;
