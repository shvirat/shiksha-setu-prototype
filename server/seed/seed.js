const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { connectDB, disconnectDB } = require('../src/config/db');
const {
  User,
  StudentProfile,
  Document,
  Scheme,
  Application,
  VerificationResult,
  ConsentRecord,
  Notification,
  AuditLog,
  EnrollmentRecord,
  KnowledgeDoc
} = require('../src/models');

let schemesData;
let knowledgeData;

try {
  schemesData = require('./schemes.json');
} catch (_) {
  schemesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'schemes.json'), 'utf-8'));
}

try {
  knowledgeData = require('./knowledge.json');
} catch (_) {
  knowledgeData = JSON.parse(fs.readFileSync(path.join(__dirname, 'knowledge.json'), 'utf-8'));
}

const tribalStudentTemplates = [
  { name: 'Birsa Munda', email: 'birsa.munda@example.in', mobile: '9876543210', gender: 'male', state: 'Jharkhand', district: 'Ranchi', income: 140000, inst: 'Birsa Munda College, Khunti', course: 'B.Sc Botany', year: 2, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Shanti Oraon', email: 'shanti.oraon@example.in', mobile: '9876543211', gender: 'female', state: 'Jharkhand', district: 'Gumla', income: 160000, inst: 'Ranchi Women’s College', course: 'B.A History', year: 1, level: 'Post-Matric', scenario: 'name_mismatch' },
  { name: 'Sukra Kole', email: 'sukra.kole@example.in', mobile: '9876543212', gender: 'male', state: 'Odisha', district: 'Mayurbhanj', income: 120000, inst: 'Mayurbhanj Higher Secondary School', course: 'Class 10', year: 10, level: 'Pre-Matric', scenario: 'income_mismatch' },
  { name: 'Anjali Marandi', email: 'anjali.marandi@example.in', mobile: '9876543213', gender: 'female', state: 'Jharkhand', district: 'Dumka', income: 180000, inst: 'Indian Institute of Technology, Dhanbad', course: 'B.Tech Mining Engineering', year: 3, level: 'Higher Education', scenario: 'clean' },
  { name: 'Rahul Soren', email: 'rahul.soren@example.in', mobile: '9876543214', gender: 'male', state: 'West Bengal', district: 'Purulia', income: 150000, inst: 'Sidho-Kanho-Birsha University', course: 'M.A Tribal Studies', year: 1, level: 'Higher Education', scenario: 'clean' },
  { name: 'Sunita Baski', email: 'sunita.baski@example.in', mobile: '9876543215', gender: 'female', state: 'Jharkhand', district: 'East Singhbhum', income: 190000, inst: 'Jamshedpur Co-operative College', course: 'B.Com', year: 2, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Mangal Murmu', email: 'mangal.murmu@example.in', mobile: '9876543216', gender: 'male', state: 'Odisha', district: 'Keonjhar', income: 130000, inst: 'Dharani Dhar University', course: 'B.Sc Physics', year: 1, level: 'Post-Matric', scenario: 'academic_mismatch' },
  { name: 'Kavita Gond', email: 'kavita.gond@example.in', mobile: '9876543217', gender: 'female', state: 'Madhya Pradesh', district: 'Mandla', income: 175000, inst: 'Government Rani Durgavati College', course: 'B.A Sociology', year: 2, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Dinesh Bhil', email: 'dinesh.bhil@example.in', mobile: '9876543218', gender: 'male', state: 'Rajasthan', district: 'Banswara', income: 155000, inst: 'Govt. Govind Guru College', course: 'B.Sc Agriculture', year: 3, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Pooja Meena', email: 'pooja.meena@example.in', mobile: '9876543219', gender: 'female', state: 'Rajasthan', district: 'Udaipur', income: 240000, inst: 'Mohanlal Sukhadia University', course: 'B.A Hindi', year: 1, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Somra Tirkey', email: 'somra.tirkey@example.in', mobile: '9876543220', gender: 'male', state: 'Jharkhand', district: 'Simdega', income: 110000, inst: 'Simdega College', course: 'Class 12 Intermediate', year: 2, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Champa Hembrom', email: 'champa.hembrom@example.in', mobile: '9876543221', gender: 'female', state: 'Jharkhand', district: 'Pakur', income: 145000, inst: 'K.K.M. College, Pakur', course: 'B.A Political Science', year: 2, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Laxman Munda', email: 'laxman.munda@example.in', mobile: '9876543222', gender: 'male', state: 'Jharkhand', district: 'Khunti', income: 135000, inst: 'Khunti Higher Secondary School', course: 'Class 9', year: 9, level: 'Pre-Matric', scenario: 'clean' },
  { name: 'Basanti Kujur', email: 'basanti.kujur@example.in', mobile: '9876543223', gender: 'female', state: 'Chhattisgarh', district: 'Bastar', income: 165000, inst: 'Bastar University', course: 'B.A Geography', year: 2, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Ravi Kerketta', email: 'ravi.kerketta@example.in', mobile: '9876543224', gender: 'male', state: 'Jharkhand', district: 'Ranchi', income: 520000, inst: 'National Institute of Technology, Jamshedpur', course: 'B.Tech Electrical Engineering', year: 2, level: 'Higher Education', scenario: 'clean' },
  { name: 'Meena Santhal', email: 'meena.santhal@example.in', mobile: '9876543225', gender: 'female', state: 'West Bengal', district: 'Bankura', income: 140000, inst: 'Bankura Christian College', course: 'B.Sc Mathematics', year: 3, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Budhan Toppo', email: 'budhan.toppo@example.in', mobile: '9876543226', gender: 'male', state: 'Jharkhand', district: 'Lohardaga', income: 125000, inst: 'BS College, Lohardaga', course: 'B.A Economics', year: 1, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Sarita Baiga', email: 'sarita.baiga@example.in', mobile: '9876543227', gender: 'female', state: 'Madhya Pradesh', district: 'Dindori', income: 115000, inst: 'Govt College, Dindori', course: 'Class 10', year: 10, level: 'Pre-Matric', scenario: 'clean' },
  { name: 'Karan Sahariya', email: 'karan.sahariya@example.in', mobile: '9876543228', gender: 'male', state: 'Rajasthan', district: 'Baran', income: 105000, inst: 'Shahabad Secondary School', course: 'Class 9', year: 9, level: 'Pre-Matric', scenario: 'clean' },
  { name: 'Anita Korku', email: 'anita.korku@example.in', mobile: '9876543229', gender: 'female', state: 'Maharashtra', district: 'Amravati', income: 195000, inst: 'Sant Gadge Baba Amravati University', course: 'M.Sc Botany', year: 1, level: 'Higher Education', scenario: 'clean' },
  { name: 'Gopal Kol', email: 'gopal.kol@example.in', mobile: '9876543230', gender: 'male', state: 'Uttar Pradesh', district: 'Sonbhadra', income: 130000, inst: 'Government Degree College, Obra', course: 'B.A English', year: 2, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Rani Birhor', email: 'rani.birhor@example.in', mobile: '9876543231', gender: 'female', state: 'Jharkhand', district: 'Hazaribagh', income: 90000, inst: 'St. Columba’s College', course: 'B.A History', year: 1, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Suraj Kharia', email: 'suraj.kharia@example.in', mobile: '9876543232', gender: 'male', state: 'Odisha', district: 'Sundargarh', income: 150000, inst: 'Rourkela Autonomous College', course: 'B.Com', year: 3, level: 'Post-Matric', scenario: 'clean' },
  { name: 'Devki Chenchu', email: 'devki.chenchu@example.in', mobile: '9876543233', gender: 'female', state: 'Andhra Pradesh', district: 'Prakasam', income: 110000, inst: 'Nagarjuna University', course: 'M.A Social Work', year: 2, level: 'Higher Education', scenario: 'clean' },
  { name: 'Vikram Bodo', email: 'vikram.bodo@example.in', mobile: '9876543234', gender: 'male', state: 'Assam', district: 'Kokrajhar', income: 185000, inst: 'Bodoland University', course: 'B.Sc Computer Science', year: 2, level: 'Post-Matric', scenario: 'clean' }
];

async function seedDatabase() {
  console.log('[Seed] Starting Shiksha Setu database seeding...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    Document.deleteMany({}),
    Scheme.deleteMany({}),
    Application.deleteMany({}),
    VerificationResult.deleteMany({}),
    ConsentRecord.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
    EnrollmentRecord.deleteMany({}),
    KnowledgeDoc.deleteMany({})
  ]);
  console.log('[Seed] Cleared existing collections.');

  // 1. Seed Schemes
  await Scheme.insertMany(schemesData);
  console.log(`[Seed] Seeded ${schemesData.length} scholarship schemes.`);

  // 2. Seed Knowledge Documents
  await KnowledgeDoc.insertMany(knowledgeData);
  console.log(`[Seed] Seeded ${knowledgeData.length} bilingual knowledge documents.`);

  // 3. Seed Officers
  const officerSalt = await bcrypt.genSalt(10);
  const officerPasswordHash = await bcrypt.hash('Officer@123', officerSalt);

  const officers = await User.insertMany([
    {
      name: 'Dr. Rameshwar Oraon',
      email: 'officer.mota@gov.in',
      mobile: '9123456780',
      passwordHash: officerPasswordHash,
      role: 'officer',
      language: 'en'
    },
    {
      name: 'Smt. Sushila Murmu',
      email: 'officer.jharkhand@gov.in',
      mobile: '9123456781',
      passwordHash: officerPasswordHash,
      role: 'officer',
      language: 'hi'
    }
  ]);
  console.log(`[Seed] Seeded ${officers.length} Nodal Officer accounts.`);

  // 4. Seed 25 Students
  const studentSalt = await bcrypt.genSalt(10);
  const studentPasswordHash = await bcrypt.hash('Student@123', studentSalt);

  const seededUsers = [];
  const seededProfiles = [];
  const seededDocuments = [];
  const seededApplications = [];
  const seededConsents = [];
  const seededVerifications = [];
  const seededNotifications = [];

  for (let i = 0; i < tribalStudentTemplates.length; i++) {
    const s = tribalStudentTemplates[i];
    const userId = new mongoose.Types.ObjectId();

    const user = {
      _id: userId,
      name: s.name,
      email: s.email,
      mobile: s.mobile,
      passwordHash: studentPasswordHash,
      role: 'student',
      language: i % 2 === 0 ? 'en' : 'hi'
    };
    seededUsers.push(user);

    const udiseId = `UDISE-2026-${(1000 + i).toString()}`;
    const apaarId = `APAAR-${(90000000 + i).toString()}`;

    const profile = {
      userId,
      fullName: s.name,
      dob: `200${(i % 5) + 2}-0${(i % 8) + 1}-15`,
      gender: s.gender,
      category: 'ST',
      state: s.state,
      district: s.district,
      familyIncome: s.income,
      institution: s.inst,
      course: s.course,
      year: s.year,
      udiseId,
      apaarId,
      maskedBankRef: `XXXX-XXXX-${(2000 + i).toString()}`
    };
    seededProfiles.push(profile);

    // Seed consent records for all integrations
    const consentSources = ['MOCK_DIGILOCKER', 'MOCK_UDISE', 'MOCK_APAAR', 'MOCK_OTR', 'MOCK_EDISTRICT', 'MOCK_BANK_DBT'];
    for (const src of consentSources) {
      seededConsents.push({
        userId,
        source: src,
        purpose: 'Identity, caste, academic and income auto-verification for MoTA scholarships',
        grantedAt: new Date(Date.now() - 3600000 * 24 * 7)
      });
    }

    // Seed digital wallet documents
    const docTypes = ['st_certificate', 'income_certificate', 'marksheet', 'bank_passbook'];
    const userDocs = [];
    for (const dType of docTypes) {
      const docId = new mongoose.Types.ObjectId();
      const doc = {
        _id: docId,
        userId,
        type: dType,
        originalName: `${dType}_${s.name.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        storedPath: `uploads/mock_${dType}_${userId}.pdf`,
        encrypted: true,
        status: 'VERIFIED',
        source: 'MOCK_DIGILOCKER',
        uploadedAt: new Date(Date.now() - 3600000 * 24 * 10),
        expiresAt: dType === 'income_certificate' ? new Date(Date.now() + 3600000 * 24 * 180) : null
      };
      userDocs.push(doc);
      seededDocuments.push(doc);
    }

    // Seed sample applications for the first 15 students
    if (i < 15) {
      let schemeCode = 'MOTA-POST-MATRIC';
      if (s.level === 'Pre-Matric') schemeCode = 'MOTA-PRE-MATRIC';
      if (s.level === 'Higher Education') schemeCode = s.income > 400000 ? 'MOTA-TOP-CLASS' : 'MOTA-FELLOWSHIP';

      let appStatus = 'VERIFIED';
      const mismatches = [];
      const timeline = [
        { status: 'SUBMITTED', at: new Date(Date.now() - 3600000 * 48), by: s.name, note: 'Application submitted online' },
        { status: 'AUTO_VERIFYING', at: new Date(Date.now() - 3600000 * 47), by: 'SYSTEM', note: 'Running automated adapter checks' }
      ];

      if (s.scenario === 'name_mismatch') {
        appStatus = 'FLAGGED';
        mismatches.push({
          field: 'fullName',
          userValue: s.name,
          recordValue: 'Shanti Uraon',
          source: 'MOCK_DIGILOCKER',
          note: 'Spelling variation between application and Aadhaar/DigiLocker certificate.'
        });
        timeline.push({
          status: 'FLAGGED',
          at: new Date(Date.now() - 3600000 * 46),
          by: 'SYSTEM',
          note: 'Name spelling mismatch detected during DigiLocker verification. Forwarded to Nodal Officer.'
        });
      } else if (s.scenario === 'income_mismatch') {
        appStatus = 'FLAGGED';
        mismatches.push({
          field: 'familyIncome',
          userValue: `₹${s.income.toLocaleString('en-IN')}`,
          recordValue: '₹2,60,000',
          source: 'MOCK_EDISTRICT',
          note: 'Self-declared income differs from State e-District revenue portal record.'
        });
        timeline.push({
          status: 'FLAGGED',
          at: new Date(Date.now() - 3600000 * 45),
          by: 'SYSTEM',
          note: 'Income mismatch detected. Routed to Nodal Officer for verification.'
        });
      } else if (s.scenario === 'academic_mismatch') {
        appStatus = 'FLAGGED';
        mismatches.push({
          field: 'year',
          userValue: 'Year 1',
          recordValue: 'Year 2',
          source: 'MOCK_UDISE',
          note: 'Academic year does not match institutional enrolment register.'
        });
        timeline.push({
          status: 'FLAGGED',
          at: new Date(Date.now() - 3600000 * 44),
          by: 'SYSTEM',
          note: 'Academic progress discrepancy flagged for nodal review.'
        });
      } else if (i === 0) {
        // Birsa Munda is disbursed simulated
        appStatus = 'DISBURSED_SIMULATED';
        timeline.push({ status: 'VERIFIED', at: new Date(Date.now() - 3600000 * 40), by: 'SYSTEM', note: 'All checks passed automatically.' });
        timeline.push({ status: 'APPROVED_FOR_SANCTION', at: new Date(Date.now() - 3600000 * 24), by: 'Dr. Rameshwar Oraon', note: 'Sanction order #MOTA/2026/0892 issued.' });
        timeline.push({ status: 'DISBURSED_SIMULATED', at: new Date(Date.now() - 3600000 * 6), by: 'PFMS/DBT Gateway', note: 'Direct Benefit Transfer of ₹18,000 credited to Aadhaar-linked bank account.' });
      } else if (i === 3) {
        // Anjali Marandi is approved for sanction
        appStatus = 'APPROVED_FOR_SANCTION';
        timeline.push({ status: 'VERIFIED', at: new Date(Date.now() - 3600000 * 20), by: 'SYSTEM', note: 'All institutional records verified.' });
        timeline.push({ status: 'APPROVED_FOR_SANCTION', at: new Date(Date.now() - 3600000 * 4), by: 'Dr. Rameshwar Oraon', note: 'Sanction approved. Awaiting DBT batch dispatch.' });
      } else {
        timeline.push({ status: 'VERIFIED', at: new Date(Date.now() - 3600000 * 30), by: 'SYSTEM', note: 'All auto-verification adapters reported PASS.' });
      }

      const appId = new mongoose.Types.ObjectId();
      const application = {
        _id: appId,
        applicationNumber: `MOTA-2026-${(10000 + i).toString()}`,
        userId,
        schemeCode,
        status: appStatus,
        prefilled: {
          fullName: s.name,
          category: 'ST',
          state: s.state,
          district: s.district,
          institution: s.inst,
          course: s.course,
          year: s.year,
          familyIncome: s.income
        },
        attachedDocs: userDocs.map((d) => ({
          docType: d.type,
          documentId: d._id,
          originalName: d.originalName
        })),
        mismatches,
        timeline
      };
      seededApplications.push(application);

      // Create VerificationResults for the application
      const sources = ['MOCK_DIGILOCKER', 'MOCK_UDISE', 'MOCK_APAAR', 'MOCK_OTR', 'MOCK_EDISTRICT', 'MOCK_BANK_DBT'];
      for (const src of sources) {
        const isMismatchSource = mismatches.some((m) => m.source === src);
        seededVerifications.push({
          applicationId: appId,
          source: src,
          status: isMismatchSource ? 'MISMATCH' : 'PASS',
          details: {
            verifiedAt: new Date(),
            sourcePortal: src,
            notes: isMismatchSource ? 'Difference detected with external registry' : 'Record matched exactly'
          }
        });
      }

      // Add a notification for each student
      seededNotifications.push({
        userId,
        type: appStatus === 'FLAGGED' ? 'DEFICIENCY' : 'STATUS_CHANGE',
        title: appStatus === 'FLAGGED' ? 'Application Under Nodal Review' : 'Application Status Update',
        message:
          appStatus === 'FLAGGED'
            ? `Your application ${application.applicationNumber} has been forwarded to the Nodal Officer for quick manual review.`
            : `Your application ${application.applicationNumber} status is now ${appStatus.replace(/_/g, ' ')}.`,
        messageHi:
          appStatus === 'FLAGGED'
            ? `आपका आवेदन ${application.applicationNumber} नोडल अधिकारी की त्वरित मानवीय समीक्षा हेतु भेजा गया है।`
            : `आपके आवेदन ${application.applicationNumber} की स्थिति अब ${appStatus} है।`,
        metadata: { applicationId: appId, status: appStatus }
      });
    }
  }

  // Bulk insert all student entities in parallel batches
  await Promise.all([
    User.insertMany(seededUsers),
    StudentProfile.insertMany(seededProfiles),
    ConsentRecord.insertMany(seededConsents),
    Document.insertMany(seededDocuments),
    Application.insertMany(seededApplications),
    VerificationResult.insertMany(seededVerifications),
    Notification.insertMany(seededNotifications)
  ]);

  console.log(`[Seed] Seeded ${seededUsers.length} student users and profiles in bulk.`);
  console.log(`[Seed] Seeded ${seededApplications.length} scholarship applications with timelines and verification results in bulk.`);

  // 5. Seed 200 EnrollmentRecords for Coverage Gap Finder
  const statesDistricts = [
    { state: 'Jharkhand', districts: ['Ranchi', 'Khunti', 'Dumka', 'Gumla', 'Simdega', 'West Singhbhum'] },
    { state: 'Odisha', districts: ['Mayurbhanj', 'Sundargarh', 'Keonjhar', 'Koraput', 'Rayagada'] },
    { state: 'Madhya Pradesh', districts: ['Mandla', 'Dindori', 'Barwani', 'Jhabua', 'Alirajpur'] },
    { state: 'Rajasthan', districts: ['Banswara', 'Dungarpur', 'Udaipur', 'Pratapgarh'] },
    { state: 'Chhattisgarh', districts: ['Bastar', 'Dantewada', 'Bijapur', 'Sukma', 'Kanker'] }
  ];

  const tribalSurnames = ['Munda', 'Oraon', 'Soren', 'Murmu', 'Marandi', 'Baski', 'Hembrom', 'Kole', 'Tirkey', 'Kerketta', 'Toppo', 'Gond', 'Bhil', 'Baiga', 'Kharwar', 'Ho'];
  const firstNames = ['Amit', 'Sunil', 'Pooja', 'Laxmi', 'Anita', 'Rajesh', 'Sanjay', 'Geeta', 'Sita', 'Kiran', 'Rohit', 'Manoj', 'Deepa', 'Suman', 'Rakesh', 'Anand', 'Pawan', 'Kavita', 'Mohan', 'Arti'];

  const enrollments = [];

  // First add enrollment records for our 25 seeded students so their records match
  for (let i = 0; i < tribalStudentTemplates.length; i++) {
    const s = tribalStudentTemplates[i];
    enrollments.push({
      udiseId: `UDISE-2026-${(1000 + i).toString()}`,
      studentName: s.name,
      dob: `200${(i % 5) + 2}-0${(i % 8) + 1}-15`,
      gender: s.gender,
      category: 'ST',
      institution: s.inst,
      course: s.course,
      level: s.level,
      state: s.state,
      district: s.district,
      familyIncomeEstimate: s.income
    });
  }

  // Next add 175 additional students (total 200), including ~35 ST students with NO application (Coverage Gaps)
  for (let i = 25; i < 200; i++) {
    const sd = statesDistricts[i % statesDistricts.length];
    const dist = sd.districts[i % sd.districts.length];
    const firstName = firstNames[i % firstNames.length];
    const surname = tribalSurnames[i % tribalSurnames.length];
    const fullName = `${firstName} ${surname}`;
    const level = i % 4 === 0 ? 'Pre-Matric' : i % 4 === 1 ? 'Post-Matric' : i % 4 === 2 ? 'Higher Education' : 'Post-Matric';
    const courses = {
      'Pre-Matric': 'Class 10 High School',
      'Post-Matric': 'Higher Secondary Science',
      'Higher Education': 'Bachelor of Technology'
    };

    enrollments.push({
      udiseId: `UDISE-2026-${(1000 + i).toString()}`,
      studentName: fullName,
      dob: `200${(i % 6) + 1}-0${(i % 9) + 1}-10`,
      gender: i % 2 === 0 ? 'female' : 'male',
      category: 'ST',
      institution: `Government Tribal Residential School / College, ${dist}`,
      course: courses[level] || 'General Studies',
      level,
      state: sd.state,
      district: dist,
      familyIncomeEstimate: 90000 + (i * 1500) % 180000
    });
  }

  await EnrollmentRecord.insertMany(enrollments);
  console.log(`[Seed] Seeded ${enrollments.length} institutional EnrollmentRecord entries (~35 unreached ST students for Coverage Gap Finder).`);

  // Log seeding action
  await AuditLog.create({
    actorId: officers[0]._id,
    action: 'DATABASE_SEEDED',
    entity: 'System',
    entityId: 'ALL',
    meta: {
      schemesCount: schemesData.length,
      knowledgeDocsCount: knowledgeData.length,
      studentsCount: tribalStudentTemplates.length,
      officersCount: officers.length,
      enrollmentsCount: enrollments.length
    },
    at: new Date()
  });

  console.log('[Seed] Database seeding completed successfully.');
  return { usersCount: seededUsers.length, officersCount: officers.length, schemesCount: schemesData.length };
}

if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed] Database seeding failed:', err);
      await disconnectDB();
      process.exit(1);
    });
}

module.exports = { seedDatabase };
