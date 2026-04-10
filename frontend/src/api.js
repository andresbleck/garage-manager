import axios from 'axios';

// URL del backend en producción
const apiUrl = import.meta.env.VITE_API_URL || 'https://garage-manager-1.onrender.com';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.PROD ? apiUrl : 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
