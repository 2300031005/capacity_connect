/**
 * CAPACITY CONNECT (SIH26075) — PHASE 7.4.1 REFINED AUTOMATED TEST SUITE
 * AI Career Goal → Personalized Learning Roadmap (Skill-First Architecture)
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
  getCareerGoal,
  setCareerGoal,
  getCareerRoadmap,
  getPersonalizedLearningPath,
  computeTraineeSkillsAndGaps,
} = require('../controllers/recommendationController');

const {
  generateCareerRoadmap,
  generateFallbackCareerRoadmap,
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

async function runPhase741Tests() {
  console.log('\n=============================================================');
  console.log('CAPACITY CONNECT — PHASE 7.4.1 SKILL-FIRST ROADMAP SUITE');
  console.log('=============================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Phase 7.4.1 testing.\n');

    // Clean up test records
    await User.deleteMany({ email: /@test741\.com$/ });
    await Course.deleteMany({ title: /\[Phase 7\.4\.1 Test\]/ });
    await Skill.deleteMany({ name: /\[P7\.4\.1\]/ });
    await Competency.deleteMany({ name: /\[P7\.4\.1\]/ });
    await Certificate.deleteMany({ certificateId: /CC-TEST741/ });

    // 1. Setup Test Users
    const trainer = await User.create({
      name: 'Trainer Phase 7.4.1',
      email: 'trainer@test741.com',
      password: 'password123',
      role: 'trainer',
      department: 'Computer Science',
    });

    const traineeA = await User.create({
      name: 'Trainee Alice 7.4.1',
      email: 'alice@test741.com',
      password: 'password123',
      role: 'trainee',
      department: 'Software Engineering',
      careerGoal: 'Full Stack Developer',
    });

    const traineeB = await User.create({
      name: 'Trainee Bob 7.4.1',
      email: 'bob@test741.com',
      password: 'password123',
      role: 'trainee',
      department: 'Data Science',
      careerGoal: 'Data Analyst',
    });

    // 2. Setup Skills
    const skillJS = await Skill.create({
      name: '[P7.4.1] JavaScript',
      category: 'Technical',
      isActive: true,
    });

    const skillReact = await Skill.create({
      name: '[P7.4.1] React',
      category: 'Technical',
      isActive: true,
    });

    const skillNode = await Skill.create({
      name: '[P7.4.1] Node.js',
      category: 'Technical',
      isActive: true,
    });

    const skillMongo = await Skill.create({
      name: '[P7.4.1] MongoDB Database',
      category: 'Technical',
      isActive: true,
    });

    const skillRust = await Skill.create({
      name: '[P7.4.1] Rust Systems Architecture',
      category: 'Technical',
      isActive: true,
    });

    const skillDraft = await Skill.create({
      name: '[P7.4.1] GraphQL Internal',
      category: 'Technical',
      isActive: true,
    });

    // 3. Setup Competency: Full Stack Web Development
    const compFullStack = await Competency.create({
      name: '[P7.4.1] Full Stack Web Development',
      description: 'Mastery of modern frontend and backend architectures.',
      skills: [skillJS._id, skillReact._id, skillNode._id, skillMongo._id, skillRust._id],
      isActive: true,
    });

    // 4. Setup Courses
    // Course 1: JavaScript (Completed by Trainee A)
    const courseCompleted = await Course.create({
      title: '[Phase 7.4.1 Test] Core JavaScript Fundamentals',
      description: 'ES6+ syntax and async JS.',
      category: 'Web Development',
      level: 'beginner',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillJS._id, proficiency: 'proficient' }],
      averageRating: 4.9,
    });

    // Course 2: React (Active enrollment by Trainee A: 70% progress)
    const courseActive = await Course.create({
      title: '[Phase 7.4.1 Test] Modern React & State Management',
      description: 'React hooks and Redux toolkit.',
      category: 'Frontend Development',
      level: 'intermediate',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillReact._id, proficiency: 'proficient' }],
      averageRating: 4.8,
    });

    // Course 3: Node.js (Published Candidate)
    const courseNode = await Course.create({
      title: '[Phase 7.4.1 Test] Node.js & Express REST APIs',
      description: 'Backend services and middleware.',
      category: 'Backend Development',
      level: 'intermediate',
      trainer: trainer._id,
      status: 'published',
      skills: [{ skill: skillNode._id, proficiency: 'proficient' }],
      averageRating: 4.75,
    });

    // Note: Skill 4 (MongoDB) has NO published course on the platform!
    // This allows testing the "Course Not Available" scenario.

    // Course 5: Draft Course (Must never appear)
    const courseDraft = await Course.create({
      title: '[Phase 7.4.1 Test] Unpublished Draft Architecture',
      description: 'Secret internal guide.',
      category: 'Internal',
      level: 'advanced',
      trainer: trainer._id,
      status: 'draft',
      skills: [{ skill: skillDraft._id, proficiency: 'advanced' }],
    });

    // 5. Setup Trainee A's verified history
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
          questionText: 'Is const reassignment allowed?',
          optionA: 'No',
          optionB: 'Yes',
          optionC: 'Sometimes',
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
      submittedAt: new Date(),
    });

    await Certificate.create({
      certificateId: 'CC-TEST741-' + Date.now(),
      trainee: traineeA._id,
      course: courseCompleted._id,
      trainer: trainer._id,
      assessment: finalExam._id,
      score: 10,
      totalMarks: 10,
      percentage: 100,
      issuedAt: new Date(),
      filePath: 'uploads/certificates/test741.pdf',
      status: 'valid',
    });

    // Active Enrollment in Course 2 (70%)
    await Enrollment.create({
      trainee: traineeA._id,
      course: courseActive._id,
      progress: 70,
      status: 'active',
      completedModules: [],
    });

    // ----------------------------------------------------
    // TEST 1: Career Goal Creation & Persistence
    // ----------------------------------------------------
    console.log('--- Test 1: Career Goal Creation & Persistence ---');
    {
      const req = { user: traineeA, body: { careerGoal: 'Full Stack Developer' } };
      const res = createMockRes();
      await setCareerGoal(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'setCareerGoal returned HTTP 200 OK');
      assert(res.jsonData.data.careerGoal === 'Full Stack Developer', 'Saved career goal in response');

      const userInDb = await User.findById(traineeA._id);
      assert(userInDb.careerGoal === 'Full Stack Developer', 'Persisted career goal to MongoDB User record');
    }

    // ----------------------------------------------------
    // TEST 2: Career Goal Retrieval
    // ----------------------------------------------------
    console.log('\n--- Test 2: Career Goal Retrieval ---');
    {
      const req = { user: traineeA };
      const res = createMockRes();
      await getCareerGoal(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.data.careerGoal === 'Full Stack Developer', 'Retrieved saved career goal');
    }

    // ----------------------------------------------------
    // TEST 3: Multi-Trainee Profile Isolation
    // ----------------------------------------------------
    console.log('\n--- Test 3: Trainee Isolation ---');
    {
      const reqB = { user: traineeB };
      const resB = createMockRes();
      await getCareerGoal(reqB, resB, (err) => { throw err; });
      assert(resB.jsonData.data.careerGoal === 'Data Analyst', 'Trainee B retrieves own distinct career goal (Data Analyst)');
    }

    // ----------------------------------------------------
    // TEST 4: Skill-First Roadmap Generation & Structure
    // ----------------------------------------------------
    console.log('\n--- Test 4: Skill-First Roadmap Generation ---');
    let roadmapData = null;
    {
      const req = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const res = createMockRes();
      await getCareerRoadmap(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'getCareerRoadmap returned HTTP 200 OK');
      roadmapData = res.jsonData.data;

      assert(roadmapData.careerGoal === 'Full Stack Developer', 'Preserves target career goal');
      assert(Array.isArray(roadmapData.steps) && roadmapData.steps.length > 0, 'Contains ordered skills steps array');
      assert(typeof roadmapData.summary === 'string' && roadmapData.summary.length > 0, 'Contains roadmap summary');
      assert(typeof roadmapData.metrics === 'object' && roadmapData.metrics !== null, 'Contains database-derived metrics');
    }

    // ----------------------------------------------------
    // TEST 5: Verified Skill Recognized (Already Demonstrated)
    // ----------------------------------------------------
    console.log('\n--- Test 5: Verified Skill Recognition ---');
    {
      const jsStep = roadmapData.steps.find((s) => s.skill.toLowerCase().includes('javascript'));
      assert(Boolean(jsStep), 'JavaScript skill present in ordered roadmap');
      if (jsStep) {
        assert(jsStep.status === 'Already Demonstrated', 'Verified JavaScript marked as "Already Demonstrated"');
        assert(jsStep.isDemonstrated === true, 'isDemonstrated flag is true');
        assert(jsStep.currentProficiency.toLowerCase() === 'proficient', 'Current proficiency shows Proficient');
      }
    }

    // ----------------------------------------------------
    // TEST 6: In-Progress Course Prioritization (70% Progress)
    // ----------------------------------------------------
    console.log('\n--- Test 6: In-Progress Course Prioritization ---');
    {
      const reactStep = roadmapData.steps.find((s) => s.skill.toLowerCase().includes('react'));
      assert(Boolean(reactStep), 'React skill present in ordered roadmap');
      if (reactStep) {
        assert(reactStep.status === 'In Progress', 'Active React course marked as "In Progress"');
        assert(reactStep.isCurrent === true, 'isCurrent flag is true');
        assert(reactStep.course && reactStep.course.progress === 70, 'Course object reflects 70% enrollment progress');
      }
    }

    // ----------------------------------------------------
    // TEST 7: Database Course Matching via Course.skills
    // ----------------------------------------------------
    console.log('\n--- Test 7: Database Course Matching ---');
    {
      const nodeStep = roadmapData.steps.find((s) => s.skill.toLowerCase().includes('node'));
      assert(Boolean(nodeStep), 'Node.js skill present in ordered roadmap');
      if (nodeStep) {
        assert(nodeStep.courseAvailable === true, 'courseAvailable is true for Node.js');
        assert(nodeStep.course && nodeStep.course.title.includes('Node.js & Express REST APIs'), 'Matched to real MongoDB course title');
        assert(nodeStep.course.courseId.toString() === courseNode._id.toString(), 'Matched to exact MongoDB courseId');
      }
    }

    // ----------------------------------------------------
    // TEST 8: Course Not Available Explicit Reporting
    // ----------------------------------------------------
    console.log('\n--- Test 8: Course Not Available Explicit Reporting ---');
    {
      const rustStep = roadmapData.steps.find((s) => s.skill.toLowerCase().includes('rust'));
      assert(Boolean(rustStep), 'Rust skill present in ordered roadmap');
      if (rustStep) {
        assert(rustStep.courseAvailable === false, 'Rust courseAvailable is false');
        assert(rustStep.course === null, 'Rust course object is null');
        assert(typeof rustStep.unavailableMessage === 'string' && rustStep.unavailableMessage.includes('no published course'), 'Contains explicit unavailable message');
      }
    }

    // ----------------------------------------------------
    // TEST 9: Draft Courses Strictly Excluded
    // ----------------------------------------------------
    console.log('\n--- Test 9: Draft Course Gating ---');
    {
      const allLinkedCourses = [];
      roadmapData.steps.forEach((st) => {
        if (st.course) allLinkedCourses.push(st.course.id || st.course.courseId || st.course._id);
      });
      assert(!allLinkedCourses.includes(courseDraft._id.toString()), 'Draft course strictly excluded from roadmap');
    }

    // ----------------------------------------------------
    // TEST 10: Anti-Hallucination - All Course IDs Exist in MongoDB
    // ----------------------------------------------------
    console.log('\n--- Test 10: Anti-Hallucination Validation ---');
    {
      const allLinkedCourseIds = [];
      roadmapData.steps.forEach((st) => {
        if (st.course && st.course.courseId) allLinkedCourseIds.push(st.course.courseId.toString());
      });

      const uniqueCourseIds = Array.from(new Set(allLinkedCourseIds));
      if (uniqueCourseIds.length > 0) {
        const countInDb = await Course.countDocuments({
          _id: { $in: uniqueCourseIds },
          status: 'published',
        });
        assert(countInDb === uniqueCourseIds.length, `All ${uniqueCourseIds.length} course references exist in database`);
      } else {
        assert(true, 'Zero hallucinated course IDs');
      }
    }

    // ----------------------------------------------------
    // TEST 11: Real Database-Authoritative Metrics
    // ----------------------------------------------------
    console.log('\n--- Test 11: Real Progress Metrics ---');
    {
      const { totalSteps, demonstratedCount, inProgressCount, remainingStages, progressPercentage } = roadmapData.metrics;
      assert(totalSteps === roadmapData.steps.length, `totalSteps (${totalSteps}) equals steps array length`);
      assert(demonstratedCount >= 1, `demonstratedCount reflects verified skills (${demonstratedCount})`);
      assert(inProgressCount === 1, `inProgressCount reflects active enrollment (${inProgressCount})`);
      assert(typeof progressPercentage === 'number' && progressPercentage >= 0 && progressPercentage <= 100, `Progress percentage is ${progressPercentage}%`);
    }

    // ----------------------------------------------------
    // TEST 12: In-Memory Caching & Refresh Bypass
    // ----------------------------------------------------
    console.log('\n--- Test 12: Caching & Refresh Bypass ---');
    {
      const reqCache = { user: traineeA, query: {}, method: 'GET' };
      const resCache = createMockRes();
      await getCareerRoadmap(reqCache, resCache, (err) => { throw err; });
      assert(resCache.jsonData.data.cached === true, 'Subsequent request returns cached: true');

      const reqRefresh = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resRefresh = createMockRes();
      await getCareerRoadmap(reqRefresh, resRefresh, (err) => { throw err; });
      assert(resRefresh.jsonData.data.cached === false, 'Refresh request returns fresh cached: false');
    }

    // ----------------------------------------------------
    // TEST 13: Deterministic Fallback Resilience
    // ----------------------------------------------------
    console.log('\n--- Test 13: Deterministic Fallback Engine ---');
    {
      const fallback = generateFallbackCareerRoadmap({
        careerGoal: 'Full Stack Developer',
        traineeContext: {
          verifiedSkills: [{ name: 'JavaScript', highestProficiency: 'proficient' }],
        },
        availableSkills: [skillJS, skillNode, skillReact],
        availableCompetencies: [compFullStack],
        activeCourses: [{ _id: courseActive._id, title: courseActive.title, progress: 70 }],
        completedCourses: [courseCompleted._id],
      });

      assert(fallback.careerGoal === 'Full Stack Developer', 'Fallback preserves goal');
      assert(Array.isArray(fallback.steps) && fallback.steps.length > 0, 'Fallback produces ordered skill steps');
      assert(fallback.steps[0].skill && fallback.steps[0].reason, 'Skill steps contain skill name and reason');
    }

    // ----------------------------------------------------
    // TEST 14: Security Audit - Zero API Key Leakage
    // ----------------------------------------------------
    console.log('\n--- Test 14: Security Audit ---');
    {
      const payloadStr = JSON.stringify(roadmapData);
      const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';
      const leaked = apiKey && apiKey.length > 15 ? payloadStr.includes(apiKey) : false;
      assert(!leaked, 'Zero API key leakage in response payload');
    }

    // ----------------------------------------------------
    // TEST 15: Existing Phase 7.4 Learning Path Preserved
    // ----------------------------------------------------
    console.log('\n--- Test 15: Phase 7.4 Learning Path Preservation ---');
    {
      const reqPath = { user: traineeA, query: { refresh: 'true' }, method: 'GET' };
      const resPath = createMockRes();
      await getPersonalizedLearningPath(reqPath, resPath, (err) => { throw err; });
      assert(resPath.statusCode === 200 && resPath.jsonData.success, 'Phase 7.4 getPersonalizedLearningPath remains fully functional');
      assert(Array.isArray(resPath.jsonData.data.steps), 'Contains Phase 7.4 steps');
    }

    // Clean up
    await User.deleteMany({ email: /@test741\.com$/ });
    await Course.deleteMany({ title: /\[Phase 7\.4\.1 Test\]/ });
    await Module.deleteMany({ course: courseCompleted._id });
    await Enrollment.deleteMany({ trainee: traineeA._id });
    await Assessment.deleteMany({ course: courseCompleted._id });
    await QuizAttempt.deleteMany({ trainee: traineeA._id });
    await Certificate.deleteMany({ trainee: traineeA._id });
    await Skill.deleteMany({ name: /\[P7\.4\.1\]/ });
    await Competency.deleteMany({ name: /\[P7\.4\.1\]/ });

    console.log('\n=============================================================');
    console.log(`PHASE 7.4.1 TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log('=============================================================\n');

    await mongoose.disconnect();
    process.exit(testsFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error in Phase 7.4.1 test suite:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runPhase741Tests();
