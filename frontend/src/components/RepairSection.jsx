import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

const TIPO_LABELS = {
  cambio_bateria: 'Cambio de Batería',
  cambio_aceite: 'Cambio de Aceite',
  cambio_ruedas: 'Cambio de Ruedas',
  aire_acondicionado: 'Aire Acondicionado',
  otro: 'Otro',
};

function formatDate(fecha) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const EMPTY_FORM = {
  tipo: 'cambio_aceite',
  tipo_personalizado: '',
  descripcion: '',
  fecha: '',
  costo: '',
  kilometraje: '',
};

const RepairSection = ({ vehicleId }) => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);

  useEffect(() => { fetchRepairs(); }, [vehicleId]);

  const fetchRepairs = async () => {
    try {
      const { data } = await api.get(`/api/vehicles/${vehicleId}/repairs`);
      setRepairs(data);
    } catch {
      toast.error('No se pudieron cargar las reparaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const body = {
        ...formData,
        costo: formData.costo ? parseFloat(formData.costo) : null,
        kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : null,
      };
      if (editingRepair) {
        const { data } = await api.put(`/api/repairs/${editingRepair.id}`, body);
        setRepairs(repairs.map(r => r.id === data.id ? data : r));
        toast.success('Reparación actualizada');
      } else {
        const { data } = await api.post(`/api/vehicles/${vehicleId}/repairs`, body);
        setRepairs([data, ...repairs]);
        toast.success('Reparación agregada');
      }
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al guardar';
      setError(msg);
      toast.error(msg);
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
      kilometraje: repair.kilometraje || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta reparación?')) return;
    try {
      await api.delete(`/api/repairs/${id}`);
      setRepairs(repairs.filter(r => r.id !== id));
      toast.success('Reparación eliminada');
    } catch {
      toast.error('No se pudo eliminar');
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingRepair(null);
    setShowForm(false);
    setError(null);
  };

  if (loading) return <div className="text-center py-4 text-slate-400 text-sm">Cargando reparaciones...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900">Reparaciones</h3>
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
                <option value="cambio_bateria">Cambio de Batería</option>
                <option value="cambio_aceite">Cambio de Aceite</option>
                <option value="cambio_ruedas">Cambio de Ruedas</option>
                <option value="aire_acondicionado">Aire Acondicionado</option>
                <option value="otro">Otro</option>
              </select>
              {formData.tipo === 'otro' && (
                <input
                  type="text"
                  value={formData.tipo_personalizado}
                  onChange={(e) => setFormData({ ...formData, tipo_personalizado: e.target.value })}
                  placeholder="Ej: Bujías"
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                />
              )}
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1.5 text-xs uppercase tracking-wide">Fecha *</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
                className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1.5 text-xs uppercase tracking-wide">Costo</label>
              <input
                type="number"
                value={formData.costo}
                onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                step="0.01" min="0"
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1.5 text-xs uppercase tracking-wide">Kilometraje</label>
              <input
                type="number"
                value={formData.kilometraje}
                onChange={(e) => setFormData({ ...formData, kilometraje: e.target.value })}
                min="0"
                placeholder="0"
                className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-slate-600 font-medium mb-1.5 text-xs uppercase tracking-wide">Descripción *</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required rows="2"
              placeholder="Describe el trabajo realizado..."
              className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
              {editingRepair ? 'Actualizar' : 'Guardar'}
            </button>
            <button type="button" onClick={resetForm} className="bg-slate-200 text-slate-600 px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-300 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {repairs.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">No hay reparaciones registradas</div>
      ) : (
        <div className="space-y-3">
          {repairs.map((repair) => {
            const tipoLabel = repair.tipo === 'otro' ? (repair.tipo_personalizado || 'Otro') : TIPO_LABELS[repair.tipo];
            return (
              <div
                key={repair.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="h-1 w-full bg-blue-300" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-bold text-slate-900 text-base leading-tight">{tipoLabel}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{formatDate(repair.fecha)}</p>
                    </div>
                    <div className="flex gap-3 shrink-0 text-right">
                      {repair.costo && (
                        <div>
                          <p className="text-xs text-slate-400">Costo</p>
                          <p className="text-sm font-semibold text-slate-700">${Number(repair.costo).toLocaleString('es-AR')}</p>
                        </div>
                      )}
                      {repair.kilometraje && (
                        <div>
                          <p className="text-xs text-slate-400">Km</p>
                          <p className="text-sm font-semibold text-slate-700">{Number(repair.kilometraje).toLocaleString('es-AR')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {repair.descripcion && (
                    <p className="text-slate-500 text-sm leading-snug mb-3">{repair.descripcion}</p>
                  )}

                  <div className="flex items-center justify-end pt-3 border-t border-slate-100 gap-3">
                    <button onClick={() => handleEdit(repair)} className="text-blue-500 hover:text-blue-700 text-xs font-medium transition-colors">
                      Editar
                    </button>
                    <span className="text-slate-200">·</span>
                    <button onClick={() => handleDelete(repair.id)} className="text-slate-400 hover:text-red-500 text-xs font-medium transition-colors">
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

export default RepairSection;
