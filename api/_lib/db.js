/**
 * Database Connection Utility for Vercel Serverless Functions
 * Connects to TiDB Cloud with SSL
 */

import mysql from 'mysql2/promise';

/**
 * Create a secure connection to TiDB Cloud
 * Uses environment variables for credentials
 */
export async function connectDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            port: parseInt(process.env.TIDB_PORT) || 4000,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DB_NAME,
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            },
            connectTimeout: 10000 // 10 seconds
        });

        return connection;
    } catch (error) {
        console.error('Database connection error:', error);
        throw new Error('Failed to connect to database');
    }
}

/**
 * Execute a query with automatic connection management
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Query results
 */
export async function executeQuery(query, params = []) {
    let connection;
    
    try {
        connection = await connectDB();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('Query execution error:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * Execute multiple queries in a transaction
 * @param {function} callback - Function that receives connection and executes queries
 * @returns {Promise} Transaction results
 */
export async function executeTransaction(callback) {
    let connection;
    
    try {
        connection = await connectDB();
        await connection.beginTransaction();
        
        const result = await callback(connection);
        
        await connection.commit();
        return result;
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Transaction error:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
