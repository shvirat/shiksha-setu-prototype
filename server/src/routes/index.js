const express = require('express');
const authRoutes = require('./authRoutes');
const documentRoutes = require('./documentRoutes');
const schemeRoutes = require('./schemeRoutes');
const applicationRoutes = require('./applicationRoutes');
const notificationRoutes = require('./notificationRoutes');
const officerRoutes = require('./officerRoutes');
const jagoRoutes = require('./jagoRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'HEALTHY',
    service: 'Shiksha Setu API',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/schemes', schemeRoutes);
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/officer', officerRoutes);
router.use('/jago', jagoRoutes);

module.exports = router;
