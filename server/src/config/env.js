const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shiksha_setu',
  useMemoryDb: process.env.VERCEL ? false : process.env.USE_MEMORY_DB === 'true',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key-for-shiksha-setu-demo-min-32-chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  docEncryptionKey: process.env.DOC_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  llmProvider: process.env.LLM_PROVIDER || 'none',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || ''
};

module.exports = config;
