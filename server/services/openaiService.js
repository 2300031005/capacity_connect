/**
 * Capacity Connect — OpenAI AI Tutoring & Recommendation Service (Phase 7.1, 7.2 & 7.3)
 *
 * Provides:
 * 1. Educational, concept-level assessment explanations tailored to trainee choices (Phase 7.1)
 * 2. Personalized AI-powered course and learning recommendations (Phase 7.2)
 * 3. Centralized AI Recommendation Hub: Courses, Skills to Develop, Assessment Insights, Next Steps (Phase 7.3)
 * 4. Contextual AI Action Advisors: Skill Improvement Guidance & Course-Specific Rationale (Phase 7.3)
 */

/**
 * Load OpenAI Configuration from Environment Variables
 * Ensures zero hardcoding of API keys, models, base URLs, or timeouts.
 */
const getOpenAiConfig = () => {
  return {
    apiKey: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '',
    model: process.env.OPENAI_MODEL ? process.env.OPENAI_MODEL.trim() : 'gpt-4o-mini',
    baseUrl: (process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    timeoutMs: parseInt(process.env.OPENAI_TIMEOUT_MS || '10000', 10),
  };
};

// In-memory rate limiting map: [userId] -> Array<timestamp>
const userRequestTimestamps = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 15; // Max 15 requests per minute per user

/**
 * Check and enforce in-memory rate limiting for AI requests
 * @param {string} userId - User ObjectId string
 * @returns {{ allowed: boolean, remainingMs?: number }}
 */
const checkRateLimit = (userId) => {
  const now = Date.now();
  const timestamps = userRequestTimestamps.get(userId) || [];

  // Filter timestamps within the rolling window
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = validTimestamps[0];
    const remainingMs = RATE_LIMIT_WINDOW_MS - (now - oldest);
    userRequestTimestamps.set(userId, validTimestamps);
    return { allowed: false, remainingMs: Math.max(remainingMs, 1000) };
  }

  validTimestamps.push(now);
  userRequestTimestamps.set(userId, validTimestamps);
  return { allowed: true };
};

/**
 * Deterministic fallback educational explanation generator (Phase 7.1)
 */
const generateFallbackExplanation = ({
  questionText,
  optionA,
  optionB,
  optionC,
  optionD,
  selectedOption,
  correctOption,
  trainerExplanation,
  skillName,
  isCorrect,
}) => {
  const optionsMap = { A: optionA, B: optionB, C: optionC, D: optionD };
  const selectedText = optionsMap[selectedOption] || `Option ${selectedOption}`;
  const correctText = optionsMap[correctOption] || `Option ${correctOption}`;
  const skillMention = skillName ? ` related to ${skillName}` : '';

  if (isCorrect) {
    return {
      explanation:
        trainerExplanation ||
        `Option ${correctOption} ("${correctText}") is the correct response for this concept${skillMention}.`,
      whyYourAnswerWasCorrect: `You correctly selected Option ${selectedOption} ("${selectedText}"), demonstrating understanding of this core principle.`,
      correctConcept:
        trainerExplanation ||
        `The concept tested by "${questionText}" relies on understanding "${correctText}" as the standard approach in ${skillName || 'this subject'}.`,
      keyTakeaway: `Keep applying this understanding of ${skillName || 'the topic'} in practical scenarios.`,
      studyTip: `Reinforce your knowledge by building a small project or practice exercise utilizing this concept.`,
    };
  }

  return {
    explanation:
      trainerExplanation ||
      `The correct answer is Option ${correctOption} ("${correctText}"). Option ${selectedOption} ("${selectedText}") does not fully address the question prompt.`,
    whyYourAnswerWasWrong: `You chose Option ${selectedOption} ("${selectedText}"), which is incorrect for this question. The question specifically asks regarding "${questionText}".`,
    correctConcept:
      trainerExplanation ||
      `The foundational principle is represented by Option ${correctOption} ("${correctText}"), which accurately reflects best practices${skillMention}.`,
    keyTakeaway: `Remember: "${correctText}" is the correct standard when dealing with ${questionText.toLowerCase().slice(0, 50)}...`,
    studyTip: `Review the course lecture notes and module resources on ${skillName || 'this topic'} before re-attempting.`,
  };
};

/**
 * Generate an educational question-by-question AI explanation (Phase 7.1)
 */
