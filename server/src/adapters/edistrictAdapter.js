/**
 * MOCK STATE E-DISTRICT ADAPTER
 * -------------------------------------------------------------
 * Simulates integration with State e-District Revenue Portals (JharSewa, Odisha e-District, etc.).
 * Required consent: MOCK_EDISTRICT
 * NOTE: This is a simulated adapter for hackathon demonstration.
 */

const { verifyOrThrowConsent } = require('../services/consentService');
const { StudentProfile } = require('../models');

class EDistrictAdapter {
  constructor() {
    this.source = 'MOCK_EDISTRICT';
  }

  /**
   * Verify authenticity of family income certificate with state revenue database
   */
  async verifyIncomeCertificate(userId, { declaredIncome, state, district } = {}) {
    await verifyOrThrowConsent(userId, this.source, 'Identity, caste, academic and income auto-verification for MoTA scholarships');

    const profile = await StudentProfile.findOne({ userId });
    const targetIncome = declaredIncome !== undefined ? declaredIncome : profile?.familyIncome || 150000;
    const targetName = profile?.fullName || '';

    // Demo scenario for Sukra Kole: income mismatch
    if (targetName.toLowerCase().includes('sukra')) {
      return {
        source: this.source,
        status: 'MISMATCH',
        matched: false,
        field: 'familyIncome',
        userValue: `₹${Number(targetIncome).toLocaleString('en-IN')}`,
        recordValue: '₹2,60,000',
        certificateNumber: 'ED-OD-INC-2025-41092',
        revenueCircle: `${district || profile?.district || 'Mayurbhanj'} Revenue Circle`,
        certificateIncome: 260000,
        validUpto: '2026-03-31',
        notes: 'Income discrepancy: Self-declared income does not match the annual income recorded in State e-District register.'
      };
    }

    return {
      source: this.source,
      status: 'PASS',
      matched: true,
      certificateNumber: `ED-${(state || profile?.state || 'JH').substring(0, 2).toUpperCase()}-INC-2025-${Math.floor(10000 + Math.random() * 90000)}`,
      applicantName: targetName,
      certificateIncome: targetIncome,
      issuingTehsildar: `Tehsildar Office, ${district || profile?.district || 'Ranchi'}`,
      issueDate: '2025-05-10',
      validUpto: '2026-05-09',
      notes: 'Income certificate verified valid and active with State Revenue Department.'
    };
  }
}

module.exports = new EDistrictAdapter();
