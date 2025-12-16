const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'catprep_tracker',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Explicit offline config for migration scripts
const offlineConfig = {
    host: process.env.OFFLINE_DB_HOST || '127.0.0.1',
    user: process.env.OFFLINE_DB_USER || 'root',
    password: process.env.OFFLINE_DB_PASSWORD || '',
    database: process.env.OFFLINE_DB_NAME || 'catprep_tracker',
    port: parseInt(process.env.OFFLINE_DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 5
};

// Explicit online config for migration scripts
const onlineConfig = {
    host: process.env.ONLINE_DB_HOST,
    port: parseInt(process.env.ONLINE_DB_PORT) || 4000,
    user: process.env.ONLINE_DB_USER,
    password: process.env.ONLINE_DB_PASSWORD,
    database: process.env.ONLINE_DB_NAME,
    ssl: { rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 5
};

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        // Don't exit process in dev mode to allow diagnosing authentication issues
        if (process.env.NODE_ENV === 'production') {
             // console.error('   Exiting...'); 
             // process.exit(1); 
        }
    }
}

module.exports = { pool, testConnection, offlineConfig, onlineConfig };
