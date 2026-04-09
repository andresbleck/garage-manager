const express = require('express');
const db = require('../db/database');
const router = express.Router();

// GET /api/vehicles - Listar todos los vehículos
router.get('/', (req, res) => {
  try {
    const vehicles = db.prepare('SELECT * FROM vehicles ORDER BY marca, modelo').all();
    res.json(vehicles);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
});

// GET /api/vehicles/:id - Obtener un vehículo específico
router.get('/:id', (req, res) => {
  try {
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    res.status(500).json({ error: 'Error al obtener vehículo' });
  }
});

// POST /api/vehicles - Crear nuevo vehículo
router.post('/', (req, res) => {
  try {
    const { marca, modelo, patente, año, foto_url } = req.body;
    
    // Validaciones básicas
    if (!marca || !modelo || !patente || !año) {
      return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
    }

    // Verificar que la patente no exista
    const existingVehicle = db.prepare('SELECT id FROM vehicles WHERE patente = ?').get(patente);
    if (existingVehicle) {
      return res.status(400).json({ error: 'La patente ya existe' });
    }

    const stmt = db.prepare(`
      INSERT INTO vehicles (marca, modelo, patente, año, foto_url)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(marca, modelo, patente, año, foto_url || null);
    
    const newVehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    res.status(500).json({ error: 'Error al crear vehículo' });
  }
});

// PUT /api/vehicles/:id - Editar vehículo
router.put('/:id', (req, res) => {
  try {
    const { marca, modelo, patente, año, foto_url } = req.body;
    const vehicleId = req.params.id;
    
    // Validaciones básicas
    if (!marca || !modelo || !patente || !año) {
      return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
    }

    // Verificar que el vehículo exista
    const existingVehicle = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    // Verificar que la patente no exista en otro vehículo
    const patenteCheck = db.prepare('SELECT id FROM vehicles WHERE patente = ? AND id != ?').get(patente, vehicleId);
    if (patenteCheck) {
      return res.status(400).json({ error: 'La patente ya existe en otro vehículo' });
    }

    const stmt = db.prepare(`
      UPDATE vehicles 
      SET marca = ?, modelo = ?, patente = ?, año = ?, foto_url = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(marca, modelo, patente, año, foto_url || null, vehicleId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    const updatedVehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ error: 'Error al actualizar vehículo' });
  }
});

// DELETE /api/vehicles/:id - Eliminar vehículo
router.delete('/:id', (req, res) => {
  try {
    const vehicleId = req.params.id;
    
    // Verificar que el vehículo exista
    const existingVehicle = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(vehicleId);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
    const result = stmt.run(vehicleId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ error: 'Error al eliminar vehículo' });
  }
});

module.exports = router;
