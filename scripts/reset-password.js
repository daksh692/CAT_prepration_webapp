/**
 * Password Reset Utility
 * Usage: node scripts/reset-password.js <email> <new-password>
 * 
 * This script will:
 * 1. Hash the new password with bcrypt
 * 2. Update the user's password in the database
 * 3. Verify the update was successful
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

async function resetPassword(email, newPassword) {
    let connection;
    
    try {
        // Connect to database
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
        
        console.log('Connected successfully!');
        
        // Check if user exists
        const [users] = await connection.execute(
            'SELECT id, email, name FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            console.error(`❌ User not found: ${email}`);
            return;
        }
        
        const user = users[0];
        console.log(`Found user: ${user.name} (${user.email})`);
        
        // Hash the new password
        console.log('Hashing new password...');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Password hash:', hashedPassword);
        
        // Update password
        console.log('Updating password in database...');
        await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );
        
        console.log('✅ Password updated successfully!');
        
        // Verify the update
        console.log('Verifying password...');
        const [updatedUsers] = await connection.execute(
            'SELECT password FROM users WHERE email = ?',
            [email]
        );
        
        const isValid = await bcrypt.compare(newPassword, updatedUsers[0].password);
        
        if (isValid) {
            console.log('✅ Password verification successful!');
            console.log(`\n🎉 Password for ${email} has been reset.`);
            console.log(`You can now login with:`);
            console.log(`  Email: ${email}`);
            console.log(`  Password: ${newPassword}`);
        } else {
            console.error('❌ Password verification failed!');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
    console.log('Usage: node scripts/reset-password.js <email> <new-password>');
    console.log('Example: node scripts/reset-password.js student@catprep.com newpassword123');
    process.exit(1);
}

const [email, newPassword] = args;

// Run the script
resetPassword(email, newPassword);
