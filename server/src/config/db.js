const mongoose = require('mongoose');
const config = require('./env');

let memoryServer = null;

async function connectDB(forceMemory = false) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const shouldUseMemory = forceMemory || config.useMemoryDb;

  if (shouldUseMemory) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`[Database] Connected to in-memory MongoDB at ${uri}`);
      return mongoose.connection;
    } catch (err) {
      console.error('[Database] Failed to start in-memory MongoDB:', err.message);
      throw err;
    }
  }

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected to MongoDB at ${config.mongoUri}`);
    return mongoose.connection;
  } catch (err) {
    console.warn(`[Database] Failed to connect to ${config.mongoUri}: ${err.message}`);
    console.warn('[Database] Falling back to MongoMemoryServer for development/demo mode...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`[Database] Connected to fallback in-memory MongoDB at ${uri}`);
      return mongoose.connection;
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
}

module.exports = { connectDB, disconnectDB };
