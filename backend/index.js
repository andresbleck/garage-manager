const express = require('express');
const cors = require('cors');
const db = require('./db/database');

// Importar rutas
const vehiclesRoutes = require('./routes/vehicles');
const expirationsRoutes = require('./routes/expirations');
const repairsRoutes = require('./routes/repairs');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowed = ['https://garage-manager-five.vercel.app', 'https://garage-manager-1.onrender.com'];
    if (!origin || allowed.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api', expirationsRoutes);
app.use('/api', repairsRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'GarageManager API funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor GarageManager corriendo en puerto ${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}`);
});

// Exportar para testing
module.exports = app;

// Cerrar conexión a la base de datos al cerrar el servidor
process.on('SIGINT', () => {
  console.log('\nCerrando servidor...');
  db.close();
  process.exit(0);
});