const generateQuestionExplanation = async (context) => {
  const {
    courseTitle,
    moduleTitle,
    assessmentType,
    skillName,
    targetProficiency,
    questionText,
    optionA,
    optionB,
    optionC,
    optionD,
    selectedOption,
    correctOption,
    trainerExplanation,
    marks,
  } = context;

  const isCorrect = String(selectedOption).toUpperCase() === String(correctOption).toUpperCase();
  const { apiKey, model, baseUrl, timeoutMs } = getOpenAiConfig();

  if (!apiKey) {
    return generateFallbackExplanation({
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      selectedOption,
      correctOption,
      trainerExplanation,
      skillName,
      isCorrect,
    });
  }

  const systemPrompt = `You are an educational assessment tutor for the Capacity Connect learning platform.
Your job is to provide clear, constructive, concise, and structured explanations for assessment questions based on the trainee's response, the authoritative correct answer, and the instructor's context.
Explain why the chosen answer was right or wrong without being condescending. Focus on educational concepts, key takeaways, and memorable study tips.

IMPORTANT RULES:
1. Treat the Instructor's Authoritative Explanation as the primary source of truth. Do NOT contradict it.
2. Return ONLY a valid JSON object matching the following structure:
{
  "explanation": "High level summary (2 sentences)",
  ${isCorrect ? '"whyYourAnswerWasCorrect"' : '"whyYourAnswerWasWrong"'}: "Specific constructive analysis explaining why the selected choice was correct/incorrect",
  "correctConcept": "The foundational concept the learner should understand",
  "keyTakeaway": "One clear, memorable rule of thumb",
  "studyTip": "A practical suggestion or mnemonic for mastering this skill"
}`;

  const userPrompt = `Course: ${courseTitle || 'Learning Course'}
Module: ${moduleTitle || 'General'}
Assessment Type: ${assessmentType || 'Assessment'}
Skill: ${skillName || 'Core Topic'} (${targetProficiency || 'General'} level)
Marks: ${marks || 1}

Question:
${questionText}

Options:
A: ${optionA}
B: ${optionB}
C: ${optionC}
D: ${optionD}

Trainee Selected: Option ${selectedOption || 'None (Unanswered)'}
Authoritative Correct Answer: Option ${correctOption}
Instructor's Explanation: ${trainerExplanation || 'None provided'}
Result: ${isCorrect ? 'Correct' : 'Incorrect'}

Please generate the structured JSON explanation.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`OpenAI API responded with status ${response.status}. Falling back.`);
      return generateFallbackExplanation({
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        selectedOption,
        correctOption,
        trainerExplanation,
        skillName,
        isCorrect,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);

    return {
      explanation: parsed.explanation || trainerExplanation || 'Here is the conceptual breakdown for this question.',
      whyYourAnswerWasWrong: parsed.whyYourAnswerWasWrong || (!isCorrect ? `Option ${selectedOption} was not the correct answer.` : undefined),
      whyYourAnswerWasCorrect: parsed.whyYourAnswerWasCorrect || (isCorrect ? `Option ${selectedOption} was the correct answer.` : undefined),
      correctConcept: parsed.correctConcept || `The correct answer is Option ${correctOption}.`,
      keyTakeaway: parsed.keyTakeaway || 'Review the core concepts behind this question.',
      studyTip: parsed.studyTip || 'Practice related exercises to reinforce your understanding.',
    };
  } catch (error) {
    console.warn(`OpenAI Service Warning (${error.message}). Using fallback generator.`);
    return generateFallbackExplanation({
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      selectedOption,
      correctOption,
      trainerExplanation,
      skillName,
      isCorrect,
    });
  }
};

/**
 * Deterministic fallback recommendation hub generator (Phases 7.2 & 7.3)
 * Synthesizes:
 * 1. Recommended Courses
 * 2. Skills to Develop
 * 3. Assessment Insights
 * 4. Suggested Next Steps
 */
const generateFallbackRecommendations = ({ traineeContext, candidateCourses }) => {
  const verifiedSkillsMap = new Map();
  (traineeContext.verifiedSkills || []).forEach((s) => {
    const sName = (s.name || s).toLowerCase();
    verifiedSkillsMap.set(sName, s.highestProficiency || 'proficient');
  });

  const missingCompetencySkills = new Set();
  const missingSkillToComp = new Map();
  (traineeContext.competencies || []).forEach((comp) => {
    if (comp.status !== 'Demonstrated' && comp.status !== 'Completed') {
      (comp.missingSkills || []).forEach((ms) => {
        const msLower = ms.toLowerCase();
        missingCompetencySkills.add(msLower);
        missingSkillToComp.set(msLower, comp.name);
      });
    }
  });

  // 1. Recommended Courses
  const scored = (candidateCourses || []).map((course) => {
    let score = 70;
    const alignments = [];
    let priority = 'medium';

    const courseSkills = course.skills || [];
    courseSkills.forEach((cs) => {
      const sName = (cs.name || cs.skill?.name || '').toLowerCase();
      const targetProf = cs.proficiency || 'proficient';
      const currentProf = verifiedSkillsMap.get(sName) || 'Not Acquired';

      alignments.push({
        skill: cs.name || cs.skill?.name || 'Technical Skill',
        currentProficiency: currentProf,
        targetProficiency: targetProf.charAt(0).toUpperCase() + targetProf.slice(1),
      });

      if (missingCompetencySkills.has(sName)) {
        score += 15;
        priority = 'high';
      }

      if (currentProf === 'beginner' && targetProf === 'proficient') score += 10;
      if (currentProf === 'proficient' && targetProf === 'advanced') score += 12;
      if (currentProf === 'Not Acquired') score += 8;
    });

    if (course.averageRating >= 4.5) score += 5;
    const matchScore = Math.min(98, Math.max(75, Math.round(score)));
    const primarySkill = courseSkills[0]?.name || courseSkills[0]?.skill?.name || course.category || 'this domain';

    return {
      courseId: course._id.toString(),
      matchScore,
      reason: `Expands your capabilities in ${primarySkill} and advances your institutional competency profile.`,
      skillAlignment: alignments.length > 0 ? alignments : [
        {
          skill: course.category || 'Core Skill',
          currentProficiency: 'Exploring',
          targetProficiency: course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'Proficient',
        },
      ],
      learningBenefit: `Completing this course satisfies requirements toward your target competencies and builds verified evidence.`,
      priority,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  const recommendations = scored.slice(0, 4);

  // 2. Skills to Develop
  const skillsToDevelop = [];
  missingCompetencySkills.forEach((msLower) => {
    const compName = missingSkillToComp.get(msLower);
    const origSkill = (traineeContext.verifiedSkills || []).find((s) => s.name.toLowerCase() === msLower);
    const curr = origSkill ? origSkill.highestProficiency : 'Not Acquired';
    const capName = msLower.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    skillsToDevelop.push({
      skill: origSkill ? origSkill.name : capName,
      currentProficiency: curr === 'Not Acquired' ? 'None' : curr.charAt(0).toUpperCase() + curr.slice(1),
      targetProficiency: curr === 'beginner' ? 'Proficient' : curr === 'proficient' ? 'Advanced' : 'Proficient',
      reason: `Required to complete your in-progress "${compName}" institutional competency milestone.`,
      priority: 'high',
    });
  });

  // If no missing competency skills, add upgrade suggestions for existing beginner skills
  if (skillsToDevelop.length === 0) {
    (traineeContext.verifiedSkills || []).forEach((vs) => {
      if (vs.highestProficiency === 'beginner') {
        skillsToDevelop.push({
          skill: vs.name,
          currentProficiency: 'Beginner',
          targetProficiency: 'Proficient',
          reason: `Progress from foundational knowledge to proficient execution through advanced course modules.`,
          priority: 'medium',
        });
      }
    });
  }

  // 3. Assessment Insights
  const asm = traineeContext.assessmentSummary || {};
  const assessmentInsights = [];
  if (asm.totalAttempts > 0) {
    assessmentInsights.push({
      type: 'performance_summary',
      title: 'Assessment Mastery Trajectory',
      description: `You have completed ${asm.totalAttempts} assessments with an overall pass rate of ${asm.passRate || 0}% and an average score of ${asm.avgScore || 0}%.`,
      status: (asm.passRate || 0) >= 80 ? 'positive' : 'needs_attention',
    });

    if (asm.weakAreas && asm.weakAreas.length > 0) {
      assessmentInsights.push({
        type: 'weak_area',
        title: 'Focus Areas for Reinforcement',
        description: `Your recent quiz attempts show opportunities for deeper review in: ${asm.weakAreas.join(', ')}.`,
        status: 'warning',
      });
    }
  } else {
    assessmentInsights.push({
      type: 'onboarding',
      title: 'Begin Assessment Benchmarking',
      description: 'Take your first module quiz or course assessment to generate personalized performance insights and gap diagnostics.',
      status: 'neutral',
    });
  }

  // 4. Suggested Next Steps
  const nextSteps = [];
  if (traineeContext.learningSkills && traineeContext.learningSkills.length > 0) {
    const activeSkill = traineeContext.learningSkills[0];
    nextSteps.push({
      step: 1,
      title: `Continue In-Progress Coursework`,
      description: `Complete remaining modules in "${activeSkill.courseTitle}" to advance ${activeSkill.name} towards ${activeSkill.targetProficiency}.`,
      actionUrl: `/trainee/my-courses`,
    });
  }

  if (recommendations.length > 0) {
    const topCourseId = recommendations[0].courseId;
    const topCourse = (candidateCourses || []).find((c) => c._id.toString() === topCourseId);
    nextSteps.push({
      step: nextSteps.length + 1,
      title: `Enroll in Top Recommended Course`,
      description: `Begin "${topCourse?.title || 'recommended course'}" to target critical skill proficiencies and competency milestones.`,
      actionUrl: `/trainee/courses/${topCourseId}`,
    });
  }

  nextSteps.push({
    step: nextSteps.length + 1,
    title: `Attempt Course Assessments & Graduate`,
    description: `Complete final course assessments to verify skills on your transcript and receive signed credentials.`,
    actionUrl: `/trainee/assessments`,
  });

  return {
    recommendations,
    skillsToDevelop: skillsToDevelop.slice(0, 4),
    assessmentInsights,
    nextSteps,
  };
};

/**
 * Generate complete AI recommendation hub payload using OpenAI GPT-4o-mini (Phase 7.2 & 7.3)
 */
const generateCourseRecommendations = async ({ traineeContext, candidateCourses }) => {
  const { apiKey, model, baseUrl, timeoutMs } = getOpenAiConfig();

  if (!apiKey || !candidateCourses || candidateCourses.length === 0) {
    return generateFallbackRecommendations({ traineeContext, candidateCourses });
  }

  const candidateCourseIdSet = new Set(candidateCourses.map((c) => c._id.toString()));
  const sanitizedCandidates = candidateCourses.map((c) => ({
    courseId: c._id.toString(),
    title: c.title,
    category: c.category,
    level: c.level,
    description: c.description ? c.description.slice(0, 160) : '',
    skills: (c.skills || []).map((s) => ({
      name: s.name || s.skill?.name || '',
      targetProficiency: s.proficiency || 'proficient',
    })),
    prerequisites: c.prerequisites || '',
    averageRating: c.averageRating || 0,
  }));

  const systemPrompt = `You are the AI Learning Advisor for Capacity Connect, an institutional capacity-building platform.
Analyze the trainee's verified skills, current proficiencies, assessment performance, and institutional competencies to generate a complete personalized learning recommendation hub.

CRITICAL RULES:
1. Recommend ONLY courses from the provided Candidate Courses list. NEVER invent course IDs, titles, or URLs.
2. Return ONLY a valid JSON object matching this schema:
{
  "recommendations": [
    {
      "courseId": "<exact candidate courseId>",
      "matchScore": <integer 75 to 99>,
      "reason": "<clear educational justification linking past learning to this course>",
      "skillAlignment": [
        {
          "skill": "<skill name>",
          "currentProficiency": "<e.g. Beginner, Proficient, or Not Acquired>",
          "targetProficiency": "<e.g. Proficient or Advanced>"
        }
      ],
      "learningBenefit": "<specific competency advancement outcome>",
      "priority": "high" | "medium" | "low"
    }
  ],
  "skillsToDevelop": [
    {
      "skill": "<skill name to develop>",
      "currentProficiency": "<current level>",
      "targetProficiency": "<target level: Beginner, Proficient, or Advanced>",
      "reason": "<why this skill is needed based on gaps or competencies>",
      "priority": "high" | "medium" | "low"
    }
  ],
  "assessmentInsights": [
    {
      "type": "performance_summary" | "weak_area" | "strength",
      "title": "<insight headline>",
      "description": "<detailed observation based on assessment scores and pass rate>",
      "status": "positive" | "warning" | "needs_attention" | "neutral"
    }
  ],
  "nextSteps": [
    {
      "step": <integer 1..4>,
      "title": "<action item title>",
      "description": "<concrete action to take next>",
      "actionUrl": "<optional internal app route, e.g. /trainee/my-courses, /trainee/courses/:id, /trainee/assessments>"
    }
  ]
}`;

  const userPrompt = `Trainee Learning Profile:
- Verified Skills: ${JSON.stringify(traineeContext.verifiedSkills || [])}
- Active / In-Progress Skills: ${JSON.stringify(traineeContext.learningSkills || [])}
- In-Progress Competency Frameworks: ${JSON.stringify(traineeContext.competencies || [])}
- Assessment History: ${JSON.stringify(traineeContext.assessmentSummary || {})}
- Completed Courses: ${traineeContext.completedCoursesCount || 0}

Candidate Courses Available:
${JSON.stringify(sanitizedCandidates, null, 2)}

Please generate the comprehensive structured recommendations hub JSON.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`OpenAI Recommendation Hub API responded with status ${response.status}. Using fallback.`);
      return generateFallbackRecommendations({ traineeContext, candidateCourses });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error('Empty response from OpenAI');

    const parsed = JSON.parse(content);
    const rawRecs = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];

    // Filter to ensure all course IDs are valid database candidates (anti-hallucination)
    const validRecs = rawRecs.filter((r) => r.courseId && candidateCourseIdSet.has(r.courseId.toString()));

    if (validRecs.length === 0) {
      return generateFallbackRecommendations({ traineeContext, candidateCourses });
    }

    return {
      recommendations: validRecs.map((r) => ({
        courseId: r.courseId,
        matchScore: typeof r.matchScore === 'number' ? Math.min(Math.max(r.matchScore, 70), 99) : 85,
        reason: r.reason || 'Recommended based on your current skill development path.',
        skillAlignment: Array.isArray(r.skillAlignment) ? r.skillAlignment : [],
        learningBenefit: r.learningBenefit || 'Expands your institutional competency portfolio.',
        priority: ['high', 'medium', 'low'].includes(r.priority) ? r.priority : 'medium',
      })),
      skillsToDevelop: Array.isArray(parsed.skillsToDevelop) && parsed.skillsToDevelop.length > 0
        ? parsed.skillsToDevelop
        : generateFallbackRecommendations({ traineeContext, candidateCourses }).skillsToDevelop,
      assessmentInsights: Array.isArray(parsed.assessmentInsights) && parsed.assessmentInsights.length > 0
        ? parsed.assessmentInsights
        : generateFallbackRecommendations({ traineeContext, candidateCourses }).assessmentInsights,
      nextSteps: Array.isArray(parsed.nextSteps) && parsed.nextSteps.length > 0
        ? parsed.nextSteps
        : generateFallbackRecommendations({ traineeContext, candidateCourses }).nextSteps,
    };
  } catch (error) {
    console.warn(`OpenAI Recommendations warning (${error.message}). Using fallback.`);
    return generateFallbackRecommendations({ traineeContext, candidateCourses });
  }
};

