import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.PROD ? '/.netlify/functions/api' : 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
