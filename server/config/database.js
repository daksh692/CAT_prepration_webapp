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
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'catprep_tracker',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 5
};

// Explicit online config for migration scripts
const onlineConfig = {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'oCyrDjqb6U8VJzA.root',
    password: 'bKih61o1qxYQOVlr',
    database: 'catprep_production',
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
