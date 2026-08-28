/**
 * CAPACITY CONNECT (SIH26075) — PHASE 7.3 AUTOMATED TEST SUITE
 * AI Recommendation Hub & UI Standardization Test Suite
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
  getSkillGuidance,
  getCourseRationale,
  computeTraineeSkillsAndGaps,
} = require('../controllers/recommendationController');

const {
  generateCourseRecommendations,
  generateSkillGuidance,
  generateCourseRationale,
  generateFallbackRecommendations,
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

// Mock Express response helper
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

async function runPhase73Tests() {
  console.log('\n=============================================================');
  console.log('CAPACITY CONNECT — PHASE 7.3 AI RECOMMENDATION HUB TEST SUITE');
  console.log('=============================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Phase 7.3 testing.\n');

    // Clean up test data
    await User.deleteMany({ email: /@test73\.com$/ });
    await Course.deleteMany({ title: /\[Phase 7\.3 Test\]/ });
    await Skill.deleteMany({ name: /\[P7\.3\]/ });
    await Competency.deleteMany({ name: /\[P7\.3\]/ });
    await Certificate.deleteMany({ certificateId: /CC-TEST73/ });

    // 1. Setup Test Users
    const trainer = await User.create({
      name: 'Trainer Phase 7.3',
      email: 'trainer@test73.com',
      password: 'password123',
      role: 'trainer',
      department: 'Engineering',
    });

    const traineeA = await User.create({
      name: 'Trainee Alice 7.3',
      email: 'traineeA@test73.com',
      password: 'password123',
      role: 'trainee',
      department: 'Cloud Platform',
    });

    const traineeB = await User.create({
      name: 'Trainee Bob 7.3',
      email: 'traineeB@test73.com',
      password: 'password123',
      role: 'trainee',
      department: 'Data Engineering',
    });

    // 2. Setup Skills
    const skillJS = await Skill.create({
      name: '[P7.3] JavaScript',
      category: 'Technical',
      isActive: true,
    });

    const skillReact = await Skill.create({
      name: '[P7.3] React Architecture',
      category: 'Technical',
      isActive: true,
    });

    const skillNode = await Skill.create({
      name: '[P7.3] Node.js Microservices',
      category: 'Technical',
      isActive: true,
    });

    const skillDocker = await Skill.create({
      name: '[P7.3] Docker Containers',
      category: 'Technical',
      customCategory: 'DevOps',
      isActive: true,
    });

    // 3. Setup Competency: Full Stack Cloud Developer (requires JS, Node, Docker)
    const fullStackComp = await Competency.create({
      name: '[P7.3] Full Stack Cloud Developer',
      description: 'Requires JS, Node, and Docker',
      skills: [skillJS._id, skillNode._id, skillDocker._id],
      isActive: true,
    });

    // 4. Setup Courses
    // Course 1: Completed by Trainee A
    const courseCompleted = await Course.create({
      title: '[Phase 7.3 Test] Modern JavaScript Fundamentals',
      description: 'Foundations of ES6+ and modern web scripting.',
      category: 'Web Development',
      level: 'beginner',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillJS._id, proficiency: 'proficient' }],
      averageRating: 4.9,
    });

    // Course 2: Candidate Course 1 (Node.js - satisfies competency gap)
    const courseNode = await Course.create({
      title: '[Phase 7.3 Test] Production Node.js & Microservices',
      description: 'Enterprise backend development with Node.js and Express.',
      category: 'Backend Development',
      level: 'intermediate',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillNode._id, proficiency: 'proficient' }],
      averageRating: 4.8,
    });

    // Course 3: Candidate Course 2 (Docker - satisfies competency gap)
    const courseDocker = await Course.create({
      title: '[Phase 7.3 Test] Docker & Containerization Ops',
      description: 'Deploy containerized web services.',
      category: 'DevOps',
      level: 'intermediate',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillDocker._id, proficiency: 'proficient' }],
      averageRating: 4.7,
    });

    // 5. Setup Trainee A's Learning History
    const module1 = await Module.create({
      course: courseCompleted._id,
      title: 'Module 1: JS Basics',
      order: 1,
    });

    const finalExamCourse1 = await Assessment.create({
      course: courseCompleted._id,
      type: 'final',
      title: 'JavaScript Final Exam',
      passingPercentage: 60,
      status: 'published',
      questions: [
        {
          questionText: 'Is let block-scoped?',
          optionA: 'Yes',
          optionB: 'No',
          optionC: 'Maybe',
          optionD: 'None',
          correctOption: 'A',
          marks: 10,
        },
      ],
    });

    // Completed Enrollment
    await Enrollment.create({
      trainee: traineeA._id,
      course: courseCompleted._id,
      progress: 100,
      status: 'completed',
      completedModules: [module1._id],
    });

    // Passed QuizAttempt
    await QuizAttempt.create({
      trainee: traineeA._id,
      assessment: finalExamCourse1._id,
      course: courseCompleted._id,
      type: 'final',
      score: 10,
      totalMarks: 10,
      percentage: 100,
      passed: true,
      submittedAt: new Date(),
    });

    // Valid Certificate
    await Certificate.create({
      certificateId: 'CC-TEST73-' + Date.now(),
      trainee: traineeA._id,
      course: courseCompleted._id,
      trainer: trainer._id,
      assessment: finalExamCourse1._id,
      score: 10,
      totalMarks: 10,
      percentage: 100,
      issuedAt: new Date(),
      filePath: 'uploads/certificates/test.pdf',
      status: 'valid',
    });

    // Active Enrollment in Course 2 (In Progress)
    await Enrollment.create({
      trainee: traineeA._id,
      course: courseNode._id,
      progress: 50,
      status: 'active',
      completedModules: [],
    });

    // ----------------------------------------------------
    // TEST 1: Centralized Recommendation Hub Endpoint Structure
    // ----------------------------------------------------
    console.log('--- Test 1: AI Recommendation Hub Endpoint Structure ---');
    let hubResponse = null;
    {
      const req = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const res = createMockRes();
      await getCourseRecommendations(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Recommendation Hub returned HTTP 200 OK');
      hubResponse = res.jsonData.data;

      assert(Array.isArray(hubResponse.recommendations), 'Returns recommendations array');
      assert(Array.isArray(hubResponse.skillsToDevelop), 'Returns skillsToDevelop array');
      assert(Array.isArray(hubResponse.assessmentInsights), 'Returns assessmentInsights array');
      assert(Array.isArray(hubResponse.nextSteps), 'Returns nextSteps array');
      assert(hubResponse.traineeSummary !== null, 'Returns traineeSummary telemetry');
    }

    // ----------------------------------------------------
    // TEST 2: Recommended Courses Excludes Completed Courses
    // ----------------------------------------------------
    console.log('\n--- Test 2: Recommended Courses Candidate Filtering ---');
    {
      const recIds = hubResponse.recommendations.map((r) => r.courseId.toString());
      assert(!recIds.includes(courseCompleted._id.toString()), 'Completed JavaScript course is strictly excluded');
      assert(hubResponse.recommendations.length > 0, 'Returns valid recommendations for eligible candidates');
    }

    // ----------------------------------------------------
    // TEST 3: Skills to Develop Identifies Competency Gaps
    // ----------------------------------------------------
    console.log('\n--- Test 3: Skills to Develop Gap Identification ---');
    {
      const skills = hubResponse.skillsToDevelop.map((s) => s.skill.toLowerCase());
      assert(
        skills.some((s) => s.includes('docker') || s.includes('node')),
        'Identifies missing competency skills (Docker / Node.js) in Skills to Develop'
      );
      const dockerSkill = hubResponse.skillsToDevelop.find((s) => s.skill.toLowerCase().includes('docker'));
      if (dockerSkill) {
        assert(dockerSkill.targetProficiency === 'Proficient', 'Docker target proficiency set to Proficient');
        assert(typeof dockerSkill.reason === 'string', 'Contains rationale referencing competency milestone');
      }
    }

    // ----------------------------------------------------
    // TEST 4: Assessment Insights Synthesis
    // ----------------------------------------------------
    console.log('\n--- Test 4: Assessment Insights Synthesis ---');
    {
      assert(hubResponse.assessmentInsights.length > 0, 'Assessment insights generated');
      const insight = hubResponse.assessmentInsights[0];
      assert(typeof insight.title === 'string' && typeof insight.description === 'string', 'Insight contains title and description');
      assert(['positive', 'warning', 'needs_attention', 'neutral'].includes(insight.status), 'Insight contains valid status flag');
    }

    // ----------------------------------------------------
    // TEST 5: Suggested Next Steps Sequencing
    // ----------------------------------------------------
    console.log('\n--- Test 5: Suggested Next Steps Plan Sequencing ---');
    {
      assert(hubResponse.nextSteps.length >= 2, `Contains ${hubResponse.nextSteps.length} sequential learning steps`);
      assert(hubResponse.nextSteps[0].step === 1, 'First step has step sequence number 1');
      assert(typeof hubResponse.nextSteps[0].title === 'string', 'Next step contains action title');
      assert(typeof hubResponse.nextSteps[0].description === 'string', 'Next step contains actionable description');
    }

    // ----------------------------------------------------
    // TEST 6: Contextual Skill Improvement Guidance Endpoint
    // ----------------------------------------------------
    console.log('\n--- Test 6: Skill Improvement Guidance Endpoint ---');
    {
      const req = { user: traineeA, params: { skillName: '[P7.3] JavaScript' } };
      const res = createMockRes();
      await getSkillGuidance(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Skill guidance returned HTTP 200 OK');
      const guidance = res.jsonData.data;
      assert(guidance.skillName === '[P7.3] JavaScript', 'Guidance targets requested skill');
      assert(typeof guidance.roadmapTitle === 'string', 'Contains roadmap title');
      assert(Array.isArray(guidance.recommendedActions) && guidance.recommendedActions.length > 0, 'Contains actionable steps');
      assert(Array.isArray(guidance.recommendedCourses), 'Contains mapped courses list');
    }

    // ----------------------------------------------------
    // TEST 7: Contextual Course Recommendation Rationale Endpoint
    // ----------------------------------------------------
    console.log('\n--- Test 7: Course Recommendation Rationale Endpoint ---');
    {
      const req = { user: traineeA, params: { courseId: courseDocker._id.toString() } };
      const res = createMockRes();
      await getCourseRationale(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Course rationale returned HTTP 200 OK');
      const rationale = res.jsonData.data;
      assert(rationale.courseId === courseDocker._id.toString(), 'Rationale references target courseId');
      assert(typeof rationale.fitHeadline === 'string', 'Contains fit headline');
      assert(typeof rationale.whyRecommended === 'string', 'Contains why recommended explanation');
    }

    // ----------------------------------------------------
    // TEST 8: Nonexistent Course Rationale Returns 404
    // ----------------------------------------------------
    console.log('\n--- Test 8: Nonexistent Course Rationale Guard ---');
    {
      const fakeId = new mongoose.Types.ObjectId();
      const req = { user: traineeA, params: { courseId: fakeId.toString() } };
      const res = createMockRes();
      await getCourseRationale(req, res, (err) => { throw err; });
      assert(res.statusCode === 404, 'Nonexistent course returns HTTP 404 Not Found');
    }

    // ----------------------------------------------------
    // TEST 9: In-Memory Caching & Cache Invalidation
    // ----------------------------------------------------
    console.log('\n--- Test 9: Hub In-Memory Caching & Refresh ---');
    {
      // 1. Cached call
      const reqCache = { user: traineeA, query: {}, method: 'GET' };
      const resCache = createMockRes();
      await getCourseRecommendations(reqCache, resCache, (err) => { throw err; });
      assert(resCache.statusCode === 200 && resCache.jsonData.data.cached === true, 'Subsequent call returns cached: true');

      // 2. Explicit Refresh
      const reqRefresh = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resRefresh = createMockRes();
      await getCourseRecommendations(reqRefresh, resRefresh, (err) => { throw err; });
      assert(resRefresh.statusCode === 200 && resRefresh.jsonData.data.cached === false, 'Refresh returns fresh cached: false');
    }

    // ----------------------------------------------------
    // TEST 10: Multi-Trainee Profile Isolation
    // ----------------------------------------------------
    console.log('\n--- Test 10: Multi-Trainee Profile Isolation ---');
    {
      const reqB = { user: traineeB, query: { refresh: 'true' }, method: 'GET' };
      const resB = createMockRes();
      await getCourseRecommendations(reqB, resB, (err) => { throw err; });
      assert(resB.statusCode === 200, 'Trainee B retrieves own recommendations');
      assert(resB.jsonData.data.traineeSummary.completedCoursesCount === 0, 'Trainee B has 0 completed courses');
    }

    // ----------------------------------------------------
    // TEST 11: Abuse Rate Limiting Enforcement
    // ----------------------------------------------------
    console.log('\n--- Test 11: Rate Limiting Abuse Protection ---');
    {
      const spamId = new mongoose.Types.ObjectId().toString();
      for (let i = 0; i < 15; i++) {
        checkRateLimit(spamId);
      }
      const check16 = checkRateLimit(spamId);
      assert(!check16.allowed, 'Rate limiter blocks >15 requests/minute');
    }

    // Clean up test data
    await User.deleteMany({ email: /@test73\.com$/ });
    await Course.deleteMany({ title: /\[Phase 7\.3 Test\]/ });
    await Module.deleteMany({ course: courseCompleted._id });
    await Enrollment.deleteMany({ trainee: { $in: [traineeA._id, traineeB._id] } });
    await Assessment.deleteMany({ course: courseCompleted._id });
    await QuizAttempt.deleteMany({ trainee: { $in: [traineeA._id, traineeB._id] } });
    await Certificate.deleteMany({ trainee: { $in: [traineeA._id, traineeB._id] } });
    await Skill.deleteMany({ name: /\[P7\.3\]/ });
    await Competency.deleteMany({ name: /\[P7\.3\]/ });

    console.log('\n=============================================================');
    console.log(`PHASE 7.3 TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log('=============================================================\n');

    await mongoose.disconnect();
    process.exit(testsFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error during Phase 7.3 test execution:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runPhase73Tests();
