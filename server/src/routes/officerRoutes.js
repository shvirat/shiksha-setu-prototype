const express = require('express');
const {
  getVerificationQueue,
  getApplicationDetails,
  handleDecision,
  getCoverageGaps,
  getAnalytics
} = require('../controllers/officerController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Enforce officer role authentication for all officer routes
router.use(authenticate);
router.use(requireRole('officer'));

router.get('/queue', getVerificationQueue);
router.get('/applications/:id', getApplicationDetails);
router.post('/applications/:id/decision', handleDecision);
router.get('/coverage-gaps', getCoverageGaps);
router.get('/analytics', getAnalytics);

module.exports = router;
