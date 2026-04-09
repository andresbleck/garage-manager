const express = require('express');
const db = require('../db/database');
const router = express.Router();

// GET /api/vehicles/:id/repairs - Listar reparaciones de un vehículo
router.get('/vehicles/:id/repairs', (req, res) => {
  try {
    const vehicleId = req.params.id;
    
    // Verificar que el vehículo exista
    const vehicle = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const repairs = db.prepare(`
      SELECT * FROM repairs 
      WHERE vehicle_id = ? 
      ORDER BY fecha DESC
    `).all(vehicleId);
    
    res.json(repairs);
  } catch (error) {
    console.error('Error al obtener reparaciones:', error);
    res.status(500).json({ error: 'Error al obtener reparaciones' });
  }
});

// POST /api/vehicles/:id/repairs - Agregar reparación a un vehículo
router.post('/vehicles/:id/repairs', (req, res) => {
  try {
    const vehicleId = req.params.id;
    const { tipo, tipo_personalizado, descripcion, fecha, costo, kilometraje } = req.body;
    
    // Validaciones básicas
    if (!tipo || !descripcion || !fecha) {
      return res.status(400).json({ error: 'El tipo, descripción y fecha son obligatorios' });
    }

    // Validar tipo de reparación
    const tiposValidos = ['cambio_bateria', 'cambio_aceite', 'cambio_ruedas', 'aire_acondicionado', 'otro'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de reparación no válido' });
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
      INSERT INTO repairs (vehicle_id, tipo, tipo_personalizado, descripcion, fecha, costo, kilometraje)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      vehicleId, 
      tipo, 
      tipo_personalizado || null,
      descripcion, 
      fecha, 
      costo || null, 
      kilometraje || null
    );
    
    const newRepair = db.prepare('SELECT * FROM repairs WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newRepair);
  } catch (error) {
    console.error('Error al crear reparación:', error);
    res.status(500).json({ error: 'Error al crear reparación' });
  }
});

// PUT /api/repairs/:id - Editar reparación
router.put('/repairs/:id', (req, res) => {
  try {
    const repairId = req.params.id;
    const { tipo, tipo_personalizado, descripcion, fecha, costo, kilometraje } = req.body;
    
    // Validaciones básicas
    if (!tipo || !descripcion || !fecha) {
      return res.status(400).json({ error: 'El tipo, descripción y fecha son obligatorios' });
    }

    // Validar tipo de reparación
    const tiposValidos = ['cambio_bateria', 'cambio_aceite', 'cambio_ruedas', 'aire_acondicionado', 'otro'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de reparación no válido' });
    }

    // Si el tipo es 'otro', se requiere el tipo personalizado
    if (tipo === 'otro' && !tipo_personalizado) {
      return res.status(400).json({ error: 'Cuando el tipo es "Otro", debe especificar el nombre' });
    }

    // Verificar que la reparación exista
    const existingRepair = db.prepare('SELECT id FROM repairs WHERE id = ?').get(repairId);
    if (!existingRepair) {
      return res.status(404).json({ error: 'Reparación no encontrada' });
    }

    const stmt = db.prepare(`
      UPDATE repairs 
      SET tipo = ?, tipo_personalizado = ?, descripcion = ?, fecha = ?, costo = ?, kilometraje = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(
      tipo, 
      tipo_personalizado || null,
      descripcion, 
      fecha, 
      costo || null, 
      kilometraje || null, 
      repairId
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reparación no encontrada' });
    }
    
    const updatedRepair = db.prepare('SELECT * FROM repairs WHERE id = ?').get(repairId);
    res.json(updatedRepair);
  } catch (error) {
    console.error('Error al actualizar reparación:', error);
    res.status(500).json({ error: 'Error al actualizar reparación' });
  }
});

// DELETE /api/repairs/:id - Eliminar reparación
router.delete('/repairs/:id', (req, res) => {
  try {
    const repairId = req.params.id;
    
    // Verificar que la reparación exista
    const existingRepair = db.prepare('SELECT id FROM repairs WHERE id = ?').get(repairId);
    if (!existingRepair) {
      return res.status(404).json({ error: 'Reparación no encontrada' });
    }

    const stmt = db.prepare('DELETE FROM repairs WHERE id = ?');
    const result = stmt.run(repairId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reparación no encontrada' });
    }
    
    res.json({ message: 'Reparación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reparación:', error);
    res.status(500).json({ error: 'Error al eliminar reparación' });
  }
});

module.exports = router;
