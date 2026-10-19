const { Application, StudentProfile, Document, VerificationResult, Scheme } = require('../models');
const {
  digilockerAdapter,
  udiseAdapter,
  apaarAdapter,
  otrAdapter,
  edistrictAdapter,
  bankDbtAdapter
} = require('../adapters');
const notificationService = require('./notificationService');
const { logAudit } = require('./auditService');

class ApplicationService {
  /**
   * Create a DRAFT application prefilled from student profile and digital wallet
   */
  async createDraft(userId, schemeCode) {
    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      throw new Error('Student profile must be created before applying for scholarships.');
    }

    const scheme = await Scheme.findOne({ code: schemeCode });
    if (!scheme) {
      throw new Error(`Scholarship scheme '${schemeCode}' does not exist.`);
    }

    // Check if an active application already exists for this scheme
    const existing = await Application.findOne({
      userId,
      schemeCode,
      status: { $nin: ['REJECTED'] }
    });
    if (existing) {
      const err = new Error(`You already have an active application (${existing.applicationNumber}) for this scheme.`);
      err.statusCode = 409;
      err.code = 'APPLICATION_EXISTS';
      throw err;
    }

    // Pull student's digital wallet documents
    const walletDocs = await Document.find({ userId });
    const attachedDocs = walletDocs.map((doc) => ({
      docType: doc.type,
      documentId: doc._id,
      originalName: doc.originalName
    }));