/**
 * Deterministic fallback skill progression guidance (Phase 7.3)
 */
const generateFallbackSkillGuidance = ({ skillName, currentProficiency, targetProficiency, mappedCourses }) => {
  const current = currentProficiency || 'Beginner';
  const target = targetProficiency || (current.toLowerCase() === 'beginner' ? 'Proficient' : 'Advanced');

  return {
    skillName,
    currentProficiency: current,
    targetProficiency: target,
    roadmapTitle: `Advancing ${skillName} to ${target}`,
    progressionSummary: `To progress from ${current} to ${target} in ${skillName}, combine focused coursework with practical exercises and pass the qualifying final examinations.`,
    recommendedActions: [
      `Complete advanced lessons and interactive lab exercises covering ${skillName}.`,
      `Build an end-to-end practical application demonstrating ${skillName} in production scenarios.`,
      `Review lecture transcripts and quizzes targeting tricky edge cases.`,
      `Pass the course final assessment with ≥80% score to verify ${target} proficiency.`,
    ],
    recommendedCourses: (mappedCourses || []).slice(0, 2).map((c) => ({
      courseId: c._id.toString(),
      title: c.title,
      level: c.level,
      category: c.category,
    })),
  };
};

/**
 * Generate contextual skill progression guidance using OpenAI GPT-4o-mini (Phase 7.3)
 */
