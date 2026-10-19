const { ConsentRecord } = require('../models');

async function hasConsent(userId, source, purpose) {
  if (!userId || !source) return false;
  const query = { userId, source };
  if (purpose) query.purpose = purpose;
  const consent = await ConsentRecord.findOne(query);
  return Boolean(consent);
}

async function recordConsent({ userId, source, purpose, ipAddress = '127.0.0.1' }) {
  if (!userId || !source || !purpose) {
    throw new Error('userId, source, and purpose are required to grant consent');
  }

  const existing = await ConsentRecord.findOne({ userId, source, purpose });
  if (existing) {
    existing.grantedAt = new Date();
    await existing.save();
    return existing;
  }

  const consent = await ConsentRecord.create({
    userId,
    source,
    purpose,
    ipAddress,
    grantedAt: new Date()
  });

  return consent;
}

async function verifyOrThrowConsent(userId, source, purpose) {
  const granted = await hasConsent(userId, source, purpose);
  if (!granted) {
    const error = new Error(`Consent not granted for integration source '${source}' and purpose '${purpose}'`);
    error.statusCode = 403;
    error.code = 'CONSENT_REQUIRED';
    throw error;
  }
  return true;
}

module.exports = {
  hasConsent,
  recordConsent,
  verifyOrThrowConsent
};
