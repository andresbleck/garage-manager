const express = require('express');
const cors = require('cors');
const { db, inicializarBaseDeDatos } = require('./db/database');

const vehiclesRoutes = require('./routes/vehicles');
const expirationsRoutes = require('./routes/expirations');
const repairsRoutes = require('./routes/repairs');
const documentsRoutes = require('./routes/documents');
const authRoutes = require('./routes/auth');
const { startNotificationCron, checkAndSendNotifications } = require('./services/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api', expirationsRoutes);
app.use('/api', repairsRoutes);
app.use('/api', documentsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'GarageManager API funcionando correctamente' });
});

app.post('/api/test-notifications', async (req, res) => {
  try {
    await checkAndSendNotifications();
    res.json({ message: 'Chequeo de notificaciones ejecutado. Revisá los logs del servidor.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

async function startServer() {
  await inicializarBaseDeDatos();
  startNotificationCron();
  app.listen(PORT, () => {
    console.log(`Servidor GarageManager corriendo en puerto ${PORT}`);
    console.log(`API disponible en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error iniciando servidor:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\nCerrando servidor...');
  db.close();
  process.exit(0);
});

module.exports = app;
