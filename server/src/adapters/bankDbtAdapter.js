/**
 * MOCK BANK / PFMS / DBT ADAPTER
 * -------------------------------------------------------------
 * Simulates integration with Public Financial Management System (PFMS) & NPCI Aadhaar-seeded DBT.
 * Required consent: MOCK_BANK_DBT
 * NOTE: This is a simulated adapter for hackathon demonstration.
 */

const { verifyOrThrowConsent } = require('../services/consentService');
const { StudentProfile } = require('../models');

class BankDbtAdapter {
  constructor() {
    this.source = 'MOCK_BANK_DBT';
  }

  /**
   * Verify bank account status and NPCI Aadhaar payment bridge (APB) seeding
   */
  async verifyAadhaarSeeding(userId, maskedBankRef) {
    await verifyOrThrowConsent(userId, this.source, 'Identity, caste, academic and income auto-verification for MoTA scholarships');

    const profile = await StudentProfile.findOne({ userId });
    const bankRef = maskedBankRef || profile?.maskedBankRef || 'XXXX-XXXX-1234';

    return {
      source: this.source,
      status: 'PASS',
      matched: true,
      bankName: 'State Bank of India',
      ifscPrefix: 'SBIN000',
      maskedAccount: bankRef,
      npciAadhaarSeeded: true,
      dbtActive: true,
      notes: 'Bank account is active and seeded with Aadhaar on NPCI mapping mapper for DBT.'
    };
  }

  /**
   * Simulate scholarship disbursement via PFMS / DBT gateway
   */
  async simulateDisbursement(userId, applicationId, amount = 18000) {
    await verifyOrThrowConsent(userId, this.source, 'Identity, caste, academic and income auto-verification for MoTA scholarships');

    return {
      source: this.source,
      status: 'DISBURSED_SIMULATED',
      disbursementRef: `PFMS-DBT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      amount,
      currency: 'INR',
      disbursedAt: new Date().toISOString(),
      mode: 'DIRECT_BENEFIT_TRANSFER_SIMULATED',
      notes: 'Scholarship allowance successfully transferred to beneficiary account (SIMULATED).'
    };
  }
}

module.exports = new BankDbtAdapter();
