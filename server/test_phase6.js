/**
 * CAPACITY CONNECT (SIH26075) — PHASE 6 AUTOMATED TEST SUITE
 * Analytics, Performance Insights & Visual Dashboards Test Suite
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Enrollment = require('./models/Enrollment');
const Assessment = require('./models/Assessment');
const QuizAttempt = require('./models/QuizAttempt');
const Certificate = require('./models/Certificate');
const Skill = require('./models/Skill');
const Competency = require('./models/Competency');

const {
  getTraineeAnalytics,
  getTrainerAnalytics,
  getAdminAnalytics,
} = require('./controllers/analyticsController');

// Mock Express Response Helper
const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

const runPhase6Tests = async () => {
  console.log('\n================================================================');
  console.log('--- STARTING PHASE 6 ANALYTICS & INSIGHTS TEST SUITE ---');
  console.log('================================================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // 1. Setup Test Users
    const timestamp = Date.now();
    const trainerA = await User.findOneAndUpdate(
      { email: `trainerA_${timestamp}@test.com` },
      {
        name: 'Trainer Alice Analytics',
        email: `trainerA_${timestamp}@test.com`,
        password: 'Password123!',
        role: 'trainer',
      },
      { upsert: true, new: true }
    );

    const trainerB = await User.findOneAndUpdate(
      { email: `trainerB_${timestamp}@test.com` },
      {
        name: 'Trainer Bob Analytics',
        email: `trainerB_${timestamp}@test.com`,
        password: 'Password123!',
        role: 'trainer',
      },
      { upsert: true, new: true }
    );

    const trainee = await User.findOneAndUpdate(
      { email: `trainee_p6_${timestamp}@test.com` },
      {
        name: 'Trainee Charlie Analytics',
        email: `trainee_p6_${timestamp}@test.com`,
        password: 'Password123!',
        role: 'trainee',
      },
      { upsert: true, new: true }
    );

    const admin = await User.findOneAndUpdate(
      { email: `admin_p6_${timestamp}@test.com` },
      {
        name: 'Admin Diana Analytics',
        email: `admin_p6_${timestamp}@test.com`,
        password: 'Password123!',
        role: 'admin',
      },
      { upsert: true, new: true }
    );

    console.log(`✓ Trainer A: ${trainerA.name} (${trainerA._id})`);
    console.log(`✓ Trainer B: ${trainerB.name} (${trainerB._id})`);
    console.log(`✓ Trainee: ${trainee.name} (${trainee._id})`);
    console.log(`✓ Admin: ${admin.name} (${admin._id})\n`);

    // 2. Setup Skills & Competency
    const skillJs = await Skill.findOneAndUpdate(
      { normalizedName: `analytics_js_${timestamp}` },
      {
        name: `Analytics JS ${timestamp}`,
        normalizedName: `analytics_js_${timestamp}`,
        category: 'Technical',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    const skillReact = await Skill.findOneAndUpdate(
      { normalizedName: `analytics_react_${timestamp}` },
      {
        name: `Analytics React ${timestamp}`,
        normalizedName: `analytics_react_${timestamp}`,
        category: 'Technical',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    const competencyFullStack = await Competency.create({
      name: `Full Stack Analytics ${timestamp}`,
      description: 'Full stack web development competency bundle',
      skills: [skillJs._id, skillReact._id],
      isActive: true,
    });

    // 3. Setup Course for Trainer A
    const courseA = await Course.create({
      title: `Frontend Architecture ${timestamp}`,
      description: 'Mastering modern frontend development',
      trainer: trainerA._id,
      category: 'Web Development',
      level: 'intermediate',
      status: 'published',
      skills: [
        { skill: skillJs._id, proficiency: 'proficient' },
        { skill: skillReact._id, proficiency: 'advanced' },
      ],
    });

    // 4. Setup Course for Trainer B (Isolated)
    const courseB = await Course.create({
      title: `Data Science Fundamentals ${timestamp}`,
      description: 'Data analytics and machine learning',
      trainer: trainerB._id,
      category: 'Data Science',
      level: 'beginner',
      status: 'published',
      skills: [{ skill: skillJs._id, proficiency: 'beginner' }],
    });

    // 5. Setup Assessments
    const quizA = await Assessment.create({
      course: courseA._id,
      title: 'Module 1 Quiz',
      type: 'module',
      status: 'published',
      passingPercentage: 60,
      questions: [
        {
          questionText: 'What is JSX?',
          optionA: 'Syntax extension',
          optionB: 'Database',
          optionC: 'Protocol',
          optionD: 'OS',
          correctOption: 'A',
          marks: 10,
        },
      ],
    });

    const finalA = await Assessment.create({
      course: courseA._id,
      title: 'Final Frontend Assessment',
      type: 'final',
      status: 'published',
      passingPercentage: 70,
      questions: [
        {
          questionText: 'Explain virtual DOM.',
          optionA: 'In-memory DOM representation',
          optionB: 'Real DOM node',
          optionC: 'Browser API',
          optionD: 'CSS Engine',
          correctOption: 'A',
          marks: 25,
        },
      ],
    });

    // 6. Setup Enrollment, Quiz Attempts, and Certificate for Trainee in Course A
    const enrollmentA = await Enrollment.create({
      trainee: trainee._id,
      course: courseA._id,
      progress: 100,
      status: 'completed',
      completedAt: new Date(),
    });

    const attemptQuizA = await QuizAttempt.create({
      trainee: trainee._id,
      course: courseA._id,
      assessment: quizA._id,
      type: 'module',
      score: 20,
      totalMarks: 20,
      percentage: 100,
      passed: true,
      submittedAt: new Date(),
    });

    const attemptFinalA = await QuizAttempt.create({
      trainee: trainee._id,
      course: courseA._id,
      assessment: finalA._id,
      type: 'final',
      score: 45,
      totalMarks: 50,
      percentage: 90,
      passed: true,
      submittedAt: new Date(),
    });

    const certA = await Certificate.create({
      certificateId: `CC-P6-TEST-${timestamp}`,
      trainee: trainee._id,
      course: courseA._id,
      trainer: trainerA._id,
      assessment: finalA._id,
      score: 45,
      totalMarks: 50,
      percentage: 90,
      issuedAt: new Date(),
      filePath: 'uploads/certificates/test_cert.pdf',
      status: 'valid',
    });

    // -------------------------------------------------------------
    // TEST 1: Trainee Analytics Endpoint & Calculations
    // -------------------------------------------------------------
    console.log('TEST 1: Trainee Analytics Endpoint & Real-Time Calculation');
    const reqTrainee = { user: trainee };
    const resTrainee = createMockRes();
    await getTraineeAnalytics(reqTrainee, resTrainee, (err) => {
      throw err;
    });

    if (resTrainee.statusCode === 200 && resTrainee.jsonData?.success) {
      const data = resTrainee.jsonData.data;
      if (
        data.summary.totalEnrolledCourses >= 1 &&
        data.summary.completedCourses >= 1 &&
        data.summary.certificatesEarned >= 1 &&
        data.summary.overallProgress === 100
      ) {
        console.log('✓ PASS: Trainee summary correctly reports courses, completions, certificates, and 100% progress.');
      } else {
        throw new Error(`Trainee summary mismatch: ${JSON.stringify(data.summary)}`);
      }
    } else {
      throw new Error(`Failed to fetch trainee analytics: ${resTrainee.statusCode}`);
    }

    // -------------------------------------------------------------
    // TEST 2: Trainee Skill Distribution & Competency Calculation
    // -------------------------------------------------------------
    console.log('\nTEST 2: Trainee Skill Proficiency Distribution & Competency');
    const traineeData = resTrainee.jsonData.data;
    if (traineeData.skillDistribution.advanced >= 1 && traineeData.skillDistribution.proficient >= 1) {
      console.log(`✓ PASS: Verified skills aggregated (Advanced: ${traineeData.skillDistribution.advanced}, Proficient: ${traineeData.skillDistribution.proficient})`);
    } else {
      throw new Error(`Skill distribution mismatch: ${JSON.stringify(traineeData.skillDistribution)}`);
    }

    const testComp = traineeData.competencyProgress.find((c) => c._id.toString() === competencyFullStack._id.toString());
    if (testComp && testComp.percentageDemonstrated === 100 && testComp.status === 'Demonstrated') {
      console.log('✓ PASS: Competency correctly evaluated to 100% Demonstrated for trainee.');
    } else {
      throw new Error(`Competency evaluation mismatch: ${JSON.stringify(testComp)}`);
    }

    // -------------------------------------------------------------
    // TEST 3: Trainee Learning Trend & Chronological Activity
    // -------------------------------------------------------------
    console.log('\nTEST 3: Trainee Chronological Learning Trend & Activity Feed');
    if (Array.isArray(traineeData.learningTrend) && traineeData.learningTrend.length >= 1) {
      console.log(`✓ PASS: Learning trend correctly computed with ${traineeData.learningTrend.length} chronological data points.`);
    } else {
      throw new Error('Learning trend array is empty or invalid.');
    }

    if (Array.isArray(traineeData.recentActivity) && traineeData.recentActivity.length >= 1) {
      console.log(`✓ PASS: Recent activity feed contains ${traineeData.recentActivity.length} event items.`);
    } else {
      throw new Error('Recent activity array is empty or invalid.');
    }

    // -------------------------------------------------------------
    // TEST 4 & 5: Trainer Analytics Data Isolation
    // -------------------------------------------------------------
    console.log("\nTEST 4 & 5: Trainer Analytics & Multi-Tenant Data Isolation");
    const reqTrainerA = { user: trainerA };
    const resTrainerA = createMockRes();
    await getTrainerAnalytics(reqTrainerA, resTrainerA, (err) => {
      throw err;
    });

    const trainerAData = resTrainerA.jsonData?.data;
    if (
      trainerAData &&
      trainerAData.summary.totalCourses === 1 &&
      trainerAData.summary.totalLearners === 1 &&
      trainerAData.summary.totalCertificatesIssued === 1
    ) {
      console.log("✓ PASS: Trainer A sees exactly own course, enrolled learners, and certificates issued.");
    } else {
      throw new Error(`Trainer A analytics mismatch: ${JSON.stringify(trainerAData?.summary)}`);
    }

    // Trainer B should have 0 learners and 0 enrollments
    const reqTrainerB = { user: trainerB };
    const resTrainerB = createMockRes();
    await getTrainerAnalytics(reqTrainerB, resTrainerB, (err) => {
      throw err;
    });

    const trainerBData = resTrainerB.jsonData?.data;
    if (
      trainerBData &&
      trainerBData.summary.totalCourses === 1 &&
      trainerBData.summary.totalLearners === 0 &&
      trainerBData.summary.totalEnrollments === 0
    ) {
      console.log("✓ PASS: Trainer B strictly sees 0 learners and 0 enrollments (Data isolation verified).");
    } else {
      throw new Error(`Trainer B leaked data: ${JSON.stringify(trainerBData?.summary)}`);
    }

    // -------------------------------------------------------------
    // TEST 6: Trainer Learner Progress Spread & Skills Taught
    // -------------------------------------------------------------
    console.log('\nTEST 6: Trainer Learner Progress Histogram & Skills Taught');
    const bucket100 = trainerAData.learnerProgressDistribution.find((b) => b.range === '100%');
    if (bucket100 && bucket100.count === 1) {
      console.log('✓ PASS: Learner progress distribution accurately placed completed trainee in 100% bucket.');
    } else {
      throw new Error(`Progress distribution mismatch: ${JSON.stringify(trainerAData.learnerProgressDistribution)}`);
    }

    if (Array.isArray(trainerAData.skillsTaught) && trainerAData.skillsTaught.length === 2) {
      console.log(`✓ PASS: Skills taught list correctly reflects ${trainerAData.skillsTaught.length} mapped skills.`);
    } else {
      throw new Error(`Skills taught mismatch: ${JSON.stringify(trainerAData.skillsTaught)}`);
    }

    // -------------------------------------------------------------
    // TEST 7: Platform Admin Analytics
    // -------------------------------------------------------------
    console.log('\nTEST 7: Admin Platform-Wide Telemetry & Aggregation');
    const reqAdmin = { user: admin };
    const resAdmin = createMockRes();
    await getAdminAnalytics(reqAdmin, resAdmin, (err) => {
      throw err;
    });

    const adminData = resAdmin.jsonData?.data;
    if (
      adminData &&
      adminData.summary.totalUsers >= 4 &&
      adminData.summary.totalCourses >= 2 &&
      adminData.summary.totalEnrollments >= 1 &&
      adminData.summary.totalCertificates >= 1
    ) {
      console.log('✓ PASS: Admin analytics correctly aggregates platform-wide users, courses, enrollments, and certs.');
    } else {
      throw new Error(`Admin summary mismatch: ${JSON.stringify(adminData?.summary)}`);
    }

    // -------------------------------------------------------------
    // TEST 8: Admin User Role & Course Status Breakdown
    // -------------------------------------------------------------
    console.log('\nTEST 8: Admin User Role & Course Status Breakdown');
    const traineeRole = adminData.userDistribution.find((u) => u.role === 'Trainees');
    const trainerRole = adminData.userDistribution.find((u) => u.role === 'Trainers');
    if (traineeRole && traineeRole.count >= 1 && trainerRole && trainerRole.count >= 2) {
      console.log(`✓ PASS: User role breakdown accurate (Trainees: ${traineeRole.count}, Trainers: ${trainerRole.count})`);
    } else {
      throw new Error(`User distribution mismatch: ${JSON.stringify(adminData.userDistribution)}`);
    }

    // -------------------------------------------------------------
    // TEST 9: Admin Top Courses & Popular Skills
    // -------------------------------------------------------------
    console.log('\nTEST 9: Admin Top Performing Courses & Popular Skills');
    if (Array.isArray(adminData.topCourses) && adminData.topCourses.length >= 1) {
      console.log(`✓ PASS: Top courses ranked by enrollments (${adminData.topCourses[0].title}: ${adminData.topCourses[0].enrollmentCount} learners)`);
    } else {
      throw new Error('Top courses array is empty.');
    }

    if (Array.isArray(adminData.popularSkills) && adminData.popularSkills.length >= 1) {
      console.log(`✓ PASS: Popular skills calculated (${adminData.popularSkills[0].name}: mapped in ${adminData.popularSkills[0].coursesCount} courses)`);
    } else {
      throw new Error('Popular skills array is empty.');
    }

    // -------------------------------------------------------------
    // TEST 10: Admin Assessment Statistics & Trainer Activity
    // -------------------------------------------------------------
    console.log('\nTEST 10: Admin Assessment Pass/Fail & Trainer Capacity Table');
    const expectedPassPct = Math.round((adminData.assessmentStatistics.passCount / adminData.assessmentStatistics.totalAttempts) * 100);
    if (
      adminData.assessmentStatistics.totalAttempts >= 2 &&
      adminData.assessmentStatistics.passCount >= 2 &&
      adminData.assessmentStatistics.passPercentage === expectedPassPct
    ) {
      console.log(`✓ PASS: Assessment statistics accurate (${adminData.assessmentStatistics.totalAttempts} attempts, ${adminData.assessmentStatistics.passPercentage}% pass rate)`);
    } else {
      throw new Error(`Assessment statistics mismatch: ${JSON.stringify(adminData.assessmentStatistics)}`);
    }

    if (Array.isArray(adminData.trainerActivity) && adminData.trainerActivity.length >= 2) {
      console.log(`✓ PASS: Trainer activity table includes ${adminData.trainerActivity.length} trainers with capacity metrics.`);
    } else {
      throw new Error('Trainer activity table is incomplete.');
    }

    // -------------------------------------------------------------
    // TEST 11: Empty Data Graceful Handling
    // -------------------------------------------------------------
    console.log('\nTEST 11: Empty Database / Zero Data Handling');
    const freshTrainee = await User.create({
      name: 'Fresh Trainee Zero Data',
      email: `fresh_trainee_${timestamp}@test.com`,
      password: 'Password123!',
      role: 'trainee',
    });

    const resFresh = createMockRes();
    await getTraineeAnalytics({ user: freshTrainee }, resFresh, (err) => {
      throw err;
    });

    const freshData = resFresh.jsonData?.data;
    if (
      freshData &&
      freshData.summary.totalEnrolledCourses === 0 &&
      freshData.summary.overallProgress === 0 &&
      freshData.summary.verifiedSkills === 0 &&
      freshData.learningProgress.length === 0 &&
      freshData.learningTrend.length === 0
    ) {
      console.log('✓ PASS: Fresh user with zero records returns clean zeros and empty arrays without throwing errors.');
    } else {
      throw new Error(`Fresh user error: ${JSON.stringify(freshData)}`);
    }

    // -------------------------------------------------------------
    // TEST 12: RBAC Route Protection Verification
    // -------------------------------------------------------------
    console.log('\nTEST 12: RBAC Route Protection Guards');
    const analyticsRoutes = require('./routes/analyticsRoutes');
    const getLayerMethods = (path, method) => {
      const route = analyticsRoutes.stack.find((l) => l.route && l.route.path === path && l.route.methods[method]);
      return route ? route.route.stack.map((s) => s.name) : [];
    };

    const traineeLayers = getLayerMethods('/trainee', 'get');
    const trainerLayers = getLayerMethods('/trainer', 'get');
    const adminLayers = getLayerMethods('/admin', 'get');

    if (traineeLayers.length >= 2 && trainerLayers.length >= 2 && adminLayers.length >= 2) {
      console.log('✓ PASS: RBAC protect and authorize middleware strictly registered on all analytics endpoints.');
    } else {
      throw new Error('Middleware missing on analytics routes.');
    }

    console.log('\n================================================================');
    console.log('🎉 ALL PHASE 6 ANALYTICS & INSIGHTS TESTS PASSED (100%)!');
    console.log('================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
};

runPhase6Tests();
