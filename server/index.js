const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRouter = require('./routes/auth');
const modulesRouter = require('./routes/modules');
const chaptersRouter = require('./routes/chapters');
const studyRouter = require('./routes/study');
const adminRouter = require('./routes/admin');
const dashboardRouter = require('./routes/dashboard');
const testsRouter = require('./routes/tests');
const analyticsRouter = require('./routes/analytics');

app.use('/api/auth', authRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/chapters', chaptersRouter);
app.use('/api/study', studyRouter);
app.use('/api/admin', adminRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/tests', testsRouter);
app.use('/api/analytics', analyticsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CAT Prep API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server
async function startServer() {
    try {
        // Test database connection
        await testConnection();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 API Docs: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
