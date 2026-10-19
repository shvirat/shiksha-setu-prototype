const express = require('express');
const { chatWithJago } = require('../controllers/jagoController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.post('/chat', chatWithJago);

module.exports = router;
