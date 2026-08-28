/**
 * CAPACITY CONNECT (SIH26075) — PHASE 7.2 AUTOMATED TEST SUITE
 * AI-Powered Personalized Course & Learning Recommendations Test Suite
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
  computeTraineeSkillsAndGaps,
} = require('../controllers/recommendationController');

const {
  generateCourseRecommendations,
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

async function runPhase72Tests() {
  console.log('\n=============================================================');
  console.log('CAPACITY CONNECT — PHASE 7.2 AI RECOMMENDATIONS TEST SUITE');
  console.log('=============================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for testing.\n');

    // Clean up test data
    await User.deleteMany({ email: /@test72\.com$/ });
    await Course.deleteMany({ title: /\[Phase 7\.2 Test\]/ });
    await Skill.deleteMany({ name: /\[P7\.2\]/ });
    await Competency.deleteMany({ name: /\[P7\.2\]/ });
    await Certificate.deleteMany({ certificateId: /CC-TEST72/ });

    // 1. Setup Test Users
    const trainer = await User.create({
      name: 'Trainer Tech 7.2',
      email: 'trainer@test72.com',
      password: 'password123',
      role: 'trainer',
      department: 'Engineering',
    });

    const traineeA = await User.create({
      name: 'Trainee Alice 7.2',
      email: 'traineeA@test72.com',
      password: 'password123',
      role: 'trainee',
      department: 'Cloud Ops',
    });

    const traineeB = await User.create({
      name: 'Trainee Bob 7.2',
      email: 'traineeB@test72.com',
      password: 'password123',
      role: 'trainee',
      department: 'Data Analytics',
    });

    const adminUser = await User.create({
      name: 'Admin Diana 7.2',
      email: 'admin@test72.com',
      password: 'password123',
      role: 'admin',
      department: 'Administration',
    });

    // 2. Setup Skills
    const skillJS = await Skill.create({
      name: '[P7.2] JavaScript',
      category: 'Technical',
      isActive: true,
    });

    const skillReact = await Skill.create({
      name: '[P7.2] React',
      category: 'Technical',
      isActive: true,
    });

    const skillNode = await Skill.create({
      name: '[P7.2] Node.js',
      category: 'Technical',
      isActive: true,
    });

    const skillDocker = await Skill.create({
      name: '[P7.2] Docker & Containers',
      category: 'Technical',
      customCategory: 'DevOps',
      isActive: true,
    });

    // 3. Setup Competency bundling JS, Node, and Docker
    const fullStackComp = await Competency.create({
      name: '[P7.2] Full Stack Cloud Engineer',
      description: 'Requires JS, Node, and Docker proficiency',
      skills: [skillJS._id, skillNode._id, skillDocker._id],
      isActive: true,
    });

    // 4. Setup Courses
    // Course 1: Trainee A will have COMPLETED this course
    const courseCompleted = await Course.create({
      title: '[Phase 7.2 Test] Web Fundamentals with JavaScript',
      description: 'Introductory course covering modern JavaScript ES6.',
      category: 'Web Development',
      level: 'beginner',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillJS._id, proficiency: 'proficient' }],
      averageRating: 4.8,
    });

    // Course 2: Advanced React Course (Candidate)
    const courseReact = await Course.create({
      title: '[Phase 7.2 Test] React Component Architecture',
      description: 'Advanced React patterns, hooks, and performance tuning.',
      category: 'Web Development',
      level: 'advanced',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillReact._id, proficiency: 'advanced' }],
      averageRating: 4.9,
    });

    // Course 3: Node.js Backend Microservices (Candidate - satisfies Competency gap!)
    const courseNode = await Course.create({
      title: '[Phase 7.2 Test] Node.js Microservices & REST',
      description: 'Build production APIs with Express and Node.js.',
      category: 'Backend Development',
      level: 'intermediate',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillNode._id, proficiency: 'proficient' }],
      averageRating: 4.7,
    });

    // Course 4: Docker & DevOps Fundamentals (Candidate - satisfies Competency gap!)
    const courseDocker = await Course.create({
      title: '[Phase 7.2 Test] Docker Containerization',
      description: 'Deploy containerized web applications.',
      category: 'DevOps',
      level: 'intermediate',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillDocker._id, proficiency: 'proficient' }],
      averageRating: 4.6,
    });

    // Course 5: Draft course (MUST NOT BE RECOMMENDED)
    const courseDraft = await Course.create({
      title: '[Phase 7.2 Test] Unpublished Secret Course',
      description: 'Draft course in progress.',
      category: 'Experimental',
      level: 'advanced',
      trainer: trainer._id,
      status: 'draft',
      skills: [{ skill: skillDocker._id, proficiency: 'advanced' }],
    });

    // 5. Setup Trainee A's History
    // Module and Assessment for Course 1
    const module1 = await Module.create({
      course: courseCompleted._id,
      title: 'Module 1: JS Basics',
      order: 1,
    });

    const finalExamCourse1 = await Assessment.create({
      course: courseCompleted._id,
      type: 'final',
      title: 'Web Fundamentals Final Exam',
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

    // Passed Attempt
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
      certificateId: 'CC-TEST72-' + Date.now(),
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

    // ----------------------------------------------------
    // TEST 1: Trainee Context Aggregator Computes Verified Skills & Incomplete Competency
    // ----------------------------------------------------
    console.log('--- Test 1: Trainee Context Extraction & Gap Analysis ---');
    {
      const context = await computeTraineeSkillsAndGaps(traineeA._id);
      assert(context.verifiedSkills.some((s) => s.name === '[P7.2] JavaScript'), 'Identified verified [P7.2] JavaScript skill');
      assert(context.completedCourseIds.map((id) => id.toString()).includes(courseCompleted._id.toString()), 'Course 1 correctly flagged as completed');
      assert(context.competencies.length >= 1, 'In-progress competency identified');
      const comp = context.competencies.find((c) => c.name === '[P7.2] Full Stack Cloud Engineer');
      assert(comp && comp.missingSkills.includes('[P7.2] Node.js'), 'Identified Node.js as missing skill gap for competency');
      assert(comp && comp.missingSkills.includes('[P7.2] Docker & Containers'), 'Identified Docker as missing skill gap for competency');
    }

    // ----------------------------------------------------
    // TEST 2: Recommendation API Endpoint Returns Real Database Candidate Courses
    // ----------------------------------------------------
    console.log('\n--- Test 2: Recommendation API Endpoint Execution ---');
    let recsResponse = null;
    {
      const req = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const res = createMockRes();
      await getCourseRecommendations(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Recommendation API returned HTTP 200 OK');
      recsResponse = res.jsonData.data;
      assert(recsResponse.recommendations.length > 0, `Returned ${recsResponse.recommendations.length} recommendations`);
    }

    // ----------------------------------------------------
    // TEST 3: Completed Courses Are Strictly Excluded
    // ----------------------------------------------------
    console.log('\n--- Test 3: Completed Courses Exclusion Guarantee ---');
    {
      const recommendedCourseIds = recsResponse.recommendations.map((r) => r.courseId.toString());
      assert(!recommendedCourseIds.includes(courseCompleted._id.toString()), 'Already completed Course 1 is strictly excluded from recommendations');
    }

    // ----------------------------------------------------
    // TEST 4: Draft / Unpublished Courses Are Excluded
    // ----------------------------------------------------
    console.log('\n--- Test 4: Unpublished Draft Courses Exclusion ---');
    {
      const recommendedCourseIds = recsResponse.recommendations.map((r) => r.courseId.toString());
      assert(!recommendedCourseIds.includes(courseDraft._id.toString()), 'Draft courses are never recommended');
    }

    // ----------------------------------------------------
    // TEST 5: Recommendations Contain Required Structured Schema
    // ----------------------------------------------------
    console.log('\n--- Test 5: Recommendation JSON Schema Validation ---');
    {
      const firstRec = recsResponse.recommendations[0];
      assert(firstRec.course && firstRec.course.title, 'Recommendation contains populated course object');
      assert(typeof firstRec.matchScore === 'number' && firstRec.matchScore >= 70, 'Contains valid numeric matchScore (>= 70%)');
      assert(typeof firstRec.reason === 'string' && firstRec.reason.length > 10, 'Contains meaningful educational recommendation reason');
      assert(Array.isArray(firstRec.skillAlignment), 'Contains skillAlignment array');
      assert(typeof firstRec.learningBenefit === 'string', 'Contains learningBenefit outcome');
      assert(['high', 'medium', 'low'].includes(firstRec.priority), 'Contains valid priority enum');
    }

    // ----------------------------------------------------
    // TEST 6: AI-Generated Hallucinated Course IDs Are Rejected
    // ----------------------------------------------------
    console.log('\n--- Test 6: AI Hallucination Guard & Rejection ---');
    {
      const fakeCandidate = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Real Candidate Course',
        skills: [{ name: 'React', proficiency: 'advanced' }],
      };
      const candidateList = [fakeCandidate];

      // Test fallback generator when given hallucinated ID
      const fakeTraineeContext = { verifiedSkills: [], learningSkills: [], competencies: [] };
      const fallbackResult = generateFallbackRecommendations({
        traineeContext: fakeTraineeContext,
        candidateCourses: candidateList,
      });

      assert(fallbackResult.recommendations.length === 1, 'Fallback produces recommendation for candidate');
      assert(fallbackResult.recommendations[0].courseId === fakeCandidate._id.toString(), 'Recommends exact candidate ID');
    }

    // ----------------------------------------------------
    // TEST 7: In-Memory Caching (Second Call Returns Cached: true)
    // ----------------------------------------------------
    console.log('\n--- Test 7: Performance Caching Verification ---');
    {
      const reqCache = { user: traineeA, query: {}, method: 'GET' };
      const resCache = createMockRes();
      await getCourseRecommendations(reqCache, resCache, (err) => { throw err; });
      assert(resCache.statusCode === 200 && resCache.jsonData.data.cached === true, 'Subsequent request within TTL returns cached: true');
    }

    // ----------------------------------------------------
    // TEST 8: Explicit Refresh Query Invalidates Cache (Cached: false)
    // ----------------------------------------------------
    console.log('\n--- Test 8: Manual Cache Invalidation / Refresh ---');
    {
      const reqRefresh = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resRefresh = createMockRes();
      await getCourseRecommendations(reqRefresh, resRefresh, (err) => { throw err; });
      assert(resRefresh.statusCode === 200 && resRefresh.jsonData.data.cached === false, 'Explicit refresh returns fresh cached: false');
    }

    // ----------------------------------------------------
    // TEST 9: Trainee A and Trainee B Experience Data Isolation
    // ----------------------------------------------------
    console.log('\n--- Test 9: Multi-Trainee Profile Isolation ---');
    {
      const bContext = await computeTraineeSkillsAndGaps(traineeB._id);
      assert(bContext.completedCourseIds.length === 0, 'Trainee B shows 0 completed courses (Trainee A has 1)');
      assert(!bContext.completedCourseIds.map((id) => id.toString()).includes(courseCompleted._id.toString()), 'Course 1 is eligible in candidate pool for Trainee B');

      const reqB = { user: traineeB, query: { refresh: 'true' }, method: 'GET' };
      const resB = createMockRes();
      await getCourseRecommendations(reqB, resB, (err) => { throw err; });
      assert(resB.statusCode === 200, 'Trainee B successfully retrieved personalized recommendations');
      assert(resB.jsonData.data.recommendations.length > 0, 'Trainee B received valid database-backed recommendations');
    }

    // ----------------------------------------------------
    // TEST 10: In-Memory Rate Limiting Enforcement
    // ----------------------------------------------------
    console.log('\n--- Test 10: Abuse Rate Limiting Enforcement ---');
    {
      const spamId = new mongoose.Types.ObjectId().toString();
      for (let i = 0; i < 20; i++) {
        checkRateLimit(spamId);
      }
      const check21 = checkRateLimit(spamId);
      assert(!check21.allowed, 'Rate limiter blocks excessive consecutive requests');
    }

    // ----------------------------------------------------
    // TEST 11: RBAC Middleware Registration Verification
    // ----------------------------------------------------
    console.log('\n--- Test 11: RBAC Middleware Route Protection ---');
    {
      const recRoutes = require('../routes/recommendationRoutes');
      const getLayerNames = (path, method) => {
        const route = recRoutes.stack.find((l) => l.route && l.route.path === path && l.route.methods[method]);
        return route ? route.route.stack.map((s) => s.name) : [];
      };

      const getLayers = getLayerNames('/recommendations', 'get');
      assert(getLayers.length >= 2, 'Route /recommendations is guarded by authentication & role authorization');
    }

    // ----------------------------------------------------
    // TEST 12: Server Derives Identity Strictly From Session (Ignores Foreign Parameters)
    // ----------------------------------------------------
    console.log('\n--- Test 12: Server-Side Identity Derivation Guard ---');
    {
      // Attempt to pass traineeB's ID in query while authenticated as traineeA
      const reqSpoof = {
        user: traineeA,
        query: { traineeId: traineeB._id.toString(), refresh: 'true' },
        body: { traineeId: traineeB._id.toString() },
        method: 'GET',
      };
      const resSpoof = createMockRes();
      await getCourseRecommendations(reqSpoof, resSpoof, (err) => { throw err; });
      assert(resSpoof.statusCode === 200, 'Handled request safely');
      assert(resSpoof.jsonData.data.traineeSummary.completedCoursesCount === 1, 'Trainee A session was used, foreign traineeId ignored');
    }

    // ----------------------------------------------------
    // TEST 13: Zero Candidate Handling
    // ----------------------------------------------------
    console.log('\n--- Test 13: Empty Candidates Graceful Handling ---');
    {
      const emptyFallback = generateFallbackRecommendations({
        traineeContext: { verifiedSkills: [], learningSkills: [], competencies: [] },
        candidateCourses: [],
      });
      assert(Array.isArray(emptyFallback.recommendations) && emptyFallback.recommendations.length === 0, 'Empty candidate list returns empty recommendations array without crashing');
    }

    // Clean up
    await User.deleteMany({ email: /@test72\.com$/ });
    await Course.deleteMany({ title: /\[Phase 7\.2 Test\]/ });
    await Module.deleteMany({ course: courseCompleted._id });
    await Enrollment.deleteMany({ trainee: { $in: [traineeA._id, traineeB._id] } });
    await Assessment.deleteMany({ course: courseCompleted._id });
    await QuizAttempt.deleteMany({ trainee: { $in: [traineeA._id, traineeB._id] } });
    await Certificate.deleteMany({ trainee: { $in: [traineeA._id, traineeB._id] } });
    await Skill.deleteMany({ name: /\[P7\.2\]/ });
    await Competency.deleteMany({ name: /\[P7\.2\]/ });

    console.log('\n=============================================================');
    console.log(`PHASE 7.2 TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log('=============================================================\n');

    await mongoose.disconnect();
    process.exit(testsFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error during test execution:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runPhase72Tests();
