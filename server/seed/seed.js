const { pool } = require('../config/database');
const catModules = require('./data/modules');
const sampleChapters = require('./data/chapters');
const studyMaterialsData = require('./data/studyMaterials');

async function seedDatabase() {
    const connection = await pool.getConnection();
    
    try {
        console.log('🌱 Starting database seeding...');
        
        // Clear existing data (in reverse order of dependencies)
        console.log('🗑️  Clearing existing data...');
        await connection.query('DELETE FROM skip_test_questions');
        await connection.query('DELETE FROM study_practice_problems');
        await connection.query('DELETE FROM study_examples');
        await connection.query('DELETE FROM study_formulas');
        await connection.query('DELETE FROM study_pointers');
        await connection.query('DELETE FROM study_videos');
        await connection.query('DELETE FROM study_materials');
        await connection.query('DELETE FROM skip_tests');
        await connection.query('DELETE FROM study_sessions');
        await connection.query('DELETE FROM chapters');
        await connection.query('DELETE FROM modules');
        
        // Reset auto-increment
        await connection.query('ALTER TABLE modules AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE chapters AUTO_INCREMENT = 1');
        
        console.log('✅ Cleared existing data');
        
        // Seed modules
        console.log('📚 Seeding modules...');
        const moduleIds = {};
        const now = Date.now();
        
        for (const module of catModules) {
            const [result] = await connection.query(
                'INSERT INTO modules (name, section, phase, priority, estimated_hours, `order`, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [module.name, module.section, module.phase, module.priority, module.estimatedHours, module.order, now, now]
            );
            moduleIds[module.name] = result.insertId;
        }
        
        console.log(`✅ Seeded ${catModules.length} modules`);
        
        // Seed chapters
        console.log('📖 Seeding chapters...');
        let totalChapters = 0;
        
        for (const [moduleName, chapters] of Object.entries(sampleChapters)) {
            if (moduleIds[moduleName]) {
                for (const chapter of chapters) {
                    await connection.query(
                        'INSERT INTO chapters (module_id, name, topics, estimated_hours, difficulty, completed, skipped, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            moduleIds[moduleName],
                            chapter.name,
                            JSON.stringify(chapter.topics),
                            chapter.estimatedHours,
                            chapter.difficulty,
                            false,
                            false,
                            now
                        ]
                    );
                    totalChapters++;
                }
            }
        }
        
        console.log(`✅ Seeded ${totalChapters} chapters`);
        
        // Seed study materials
        console.log('📝 Seeding study materials...');
        await seedStudyMaterials(connection);
        
        // Seed default settings
        console.log('⚙️  Seeding default settings...');
        
        // Check if settings already exist
        const [existingSettings] = await connection.query('SELECT id FROM user_settings LIMIT 1');
        if (existingSettings.length === 0) {
            await connection.query(
                'INSERT INTO user_settings (daily_goal_minutes, exam_date, auto_assign_penalties, custom_penalties, updated_at) VALUES (?, ?, ?, ?, ?)',
                [
                    120,
                    new Date(Date.now() + 11 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    true,
                    JSON.stringify([
                        'No social media for 1 day',
                        'No phone games for 2 days',
                        'Extra 30 minutes study tomorrow',
                        'No dessert today'
                    ]),
                    now
                ]
            );
        }
        
        // Check if streak already exists
        const [existingStreak] = await connection.query('SELECT id FROM streaks LIMIT 1');
        if (existingStreak.length === 0) {
            await connection.query(
                'INSERT INTO streaks (current_streak, longest_streak, last_study_date, streak_broken, penalty_active, penalty_completed, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [0, 0, null, false, false, false, now]
            );
        }
        
        console.log('✅ Seeded default settings');
        
        console.log('🎉 Database seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        connection.release();
    }
}

async function seedStudyMaterials(connection) {
    // Load all study materials files
    const fullStudyMaterials = require('./data/fullStudyMaterials');
    const numberSystemsModule = require('./data/numberSystemsModule');
    const readingComprehensionModule = require('./data/readingComprehensionModule');
    const basicDataInterpretationModule = require('./data/basicDataInterpretationModule');
    
    // Combine all study materials
    const allMaterials = {
        ...fullStudyMaterials,
        ...numberSystemsModule,
        ...readingComprehensionModule,
        ...basicDataInterpretationModule
    };
    
    const now = Date.now();
    let materialsSeeded = 0;
    
    for (const [chapterName, materialData] of Object.entries(allMaterials)) {
        // Get chapter ID
        const [chapterRows] = await connection.query(
            'SELECT id FROM chapters WHERE name = ?',
            [chapterName]
        );
        
        if (chapterRows.length === 0) {
            console.log(`⚠️  Chapter "${chapterName}" not found, skipping...`);
            continue;
        }
        
        const chapterId = chapterRows[0].id;
        
        // Delete existing materials for this chapter to avoid duplicates
        await connection.query('DELETE FROM study_materials WHERE chapter_id = ?', [chapterId]);
        await connection.query('DELETE FROM study_videos WHERE chapter_id = ?', [chapterId]);
        await connection.query('DELETE FROM study_pointers WHERE chapter_id = ?', [chapterId]);
        await connection.query('DELETE FROM study_formulas WHERE chapter_id = ?', [chapterId]);
        await connection.query('DELETE FROM study_examples WHERE chapter_id = ?', [chapterId]);
        await connection.query('DELETE FROM study_practice_problems WHERE chapter_id = ?', [chapterId]);
        
        // Insert main study material
        await connection.query(
            'INSERT INTO study_materials (chapter_id, brief_notes, detailed_notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [chapterId, materialData.briefNotes, materialData.detailedNotes, now, now]
        );
        
        // Insert videos
        for (let i = 0; i < materialData.videos.length; i++) {
            const video = materialData.videos[i];
            await connection.query(
                'INSERT INTO study_videos (chapter_id, title, url, duration, channel, `order`) VALUES (?, ?, ?, ?, ?, ?)',
                [chapterId, video.title, video.url, video.duration, video.channel, i + 1]
            );
        }
        
        // Insert key pointers
        for (let i = 0; i < materialData.keyPointers.length; i++) {
            await connection.query(
                'INSERT INTO study_pointers (chapter_id, content, `order`) VALUES (?, ?, ?)',
                [chapterId, materialData.keyPointers[i], i + 1]
            );
        }
        
        // Insert formulas (if any)
        if (materialData.formulas && materialData.formulas.length > 0) {
            for (let i = 0; i < materialData.formulas.length; i++) {
                await connection.query(
                    'INSERT INTO study_formulas (chapter_id, formula, description, `order`) VALUES (?, ?, ?, ?)',
                    [chapterId, materialData.formulas[i], null, i + 1]
                );
            }
        }
        
        // Insert examples
        for (let i = 0; i < materialData.examples.length; i++) {
            const example = materialData.examples[i];
            await connection.query(
                'INSERT INTO study_examples (chapter_id, problem, solution, explanation, `order`) VALUES (?, ?, ?, ?, ?)',
                [chapterId, example.problem, example.solution, example.explanation, i + 1]
            );
        }
        
        // Insert practice problems
        for (let i = 0; i < materialData.practiceProblems.length; i++) {
            const problem = materialData.practiceProblems[i];
            await connection.query(
                'INSERT INTO study_practice_problems (chapter_id, question, answer, difficulty, hint, explanation, `order`) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [chapterId, problem.question, problem.answer, problem.difficulty, problem.hint || null, problem.explanation || null, i + 1]
            );
        }
        
        materialsSeeded++;
        console.log(`✅ Seeded study materials for "${chapterName}"`);
    }
    
    console.log(`📚 Total study materials seeded: ${materialsSeeded} chapters`);
}


// Run seeding
seedDatabase()
    .then(() => {
        console.log('💯 All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed to seed database:', error);
        process.exit(1);
    });
