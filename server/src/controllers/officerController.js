const { Application, EnrollmentRecord, Scheme, StudentProfile, Document } = require('../models');
const { logAudit } = require('../services/auditService');
const notificationService = require('../services/notificationService');
const { evaluateEligibility } = require('../services/eligibilityService');

/**
 * GET /api/officer/queue
 * Returns list of applications needing review (FLAGGED, UNDER_REVIEW) with optional filters
 */
async function getVerificationQueue(req, res, next) {
  try {
    const { status, schemeCode, state } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['FLAGGED', 'UNDER_REVIEW', 'SUBMITTED'] };
    }

    if (schemeCode) {
      query.schemeCode = schemeCode;
    }

    if (state) {
      query['prefilled.state'] = state;
    }

    const applications = await Application.find(query)
      .populate('userId', 'name email mobile')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: {
        total: applications.length,
        applications
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/officer/applications/:id
 * Detailed view for officer review drawer (comparison table, documents, timeline)
 */
async function getApplicationDetails(req, res, next) {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).populate('userId', 'name email mobile');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    const scheme = await Scheme.findOne({ code: application.schemeCode });
    const profile = await StudentProfile.findOne({ userId: application.userId._id });
    const userDocs = await Document.find({ userId: application.userId._id });

    res.json({
      success: true,
      data: {
        application,
        scheme,
        profile,
        documents: userDocs
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/officer/applications/:id/decision
 * Approve or Reject application with mandatory remarks and audit logging
 */
async function handleDecision(req, res, next) {
  try {
    const { id } = req.params;
    const { decision, remarks, recommendedSchemes } = req.body;

    if (!decision || !['APPROVE', 'REJECT'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DECISION', message: "Decision must be 'APPROVE' or 'REJECT'" }
      });
    }

    if (!remarks || typeof remarks !== 'string' || remarks.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'REMARKS_REQUIRED', message: 'Remarks are mandatory for every officer decision' }
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    const officerName = req.user.name || 'Nodal Officer';

    if (decision === 'APPROVE') {
      application.status = 'APPROVED_FOR_SANCTION';
      application.timeline.push({
        status: 'APPROVED_FOR_SANCTION',
        at: new Date(),
        by: officerName,
        note: `Approved by Nodal Officer: ${remarks}`
      });

      // Simulate forward disbursement
      application.status = 'DISBURSED_SIMULATED';
      application.timeline.push({
        status: 'DISBURSED_SIMULATED',
        at: new Date(Date.now() + 100),
        by: 'PFMS_DBT_GATEWAY_SIMULATED',
        note: 'Direct Benefit Transfer credited to Aadhaar-seeded bank account (SIMULATED).'
      });

      await notificationService.sendNotification({
        userId: application.userId,
        type: 'SANCTION',
        title: 'Application Approved by Nodal Officer',
        message: `Your application ${application.applicationNumber} was approved: "${remarks}". Direct Benefit Transfer has been simulated.`,
        messageHi: `आपका आवेदन ${application.applicationNumber} स्वीकृत कर दिया गया है: "${remarks}"। डीबीटी भुगतान पूरा हुआ।`,
        metadata: { applicationId: application._id, decision: 'APPROVE' }
      });
    } else {
      // REJECT path
      let alternatives = recommendedSchemes || [];
      if (!alternatives.length) {
        // Automatically find eligible alternatives using eligibility engine
        try {
          const evalRes = await evaluateEligibility(application.userId);
          alternatives = evalRes.eligible
            .map((e) => e.scheme.code)
            .filter((code) => code !== application.schemeCode);
        } catch (_) {
          alternatives = ['MOTA-POST-MATRIC'];
        }
      }

      application.status = 'REJECTED';
      application.rejectionReason = remarks;
      application.recommendedSchemes = alternatives;

      application.timeline.push({
        status: 'REJECTED',
        at: new Date(),
        by: officerName,
        note: `Rejected by Nodal Officer: ${remarks}. Recommended alternative schemes: ${alternatives.join(', ')}`
      });

      await notificationService.sendNotification({
        userId: application.userId,
        type: 'STATUS_CHANGE',
        title: 'Application Decision: Rejected',
        message: `Your application ${application.applicationNumber} could not be approved: "${remarks}". Recommended alternative schemes: ${alternatives.join(', ')}.`,
        messageHi: `आपका आवेदन ${application.applicationNumber} अस्वीकृत किया गया: "${remarks}"। वैकल्पिक अनुशंसित योजनाएं: ${alternatives.join(', ')}।`,
        metadata: { applicationId: application._id, decision: 'REJECT', recommendedSchemes: alternatives }
      });
    }

    await application.save();

    await logAudit({
      actorId: req.user._id,
      action: `APPLICATION_${decision}D`,
      entity: 'Application',
      entityId: application._id,
      meta: { decision, remarks, officer: officerName }
    });

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/officer/coverage-gaps
 * Cross-references institutional ST enrolment records with scholarship records to surface unreached students
 */
async function getCoverageGaps(req, res, next) {
  try {
    const { state, district, schemeCode, level, format } = req.query;

    const enrollQuery = { category: 'ST' };
    if (state) enrollQuery.state = state;
    if (district) enrollQuery.district = district;
    if (level) enrollQuery.level = level;

    const allEnrollments = await EnrollmentRecord.find(enrollQuery);
    const allApplications = await Application.find({ status: { $ne: 'REJECTED' } });

    // Build set of covered student identifiers
    const appliedNames = new Set(allApplications.map((a) => a.prefilled?.fullName?.toLowerCase().trim()));
    const appliedUdise = new Set(allApplications.map((a) => a.prefilled?.udiseId?.toLowerCase().trim()).filter(Boolean));

    // Determine unreached students
    const unreached = [];
    let coveredCount = 0;

    for (const record of allEnrollments) {
      const normName = record.studentName.toLowerCase().trim();
      const normUdise = record.udiseId.toLowerCase().trim();

      const isCovered = appliedNames.has(normName) || appliedUdise.has(normUdise);

      if (isCovered) {
        coveredCount++;
      } else {
        // Recommend scheme based on level
        let suggestedScheme = 'MOTA-POST-MATRIC';
        if (record.level === 'Pre-Matric') suggestedScheme = 'MOTA-PRE-MATRIC';
        if (record.level === 'Higher Education') suggestedScheme = 'MOTA-TOP-CLASS';

        if (!schemeCode || schemeCode === suggestedScheme) {
          unreached.push({
            udiseId: record.udiseId,
            studentName: record.studentName,
            dob: record.dob,
            gender: record.gender,
            category: record.category,
            institution: record.institution,
            course: record.course,
            level: record.level,
            state: record.state,
            district: record.district,
            estimatedIncome: record.familyIncomeEstimate,
            suggestedScheme,
            outreachStatus: 'ELIGIBLE_UNREACHED'
          });
        }
      }
    }

    // CSV Export option
    if (format === 'csv') {
      const csvHeaders = 'UDISE ID,Student Name,Gender,State,District,Institution,Course,Level,Est Income,Suggested Scheme,Status\n';
      const csvRows = unreached.map((u) =>
        `"${u.udiseId}","${u.studentName}","${u.gender}","${u.state}","${u.district}","${u.institution}","${u.course}","${u.level}","${u.estimatedIncome}","${u.suggestedScheme}","${u.outreachStatus}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="mota_coverage_gaps.csv"');
      return res.send(csvHeaders + csvRows);
    }

    const totalEnrolled = allEnrollments.length;
    const gapCount = unreached.length;
    const gapPercentage = totalEnrolled > 0 ? ((gapCount / totalEnrolled) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalEnrolled,
          coveredCount,
          unreachedGaps: gapCount,
          gapPercentage: Number(gapPercentage)
        },
        gaps: unreached
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/officer/analytics
 * Provides high-level operational metrics, status breakdown, flag rate, and gap figures
 */
async function getAnalytics(req, res, next) {
  try {
    const totalApplications = await Application.countDocuments();
    const statusCounts = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = {};
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    const schemeCounts = await Application.aggregate([
      { $group: { _id: '$schemeCode', count: { $sum: 1 } } }
    ]);

    const flaggedCount = statusMap['FLAGGED'] || 0;
    const submittedOrPast = totalApplications - (statusMap['DRAFT'] || 0);
    const flagRate = submittedOrPast > 0 ? ((flaggedCount / submittedOrPast) * 100).toFixed(1) : 0;

    const totalEnrollments = await EnrollmentRecord.countDocuments({ category: 'ST' });
    const uniqueApplied = await Application.distinct('prefilled.fullName');
    const gapTotal = Math.max(0, totalEnrollments - uniqueApplied.length);

    res.json({
      success: true,
      data: {
        keyFigures: {
          totalApplications,
          flaggedForReview: flaggedCount,
          approvedOrDisbursed: (statusMap['APPROVED_FOR_SANCTION'] || 0) + (statusMap['DISBURSED_SIMULATED'] || 0),
          unreachedCoverageGaps: gapTotal,
          flagRatePercentage: Number(flagRate),
          averageProcessingDays: 1.8 // Simulated average processing time
        },
        statusBreakdown: statusMap,
        schemeBreakdown: schemeCounts.map((sc) => ({ schemeCode: sc._id, count: sc.count }))
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getVerificationQueue,
  getApplicationDetails,
  handleDecision,
  getCoverageGaps,
  getAnalytics
};
