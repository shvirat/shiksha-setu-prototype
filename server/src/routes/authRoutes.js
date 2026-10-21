const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  registerSchema,
  profileUpdateSchema,
  loginSchema
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validate(profileUpdateSchema), updateProfile);

module.exports = router;
