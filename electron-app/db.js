const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'data.sqlite');

let SQL;
let db;

function rowsToObjects(result) {
  if (!result || result.length === 0) return [];
  const r = result[0];
  return r.values.map(row => {
    const obj = {};
    r.columns.forEach((c, i) => { obj[c] = row[i]; });
    return obj;
  });
}

async function init() {
  SQL = await initSqlJs({ locateFile: file => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file) });
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH);
    db = new SQL.Database(new Uint8Array(data));
  } else {
    db = new SQL.Database();
    db.run(`CREATE TABLE collections (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);`);
    db.run(`CREATE TABLE objects (id INTEGER PRIMARY KEY AUTOINCREMENT, collection_id INTEGER NOT NULL, name TEXT, description TEXT, category TEXT, created_at TEXT);`);
    persist();
  }
}

function persist() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getCollections() {
  const res = db.exec(`SELECT c.id, c.name, COUNT(o.id) AS count, MIN(o.created_at) AS created_at, MAX(o.created_at) AS updated_at\n    FROM collections c\n    LEFT JOIN objects o ON o.collection_id = c.id\n    GROUP BY c.id\n    ORDER BY c.id DESC;`);
  return rowsToObjects(res);
}

function createCollection(name) {
  db.run('INSERT INTO collections (name) VALUES (?);', [name]);
  const res = db.exec('SELECT last_insert_rowid() as id;');
  const id = rowsToObjects(res)[0].id;
  persist();
  return { id, name };
}

function getObjects(collectionId) {
  const res = db.exec('SELECT * FROM objects WHERE collection_id = ' + Number(collectionId) + ' ORDER BY id DESC;');
  return rowsToObjects(res);
}

function createObject(obj) {
  const now = new Date().toISOString();
  db.run('INSERT INTO objects (collection_id, name, description, category, created_at) VALUES (?, ?, ?, ?, ?);', [obj.collection_id, obj.name || null, obj.description || null, obj.category || null, now]);
  const res = db.exec('SELECT last_insert_rowid() as id;');
  const id = rowsToObjects(res)[0].id;
  persist();
  return Object.assign({ id }, obj, { created_at: now });
}

function deleteObject(id) {
  db.run('DELETE FROM objects WHERE id = ?;', [id]);
  persist();
  return { changes: 1 };
}

module.exports = { init, getCollections, createCollection, getObjects, createObject, deleteObject };
