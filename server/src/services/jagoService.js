const config = require('../config/env');
const { KnowledgeDoc, Application, Scheme, StudentProfile } = require('../models');
const { evaluateEligibility } = require('./eligibilityService');

class JagoService {
  /**
   * Sanitizes prompt and detects prompt injection attempts
   */
  sanitizeInput(text) {
    if (!text || typeof text !== 'string') return '';
    const injectionPatterns = [
      /ignore\s+(all\s+)?(previous|prior|above)?\s*(instructions|rules)/i,
      /you\s+are\s+now\s+(an?\s+)?(admin|root|god|hacker)/i,
      /override\s+(system|security)\s+(settings|rules)/i,
      /drop\s+database/i,
      /show\s+(all|other)\s+(users|passwords)/i,
      /bypass\s+security/i
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(text)) {
        return {
          safe: false,
          warning: 'Prompt injection detected. Request rejected by security guardrails.'
        };
      }
    }

    return {
      safe: true,
      text: text.trim().slice(0, 1000)
    };
  }

  /**
   * Authorized Tool 1: Get authenticated student's application status
   */
  async getMyApplicationStatus(userId) {
    const apps = await Application.find({ userId }).sort({ updatedAt: -1 });
    if (!apps.length) {
      return {
        hasApplications: false,
        message: 'You have not submitted any scholarship applications yet.',
        messageHi: 'आपने अभी तक किसी भी छात्रवृत्ति के लिए आवेदन नहीं किया है।'
      };
    }

    return {
      hasApplications: true,
      applications: apps.map((a) => ({
        applicationNumber: a.applicationNumber,
        schemeCode: a.schemeCode,
        status: a.status,
        mismatchesCount: a.mismatches?.length || 0,
        lastTimelineEntry: a.timeline[a.timeline.length - 1]
      }))
    };
  }

  /**
   * Authorized Tool 2: Get required documents for a given scheme
   */
  async getRequiredDocuments(schemeCode) {
    const code = (schemeCode || 'MOTA-POST-MATRIC').toUpperCase();
    const scheme = await Scheme.findOne({ code });
    if (!scheme) {
      return { found: false, message: `Scheme '${schemeCode}' was not found.` };
    }

    return {
      found: true,
      schemeName: scheme.name,
      schemeNameHi: scheme.nameHi,
      requiredDocs: scheme.requiredDocs
    };
  }

  /**
   * Authorized Tool 3: Check authenticated student's personalized eligibility
   */
  async checkMyEligibility(userId) {
    try {
      const evalRes = await evaluateEligibility(userId);
      return {
        eligibleSchemes: evalRes.eligible.map((e) => ({
          code: e.scheme.code,
          name: e.scheme.name,
          hasConflict: e.hasConflict,
          conflictDetails: e.conflictDetails
        })),
        ineligibleSchemes: evalRes.ineligible.map((i) => ({
          code: i.scheme.code,
          name: i.scheme.name,
          reasons: i.reasons
        }))
      };
    } catch (err) {
      return { error: err.message };
    }
  }

  /**
   * RAG: Retrieve most relevant knowledge documents
   */
  async retrieveContext(query, language = 'en') {
    const terms = query
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    if (terms.length === 0) {
      return await KnowledgeDoc.find({ language }).limit(3);
    }

    // Keyword match over KnowledgeDoc
    const regexConditions = terms.map((term) => ({
      $or: [
        { title: new RegExp(term, 'i') },
        { text: new RegExp(term, 'i') },
        { tags: new RegExp(term, 'i') }
      ]
    }));

    let docs = await KnowledgeDoc.find({
      language,
      $or: regexConditions
    }).limit(4);

    if (!docs.length) {
      // Fallback search across any language
      docs = await KnowledgeDoc.find({ $or: regexConditions }).limit(4);
    }

    if (!docs.length) {
      docs = await KnowledgeDoc.find({ language }).limit(3);
    }

    return docs;
  }

  /**
   * Deterministic rule-based fallback responder
   */
  async ruleBasedFallback(userQuery, userId, language, retrievedDocs) {
    const q = userQuery.toLowerCase();
    const isHi = language === 'hi';

    // 1. Status queries
    if (q.includes('status') || q.includes('track') || q.includes('स्थिति') || q.includes('आवेदन')) {
      const statusData = await this.getMyApplicationStatus(userId);
      if (!statusData.hasApplications) {
        return isHi
          ? 'आपके पास वर्तमान में कोई सक्रिय आवेदन नहीं है। आप योजनाएं अनुभाग में जाकर अपनी पात्रता जांच सकते हैं और आवेदन कर सकते हैं।'
          : 'You do not have any active applications yet. You can visit the Schemes section to check eligibility and apply.';
      }
      const app = statusData.applications[0];
      const statusDesc = {
        FLAGGED: isHi
          ? `आपका आवेदन (${app.applicationNumber}) नोडल अधिकारी की मानवीय समीक्षा के लिए चिह्नित (FLAGGED) है। चिंता न करें, आपका आवेदन निरस्त नहीं हुआ है।`
          : `Your application (${app.applicationNumber}) is currently FLAGGED for Nodal Officer review. Do not worry; applications with discrepancies are never silently rejected.`,
        VERIFIED: isHi
          ? `आपका आवेदन (${app.applicationNumber}) सभी जांचों में सत्यापित हो चुका है और अनुमोदन के लिए तैयार है।`
          : `Your application (${app.applicationNumber}) is fully VERIFIED across DigiLocker, UDISE+, and Bank records.`,
        APPROVED_FOR_SANCTION: isHi
          ? `आपका आवेदन (${app.applicationNumber}) स्वीकृत हो चुका है और डीबीटी भुगतान प्रक्रियाधीन है।`
          : `Your application (${app.applicationNumber}) is APPROVED FOR SANCTION. Direct Benefit Transfer disbursement is in queue.`,
        DISBURSED_SIMULATED: isHi
          ? `बधाई हो! आपके आवेदन (${app.applicationNumber}) की छात्रवृत्ति राशि आपके आधार-लिंक्ड बैंक खाते में भेज दी गई है।`
          : `Congratulations! Scholarship funds for application (${app.applicationNumber}) have been credited to your Aadhaar-seeded account.`
      };
      return statusDesc[app.status] || (isHi ? `आपके आवेदन की वर्तमान स्थिति: ${app.status}` : `Current status for ${app.applicationNumber}: ${app.status}`);
    }

    // 2. Eligibility queries
    if (q.includes('eligible') || q.includes('eligibility') || q.includes('पात्र') || q.includes('योग्य')) {
      const eligData = await this.checkMyEligibility(userId);
      if (eligData.eligibleSchemes && eligData.eligibleSchemes.length > 0) {
        const names = eligData.eligibleSchemes.map((s) => s.name).join(', ');
        return isHi
          ? `आपके प्रोफ़ाइल के अनुसार आप इन योजनाओं के लिए पात्र हैं: ${names}।`
          : `Based on your verified profile, you are eligible for: ${names}.`;
      }
    }

    // 3. Required documents queries
    if (q.includes('document') || q.includes('docs') || q.includes('दस्तावेज') || q.includes('कागजात')) {
      const docsData = await this.getRequiredDocuments('MOTA-POST-MATRIC');
      const docList = docsData.requiredDocs.map((d) => d.name).join('; ');
      return isHi
        ? `मैट्रिकोत्तर छात्रवृत्ति के लिए आवश्यक दस्तावेज: ${docList}। आप इन्हें एक बार डिजिटल वॉलेट में अपलोड करके हमेशा उपयोग कर सकते हैं।`
        : `Key required documents for MoTA scholarships are: ${docList}. You can upload them once to your Digital Wallet for all applications.`;
    }

    // 4. Mismatch / Flagged queries
    if (q.includes('mismatch') || q.includes('spelling') || q.includes('अंतर') || q.includes('गलती')) {
      return isHi
        ? 'यदि आपके प्रमाणपत्र और आधार या कॉलेज रिकॉर्ड में नाम या आय में मामूली अंतर है, तो शिक्षा सेतु आपके आवेदन को निरस्त नहीं करता। इसे नोडल अधिकारी की मानवीय समीक्षा के लिए भेजा जाता है।'
        : 'Shiksha Setu never silently rejects applications due to spelling or data variations. Differences are flagged for empathetic manual review by the Nodal Officer.';
    }

    // 5. Default to best retrieved KnowledgeDoc
    if (retrievedDocs.length > 0) {
      return retrievedDocs[0].text;
    }

    return isHi
      ? 'मैं जनजातीय कार्य मंत्रालय (MoTA) की छात्रवृत्तियों, आवेदन स्थिति और आवश्यक दस्तावेजों में आपकी सहायता कर सकता हूं। कृपया अपना प्रश्न पूछें।'
      : 'I am JAGO, your multilingual guide for Ministry of Tribal Affairs (MoTA) scholarships, eligibility, application status, and document requirements. How may I help you?';
  }

  /**
   * Main chat entry point
   */
  async chat({ userId, message, language = 'en' }) {
    const sanitizeResult = this.sanitizeInput(message);
    if (!sanitizeResult.safe) {
      return {
        reply: sanitizeResult.warning,
        source: 'GUARDRAIL',
        toolsUsed: []
      };
    }

    const cleanQuery = sanitizeResult.text;
    const retrievedDocs = await this.retrieveContext(cleanQuery, language);

    // If external LLM is configured (e.g., Gemini or OpenAI)
    if (config.llmProvider === 'gemini' && config.geminiApiKey) {
      try {
        const systemPrompt = `You are JAGO, an empathetic, plain-language assistant for Scheduled Tribe (ST) students applying for Ministry of Tribal Affairs (MoTA) scholarships in India.
Answer directly, clearly, and concisely in ${language === 'hi' ? 'Hindi (Devanagari script)' : 'English'}.
Do not use emojis, do not use corporate jargon.
Reference the knowledge base context below when answering:
${retrievedDocs.map((d) => `[${d.title}]: ${d.text}`).join('\n\n')}
`;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent question: ${cleanQuery}` }] }
              ]
            })
          }
        );
        const data = await response.json();
        const geminiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiReply) {
          return {
            reply: geminiReply,
            source: 'GEMINI_LLM',
            retrievedDocTitles: retrievedDocs.map((d) => d.title)
          };
        }
      } catch (err) {
        console.warn('[JagoService] Gemini API call failed, using deterministic fallback:', err.message);
      }
    }

    // Deterministic Rule-Based Fallback
    const fallbackReply = await this.ruleBasedFallback(cleanQuery, userId, language, retrievedDocs);
    return {
      reply: fallbackReply,
      source: 'RULE_BASED_FALLBACK',
      retrievedDocTitles: retrievedDocs.map((d) => d.title)
    };
  }
}

module.exports = new JagoService();
