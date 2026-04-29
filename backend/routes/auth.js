const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { queryOne, queryRun } = require('../db/database');
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

router.post('/register', async (req, res) => {
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

  try {
    const existingEmail = await queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingEmail) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const existingFamily = await queryOne('SELECT id FROM families WHERE name = ?', [familyName]);
    if (existingFamily) {
      return res.status(400).json({ error: 'El nombre de familia ya existe' });
    }

    const { lastInsertRowid: familyId } = await queryRun(
      'INSERT INTO families (name, created_at) VALUES (?, ?)',
      [familyName, new Date().toISOString()]
    );

    const passwordHash = hashPassword(password);
    const { lastInsertRowid: userId } = await queryRun(
      'INSERT INTO users (family_id, email, password_hash, display_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [familyId, email.toLowerCase(), passwordHash, displayName, 'admin', new Date().toISOString()]
    );

    const user = await queryOne('SELECT id, email, display_name, role FROM users WHERE id = ?', [userId]);
    const family = await queryOne('SELECT id, name FROM families WHERE id = ?', [familyId]);
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
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al crear la cuenta' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'El email y la contraseña son obligatorios' });
  }

  try {
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const family = await queryOne('SELECT id, name FROM families WHERE id = ?', [user.family_id]);
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
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;
