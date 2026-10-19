const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const {
  User,
  StudentProfile,
  Scheme,
  Application,
  Document,
  ConsentRecord,
  Notification,
  VerificationResult
} = require('../src/models');
const { encryptBuffer, decryptBuffer } = require('../src/utils/crypto');
const digilockerAdapter = require('../src/adapters/digilockerAdapter');
const { recordConsent } = require('../src/services/consentService');
const { evaluateEligibility } = require('../src/services/eligibilityService');

let studentToken = null;
let studentUser = null;

beforeAll(async () => {
  await connectDB(true);
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await Scheme.deleteMany({});
  await Application.deleteMany({});
  await Document.deleteMany({});
  await ConsentRecord.deleteMany({});
  await Notification.deleteMany({});
  await VerificationResult.deleteMany({});

  // Seed standard schemes
  await Scheme.create([
    {
      code: 'MOTA-POST-MATRIC',
      name: 'Post-Matric Scholarship for ST Students',
      description: 'Financial support for post-matric ST students',
      level: 'Post-Matric',
      eligibilityRules: {
        incomeCeiling: 250000,
        allowedCategories: ['ST'],
        minCourseYear: 1,
        maxCourseYear: 5,
        conflictsWith: ['MOTA-TOP-CLASS']
      },
      requiredDocs: [{ type: 'st_certificate', name: 'ST Certificate', mandatory: true }],
      sample: true
    },
    {
      code: 'MOTA-TOP-CLASS',
      name: 'Top Class Education for ST Students',
      description: 'Full funding for top institutes',
      level: 'Higher Education',
      eligibilityRules: {
        incomeCeiling: 600000,
        allowedCategories: ['ST'],
        minCourseYear: 1,
        maxCourseYear: 5,
        conflictsWith: ['MOTA-POST-MATRIC']
      },
      requiredDocs: [{ type: 'st_certificate', name: 'ST Certificate', mandatory: true }],
      sample: true
    }
  ]);

  // Create a base student
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Birsa Munda',
      email: 'birsa.munda@test.in',
      mobile: '9876543210',
      password: 'Password@123',
      role: 'student',
      profile: {
        fullName: 'Birsa Munda',
        dob: '2004-03-15',
        gender: 'male',
        category: 'ST',
        state: 'Jharkhand',
        district: 'Khunti',
        familyIncome: 140000,
        institution: 'Birsa Munda College',
        course: 'B.Sc Botany',
        year: 2,
        udiseId: 'UDISE-2026-1001',
        apaarId: 'APAAR-90001001',
        maskedBankRef: 'XXXX-XXXX-8921'
      }
    });

  studentToken = regRes.body.data.token;
  studentUser = regRes.body.data.user;

  // Grant consents for Birsa Munda
  const sources = ['MOCK_DIGILOCKER', 'MOCK_UDISE', 'MOCK_APAAR', 'MOCK_OTR', 'MOCK_EDISTRICT', 'MOCK_BANK_DBT'];
  for (const src of sources) {
    await recordConsent({
      userId: studentUser._id,
      source: src,
      purpose: 'Identity, caste, academic and income auto-verification for MoTA scholarships'
    });
  }
});

