const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { User, StudentProfile, AuditLog } = require('../src/models');

beforeAll(async () => {
  await connectDB(true);
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await AuditLog.deleteMany({});
});

describe('Authentication & RBAC API Endpoints', () => {
  const sampleStudent = {
    name: 'Somra Tirkey',
    email: 'somra.tirkey@test.in',
    mobile: '9876543210',
    password: 'Password@123',
    role: 'student',
    language: 'en',
    profile: {
      fullName: 'Somra Tirkey',
      dob: '2004-05-12',
      gender: 'male',
      category: 'ST',
      state: 'Jharkhand',
      district: 'Simdega',
      familyIncome: 140000,
      institution: 'Simdega College',
      course: 'B.A Sociology',
      year: 1
    }
  };

  test('POST /api/auth/register should register a new student and create profile', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleStudent);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('somra.tirkey@test.in');
    expect(res.body.data.user.role).toBe('student');
    expect(res.body.data.profile.fullName).toBe('Somra Tirkey');
    expect(res.body.data.profile.familyIncome).toBe(140000);

    // Verify audit log
    const auditLogs = await AuditLog.find({ action: 'USER_REGISTERED' });
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0].entity).toBe('User');
  });

  test('POST /api/auth/register should fail on duplicate email', async () => {
    await request(app).post('/api/auth/register').send(sampleStudent);
    const res = await request(app).post('/api/auth/register').send(sampleStudent);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_IN_USE');
  });

  test('POST /api/auth/login should authenticate valid credentials and reject invalid ones', async () => {
    await request(app).post('/api/auth/register').send(sampleStudent);

    // Valid login
    const validLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'somra.tirkey@test.in', password: 'Password@123' });

    expect(validLogin.status).toBe(200);
    expect(validLogin.body.success).toBe(true);
    expect(validLogin.body.data.token).toBeDefined();

    // Invalid password
    const invalidLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'somra.tirkey@test.in', password: 'WrongPassword' });

    expect(invalidLogin.status).toBe(401);
    expect(invalidLogin.body.success).toBe(false);
    expect(invalidLogin.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('GET /api/auth/me should return current user with valid Bearer token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(sampleStudent);
    const token = regRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe('somra.tirkey@test.in');
    expect(meRes.body.data.profile.institution).toBe('Simdega College');
  });

  test('GET /api/auth/me should reject request with missing or malformed token', async () => {
    const resNoToken = await request(app).get('/api/auth/me');
    expect(resNoToken.status).toBe(401);
    expect(resNoToken.body.error.code).toBe('UNAUTHORIZED');

    const resBadToken = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-string');
    expect(resBadToken.status).toBe(401);
    expect(resBadToken.body.error.code).toBe('INVALID_TOKEN');
  });
});