const generateSkillGuidance = async ({
  traineeContext,
  skillName,
  currentProficiency,
  targetProficiency,
  mappedCourses,
}) => {
  const { apiKey, model, baseUrl, timeoutMs } = getOpenAiConfig();

  if (!apiKey) {
    return generateFallbackSkillGuidance({ skillName, currentProficiency, targetProficiency, mappedCourses });
  }

  const systemPrompt = `You are the AI Learning Advisor for Capacity Connect.
Provide actionable, structured guidance on how a trainee can advance a specific skill from their current proficiency to their target proficiency.

CRITICAL RULES:
1. Return ONLY a valid JSON object matching this schema:
{
  "skillName": "${skillName}",
  "currentProficiency": "${currentProficiency || 'Beginner'}",
  "targetProficiency": "${targetProficiency || 'Proficient'}",
  "roadmapTitle": "<concise title, e.g. Advancing React to Advanced>",
  "progressionSummary": "<2 sentence overview explaining the key focus areas to bridge the gap>",
  "recommendedActions": [
    "<action 1>",
    "<action 2>",
    "<action 3>",
    "<action 4>"
  ]
}`;

  const userPrompt = `Skill: ${skillName}
Current Level: ${currentProficiency || 'Beginner'}
Target Level: ${targetProficiency || 'Proficient'}
Mapped Platform Courses: ${JSON.stringify((mappedCourses || []).map((c) => ({ id: c._id, title: c.title, level: c.level })))}

Please generate the skill progression guidance.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return generateFallbackSkillGuidance({ skillName, currentProficiency, targetProficiency, mappedCourses });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);
    return {
      skillName,
      currentProficiency: parsed.currentProficiency || currentProficiency,
      targetProficiency: parsed.targetProficiency || targetProficiency,
      roadmapTitle: parsed.roadmapTitle || `Advancing ${skillName} to ${targetProficiency}`,
      progressionSummary: parsed.progressionSummary || `Practical steps to advance your ${skillName} proficiency.`,
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
      recommendedCourses: (mappedCourses || []).slice(0, 2).map((c) => ({
        courseId: c._id.toString(),
        title: c.title,
        level: c.level,
        category: c.category,
      })),
    };
  } catch (err) {
    console.warn(`Skill guidance AI warning (${err.message}). Using fallback.`);
    return generateFallbackSkillGuidance({ skillName, currentProficiency, targetProficiency, mappedCourses });
  }
};

/**
 * Deterministic fallback course-specific recommendation rationale (Phase 7.3)
 */
const generateFallbackCourseRationale = ({ traineeContext, course }) => {
  const verifiedMap = new Map();
  (traineeContext.verifiedSkills || []).forEach((s) => {
    verifiedMap.set(s.name.toLowerCase(), s.highestProficiency);
  });

  const matchingSkills = [];
  const newSkills = [];

  (course.skills || []).forEach((cs) => {
    const sName = cs.name || cs.skill?.name || '';
    if (verifiedMap.has(sName.toLowerCase())) {
      matchingSkills.push({
        skill: sName,
        current: verifiedMap.get(sName.toLowerCase()),
        target: cs.proficiency || 'proficient',
      });
    } else {
      newSkills.push(sName);
    }
  });

  let fitHeadline = `Builds Core Capabilities in ${course.category || 'this domain'}`;
  let whyRecommended = `This course is recommended for your learning pathway because it provides structured training by verified instructors.`;

  if (matchingSkills.length > 0) {
    fitHeadline = `Upgrades Your Existing Skills in ${matchingSkills.map((m) => m.skill).join(', ')}`;
    whyRecommended = `You have foundational experience in ${matchingSkills[0].skill}. This course advances your proficiency to ${matchingSkills[0].target} level.`;
  } else if (newSkills.length > 0) {
    fitHeadline = `Expands Your Profile with New Verified Skills`;
    whyRecommended = `Enrolling in this course enables you to acquire and verify ${newSkills.slice(0, 2).join(' and ')} on your platform transcript.`;
  }

  return {
    courseId: course._id.toString(),
    fitHeadline,
    whyRecommended,
    keyLearningOutcomes: (course.skills || []).map((s) => `Target ${s.proficiency || 'proficient'} mastery in ${s.name || s.skill?.name || 'Skill'}.`),
    competencyRelevance: `Satisfies coursework requirements and builds verified proof-of-work upon passing the final assessment.`,
  };
};

/**
 * Generate contextual course recommendation rationale using OpenAI GPT-4o-mini (Phase 7.3)
 */
const generateCourseRationale = async ({ traineeContext, course }) => {
  const { apiKey, model, baseUrl, timeoutMs } = getOpenAiConfig();

  if (!apiKey) {
    return generateFallbackCourseRationale({ traineeContext, course });
  }

  const systemPrompt = `You are the AI Learning Advisor for Capacity Connect.
Explain to a trainee why a specific course is relevant to their verified learning history and institutional competency targets.

CRITICAL RULES:
1. Return ONLY a valid JSON object matching this schema:
{
  "courseId": "${course._id.toString()}",
  "fitHeadline": "<concise 1-sentence headline highlighting the primary benefit for this learner>",
  "whyRecommended": "<2 sentence personalized explanation referencing trainee's current skills and course fit>",
  "keyLearningOutcomes": [
    "<outcome 1>",
    "<outcome 2>",
    "<outcome 3>"
  ],
  "competencyRelevance": "<1 sentence connecting this course to institutional competency progress>"
}`;

  const userPrompt = `Course Details:
- Title: ${course.title}
- Category: ${course.category}
- Level: ${course.level}
- Target Skills: ${JSON.stringify((course.skills || []).map((s) => ({ name: s.name || s.skill?.name, proficiency: s.proficiency })))}

Trainee Profile:
- Verified Skills: ${JSON.stringify(traineeContext.verifiedSkills || [])}
- In-Progress Competencies: ${JSON.stringify(traineeContext.competencies || [])}

Please generate the personalized course rationale.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return generateFallbackCourseRationale({ traineeContext, course });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);
    return {
      courseId: course._id.toString(),
      fitHeadline: parsed.fitHeadline || `Recommended for your learning path`,
      whyRecommended: parsed.whyRecommended || `This course builds upon your current verified capabilities.`,
      keyLearningOutcomes: Array.isArray(parsed.keyLearningOutcomes) ? parsed.keyLearningOutcomes : [],
      competencyRelevance: parsed.competencyRelevance || `Builds verified credentials for your transcript.`,
    };
  } catch (err) {
    console.warn(`Course rationale AI warning (${err.message}). Using fallback.`);
    return generateFallbackCourseRationale({ traineeContext, course });
  }
};

