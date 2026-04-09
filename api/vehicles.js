const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const router = express.Router();

// Middleware
router.use(cors());
router.use(express.json());

// GET /api/vehicles - Obtener todos los vehículos
router.get('/vehicles', (req, res) => {
  try {
    const vehicles = db.prepare('SELECT * FROM vehicles ORDER BY created_at DESC').all();
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Error al obtener los vehículos' });
  }
});

// GET /api/vehicles/:id - Obtener un vehículo por ID
router.get('/vehicles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Error al obtener el vehículo' });
  }
});

// POST /api/vehicles - Crear un nuevo vehículo
router.post('/vehicles', (req, res) => {
  try {
    const { marca, modelo, patente, año, foto_url } = req.body;
    
    // Validaciones básicas
    if (!marca || !modelo || !patente || !año) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios excepto la foto' });
    }
    
    const añoNum = parseInt(año);
    if (isNaN(añoNum) || añoNum < 1900 || añoNum > new Date().getFullYear() + 1) {
      return res.status(400).json({ error: 'El año debe ser un número válido entre 1900 y ' + (new Date().getFullYear() + 1) });
    }
    
    // Verificar que la patente no exista
    const existingVehicle = db.prepare('SELECT id FROM vehicles WHERE patente = ?').get(patente);
    if (existingVehicle) {
      return res.status(400).json({ error: 'Ya existe un vehículo con esa patente' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO vehicles (marca, modelo, patente, año, foto_url)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(marca, modelo, patente, añoNum, foto_url || null);
    
    const newVehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Error al crear el vehículo' });
  }
});

// PUT /api/vehicles/:id - Actualizar un vehículo
router.put('/vehicles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { marca, modelo, patente, año, foto_url } = req.body;
    
    // Validaciones básicas
    if (!marca || !modelo || !patente || !año) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios excepto la foto' });
    }
    
    const añoNum = parseInt(año);
    if (isNaN(añoNum) || añoNum < 1900 || añoNum > new Date().getFullYear() + 1) {
      return res.status(400).json({ error: 'El año debe ser un número válido entre 1900 y ' + (new Date().getFullYear() + 1) });
    }
    
    // Verificar que el vehículo exista
    const existingVehicle = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(id);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    // Verificar que la patente no exista en otro vehículo
    const patenteCheck = db.prepare('SELECT id FROM vehicles WHERE patente = ? AND id != ?').get(patente, id);
    if (patenteCheck) {
      return res.status(400).json({ error: 'Ya existe otro vehículo con esa patente' });
    }
    
    const stmt = db.prepare(`
      UPDATE vehicles 
      SET marca = ?, modelo = ?, patente = ?, año = ?, foto_url = ?
      WHERE id = ?
    `);
    
    stmt.run(marca, modelo, patente, añoNum, foto_url || null, id);
    
    const updatedVehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Error al actualizar el vehículo' });
  }
});

// DELETE /api/vehicles/:id - Eliminar un vehículo
router.delete('/vehicles/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el vehículo exista
    const existingVehicle = db.prepare('SELECT id FROM vehicles WHERE id = ?').get(id);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
    stmt.run(id);
    
    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Error al eliminar el vehículo' });
  }
});

module.exports = router;
