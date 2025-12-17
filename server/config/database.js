const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper to create a MySQL pool based on a given environment variable prefix
function createPool(prefix) {
  const host = process.env[`${prefix}HOST`];
  const port = parseInt(process.env[`${prefix}PORT`]) || 3306;
  const user = process.env[`${prefix}USER`];
  const password = process.env[`${prefix}PASSWORD`];
  const database = process.env[`${prefix}NAME`];
  const sslEnabled = process.env[`${prefix}SSL`] === 'true' || (host && host.includes('tidbcloud.com'));

  return mysql.createPool({
    host: host || '127.0.0.1',
    port,
    user: user || 'root',
    password: password || '',
    database: database || 'catprep_tracker',
    ssl: sslEnabled ? { rejectUnauthorized: true } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

// Export pools for online (production) and offline (development) environments
const onlinePool = createPool('ONLINE_DB_');
const offlinePool = createPool('DB_');
// Default pool used by existing code (fallback to offline)
const pool = offlinePool;




// Test connection helper – accepts a pool (defaults to the default pool)
async function testConnection(p = pool) {
  try {
    const conn = await p.getConnection();
    console.log('✅ Database connected successfully!');
    await conn.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw err;
  }
}

// Config objects for migration scripts (no pool, just config)
const offlineConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'catprep_tracker'
};

const onlineConfig = {
  host: process.env.ONLINE_DB_HOST,
  port: parseInt(process.env.ONLINE_DB_PORT) || 4000,
  user: process.env.ONLINE_DB_USER,
  password: process.env.ONLINE_DB_PASSWORD,
  database: process.env.ONLINE_DB_NAME,
  ssl: { rejectUnauthorized: true }
};

module.exports = { onlinePool, offlinePool, pool, testConnection, offlineConfig, onlineConfig };
