const app = require('../src/app');
const { connectDB } = require('../src/config/db');
const { User } = require('../src/models');
const { seedDatabase } = require('../seed/seed');

let isSeeded = false;

module.exports = async (req, res) => {
  // Set CORS headers immediately so preflight and any server error responses
  // (such as DB connection failures) are never blocked by browser CORS checks
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  // Return immediately on OPTIONS preflight without waiting for DB
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
