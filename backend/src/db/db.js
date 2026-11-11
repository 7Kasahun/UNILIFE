import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const sqliteFilePath = path.join(dataDir, 'unilife.sqlite');

let dbClient = process.env.DB_CLIENT || (process.env.DB_HOST ? 'mysql' : 'sqlite');
let mysqlPool = null;
let sqliteDb = null;
let sqlJsInstance = null;

// Helper to save sqlite db to disk
function persistSqlite() {
  if (sqliteDb && sqliteFilePath) {
    try {
      const data = sqliteDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(sqliteFilePath, buffer);
    } catch (err) {
      console.error('Failed to persist SQLite database:', err);
    }
  }
}

// Convert MySQL placeholders (?) to SQLite or vice-versa
// Both support ? for positional parameters.

export async function initDatabase() {
  if (dbClient === 'mysql') {
    try {
      mysqlPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'unilife_ethiopia',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
      });
      // Test connection
      await mysqlPool.query('SELECT 1');
      console.log(' [DB] Connected successfully to MySQL database:', process.env.DB_NAME || 'unilife_ethiopia');
      return { client: 'mysql' };
    } catch (mysqlErr) {
      console.warn(' [DB] MySQL connection failed. Falling back to SQLite (sql.js WASM):', mysqlErr.message);
      dbClient = 'sqlite';
    }
  }

  // SQLite fallback using sql.js
  sqlJsInstance = await initSqlJs();
  if (fs.existsSync(sqliteFilePath)) {
    const fileBuffer = fs.readFileSync(sqliteFilePath);
    sqliteDb = new sqlJsInstance.Database(fileBuffer);
    console.log(' [DB] Loaded existing SQLite database from:', sqliteFilePath);
  } else {
    sqliteDb = new sqlJsInstance.Database();
    console.log(' [DB] Initialized fresh SQLite database at:', sqliteFilePath);
  }

  return { client: 'sqlite' };
}

export async function query(sql, params = []) {
  if (dbClient === 'mysql' && mysqlPool) {
    const [rows] = await mysqlPool.query(sql, params);
    return rows;
  }

  if (!sqliteDb) {
    await initDatabase();
  }

  try {
    const stmt = sqliteDb.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (err) {
    console.error('Database query error:', err.message, '\nSQL:', sql, '\nParams:', params);
    throw err;
  }
}

export async function getOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function run(sql, params = []) {
  if (dbClient === 'mysql' && mysqlPool) {
    const [result] = await mysqlPool.execute(sql, params);
    return {
      lastInsertId: result.insertId,
      changes: result.affectedRows
    };
  }

  if (!sqliteDb) {
    await initDatabase();
  }

  try {
    sqliteDb.run(sql, params);
    const lastIdRes = sqliteDb.exec('SELECT last_insert_rowid() as id');
    const lastInsertId = (lastIdRes[0] && lastIdRes[0].values[0] && lastIdRes[0].values[0][0]) || null;
    const changesRes = sqliteDb.exec('SELECT changes() as c');
    const changes = (changesRes[0] && changesRes[0].values[0] && changesRes[0].values[0][0]) || 0;

    persistSqlite();
    return { lastInsertId, changes };
  } catch (err) {
    console.error('Database run error:', err.message, '\nSQL:', sql, '\nParams:', params);
    throw err;
  }
}

export async function exec(sqlScript) {
  if (dbClient === 'mysql' && mysqlPool) {
    const [result] = await mysqlPool.query(sqlScript);
    return result;
  }

  if (!sqliteDb) {
    await initDatabase();
  }

  sqliteDb.run(sqlScript);
  persistSqlite();
}

export async function transaction(fn) {
  if (dbClient === 'mysql' && mysqlPool) {
    const connection = await mysqlPool.getConnection();
    await connection.beginTransaction();
    try {
      const result = await fn(connection);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // SQLite transaction
  await run('BEGIN TRANSACTION');
  try {
    const result = await fn();
    await run('COMMIT');
    persistSqlite();
    return result;
  } catch (err) {
    await run('ROLLBACK');
    throw err;
  }
}

export function getClientType() {
  return dbClient;
}
