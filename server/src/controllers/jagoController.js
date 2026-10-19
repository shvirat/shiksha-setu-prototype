const jagoService = require('../services/jagoService');

async function chatWithJago(req, res, next) {
  try {
    const { message, language } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'MESSAGE_REQUIRED', message: 'Message string is required' }
      });
    }

    const response = await jagoService.chat({
      userId: req.user._id,
      message,
      language: language || req.user.language || 'en'
    });

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  chatWithJago
};
