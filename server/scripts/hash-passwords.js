// Script to generate hashed passwords for seed data
const bcrypt = require('bcryptjs');

async function generateHashes() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);
    
    console.log('Admin password hash:', adminPassword);
    console.log('Student password hash:', studentPassword);
    
    console.log('\n\nUse these in your SQL migration:');
    console.log(`\nAdmin: admin@catprep.com / admin123`);
    console.log(`INSERT INTO users (email, password, name, role, created_at, updated_at)`);
    console.log(`VALUES ('admin@catprep.com', '${adminPassword}', 'Admin User', 'admin', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000);`);
    
    console.log(`\nStudent: student@catprep.com / student123`);
    console.log(`INSERT INTO users (email, password, name, role, created_at, updated_at)`);
    console.log(`VALUES ('student@catprep.com', '${studentPassword}', 'Test Student', 'user', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000);`);
}

generateHashes();
