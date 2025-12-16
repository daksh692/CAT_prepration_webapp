/**
 * Master Migration Script
 * 
 * This script syncs all data from offline (local MySQL) to online (TiDB Cloud)
 * Use this when you've made changes locally and want to push them to production
 * 
 * Usage: node master-migrate.js
 */

const mysql = require('mysql2/promise');
const { offlineConfig, onlineConfig } = require('./config/database');

async function masterMigrate() {
    console.log('🚀 Master Migration: Offline → Online (TiDB)\n');
    console.log('='.repeat(80));
    
    const offline = await mysql.createConnection(offlineConfig);
    const online = await mysql.createConnection(onlineConfig);
    
    const tables = [
        { name: 'modules', key: 'id' },
        { name: 'chapters', key: 'id' },
        { name: 'study_pointers', key: 'id' },
        { name: 'study_formulas', key: 'id' },
        { name: 'study_examples', key: 'id', columnMap: { problem: 'question' } },
        { name: 'study_practice_problems', key: 'id' },
        { name: 'study_notes', key: 'id', customQuery: true }
    ];
    
    let totalMigrated = 0;
    
    for (const table of tables) {
        console.log(`\n📦 Migrating ${table.name}...`);
        
        try {
            let rows;
            
            // Special handling for study_notes (from study_materials)
            if (table.customQuery) {
                [rows] = await offline.query(`
                    SELECT chapter_id, brief_notes, detailed_notes 
                    FROM study_materials
                `);
            } else {
                [rows] = await offline.query(`SELECT * FROM ${table.name}`);
            }
            
            if (rows.length === 0) {
                console.log('   ⚠️ No data to migrate');
                continue;
            }
            
            console.log(`   Found ${rows.length} records`);
            
            // Clear existing data
            await online.query(`DELETE FROM ${table.name}`);
            
            let inserted = 0;
            for (const row of rows) {
                try {
                    // Handle column mapping
                    if (table.columnMap) {
                        for (const [oldCol, newCol] of Object.entries(table.columnMap)) {
                            if (row[oldCol] !== undefined) {
                                row[newCol] = row[oldCol];
                                delete row[oldCol];
                            }
                        }
                    }
                    
                    // Build INSERT query
                    const columns = Object.keys(row);
                    const values = Object.values(row);
                    const placeholders = columns.map(() => '?').join(', ');
                    const columnNames = columns.map(c => `\`${c}\``).join(', ');
                    
                    await online.query(
                        `INSERT INTO ${table.name} (${columnNames}) VALUES (${placeholders})`,
                        values
                    );
                    inserted++;
                    
                    if (inserted % 50 === 0) process.stdout.write('.');
                } catch (err) {
                    if (err.code !== 'ER_DUP_ENTRY') {
                        console.error(`\n   ❌ Error: ${err.message}`);
                    }
                }
            }
            
            console.log(`\n   ✅ Migrated: ${inserted}/${rows.length}`);
            totalMigrated += inserted;
            
        } catch (error) {
            console.error(`   ❌ Failed: ${error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`✨ Migration Complete! Total records: ${totalMigrated}`);
    console.log('='.repeat(80));
    
    await offline.end();
    await online.end();
}

// Run migration
masterMigrate().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
