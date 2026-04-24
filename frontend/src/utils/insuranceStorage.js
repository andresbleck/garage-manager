const STORAGE_KEY_PREFIX = 'garageManagerInsuranceDocs_';

const getStorageKey = (familyId) => `${STORAGE_KEY_PREFIX}${familyId || 'global'}`;

export const loadInsuranceDocs = (familyId) => {
  try {
    const stored = localStorage.getItem(getStorageKey(familyId));
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading insurance docs from localStorage', error);
    return {};
  }
};

export const saveInsuranceDocs = (familyId, docs) => {
  try {
    localStorage.setItem(getStorageKey(familyId), JSON.stringify(docs));
  } catch (error) {
    console.error('Error saving insurance docs to localStorage', error);
  }
};

export const getInsuranceDocsForVehicle = (familyId, vehicleId) => {
  const docs = loadInsuranceDocs(familyId);
  return docs[vehicleId] || [];
};

export const addInsuranceDoc = (familyId, vehicleId, doc) => {
  const docs = loadInsuranceDocs(familyId);
  const currentList = docs[vehicleId] || [];
  docs[vehicleId] = [doc, ...currentList];
  saveInsuranceDocs(familyId, docs);
};

export const deleteInsuranceDoc = (familyId, vehicleId, docId) => {
  const docs = loadInsuranceDocs(familyId);
  const currentList = docs[vehicleId] || [];
  docs[vehicleId] = currentList.filter((item) => item.id !== docId);
  if (docs[vehicleId].length === 0) {
    delete docs[vehicleId];
  }
  saveInsuranceDocs(familyId, docs);
};
