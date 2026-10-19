/**
 * MOCK APAAR ADAPTER
 * -------------------------------------------------------------
 * Simulates integration with Automated Permanent Academic Account Registry (APAAR / ABC ID).
 * Required consent: MOCK_APAAR
 * NOTE: This is a simulated adapter for hackathon demonstration.
 */

const { verifyOrThrowConsent } = require('../services/consentService');
const { StudentProfile } = require('../models');

class ApaarAdapter {
  constructor() {
    this.source = 'MOCK_APAAR';
  }

  /**
   * Verify APAAR / Academic Bank of Credits ID and educational credits
   */
  async verifyEduId(userId, apaarId) {
    await verifyOrThrowConsent(userId, this.source, 'Identity, caste, academic and income auto-verification for MoTA scholarships');

    const profile = await StudentProfile.findOne({ userId });
    const targetApaar = apaarId || profile?.apaarId || `APAAR-${Math.floor(10000000 + Math.random() * 90000000)}`;

    return {
      source: this.source,
      status: 'PASS',
      matched: true,
      apaarId: targetApaar,
      studentName: profile?.fullName || 'Verified ST Student',
      academicInstitution: profile?.institution || 'Recognized Higher Education Institution',
      courseOfStudy: profile?.course || 'Undergraduate Programme',
      cumulativeCredits: 48,
      nadRecordFound: true,
      notes: 'APAAR ID validated with National Academic Depository (NAD).'
    };
  }
}

module.exports = new ApaarAdapter();
