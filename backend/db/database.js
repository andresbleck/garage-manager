const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

// Crear la base de datos en la carpeta db
const dbPath = path.join(__dirname, 'garage.db');
const db = new Database(dbPath);

// Crear tablas si no existen
function inicializarBaseDeDatos() {
  // Tabla families
  db.exec(`
    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Tabla users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'member')) DEFAULT 'member',
      created_at TEXT NOT NULL,
      FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE
    )
  `);

  // Tabla vehicles
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      patente TEXT NOT NULL,
      año INTEGER NOT NULL,
      foto_url TEXT,
      family_id INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE
    )
  `);

  // Tabla expirations
  db.exec(`
    CREATE TABLE IF NOT EXISTS expirations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('seguro', 'vtv', 'matafuegos', 'otro')),
      tipo_personalizado TEXT,
      fecha_vencimiento TEXT NOT NULL,
      observaciones TEXT,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
    )
  `);

  // Tabla repairs
  db.exec(`
    CREATE TABLE IF NOT EXISTS repairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('cambio_bateria', 'cambio_aceite', 'cambio_ruedas', 'aire_acondicionado', 'otro')),
      tipo_personalizado TEXT,
      descripcion TEXT NOT NULL,
      fecha TEXT NOT NULL,
      costo REAL,
      kilometraje INTEGER,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
    )
  `);

  migrateColumn('vehicles', 'family_id', 'INTEGER DEFAULT 1');

  migrateVehiclesPatenteIndex();

  ensureDefaultFamily();
  db.exec('UPDATE vehicles SET family_id = 1 WHERE family_id IS NULL');

  migrateColumn('expirations', 'tipo_personalizado', 'TEXT');
  migrateColumn('repairs', 'tipo_personalizado', 'TEXT');

  migrateExpirationsFK();
  migrateRepairsFK();

  ensureTestUser();

  console.log('Base de datos inicializada correctamente');
}

function migrateVehiclesPatenteIndex() {
  const indexes = db.prepare("PRAGMA index_list('vehicles')").all();
  const hasGlobalPatenteIndex = indexes.some((index) => {
    if (!index.unique) return false;
    const info = db.prepare(`PRAGMA index_info(${index.name})`).all();
    // Solo migrar si es un índice de una sola columna sobre 'patente' (el antiguo estilo)
    return info.length === 1 && info[0].name === 'patente';
  });

  if (!hasGlobalPatenteIndex) {
    return;
  }

  console.log('Migrando índice único de patente en vehicles a nivel familia');
  db.exec('ALTER TABLE vehicles RENAME TO vehicles_old');

  db.exec(`
    CREATE TABLE vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      patente TEXT NOT NULL,
      año INTEGER NOT NULL,
      foto_url TEXT,
      family_id INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    INSERT INTO vehicles (id, marca, modelo, patente, año, foto_url, family_id)
    SELECT id, marca, modelo, patente, año, foto_url, family_id FROM vehicles_old
  `);

  db.exec('DROP TABLE vehicles_old');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_family_patente ON vehicles(family_id, patente)');
}


function ensureDefaultFamily() {
  const familyExists = db.prepare('SELECT id FROM families ORDER BY id LIMIT 1').get();
  if (!familyExists) {
    db.prepare('INSERT INTO families (name, created_at) VALUES (?, ?)').run('Familia', new Date().toISOString());
  }
}


function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function ensureTestUser() {
  const testEmail = 'admingarage@gmail.com';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(testEmail);
  if (existing) return;

  let family = db.prepare("SELECT id FROM families WHERE name = 'Demo'").get();
  if (!family) {
    const result = db
      .prepare('INSERT INTO families (name, created_at) VALUES (?, ?)')
      .run('Demo', new Date().toISOString());
    family = { id: result.lastInsertRowid };
  }

  const passwordHash = hashPassword('GarageManager');
  db.prepare(
    'INSERT INTO users (family_id, email, password_hash, display_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(family.id, testEmail, passwordHash, 'Admin Demo', 'admin', new Date().toISOString());

  console.log('Usuario de prueba creado: admingarage@gmail.com');
}

function migrateExpirationsFK() {
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='expirations'").get();
  if (!schema || !schema.sql.includes('vehicles_old')) return;

  console.log('Migrando FK de expirations: apuntando a vehicles...');
  db.exec('ALTER TABLE expirations RENAME TO expirations_old');
  db.exec(`
    CREATE TABLE expirations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('seguro', 'vtv', 'matafuegos', 'otro')),
      tipo_personalizado TEXT,
      fecha_vencimiento TEXT NOT NULL,
      observaciones TEXT,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
    )
  `);
  db.exec(`
    INSERT INTO expirations (id, vehicle_id, tipo, tipo_personalizado, fecha_vencimiento, observaciones)
    SELECT id, vehicle_id, tipo, tipo_personalizado, fecha_vencimiento, observaciones FROM expirations_old
  `);
  db.exec('DROP TABLE expirations_old');
  console.log('Migración expirations FK completada');
}

function migrateRepairsFK() {
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='repairs'").get();
  if (!schema || !schema.sql.includes('vehicles_old')) return;

  console.log('Migrando FK de repairs: apuntando a vehicles...');
  db.exec('ALTER TABLE repairs RENAME TO repairs_old');
  db.exec(`
    CREATE TABLE repairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('cambio_bateria', 'cambio_aceite', 'cambio_ruedas', 'aire_acondicionado', 'otro')),
      tipo_personalizado TEXT,
      descripcion TEXT NOT NULL,
      fecha TEXT NOT NULL,
      costo REAL,
      kilometraje INTEGER,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
    )
  `);
  db.exec(`
    INSERT INTO repairs (id, vehicle_id, tipo, tipo_personalizado, descripcion, fecha, costo, kilometraje)
    SELECT id, vehicle_id, tipo, tipo_personalizado, descripcion, fecha, costo, kilometraje FROM repairs_old
  `);
  db.exec('DROP TABLE repairs_old');
  console.log('Migración repairs FK completada');
}

function migrateColumn(table, column, type) {
  const columnInfo = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columnInfo.some((col) => col.name === column);
  if (!exists) {
    console.log(`Migrando tabla ${table}: agregando columna ${column}`);
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

// Inicializar la base de datos
inicializarBaseDeDatos();

module.exports = db;
