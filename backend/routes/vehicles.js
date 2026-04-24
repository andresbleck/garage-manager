const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

function requireFamilyId(req, res) {
  const familyId = req.user?.familyId;
  if (!familyId) {
    res.status(401).json({ error: 'No autorizado' });
    return null;
  }
  return familyId;
}

// GET /api/vehicles - Listar vehículos de la familia
router.get('/', (req, res) => {
  try {
    const familyId = requireFamilyId(req, res);
    if (!familyId) return;

    const vehicles = db
      .prepare('SELECT * FROM vehicles WHERE family_id = ? ORDER BY marca, modelo')
      .all(familyId);
    res.json(vehicles);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
});

// GET /api/vehicles/:id - Obtener un vehículo específico
router.get('/:id', (req, res) => {
  try {
    const familyId = requireFamilyId(req, res);
    if (!familyId) return;

    const vehicle = db
      .prepare('SELECT * FROM vehicles WHERE id = ? AND family_id = ?')
      .get(req.params.id, familyId);

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

    if (!marca || !modelo || !patente || !año) {
      return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
    }

    const familyId = requireFamilyId(req, res);
    if (!familyId) return;

    const existingVehicle = db
      .prepare('SELECT id FROM vehicles WHERE patente = ? AND family_id = ?')
      .get(patente, familyId);
    if (existingVehicle) {
      return res.status(400).json({ error: 'La patente ya existe en tu familia' });
    }

    const stmt = db.prepare(`
      INSERT INTO vehicles (marca, modelo, patente, año, foto_url, family_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(marca, modelo, patente, año, foto_url || null, familyId);
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

    if (!marca || !modelo || !patente || !año) {
      return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
    }

    const familyId = requireFamilyId(req, res);
    if (!familyId) return;

    const existingVehicle = db
      .prepare('SELECT id FROM vehicles WHERE id = ? AND family_id = ?')
      .get(vehicleId, familyId);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const patenteCheck = db
      .prepare('SELECT id FROM vehicles WHERE patente = ? AND id != ? AND family_id = ?')
      .get(patente, vehicleId, familyId);
    if (patenteCheck) {
      return res.status(400).json({ error: 'La patente ya existe en tu familia' });
    }

    const stmt = db.prepare(`
      UPDATE vehicles 
      SET marca = ?, modelo = ?, patente = ?, año = ?, foto_url = ?
      WHERE id = ? AND family_id = ?
    `);

    const result = stmt.run(marca, modelo, patente, año, foto_url || null, vehicleId, familyId);

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

    const familyId = requireFamilyId(req, res);
    if (!familyId) return;

    const existingVehicle = db
      .prepare('SELECT id FROM vehicles WHERE id = ? AND family_id = ?')
      .get(vehicleId, familyId);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const stmt = db.prepare('DELETE FROM vehicles WHERE id = ? AND family_id = ?');
    const result = stmt.run(vehicleId, familyId);

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
