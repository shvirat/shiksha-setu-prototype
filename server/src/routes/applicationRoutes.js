const express = require('express');
const {
  createApplication,
  listApplications,
  getApplicationById,
  submitApplication
} = require('../controllers/applicationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', createApplication);
router.get('/', listApplications);
router.get('/:id', getApplicationById);
router.post('/:id/submit', submitApplication);

module.exports = router;
