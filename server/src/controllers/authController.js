const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const config = require('../config/env');
const { User, StudentProfile } = require('../models');
const { logAudit } = require('../services/auditService');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'officer']).default('student'),
  language: z.enum(['en', 'hi']).default('en'),
  profile: z
    .object({
      fullName: z.string().optional(),
      dob: z.string().optional(),
      gender: z.enum(['male', 'female', 'other']).optional(),
      category: z.string().default('ST'),
      state: z.string().optional(),
      district: z.string().optional(),
      familyIncome: z.number().optional(),
      institution: z.string().optional(),
      course: z.string().optional(),
      year: z.number().optional(),
      udiseId: z.string().optional(),
      apaarId: z.string().optional(),
      maskedBankRef: z.string().optional()
    })
    .optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, mobile, password, role, language, profile } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_IN_USE',
          message: 'An account with this email address already exists'
        }
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      passwordHash,
      role: role || 'student',
      language: language || 'en'
    });

    let createdProfile = null;
    if (user.role === 'student') {
      createdProfile = await StudentProfile.create({
        userId: user._id,
        fullName: profile?.fullName || name,
        dob: profile?.dob || '2004-01-01',
        gender: profile?.gender || 'female',
        category: profile?.category || 'ST',
        state: profile?.state || 'Jharkhand',
        district: profile?.district || 'Ranchi',
        familyIncome: profile?.familyIncome !== undefined ? profile.familyIncome : 180000,
        institution: profile?.institution || 'Government College, Ranchi',
        course: profile?.course || 'Bachelor of Arts',
        year: profile?.year || 1,
        udiseId: profile?.udiseId || '',
        apaarId: profile?.apaarId || '',
        maskedBankRef: profile?.maskedBankRef || 'XXXX-XXXX-8921'
      });
    }

    await logAudit({
      actorId: user._id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user._id,
      meta: { email: user.email, role: user.role }
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        token,
        user,
        profile: createdProfile
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    const token = generateToken(user);
    const profile = user.role === 'student' ? await StudentProfile.findOne({ userId: user._id }) : null;

    await logAudit({
      actorId: user._id,
      action: 'USER_LOGGED_IN',
      entity: 'User',
      entityId: user._id,
      meta: { email: user.email, role: user.role }
    });

    res.json({
      success: true,
      data: {
        token,
        user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = req.user;
    const profile = user.role === 'student' ? await StudentProfile.findOne({ userId: user._id }) : null;

    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_STUDENT',
          message: 'Only students have student profiles'
        }
      });
    }

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );

    await logAudit({
      actorId: user._id,
      action: 'PROFILE_UPDATED',
      entity: 'StudentProfile',
      entityId: updatedProfile._id,
      meta: { changes: Object.keys(req.body) }
    });

    res.json({
      success: true,
      data: {
        profile: updatedProfile
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerSchema,
  loginSchema,
  register,
  login,
  getMe,
  updateProfile
};
