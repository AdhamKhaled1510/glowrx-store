const { createClient } = require('@libsql/client');

const TURSO_URL = process.env.TURSO_DB_URL || 'libsql://glowrx-db-adhamkhaled15.aws-us-east-2.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI2MjAxNDQsImlkIjoiMDE5ZjBjNzAtNGUwMS03ZDcwLWFjZDEtYmQ4N2FjYTY3OWFiIiwicmlkIjoiNGYyMzQ5MGItYTY5ZC00Mzc3LWE5YTAtNzVkMjhkZjY5ZDA5In0.60D30vyE42AA_XzuBpx7RQqVS_5n_v1YQbd_uOr3TF_esaCp5NPggUdWjJzF3SYAElRBBhgm-K1rTDAAslX5AA';

let db = null;
let ready = false;

async function initDb() {
  if (ready) return;
  db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  await db.execute('PRAGMA foreign_keys = ON');
  await db.execute(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, phone TEXT, address TEXT, role TEXT DEFAULT 'customer', google_id TEXT, email_verified INTEGER DEFAULT 0, verification_code TEXT, verification_expires_at TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT NOT NULL, name_en TEXT NOT NULL, image TEXT)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT NOT NULL, name_en TEXT NOT NULL, description_ar TEXT, description_en TEXT, price REAL NOT NULL, images TEXT DEFAULT '[]', stock INTEGER DEFAULT 0, category_id INTEGER REFERENCES categories(id), featured INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), items TEXT NOT NULL, total REAL NOT NULL, status TEXT DEFAULT 'pending', payment_method TEXT NOT NULL, payment_status TEXT DEFAULT 'pending', shipping_address TEXT, phone TEXT, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, discount_percent REAL NOT NULL DEFAULT 0, max_uses INTEGER DEFAULT 0, used_count INTEGER DEFAULT 0, min_order REAL DEFAULT 0, is_active INTEGER DEFAULT 1, expires_at TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  ready = true;
}

async function dbAll(sql, params = []) {
  const rs = await db.execute({ sql, args: params.map(p => p === undefined ? null : p) });
  return rs.rows;
}

async function dbGet(sql, params = []) {
  const rows = await dbAll(sql, params);
  return rows[0] || null;
}

async function dbRun(sql, params = []) {
  const rs = await db.execute({ sql, args: params.map(p => p === undefined ? null : p) });
  return { lastInsertRowid: rs.lastInsertRowid };
}

module.exports = { initDb, dbAll, dbGet, dbRun };