describe('Phase 2: Document Wallet, Encryption, Eligibility & Verification', () => {
  // 1. Document Encryption Round-Trip
  test('AES-256-GCM encryption round-trip correctly preserves data', () => {
    const originalText = 'Shiksha Setu Confidential Document Content: ST Certificate #JH-98231';
    const originalBuffer = Buffer.from(originalText, 'utf-8');

    const encrypted = encryptBuffer(originalBuffer);
    expect(encrypted).not.toEqual(originalBuffer);
    expect(encrypted.length).toBeGreaterThan(originalBuffer.length);

    const decrypted = decryptBuffer(encrypted);
    expect(decrypted.toString('utf-8')).toBe(originalText);
  });

  // 2. Consent Enforcement on Adapters
  test('Mock adapter without user consent must throw 403 CONSENT_REQUIRED', async () => {
    // Create new unconsenting user
    const unconsentingUser = await User.create({
      name: 'Unconsenting Student',
      email: 'unconsenting@test.in',
      mobile: '9876543299',
      passwordHash: 'hash',
      role: 'student'
    });

    await expect(
      digilockerAdapter.verifyIdentity(unconsentingUser._id, { name: 'Unconsenting Student' })
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'CONSENT_REQUIRED'
    });
  });

  // 3. Eligibility Engine & Conflict Detection
  test('Eligibility engine returns eligible scheme and detects conflict with existing application', async () => {
    // Initially, Birsa is eligible for both
    const initialEval = await evaluateEligibility(studentUser._id);
    expect(initialEval.eligible.length).toBe(2);
    expect(initialEval.conflicts.length).toBe(0);

    // Apply for MOTA-POST-MATRIC
    await Application.create({
      applicationNumber: 'MOTA-2026-TEST01',
      userId: studentUser._id,
      schemeCode: 'MOTA-POST-MATRIC',
      status: 'VERIFIED'
    });

    // Re-evaluate eligibility: MOTA-TOP-CLASS must now have conflict flag
    const postEval = await evaluateEligibility(studentUser._id);
    const topClass = postEval.eligible.find((e) => e.scheme.code === 'MOTA-TOP-CLASS');
    expect(topClass.hasConflict).toBe(true);
    expect(topClass.conflictDetails.message).toContain('Cannot be held together with Post-Matric');
    expect(postEval.conflicts.length).toBe(1);
  });

  test('Eligibility engine marks student ineligible if income exceeds ceiling', async () => {
    await StudentProfile.updateOne({ userId: studentUser._id }, { $set: { familyIncome: 450000 } });

    const evalResult = await evaluateEligibility(studentUser._id);
    const postMatricIneligible = evalResult.ineligible.find((i) => i.scheme.code === 'MOTA-POST-MATRIC');
    expect(postMatricIneligible).toBeDefined();
    expect(postMatricIneligible.reasons[0]).toContain('exceeds the scheme ceiling');
  });

  // 4. Verification Mismatch Handling (Never silently reject, must end FLAGGED)
  test('Mismatched applicant (Shanti Oraon) transitions to FLAGGED, never rejected', async () => {
    const shantiReg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Shanti Oraon',
        email: 'shanti.oraon@test.in',
        mobile: '9876543211',
        password: 'Password@123',
        role: 'student',
        profile: {
          fullName: 'Shanti Oraon',
          dob: '2004-01-01',
          gender: 'female',
          category: 'ST',
          state: 'Jharkhand',
          district: 'Gumla',
          familyIncome: 150000,
          institution: 'Ranchi College',
          course: 'B.A',
          year: 1
        }
      });

    const shantiToken = shantiReg.body.data.token;
    const shantiId = shantiReg.body.data.user._id;

    // Grant consent
    const sources = ['MOCK_DIGILOCKER', 'MOCK_UDISE', 'MOCK_APAAR', 'MOCK_OTR', 'MOCK_EDISTRICT', 'MOCK_BANK_DBT'];
    for (const src of sources) {
      await recordConsent({ userId: shantiId, source: src, purpose: 'Identity, caste, academic and income auto-verification for MoTA scholarships' });
    }

    // Create draft application
    const draftRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${shantiToken}`)
      .send({ schemeCode: 'MOTA-POST-MATRIC' });

    expect(draftRes.status).toBe(201);
    const appId = draftRes.body.data.application._id;

    // Submit application
    const submitRes = await request(app)
      .post(`/api/applications/${appId}/submit`)
      .set('Authorization', `Bearer ${shantiToken}`);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.application.status).toBe('FLAGGED');
    expect(submitRes.body.data.application.mismatches.length).toBeGreaterThan(0);
    expect(submitRes.body.data.application.mismatches[0].field).toBe('fullName');
    expect(submitRes.body.data.application.mismatches[0].recordValue).toBe('Shanti Uraon');

    // Verify in-app deficiency notification was created
    const notif = await Notification.findOne({ userId: shantiId });
    expect(notif).toBeDefined();
    expect(notif.type).toBe('DEFICIENCY');
  });

  // 5. Clean Applicant Pass Path to Simulated Sanction and DBT Disbursement
  test('Clean applicant passes smart auto-verification and transitions to simulated DBT disbursed', async () => {
    // Create draft
    const draftRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ schemeCode: 'MOTA-POST-MATRIC' });

    const appId = draftRes.body.data.application._id;

    // Submit
    const submitRes = await request(app)
      .post(`/api/applications/${appId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(submitRes.status).toBe(200);
    const appData = submitRes.body.data.application;
    expect(appData.status).toBe('DISBURSED_SIMULATED');
    expect(appData.mismatches.length).toBe(0);

    // Verify timeline has full sequence
    const timelineStatuses = appData.timeline.map((t) => t.status);
    expect(timelineStatuses).toContain('DRAFT');
    expect(timelineStatuses).toContain('SUBMITTED');
    expect(timelineStatuses).toContain('AUTO_VERIFYING');
    expect(timelineStatuses).toContain('VERIFIED');
    expect(timelineStatuses).toContain('APPROVED_FOR_SANCTION');
    expect(timelineStatuses).toContain('DISBURSED_SIMULATED');

    // Verify sanction notification
    const sanctionNotif = await Notification.findOne({ userId: studentUser._id, type: 'SANCTION' });
    expect(sanctionNotif).toBeDefined();
  });

  // 6. Document Upload & Retrieval API
  test('POST /api/documents uploads encrypted file and GET /api/documents lists it', async () => {
    const fakePdfBuffer = Buffer.from('%PDF-1.4 Mock ST Certificate Content', 'utf-8');

    const uploadRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('type', 'st_certificate')
      .attach('file', fakePdfBuffer, 'caste_cert.pdf');

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.data.document.type).toBe('st_certificate');
    expect(uploadRes.body.data.document.encrypted).toBe(true);

    const listRes = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.documents.length).toBe(1);
  });
});