/**
 * Deterministic fallback personalized learning path generator (Phase 7.4)
 */
const generateFallbackLearningPath = ({ traineeContext, candidateCourses, activeCourses = [], completedCourses = [] }) => {
  const steps = [];
  let seq = 1;

  const verifiedSkillsMap = new Map();
  (traineeContext.verifiedSkills || []).forEach((s) => {
    verifiedSkillsMap.set((s.name || s).toLowerCase(), (s.highestProficiency || 'proficient').toLowerCase());
  });

  const missingCompSkills = new Set();
  (traineeContext.competencies || []).forEach((comp) => {
    (comp.missingSkills || []).forEach((ms) => {
      const msName = typeof ms === 'string' ? ms : ms.name || '';
      if (msName) missingCompSkills.add(msName.toLowerCase());
    });
  });

  const weakAreasSet = new Set(
    (traineeContext.assessmentSummary?.weakAreas || []).map((w) => (typeof w === 'string' ? w.toLowerCase() : ''))
  );

  // 1. Prioritize In-Progress Active Course (Current Stage)
  if (activeCourses && activeCourses.length > 0) {
    const active = activeCourses[0];
    steps.push({
      sequence: seq++,
      courseId: active._id?.toString() || active.courseId?.toString() || active.course?.toString(),
      title: active.title || active.course?.title || 'In-Progress Coursework',
      status: 'current',
      progress: active.progress || 0,
      skills: (active.skills || []).map((s) => ({
        name: s.name || s.skill?.name || 'Technical Skill',
        currentProficiency: verifiedSkillsMap.get((s.name || s.skill?.name || '').toLowerCase()) || 'Learning',
        targetProficiency: s.proficiency || 'Proficient',
      })),
      priority: 'high',
      reason: `You are currently enrolled (${active.progress || 0}% complete). Prioritize finishing remaining modules and passing the final examination.`,
      actionUrl: `/trainee/courses/${active._id?.toString() || active.courseId?.toString() || active.course?.toString()}`,
    });
  }

  // 2. Prioritize Competency Gap Courses
  const usedCourseIds = new Set(steps.map((s) => s.courseId));
  const compCourses = (candidateCourses || []).filter((c) => {
    const cId = c._id.toString();
    if (usedCourseIds.has(cId)) return false;
    return (c.skills || []).some((s) => {
      const sName = (s.name || s.skill?.name || '').toLowerCase();
      return missingCompSkills.has(sName);
    });
  });

  compCourses.slice(0, 2).forEach((c) => {
    usedCourseIds.add(c._id.toString());
    steps.push({
      sequence: seq++,
      courseId: c._id.toString(),
      title: c.title,
      status: 'recommended',
      skills: (c.skills || []).map((s) => ({
        name: s.name || s.skill?.name || 'Skill',
        currentProficiency: verifiedSkillsMap.get((s.name || s.skill?.name || '').toLowerCase()) || 'Not Acquired',
        targetProficiency: s.proficiency || 'Proficient',
      })),
      priority: 'high',
      reason: `Directly fulfills missing skill requirements for your in-progress institutional competency milestone.`,
      actionUrl: `/trainee/courses/${c._id.toString()}`,
    });
  });

  // 3. Prioritize Assessment Weak Area Courses
  const weakCourses = (candidateCourses || []).filter((c) => {
    const cId = c._id.toString();
    if (usedCourseIds.has(cId)) return false;
    return (
      weakAreasSet.has((c.category || '').toLowerCase()) ||
      (c.skills || []).some((s) => weakAreasSet.has((s.name || s.skill?.name || '').toLowerCase()))
    );
  });

  weakCourses.slice(0, 1).forEach((c) => {
    usedCourseIds.add(c._id.toString());
    steps.push({
      sequence: seq++,
      courseId: c._id.toString(),
      title: c.title,
      status: 'recommended',
      skills: (c.skills || []).map((s) => ({
        name: s.name || s.skill?.name || 'Skill',
        currentProficiency: verifiedSkillsMap.get((s.name || s.skill?.name || '').toLowerCase()) || 'Beginner',
        targetProficiency: s.proficiency || 'Proficient',
      })),
      priority: 'high',
      reason: `Strengthens diagnosed assessment focus areas and reinforces core concepts.`,
      actionUrl: `/trainee/courses/${c._id.toString()}`,
    });
  });

  // 4. Fill with Advanced / Complementary Candidates
  const otherCourses = (candidateCourses || []).filter((c) => !usedCourseIds.has(c._id.toString()));
  otherCourses.slice(0, Math.max(0, 4 - steps.length)).forEach((c) => {
    usedCourseIds.add(c._id.toString());
    steps.push({
      sequence: seq++,
      courseId: c._id.toString(),
      title: c.title,
      status: 'next',
      skills: (c.skills || []).map((s) => ({
        name: s.name || s.skill?.name || 'Skill',
        currentProficiency: verifiedSkillsMap.get((s.name || s.skill?.name || '').toLowerCase()) || 'Beginner',
        targetProficiency: s.proficiency || 'Advanced',
      })),
      priority: 'medium',
      reason: `Expands your portfolio with advanced capabilities in ${c.category || 'this domain'}.`,
      actionUrl: `/trainee/courses/${c._id.toString()}`,
    });
  });

  const goal = traineeContext.competencies?.[0]?.name
    ? `Master Institutional Milestone: ${traineeContext.competencies[0].name}`
    : `Achieve Advanced Proficiency in Core Technical & Domain Skills`;

  const summary = steps.length > 0
    ? `Your customized sequence bridges diagnosed skill gaps and advances your competency profile step-by-step.`
    : `Explore the published course catalog to begin building your personalized learning journey.`;

  return { goal, summary, steps };
};

