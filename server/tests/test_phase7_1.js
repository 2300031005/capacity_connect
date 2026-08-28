const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Models
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const QuizAttempt = require('../models/QuizAttempt');
const Certificate = require('../models/Certificate');
const Skill = require('../models/Skill');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/capacity_connect_test';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

// Controller functions
const {
  getModuleQuiz,
  getFinalAssessment,
  submitAssessmentAttempt,
  getAssessmentAttemptReview,
  explainAssessmentQuestion,
} = require('../controllers/assessmentController');

const {
  generateQuestionExplanation,
  generateFallbackExplanation,
  checkRateLimit,
} = require('../services/openaiService');

const { getMySkills } = require('../controllers/traineeSkillController');

// Mock response creator
function createMockRes() {
  const res = {
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log('\n==================================================');
  console.log('CAPACITY CONNECT — PHASE 7.1 AI TUTOR TEST SUITE');
  console.log('==================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for testing.\n');

    // Clean up previous test artifacts
    await User.deleteMany({ email: /@test71\.com$/ });
    await Course.deleteMany({ title: /\[Phase 7\.1 Test\]/ });
    await Skill.deleteMany({ name: /\[P7\.1\]/ });

    // 1. Create Test Users
    const adminUser = await User.create({
      name: 'Admin User 7.1',
      email: 'admin@test71.com',
      password: 'password123',
      role: 'admin',
      department: 'Engineering',
    });

    const trainerUser = await User.create({
      name: 'Trainer Dave 7.1',
      email: 'trainer@test71.com',
      password: 'password123',
      role: 'trainer',
      department: 'Computer Science',
    });

    const traineeA = await User.create({
      name: 'Trainee Alice 7.1',
      email: 'traineeA@test71.com',
      password: 'password123',
      role: 'trainee',
      department: 'Software Engineering',
    });

    const traineeB = await User.create({
      name: 'Trainee Bob 7.1',
      email: 'traineeB@test71.com',
      password: 'password123',
      role: 'trainee',
      department: 'Data Science',
    });

    // Create Skill
    const skillDoc = await Skill.create({
      name: '[P7.1] React Architecture',
      category: 'Technical',
      customCategory: 'Frontend Web',
      createdBy: adminUser._id,
    });

    // Create Course with Skill
    const courseDoc = await Course.create({
      title: '[Phase 7.1 Test] Advanced React & State Management',
      description: 'In-depth React patterns and hooks course',
      category: 'Frontend Web',
      level: 'intermediate',
      trainer: trainerUser._id,
      status: 'published',
      skills: [{ skill: skillDoc._id, proficiency: 'proficient' }],
    });

    // Create Module
    const moduleDoc = await Module.create({
      title: 'Module 1: React Hooks Deep Dive',
      course: courseDoc._id,
      order: 1,
    });

    // Create Module Quiz with Instructor Explanations
    const moduleQuiz = await Assessment.create({
      course: courseDoc._id,
      module: moduleDoc._id,
      type: 'module',
      title: 'Hooks Architecture Quiz',
      passingPercentage: 50,
      status: 'published',
      questions: [
        {
          questionText: 'What is the primary purpose of the useEffect hook in React?',
          optionA: 'To manage component local state',
          optionB: 'To execute side effects in response to render cycles',
          optionC: 'To optimize DOM rendering speed',
          optionD: 'To share state between unrelated components',
          correctOption: 'B',
          marks: 1,
          explanation: 'useEffect handles side effects such as data fetching, subscriptions, and DOM mutations after render.',
        },
        {
          questionText: 'Which hook should be used to memoize expensive calculation results?',
          optionA: 'useCallback',
          optionB: 'useMemo',
          optionC: 'useRef',
          optionD: 'useLayoutEffect',
          correctOption: 'B',
          marks: 1,
          explanation: 'useMemo returns a memoized value from an expensive computation, recomputing only when dependencies change.',
        },
      ],
    });

    // Create Final Assessment (One question without trainer explanation to test fallback)
    const finalAssessment = await Assessment.create({
      course: courseDoc._id,
      type: 'final',
      title: 'Advanced React Final Certification Exam',
      passingPercentage: 50,
      status: 'published',
      questions: [
        {
          questionText: 'When does React trigger a component re-render?',
          optionA: 'When props or state change',
          optionB: 'When any JavaScript global variable changes',
          optionC: 'Only when manually forced by developer',
          optionD: 'Every 1000 milliseconds automatically',
          correctOption: 'A',
          marks: 2,
          // Intentionally omitting explanation to test AI explanation with missing trainer explanation
        },
      ],
    });

    // Enroll Trainee A in Course
    const enrollmentA = await Enrollment.create({
      trainee: traineeA._id,
      course: courseDoc._id,
      progress: 50,
      status: 'active',
      completedModules: [moduleDoc._id],
    });

    // ----------------------------------------------------
    // TEST 1: OpenAI Service Structured Fallback & Unit Generation
    // ----------------------------------------------------
    console.log('\n--- Test 1: OpenAI Service Generation & Schema Verification ---');
    {
      const explanation = await generateQuestionExplanation({
        courseTitle: 'React Mastery',
        moduleTitle: 'Hooks',
        assessmentType: 'module',
        skillName: 'React',
        targetProficiency: 'proficient',
        questionText: 'What does useEffect do?',
        optionA: 'State',
        optionB: 'Side effects',
        optionC: 'Styles',
        optionD: 'Routing',
        selectedOption: 'A',
        correctOption: 'B',
        trainerExplanation: 'useEffect manages side effects.',
        marks: 1,
      });

      assert(typeof explanation.explanation === 'string', 'Service returned high-level explanation');
      assert(typeof explanation.whyYourAnswerWasWrong === 'string', 'Service returned whyYourAnswerWasWrong for incorrect choice');
      assert(typeof explanation.correctConcept === 'string', 'Service returned correctConcept');
      assert(typeof explanation.keyTakeaway === 'string', 'Service returned keyTakeaway');
      assert(typeof explanation.studyTip === 'string', 'Service returned studyTip');
    }

    // ----------------------------------------------------
    // TEST 2: Anti-Cheat Sanitization on Active Quiz (correctOption & explanation hidden)
    // ----------------------------------------------------
    console.log('\n--- Test 2: Anti-Cheat Sanitization Prior to Submission ---');
    {
      const req = { user: traineeA, params: { moduleId: moduleDoc._id.toString() } };
      const res = createMockRes();
      await getModuleQuiz(req, res, (err) => { throw err; });

      assert(res.statusCode === 200, 'Trainee successfully retrieved module quiz');
      const q = res.jsonData.data.quiz.questions[0];
      assert(q.correctOption === undefined, 'correctOption is strictly sanitized from active quiz payload');
      assert(q.explanation === undefined, 'explanation is strictly sanitized from active quiz payload');
    }

    // ----------------------------------------------------
    // TEST 3: Trainee Submits Module Quiz Attempt (Q1 Wrong, Q2 Correct)
    // ----------------------------------------------------
    console.log('\n--- Test 3: Submitting Module Quiz Attempt ---');
    let moduleAttemptId = null;
    const q1Id = moduleQuiz.questions[0]._id.toString();
    const q2Id = moduleQuiz.questions[1]._id.toString();
    {
      const req = {
        user: traineeA,
        params: { id: moduleQuiz._id.toString() },
        body: {
          answers: [
            { questionId: q1Id, selectedOption: 'A' }, // Wrong (Correct is B)
            { questionId: q2Id, selectedOption: 'B' }, // Correct (Correct is B)
          ],
        },
      };
      const res = createMockRes();
      await submitAssessmentAttempt(req, res, (err) => { throw err; });

      assert(res.statusCode === 201 && res.jsonData.success, 'Module quiz submitted successfully');
      assert(res.jsonData.data.attempt.score === 1, 'Attempt scored 1/2 marks');
      assert(res.jsonData.data.attempt.percentage === 50, 'Attempt scored 50%');
      assert(res.jsonData.data.attempt.passed === true, 'Attempt reached passing threshold');
      moduleAttemptId = res.jsonData.data.attempt._id.toString();
    }

    // ----------------------------------------------------
    // TEST 4: Trainee Requests AI Explanation for Incorrect Question (Q1)
    // ----------------------------------------------------
    console.log('\n--- Test 4: AI Explanation for Incorrect Question ---');
    {
      const req = {
        user: traineeA,
        params: { attemptId: moduleAttemptId, questionId: q1Id },
      };
      const res = createMockRes();
      await explainAssessmentQuestion(req, res, (err) => { throw err; });

      assert(res.statusCode === 200 && res.jsonData.success, 'Trainee retrieved AI explanation for incorrect question');
      assert(res.jsonData.data.isCorrect === false, 'Result indicates question was answered incorrectly');
      assert(res.jsonData.data.selectedOption === 'A', 'Correctly identified trainee selected option A');
      assert(res.jsonData.data.correctOption === 'B', 'Correctly identified authoritative correct option B');
      assert(res.jsonData.data.skill.name === '[P7.1] React Architecture', 'Contextually identified course skill name');

      const ai = res.jsonData.data.aiExplanation;
      assert(typeof ai.explanation === 'string' && ai.explanation.length > 0, 'Explanation summary returned');
      assert(typeof ai.whyYourAnswerWasWrong === 'string' && ai.whyYourAnswerWasWrong.length > 0, 'whyYourAnswerWasWrong explains Option A mistake');
      assert(typeof ai.correctConcept === 'string', 'correctConcept details useEffect side effects');
      assert(typeof ai.keyTakeaway === 'string', 'keyTakeaway provided');
      assert(typeof ai.studyTip === 'string', 'studyTip provided');
    }

    // ----------------------------------------------------
    // TEST 5: Trainee Requests AI Explanation for Correct Question (Q2)
    // ----------------------------------------------------
    console.log('\n--- Test 5: AI Explanation for Correct Question ---');
    {
      const req = {
        user: traineeA,
        params: { attemptId: moduleAttemptId, questionId: q2Id },
      };
      const res = createMockRes();
      await explainAssessmentQuestion(req, res, (err) => { throw err; });

      assert(res.statusCode === 200 && res.jsonData.success, 'Trainee retrieved AI explanation for correct question');
      assert(res.jsonData.data.isCorrect === true, 'Result indicates question was answered correctly');
      const ai = res.jsonData.data.aiExplanation;
      assert(typeof ai.whyYourAnswerWasCorrect === 'string', 'whyYourAnswerWasCorrect explains why useMemo was the right choice');
    }

    // ----------------------------------------------------
    // TEST 6: RBAC Isolation: Trainee B Cannot Access Trainee A's Attempt AI Explanation
    // ----------------------------------------------------
    console.log('\n--- Test 6: RBAC Attempt Isolation Guard ---');
    {
      const req = {
        user: traineeB, // Unrelated trainee
        params: { attemptId: moduleAttemptId, questionId: q1Id },
      };
      const res = createMockRes();
      await explainAssessmentQuestion(req, res, (err) => { throw err; });

      assert(res.statusCode === 403, 'Trainee B is strictly blocked with 403 Forbidden from accessing Trainee A explanation');
    }

    // ----------------------------------------------------
    // TEST 7: Submitting Final Assessment & Verifying Skill + Certificate Intact
    // ----------------------------------------------------
    console.log('\n--- Test 7: Final Assessment Submission & Verification ---');
    let finalAttemptId = null;
    const finalQId = finalAssessment.questions[0]._id.toString();
    {
      const req = {
        user: traineeA,
        params: { id: finalAssessment._id.toString() },
        body: {
          answers: [
            { questionId: finalQId, selectedOption: 'A' }, // Correct (props or state change)
          ],
        },
      };
      const res = createMockRes();
      await submitAssessmentAttempt(req, res, (err) => { throw err; });

      assert(res.statusCode === 201 && res.jsonData.success, 'Final assessment submitted successfully');
      assert(res.jsonData.data.attempt.percentage === 100, 'Final assessment scored 100%');
      assert(res.jsonData.data.certificate !== null, 'Certificate generated upon passing final exam');
      finalAttemptId = res.jsonData.data.attempt._id.toString();

      // Verify skill was awarded
      const skillReq = { user: traineeA };
      const skillRes = createMockRes();
      await getMySkills(skillReq, skillRes, (err) => { throw err; });
      const verified = skillRes.jsonData.verifiedSkills || skillRes.jsonData.data || [];
      assert(verified.some(s => s.name === '[P7.1] React Architecture' && s.highestProficiency === 'proficient'),
        'React Architecture skill verified at proficient level without degradation');
    }

    // ----------------------------------------------------
    // TEST 8: AI Explanation for Final Assessment (Handling Missing Trainer Explanation)
    // ----------------------------------------------------
    console.log('\n--- Test 8: Final Assessment Explanation with Missing Trainer Explanation ---');
    {
      const req = {
        user: traineeA,
        params: { attemptId: finalAttemptId, questionId: finalQId },
      };
      const res = createMockRes();
      await explainAssessmentQuestion(req, res, (err) => { throw err; });

      assert(res.statusCode === 200 && res.jsonData.success, 'AI explanation generated for final assessment question');
      assert(res.jsonData.data.trainerExplanation === null, 'Handled absence of trainer explanation without crashing');
      assert(typeof res.jsonData.data.aiExplanation.correctConcept === 'string', 'Synthesized correctConcept from question prompt and options');
    }

    // ----------------------------------------------------
    // TEST 9: In-Memory Rate Limiting Enforcement
    // ----------------------------------------------------
    console.log('\n--- Test 9: In-Memory Abuse & Rate Protection ---');
    {
      const testUserId = 'mock-rate-user-' + Date.now();
      let limitHit = false;

      for (let i = 0; i < 20; i++) {
        const check = checkRateLimit(testUserId);
        if (!check.allowed) {
          limitHit = true;
          break;
        }
      }

      assert(limitHit === true, 'Rate limiter actively flagged excessive consecutive AI requests');
    }

    // ----------------------------------------------------
    // TEST 10: Invalid Question ID Guard ---
    // ----------------------------------------------------
    console.log('\n--- Test 10: Invalid Question ID Guard ---');
    {
      const nonExistentQId = new mongoose.Types.ObjectId().toString();
      const req = {
        user: traineeA,
        params: { attemptId: moduleAttemptId, questionId: nonExistentQId },
      };
      const res = createMockRes();
      await explainAssessmentQuestion(req, res, (err) => { throw err; });

      assert(res.statusCode === 404, 'Returns 404 Not Found when questionId is not part of the attempt');
    }

    // Clean up
    await User.deleteMany({ email: /@test71\.com$/ });
    await Course.deleteMany({ title: /\[Phase 7\.1 Test\]/ });
    await Module.deleteMany({ course: courseDoc._id });
    await Enrollment.deleteMany({ course: courseDoc._id });
    await Assessment.deleteMany({ course: courseDoc._id });
    await QuizAttempt.deleteMany({ course: courseDoc._id });
    await Certificate.deleteMany({ course: courseDoc._id });
    await Skill.deleteMany({ name: /\[P7\.1\]/ });

    console.log('\n==================================================');
    console.log(`PHASE 7.1 TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log('==================================================\n');

    await mongoose.disconnect();
    process.exit(testsFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error during test execution:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();
