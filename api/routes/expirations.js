const express = require('express');
const db = require('../db/database');
const router = express.Router();

// GET /api/vehicles/:id/expirations - Listar vencimientos de un vehículo
router.get('/vehicles/:id/expirations', (req, res) => {
  try {
    const vehicleId = req.params.id;
    
    // Verificar que el vehículo exista
    const vehicle = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const expirations = db.prepare(`
      SELECT * FROM expirations 
      WHERE vehicle_id = ? 
      ORDER BY fecha_vencimiento ASC
    `).all(vehicleId);
    
    res.json(expirations);
  } catch (error) {
    console.error('Error al obtener vencimientos:', error);
    res.status(500).json({ error: 'Error al obtener vencimientos' });
  }
});

// POST /api/vehicles/:id/expirations - Agregar vencimiento a un vehículo
router.post('/vehicles/:id/expirations', (req, res) => {
  try {
    const vehicleId = req.params.id;
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
    console.error('Error al crear vencimiento:', error);
    res.status(500).json({ error: 'Error al crear vencimiento' });
  }
});

// PUT /api/expirations/:id - Editar vencimiento
router.put('/expirations/:id', (req, res) => {
  try {
    const expirationId = req.params.id;
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
    const existingExpiration = db.prepare('SELECT id FROM expirations WHERE id = ?').get(expirationId);
    if (!existingExpiration) {
      return res.status(404).json({ error: 'Vencimiento no encontrado' });
    }

    const stmt = db.prepare(`
      UPDATE expirations 
      SET tipo = ?, tipo_personalizado = ?, fecha_vencimiento = ?, observaciones = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(tipo, tipo_personalizado || null, fecha_vencimiento, observaciones || null, expirationId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vencimiento no encontrado' });
    }
    
    const updatedExpiration = db.prepare('SELECT * FROM expirations WHERE id = ?').get(expirationId);
    res.json(updatedExpiration);
  } catch (error) {
    console.error('Error al actualizar vencimiento:', error);
    res.status(500).json({ error: 'Error al actualizar vencimiento' });
  }
});

// DELETE /api/expirations/:id - Eliminar vencimiento
router.delete('/expirations/:id', (req, res) => {
  try {
    const expirationId = req.params.id;
    
    // Verificar que el vencimiento exista
    const existingExpiration = db.prepare('SELECT id FROM expirations WHERE id = ?').get(expirationId);
    if (!existingExpiration) {
      return res.status(404).json({ error: 'Vencimiento no encontrado' });
    }

    const stmt = db.prepare('DELETE FROM expirations WHERE id = ?');
    const result = stmt.run(expirationId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vencimiento no encontrado' });
    }
    
    res.json({ message: 'Vencimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar vencimiento:', error);
    res.status(500).json({ error: 'Error al eliminar vencimiento' });
  }
});

module.exports = router;