/**
 * Generate complete personalized learning path using OpenAI GPT-4o-mini (Phase 7.4)
 */
const generateLearningPath = async ({
  traineeContext,
  candidateCourses,
  activeCourses = [],
  completedCourses = [],
}) => {
  const { apiKey, model, baseUrl, timeoutMs } = getOpenAiConfig();

  if (!apiKey || ((!candidateCourses || candidateCourses.length === 0) && activeCourses.length === 0)) {
    return generateFallbackLearningPath({ traineeContext, candidateCourses, activeCourses, completedCourses });
  }

  const validCourseMap = new Map();
  (candidateCourses || []).forEach((c) => validCourseMap.set(c._id.toString(), c));
  activeCourses.forEach((c) => {
    const cId = c._id?.toString() || c.courseId?.toString() || c.course?.toString();
    if (cId) validCourseMap.set(cId, c);
  });

  const sanitizedCandidates = (candidateCourses || []).map((c) => ({
    courseId: c._id.toString(),
    title: c.title,
    category: c.category,
    level: c.level,
    description: c.description ? c.description.slice(0, 160) : '',
    skills: (c.skills || []).map((s) => ({
      name: s.name || s.skill?.name || '',
      proficiency: s.proficiency || 'proficient',
    })),
    prerequisites: c.prerequisites || '',
  }));

  const sanitizedActive = activeCourses.map((c) => ({
    courseId: c._id?.toString() || c.courseId?.toString() || c.course?.toString(),
    title: c.title || c.course?.title || 'Active Course',
    progress: c.progress || 0,
  }));

  const systemPrompt = `You are the AI Learning Path Architect for Capacity Connect, an institutional capacity-building platform.
Determine the single best, logically ordered learning journey ("What should this trainee learn next, and in what order?").

CRITICAL SEQUENCING RULES:
1. If the trainee has an active enrolled course with incomplete progress, prioritize continuing that course as Step 1.
2. Address diagnosed assessment weak areas and competency missing skills before recommending unrelated advanced courses.
3. Respect proficiency levels: Beginner < Proficient < Advanced. Do not recommend beginner courses for skills already verified as Advanced.
4. Recommend ONLY courses from the provided Candidate or Active Courses list. NEVER invent course IDs or titles.
5. Return ONLY a valid JSON object matching this schema:
{
  "goal": "<concise overarching learning goal, e.g. Full Stack Cloud Engineer Certification>",
  "summary": "<2 sentence explanation of why this sequence makes sense for this learner>",
  "steps": [
    {
      "sequence": 1,
      "courseId": "<exact candidate or active courseId>",
      "title": "<exact course title>",
      "status": "current" | "recommended" | "next" | "locked",
      "skills": [
        {
          "name": "<skill name>",
          "currentProficiency": "<current level>",
          "targetProficiency": "<target level: Beginner, Proficient, or Advanced>"
        }
      ],
      "priority": "high" | "medium" | "low",
      "reason": "<clear educational rationale explaining why this step is sequenced at this position>",
      "actionUrl": "/trainee/courses/<courseId>"
    }
  ]
}`;

  const userPrompt = `Trainee Profile:
- Verified Skills: ${JSON.stringify(traineeContext.verifiedSkills || [])}
- Active Enrollments: ${JSON.stringify(sanitizedActive)}
- Target Competencies: ${JSON.stringify(traineeContext.competencies || [])}
- Assessment History: ${JSON.stringify(traineeContext.assessmentSummary || {})}
- Completed Courses: ${traineeContext.completedCoursesCount || 0}

Candidate Courses Pool:
${JSON.stringify(sanitizedCandidates, null, 2)}

Please synthesize the logically ordered personalized learning path JSON.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Learning Path AI responded with status ${response.status}. Using fallback.`);
      return generateFallbackLearningPath({ traineeContext, candidateCourses, activeCourses, completedCourses });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);
    const rawSteps = Array.isArray(parsed.steps) ? parsed.steps : [];

    // Filter to ensure every course ID exists in candidate pool or active courses (anti-hallucination)
    const validSteps = rawSteps.filter((s) => s.courseId && validCourseMap.has(s.courseId.toString()));

    if (validSteps.length === 0) {
      return generateFallbackLearningPath({ traineeContext, candidateCourses, activeCourses, completedCourses });
    }

    return {
      goal: parsed.goal || 'Accelerate Your Institutional Competencies',
      summary: parsed.summary || 'A sequenced learning path tailored to your verified progress and skill gaps.',
      steps: validSteps.map((s, idx) => ({
        sequence: s.sequence || idx + 1,
        courseId: s.courseId.toString(),
        title: s.title || validCourseMap.get(s.courseId.toString())?.title || 'Course Step',
        status: ['completed', 'current', 'recommended', 'next', 'locked'].includes(s.status) ? s.status : 'recommended',
        skills: Array.isArray(s.skills) ? s.skills : [],
        priority: ['high', 'medium', 'low'].includes(s.priority) ? s.priority : 'medium',
        reason: s.reason || 'Sequenced to build core foundations before advanced modules.',
        actionUrl: `/trainee/courses/${s.courseId.toString()}`,
      })),
    };
  } catch (err) {
    console.warn(`Learning Path AI warning (${err.message}). Using fallback.`);
    return generateFallbackLearningPath({ traineeContext, candidateCourses, activeCourses, completedCourses });
  }
};

