const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const rawMongoUri = (process.env.MONGODB_URI || '').trim().replace(/^['"]|['"]$/g, '');
const defaultJwtSecret = 'super-secret-jwt-key-for-shiksha-setu-demo-min-32-chars';
const defaultDocEncryptionKey =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || defaultJwtSecret;
const docEncryptionKey = process.env.DOC_ENCRYPTION_KEY || defaultDocEncryptionKey;

if (nodeEnv === 'production') {
  if (jwtSecret === defaultJwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set to a unique value of at least 32 characters in production.');
  }
  if (
    docEncryptionKey === defaultDocEncryptionKey ||
    !/^[0-9a-fA-F]{64}$/.test(docEncryptionKey)
  ) {
    throw new Error(
      'DOC_ENCRYPTION_KEY must be set to a unique 64-character hexadecimal key in production.'
    );
  }
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv,
  mongoUri: rawMongoUri || 'mongodb://localhost:27017/shiksha_setu',
  useMemoryDb: process.env.VERCEL ? false : process.env.USE_MEMORY_DB === 'true',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  docEncryptionKey,
  allowDemoSeedEndpoint:
    nodeEnv !== 'production' && process.env.ALLOW_DEMO_SEED_ENDPOINT === 'true',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  llmProvider: process.env.LLM_PROVIDER || 'none',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || ''
};

module.exports = config;
