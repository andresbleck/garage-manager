const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const router = express.Router();

// Middleware
router.use(cors());
router.use(express.json());

// GET /api/vehicles/:vehicleId/repairs - Obtener reparaciones de un vehículo
router.get('/vehicles/:vehicleId/repairs', (req, res) => {
  try {
    const { vehicleId } = req.params;
    const repairs = db.prepare('SELECT * FROM repairs WHERE vehicle_id = ? ORDER BY fecha DESC').all(vehicleId);
    res.json(repairs);
  } catch (error) {
    console.error('Error fetching repairs:', error);
    res.status(500).json({ error: 'Error al obtener las reparaciones' });
  }
});

// POST /api/vehicles/:vehicleId/repairs - Agregar reparación a un vehículo
router.post('/vehicles/:vehicleId/repairs', (req, res) => {
  try {
    const { vehicleId } = req.params;
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
    console.error('Error creating repair:', error);
    res.status(500).json({ error: 'Error al crear la reparación' });
  }
});

// PUT /api/repairs/:id - Actualizar reparación
router.put('/repairs/:id', (req, res) => {
  try {
    const { id } = req.params;
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
    const existingRepair = db.prepare('SELECT id FROM repairs WHERE id = ?').get(id);
    if (!existingRepair) {
      return res.status(404).json({ error: 'Reparación no encontrada' });
    }

    const stmt = db.prepare(`
      UPDATE repairs 
      SET tipo = ?, tipo_personalizado = ?, descripcion = ?, fecha = ?, costo = ?, kilometraje = ?
      WHERE id = ?
    `);
    
    stmt.run(
      tipo, 
      tipo_personalizado || null,
      descripcion, 
      fecha, 
      costo || null, 
      kilometraje || null, 
      id
    );
    
    const updatedRepair = db.prepare('SELECT * FROM repairs WHERE id = ?').get(id);
    res.json(updatedRepair);
  } catch (error) {
    console.error('Error updating repair:', error);
    res.status(500).json({ error: 'Error al actualizar la reparación' });
  }
});

// DELETE /api/repairs/:id - Eliminar reparación
router.delete('/repairs/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la reparación exista
    const existingRepair = db.prepare('SELECT id FROM repairs WHERE id = ?').get(id);
    if (!existingRepair) {
      return res.status(404).json({ error: 'Reparación no encontrada' });
    }
    
    const stmt = db.prepare('DELETE FROM repairs WHERE id = ?');
    stmt.run(id);
    
    res.json({ message: 'Reparación eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting repair:', error);
    res.status(500).json({ error: 'Error al eliminar la reparación' });
  }
});

module.exports = router;
