/**
 * MOCK OTR ADAPTER
 * -------------------------------------------------------------
 * Simulates integration with One-Time Registration (NSP / MoTA Central OTR).
 * Required consent: MOCK_OTR
 * NOTE: This is a simulated adapter for hackathon demonstration.
 */

const { verifyOrThrowConsent } = require('../services/consentService');
const { StudentProfile } = require('../models');

class OtrAdapter {
  constructor() {
    this.source = 'MOCK_OTR';
  }

  /**
   * Verify One-Time Registration (OTR) token and pre-authenticated profile
   */
  async verifyOneTimeRegistration(userId, otrNumber) {
    await verifyOrThrowConsent(userId, this.source, 'Identity, caste, academic and income auto-verification for MoTA scholarships');

    const profile = await StudentProfile.findOne({ userId });
    const otrRef = otrNumber || `OTR-2026-${Math.floor(1000000 + Math.random() * 9000000)}`;

    return {
      source: this.source,
      status: 'PASS',
      matched: true,
      otrNumber: otrRef,
      applicantName: profile?.fullName,
      aadhaarBioVerified: true,
      lastAuthTimestamp: new Date().toISOString(),
      notes: 'Central OTR registration status confirmed.'
    };
  }
}

module.exports = new OtrAdapter();
