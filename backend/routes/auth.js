const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db/database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'garage-manager-secret';
const TOKEN_EXPIRATION = '8h';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return derived === hash;
}

function signToken(user, family) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      familyId: family.id,
      familyName: family.name,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );
}

router.post('/register', (req, res) => {
  const { familyName, displayName, email, password, confirmPassword } = req.body;

  if (!familyName || !displayName || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'El email no es válido' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ error: 'El email ya está registrado' });
  }

  const existingFamily = db.prepare('SELECT id FROM families WHERE name = ?').get(familyName);
  if (existingFamily) {
    return res.status(400).json({ error: 'El nombre de familia ya existe' });
  }

  const familyResult = db.prepare('INSERT INTO families (name, created_at) VALUES (?, ?)').run(
    familyName,
    new Date().toISOString()
  );

  const passwordHash = hashPassword(password);
  const userResult = db
    .prepare(
      'INSERT INTO users (family_id, email, password_hash, display_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(familyResult.lastInsertRowid, email.toLowerCase(), passwordHash, displayName, 'admin', new Date().toISOString());

  const user = db
    .prepare('SELECT id, email, display_name, role FROM users WHERE id = ?')
    .get(userResult.lastInsertRowid);

  const family = db.prepare('SELECT id, name FROM families WHERE id = ?').get(familyResult.lastInsertRowid);
  const token = signToken(user, family);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      familyName: family.name,
      familyId: family.id,
    },
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'El email y la contraseña son obligatorios' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const family = db.prepare('SELECT id, name FROM families WHERE id = ?').get(user.family_id);
  const token = signToken(user, family);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      familyName: family.name,
      familyId: family.id,
    },
  });
});

module.exports = router;
