const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const router = express.Router();

// Middleware
router.use(cors());
router.use(express.json());

// GET /api/vehicles/:vehicleId/expirations - Obtener vencimientos de un vehículo
router.get('/vehicles/:vehicleId/expirations', (req, res) => {
  try {
    const { vehicleId } = req.params;
    const expirations = db.prepare('SELECT * FROM expirations WHERE vehicle_id = ? ORDER BY fecha_vencimento ASC').all(vehicleId);
    res.json(expirations);
  } catch (error) {
    console.error('Error fetching expirations:', error);
    res.status(500).json({ error: 'Error al obtener los vencimientos' });
  }
});

// POST /api/vehicles/:vehicleId/expirations - Agregar vencimiento a un vehículo
router.post('/vehicles/:vehicleId/expirations', (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { tipo, tipo_personalizado, fecha_vencimiento, observaciones } = req.body;
    
    // Validaciones básicas
    if (!tipo || !fecha_vencimiento) {
      return res.status(400).json({ error: 'El tipo y la fecha de vencimiento son obligatorios' });
    }

    // Validar tipo de vencimiento
    const tiposValidos = ['seguro', 'vtv', 'matafuegos', 'otro'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de vencimiento no válido' });
    }

    // Si el tipo es 'otro', se requiere el tipo personalizado
    if (tipo === 'otro' && !tipo_personalizado) {
      return res.status(400).json({ error: 'Cuando el tipo es "Otro", debe especificar el nombre' });
    }

    // Verificar que el vehículo exista
    const vehicle = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const stmt = db.prepare(`
      INSERT INTO expirations (vehicle_id, tipo, tipo_personalizado, fecha_vencimiento, observaciones)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(vehicleId, tipo, tipo_personalizado || null, fecha_vencimiento, observaciones || null);
    const newExpiration = db.prepare('SELECT * FROM expirations WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newExpiration);
  } catch (error) {
    console.error('Error creating expiration:', error);
    res.status(500).json({ error: 'Error al crear el vencimiento' });
  }
});

// PUT /api/expirations/:id - Actualizar vencimiento
router.put('/expirations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, tipo_personalizado, fecha_vencimiento, observaciones } = req.body;
    
    // Validaciones básicas
    if (!tipo || !fecha_vencimiento) {
      return res.status(400).json({ error: 'El tipo y la fecha de vencimiento son obligatorios' });
    }

    // Validar tipo de vencimiento
    const tiposValidos = ['seguro', 'vtv', 'matafuegos', 'otro'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de vencimiento no válido' });
    }

    // Si el tipo es 'otro', se requiere el tipo personalizado
    if (tipo === 'otro' && !tipo_personalizado) {
      return res.status(400).json({ error: 'Cuando el tipo es "Otro", debe especificar el nombre' });
    }

    // Verificar que el vencimiento exista
    const existingExpiration = db.prepare('SELECT id FROM expirations WHERE id = ?').get(id);
    if (!existingExpiration) {
      return res.status(404).json({ error: 'Vencimiento no encontrado' });
    }

    const stmt = db.prepare(`
      UPDATE expirations 
      SET tipo = ?, tipo_personalizado = ?, fecha_vencimiento = ?, observaciones = ?
      WHERE id = ?
    `);
    
    stmt.run(tipo, tipo_personalizado || null, fecha_vencimiento, observaciones || null, id);
    const updatedExpiration = db.prepare('SELECT * FROM expirations WHERE id = ?').get(id);
    
    res.json(updatedExpiration);
  } catch (error) {
    console.error('Error updating expiration:', error);
    res.status(500).json({ error: 'Error al actualizar el vencimiento' });
  }
});

// DELETE /api/expirations/:id - Eliminar vencimiento
router.delete('/expirations/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el vencimiento exista
    const existingExpiration = db.prepare('SELECT id FROM expirations WHERE id = ?').get(id);
    if (!existingExpiration) {
      return res.status(404).json({ error: 'Vencimiento no encontrado' });
    }
    
    const stmt = db.prepare('DELETE FROM expirations WHERE id = ?');
    stmt.run(id);
    
    res.json({ message: 'Vencimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting expiration:', error);
    res.status(500).json({ error: 'Error al eliminar el vencimiento' });
  }
});

module.exports = router;
