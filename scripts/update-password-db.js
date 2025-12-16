/**
 * Update Password in Database
 * Usage: node scripts/update-password-db.js <email> <bcrypt-hash>
 */

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

const env = {};
try {
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    });
} catch (error) {
    console.error('Error reading .env file:', error.message);
    process.exit(1);
}

const email = process.argv[2];
const passwordHash = process.argv[3];

if (!email || !passwordHash) {
    console.log('Usage: node scripts/update-password-db.js <email> <bcrypt-hash>');
    process.exit(1);
}

async function updatePassword() {
    let connection;
    
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: env.DB_HOST,
            port: parseInt(env.DB_PORT) || 4000,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            }
        });
        
        console.log('✅ Connected!\n');
        
        // Update password
        console.log(`Updating password for: ${email}`);
        const [result] = await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [passwordHash, email]
        );
        
        if (result.affectedRows === 0) {
            console.log('❌ No user found with that email');
        } else {
            console.log('✅ Password updated successfully!');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

updatePassword();