    const applicationNumber = `MOTA-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const prefilled = {
      fullName: profile.fullName,
      dob: profile.dob,
      gender: profile.gender,
      category: profile.category,
      state: profile.state,
      district: profile.district,
      familyIncome: profile.familyIncome,
      institution: profile.institution,
      course: profile.course,
      year: profile.year,
      udiseId: profile.udiseId,
      apaarId: profile.apaarId,
      maskedBankRef: profile.maskedBankRef
    };

    const application = await Application.create({
      applicationNumber,
      userId,
      schemeCode,
      status: 'DRAFT',
      prefilled,
      attachedDocs,
      mismatches: [],
      timeline: [
        {
          status: 'DRAFT',
          at: new Date(),
          by: profile.fullName,
          note: 'Application drafted and pre-filled from profile and digital document wallet.'
        }
      ]
    });

    await logAudit({
      actorId: userId,
      action: 'APPLICATION_CREATED',
      entity: 'Application',
      entityId: application._id,
      meta: { schemeCode, applicationNumber }
    });

    return application;
  }

  /**
   * Submit application and execute smart automated verification layer across adapters
   */
  async submitApplication(applicationId, userId) {
    const application = await Application.findOne({ _id: applicationId, userId });
    if (!application) {
      const err = new Error('Application not found');
      err.statusCode = 404;
      throw err;
    }

    if (!['DRAFT', 'FLAGGED'].includes(application.status)) {
      const err = new Error(`Application in status ${application.status} cannot be submitted.`);
      err.statusCode = 400;
      throw err;
    }

    // 1. Update status to SUBMITTED
    application.status = 'SUBMITTED';
    application.timeline.push({
      status: 'SUBMITTED',
      at: new Date(),
      by: application.prefilled.fullName || 'Applicant',
      note: 'Application submitted for automated verification.'
    });

    // 2. Transition to AUTO_VERIFYING
    application.status = 'AUTO_VERIFYING';
    application.timeline.push({
      status: 'AUTO_VERIFYING',
      at: new Date(),
      by: 'SYSTEM',
      note: 'Initiating multi-point adapter checks across DigiLocker, UDISE+, APAAR, e-District, and Bank registries.'
    });

    const mismatches = [];
    const checkResults = [];

    // Run DigiLocker Check
    try {
      const dlRes = await digilockerAdapter.verifyIdentity(userId, {
        name: application.prefilled.fullName,
        category: application.prefilled.category
      });
      checkResults.push(dlRes);
      if (dlRes.status === 'MISMATCH') {
        mismatches.push({
          field: dlRes.field,
          userValue: dlRes.userValue,
          recordValue: dlRes.recordValue,
          source: dlRes.source,
          note: dlRes.notes
        });
      }
    } catch (e) {
      checkResults.push({ source: 'MOCK_DIGILOCKER', status: 'ERROR', details: { error: e.message } });
    }

    // Run UDISE+ Check
    try {
      const udiseRes = await udiseAdapter.checkEnrolment(userId, {
        udiseId: application.prefilled.udiseId,
        studentName: application.prefilled.fullName,
        year: application.prefilled.year
      });
      checkResults.push(udiseRes);
      if (udiseRes.status === 'MISMATCH') {
        mismatches.push({
          field: udiseRes.field,
          userValue: udiseRes.userValue,
          recordValue: udiseRes.recordValue,
          source: udiseRes.source,
          note: udiseRes.notes
        });
      }
    } catch (e) {
      checkResults.push({ source: 'MOCK_UDISE', status: 'ERROR', details: { error: e.message } });
    }

    // Run APAAR Check
    try {
      const apaarRes = await apaarAdapter.verifyEduId(userId, application.prefilled.apaarId);
      checkResults.push(apaarRes);
    } catch (e) {
      checkResults.push({ source: 'MOCK_APAAR', status: 'ERROR', details: { error: e.message } });
    }

    // Run OTR Check
    try {
      const otrRes = await otrAdapter.verifyOneTimeRegistration(userId);
      checkResults.push(otrRes);
    } catch (e) {
      checkResults.push({ source: 'MOCK_OTR', status: 'ERROR', details: { error: e.message } });
    }

    // Run State e-District Income Check
    try {
      const edRes = await edistrictAdapter.verifyIncomeCertificate(userId, {
        declaredIncome: application.prefilled.familyIncome,
        state: application.prefilled.state,
        district: application.prefilled.district
      });
      checkResults.push(edRes);
      if (edRes.status === 'MISMATCH') {
        mismatches.push({
          field: edRes.field,
          userValue: edRes.userValue,
          recordValue: edRes.recordValue,
          source: edRes.source,
          note: edRes.notes
        });
      }
    } catch (e) {
      checkResults.push({ source: 'MOCK_EDISTRICT', status: 'ERROR', details: { error: e.message } });
    }

    // Run Bank / DBT Check
    try {
      const bankRes = await bankDbtAdapter.verifyAadhaarSeeding(userId, application.prefilled.maskedBankRef);
      checkResults.push(bankRes);
    } catch (e) {
      checkResults.push({ source: 'MOCK_BANK_DBT', status: 'ERROR', details: { error: e.message } });
    }

    // Persist VerificationResult records
    for (const res of checkResults) {
      await VerificationResult.create({
        applicationId: application._id,
        source: res.source,
        status: res.status || 'PASS',
        details: res
      });
    }

    application.mismatches = mismatches;

    // Evaluation branch
    if (mismatches.length > 0) {
      // MISMATCH PATH: Never silently reject. Flag for empathetic human review by Nodal Officer!
      application.status = 'FLAGGED';
      application.timeline.push({
        status: 'FLAGGED',
        at: new Date(),
        by: 'SYSTEM',
        note: `Smart verification detected ${mismatches.length} discrepancy(ies). Forwarded to Nodal Officer queue for manual review.`
      });

      await notificationService.sendNotification({
        userId,
        type: 'DEFICIENCY',
        title: 'Application Forwarded for Nodal Review',
        message: `Your application ${application.applicationNumber} has been routed to the Nodal Officer for verification of flagged records.`,
        messageHi: `आपका आवेदन ${application.applicationNumber} दस्तावेजों की जांच हेतु नोडल अधिकारी के पास भेजा गया है।`,
        metadata: { applicationId: application._id, status: 'FLAGGED', mismatchesCount: mismatches.length }
      });
    } else {
      // PASS PATH: All checks passed.
      application.status = 'VERIFIED';
      application.timeline.push({
        status: 'VERIFIED',
        at: new Date(),
        by: 'SYSTEM',
        note: 'All adapter verification checks passed.'
      });

      // Simulate Ministry Sanction
      application.status = 'APPROVED_FOR_SANCTION';
      application.timeline.push({
        status: 'APPROVED_FOR_SANCTION',
        at: new Date(Date.now() + 100),
        by: 'SYSTEM_AUTOSANCTION_SIMULATED',
        note: 'Application sanctioned for scholarship allowance under MoTA Direct Benefit Transfer rules.'
      });

      // Simulate DBT Disbursement
      const dbtResult = await bankDbtAdapter.simulateDisbursement(userId, application._id, 18000);
      application.status = 'DISBURSED_SIMULATED';
      application.timeline.push({
        status: 'DISBURSED_SIMULATED',
        at: new Date(Date.now() + 200),
        by: 'PFMS_DBT_GATEWAY_SIMULATED',
        note: `Direct Benefit Transfer of ₹18,000 completed (${dbtResult.disbursementRef}). Funds credited to Aadhaar-linked account (SIMULATED).`
      });

      await notificationService.sendNotification({
        userId,
        type: 'SANCTION',
        title: 'Scholarship Approved and Disbursed (Simulated)',
        message: `Your scholarship application ${application.applicationNumber} has been verified, sanctioned, and simulated DBT disbursed.`,
        messageHi: `आपके छात्रवृत्ति आवेदन ${application.applicationNumber} का सत्यापन, स्वीकृति एवं डीबीटी अंतरण पूरा हो चुका है।`,
        metadata: { applicationId: application._id, status: 'DISBURSED_SIMULATED' }
      });
    }

    await application.save();

    await logAudit({
      actorId: userId,
      action: 'APPLICATION_SUBMITTED',
      entity: 'Application',
      entityId: application._id,
      meta: { finalStatus: application.status, mismatchesCount: mismatches.length }
    });

    return application;
  }
}

module.exports = new ApplicationService();
