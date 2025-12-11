// Script to generate unique friend codes for existing users
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

function generateFriendCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

async function generateUniqueCodes() {
    try {
        // Get users without friend codes
        const [users] = await pool.query(
            'SELECT id FROM users WHERE friend_code = "" OR friend_code IS NULL'
        );

        console.log(`Found ${users.length} users without friend codes`);

        for (const user of users) {
            let code = generateFriendCode();
            let isUnique = false;

            // Ensure uniqueness
            while (!isUnique) {
                const [existing] = await pool.query(
                    'SELECT id FROM users WHERE friend_code = ?',
                    [code]
                );

                if (existing.length === 0) {
                    isUnique = true;
                } else {
                    code = generateFriendCode();
                }
            }

            // Update user with unique code
            await pool.query(
                'UPDATE users SET friend_code = ? WHERE id = ?',
                [code, user.id]
            );

            console.log(`✅ Generated code ${code} for user ${user.id}`);
        }

        console.log(`\n🎉 Successfully generated codes for all users!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

generateUniqueCodes();
