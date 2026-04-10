const Database = require('better-sqlite3');
const path = require('path');

// Crear la base de datos en la carpeta db
const dbPath = path.join(__dirname, 'garage.db');
const db = new Database(dbPath);

// Crear tablas si no existen
function inicializarBaseDeDatos() {
  // Tabla vehicles
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      patente TEXT UNIQUE NOT NULL,
      año INTEGER NOT NULL,
      foto_url TEXT
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

  migrateColumn('expirations', 'tipo_personalizado', 'TEXT');
  migrateColumn('repairs', 'tipo_personalizado', 'TEXT');

  console.log('Base de datos inicializada correctamente');
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
