import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    // 1. Check Environment Variables (Safely)
    const envStatus = {
        TIDB_HOST: process.env.TIDB_HOST ? 'Found' : 'MISSING',
        TIDB_USER: process.env.TIDB_USER ? 'Found' : 'MISSING',
        TIDB_PASSWORD: process.env.TIDB_PASSWORD ? 'Found' : 'MISSING',
        TIDB_DB_NAME: process.env.TIDB_DB_NAME ? 'Found' : 'MISSING',
        TIDB_PORT: process.env.TIDB_PORT ? 'Found' : 'MISSING',
        JWT_SECRET: process.env.JWT_SECRET ? 'Found' : 'MISSING'
    };

    // 2. Test Database Connection
    let dbStatus = 'Not Attempted';
    let dbError = null;

    try {
        if (envStatus.TIDB_HOST === 'MISSING') {
            throw new Error('Host is missing');
        }

        const connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DB_NAME,
            port: process.env.TIDB_PORT || 4000,
            ssl: { rejectUnauthorized: true }
        });

        await connection.ping();
        dbStatus = '✅ Connected Successfully';
        await connection.end();
        
    } catch (error) {
        dbStatus = '❌ Connection Failed';
        dbError = error.message;
    }

    return res.status(200).json({
        timestamp: new Date().toISOString(),
        environment_check: envStatus,
        database_check: {
            status: dbStatus,
            error: dbError
        }
    });
}
