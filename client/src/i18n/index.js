import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      brand: {
        title: 'Shiksha Setu',
        subtitle: 'Ministry of Tribal Affairs',
        tagline: 'One login for every tribal scholarship.',
        footerNotice: 'Demo uses simulated government data.'
      },
      nav: {
        home: 'Home',
        schemes: 'Schemes',
        documents: 'Documents',
        askJago: 'Ask JAGO',
        queue: 'Verification Queue',
        coverageGaps: 'Coverage Gap Finder',
        analytics: 'Analytics',
        profile: 'Profile',
        logout: 'Log out'
      },
      auth: {
        loginTitle: 'Sign in to your account',
        loginSubtitle: 'Enter your registered email address and password.',
        registerTitle: 'Create your Student Account',
        registerSubtitle: 'Register once to unlock and apply for all tribal scholarship schemes.',
        nameLabel: 'Full Name',
        emailLabel: 'Email address',
        mobileLabel: 'Mobile number',
        passwordLabel: 'Password',
        loginButton: 'Sign in',
        registerButton: 'Create Student Account',
        hasAccount: 'Already registered? Sign in here',
        noAccount: 'New student? Register for Shiksha Setu',
        bullet1: 'One login for all 5 MoTA scholarship schemes',
        bullet2: 'Upload your certificates once and reuse across applications',
        bullet3: 'Real-time tracking with smart automated verification'
      },
      profile: {
        title: 'Student Profile & Digital Identity',
        subtitle: 'Manage your verified academic records, identity details, and scholarship eligibility criteria.',
        personalInfo: 'Personal Information',
        academicInfo: 'Academic & Institutional Details',
        integrations: 'Auto-Verification Registry Status',
        saveButton: 'Save Changes',
        savedSuccess: 'Profile updated successfully! New details will auto-fill in your scholarship applications.',
        fullName: 'Full Name (as per Certificate)',
        dob: 'Date of Birth',
        gender: 'Gender',
        category: 'Category',
        state: 'State of Domicile',
        district: 'District',
        familyIncome: 'Annual Family Income (₹)',
        institution: 'School / College / University Name',
        course: 'Current Course / Degree',
        year: 'Current Academic Year',
        udiseId: 'UDISE+ Student Identifier',
        apaarId: 'APAAR / ABC ID',
        maskedBankRef: 'Aadhaar-Linked Bank Account'
      },
      home: {
        heading: 'Your scholarships',
        needsAction: 'Needs your action',
        yourApplications: 'Your applications',
        eligibleSchemes: 'Schemes you may be eligible for',
        conflictWarning: 'Scheme conflict notice',
        viewDetails: 'View details',
        trackApplication: 'Track progress',
        applyNow: 'Apply now',
        noApplications: 'No applications in progress.',
        filledFromProfile: 'Filled from profile'
      },
      wallet: {
        heading: 'Digital Document Wallet',
        subheading: 'Upload your documents once. They are encrypted with AES-256 and reused across your applications.',
        uploadButton: 'Upload document',
        dropzoneText: 'Drag and drop your certificate here, or select from device',
        dropzoneHint: 'Supported formats: PDF, JPG, PNG up to 5 MB',
        emptyMessage: 'Your wallet has no documents yet. Upload your ST certificate or income proof to begin.'
      },
      stepper: {
        submitted: 'Submitted',
        verification: 'Verification',
        review: 'Review',
        sanction: 'Sanction',
        payment: 'Payment (demo)'
      },
      status: {
        DRAFT: 'Draft',
        SUBMITTED: 'Submitted',
        AUTO_VERIFYING: 'Verifying',
        FLAGGED: 'Needs your action',
        UNDER_REVIEW: 'Under review',
        VERIFIED: 'Verified',
        APPROVED_FOR_SANCTION: 'Approved',
        REJECTED: 'Rejected',
        DISBURSED_SIMULATED: 'Paid (demo)'
      },
      officer: {
        queueHeading: 'Application Verification Queue',
        queueSubheading: 'Review applications flagged by smart automated verification checks.',
        applicant: 'Applicant',
        scheme: 'Scheme',
        flagType: 'Flagged Field',
        lastUpdated: 'Last Updated',
        action: 'Review',
        approve: 'Approve application',
        reject: 'Reject application',
        remarksLabel: 'Officer remarks (mandatory)',
        remarksPlaceholder: 'Enter verification findings or rationale for decision...',
        comparisonTitle: 'Verification Mismatch Comparison',
        enteredValue: 'You entered',
        recordValue: 'Record shows',
        recommendedSchemes: 'Recommended alternative schemes'
      },
      gaps: {
        heading: 'Coverage Gap Finder',
        subheading: 'Institutional ST student rolls cross-referenced against scholarship records to identify unreached students.',
        totalEnrolled: 'Enrolled ST students',
        coveredCount: 'Scholarship applicants',
        unreachedCount: 'Unreached coverage gap',
        gapPercentage: 'Coverage gap rate',
        exportCsv: 'Export CSV',
        stateFilter: 'All States',
        districtFilter: 'All Districts'
      },
      analytics: {
        heading: 'Ministry Analytics & Operations',
        subheading: 'Overview of scholarship scheme performance, verification flag rates, and coverage indicators.',
        totalApplications: 'Total applications',
        flaggedCount: 'Flagged for review',
        sanctionedCount: 'Sanctioned / Disbursed',
        avgProcessingTime: 'Avg processing time'
      },
      jago: {
        title: 'Ask JAGO',
        disclaimer: 'JAGO can make mistakes. Confirm important details on the official portal.',
        placeholder: 'Ask in plain language about schemes, status, or documents...',
        send: 'Send',
        listening: 'Listening...',
        readAloud: 'Read aloud',
        suggestedQuestions: 'Suggested questions',
        q1: 'What is my current scholarship application status?',
        q2: 'What documents are required for Post-Matric ST scholarship?',
        q3: 'What happens if my name has a spelling mismatch?'
      }
    }
  },
  hi: {
    translation: {
      brand: {
        title: 'शिक्षा सेतु',
        subtitle: 'जनजातीय कार्य मंत्रालय',
        tagline: 'प्रत्येक जनजातीय छात्रवृत्ति के लिए एक साझा प्रवेश।',
        footerNotice: 'यह डेमो सिमुलेटेड सरकारी डेटा का उपयोग करता है।'
      },
      nav: {
        home: 'गृह',
        schemes: 'योजनाएं',
        documents: 'दस्तावेज़',
        askJago: 'जागो से पूछें',
        queue: 'सत्यापन कतार',
        coverageGaps: 'कवरेज गैप खोजक',
        analytics: 'विश्लेषिकी',
        profile: 'प्रोफ़ाइल',
        logout: 'लॉग आउट',
      },
      auth: {
        loginTitle: 'अपने खाते में प्रवेश करें',
        loginSubtitle: 'अपना पंजीकृत ईमेल और पासवर्ड दर्ज करें।',
        registerTitle: 'नया छात्र खाता बनाएं',
        registerSubtitle: 'सभी जनजातीय छात्रवृत्ति योजनाओं के लिए केवल एक बार पंजीकरण करें।',
        nameLabel: 'पूरा नाम',
        emailLabel: 'ईमेल पता',
        mobileLabel: 'मोबाइल नंबर',
        passwordLabel: 'पासवर्ड',
        loginButton: 'प्रवेश करें',
        registerButton: 'छात्र खाता बनाएं',
        hasAccount: 'पहले से पंजीकृत हैं? यहां लॉगिन करें',
        noAccount: 'नए छात्र? शिक्षा सेतु पर पंजीकरण करें',
        bullet1: 'जनजातीय मंत्रालय की सभी 5 योजनाओं के लिए एक साझा लॉगिन',
        bullet2: 'दस्तावेज़ एक बार अपलोड करें और हर आवेदन में पुनः उपयोग करें',
        bullet3: 'स्मार्ट स्वचालित सत्यापन के साथ वास्तविक समय में स्थिति ट्रैक करें'
      },
      profile: {
        title: 'छात्र प्रोफ़ाइल एवं डिजिटल पहचान',
        subtitle: 'अपने सत्यापित शैक्षणिक विवरण, पहचान और छात्रवृत्ति पात्रता मानकों का प्रबंधन करें।',
        personalInfo: 'व्यक्तिगत जानकारी',
        academicInfo: 'शैक्षणिक एवं संस्थान विवरण',
        integrations: 'स्वचालित सत्यापन पोर्टल स्थिति',
        saveButton: 'परिवर्तन सहेजें',
        savedSuccess: 'प्रोफ़ाइल सफलतापूर्वक अपडेट कर दी गई! नए विवरण आपके छात्रवृत्ति आवेदनों में स्वतः भर जाएंगे।',
        fullName: 'पूरा नाम (प्रमाणपत्र के अनुसार)',
        dob: 'जन्म तिथि',
        gender: 'लिंग',
        category: 'श्रेणी',
        state: 'मूल निवास राज्य',
        district: 'जिला',
        familyIncome: 'वार्षिक पारिवारिक आय (₹)',
        institution: 'स्कूल / कॉलेज / विश्वविद्यालय का नाम',
        course: 'वर्तमान पाठ्यक्रम / डिग्री',
        year: 'वर्तमान अध्ययन वर्ष',
        udiseId: 'UDISE+ छात्र पहचान संख्या',
        apaarId: 'अपार (APAAR) / ABC आईडी',
        maskedBankRef: 'आधार से जुड़ा बैंक खाता'
      },
      home: {
        heading: 'आपकी छात्रवृत्तियां',
        needsAction: 'कार्रवाई आवश्यक है',
        yourApplications: 'आपके आवेदन',
        eligibleSchemes: 'वे योजनाएं जिनके लिए आप पात्र हो सकते हैं',
        conflictWarning: 'योजना टकराव सूचना',
        viewDetails: 'विवरण देखें',
        trackApplication: 'प्रगति ट्रैक करें',
        applyNow: 'आवेदन करें',
        noApplications: 'कोई सक्रिय आवेदन नहीं है।',
        filledFromProfile: 'आपके प्रोफ़ाइल से भरा गया'
      },
      wallet: {
        heading: 'डिजिटल दस्तावेज़ वॉलेट',
        subheading: 'अपने प्रमाणपत्र एक बार अपलोड करें। वे AES-256 से सुरक्षित रहते हैं और सभी आवेदनों में काम आते हैं।',
        uploadButton: 'दस्तावेज़ अपलोड करें',
        dropzoneText: 'अपना प्रमाणपत्र यहां ड्रैग करें या डिवाइस से चुनें',
        dropzoneHint: 'स्वीकृत प्रारूप: PDF, JPG, PNG (अधिकतम 5 MB)',
        emptyMessage: 'आपके वॉलेट में अभी कोई दस्तावेज़ नहीं है। अपना एसटी जाति या आय प्रमाण पत्र अपलोड करें।'
      },
      stepper: {
        submitted: 'प्रस्तुत',
        verification: 'सत्यापन',
        review: 'समीक्षा',
        sanction: 'मंजूरी',
        payment: 'भुगतान (डेमो)'
      },
      status: {
        DRAFT: 'प्रारूप',
        SUBMITTED: 'प्रस्तुत',
        AUTO_VERIFYING: 'सत्यापन जारी',
        FLAGGED: 'कार्रवाई आवश्यक',
        UNDER_REVIEW: 'समीक्षाधीन',
        VERIFIED: 'सत्यापित',
        APPROVED_FOR_SANCTION: 'स्वीकृत',
        REJECTED: 'अस्वीकृत',
        DISBURSED_SIMULATED: 'भुगतान पूर्ण (डेमो)'
      },
      officer: {
        queueHeading: 'आवेदन सत्यापन कतार',
        queueSubheading: 'स्मार्ट स्वचालित सत्यापन द्वारा चिह्नित आवेदनों की मानवीय समीक्षा करें।',
        applicant: 'आवेदक',
        scheme: 'योजना',
        flagType: 'चिह्नित फ़ील्ड',
        lastUpdated: 'अंतिम अद्यतन',
        action: 'समीक्षा करें',
        approve: 'आवेदन स्वीकृत करें',
        reject: 'आवेदन अस्वीकृत करें',
        remarksLabel: 'अधिकारी की टिप्पणी (अनिवार्य)',
        remarksPlaceholder: 'जांच परिणाम अथवा निर्णय का आधार दर्ज करें...',
        comparisonTitle: 'सत्यापन अंतर तुलना',
        enteredValue: 'आपने दर्ज किया',
        recordValue: 'रिकॉर्ड में दर्ज है',
        recommendedSchemes: 'अनुशंसित वैकल्पिक योजनाएं'
      },
      gaps: {
        heading: 'कवरेज गैप खोजक',
        subheading: 'वंचित छात्रों की पहचान हेतु संस्थागत एसटी नामांकन एवं छात्रवृत्ति रिकॉर्ड का मिलान।',
        totalEnrolled: 'नामांकित एसटी छात्र',
        coveredCount: 'छात्रवृत्ति आवेदक',
        unreachedCount: 'वंचित कवरेज गैप',
        gapPercentage: 'कवरेज गैप दर',
        exportCsv: 'सीएसवी निर्यात',
        stateFilter: 'सभी राज्य',
        districtFilter: 'सभी जिले'
      },
      analytics: {
        heading: 'मंत्रालय विश्लेषिकी एवं संचालन',
        subheading: 'छात्रवृत्ति योजना प्रदर्शन, सत्यापन फ्लैग दर और कवरेज संकेतकों का विस्तृत अवलोकन।',
        totalApplications: 'कुल आवेदन',
        flaggedCount: 'समीक्षा हेतु चिह्नित',
        sanctionedCount: 'स्वीकृत / अंतरित',
        avgProcessingTime: 'औसत प्रक्रिया समय'
      },
      jago: {
        title: 'जागो से पूछें',
        disclaimer: 'जागो से त्रुटि हो सकती है। कृपया महत्वपूर्ण विवरण की आधिकारिक पोर्टल पर पुष्टि करें।',
        placeholder: 'योजनाओं, आवेदन स्थिति या दस्तावेजों के बारे में सरल भाषा में पूछें...',
        send: 'भेजें',
        listening: 'सुन रहा है...',
        readAloud: 'सुनें',
        suggestedQuestions: 'सुझाए गए प्रश्न',
        q1: 'मेरे छात्रवृत्ति आवेदन की वर्तमान स्थिति क्या है?',
        q2: 'मैट्रिकोत्तर एसटी छात्रवृत्ति के लिए कौन से दस्तावेज चाहिए?',
        q3: 'यदि मेरे नाम की वर्तनी में अंतर है तो क्या होगा?'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
