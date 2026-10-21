const app = require('../server/src/app');
const { connectDB } = require('../server/src/config/db');
const { User, Scheme } = require('../server/src/models');
const { seedDatabase } = require('../server/seed/seed');

let isSeeded = false;
let seedPromise = null;

async function ensureSeeded() {
  if (isSeeded) return;
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      const [userCount, schemeCount] = await Promise.all([
        User.countDocuments(),
        Scheme.countDocuments()
      ]);
      if (userCount === 0 || schemeCount === 0) {
        console.log('[Vercel Serverless] Empty or unseeded database detected. Auto-seeding demo schemes, officers, and students...');
        await seedDatabase();
        console.log('[Vercel Serverless] Database auto-seeded successfully.');
      }
      isSeeded = true;
    } catch (seedErr) {
      console.error('[Vercel Serverless] Auto-seeding error:', seedErr);
    } finally {
      seedPromise = null;
    }
  })();

  return seedPromise;
}

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
    await ensureSeeded();
  } catch (err) {
    console.error('[Vercel Serverless] DB connection error:', err.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: err.message || 'Could not connect to database on Vercel.',
        details: err.message
      }
    });
  }

  return app(req, res);
};