/**
 * Deterministic fallback career roadmap skill generator (Phase 7.4.1 Refinement)
 * Generates an ordered skill journey based on platform taxonomy and trainee profile.
 */
const generateFallbackCareerRoadmap = ({
  careerGoal = 'Full Stack Developer',
  traineeContext,
  availableSkills = [],
  availableCompetencies = [],
  activeCourses = [],
  completedCourses = [],
}) => {
  const normalize = (str) => (str || '').replace(/\[.*?\]/g, '').toLowerCase().trim();
  const goalNorm = normalize(careerGoal);

  // 1. Find matching competency from platform taxonomy via token overlap
  let targetCompetency = null;
  let bestScore = -1;
  const goalTokens = goalNorm.split(/\s+/).filter((t) => t.length > 1);

  (availableCompetencies || []).forEach((c) => {
    const cNorm = normalize(c.name);
    let score = 0;
    if (goalNorm === cNorm) {
      score += 50;
    } else if (goalNorm.includes(cNorm) || cNorm.includes(goalNorm)) {
      score += 25;
    }
    const cTokens = cNorm.split(/\s+/).filter((t) => t.length > 1);
    let matchingTokens = 0;
    goalTokens.forEach((gt) => {
      if (cTokens.some((ct) => ct === gt || (gt.length >= 4 && ct.length >= 4 && gt.slice(0, 4) === ct.slice(0, 4)) || ct.startsWith(gt) || gt.startsWith(ct))) {
        matchingTokens++;
      }
    });

    const totalUniqueTokens = new Set([...goalTokens, ...cTokens]).size;
    const jaccard = totalUniqueTokens > 0 ? matchingTokens / totalUniqueTokens : 0;
    score += jaccard * 20;

    if (score > bestScore) {
      bestScore = score;
      targetCompetency = c;
    }
  });

  if (!targetCompetency && availableCompetencies && availableCompetencies.length > 0) {
    targetCompetency = availableCompetencies[0];
  }

  // 2. Map verified skills
  const verifiedMap = new Map();
  (traineeContext?.verifiedSkills || []).forEach((s) => {
    const sName = s.name || s;
    verifiedMap.set(normalize(sName), {
      proficiency: (s.highestProficiency || 'proficient').toLowerCase(),
      name: sName,
    });
  });

  // 3. Extract ordered skills from target competency or skill taxonomy
  const orderedSkills = [];
  const addedSkillNorms = new Set();

  if (targetCompetency && Array.isArray(targetCompetency.skills)) {
    targetCompetency.skills.forEach((s) => {
      const sName = typeof s === 'string' ? s : s.name || '';
      const sNorm = normalize(sName);
      if (sName && !addedSkillNorms.has(sNorm)) {
        addedSkillNorms.add(sNorm);
        orderedSkills.push(sName);
      }
    });
  }

  // Add relevant platform skills if needed
  if (orderedSkills.length < 3 && availableSkills && availableSkills.length > 0) {
    availableSkills.forEach((s) => {
      const sNorm = normalize(s.name);
      if (s.name && !addedSkillNorms.has(sNorm) && orderedSkills.length < 5) {
        addedSkillNorms.add(sNorm);
        orderedSkills.push(s.name);
      }
    });
  }

  // If still empty, supply clean domain defaults based on goal
  if (orderedSkills.length === 0) {
    if (goalNorm.includes('data')) {
      orderedSkills.push('Python', 'SQL & Relational Databases', 'Data Analysis & Pandas', 'Data Visualization', 'Machine Learning');
    } else if (goalNorm.includes('cloud') || goalNorm.includes('devops')) {
      orderedSkills.push('Linux System Administration', 'Docker & Containerization', 'Kubernetes Orchestration', 'CI/CD Pipelines', 'Cloud Architecture (AWS/GCP)');
    } else {
      orderedSkills.push('JavaScript', 'React', 'Node.js', 'MongoDB', 'Full Stack Integration');
    }
  }

  // 4. Construct ordered skill steps
  const steps = orderedSkills.map((sName, idx) => {
    const sNorm = normalize(sName);
    const isVerified = verifiedMap.has(sNorm);

    return {
      order: idx + 1,
      skill: sName,
      reason: isVerified
        ? `You already have verified foundation in ${sName}. Advance towards mastery.`
        : `Essential prerequisite capability for achieving your target career as a ${careerGoal}.`,
      targetProficiency: 'Proficient',
    };
  });

  return {
    careerGoal,
    targetCompetency: targetCompetency?.name || 'Institutional Milestone Track',
    summary: `Structured skill progression guiding you step-by-step toward achieving your goal as a ${careerGoal}.`,
    steps,
  };
};

