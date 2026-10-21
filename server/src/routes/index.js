const express = require('express');
const authRoutes = require('./authRoutes');
const documentRoutes = require('./documentRoutes');
const schemeRoutes = require('./schemeRoutes');
const applicationRoutes = require('./applicationRoutes');
const notificationRoutes = require('./notificationRoutes');
const officerRoutes = require('./officerRoutes');
const jagoRoutes = require('./jagoRoutes');

const router = express.Router();

router.get('/health', async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  let counts = null;
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'CONNECTED';
      const { User, Scheme, Application } = require('../models');
      counts = {
        users: await User.countDocuments(),
        schemes: await Scheme.countDocuments(),
        applications: await Application.countDocuments()
      };
    }
  } catch (_) {}

  res.json({
    success: true,
    status: 'HEALTHY',
    database: dbStatus,
    counts,
    service: 'Shiksha Setu API',
    timestamp: new Date().toISOString()
  });
});

router.all('/seed', async (req, res) => {
  try {
    const { seedDatabase } = require('../../seed/seed');
    console.log('[API /seed] Manually triggered database seed...');
    const result = await seedDatabase();
    res.json({
      success: true,
      message: 'Database seeded successfully',
      result
    });
  } catch (err) {
    console.error('[API /seed] Manual seeding failed:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEED_FAILED',
        message: err.message,
        details: err.stack
      }
    });
  }
});

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/schemes', schemeRoutes);
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/officer', officerRoutes);
router.use('/jago', jagoRoutes);

module.exports = router;
