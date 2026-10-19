const { Scheme, StudentProfile, Application } = require('../models');

async function evaluateEligibility(userId) {
  const profile = await StudentProfile.findOne({ userId });
  if (!profile) {
    throw new Error('Student profile not found. Please complete profile first.');
  }

  const allSchemes = await Scheme.find({});
  const activeApplications = await Application.find({
    userId,
    status: { $nin: ['REJECTED'] }
  });

  const activeSchemeCodes = new Set(activeApplications.map((a) => a.schemeCode));

  const eligible = [];
  const ineligible = [];
  const conflicts = [];

  for (const scheme of allSchemes) {
    const rules = scheme.eligibilityRules || {};
    const failureReasons = [];
    const failureReasonsHi = [];

    // 1. Caste Category Check
    if (rules.allowedCategories && rules.allowedCategories.length > 0) {
      if (!rules.allowedCategories.includes(profile.category)) {
        failureReasons.push(`Category '${profile.category}' is not eligible. Requires: ${rules.allowedCategories.join(', ')}.`);
        failureReasonsHi.push(`श्रेणी '${profile.category}' पात्र नहीं है। आवश्यक: ${rules.allowedCategories.join(', ')}।`);
      }
    }

    // 2. Family Income Ceiling Check
    if (rules.incomeCeiling !== null && rules.incomeCeiling !== undefined) {
      if (profile.familyIncome > rules.incomeCeiling) {
        failureReasons.push(
          `Annual family income of ₹${profile.familyIncome.toLocaleString('en-IN')} exceeds the scheme ceiling of ₹${rules.incomeCeiling.toLocaleString('en-IN')}.`
        );
        failureReasonsHi.push(
          `पारिवारिक वार्षिक आय ₹${profile.familyIncome.toLocaleString('en-IN')} योजना की सीमा ₹${rules.incomeCeiling.toLocaleString('en-IN')} से अधिक है।`
        );
      }
    }

    // 3. Course Level / Year Range Check
    if (rules.minCourseYear !== undefined && rules.maxCourseYear !== undefined) {
      const studentYear = profile.year || 1;
      // If Pre-Matric requires years 9-10
      if (scheme.level === 'Pre-Matric' && (studentYear < 9 || studentYear > 10)) {
        failureReasons.push(`Requires enrolment in Class 9 or 10 (Current: Year/Class ${studentYear}).`);
        failureReasonsHi.push(`कक्षा 9 या 10 में नामांकन आवश्यक है (वर्तमान: ${studentYear})।`);
      } else if (scheme.level !== 'Pre-Matric' && (studentYear < rules.minCourseYear || studentYear > rules.maxCourseYear)) {
        failureReasons.push(`Academic study year ${studentYear} is outside the allowed range of Year ${rules.minCourseYear}-${rules.maxCourseYear}.`);
        failureReasonsHi.push(`शैक्षणिक वर्ष ${studentYear} अनुमत सीमा ${rules.minCourseYear}-${rules.maxCourseYear} से बाहर है।`);
      }
    }

    // Check if conflicting with any already applied / held scheme
    let hasConflict = false;
    let conflictDetails = null;

    if (rules.conflictsWith && rules.conflictsWith.length > 0) {
      for (const conflictingCode of rules.conflictsWith) {
        if (activeSchemeCodes.has(conflictingCode)) {
          hasConflict = true;
          const conflictingScheme = allSchemes.find((s) => s.code === conflictingCode);
          conflictDetails = {
            conflictingSchemeCode: conflictingCode,
            conflictingSchemeName: conflictingScheme?.name || conflictingCode,
            message: `Cannot be held together with ${conflictingScheme?.name || conflictingCode}, sample rule.`,
            messageHi: `इस योजना को ${conflictingScheme?.nameHi || conflictingScheme?.name || conflictingCode} के साथ एक साथ नहीं लिया जा सकता।`
          };
          break;
        }
      }
    }

    // Determine status
    if (failureReasons.length === 0) {
      const eligibilityItem = {
        scheme,
        isEligible: true,
        hasConflict,
        conflictDetails,
        reasons: [
          'Recognized Scheduled Tribe category',
          `Income within ceiling (₹${profile.familyIncome.toLocaleString('en-IN')})`,
          `Enrolled in valid course (${profile.course})`
        ],
        reasonsHi: [
          'मान्यता प्राप्त अनुसूचित जनजाति श्रेणी',
          `आय सीमा के भीतर (₹${profile.familyIncome.toLocaleString('en-IN')})`,
          `मान्य पाठ्यक्रम में नामांकित (${profile.course})`
        ]
      };

      eligible.push(eligibilityItem);
      if (hasConflict) {
        conflicts.push({
          schemeCode: scheme.code,
          schemeName: scheme.name,
          ...conflictDetails
        });
      }
    } else {
      ineligible.push({
        scheme,
        isEligible: false,
        reasons: failureReasons,
        reasonsHi: failureReasonsHi
      });
    }
  }

  return {
    eligible,
    ineligible,
    conflicts,
    activeApplicationsCount: activeApplications.length
  };
}

module.exports = {
  evaluateEligibility
};
