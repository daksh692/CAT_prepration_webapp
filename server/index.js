const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');
const path = require('path');
// Load env vars from server/.env or root .env
require('dotenv').config(); 
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
// 1. Helmet - Set security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// 2. Rate Limiting - Prevent brute force attacks
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again after 15 minutes.',
    skipSuccessfulRequests: true,
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 3. Audit Logging Middleware
const auditLog = (action, details = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[AUDIT] ${timestamp} | ${action} |`, JSON.stringify(details));
};

app.use((req, res, next) => {
    // Log authentication and admin actions
    if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
        auditLog('API_REQUEST', {
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    }
    next();
});

// Standard Middleware
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
const friendsRouter = require('./routes/friends');
const leaderboardRouter = require('./routes/leaderboard');

app.use('/api/auth', authRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/chapters', chaptersRouter);
app.use('/api/study', studyRouter);
app.use('/api/admin', adminRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/tests', testsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/leaderboard', leaderboardRouter);

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
