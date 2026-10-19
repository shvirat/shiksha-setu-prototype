const { Scheme } = require('../models');
const { evaluateEligibility } = require('../services/eligibilityService');

async function getAllSchemes(req, res, next) {
  try {
    const schemes = await Scheme.find({});
    res.json({
      success: true,
      data: { schemes }
    });
  } catch (error) {
    next(error);
  }
}

async function getSchemeByCode(req, res, next) {
  try {
    const { code } = req.params;
    const scheme = await Scheme.findOne({ code: code.toUpperCase() });
    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Scheme '${code}' not found` }
      });
    }
    res.json({
      success: true,
      data: { scheme }
    });
  } catch (error) {
    next(error);
  }
}

async function getEligibility(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await evaluateEligibility(userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllSchemes,
  getSchemeByCode,
  getEligibility
};