/**
 * Generate AI-Powered Career Goal Skill Roadmap using OpenAI GPT-4o-mini (Phase 7.4.1 Refinement)
 * AI Responsibility: Determines the logical ordered SKILL SEQUENCE and rationale.
 * Database Responsibility: Backend matches each skill against published courses.
 */
const generateCareerRoadmap = async ({
  careerGoal = 'Full Stack Developer',
  traineeContext,
  availableSkills = [],
  availableCompetencies = [],
  activeCourses = [],
  completedCourses = [],
}) => {
  const { apiKey, model, baseUrl, timeoutMs } = getOpenAiConfig();

  if (!apiKey) {
    return generateFallbackCareerRoadmap({
      careerGoal,
      traineeContext,
      availableSkills,
      availableCompetencies,
      activeCourses,
      completedCourses,
    });
  }

  const sanitizedSkills = (availableSkills || []).map((s) => s.name);
  const sanitizedCompetencies = (availableCompetencies || []).map((c) => ({
    name: c.name,
    skills: (c.skills || []).map((s) => s.name || s),
  }));

  const systemPrompt = `You are the Senior AI Career & Curriculum Architect for Capacity Connect, an institutional capacity-building portal.
The trainee wants to achieve the following career goal: "${careerGoal}".

CRITICAL ARCHITECTURAL RULES:
1. Your sole responsibility is to formulate a structured, logical sequence of SKILLS (e.g. JavaScript -> React -> Node.js -> MongoDB -> Full Stack Development).
2. DO NOT invent, suggest, or mention course names or course titles. The Capacity Connect database will handle matching courses.
3. Order the skills logically (Prerequisites / Fundamentals -> Core Domain Skills -> Advanced / Integration).
4. For each skill, specify:
   - "order": Integer (1, 2, 3...)
   - "skill": Exact skill name (prefer platform skills from taxonomy when applicable)
   - "reason": Clear, concise explanation of why this skill is needed for the career goal
   - "targetProficiency": "Proficient" or "Advanced"
5. Return ONLY a valid JSON object matching this schema:
{
  "careerGoal": "${careerGoal}",
  "targetCompetency": "<most relevant institutional competency from list or domain title>",
  "summary": "<2-3 sentence overview of this skill learning journey>",
  "steps": [
    {
      "order": 1,
      "skill": "<Skill Name, e.g. JavaScript>",
      "reason": "<Why this skill is required at this stage>",
      "targetProficiency": "Proficient" | "Advanced"
    }
  ]
}`;

  const userPrompt = `Target Career Goal: "${careerGoal}"

Trainee Current State:
- Verified Skills: ${JSON.stringify(traineeContext?.verifiedSkills || [])}
- Active Enrolled Courses: ${JSON.stringify(activeCourses.map((c) => ({ title: c.title, progress: c.progress })))}
- Completed Courses Count: ${traineeContext?.completedCoursesCount || 0}

Platform Taxonomies:
- Available Standard Skills: ${JSON.stringify(sanitizedSkills)}
- Available Competencies: ${JSON.stringify(sanitizedCompetencies)}

Please determine the logical ordered skill roadmap.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Career Roadmap AI responded with status ${response.status}. Using fallback.`);
      return generateFallbackCareerRoadmap({
        careerGoal,
        traineeContext,
        availableSkills,
        availableCompetencies,
        activeCourses,
        completedCourses,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = JSON.parse(content);
    const rawSteps = Array.isArray(parsed.steps) ? parsed.steps : (Array.isArray(parsed.stages) ? parsed.stages : []);

    const validatedSteps = rawSteps.map((st, idx) => ({
      order: st.order || st.sequence || idx + 1,
      skill: st.skill || st.skillName || `Skill ${idx + 1}`,
      reason: st.reason || `Key competency required for ${careerGoal}.`,
      targetProficiency: st.targetProficiency || st.requiredProficiency || 'Proficient',
    }));

    return {
      careerGoal: parsed.careerGoal || careerGoal,
      targetCompetency: parsed.targetCompetency || 'Institutional Career Milestone',
      summary: parsed.summary || `A targeted skill roadmap to help you achieve your career goal as a ${careerGoal}.`,
      steps: validatedSteps.length > 0 ? validatedSteps : generateFallbackCareerRoadmap({ careerGoal, traineeContext, availableSkills, availableCompetencies, activeCourses, completedCourses }).steps,
    };
  } catch (err) {
    console.warn(`Career Roadmap AI error (${err.message}). Using fallback.`);
    return generateFallbackCareerRoadmap({
      careerGoal,
      traineeContext,
      availableSkills,
      availableCompetencies,
      activeCourses,
      completedCourses,
    });
  }
};

module.exports = {
  getOpenAiConfig,
  generateQuestionExplanation,
  generateFallbackExplanation,
  generateCourseRecommendations,
  generateFallbackRecommendations,
  generateSkillGuidance,
  generateFallbackSkillGuidance,
  generateCourseRationale,
  generateFallbackCourseRationale,
  generateLearningPath,
  generateFallbackLearningPath,
  generateCareerRoadmap,
  generateFallbackCareerRoadmap,
  checkRateLimit,
};
