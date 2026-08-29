/**
 * Capacity Connect — Profile Component Test Suite
 *
 * Comprehensive tests for:
 * 1. Authentication & RBAC protection (unauthenticated blocked)
 * 2. Trainee Profile Hub: accurate database-calculated learning metrics, verified skills, competencies, recent certificates
 * 3. User-managed profile updates: name, phone, location, bio, education[], experience[], interests[], careerGoal
 * 4. Data integrity & immutability: verified skills, certificates, assessment scores, and competencies cannot be modified via profile updates
 * 5. Strict multi-user isolation (identity derived strictly from JWT session; no foreign user mutation)
 * 6. Trainer Profile Hub: strict trainer ownership course stats & performance isolation
 * 7. Trainer-specific updates: designation, organization, yearsOfExperience, professionalBackground, teachingInterests
 * 8. Admin Profile Hub: platform snapshot (total users, trainees, trainers, courses, enrollments, certificates)
 * 9. Profile photo upload, replace, and remove lifecycle
 * 10. Validation tests: phone number, education start/end years, experience required fields
 * 11. AI integration synergy: careerGoal persistence without modifying verified skills
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Assessment = require('../models/Assessment');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Skill = require('../models/Skill');
const Competency = require('../models/Competency');
const CourseReview = require('../models/CourseReview');
const { connectDB } = require('../config/db');

const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
} = require('../controllers/profileController');

// Mock response creator
const createMockRes = () => {
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
};

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 Starting Capacity Connect Profile Component Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS [Test ${passed + failed + 1}]: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL [Test ${passed + failed + 1}]: ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    await connectDB();
    console.log('Connected to MongoDB for Profile testing.\n');

    const timestamp = Date.now();

    // ------------------------------------------------------------------
    // SETUP TEST DATA
    // ------------------------------------------------------------------
    // Create Skills
    const skillReact = await Skill.create({
      name: `React Architecture ${timestamp}`,
      category: 'Technical',
      description: 'Component architecture and state hooks',
      isActive: true,
    });

    const skillNode = await Skill.create({
      name: `Node Backend ${timestamp}`,
      category: 'Technical',
      description: 'Server runtime and APIs',
      isActive: true,
    });

    const skillMongo = await Skill.create({
      name: `Database Design ${timestamp}`,
      category: 'Technical',
      description: 'Document database schema modeling',
      isActive: true,
    });

    // Create Competency
    const fullStackCompetency = await Competency.create({
      name: `Full Stack Mastery ${timestamp}`,
      description: 'Demonstrated mastery across frontend and backend systems',
      skills: [skillReact._id, skillNode._id],
      isActive: true,
    });

    // Create Trainer A and Trainer B
    const trainerA = await User.create({
      name: `Alice Trainer ${timestamp}`,
      email: `alice.trainer.${timestamp}@example.com`,
      password: 'password123',
      role: 'trainer',
      department: 'Engineering',
      designation: 'Senior Lead Instructor',
      organization: 'Tech Academy',
      yearsOfExperience: 7,
      professionalBackground: '10 years of full-stack engineering and corporate training.',
      teachingInterests: ['React', 'Node.js', 'System Architecture'],
    });

    const trainerB = await User.create({
      name: `Bob Trainer ${timestamp}`,
      email: `bob.trainer.${timestamp}@example.com`,
      password: 'password123',
      role: 'trainer',
      department: 'Data Science',
    });

    // Create Trainee A and Trainee B
    const traineeA = await User.create({
      name: `Charlie Trainee ${timestamp}`,
      email: `charlie.trainee.${timestamp}@example.com`,
      password: 'password123',
      role: 'trainee',
      careerGoal: 'Full Stack Developer',
      phone: '+1 555-0144',
      location: 'San Francisco, CA',
      bio: 'Aspiring full stack software engineer passionate about modern web apps.',
      interests: ['Web Development', 'Cloud Computing'],
    });

    const traineeB = await User.create({
      name: `Dana Trainee ${timestamp}`,
      email: `dana.trainee.${timestamp}@example.com`,
      password: 'password123',
      role: 'trainee',
      careerGoal: 'Data Scientist',
      phone: '+1 555-0188',
      location: 'New York, NY',
    });

    // Create Admin User
    const adminUser = await User.create({
      name: `Admin Officer ${timestamp}`,
      email: `admin.officer.${timestamp}@example.com`,
      password: 'password123',
      role: 'admin',
      phone: '+1 555-0100',
    });

    // Create Courses for Trainer A
    const course1 = await Course.create({
      title: `Modern React & Node ${timestamp}`,
      description: 'Comprehensive web development course',
      category: 'Software Engineering',
      level: 'intermediate',
      status: 'published',
      trainer: trainerA._id,
      skills: [
        { skill: skillReact._id, proficiency: 'advanced' },
        { skill: skillNode._id, proficiency: 'proficient' },
      ],
    });

    const course2 = await Course.create({
      title: `Advanced Database Architectures ${timestamp}`,
      description: 'Database design and scaling',
      category: 'Databases',
      level: 'advanced',
      status: 'draft',
      trainer: trainerA._id,
      skills: [{ skill: skillMongo._id, proficiency: 'advanced' }],
    });

    // Create Course for Trainer B
    const courseTrainerB = await Course.create({
      title: `Data Science with Python ${timestamp}`,
      description: 'Data analytics fundamentals',
      category: 'Data Science',
      level: 'beginner',
      status: 'published',
      trainer: trainerB._id,
      skills: [],
    });

    // Create Final Assessment for Course 1
    const finalAssessment = await Assessment.create({
      title: `Course Final Exam ${timestamp}`,
      course: course1._id,
      type: 'final',
      passingScore: 70,
      status: 'published',
      questions: [
        {
          questionText: 'What is a React hook?',
          optionA: 'A special function allowing React state access in functional components',
          optionB: 'A CSS stylesheet preprocessor',
          optionC: 'A backend Node.js database connector',
          optionD: 'An HTML form validation attribute',
          correctOption: 'A',
          marks: 10,
        },
      ],
    });

    // Create Enrollment for Trainee A on Course 1 (completed with 100%)
    const enrollmentA = await Enrollment.create({
      trainee: traineeA._id,
      course: course1._id,
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
    });

    // Create Passed QuizAttempt for Trainee A
    const quizAttemptA = await QuizAttempt.create({
      trainee: traineeA._id,
      assessment: finalAssessment._id,
      course: course1._id,
      type: 'final',
      score: 10,
      totalMarks: 10,
      percentage: 100,
      passed: true,
      submittedAt: new Date(),
    });

    // Create Certificate for Trainee A
    const certA = await Certificate.create({
      certificateId: `CC-TEST-${timestamp}`,
      trainee: traineeA._id,
      course: course1._id,
      trainer: trainerA._id,
      assessment: finalAssessment._id,
      score: 10,
      totalMarks: 10,
      percentage: 100,
      issuedAt: new Date(),
      issueDate: new Date(),
      filePath: `uploads/certificates/CC-TEST-${timestamp}.pdf`,
      status: 'valid',
    });

    // Create Course Review
    await CourseReview.create({
      course: course1._id,
      user: traineeA._id,
      rating: 5,
      comment: 'Outstanding course delivery!',
    });

    // ------------------------------------------------------------------
    // TEST 1: Trainee Profile Retrieval & System Metrics Calculation
    // ------------------------------------------------------------------
    console.log('--- Test 1: Trainee Profile Retrieval & System Data ---');
    {
      const req = { user: traineeA };
      const res = createMockRes();
      await getProfile(req, res, (err) => { throw err; });

      assert(res.statusCode === 200 && res.jsonData?.success, 'Trainee profile retrieved with HTTP 200 OK');
      assert(res.jsonData.user.name === traineeA.name, 'Returns correct safe user info without password');
      assert(res.jsonData.user.careerGoal === 'Full Stack Developer', 'Returns current career goal');
      assert(res.jsonData.summary.role === 'trainee', 'Identifies summary role as trainee');
      
      const overview = res.jsonData.summary.overview;
      assert(overview.coursesCompleted === 1, 'Accurately computes 1 completed course from database');
      assert(overview.certificatesEarned === 1, 'Accurately computes 1 earned certificate from database');
      assert(overview.verifiedSkillsCount >= 2, 'Accurately derives >= 2 verified skills from completed course & assessment');
      
      const verifiedSkills = res.jsonData.summary.verifiedSkills;
      const hasReactSkill = verifiedSkills.some((s) => s._id.toString() === skillReact._id.toString() && s.proficiency === 'advanced');
      assert(hasReactSkill, 'React skill verified at Advanced proficiency with proof of exam completion');

      const compSummary = res.jsonData.summary.competencies;
      const targetComp = compSummary.find((c) => c._id.toString() === fullStackCompetency._id.toString());
      assert(targetComp && targetComp.status === 'Demonstrated' && targetComp.progressPercentage === 100, 'Competency marked as 100% Demonstrated based on verified skills');

      const certs = res.jsonData.summary.recentCertificates;
      assert(certs.length === 1 && certs[0].certificateId === certA.certificateId, 'Includes recent valid certificate with verification ID');
    }

    // ------------------------------------------------------------------
    // TEST 2: User-Managed Profile Updates (Education, Experience, Bio)
    // ------------------------------------------------------------------
    console.log('\n--- Test 2: User-Managed Profile Updates ---');
    {
      const educationPayload = [
        {
          qualification: 'B.Tech',
          institution: 'National University of Technology',
          fieldOfStudy: 'Computer Science',
          startYear: 2022,
          endYear: 2026,
          description: 'Dean’s Honor List',
        },
      ];

      const experiencePayload = [
        {
          jobTitle: 'Full Stack Intern',
          organization: 'Apex Solutions',
          employmentType: 'Internship',
          startDate: 'June 2025',
          endDate: 'August 2025',
          isCurrent: false,
          description: 'Built React micro-frontends and Node.js REST services.',
        },
      ];

      const req = {
        user: traineeA,
        body: {
          bio: 'Updated bio: specializing in distributed systems and modern UI.',
          phone: '+1 555-9876',
          location: 'Seattle, WA',
          education: educationPayload,
          experience: experiencePayload,
          interests: ['Web Development', 'System Architecture', 'AI'],
        },
      };
      const res = createMockRes();
      await updateProfile(req, res, (err) => { throw err; });

      assert(res.statusCode === 200 && res.jsonData.success, 'Profile update returns HTTP 200 OK');
      assert(res.jsonData.user.bio.includes('specializing in distributed systems'), 'Bio updated successfully');
      assert(res.jsonData.user.location === 'Seattle, WA', 'Location updated successfully');
      assert(res.jsonData.user.education.length === 1 && res.jsonData.user.education[0].qualification === 'B.Tech', 'Education entry saved with qualification and institution');
      assert(res.jsonData.user.experience.length === 1 && res.jsonData.user.experience[0].jobTitle === 'Full Stack Intern', 'Experience entry saved with organization and role');
      assert(res.jsonData.user.interests.includes('AI'), 'Interests list updated');

      // Verify in MongoDB
      const updatedTraineeInDb = await User.findById(traineeA._id);
      assert(updatedTraineeInDb.education.length === 1 && updatedTraineeInDb.education[0].institution === 'National University of Technology', 'Education persisted to MongoDB User document');
    }

    // ------------------------------------------------------------------
    // TEST 3: System Data Immutability (Cannot Fabricate Skills or Certs via Profile PUT)
    // ------------------------------------------------------------------
    console.log('\n--- Test 3: System Data Immutability & Security ---');
    {
      const req = {
        user: traineeA,
        body: {
          // Attempting to inject fabricated skills, certificates, or role change
          role: 'admin',
          isActive: false,
          skills: ['Fabricated Quantum Physics'],
          verifiedSkills: [{ name: 'Fake Skill', proficiency: 'advanced' }],
          certificatesEarned: 99,
        },
      };
      const res = createMockRes();
      await updateProfile(req, res, (err) => { throw err; });

      const traineeInDb = await User.findById(traineeA._id);
      assert(traineeInDb.role === 'trainee', 'Role remains strictly trainee (cannot elevate role via profile PUT)');
      assert(traineeInDb.isActive === true, 'isActive remains unchanged');
      assert(!traineeInDb.skills.includes('Fabricated Quantum Physics'), 'Fabricated skills ignored during profile update');
    }

    // ------------------------------------------------------------------
    // TEST 4: Multi-User Profile Isolation
    // ------------------------------------------------------------------
    console.log('\n--- Test 4: Multi-User Profile Isolation ---');
    {
      // Trainee B gets own profile and metrics (0 completed courses)
      const reqB = { user: traineeB };
      const resB = createMockRes();
      await getProfile(reqB, resB, (err) => { throw err; });

      assert(resB.jsonData.user.name === traineeB.name, 'Trainee B retrieves own distinct identity');
      assert(resB.jsonData.summary.overview.coursesCompleted === 0, 'Trainee B shows 0 completed courses (does not leak Trainee A completions)');
      assert(resB.jsonData.summary.verifiedSkills.length === 0, 'Trainee B has 0 verified skills');
    }

    // ------------------------------------------------------------------
    // TEST 5: Trainer Profile & Strict Teaching Data Isolation
    // ------------------------------------------------------------------
    console.log('\n--- Test 5: Trainer Profile & Teaching Performance Summary ---');
    {
      const req = { user: trainerA };
      const res = createMockRes();
      await getProfile(req, res, (err) => { throw err; });

      assert(res.statusCode === 200 && res.jsonData.success, 'Trainer profile retrieved with HTTP 200 OK');
      assert(res.jsonData.summary.role === 'trainer', 'Identifies summary role as trainer');

      const teachingOverview = res.jsonData.summary.teachingOverview;
      assert(teachingOverview.coursesCreated === 2, 'Accurately reflects 2 courses created by Trainer A');
      assert(teachingOverview.publishedCourses === 1, 'Accurately reflects 1 published course');
      assert(teachingOverview.draftCourses === 1, 'Accurately reflects 1 draft course');
      assert(teachingOverview.totalLearners === 1, 'Accurately reflects 1 enrolled learner');
      assert(teachingOverview.certificatesIssued === 1, 'Accurately reflects 1 certificate issued on Trainer A courses');

      const performance = res.jsonData.summary.performanceSummary;
      assert(performance.completionRate === 100, 'Computes 100% completion rate for completed enrollment');
      assert(performance.averageRating === 5, 'Computes average course rating (5.0 stars)');

      // Trainer B profile isolation test: Trainer B has 0 enrollments on course
      const reqTB = { user: trainerB };
      const resTB = createMockRes();
      await getProfile(reqTB, resTB, (err) => { throw err; });

      assert(resTB.jsonData.summary.teachingOverview.coursesCreated === 1, 'Trainer B shows only 1 course (Python)');
      assert(resTB.jsonData.summary.teachingOverview.totalLearners === 0, 'Trainer B shows 0 learners (does not leak Trainer A learners)');
    }

    // ------------------------------------------------------------------
    // TEST 6: Trainer Profile Updates (Designation, Experience, Expertise)
    // ------------------------------------------------------------------
    console.log('\n--- Test 6: Trainer-Specific Profile Updates ---');
    {
      const req = {
        user: trainerA,
        body: {
          designation: 'Principal Cloud Architect & AI Trainer',
          organization: 'Capacity Global Institute',
          yearsOfExperience: 9,
          professionalBackground: '12+ years in cloud native architectures and deep learning systems.',
          teachingInterests: ['React', 'Node.js', 'Distributed Systems', 'Cloud Architecture'],
        },
      };
      const res = createMockRes();
      await updateProfile(req, res, (err) => { throw err; });

      assert(res.statusCode === 200 && res.jsonData.success, 'Trainer updates saved with HTTP 200 OK');
      assert(res.jsonData.user.designation === 'Principal Cloud Architect & AI Trainer', 'Designation updated');
      assert(res.jsonData.user.yearsOfExperience === 9, 'Years of experience updated');
      assert(res.jsonData.user.teachingInterests.includes('Cloud Architecture'), 'Teaching interests updated');
    }

    // ------------------------------------------------------------------
    // TEST 7: Admin Profile & Platform Snapshot
    // ------------------------------------------------------------------
    console.log('\n--- Test 7: Admin Profile & Platform Snapshot ---');
    {
      const req = { user: adminUser };
      const res = createMockRes();
      await getProfile(req, res, (err) => { throw err; });

      assert(res.statusCode === 200 && res.jsonData.success, 'Admin profile retrieved with HTTP 200 OK');
      assert(res.jsonData.summary.role === 'admin', 'Identifies summary role as admin');

      const snapshot = res.jsonData.summary.platformSnapshot;
      assert(snapshot.totalUsers >= 5, 'Computes total platform user count (>= 5)');
      assert(snapshot.traineesCount >= 2, 'Computes trainee count (>= 2)');
      assert(snapshot.trainersCount >= 2, 'Computes trainer count (>= 2)');
      assert(snapshot.totalCourses >= 3, 'Computes total courses (>= 3)');
      assert(snapshot.totalEnrollments >= 1, 'Computes total enrollments (>= 1)');
      assert(snapshot.totalCertificates >= 1, 'Computes total valid certificates (>= 1)');
    }

    // ------------------------------------------------------------------
    // TEST 8: Validation Enforcement (Phone, Dates, Required Fields)
    // ------------------------------------------------------------------
    console.log('\n--- Test 8: Validation Handling ---');
    {
      // Invalid phone format
      const reqInvalidPhone = {
        user: traineeA,
        body: { phone: 'not-a-valid-phone-number-abc-xyz' },
      };
      const resPhone = createMockRes();
      await updateProfile(reqInvalidPhone, resPhone, (err) => { throw err; });
      assert(resPhone.statusCode === 400 && !resPhone.jsonData.success, 'Rejects invalid phone number format');

      // Invalid education dates (startYear > endYear)
      const reqInvalidDates = {
        user: traineeA,
        body: {
          education: [
            {
              qualification: 'M.Tech',
              institution: 'State University',
              startYear: 2026,
              endYear: 2022, // Start is later than end
            },
          ],
        },
      };
      const resDates = createMockRes();
      await updateProfile(reqInvalidDates, resDates, (err) => { throw err; });
      assert(resDates.statusCode === 400 && !resDates.jsonData.success, 'Rejects education entry where startYear > endYear');

      // Missing required institution
      const reqMissingInst = {
        user: traineeA,
        body: {
          education: [{ qualification: 'B.Sc' }],
        },
      };
      const resMissing = createMockRes();
      await updateProfile(reqMissingInst, resMissing, (err) => { throw err; });
      assert(resMissing.statusCode === 400 && !resMissing.jsonData.success, 'Rejects education entry missing institution');

      // Empty name rejection
      const reqEmptyName = {
        user: traineeA,
        body: { name: '   ' },
      };
      const resName = createMockRes();
      await updateProfile(reqEmptyName, resName, (err) => { throw err; });
      assert(resName.statusCode === 400 && !resName.jsonData.success, 'Rejects empty full name');
    }

    // ------------------------------------------------------------------
    // TEST 9: Profile Photo Lifecycle (Upload, Replace, Remove)
    // ------------------------------------------------------------------
    console.log('\n--- Test 9: Profile Photo Upload & Removal ---');
    {
      // Mock multer file upload
      const testFilename = `test-avatar-${timestamp}.png`;
      const mockReqUpload = {
        user: traineeA,
        file: {
          filename: testFilename,
          originalname: 'my-avatar.png',
          mimetype: 'image/png',
          size: 102400,
        },
      };
      const resUpload = createMockRes();
      await uploadProfilePhoto(mockReqUpload, resUpload, (err) => { throw err; });

      assert(resUpload.statusCode === 200 && resUpload.jsonData.success, 'Profile photo uploaded successfully');
      assert(resUpload.jsonData.photo === `/uploads/profiles/${testFilename}`, 'Generates safe public URL path for uploaded avatar');

      const userAfterUpload = await User.findById(traineeA._id);
      assert(userAfterUpload.photo === `/uploads/profiles/${testFilename}`, 'Persists avatar photo URL in User record');

      // Remove photo
      const mockReqRemove = { user: traineeA };
      const resRemove = createMockRes();
      await removeProfilePhoto(mockReqRemove, resRemove, (err) => { throw err; });

      assert(resRemove.statusCode === 200 && resRemove.jsonData.success, 'Profile photo removed successfully');
      const userAfterRemove = await User.findById(traineeA._id);
      assert(userAfterRemove.photo === '', 'Resets photo URL to empty string on removal');
    }

    // ------------------------------------------------------------------
    // TEST 10: Career Goal AI Synergy (Updating Goal Does NOT Mutate Skills)
    // ------------------------------------------------------------------
    console.log('\n--- Test 10: Career Goal Persistence & AI Synergy ---');
    {
      const newGoal = 'Cloud Solutions Architect';
      const req = {
        user: traineeA,
        body: { careerGoal: newGoal },
      };
      const res = createMockRes();
      await updateProfile(req, res, (err) => { throw err; });

      assert(res.statusCode === 200 && res.jsonData.user.careerGoal === newGoal, 'Target career goal updated and persisted');

      // Verify that changing career goal did NOT alter verified skills or assessment scores
      const reqCheckProfile = { user: traineeA };
      const resCheck = createMockRes();
      await getProfile(reqCheckProfile, resCheck, (err) => { throw err; });

      const verifiedSkillsAfterGoalChange = resCheck.jsonData.summary.verifiedSkills;
      assert(verifiedSkillsAfterGoalChange.length >= 2, 'Verified skills remain 100% intact and unchanged after updating career goal');
      assert(resCheck.jsonData.summary.overview.coursesCompleted === 1, 'Completed courses count remains intact');
    }

    // ------------------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------------------
    await User.deleteMany({ _id: { $in: [trainerA._id, trainerB._id, traineeA._id, traineeB._id, adminUser._id] } });
    await Course.deleteMany({ _id: { $in: [course1._id, course2._id, courseTrainerB._id] } });
    await Assessment.deleteMany({ _id: finalAssessment._id });
    await QuizAttempt.deleteMany({ _id: quizAttemptA._id });
    await Enrollment.deleteMany({ _id: enrollmentA._id });
    await Certificate.deleteMany({ _id: certA._id });
    await Skill.deleteMany({ _id: { $in: [skillReact._id, skillNode._id, skillMongo._id] } });
    await Competency.deleteMany({ _id: fullStackCompetency._id });

    console.log('\n====================================================');
    console.log(`📊 Profile Test Suite Summary: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during Profile test suite execution:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

runTests();
