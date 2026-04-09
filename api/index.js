const express = require('express');
const cors = require('cors');
const db = require('./db/database');

// Importar rutas
const vehiclesRoutes = require('./routes/vehicles');
const expirationsRoutes = require('./routes/expirations');
const repairsRoutes = require('./routes/repairs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas API
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

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor GarageManager corriendo en puerto ${PORT}`);
    console.log(`API disponible en http://localhost:${PORT}`);
  });
}

// Exportar para Netlify Functions
module.exports = app;

// Handler para Netlify Functions
exports.handler = async (event, context) => {
  // Para CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      }
    };
  }

  try {
    // Simular una solicitud Express para Netlify
    const req = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers || {},
      body: event.body,
      query: event.queryStringParameters || {}
    };

    // Crear un objeto response simulado
    let statusCode = 200;
    let headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };
    let body = '';

    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        body = JSON.stringify(data);
      },
      send: (data) => {
        body = data;
      },
      setHeader: (name, value) => {
        headers[name] = value;
      }
    };

    // Procesar la solicitud con Express
    await new Promise((resolve, reject) => {
      app(req, res);
      // Dar tiempo para que se procese la respuesta
      setTimeout(resolve, 100);
    });

    return {
      statusCode,
      headers,
      body
    };
  } catch (error) {
    console.error('Error en Netlify Function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
