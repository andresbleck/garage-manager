const express = require('express');
const { queryOne, queryAll, queryRun } = require('../db/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

async function verifyVehicleFamily(vehicleId, familyId) {
  return queryOne('SELECT id FROM vehicles WHERE id = ? AND family_id = ?', [vehicleId, familyId]);
}

async function verifyRepairFamily(repairId, familyId) {
  return queryOne(
    'SELECT r.id FROM repairs r JOIN vehicles v ON r.vehicle_id = v.id WHERE r.id = ? AND v.family_id = ?',
    [repairId, familyId]
  );
}

const TIPOS_VALIDOS = ['cambio_bateria', 'cambio_aceite', 'cambio_ruedas', 'aire_acondicionado', 'otro'];

router.get('/vehicles/:id/repairs', async (req, res) => {
  try {
    const vehicle = await verifyVehicleFamily(req.params.id, req.user.familyId);
    if (!vehicle) return res.status(404).json({ error: 'Vehículo no encontrado' });

    const repairs = await queryAll(
      'SELECT * FROM repairs WHERE vehicle_id = ? ORDER BY fecha DESC',
      [req.params.id]
    );
    res.json(repairs);
  } catch (error) {
    console.error('Error al obtener reparaciones:', error);
    res.status(500).json({ error: 'Error al obtener reparaciones' });
  }
});

router.post('/vehicles/:id/repairs', async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const { tipo, tipo_personalizado, descripcion, fecha, costo, kilometraje } = req.body;

    if (!tipo || !descripcion || !fecha) {
      return res.status(400).json({ error: 'El tipo, descripción y fecha son obligatorios' });
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de reparación no válido' });
    }
    if (tipo === 'otro' && !tipo_personalizado) {
      return res.status(400).json({ error: 'Cuando el tipo es "Otro", debe especificar el nombre' });
    }

    const vehicle = await verifyVehicleFamily(vehicleId, req.user.familyId);
    if (!vehicle) return res.status(404).json({ error: 'Vehículo no encontrado' });

    const { lastInsertRowid } = await queryRun(
      'INSERT INTO repairs (vehicle_id, tipo, tipo_personalizado, descripcion, fecha, costo, kilometraje) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [vehicleId, tipo, tipo_personalizado || null, descripcion, fecha, costo || null, kilometraje || null]
    );
    const newRepair = await queryOne('SELECT * FROM repairs WHERE id = ?', [lastInsertRowid]);
    res.status(201).json(newRepair);
  } catch (error) {
    console.error('Error al crear reparación:', error);
    res.status(500).json({ error: 'Error al crear reparación' });
  }
});

router.put('/repairs/:id', async (req, res) => {
  try {
    const repairId = req.params.id;
    const { tipo, tipo_personalizado, descripcion, fecha, costo, kilometraje } = req.body;

    if (!tipo || !descripcion || !fecha) {
      return res.status(400).json({ error: 'El tipo, descripción y fecha son obligatorios' });
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de reparación no válido' });
    }
    if (tipo === 'otro' && !tipo_personalizado) {
      return res.status(400).json({ error: 'Cuando el tipo es "Otro", debe especificar el nombre' });
    }

    const existing = await verifyRepairFamily(repairId, req.user.familyId);
    if (!existing) return res.status(404).json({ error: 'Reparación no encontrada' });

    const { rowsAffected } = await queryRun(
      'UPDATE repairs SET tipo = ?, tipo_personalizado = ?, descripcion = ?, fecha = ?, costo = ?, kilometraje = ? WHERE id = ?',
      [tipo, tipo_personalizado || null, descripcion, fecha, costo || null, kilometraje || null, repairId]
    );
    if (rowsAffected === 0) return res.status(404).json({ error: 'Reparación no encontrada' });

    const updated = await queryOne('SELECT * FROM repairs WHERE id = ?', [repairId]);
    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar reparación:', error);
    res.status(500).json({ error: 'Error al actualizar reparación' });
  }
});

router.delete('/repairs/:id', async (req, res) => {
  try {
    const repairId = req.params.id;
    const existing = await verifyRepairFamily(repairId, req.user.familyId);
    if (!existing) return res.status(404).json({ error: 'Reparación no encontrada' });

    const { rowsAffected } = await queryRun('DELETE FROM repairs WHERE id = ?', [repairId]);
    if (rowsAffected === 0) return res.status(404).json({ error: 'Reparación no encontrada' });

    res.json({ message: 'Reparación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reparación:', error);
    res.status(500).json({ error: 'Error al eliminar reparación' });
  }
});

module.exports = router;
