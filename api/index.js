const express = require('express');
const cors = require('cors');
const db = require('./db/database');

// Importar rutas
const vehiclesRouter = require('./vehicles');
const expirationsRouter = require('./expirations');
const repairsRouter = require('./repairs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas API - Sin prefijo /api para Netlify Functions
app.use('/', vehiclesRouter);
app.use('/', expirationsRouter);
app.use('/', repairsRouter);

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

module.exports = app;
