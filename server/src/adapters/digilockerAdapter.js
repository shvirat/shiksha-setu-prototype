/**
 * MOCK DIGILOCKER ADAPTER
 * -------------------------------------------------------------
 * Simulates integration with DigiLocker API (National Digital Locker System).
 * Required consent: MOCK_DIGILOCKER
 * NOTE: This is a simulated adapter for hackathon demonstration.
 */

const { verifyOrThrowConsent } = require('../services/consentService');
const { StudentProfile } = require('../models');

class DigiLockerAdapter {
  constructor() {
    this.source = 'MOCK_DIGILOCKER';
  }

  /**
   * Verify citizen identity and ST caste certificate via mock DigiLocker
   */
  async verifyIdentity(userId, { name, category = 'ST' } = {}) {
    await verifyOrThrowConsent(userId, this.source, 'Identity, caste, academic and income auto-verification for MoTA scholarships');

    const profile = await StudentProfile.findOne({ userId });
    const targetName = name || profile?.fullName || '';

    // Demo scenario: Shanti Oraon has a spelling variation in DigiLocker record
    if (targetName.toLowerCase().includes('shanti')) {
      return {
        source: this.source,
        status: 'MISMATCH',
        matched: false,
        field: 'fullName',
        userValue: targetName,
        recordValue: 'Shanti Uraon',
        documentNumber: 'DL-JH-ST-2022-89211',
        casteCategory: 'ST',
        subTribe: 'Oraon',
        issuingAuthority: 'Sub-Divisional Officer, Gumla, Jharkhand',
        issuedDate: '2022-04-12',
        notes: 'Spelling variation between application and DigiLocker caste certificate record.'
      };
    }

    return {
      source: this.source,
      status: 'PASS',
      matched: true,
      verifiedName: targetName,
      documentNumber: `DL-ST-2023-${Math.floor(100000 + Math.random() * 900000)}`,
      casteCategory: category,
      subTribe: 'Scheduled Tribe Recognized',
      issuingAuthority: `Revenue Authority, ${profile?.district || 'Ranchi'}, ${profile?.state || 'Jharkhand'}`,
      issuedDate: '2023-06-15',
      notes: 'Demographic and ST caste certificate verified successfully with DigiLocker registry.'
    };
  }

  /**
   * Pull official electronic document metadata from DigiLocker
   */
  async fetchDocument(userId, docType) {
    await verifyOrThrowConsent(userId, this.source, 'Identity, caste, academic and income auto-verification for MoTA scholarships');

    return {
      source: this.source,
      docType,
      uri: `in.gov.digilocker.${docType.toLowerCase()}.${userId}`,
      issuer: 'MoTA / State Revenue Department',
      verified: true,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new DigiLockerAdapter();
