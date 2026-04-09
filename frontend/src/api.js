import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.PROD ? '/.netlify/functions' : 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
