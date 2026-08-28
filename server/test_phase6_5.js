const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Enrollment = require('./models/Enrollment');
const Assessment = require('./models/Assessment');
const QuizAttempt = require('./models/QuizAttempt');
const Certificate = require('./models/Certificate');
const Skill = require('./models/Skill');
const Competency = require('./models/Competency');

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/capacity_connect_test';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';

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
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getTrainers,
  getTrainerById,
} = require('./controllers/userManagementController');

const {
  getTrainerLearners,
  getTrainerLearnerDetails,
} = require('./controllers/trainerLearnerController');

const {
  getModuleQuiz,
  getFinalAssessment,
  saveModuleQuiz,
  saveFinalAssessment,
  submitAssessmentAttempt,
  getAssessmentAttemptReview,
  getCourseAssessmentResults,
} = require('./controllers/assessmentController');

const { getMySkills } = require('./controllers/traineeSkillController');

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
  console.log('CAPACITY CONNECT — PHASE 6.5 AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for testing.\n');

    // Clean up test collections
    await User.deleteMany({ email: /@test65\.com$/ });
    await Course.deleteMany({ title: /\[Phase 6\.5 Test\]/ });
    await Skill.deleteMany({ name: /\[P6\.5\]/ });
    await Competency.deleteMany({ title: /\[P6\.5\]/ });

    // 1. Create Test Users
    const adminUser = await User.create({
      name: 'Admin User 6.5',
      email: 'admin@test65.com',
      password: 'password123',
      role: 'admin',
      department: 'Administration',
    });

    const trainerA = await User.create({
      name: 'Trainer A 6.5',
      email: 'trainerA@test65.com',
      password: 'password123',
      role: 'trainer',
      department: 'Engineering',
    });

    const trainerB = await User.create({
      name: 'Trainer B 6.5',
      email: 'trainerB@test65.com',
      password: 'password123',
      role: 'trainer',
      department: 'Design',
    });

    const trainee1 = await User.create({
      name: 'Trainee One 6.5',
      email: 'trainee1@test65.com',
      password: 'password123',
      role: 'trainee',
      department: 'Software Dev',
    });

    const trainee2 = await User.create({
      name: 'Trainee Two 6.5',
      email: 'trainee2@test65.com',
      password: 'password123',
      role: 'trainee',
      department: 'QA & Testing',
    });

    // Create a Skill
    const skillA = await Skill.create({
      name: '[P6.5] Cloud Architecture',
      category: 'Technical',
      customCategory: 'Cloud & DevOps',
      createdBy: adminUser._id,
    });

    // Create Courses for Trainer A and Trainer B
    const courseA = await Course.create({
      title: '[Phase 6.5 Test] AWS Mastery',
      description: 'Comprehensive AWS cloud engineering course',
      category: 'Cloud & DevOps',
      level: 'intermediate',
      trainer: trainerA._id,
      status: 'published',
      skills: [{ skill: skillA._id, proficiency: 'proficient' }],
    });

    const moduleA = await Module.create({
      title: 'Module 1: VPC Architecture',
      course: courseA._id,
      order: 1,
    });

    const courseB = await Course.create({
      title: '[Phase 6.5 Test] UI/UX Systems',
      description: 'Design systems course',
      category: 'Design',
      level: 'beginner',
      trainer: trainerB._id,
      status: 'published',
    });

    // Enrollments
    // Trainee 1 enrolled in Course A (Trainer A)
    const enrollment1 = await Enrollment.create({
      trainee: trainee1._id,
      course: courseA._id,
      progress: 100,
      status: 'completed',
      completedModules: [moduleA._id],
    });

    // Trainee 2 enrolled in Course B (Trainer B) ONLY
    const enrollment2 = await Enrollment.create({
      trainee: trainee2._id,
      course: courseB._id,
      progress: 50,
      status: 'active',
    });

    // 2. Create Module Quiz on Module A with Explanations
    const quizDoc = await Assessment.create({
      course: courseA._id,
      module: moduleA._id,
      type: 'module',
      title: 'VPC Architecture Quiz',
      passingPercentage: 50,
      status: 'published',
      questions: [
        {
          questionText: 'What does VPC stand for in AWS?',
          optionA: 'Virtual Private Cloud',
          optionB: 'Virtual Personal Computer',
          optionC: 'Variable Power Control',
          optionD: 'Vector Processing Center',
          correctOption: 'A',
          marks: 1,
          explanation: 'VPC stands for Virtual Private Cloud, enabling isolated cloud networks.',
        },
      ],
    });

    // Create Final Assessment on Course A with Explanations
    const finalDoc = await Assessment.create({
      course: courseA._id,
      type: 'final',
      title: 'AWS Mastery Final Exam',
      passingPercentage: 60,
      status: 'published',
      questions: [
        {
          questionText: 'Which AWS service provides serverless compute?',
          optionA: 'Amazon EC2',
          optionB: 'AWS Lambda',
          optionC: 'Amazon S3',
          optionD: 'Amazon RDS',
          correctOption: 'B',
          marks: 2,
          explanation: 'AWS Lambda lets you run code without provisioning or managing servers.',
        },
      ],
    });

    // ----------------------------------------------------
    // TEST 1: Admin can retrieve users
    // ----------------------------------------------------
    console.log('\n--- Test 1: Admin User Retrieval ---');
    {
      const req = { user: adminUser, query: {} };
      const res = createMockRes();
      await getAllUsers(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Admin can retrieve platform user list');
      assert(res.jsonData.count >= 5, 'User list contains registered platform users');
    }

    // ----------------------------------------------------
    // TEST 2: Admin can retrieve user details with role-specific data
    // ----------------------------------------------------
    console.log('\n--- Test 2: Admin User Details Inspection ---');
    {
      const req = { user: adminUser, params: { id: trainee1._id.toString() } };
      const res = createMockRes();
      await getUserById(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Admin can inspect user details');
      assert(res.jsonData.data.roleData.totalEnrolled >= 1, 'Trainee roleData contains enrolled courses count');
    }

    // ----------------------------------------------------
    // TEST 3: Admin status toggle and self-deactivation protection
    // ----------------------------------------------------
    console.log('\n--- Test 3: Admin User Status Toggle & Self-Protection ---');
    {
      // Attempt self-deactivation
      const reqSelf = { user: adminUser, params: { id: adminUser._id.toString() } };
      const resSelf = createMockRes();
      await toggleUserStatus(reqSelf, resSelf, (err) => { throw err; });
      assert(resSelf.statusCode === 400, 'Admin cannot deactivate their own account');

      // Toggle trainee1 status
      const reqTrainee = { user: adminUser, params: { id: trainee1._id.toString() }, body: { isActive: false } };
      const resTrainee = createMockRes();
      await toggleUserStatus(reqTrainee, resTrainee, (err) => { throw err; });
      assert(resTrainee.statusCode === 200 && resTrainee.jsonData.data.isActive === false, 'Admin can deactivate user');

      // Re-activate
      reqTrainee.body = { isActive: true };
      const resTrainee2 = createMockRes();
      await toggleUserStatus(reqTrainee, resTrainee2, (err) => { throw err; });
      assert(resTrainee2.statusCode === 200 && resTrainee2.jsonData.data.isActive === true, 'Admin can re-activate user');
    }

    // ----------------------------------------------------
    // TEST 4: Admin can retrieve trainers list with metrics
    // ----------------------------------------------------
    console.log('\n--- Test 4: Admin Trainer Directory ---');
    {
      const req = { user: adminUser };
      const res = createMockRes();
      await getTrainers(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Admin can retrieve platform trainers');
      assert(res.jsonData.count >= 2, 'Trainer directory lists both Trainer A and Trainer B');
    }

    // ----------------------------------------------------
    // TEST 5: Admin can inspect single trainer portfolio
    // ----------------------------------------------------
    console.log('\n--- Test 5: Admin Single Trainer Audit ---');
    {
      const req = { user: adminUser, params: { id: trainerA._id.toString() } };
      const res = createMockRes();
      await getTrainerById(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Admin can inspect trainer portfolio');
      assert(res.jsonData.data.courses.length >= 1, 'Trainer courses portfolio retrieved');
    }

    // ----------------------------------------------------
    // TEST 6: Trainer can retrieve their consolidated learners
    // ----------------------------------------------------
    console.log('\n--- Test 6: Trainer Consolidated Learner View ---');
    {
      const req = { user: trainerA };
      const res = createMockRes();
      await getTrainerLearners(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Trainer A can retrieve enrolled learners');
      const learnerIds = res.jsonData.data.map(l => l.trainee._id.toString());
      assert(learnerIds.includes(trainee1._id.toString()), 'Trainer A sees Trainee 1 enrolled in Course A');
    }

    // ----------------------------------------------------
    // TEST 7: Multi-Tenant Learner Isolation: Trainer A cannot see Trainer B's learners
    // ----------------------------------------------------
    console.log('\n--- Test 7: Multi-Tenant Trainer Learner Isolation ---');
    {
      const req = { user: trainerA };
      const res = createMockRes();
      await getTrainerLearners(req, res, (err) => { throw err; });
      const learnerIds = res.jsonData.data.map(l => l.trainee._id.toString());
      assert(!learnerIds.includes(trainee2._id.toString()), 'Trainer A cannot see Trainee 2 (who is only in Trainer B course)');

      // Attempt to access Trainee 2 details directly as Trainer A
      const reqDetails = { user: trainerA, params: { id: trainee2._id.toString() } };
      const resDetails = createMockRes();
      await getTrainerLearnerDetails(reqDetails, resDetails, (err) => { throw err; });
      assert(resDetails.statusCode === 403, 'Trainer A is denied access to inspect learner belonging exclusively to Trainer B');
    }

    // ----------------------------------------------------
    // TEST 8: Anti-Cheat: correctOption & explanation hidden before submission
    // ----------------------------------------------------
    console.log('\n--- Test 8: Anti-Cheat Question Sanitization Before Submission ---');
    {
      const req = { user: trainee1, params: { moduleId: moduleA._id.toString() } };
      const res = createMockRes();
      await getModuleQuiz(req, res, (err) => { throw err; });
      assert(res.statusCode === 200, 'Trainee can fetch module quiz');
      const q = res.jsonData.data.quiz.questions[0];
      assert(q.correctOption === undefined, 'correctOption is stripped and hidden from trainee before submission');
      assert(q.explanation === undefined, 'explanation is stripped and hidden from trainee before submission');
    }

    // ----------------------------------------------------
    // TEST 9: Trainee submits module quiz attempt
    // ----------------------------------------------------
    console.log('\n--- Test 9: Submitting Module Quiz Attempt ---');
    let moduleAttemptId = null;
    {
      const req = {
        user: trainee1,
        params: { id: quizDoc._id.toString() },
        body: {
          answers: [
            { questionId: quizDoc.questions[0]._id.toString(), selectedOption: 'A' },
          ],
        },
      };
      const res = createMockRes();
      await submitAssessmentAttempt(req, res, (err) => { throw err; });
      assert((res.statusCode === 200 || res.statusCode === 201) && res.jsonData.success, 'Trainee successfully submitted module quiz');
      assert(res.jsonData.data.attempt.percentage === 100, 'Module quiz accurately scored 100%');
      assert(res.jsonData.data.attempt.passed === true, 'Module quiz marked as passed');
      moduleAttemptId = res.jsonData.data.attempt._id.toString();
    }

    // ----------------------------------------------------
    // TEST 10: Trainee can review submitted module quiz with explanations
    // ----------------------------------------------------
    console.log('\n--- Test 10: Trainee Module Quiz Review with Explanations ---');
    {
      const req = { user: trainee1, params: { attemptId: moduleAttemptId } };
      const res = createMockRes();
      await getAssessmentAttemptReview(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Trainee can review submitted module quiz attempt');
      const reviewQ = res.jsonData.data.questions[0];
      assert(reviewQ.selectedOption === 'A', 'Review shows trainee selected option');
      assert(reviewQ.correctOption === 'A', 'Review shows correct option');
      assert(reviewQ.isCorrect === true, 'Review indicates correct result');
      assert(reviewQ.explanation.includes('Virtual Private Cloud'), 'Review provides detailed question explanation');
    }

    // ----------------------------------------------------
    // TEST 11: Trainee submits final exam with skill & certificate awarding
    // ----------------------------------------------------
    console.log('\n--- Test 11: Submitting Final Assessment & Verification ---');
    let finalAttemptId = null;
    {
      const req = {
        user: trainee1,
        params: { id: finalDoc._id.toString() },
        body: {
          answers: [
            { questionId: finalDoc.questions[0]._id.toString(), selectedOption: 'B' },
          ],
        },
      };
      const res = createMockRes();
      await submitAssessmentAttempt(req, res, (err) => { throw err; });
      assert((res.statusCode === 200 || res.statusCode === 201) && res.jsonData.success, 'Final assessment successfully submitted');
      assert(res.jsonData.data.attempt.percentage === 100, 'Final assessment scored 100%');
      assert(res.jsonData.data.certificate !== null, 'Certificate generated upon passing final exam');
      finalAttemptId = res.jsonData.data.attempt._id.toString();

      // Verify skill was awarded
      const skillReq = { user: trainee1 };
      const skillRes = createMockRes();
      await getMySkills(skillReq, skillRes, (err) => { throw err; });
      const verified = skillRes.jsonData.verifiedSkills || skillRes.jsonData.data || [];
      assert(verified.some(s => s.name === '[P6.5] Cloud Architecture' && s.highestProficiency === 'proficient'),
        'Cloud Architecture skill successfully verified at proficient level');
    }

    // ----------------------------------------------------
    // TEST 12: Final Assessment Review with Explanations
    // ----------------------------------------------------
    console.log('\n--- Test 12: Final Assessment Detailed Review ---');
    {
      const req = { user: trainee1, params: { attemptId: finalAttemptId } };
      const res = createMockRes();
      await getAssessmentAttemptReview(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Trainee can review final assessment');
      const reviewQ = res.jsonData.data.questions[0];
      assert(reviewQ.correctOption === 'B', 'Correct answer available in review');
      assert(reviewQ.explanation.includes('AWS Lambda lets you run code'), 'Question explanation returned in review');
    }

    // ----------------------------------------------------
    // TEST 13: RBAC Security: Trainee cannot review another trainee's attempt
    // ----------------------------------------------------
    console.log('\n--- Test 13: Trainee Attempt Review RBAC Isolation ---');
    {
      const req = { user: trainee2, params: { attemptId: finalAttemptId } };
      const res = createMockRes();
      await getAssessmentAttemptReview(req, res, (err) => { throw err; });
      assert(res.statusCode === 403, 'Trainee 2 is denied review access to Trainee 1 attempt');
    }

    // ----------------------------------------------------
    // TEST 14: Trainer can review attempt for their own course
    // ----------------------------------------------------
    console.log('\n--- Test 14: Trainer Assessment Attempt Review Authorization ---');
    {
      const req = { user: trainerA, params: { attemptId: finalAttemptId } };
      const res = createMockRes();
      await getAssessmentAttemptReview(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Trainer A can review attempt for their course');
    }

    // ----------------------------------------------------
    // TEST 15: Trainer B cannot review attempts on Trainer A's course
    // ----------------------------------------------------
    console.log('\n--- Test 15: Multi-Tenant Trainer Attempt Review Isolation ---');
    {
      const req = { user: trainerB, params: { attemptId: finalAttemptId } };
      const res = createMockRes();
      await getAssessmentAttemptReview(req, res, (err) => { throw err; });
      assert(res.statusCode === 403, 'Trainer B is denied review access to Trainer A attempt');
    }

    // ----------------------------------------------------
    // TEST 16: Admin has platform-wide review permission
    // ----------------------------------------------------
    console.log('\n--- Test 16: Admin Platform-Wide Review Permission ---');
    {
      const req = { user: adminUser, params: { attemptId: finalAttemptId } };
      const res = createMockRes();
      await getAssessmentAttemptReview(req, res, (err) => { throw err; });
      assert(res.statusCode === 200 && res.jsonData.success, 'Admin can inspect any assessment attempt');
    }

    // Clean up
    await User.deleteMany({ email: /@test65\.com$/ });
    await Course.deleteMany({ title: /\[Phase 6\.5 Test\]/ });
    await Module.deleteMany({ course: courseA._id });
    await Enrollment.deleteMany({ course: { $in: [courseA._id, courseB._id] } });
    await Assessment.deleteMany({ course: { $in: [courseA._id, courseB._id] } });
    await QuizAttempt.deleteMany({ course: { $in: [courseA._id, courseB._id] } });
    await Certificate.deleteMany({ course: { $in: [courseA._id, courseB._id] } });
    await Skill.deleteMany({ name: /\[P6\.5\]/ });

    console.log('\n==================================================');
    console.log(`PHASE 6.5 TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
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
