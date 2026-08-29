import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    // Top utility & nav
    govOfIndia: "GOVERNMENT OF INDIA",
    skipToMain: "Skip to main content",
    language: "Language",
    platformSubtitle: "Institutional Skills Passport",
    home: "Home",
    about: "About",
    howItWorks: "How It Works",
    features: "Features",
    aiEcosystem: "AI Ecosystem",
    roles: "Roles",
    login: "Login",
    getStarted: "Get Started",
    workspace: "Workspace",

    // Hero Section
    aiBadge: "AI-Enabled Digital Capacity Building Portal",
    brandTitle: "PRAGATI",
    heroHeading1: "Build Standardized Skills.",
    heroHeading2: "Verify Competencies. Grow with Confidence.",
    heroDesc: "A modern workforce upskilling and skills verification portal. Connect course delivery, anti-cheat assessments, PDFKit certificate issuance, and adaptive AI advisor workflows in one platform.",
    explorePlatform: "Explore Platform",

    // About Section
    curriculumStandard: "Curriculum Standard",
    continuousCapacityTitle: "One Platform for Continuous Capacity Building",
    aboutDesc1: "PRAGATI integrates learning, assessment, and verified competency tracking. Trainees identify competency gaps, receive personalized advice, and build official profiles.",
    aboutDesc2: "Rather than traditional completions, certifications require passing modular and final quizzes. Verified skill taxonomy tags directly link your certificates as Proof of Work.",
    readMethodology: "Read Platform Methodology",
    verifiedSkillTranscript: "Verified Skill Transcript",
    proofOfWork: "Proof of Work",
    uniqueCredId: "Unique Credential ID:",
    "TypeScript Development": "TypeScript Development",
    "REST API Design": "REST API Design",
    "Machine Learning": "Machine Learning",
    "Advanced Verified": "Advanced Verified",
    "Proficient Verified": "Proficient Verified",
    "In Progress": "In Progress",

    // Choose Your Role
    chooseRoleTitle: "Choose Your Role to Enter Portal",
    chooseRoleSub: "Access dashboard settings, portfolios, and tools tailored to your credential goals.",
    traineeSpace: "Trainee space",
    traineeSlogan: "Learn. Assess. Graduate.",
    traineeDesc: "Browse catalogs, enroll in modules, take timed examinations, evaluate skill gaps, and download PDF certificates.",
    accessTrainee: "Access Trainee Workspace →",
    trainerHub: "Trainer hub",
    trainerSlogan: "Instruct. Create. Diagnose.",
    trainerDesc: "Author course materials, construct randomized test questions, inspect learner rosters, and view AI-diagnostics.",
    accessTrainer: "Access Trainer Panel →",
    platformAdmin: "Platform Admin",
    adminSlogan: "Govern. Maintain. Review.",
    adminDesc: "Verify user directories, activate/deactivate accounts, map competency frameworks, and inspect platform analytics.",
    accessAdmin: "Access Control Panel →",

    // Features Section
    featuresTitle: "Platform Capabilities & Feature Inventory",
    featuresSub: "Built-in mechanics supporting secure examinations and automated competency assessment.",
    feat1Title: "Structured Learning",
    feat1Desc: "Curate modules and upload text/multimedia. Learn sequentially through guided pathways.",
    feat2Title: "Timed Assessments",
    feat2Desc: "MCQ-based quizzes built with client-side anti-cheat sanitization to secure correct answers.",
    feat3Title: "Competency Mapping",
    feat3Desc: "Define standard skills category lists and trace trainees' actual verified expertise levels.",
    feat4Title: "Aggregate Analytics",
    feat4Desc: "Recharts widgets monitoring progress scores, completions, and trainer capacity spreads.",
    feat5Title: "Skill Gap Discovery",
    feat5Desc: "Identify gaps between active capabilities and future career roadmap requirements.",
    feat6Title: "PDFKit Certificates",
    feat6Desc: "Automated compilation of vector PDF certificates featuring distinct verification credentials.",

    // Updates Section
    announcementsTitle: "Latest Announcements & Releases",
    announcementsSub: "Real-time feed outlining system upgrades, assessment modifications, and framework deployments.",
    tagNew: "New",
    tagSecurity: "Security",
    tagCurriculum: "Curriculum",
    statusActive: "Active",
    statusArchived: "Archived",
    "System Update": "System Update",
    "Assessment Gating": "Assessment Gating",
    "Competency Framework": "Competency Framework",
    "New": "New",
    "Security": "Security",
    "Curriculum": "Curriculum",
    "Active": "Active",
    "Archived": "Archived",
    "Adaptive AI Learning Engine v2.4 successfully deployed.": "Adaptive AI Learning Engine v2.4 successfully deployed.",
    "Anti-cheat sanitization protocols expanded for all final competency exams.": "Anti-cheat sanitization protocols expanded for all final competency exams.",
    "30+ standardized skill rubrics added in cooperation with technical advisors.": "30+ standardized skill rubrics added in cooperation with technical advisors.",

    // Programs Section
    programsTitle: "Learning Programs & Competency Areas",
    programsSub: "Browse structured learning domains pre-configured to seed corresponding standard skills.",
    dom1Title: "Frontend Engineering",
    dom1Desc: "Master HTML/CSS layout design, TypeScript types, and React components architecture.",
    dom2Title: "Backend Architecture",
    dom2Desc: "Build robust microservices using Node.js, Express REST API, and MongoDB data modeling.",
    dom3Title: "Data Science & ML",
    dom3Desc: "Write versatile Python code for model forecasting, analytics, and outlier detections.",
    dom4Title: "Professional Soft Skills",
    dom4Desc: "Hone leadership, time prioritization, collaborative teamwork, and presentation capabilities.",
    exploreSkills: "Explore skills →",

    // AI Ecosystem Section
    aiEcosystemTitle: "Empowered by a Custom AI Learning Ecosystem",
    aiEcosystemSub: "AI Tutoring & Advisory Layers",
    aiEcosystemDesc: "PRAGATI wraps database verified records in an intelligent processing layer:",
    aiStep1Title: "Trainee AI Assistant",
    aiStep1Desc: "Floating chatbot resolving course concepts with starter chips and follow-up prompts.",
    aiStep2Title: "Adaptive Advisor Recommendations",
    aiStep2Desc: "Real-time learning state evaluations flagging failures, incomplete pathways, or roadmaps.",
    aiStep3Title: "Trainer Diagnostic Assistant",
    aiStep3Desc: "Portfolio calculations identifying quiz anomalies, high-error questions, and student bottlenecks.",

    // AI Mock UI
    aiSuggestedNext: "🤖 AI Suggested Next Steps",
    priority1: "Priority 1",
    activeCourse: "Active Course",
    match88: "88% Match",
    mockCourseTitle: "REST API Design & Web Integrations",
    mockRationale1: "Rationale: Core requirement to fulfill the \"Backend Architect\" competency milestone.",
    mockStatusInProg: "Status: In Progress",
    continueStudy: "Continue Study →",
    assessRemediation: "Assessment Remediation",
    actionRequired: "Action Required",
    mockQuizTitle: "Module 2 Quiz: Async REST Controllers",
    mockRationale2: "Rationale: Failed attempt detected (50% score). Review question explanation notes.",
    mockScore: "Score: 1/2 Marks",
    explainWithAi: "Explain with AI →",

    // Final CTA
    finalCtaTitle: "Ready to Build and Verify Your Next Skill?",
    finalCtaDesc: "Begin your learning journey on an institutional platform connecting standard curriculum modules, secure anti-cheat tests, and automated credentials verification.",
    getStartedNow: "Get Started Now",
    copyrightText: "© 2026 Pragati. All rights reserved."
  },
  hi: {
    // Top utility & nav
    govOfIndia: "GOVERNMENT OF INDIA",
    skipToMain: "मुख्य सामग्री पर जाएं",
    language: "भाषा",
    platformSubtitle: "संस्थागत कौशल पासपोर्ट",
    home: "होम",
    about: "के बारे में",
    howItWorks: "यह कैसे काम करता है",
    features: "विशेषताएं",
    aiEcosystem: "एआई इकोसिस्टम",
    roles: "भूमिकाएं",
    login: "लॉगिन",
    getStarted: "शुरू करें",
    workspace: "वर्कस्पेस",

    // Hero Section
    aiBadge: "एआई-सक्षम डिजिटल क्षमता निर्माण पोर्टल",
    brandTitle: "प्रगति",
    heroHeading1: "मानकीकृत कौशल बनाएं।",
    heroHeading2: "योग्यताओं को सत्यापित करें। आत्मविश्वास से बढ़ें।",
    heroDesc: "एक आधुनिक कार्यबल कौशल विकास और कौशल सत्यापन पोर्टल। पाठ्यक्रम वितरण, एंटी-चीट मूल्यांकन, पीडीएफकिट प्रमाणपत्र जारी करने और अनुकूली एआई सलाहकार वर्कफ़्लो को एक मंच में कनेक्ट करें।",
    explorePlatform: "प्लेटफॉर्म देखें",

    // About Section
    curriculumStandard: "पाठ्यक्रम मानक",
    continuousCapacityTitle: "सतत क्षमता निर्माण के लिए एक साझा मंच",
    aboutDesc1: "प्रगति सीखने, मूल्यांकन और सत्यापित दक्षता ट्रैकिंग को एकीकृत करता है। प्रशिक्षार्थी योग्यता अंतराल की पहचान करते हैं, व्यक्तिगत सलाह प्राप्त करते हैं, और आधिकारिक प्रोफाइल बनाते हैं।",
    aboutDesc2: "पारंपरिक पूर्णता के बजाय, प्रमाणन के लिए मॉड्यूल और अंतिम क्विज़ उत्तीर्ण करना आवश्यक है। सत्यापित कौशल टैक्सोनॉमी टैग सीधे आपके प्रमाणपत्रों को प्रूफ ऑफ वर्क के रूप में लिंक करते हैं।",
    readMethodology: "प्लेटफॉर्म कार्यप्रणाली पढ़ें",
    verifiedSkillTranscript: "सत्यापित कौशल ट्रांसक्रिप्ट",
    proofOfWork: "प्रूफ ऑफ वर्क",
    uniqueCredId: "अद्वितीय क्रेडेंशियल आईडी:",
    "TypeScript Development": "टाइपस्क्रिप्ट विकास",
    "REST API Design": "REST API डिज़ाइन",
    "Machine Learning": "मशीन लर्निंग",
    "Advanced Verified": "उन्नत सत्यापित",
    "Proficient Verified": "कुशल सत्यापित",
    "In Progress": "प्रगति पर है",

    // Choose Your Role
    chooseRoleTitle: "पोर्टल में प्रवेश करने के लिए अपनी भूमिका चुनें",
    chooseRoleSub: "अपनी क्रेडेंशियल प्राथमिकताओं के अनुरूप डैशबोर्ड सेटिंग्स, पोर्टफोलियो और टूल तक पहुंचें।",
    traineeSpace: "प्रशिक्षार्थी स्थान",
    traineeSlogan: "सीखें। मूल्यांकन करें। स्नातक बनें।",
    traineeDesc: "कैटलॉग ब्राउज़ करें, मॉड्यूल में नामांकन करें, समयबद्ध परीक्षा दें, कौशल अंतराल का मूल्यांकन करें, और पीडीएफ प्रमाणपत्र डाउनलोड करें।",
    accessTrainee: "प्रशिक्षार्थी वर्कस्पेस एक्सेस करें →",
    trainerHub: "प्रशिक्षक हब",
    trainerSlogan: "निर्देश दें। बनाएं। निदान करें।",
    trainerDesc: "पाठ्यक्रम सामग्री तैयार करें, यादृच्छिक परीक्षण प्रश्न बनाएं, शिक्षार्थी सूचियों का निरीक्षण करें और एआई-निदान देखें।",
    accessTrainer: "प्रशिक्षक पैनल एक्सेस करें →",
    platformAdmin: "प्लेटफॉर्म एडमिन",
    adminSlogan: "शासन करें। रखरखाव करें। समीक्षा करें।",
    adminDesc: "उपयोगकर्ता निर्देशिकाओं को सत्यापित करें, खातों को सक्रिय/निष्क्रिय करें, योग्यता ढांचे का मानचित्रण करें, और प्लेटफॉर्म विश्लेषण का निरीक्षण करें।",
    accessAdmin: "नियंत्रण पैनल एक्सेस करें →",

    // Features Section
    featuresTitle: "प्लेटफॉर्म क्षमताएं और विशेषता सूची",
    featuresSub: "सुरक्षित परीक्षाओं और स्वचालित दक्षता मूल्यांकन का समर्थन करने वाले इन-बिल्ट यांत्रिकी।",
    feat1Title: "संरचित शिक्षण",
    feat1Desc: "मॉड्यूल क्यूरेट करें और टेक्स्ट/मल्टीमीडिया अपलोड करें। निर्देशित पथों के माध्यम से क्रमिक रूप से सीखें।",
    feat2Title: "समयबद्ध मूल्यांकन",
    feat2Desc: "सही उत्तरों को सुरक्षित करने के लिए क्लाइंट-साइड एंटी-चीट सैनिटाइजेशन के साथ निर्मित एमसीक्यू-आधारित क्विज़।",
    feat3Title: "योग्यता मानचित्रण",
    feat3Desc: "मानक कौशल श्रेणी सूचियों को परिभाषित करें और प्रशिक्षार्थियों के वास्तविक सत्यापित विशेषज्ञता स्तरों का पता लगाएं।",
    feat4Title: "समग्र विश्लेषण",
    feat4Desc: "प्रगति स्कोर, पूर्णता और प्रशिक्षक क्षमता प्रसार की निगरानी करने वाले रीचार्ट्स विजेट।",
    feat5Title: "कौशल अंतराल खोज",
    feat5Desc: "सक्रिय क्षमताओं और भविष्य के करियर रोडमैप आवश्यकताओं के बीच अंतराल की पहचान करें।",
    feat6Title: "पीडीएफकिट प्रमाणपत्र",
    feat6Desc: "विशिष्ट सत्यापन क्रेडेंशियल्स वाले वेक्टर पीडीएफ प्रमाणपत्रों का स्वचालित संकलन।",

    // Updates Section
    announcementsTitle: "नवीनतम घोषणाएं और विज्ञप्तियां",
    announcementsSub: "सिस्टम अपग्रेड, मूल्यांकन संशोधनों और फ्रेमवर्क तैनाती को रेखांकित करने वाला रीयल-टाइम फीड।",
    tagNew: "नया",
    tagSecurity: "सुरक्षा",
    tagCurriculum: "पाठ्यक्रम",
    statusActive: "सक्रिय",
    statusArchived: "संग्रहित",
    "System Update": "सिस्टम अपडेट",
    "Assessment Gating": "मूल्यांकन गेटिंग",
    "Competency Framework": "योग्यता फ्रेमवर्क",
    "New": "नया",
    "Security": "सुरक्षा",
    "Curriculum": "पाठ्यक्रम",
    "Active": "सक्रिय",
    "Archived": "संग्रहित",
    "Adaptive AI Learning Engine v2.4 successfully deployed.": "अनुकूली एआई लर्निंग इंजन v2.4 सफलतापूर्वक तैनात किया गया।",
    "Anti-cheat sanitization protocols expanded for all final competency exams.": "सभी अंतिम योग्यता परीक्षाओं के लिए एंटी-चीट सैनिटाइजेशन प्रोटोकॉल का विस्तार किया गया।",
    "30+ standardized skill rubrics added in cooperation with technical advisors.": "तकनीकी सलाहकारों के सहयोग से 30+ मानकीकृत कौशल रूब्रिक्स जोड़े गए।",

    // Programs Section
    programsTitle: "लर्निंग प्रोग्राम और योग्यता क्षेत्र",
    programsSub: "संबंधित मानक कौशल को विकसित करने के लिए पूर्व-कॉन्फ़िगर किए गए संरचित शिक्षण डोमेन ब्राउज़ करें।",
    dom1Title: "फ्रंटएंड इंजीनियरिंग",
    dom1Desc: "HTML/CSS लेआउट डिज़ाइन, टाइपस्क्रिप्ट प्रकार और रिएक्ट घटक आर्किटेक्चर में महारत हासिल करें।",
    dom2Title: "बैकएंड आर्किटेक्चर",
    dom2Desc: "Node.js, एक्सप्रेस REST API और MongoDB डेटा मॉडलिंग का उपयोग करके मजबूत माइक्रोसर्विसेज बनाएं।",
    dom3Title: "डेटा साइंस और एमएल",
    dom3Desc: "मॉडल पूर्वानुमान, एनालिटिक्स और आउटलायर डिटेक्शन के लिए बहुमुखी पायठन कोड लिखें।",
    dom4Title: "व्यावसायिक सॉफ्ट कौशल",
    dom4Desc: "नेतृत्व, समय की प्राथमिकता, सहयोगात्मक टीमवर्क और प्रस्तुति क्षमताओं को निखारें।",
    exploreSkills: "कौशलों का अन्वेषण करें →",

    // AI Ecosystem Section
    aiEcosystemTitle: "एक कस्टम एआई लर्निंग इकोसिस्टम द्वारा संचालित",
    aiEcosystemSub: "एआई ट्यूशन और सलाहकार परतें",
    aiEcosystemDesc: "प्रगति एक बुद्धिमान प्रसंस्करण परत में डेटाबेस सत्यापित रिकॉर्ड को लपेटता है:",
    aiStep1Title: "प्रशिक्षार्थी एआई सहायक",
    aiStep1Desc: "स्टार्टर चिप्स और फॉलो-अप संकेतों के साथ पाठ्यक्रम अवधारणाओं को हल करने वाला फ्लोटिंग चैटबॉट।",
    aiStep2Title: "अनुकूली सलाहकार सिफारिशें",
    aiStep2Desc: "विफलताओं, अपूर्ण पथों, या रोडमैप को चिह्नित करने वाले रीयल-टाइम शिक्षण स्थिति मूल्यांकन।",
    aiStep3Title: "प्रशिक्षक नैदानिक सहायक",
    aiStep3Desc: "क्विज़ विसंगतियों, उच्च-त्रुटि प्रश्नों और छात्र बाधाओं की पहचान करने वाले पोर्टफोलियो गणना।",

    // AI Mock UI
    aiSuggestedNext: "🤖 एआई द्वारा सुझाए गए अगले कदम",
    priority1: "प्राथमिकता 1",
    activeCourse: "सक्रिय पाठ्यक्रम",
    match88: "88% मैच",
    mockCourseTitle: "REST API डिज़ाइन और वेब एकीकरण",
    mockRationale1: "तर्क: \"बैकएंड आर्किटेक्ट\" योग्यता मील के पत्थर को पूरा करने के लिए मुख्य आवश्यकता।",
    mockStatusInProg: "स्थिति: प्रगति पर है",
    continueStudy: "अध्ययन जारी रखें →",
    assessRemediation: "मूल्यांकन उपचार",
    actionRequired: "कार्रवाई आवश्यक",
    mockQuizTitle: "मॉड्यूल 2 क्विज़: एसिंक्रोनस रेस्ट कंट्रोलर्स",
    mockRationale2: "तर्क: विफल प्रयास का पता चला (50% स्कोर)। प्रश्न स्पष्टीकरण नोट्स की समीक्षा करें।",
    mockScore: "स्कोर: 1/2 अंक",
    explainWithAi: "एआई के साथ समझें →",

    // Final CTA
    finalCtaTitle: "क्या आप अपने अगले कौशल का निर्माण और सत्यापन करने के लिए तैयार हैं?",
    finalCtaDesc: "मानक पाठ्यक्रम मॉड्यूल, सुरक्षित एंटी-चीट परीक्षणों और स्वचालित क्रेडेंशियल सत्यापन को जोड़ने वाले संस्थागत मंच पर अपनी सीखने की यात्रा शुरू करें।",
    getStartedNow: "अभी शुरू करें",
    copyrightText: "© 2026 Pragati. All rights reserved."
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
