const app = require('../server/src/app');
const { connectDB } = require('../server/src/config/db');

// Serverless handler for Vercel (Root deployment)
module.exports = async (req, res) => {
  try {
    await connectDB();
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
