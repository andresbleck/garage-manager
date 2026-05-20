import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-blue-400">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconImage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-purple-400">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const Insurance = () => {
  const { isAuthenticated } = useAuth();
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
    } catch {
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
    } catch {}
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
    if (file) setSelectedFiles((prev) => ({ ...prev, [vehicleId]: file }));
  };

  const toggleForm = (vehicleId) =>
    setFormVisible((prev) => ({ ...prev, [vehicleId]: !prev[vehicleId] }));

  const handleUpload = async (vehicleId) => {
    const file = selectedFiles[vehicleId];
    if (!file) { toast.warning('Seleccioná un archivo para subir'); return; }
    if (!ALLOWED_TYPES.includes(file.type)) { toast.error('Solo se aceptan imágenes (PNG/JPG) y PDF'); return; }
    if (file.size > MAX_FILE_SIZE) { toast.error('El archivo no puede superar los 5 MB'); return; }

    setSubmitting(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await api.post(`/api/vehicles/${vehicleId}/documents`, { name: file.name, type: file.type, data: dataUrl });
      await fetchDocsForVehicle(vehicleId);
      setSelectedFiles((prev) => { const n = { ...prev }; delete n[vehicleId]; return n; });
      setFormVisible((prev) => ({ ...prev, [vehicleId]: false }));
      toast.success('Documento guardado correctamente');
    } catch {
      toast.error('No se pudo guardar el archivo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpen = async (docId, docType, docName) => {
    setOpening((prev) => ({ ...prev, [docId]: true }));
    try {
      const response = await api.get(`/api/documents/${docId}/view`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: docType });
      const url = URL.createObjectURL(blob);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isPdf = docType === 'application/pdf';

      const link = document.createElement('a');
      link.href = url;
      if (isMobile && isPdf) {
        link.download = docName;
      } else {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
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
      setDocsByVehicle((prev) => ({ ...prev, [vehicleId]: (prev[vehicleId] || []).filter((d) => d.id !== docId) }));
      toast.success('Documento eliminado');
    } catch {
      toast.error('No se pudo eliminar el documento');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Documentos</h2>
        <p className="text-slate-500 text-sm mt-1">Fotos y PDFs de seguros, cédulas y más. Guardados en la nube.</p>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-dashed border-slate-700 p-12 text-center text-slate-500">
          No hay vehículos registrados aún.
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => {
            const vehicleDocs = docsByVehicle[vehicle.id] || [];
            const isOpen = formVisible[vehicle.id];
            return (
              <div key={vehicle.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors duration-200">

                {/* Header vehículo */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-white text-base">{vehicle.marca} {vehicle.modelo}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{vehicle.patente}</span>
                      <span className="text-xs text-slate-500">Año {vehicle.año}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
                      {vehicleDocs.length} doc{vehicleDocs.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleForm(vehicle.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 active:scale-95 transition-all"
                    >
                      <IconUpload />
                      {isOpen ? 'Cancelar' : 'Agregar'}
                    </button>
                  </div>
                </div>

                {/* Form upload */}
                {isOpen && (
                  <div className="px-5 py-4 bg-slate-800/50 border-b border-slate-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Subir archivo</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(vehicle.id, e)}
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpload(vehicle.id)}
                        disabled={submitting || !selectedFiles[vehicle.id]}
                        className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-50 whitespace-nowrap"
                      >
                        {submitting ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                    {selectedFiles[vehicle.id] && (
                      <p className="mt-2 text-xs text-slate-500">Archivo: {selectedFiles[vehicle.id].name}</p>
                    )}
                  </div>
                )}

                {/* Lista documentos */}
                {vehicleDocs.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-slate-600 text-center">
                    No hay documentos cargados para este vehículo.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {vehicleDocs.map((doc) => {
                      const isPdf = doc.type === 'application/pdf';
                      return (
                        <div key={doc.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                              {isPdf ? <IconFile /> : <IconImage />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-200 truncate">{doc.name}</p>
                              <p className="text-xs text-slate-500">{isPdf ? 'PDF' : 'Imagen'} · {formatDateTime(doc.uploaded_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <button
                              type="button"
                              onClick={() => handleOpen(doc.id, doc.type, doc.name)}
                              disabled={opening[doc.id]}
                              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
                            >
                              {opening[doc.id] ? 'Abriendo...' : 'Abrir'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(vehicle.id, doc.id)}
                              className="rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Insurance;
