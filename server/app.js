// server/app.js – builds the Express app with a given DB pool
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const auditLogger = require('./middleware/auditLogger'); // optional custom logger

function createApp(dbPool) {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Security middleware
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

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again after 15 minutes.',
    skipSuccessfulRequests: true,
  });

  app.use('/api/', apiLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Attach DB pool to each request
  app.use((req, res, next) => {
    req.db = dbPool;
    next();
  });

  // Standard middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes – they will read req.db internally
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

  // Health check
  app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'CAT Prep API is running' }));

  // Error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
  });

  // Helper to start listening – used by the entry scripts
  function start() {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API Docs: http://localhost:${PORT}/api/health`);
    });
  }

  return { app, start };
}

module.exports = createApp;
