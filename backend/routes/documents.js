const express = require('express');
const { queryOne, queryAll, queryRun } = require('../db/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/documents/counts', async (req, res) => {
  try {
    const rows = await queryAll(
      'SELECT vehicle_id, COUNT(*) as count FROM documents WHERE family_id = ? GROUP BY vehicle_id',
      [req.user.familyId]
    );
    const counts = {};
    rows.forEach((row) => {
      counts[row.vehicle_id] = Number(row.count);
    });
    res.json(counts);
  } catch (error) {
    console.error('Error al obtener conteo de documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

router.get('/vehicles/:id/documents', async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const vehicle = await queryOne(
      'SELECT id FROM vehicles WHERE id = ? AND family_id = ?',
      [vehicleId, req.user.familyId]
    );
    if (!vehicle) return res.status(404).json({ error: 'Vehículo no encontrado' });

    const docs = await queryAll(
      'SELECT id, vehicle_id, name, type, uploaded_at FROM documents WHERE vehicle_id = ? AND family_id = ? ORDER BY uploaded_at DESC',
      [vehicleId, req.user.familyId]
    );
    res.json(docs);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

router.post('/vehicles/:id/documents', async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const { name, type, data } = req.body;

    if (!name || !type || !data) {
      return res.status(400).json({ error: 'Nombre, tipo y datos son requeridos' });
    }

    const vehicle = await queryOne(
      'SELECT id FROM vehicles WHERE id = ? AND family_id = ?',
      [vehicleId, req.user.familyId]
    );
    if (!vehicle) return res.status(404).json({ error: 'Vehículo no encontrado' });

    const base64Data = data.includes(',') ? data.split(',')[1] : data;

    const { lastInsertRowid } = await queryRun(
      'INSERT INTO documents (vehicle_id, family_id, name, type, data, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)',
      [vehicleId, req.user.familyId, name, type, base64Data, new Date().toISOString()]
    );
    const newDoc = await queryOne(
      'SELECT id, vehicle_id, name, type, uploaded_at FROM documents WHERE id = ?',
      [lastInsertRowid]
    );
    res.status(201).json(newDoc);
  } catch (error) {
    console.error('Error al subir documento:', error);
    res.status(500).json({ error: 'Error al subir documento' });
  }
});

router.get('/documents/:id/view', async (req, res) => {
  try {
    const doc = await queryOne(
      'SELECT * FROM documents WHERE id = ? AND family_id = ?',
      [req.params.id, req.user.familyId]
    );
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    const buffer = Buffer.from(doc.data, 'base64');
    res.setHeader('Content-Type', doc.type);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.name)}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('Error al servir documento:', error);
    res.status(500).json({ error: 'Error al obtener documento' });
  }
});

router.delete('/documents/:id', async (req, res) => {
  try {
    const doc = await queryOne(
      'SELECT id FROM documents WHERE id = ? AND family_id = ?',
      [req.params.id, req.user.familyId]
    );
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    await queryRun('DELETE FROM documents WHERE id = ?', [req.params.id]);
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
});

module.exports = router;
