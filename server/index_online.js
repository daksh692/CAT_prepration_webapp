// server/index_online.js – entry point for production (online) database
require('dotenv').config({ path: require('path').resolve(__dirname, '.env.production') });

// Map ONLINE_DB_* variables to DB_* variables so the default pool uses them
if (process.env.ONLINE_DB_HOST) {
  process.env.DB_HOST = process.env.ONLINE_DB_HOST;
  process.env.DB_PORT = process.env.ONLINE_DB_PORT;
  process.env.DB_USER = process.env.ONLINE_DB_USER;
  process.env.DB_PASSWORD = process.env.ONLINE_DB_PASSWORD;
  process.env.DB_NAME = process.env.ONLINE_DB_NAME;
  process.env.DB_SSL = process.env.ONLINE_DB_SSL;
}

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
