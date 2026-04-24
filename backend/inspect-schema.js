const db = require('./db/database');
const rows = db.prepare('PRAGMA table_info(vehicles)').all();
console.log(rows);
