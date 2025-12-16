// server/index_online.js – entry point for production (online) database
require('dotenv').config({ path: require('path').resolve(__dirname, '.env.production') });
const createApp = require('./app');
const { onlinePool } = require('./config/database');

(async () => {
  try {
    const { start } = createApp(onlinePool);
    start();
  } catch (err) {
    console.error('Failed to start online server:', err);
    process.exit(1);
  }
})();
