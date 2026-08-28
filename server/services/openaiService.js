/**
 * Capacity Connect — OpenAI AI Tutoring & Explanation Service (Phase 7.1)
 *
 * Provides educational, concept-level assessment explanations tailored to trainee choices,
 * authoritative correct answers, and instructor context.
 */

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
 * Deterministic fallback educational explanation generator
 * Used when OPENAI_API_KEY is not configured or external AI service is unreachable.
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
 * Generate an educational question-by-question AI explanation
 *
 * @param {Object} context - Assessment context object
 * @param {string} context.courseTitle - Course title
 * @param {string} [context.moduleTitle] - Module title (if module quiz)
 * @param {string} context.assessmentType - 'module' | 'final'
 * @param {string} [context.skillName] - Mapped skill name
 * @param {string} [context.targetProficiency] - beginner | proficient | advanced
 * @param {string} context.questionText - Text of the question
 * @param {string} context.optionA - Option A text
 * @param {string} context.optionB - Option B text
 * @param {string} context.optionC - Option C text
 * @param {string} context.optionD - Option D text
 * @param {string} context.selectedOption - Trainee's selected option ('A' | 'B' | 'C' | 'D' | null)
 * @param {string} context.correctOption - Authoritative correct option ('A' | 'B' | 'C' | 'D')
 * @param {string} [context.trainerExplanation] - Authoritative instructor explanation
 * @param {number} [context.marks] - Question marks
 * @returns {Promise<Object>} Structured explanation JSON
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
  const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';

  // If no OpenAI API key is configured, gracefully return structured fallback explanation
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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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

    // Validate structured fields
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

module.exports = {
  generateQuestionExplanation,
  generateFallbackExplanation,
  checkRateLimit,
};
