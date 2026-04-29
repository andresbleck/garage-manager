import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

const Insurance = () => {
  const { user, isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docsByVehicle, setDocsByVehicle] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [formVisible, setFormVisible] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [opening, setOpening] = useState({});

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchVehicles();
  }, [isAuthenticated]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/api/vehicles');
      setVehicles(response.data);
      await fetchAllDocs(response.data);
    } catch (err) {
      toast.error('No se pudo cargar la lista de vehículos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDocs = async (vehicleList) => {
    const results = {};
    await Promise.all(
      vehicleList.map(async (v) => {
        try {
          const res = await api.get(`/api/vehicles/${v.id}/documents`);
          results[v.id] = res.data;
        } catch {
          results[v.id] = [];
        }
      })
    );
    setDocsByVehicle(results);
  };

  const fetchDocsForVehicle = async (vehicleId) => {
    try {
      const res = await api.get(`/api/vehicles/${vehicleId}/documents`);
      setDocsByVehicle((prev) => ({ ...prev, [vehicleId]: res.data }));
    } catch {
      // silently ignore
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = (vehicleId, event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [vehicleId]: file }));
  };

  const toggleForm = (vehicleId) => {
    setFormVisible((prev) => ({ ...prev, [vehicleId]: !prev[vehicleId] }));
  };

  const handleUpload = async (vehicleId) => {
    const file = selectedFiles[vehicleId];
    if (!file) {
      toast.warning('Seleccioná un archivo para subir');
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Solo se aceptan imágenes (PNG/JPG) y PDF');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo no puede superar los 5 MB');
      return;
    }

    setSubmitting(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await api.post(`/api/vehicles/${vehicleId}/documents`, {
        name: file.name,
        type: file.type,
        data: dataUrl,
      });
      await fetchDocsForVehicle(vehicleId);
      setSelectedFiles((prev) => {
        const next = { ...prev };
        delete next[vehicleId];
        return next;
      });
      toast.success('Documento guardado correctamente');
    } catch (err) {
      toast.error('No se pudo guardar el archivo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpen = async (docId, docType) => {
    setOpening((prev) => ({ ...prev, [docId]: true }));
    try {
      const response = await api.get(`/api/documents/${docId}/view`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: docType });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      toast.error('No se pudo abrir el documento');
    } finally {
      setOpening((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const handleDelete = async (vehicleId, docId) => {
    if (!window.confirm('¿Eliminar este documento?')) return;
    try {
      await api.delete(`/api/documents/${docId}`);
      setDocsByVehicle((prev) => ({
        ...prev,
        [vehicleId]: (prev[vehicleId] || []).filter((d) => d.id !== docId),
      }));
      toast.success('Documento eliminado');
    } catch {
      toast.error('No se pudo eliminar el documento');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="rounded-3xl bg-white/90 px-8 py-6 shadow-xl border border-slate-200 text-lg font-medium text-slate-700">
          Cargando seguros...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
        <h2 className="text-3xl font-semibold text-slate-900 mb-2">Documentos</h2>
        <p className="text-slate-600">
          Subí fotos o PDFs de los seguros de cada vehículo. Los archivos se guardan en la nube.
        </p>
      </div>

      <div className="space-y-6">
        {vehicles.length === 0 && (
          <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200 text-center text-slate-600">
            No hay vehículos registrados aún.
          </div>
        )}

        {vehicles.map((vehicle) => {
          const vehicleDocs = docsByVehicle[vehicle.id] || [];
          return (
            <div key={vehicle.id} className="bg-white shadow-2xl rounded-3xl p-6 border border-slate-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {vehicle.marca} {vehicle.modelo}
                  </h3>
                  <p className="text-slate-500 text-sm">{vehicle.patente} · Año {vehicle.año}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                    {vehicleDocs.length} documento{vehicleDocs.length === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleForm(vehicle.id)}
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    {formVisible[vehicle.id] ? 'Cerrar' : 'Agregar'}
                  </button>
                </div>
              </div>

              {formVisible[vehicle.id] && (
                <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-slate-700 font-medium mb-3">Subir foto o PDF del seguro</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(vehicle.id, e)}
                      className="flex-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpload(vehicle.id)}
                      disabled={submitting || !selectedFiles[vehicle.id]}
                      className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {submitting ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                  {selectedFiles[vehicle.id] && (
                    <p className="mt-2 text-xs text-slate-500">
                      Seleccionado: {selectedFiles[vehicle.id].name}
                    </p>
                  )}
                </div>
              )}

              {vehicleDocs.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500 text-center">
                  No hay documentos cargados para este vehículo.
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicleDocs.map((doc) => (
                    <div key={doc.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {doc.type === 'application/pdf' ? 'PDF' : 'Imagen'} ·{' '}
                            {new Date(doc.uploaded_at).toLocaleString('es-AR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpen(doc.id, doc.type)}
                            disabled={opening[doc.id]}
                            className="flex-1 sm:flex-none rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
                          >
                            {opening[doc.id] ? 'Abriendo...' : 'Abrir'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(vehicle.id, doc.id)}
                            className="flex-1 sm:flex-none rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition"
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
        })}
      </div>
    </div>
  );
};

export default Insurance;
