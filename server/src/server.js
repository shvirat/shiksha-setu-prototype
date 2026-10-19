const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/db');
const { User } = require('./models');
const { seedDatabase } = require('../seed/seed');

async function start() {
  try {
    await connectDB();

    // Auto-seed if database is empty (ensures in-memory MongoDB is always populated with demo accounts)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Shiksha Setu API] Database is empty. Auto-seeding demo schemes, officers, and students...');
      await seedDatabase();
    }

    const server = app.listen(config.port, () => {
      console.log(`[Shiksha Setu API] Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`[Shiksha Setu API] Health check at http://localhost:${config.port}/api/health`);
    });

    const shutdown = async () => {
      console.log('\n[Shiksha Setu API] Gracefully shutting down...');
      server.close(() => {
        console.log('[Shiksha Setu API] Closed HTTP server.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[Shiksha Setu API] Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { start };
