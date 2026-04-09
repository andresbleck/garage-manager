import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const AddVehicle = () => {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    patente: '',
    año: '',
    foto_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      fetchVehicle();
    }
  }, [id, isEditing]);

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/api/vehicles/${id}`);
      setFormData({
        marca: response.data.marca,
        modelo: response.data.modelo,
        patente: response.data.patente,
        año: response.data.año,
        foto_url: response.data.foto_url || ''
      });
    } catch (err) {
      setError('Error al cargar el vehículo');
      console.error('Error fetching vehicle:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const vehicleData = {
        ...formData,
        año: parseInt(formData.año)
      };

      if (isEditing) {
        await api.put(`/api/vehicles/${id}`, vehicleData);
      } else {
        await api.post('/api/vehicles', vehicleData);
      }
      
      navigate('/');
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Error en los datos del formulario');
      } else {
        setError('Error al guardar el vehículo');
      }
      console.error('Error saving vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Editar Vehículo' : 'Agregar Nuevo Vehículo'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Marca *
            </label>
            <input
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Toyota, Ford, etc."
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Modelo *
            </label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Corolla, Focus, etc."
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Patente *
            </label>
            <input
              type="text"
              name="patente"
              value={formData.patente}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: ABC123"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Año *
            </label>
            <input
              type="number"
              name="año"
              value={formData.año}
              onChange={handleChange}
              required
              min="1900"
              max={currentYear + 1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 2020"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-gray-700 font-medium mb-2">
            URL de la foto (opcional)
          </label>
          <input
            type="url"
            name="foto_url"
            value={formData.foto_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </div>

        {formData.foto_url && (
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Vista previa de la foto
            </label>
            <img
              src={formData.foto_url}
              alt="Vista previa"
              className="w-full h-48 object-cover rounded-lg border"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVehicle;
