const express = require('express');
const { queryOne, queryAll, queryRun } = require('../db/database');
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

router.get('/', async (req, res) => {
  try {
    const familyId = requireFamilyId(req, res);
    if (!familyId) return;

    const vehicles = await queryAll(
      'SELECT * FROM vehicles WHERE family_id = ? ORDER BY marca, modelo',
      [familyId]
    );
    res.json(vehicles);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const familyId = requireFamilyId(req, res);
    if (!familyId) return;

    const vehicle = await queryOne(
      'SELECT * FROM vehicles WHERE id = ? AND family_id = ?',
      [req.params.id, familyId]
    );
    if (!vehicle) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(vehicle);
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    res.status(500).json({ error: 'Error al obtener vehículo' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { marca, modelo, patente, año, foto_url } = req.body;

    if (!marca || !modelo || !patente || !año) {
      return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
    }

    const familyId = requireFamilyId(req, res);
    if (!familyId) return;

    const existing = await queryOne(
      'SELECT id FROM vehicles WHERE patente = ? AND family_id = ?',
      [patente, familyId]
    );
    if (existing) return res.status(400).json({ error: 'La patente ya existe en tu familia' });

    const { lastInsertRowid } = await queryRun(
      'INSERT INTO vehicles (marca, modelo, patente, año, foto_url, family_id) VALUES (?, ?, ?, ?, ?, ?)',
      [marca, modelo, patente, año, foto_url || null, familyId]
    );
    const newVehicle = await queryOne('SELECT * FROM vehicles WHERE id = ?', [lastInsertRowid]);
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    res.status(500).json({ error: 'Error al crear vehículo' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { marca, modelo, patente, año, foto_url } = req.body;
    const vehicleId = req.params.id;

    if (!marca || !modelo || !patente || !año) {
      return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
    }

    const familyId = requireFamilyId(req, res);
    if (!familyId) return;

    const existing = await queryOne(
      'SELECT id FROM vehicles WHERE id = ? AND family_id = ?',
      [vehicleId, familyId]
    );
    if (!existing) return res.status(404).json({ error: 'Vehículo no encontrado' });

    const patenteCheck = await queryOne(
      'SELECT id FROM vehicles WHERE patente = ? AND id != ? AND family_id = ?',
      [patente, vehicleId, familyId]
    );
    if (patenteCheck) return res.status(400).json({ error: 'La patente ya existe en tu familia' });

    const { rowsAffected } = await queryRun(
      'UPDATE vehicles SET marca = ?, modelo = ?, patente = ?, año = ?, foto_url = ? WHERE id = ? AND family_id = ?',
      [marca, modelo, patente, año, foto_url || null, vehicleId, familyId]
    );
    if (rowsAffected === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });

    const updated = await queryOne('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ error: 'Error al actualizar vehículo' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const familyId = requireFamilyId(req, res);
    if (!familyId) return;

    const existing = await queryOne(
      'SELECT id FROM vehicles WHERE id = ? AND family_id = ?',
      [vehicleId, familyId]
    );
    if (!existing) return res.status(404).json({ error: 'Vehículo no encontrado' });

    const { rowsAffected } = await queryRun(
      'DELETE FROM vehicles WHERE id = ? AND family_id = ?',
      [vehicleId, familyId]
    );
    if (rowsAffected === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });

    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ error: 'Error al eliminar vehículo' });
  }
});

module.exports = router;
