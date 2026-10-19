/**
 * MOCK UDISE+ ADAPTER
 * -------------------------------------------------------------
 * Simulates integration with Unified District Information System for Education Plus (UDISE+).
 * Required consent: MOCK_UDISE
 * NOTE: This is a simulated adapter for hackathon demonstration.
 */

const { verifyOrThrowConsent } = require('../services/consentService');
const { EnrollmentRecord, StudentProfile } = require('../models');

class UdiseAdapter {
  constructor() {
    this.source = 'MOCK_UDISE';
  }

  /**
   * Check institutional enrollment against national school/college records
   */
  async checkEnrolment(userId, { udiseId, studentName, year } = {}) {
    await verifyOrThrowConsent(userId, this.source, 'Identity, caste, academic and income auto-verification for MoTA scholarships');

    const profile = await StudentProfile.findOne({ userId });
    const targetUdise = udiseId || profile?.udiseId;
    const targetName = studentName || profile?.fullName || '';
    const targetYear = year || profile?.year || 1;

    // Demo scenario for Mangal Murmu: academic year discrepancy
    if (targetName.toLowerCase().includes('mangal')) {
      return {
        source: this.source,
        status: 'MISMATCH',
        matched: false,
        field: 'year',
        userValue: `Year ${targetYear}`,
        recordValue: 'Year 2',
        udiseSchoolCode: targetUdise || 'UDISE-2026-1006',
        institution: profile?.institution || 'Dharani Dhar University',
        notes: 'Academic progress discrepancy: Stated year does not match institutional UDISE register.'
      };
    }

    // Lookup in EnrollmentRecord database
    let record = null;
    if (targetUdise) {
      record = await EnrollmentRecord.findOne({ udiseId: targetUdise });
    }
    if (!record && targetName) {
      record = await EnrollmentRecord.findOne({ studentName: new RegExp(targetName, 'i') });
    }

    return {
      source: this.source,
      status: 'PASS',
      matched: true,
      udiseId: record?.udiseId || targetUdise || 'UDISE-2026-9999',
      studentName: targetName,
      institution: record?.institution || profile?.institution || 'Government Institution',
      category: record?.category || 'ST',
      statusInRegister: 'ACTIVELY_ENROLLED',
      academicSession: '2025-2026',
      notes: 'Institutional enrolment and active student status verified with UDISE+ database.'
    };
  }
}

module.exports = new UdiseAdapter();
