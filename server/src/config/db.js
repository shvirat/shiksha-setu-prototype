const mongoose = require('mongoose');
const dns = require('dns');
const config = require('./env');

// Prioritize IPv4 DNS lookups in Node 18+ to avoid hanging on Atlas SRV records in serverless environments
if (dns && dns.setDefaultResultOrder) {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (_) {}
}

let memoryServer = null;

// Global connection cache for serverless environments (Vercel / Lambda)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(forceMemory = false) {
  // Return active connection if already established
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const shouldUseMemory = forceMemory || config.useMemoryDb;

  if (shouldUseMemory) {
    if (!memoryServer) {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const uri = memoryServer.getUri();
        cached.conn = await mongoose.connect(uri);
        console.log(`[Database] Connected to in-memory MongoDB at ${uri}`);
        return cached.conn;
      } catch (err) {
        console.error('[Database] Failed to start in-memory MongoDB:', err.message);
        throw err;
      }
    }
    return mongoose.connection;
  }

  const mongoUri = (config.mongoUri || '').trim().replace(/^['"]|['"]$/g, '');
  const safeUri = mongoUri.replace(/:([^@]+)@/, ':****@');

  // Pre-validate URI on Vercel to give instant actionable guidance
  if (process.env.VERCEL) {
    if (!process.env.MONGODB_URI || mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      throw new Error(
        'MONGODB_URI environment variable is missing or set to localhost on Vercel. Please set MONGODB_URI in Vercel Project Settings > Environment Variables to your MongoDB Atlas connection string (mongodb+srv://...) and redeploy.'
      );
    }
    if (mongoUri.includes('<password>') || mongoUri.includes('<username>')) {
      throw new Error(
        'MONGODB_URI in Vercel still contains "<password>" or "<username>". Please edit MONGODB_URI in Vercel Project Settings and replace <password> with your actual Atlas user password.'
      );
    }
  }

  if (!cached.promise) {
    const hasDbNameInUri = /\/[a-zA-Z0-9_\-]+(\?|$)/.test(mongoUri.replace(/^mongodb(\+srv)?:\/\/[^\/]+/, ''));
    const opts = {
      ...(hasDbNameInUri ? {} : { dbName: 'shiksha_setu' }),
      serverSelectionTimeoutMS: 15000, // 15 seconds allows Atlas cold starts and DNS SRV resolution
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      maxPoolSize: 10,
      minPoolSize: 0,
      retryWrites: true,
      w: 'majority'
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((m) => {
        console.log(`[Database] Successfully connected to MongoDB at ${safeUri}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null; // Clear so subsequent requests can retry
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.conn = null;
    cached.promise = null;

    console.warn(`[Database] Connection to ${safeUri} failed: ${err.message}`);

    if (process.env.VERCEL) {
      throw new Error(
        `Failed to connect to MongoDB Atlas at ${safeUri} (${err.name}: ${err.message}). Verify that: 1) Atlas Network Access has IP 0.0.0.0/0 allowed, 2) DB username and password are correct (special characters must be URL-encoded), 3) Atlas cluster is awake.`
      );
    }

    console.warn('[Database] Falling back to MongoMemoryServer for development/demo mode...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      cached.conn = await mongoose.connect(uri);
      console.log(`[Database] Connected to fallback in-memory MongoDB at ${uri}`);
      return cached.conn;
    } catch (fallbackErr) {
      console.error('[Database] Fallback in-memory MongoDB failed:', fallbackErr.message);
      throw fallbackErr;
    }
  }
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  cached.conn = null;
  cached.promise = null;
}

module.exports = { connectDB, disconnectDB };
