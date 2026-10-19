const express = require('express');
const {
  getAllSchemes,
  getSchemeByCode,
  getEligibility
} = require('../controllers/schemeController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllSchemes);
router.get('/eligibility', authenticate, getEligibility);
router.get('/:code', getSchemeByCode);

module.exports = router;
