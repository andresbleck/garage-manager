const express = require('express');
const cors = require('cors');
const db = require('./db/database');

// Importar rutas
const vehiclesRouter = require('./routes/vehicles');
const expirationsRouter = require('./routes/expirations');
const repairsRouter = require('./routes/repairs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/vehicles', vehiclesRouter);
app.use('/api', expirationsRouter);
app.use('/api', repairsRouter);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'GarageManager API funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor GarageManager corriendo en puerto ${PORT}`);
    console.log(`API disponible en http://localhost:${PORT}`);
  });
}

// Exportar para Vercel
module.exports = app;
