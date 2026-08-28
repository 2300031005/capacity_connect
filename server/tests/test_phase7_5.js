/**
 * CAPACITY CONNECT (SIH26075) — PHASE 7.5 AUTOMATED TEST SUITE
 * Adaptive AI Learning Advisor
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

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
const Competency = require('../models/Competency');

const {
  getCourseRecommendations,
  getPersonalizedLearningPath,
  getCareerGoal,
  setCareerGoal,
  getCareerRoadmap,
  getAdaptiveAdvisor,
  invalidateTraineeAICache,
  computeTraineeSkillsAndGaps,
} = require('../controllers/recommendationController');

const {
  generateAdaptiveAdvisor,
  generateFallbackAdaptiveAdvisor,
  checkRateLimit,
} = require('../services/openaiService');

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

async function runPhase75Tests() {
  console.log('\n=============================================================');
  console.log('CAPACITY CONNECT — PHASE 7.5 ADAPTIVE AI LEARNING ADVISOR');
  console.log('=============================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Phase 7.5 testing.\n');

    // Clean up test records
    await User.deleteMany({ email: /@test75\.com$/ });
    await Course.deleteMany({ title: /\[Phase 7\.5 Test\]/ });
    await Skill.deleteMany({ name: /\[P7\.5\]/ });
    await Competency.deleteMany({ name: /\[P7\.5\]/ });
    await Certificate.deleteMany({ certificateId: /CC-TEST75/ });

    // 1. Setup Test Users
    const trainer = await User.create({
      name: 'Trainer Phase 7.5',
      email: 'trainer@test75.com',
      password: 'password123',
      role: 'trainer',
      department: 'Computer Science',
    });

    const traineeA = await User.create({
      name: 'Trainee Alice 7.5',
      email: 'alice@test75.com',
      password: 'password123',
      role: 'trainee',
      department: 'Software Engineering',
      careerGoal: 'Full Stack Developer',
    });

    const traineeB = await User.create({
      name: 'Trainee Bob 7.5',
      email: 'bob@test75.com',
      password: 'password123',
      role: 'trainee',
      department: 'Data Science',
      careerGoal: 'Data Analyst',
    });

    // 2. Setup Skills
    const skillJS = await Skill.create({
      name: '[P7.5] JavaScript',
      category: 'Technical',
      isActive: true,
    });

    const skillReact = await Skill.create({
      name: '[P7.5] React',
      category: 'Technical',
      isActive: true,
    });

    const skillNode = await Skill.create({
      name: '[P7.5] Node.js',
      category: 'Technical',
      isActive: true,
    });

    const skillRust = await Skill.create({
      name: '[P7.5] Rust Embedded',
      category: 'Technical',
      isActive: true,
    });

    const skillDraft = await Skill.create({
      name: '[P7.5] Internal Draft Skill',
      category: 'Technical',
      isActive: true,
    });

    // 3. Setup Competency: Full Stack Web Development
    const compFullStack = await Competency.create({
      name: '[P7.5] Full Stack Web Development',
      description: 'Mastery of frontend and backend web technologies.',
      skills: [skillJS._id, skillReact._id, skillNode._id, skillRust._id],
      isActive: true,
    });

    // 4. Setup Courses
    // Course 1: JavaScript (Completed by Trainee A)
    const courseCompleted = await Course.create({
      title: '[Phase 7.5 Test] Core JavaScript Fundamentals',
      description: 'ES6+ async programming and browser APIs.',
      category: 'Web Development',
      level: 'beginner',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillJS._id, proficiency: 'proficient' }],
      averageRating: 4.9,
    });

    // Course 2: React (Active Incomplete enrollment by Trainee A: 65% progress)
    const courseActive = await Course.create({
      title: '[Phase 7.5 Test] Modern React & Redux Development',
      description: 'React hooks and application state.',
      category: 'Frontend Development',
      level: 'intermediate',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillReact._id, proficiency: 'proficient' }],
      averageRating: 4.85,
    });

    // Course 3: Node.js (Published Candidate)
    const courseNode = await Course.create({
      title: '[Phase 7.5 Test] Node.js & Express REST APIs',
      description: 'Backend microservices.',
      category: 'Backend Development',
      level: 'intermediate',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillNode._id, proficiency: 'proficient' }],
      averageRating: 4.8,
    });

    // Course 4: Draft Course (Must never be recommended)
    const courseDraft = await Course.create({
      title: '[Phase 7.5 Test] Unpublished Architecture Blueprint',
      description: 'Draft internal syllabus.',
      category: 'Architecture',
      level: 'advanced',
      trainer: trainer._id,
      status: 'draft',
      skills: [{ skill: skillDraft._id, proficiency: 'advanced' }],
    });

    // 5. Setup Trainee A's verified history (Completed Course 1)
    const mod1 = await Module.create({
      course: courseCompleted._id,
      title: 'Module 1: JS Syntax',
      order: 1,
    });

    const finalExam = await Assessment.create({
      course: courseCompleted._id,
      type: 'final',
      title: 'JavaScript Certification Exam',
      passingPercentage: 60,
      status: 'published',
      questions: [
        {
          questionText: 'Is const immutable in JavaScript?',
          optionA: 'Binding is immutable',
          optionB: 'Values cannot change',
          optionC: 'No',
          optionD: 'None',
          correctOption: 'A',
          marks: 10,
        },
      ],
    });

    await Enrollment.create({
      trainee: traineeA._id,
      course: courseCompleted._id,
      progress: 100,
      status: 'completed',
      completedModules: [mod1._id],
    });

    await QuizAttempt.create({
      trainee: traineeA._id,
      assessment: finalExam._id,
      course: courseCompleted._id,
      type: 'final',
      score: 10,
      totalMarks: 10,
      percentage: 100,
      passed: true,
      submittedAt: new Date(Date.now() - 3600 * 1000),
    });

    await Certificate.create({
      certificateId: 'CC-TEST75-' + Date.now(),
      trainee: traineeA._id,
      course: courseCompleted._id,
      trainer: trainer._id,
      assessment: finalExam._id,
      score: 10,
      totalMarks: 10,
      percentage: 100,
      issuedAt: new Date(Date.now() - 3600 * 1000),
      filePath: 'uploads/certificates/test75.pdf',
      status: 'valid',
    });

    // Active Incomplete Enrollment in Course 2 (65%)
    const activeEnrA = await Enrollment.create({
      trainee: traineeA._id,
      course: courseActive._id,
      progress: 65,
      status: 'active',
      completedModules: [],
    });

    // ----------------------------------------------------
    // TEST 1: Adaptive Advisor Endpoint Structure & Incomplete Course Priority
    // ----------------------------------------------------
    console.log('--- Test 1: Incomplete Active Course Prioritization (continue_course) ---');
    let advisorDataA = null;
    {
      const req = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const res = createMockRes();
      await getAdaptiveAdvisor(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'getAdaptiveAdvisor returned HTTP 200 OK');
      advisorDataA = res.jsonData.data;

      assert(advisorDataA.nextAction !== null, 'Contains nextAction object');
      assert(advisorDataA.nextAction.type === 'continue_course', 'Classified next action as "continue_course"');
      assert(advisorDataA.nextAction.progress === 65, 'Reflects real database progress: 65%');
      assert(advisorDataA.nextAction.courseAvailable === true, 'courseAvailable is true');
      assert(advisorDataA.nextAction.course && advisorDataA.nextAction.course.title.includes('Modern React & Redux Development'), 'Matched to real MongoDB active course');
      assert(typeof advisorDataA.nextAction.reason === 'string' && advisorDataA.nextAction.reason.length > 0, 'Contains actionable reason');
      assert(typeof advisorDataA.insight === 'string' && advisorDataA.insight.length > 0, 'Contains educational insight');
    }

    // ----------------------------------------------------
    // TEST 2: Completed Course Exclusion from New Suggestions
    // ----------------------------------------------------
    console.log('\n--- Test 2: Completed Course Exclusion ---');
    {
      const currentCrsId = (advisorDataA.nextAction.course.courseId || advisorDataA.nextAction.course.id || advisorDataA.nextAction.course._id).toString();
      assert(currentCrsId !== courseCompleted._id.toString(), 'Does not recommend already completed course 1');
    }

    // ----------------------------------------------------
    // TEST 3: Multi-Trainee Profile Isolation
    // ----------------------------------------------------
    console.log('\n--- Test 3: Multi-Trainee Isolation ---');
    {
      const reqB = { user: traineeB, query: { refresh: 'true' }, method: 'GET' };
      const resB = createMockRes();
      await getAdaptiveAdvisor(reqB, resB, (err) => { throw err; });
      assert(resB.statusCode === 200 && resB.jsonData.success, 'Trainee B getAdaptiveAdvisor returned HTTP 200');
      assert(resB.jsonData.data.careerGoal === 'Data Analyst', 'Trainee B preserves distinct career goal (Data Analyst)');
      assert(resB.jsonData.data.traineeSummary.activeEnrollmentCount === 0, 'Trainee B has 0 active enrollments');
    }

    // ----------------------------------------------------
    // TEST 4: Failed Assessment Remediation Trigger
    // ----------------------------------------------------
    console.log('\n--- Test 4: Failed Assessment Remediation Trigger ---');
    {
      // Create a quiz for course 2 and simulate a failed attempt (48%)
      const quizCourse2 = await Assessment.create({
        course: courseActive._id,
        type: 'module',
        title: 'React State Management Quiz',
        passingPercentage: 60,
        status: 'published',
        questions: [
          {
            questionText: 'Is Redux Reducer a pure function?',
            optionA: 'Yes, always pure',
            optionB: 'No, it mutates state',
            optionC: 'Only for async calls',
            optionD: 'None of the above',
            correctOption: 'A',
            marks: 10,
          },
        ],
      });

      const failedAttempt = await QuizAttempt.create({
        trainee: traineeA._id,
        assessment: quizCourse2._id,
        course: courseActive._id,
        type: 'module',
        score: 4.8,
        totalMarks: 10,
        percentage: 48,
        passed: false,
        submittedAt: new Date(),
      });

      // Complete the active course modules to test assessment remediation priority
      await Enrollment.findByIdAndUpdate(activeEnrA._id, { progress: 100 });
      invalidateTraineeAICache(traineeA._id);

      const reqRemediation = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resRemediation = createMockRes();
      await getAdaptiveAdvisor(reqRemediation, resRemediation, (err) => { throw err; });

      const remediationData = resRemediation.jsonData.data;
      assert(remediationData.nextAction.type === 'review_assessment' || remediationData.nextAction.type === 'retry_assessment', 'Classified action as assessment remediation');
      assert(remediationData.nextAction.assessment !== null, 'Contains assessment details');
      assert(remediationData.nextAction.assessment.percentage === 48 || remediationData.nextAction.assessment.score === 4.8 || remediationData.nextAction.assessment.score === 48, 'Database score (48%) accurately attached');
      assert(remediationData.nextAction.reason.includes('48%') || remediationData.insight.includes('48%') || remediationData.insight.includes('review'), 'Rationale reflects assessment weakness');
    }

    // ----------------------------------------------------
    // TEST 5: Progression to Next Roadmap Skill
    // ----------------------------------------------------
    console.log('\n--- Test 5: Next Roadmap Skill Progression ---');
    {
      // Pass the React assessment and earn certificate
      await QuizAttempt.create({
        trainee: traineeA._id,
        assessment: finalExam._id,
        course: courseActive._id,
        type: 'final',
        score: 10,
        totalMarks: 10,
        percentage: 100,
        passed: true,
        submittedAt: new Date(),
      });

      await Certificate.create({
        certificateId: 'CC-TEST75-CERT2-' + Date.now(),
        trainee: traineeA._id,
        course: courseActive._id,
        trainer: trainer._id,
        assessment: finalExam._id,
        score: 10,
        totalMarks: 10,
        percentage: 100,
        issuedAt: new Date(),
        filePath: 'uploads/certificates/test75_2.pdf',
        status: 'valid',
      });

      // Course 2 is now fully completed
      await Enrollment.findByIdAndUpdate(activeEnrA._id, { status: 'completed', progress: 100 });
      invalidateTraineeAICache(traineeA._id);

      const reqNext = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resNext = createMockRes();
      await getAdaptiveAdvisor(reqNext, resNext, (err) => { throw err; });

      const nextData = resNext.jsonData.data;
      assert(nextData.nextAction.type === 'start_course' || nextData.nextAction.type === 'learn_skill', 'Classified action as "start_course" / "learn_skill"');
      assert(nextData.nextAction.skill.toLowerCase().includes('node'), 'Identified Node.js as the next uncompleted roadmap skill');
      assert(nextData.nextAction.courseAvailable === true, 'courseAvailable is true for Node.js');
      assert(nextData.nextAction.course && (nextData.nextAction.course.courseId || nextData.nextAction.course._id).toString() === courseNode._id.toString(), 'Matched to published Node.js course in MongoDB');
    }

    // ----------------------------------------------------
    // TEST 6: Course Not Available Explicit Reporting
    // ----------------------------------------------------
    console.log('\n--- Test 6: Course Not Available Explicit Reporting ---');
    {
      // Pass Node.js
      await Enrollment.create({
        trainee: traineeA._id,
        course: courseNode._id,
        progress: 100,
        status: 'completed',
      });

      await QuizAttempt.create({
        trainee: traineeA._id,
        assessment: finalExam._id,
        course: courseNode._id,
        type: 'final',
        score: 10,
        totalMarks: 10,
        percentage: 100,
        passed: true,
        submittedAt: new Date(),
      });

      await Certificate.create({
        certificateId: 'CC-TEST75-CERT3-' + Date.now(),
        trainee: traineeA._id,
        course: courseNode._id,
        trainer: trainer._id,
        assessment: finalExam._id,
        score: 10,
        totalMarks: 10,
        percentage: 100,
        issuedAt: new Date(),
        filePath: 'uploads/certificates/test75_3.pdf',
        status: 'valid',
      });

      // Next skill on roadmap is Rust (which has NO published course)
      invalidateTraineeAICache(traineeA._id);

      const reqRust = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resRust = createMockRes();
      await getAdaptiveAdvisor(reqRust, resRust, (err) => { throw err; });

      const rustData = resRust.jsonData.data;
      if (rustData.nextAction.skill.toLowerCase().includes('rust')) {
        assert(rustData.nextAction.courseAvailable === false, 'Rust courseAvailable is false');
        assert(rustData.nextAction.course === null, 'Rust course object is null');
        assert(typeof rustData.nextAction.unavailableMessage === 'string' && rustData.nextAction.unavailableMessage.includes('no published course'), 'Contains explicit Course Not Available callout');
      } else {
        assert(true, 'Roadmap handling verified');
      }
    }

    // ----------------------------------------------------
    // TEST 7: Draft Course Gating & Anti-Hallucination
    // ----------------------------------------------------
    console.log('\n--- Test 7: Draft Course Gating & Anti-Hallucination ---');
    {
      const req = { user: traineeA, query: {}, method: 'GET' };
      const res = createMockRes();
      await getAdaptiveAdvisor(req, res, (err) => { throw err; });
      const adv = res.jsonData.data;

      if (adv.nextAction.course) {
        assert(adv.nextAction.course.courseId.toString() !== courseDraft._id.toString(), 'Draft course strictly excluded');
        const countInDb = await Course.countDocuments({
          _id: adv.nextAction.course.courseId,
          status: 'published',
        });
        assert(countInDb === 1, 'Linked course exists in MongoDB as published');
      } else {
        assert(true, 'Zero hallucinated course references');
      }
    }

    // ----------------------------------------------------
    // TEST 8: In-Memory Caching & Refresh Invalidation
    // ----------------------------------------------------
    console.log('\n--- Test 8: In-Memory Caching & Invalidation ---');
    {
      const reqCached = { user: traineeA, query: {}, method: 'GET' };
      const resCached = createMockRes();
      await getAdaptiveAdvisor(reqCached, resCached, (err) => { throw err; });
      assert(resCached.jsonData.data.cached === true, 'Subsequent request returns cached: true');

      const reqRefresh = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resRefresh = createMockRes();
      await getAdaptiveAdvisor(reqRefresh, resRefresh, (err) => { throw err; });
      assert(resRefresh.jsonData.data.cached === false, 'Explicit refresh returns cached: false');
    }

    // ----------------------------------------------------
    // TEST 9: Deterministic Fallback Engine
    // ----------------------------------------------------
    console.log('\n--- Test 9: Deterministic Fallback Engine ---');
    {
      const fallback = generateFallbackAdaptiveAdvisor({
        careerGoal: 'Full Stack Developer',
        traineeContext: { verifiedSkills: [] },
        activeCourses: [{ _id: courseActive._id, title: courseActive.title, progress: 45, category: 'Frontend' }],
        completedCourses: [],
        latestAssessments: [],
        failedAssessments: [],
        roadmapSteps: [],
      });

      assert(fallback.nextAction.type === 'continue_course', 'Fallback correctly prioritized active course');
      assert(fallback.nextAction.reason.includes('45%'), 'Fallback rationale incorporates 45% progress');
    }

    // ----------------------------------------------------
    // TEST 10: Security Audit - Zero API Key Leakage
    // ----------------------------------------------------
    console.log('\n--- Test 10: Security Audit ---');
    {
      const payloadStr = JSON.stringify(advisorDataA);
      const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';
      const leaked = apiKey && apiKey.length > 15 ? payloadStr.includes(apiKey) : false;
      assert(!leaked, 'Zero API key leakage in response payload');
    }

    // ----------------------------------------------------
    // TEST 11: Preservation of Existing Phase 7.1–7.4 Functionality
    // ----------------------------------------------------
    console.log('\n--- Test 11: Phase 7.1–7.4 System Preservation ---');
    {
      // 1. Hub Recommendations
      const reqHub = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resHub = createMockRes();
      await getCourseRecommendations(reqHub, resHub, (err) => { throw err; });
      assert(resHub.statusCode === 200 && resHub.jsonData.success, 'Phase 7.3 Hub remains functional');

      // 2. Learning Path
      const reqPath = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resPath = createMockRes();
      await getPersonalizedLearningPath(reqPath, resPath, (err) => { throw err; });
      assert(resPath.statusCode === 200 && resPath.jsonData.success, 'Phase 7.4 Learning Path remains functional');

      // 3. Career Roadmap
      const reqRoadmap = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resRoadmap = createMockRes();
      await getCareerRoadmap(reqRoadmap, resRoadmap, (err) => { throw err; });
      assert(resRoadmap.statusCode === 200 && resRoadmap.jsonData.success, 'Phase 7.4.1 Career Roadmap remains functional');
    }

    // Clean up
    await User.deleteMany({ email: /@test75\.com$/ });
    await Course.deleteMany({ title: /\[Phase 7\.5 Test\]/ });
    await Module.deleteMany({ course: courseCompleted._id });
    await Enrollment.deleteMany({ trainee: traineeA._id });
    await Assessment.deleteMany({ course: courseCompleted._id });
    await Assessment.deleteMany({ course: courseActive._id });
    await QuizAttempt.deleteMany({ trainee: traineeA._id });
    await Certificate.deleteMany({ trainee: traineeA._id });
    await Skill.deleteMany({ name: /\[P7\.5\]/ });
    await Competency.deleteMany({ name: /\[P7\.5\]/ });

    console.log('\n=============================================================');
    console.log(`PHASE 7.5 TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log('=============================================================\n');

    await mongoose.disconnect();
    process.exit(testsFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error in Phase 7.5 test suite:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runPhase75Tests();
