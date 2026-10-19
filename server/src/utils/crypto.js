const crypto = require('crypto');
const config = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey() {
  const hexKey = config.docEncryptionKey;
  if (!hexKey) {
    throw new Error('DOC_ENCRYPTION_KEY environment variable is required');
  }
  // Derive 32 bytes buffer from hex string or hash if arbitrary string
  if (/^[0-9a-fA-F]{64}$/.test(hexKey)) {
    return Buffer.from(hexKey, 'hex');
  }
  return crypto.createHash('sha256').update(hexKey).digest();
}

/**
 * Encrypt a plain Buffer using AES-256-GCM
 * Output format: [ 16 bytes IV ][ 16 bytes AuthTag ][ Ciphertext ]
 */
function encryptBuffer(plainBuffer) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypt a packed Buffer [ IV (16) ][ AuthTag (16) ][ Ciphertext ] using AES-256-GCM
 */
function decryptBuffer(packedBuffer) {
  if (packedBuffer.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid encrypted buffer format');
  }

  const key = getKey();
  const iv = packedBuffer.subarray(0, IV_LENGTH);
  const authTag = packedBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = packedBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

module.exports = {
  encryptBuffer,
  decryptBuffer
};
