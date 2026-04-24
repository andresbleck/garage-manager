import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  addInsuranceDoc,
  deleteInsuranceDoc,
  loadInsuranceDocs,
} from '../utils/insuranceStorage';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

const Insurance = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docsByVehicle, setDocsByVehicle] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [formVisible, setFormVisible] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (user?.familyId) {
      setDocsByVehicle(loadInsuranceDocs(user.familyId));
    }
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/api/vehicles');
      setVehicles(response.data);
    } catch (err) {
      toast.error('No se pudo cargar la lista de vehículos');
      console.error('Error fetching vehicles for insurance:', err);
    } finally {
      setLoading(false);
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
      toast.warning('Selecciona un archivo para subir');
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Solo se aceptan imágenes y PDF');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo no puede superar los 5 MB');
      return;
    }

    setSubmitting(true);
    try {
      const url = await readFileAsDataUrl(file);
      const doc = {
        id: `${vehicleId}-${Date.now()}`,
        name: file.name,
        type: file.type,
        url,
        uploadedAt: new Date().toISOString(),
      };

      addInsuranceDoc(user.familyId, vehicleId, doc);
      setDocsByVehicle(loadInsuranceDocs(user.familyId));
      setSelectedFiles((prev) => {
        const next = { ...prev };
        delete next[vehicleId];
        return next;
      });
      toast.success('Documento guardado correctamente');
    } catch (err) {
      toast.error('No se pudo cargar el archivo');
      console.error('Error uploading insurance document:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (vehicleId, docId) => {
    deleteInsuranceDoc(user.familyId, vehicleId, docId);
    setDocsByVehicle(loadInsuranceDocs(user.familyId));
    toast.error('Documento eliminado');
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
        <h2 className="text-3xl font-semibold text-slate-900 mb-2">Seguros</h2>
        <p className="text-slate-600">
          Sube y consulta las fotos o PDFs de los seguros de cada vehículo. Los archivos se guardan localmente en tu navegador.
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
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {vehicle.marca} {vehicle.modelo}
                  </h3>
                  <p className="text-slate-500">Patente: {vehicle.patente}</p>
                  <p className="text-slate-500">Año: {vehicle.año}</p>
                </div>
                <div className="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-600">
                  {vehicleDocs.length} documento{vehicleDocs.length === 1 ? '' : 's'}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                  {vehicleDocs.length === 0 ? (
                    <div className="rounded-3xl bg-slate-50 p-4 text-slate-600">
                      No hay documentos de seguro cargados para este vehículo.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vehicleDocs.map((doc) => (
                        <div key={doc.id} className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                              <p className="text-slate-500 text-sm">
                                {doc.type === 'application/pdf' ? 'PDF' : 'Imagen'} · {new Date(doc.uploadedAt).toLocaleString('es-AR')}
                              </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                              >
                                Abrir
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDelete(vehicle.id, doc.id)}
                                className="inline-flex min-w-[160px] items-center justify-center rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition"
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

                {formVisible[vehicle.id] ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-4 gap-3">
                      <div>
                        <p className="text-slate-700 font-medium">Subir foto o PDF del seguro</p>
                        <p className="text-slate-500 text-sm">Selecciona un archivo y guarda el documento.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleForm(vehicle.id)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                      >
                        Ocultar
                      </button>
                    </div>
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(event) => handleFileChange(vehicle.id, event)}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    {selectedFiles[vehicle.id] && (
                      <div className="mb-4 rounded-2xl bg-white p-3 text-sm text-slate-700 border border-slate-200">
                        Seleccionado: {selectedFiles[vehicle.id].name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleUpload(vehicle.id)}
                      disabled={submitting}
                      className="w-full rounded-full bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {submitting ? 'Subiendo...' : 'Guardar documento'}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleForm(vehicle.id)}
                      className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                      Agregar documento
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Insurance;
