/**
 * Password Verification Utility
 * Usage: node scripts/verify-password.js <email> <password-to-test>
 * 
 * This script will:
 * 1. Fetch the user's password hash from the database
 * 2. Compare it with the provided password
 * 3. Show whether they match
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

try {
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
} catch (error) {
    console.error('Warning: Could not load .env file:', error.message);
}

async function verifyPassword(email, passwordToTest) {
    let connection;
    
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            port: parseInt(process.env.TIDB_PORT) || 4000,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DB_NAME,
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            }
        });
        
        console.log('✅ Connected successfully!\n');
        
        // Get user
        const [users] = await connection.execute(
            'SELECT id, email, name, password FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            console.error(`❌ User not found: ${email}`);
            return;
        }
        
        const user = users[0];
        console.log(`Found user:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Password hash: ${user.password.substring(0, 30)}...`);
        console.log();
        
        // Check if password looks like a bcrypt hash
        const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        console.log(`Hash type: ${isBcryptHash ? 'bcrypt' : 'unknown/plain text'}`);
        console.log();
        
        if (!isBcryptHash) {
            console.error('⚠️  WARNING: Password is not a bcrypt hash!');
            console.error('   This could be plain text or a different hash algorithm.');
            console.error('   You should reset this password using reset-password.js');
            console.log();
            
            // Check if it matches plain text
            if (user.password === passwordToTest) {
                console.log('❌ Password is stored as PLAIN TEXT and matches!');
                console.log('   This is a SECURITY RISK. Reset immediately.');
            }
            return;
        }
        
        // Verify password
        console.log('Testing password...');
        const isValid = await bcrypt.compare(passwordToTest, user.password);
        
        if (isValid) {
            console.log('✅ Password is CORRECT!');
        } else {
            console.log('❌ Password is INCORRECT!');
            console.log('\nTroubleshooting:');
            console.log('1. Make sure you\'re using the correct password');
            console.log('2. Check if the password was recently changed');
            console.log('3. Use reset-password.js to set a new password');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
    console.log('Usage: node scripts/verify-password.js <email> <password-to-test>');
    console.log('Example: node scripts/verify-password.js student@catprep.com password123');
    process.exit(1);
}

const [email, passwordToTest] = args;

verifyPassword(email, passwordToTest);
