// server/index_offline.js – entry point for local development (offline) database
const createApp = require('./app');
const { offlinePool, testConnection } = require('./config/database');

(async () => {
  try {
    await testConnection(offlinePool);
    const { start } = createApp(offlinePool);
    start();
  } catch (err) {
    console.error('Failed to start offline server:', err);
    process.exit(1);
  }
})();
