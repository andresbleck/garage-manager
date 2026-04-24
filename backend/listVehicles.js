const db = require('./db/database');
const vehicles = db.prepare('SELECT id, marca, modelo, patente, año, family_id FROM vehicles').all();
console.log(JSON.stringify(vehicles, null, 2));
