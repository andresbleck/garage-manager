import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

const AddVehicle = () => {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    patente: '',
    año: ''
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
        año: response.data.año
      });
    } catch (err) {
      setError('Error al cargar el vehículo');
      toast.error('No se pudo cargar la información del vehículo');
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
        toast.warning('Vehículo actualizado correctamente');
      } else {
        await api.post('/api/vehicles', vehicleData);
        toast.success('Vehículo agregado correctamente');
      }
      
      navigate('/');
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Error en los datos del formulario');
        toast.error(err.response.data.error || 'Error en los datos del formulario');
      } else {
        setError('Error al guardar el vehículo');
        toast.error('No se pudo guardar el vehículo');
      }
      console.error('Error saving vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
        <h2 className="text-3xl font-semibold text-slate-900 mb-2">
          {isEditing ? 'Editar Vehículo' : 'Agregar Nuevo Vehículo'}
        </h2>
        <p className="text-slate-600">Completa los datos para mantener tu garage actualizado.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-3xl p-8 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-700 font-medium mb-2">
              Marca *
            </label>
            <input
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej: Toyota, Ford, etc."
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2">
              Modelo *
            </label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej: Corolla, Focus, etc."
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2">
              Patente *
            </label>
            <input
              type="text"
              name="patente"
              value={formData.patente}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej: ABC123"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-2">
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
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ej: 2020"
            />
          </div>
        </div>


        <div className="flex flex-col gap-4 md:flex-row justify-end mt-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full md:w-auto px-6 py-3 border border-slate-300 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVehicle;
