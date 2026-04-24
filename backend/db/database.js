const Database = require('better-sqlite3');
const path = require('path');

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

  console.log('Base de datos inicializada correctamente');
}

function migrateVehiclesPatenteIndex() {
  const indexes = db.prepare("PRAGMA index_list('vehicles')").all();
  const hasGlobalPatenteIndex = indexes.some((index) => {
    if (!index.unique) return false;
    const info = db.prepare(`PRAGMA index_info(${index.name})`).all();
    return info.some((col) => col.name === 'patente');
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
