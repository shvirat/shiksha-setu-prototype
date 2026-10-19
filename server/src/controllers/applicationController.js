const { Application } = require('../models');
const applicationService = require('../services/applicationService');

async function createApplication(req, res, next) {
  try {
    const { schemeCode } = req.body;
    if (!schemeCode) {
      return res.status(400).json({
        success: false,
        error: { code: 'SCHEME_CODE_REQUIRED', message: 'schemeCode is required' }
      });
    }

    const application = await applicationService.createDraft(req.user._id, schemeCode);
    res.status(201).json({
      success: true,
      data: { application }
    });
  } catch (error) {
    next(error);
  }
}

async function listApplications(req, res, next) {
  try {
    const applications = await Application.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({
      success: true,
      data: { applications }
    });
  } catch (error) {
    next(error);
  }
}

async function getApplicationById(req, res, next) {
  try {
    const { id } = req.params;
    const application = await Application.findOne({ _id: id, userId: req.user._id });
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    next(error);
  }
}

async function submitApplication(req, res, next) {
  try {
    const { id } = req.params;
    const updatedApplication = await applicationService.submitApplication(id, req.user._id);
    res.json({
      success: true,
      data: { application: updatedApplication }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createApplication,
  listApplications,
  getApplicationById,
  submitApplication
};
