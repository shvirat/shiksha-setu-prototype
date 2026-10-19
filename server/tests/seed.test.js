const { connectDB, disconnectDB } = require('../src/config/db');
const { seedDatabase } = require('../seed/seed');
const {
  User,
  StudentProfile,
  Scheme,
  Application,
  EnrollmentRecord,
  KnowledgeDoc,
  ConsentRecord
} = require('../src/models');

beforeAll(async () => {
  await connectDB(true);
});

afterAll(async () => {
  await disconnectDB();
});

describe('Database Seed Script Validation', () => {
  test('seedDatabase should populate all collections properly', async () => {
    const result = await seedDatabase();
    expect(result.schemesCount).toBe(5);
    expect(result.officersCount).toBe(2);
    expect(result.usersCount).toBe(25);

    // Verify Schemes
    const schemes = await Scheme.find({});
    expect(schemes.length).toBe(5);
    const postMatric = schemes.find((s) => s.code === 'MOTA-POST-MATRIC');
    expect(postMatric).toBeDefined();
    expect(postMatric.sample).toBe(true);
    expect(postMatric.eligibilityRules.conflictsWith).toContain('MOTA-TOP-CLASS');

    // Verify Officers
    const officers = await User.find({ role: 'officer' });
    expect(officers.length).toBe(2);
    const motaOfficer = officers.find((o) => o.email === 'officer.mota@gov.in');
    expect(motaOfficer).toBeDefined();

    // Verify Students and Profiles
    const students = await User.find({ role: 'student' });
    expect(students.length).toBe(25);
    const profiles = await StudentProfile.find({});
    expect(profiles.length).toBe(25);

    // Verify Enrollment Records for Coverage Gap Finder
    const enrollments = await EnrollmentRecord.find({});
    expect(enrollments.length).toBe(200);

    // Verify Knowledge Documents
    const knowledgeDocs = await KnowledgeDoc.find({});
    expect(knowledgeDocs.length).toBeGreaterThanOrEqual(15);

    // Verify Consent Records
    const consents = await ConsentRecord.find({});
    expect(consents.length).toBeGreaterThanOrEqual(25);

    // Verify Flagged Mismatch Application
    const flaggedApps = await Application.find({ status: 'FLAGGED' });
    expect(flaggedApps.length).toBeGreaterThan(0);
    const shantiApp = flaggedApps.find((a) =>
      a.mismatches.some((m) => m.field === 'fullName')
    );
    expect(shantiApp).toBeDefined();
  });
});
