/**
 * Simple Password Hash Generator
 * Usage: node scripts/generate-hash.js <password>
 * 
 * Generates a bcrypt hash for the given password
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
    console.log('Usage: node scripts/generate-hash.js <password>');
    console.log('Example: node scripts/generate-hash.js student123');
    process.exit(1);
}

console.log('Password:', password);
console.log('Generating bcrypt hash (10 rounds)...\n');

const hash = await bcrypt.hash(password, 10);

console.log('Hash:', hash);
console.log('\nYou can now update the database with this SQL command:');
console.log(`UPDATE users SET password = '${hash}' WHERE email = 'student@catprep.com';`);
