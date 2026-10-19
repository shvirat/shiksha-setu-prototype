const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const {
  User,
  StudentProfile,
  Scheme,
  Application,
  EnrollmentRecord,
  Notification,
  AuditLog
} = require('../src/models');
const { seedDatabase } = require('../seed/seed');

let officerToken = null;
let studentToken = null;
let flaggedAppId = null;

beforeAll(async () => {
  await connectDB(true);
  await seedDatabase();

  // Login officer
  const officerLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'officer.mota@gov.in', password: 'Officer@123' });
  officerToken = officerLogin.body.data.token;

  // Login student
  const studentLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'shanti.oraon@example.in', password: 'Student@123' });
  studentToken = studentLogin.body.data.token;

  // Find a seeded flagged application
  const flagged = await Application.findOne({ status: 'FLAGGED' });
  flaggedAppId = flagged._id;
});

afterAll(async () => {
  await disconnectDB();
});

describe('Phase 3: Officer Portal, Coverage Gap Finder & Analytics', () => {
  // 1. RBAC Guard Enforcement
  test('Student accessing officer routes must be rejected with 403 FORBIDDEN', async () => {
    const res = await request(app)
      .get('/api/officer/queue')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // 2. Verification Queue
  test('Officer can retrieve verification queue of FLAGGED applications', async () => {
    const res = await request(app)
      .get('/api/officer/queue')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.applications.length).toBeGreaterThan(0);
    expect(res.body.data.applications.every((a) => ['FLAGGED', 'UNDER_REVIEW', 'SUBMITTED'].includes(a.status))).toBe(true);
  });

  // 3. Application Details for Review Drawer
  test('Officer can view application details, comparison data, and documents', async () => {
    const res = await request(app)
      .get(`/api/officer/applications/${flaggedAppId}`)
      .set('Authorization', `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.application._id).toBe(String(flaggedAppId));
    expect(res.body.data.application.mismatches.length).toBeGreaterThan(0);
  });

  // 4. Decision Flow: Approve
  test('Officer can APPROVE a flagged application with remarks', async () => {
    const res = await request(app)
      .post(`/api/officer/applications/${flaggedAppId}/decision`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        decision: 'APPROVE',
        remarks: 'Spelling variation verified with manual sub-collector certificate. Approved for grant.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.application.status).toBe('DISBURSED_SIMULATED');

    // Verify audit log
    const audit = await AuditLog.findOne({
      entityId: String(flaggedAppId),
      action: 'APPLICATION_APPROVED'
    });
    expect(audit).toBeDefined();
  });

  // 5. Decision Flow: Reject with Mandatory Remarks and Recommended Alternatives
  test('Officer rejection requires remarks and attaches recommended alternative schemes', async () => {
    // Pick another flagged or verified application
    const anotherApp = await Application.findOne({ status: { $in: ['FLAGGED', 'VERIFIED'] } });

    // Missing remarks should fail
    const failRes = await request(app)
      .post(`/api/officer/applications/${anotherApp._id}/decision`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ decision: 'REJECT', remarks: '' });

    expect(failRes.status).toBe(400);
    expect(failRes.body.error.code).toBe('REMARKS_REQUIRED');

    // Valid rejection
    const rejectRes = await request(app)
      .post(`/api/officer/applications/${anotherApp._id}/decision`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        decision: 'REJECT',
        remarks: 'Course not accredited for Top Class scheme. Recommended to apply under Post-Matric.',
        recommendedSchemes: ['MOTA-POST-MATRIC']
      });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.data.application.status).toBe('REJECTED');
    expect(rejectRes.body.data.application.rejectionReason).toContain('Course not accredited');
    expect(rejectRes.body.data.application.recommendedSchemes).toContain('MOTA-POST-MATRIC');
  });

  // 6. Coverage Gap Finder
  test('Coverage Gap Finder returns unreached ST students from enrollment records', async () => {
    const res = await request(app)
      .get('/api/officer/coverage-gaps')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalEnrolled).toBe(200);
    expect(res.body.data.summary.unreachedGaps).toBeGreaterThan(0);
    expect(res.body.data.gaps.length).toBeGreaterThan(0);
    expect(res.body.data.gaps[0].outreachStatus).toBe('ELIGIBLE_UNREACHED');
  });

  test('Coverage Gap Finder exports valid CSV', async () => {
    const res = await request(app)
      .get('/api/officer/coverage-gaps?format=csv')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('UDISE ID,Student Name');
  });

  // 7. Analytics Endpoint
  test('Officer analytics returns key figures and status breakdown', async () => {
    const res = await request(app)
      .get('/api/officer/analytics')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.keyFigures.totalApplications).toBeGreaterThan(0);
    expect(res.body.data.keyFigures.averageProcessingDays).toBe(1.8);
    expect(res.body.data.statusBreakdown).toBeDefined();
    expect(res.body.data.schemeBreakdown).toBeDefined();
  });
});
