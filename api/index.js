const app = require('../server/src/app');
const { connectDB } = require('../server/src/config/db');
const { User } = require('../server/src/models');
const { seedDatabase } = require('../server/seed/seed');

let isSeeded = false;

module.exports = async (req, res) => {
  // Return immediately on OPTIONS preflight without waiting for DB
  if (req.method === 'OPTIONS') {
    return app(req, res);
  }

  try {
    await connectDB();

    // Auto-seed remote database on Vercel if empty
    if (!isSeeded) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Vercel Serverless] Database is empty. Auto-seeding demo schemes, officers, and students...');
        await seedDatabase();
      }
      isSeeded = true;
    }
  } catch (err) {
    console.error('[Vercel Serverless] DB connection error:', err.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: 'Could not connect to database on Vercel. Ensure MONGODB_URI is set to a valid remote MongoDB Atlas URI in your Vercel Project Settings.',
        details: err.message
      }
    });
  }

  return app(req, res);
};
