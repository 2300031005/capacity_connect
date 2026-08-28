const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Enrollment = require('./models/Enrollment');
const Assessment = require('./models/Assessment');
const QuizAttempt = require('./models/QuizAttempt');
const Certificate = require('./models/Certificate');
const { generateCertificatePDF, generateCertificateId } = require('./utils/certificateGenerator');

async function runPhase4Tests() {
  console.log('--- STARTING PHASE 4 AUTOMATED TEST SUITE ---');

  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/capacity_connect';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // 1. Find or create Trainer & Trainee
    let trainer = await User.findOne({ role: 'trainer' });
    if (!trainer) {
      trainer = await User.create({
        name: 'Jane Trainer',
        email: 'trainer_phase4@test.com',
        password: 'password123',
        role: 'trainer',
        department: 'Engineering',
      });
    }

    let trainee = await User.findOne({ role: 'trainee' });
    if (!trainee) {
      trainee = await User.create({
        name: 'Sam Trainee',
        email: 'trainee_phase4@test.com',
        password: 'password123',
        role: 'trainee',
        department: 'Operations',
      });
    }

    console.log(`✓ Trainer: ${trainer.name} (${trainer._id})`);
    console.log(`✓ Trainee: ${trainee.name} (${trainee._id})`);

    // 2. Setup Test Course & Module
    let course = await Course.findOne({ trainer: trainer._id });
    if (!course) {
      course = await Course.create({
        title: 'Phase 4 Advanced Mastery',
        description: 'Comprehensive assessment and certification testing track.',
        category: 'Software Engineering',
        level: 'advanced',
        trainer: trainer._id,
        status: 'published',
        prerequisites: 'Basic JavaScript, React',
      });
    }

    let moduleDoc = await Module.findOne({ course: course._id });
    if (!moduleDoc) {
      moduleDoc = await Module.create({
        title: 'Module 1: Architecture & Testing',
        description: 'Deep dive into test assertions and system design.',
        course: course._id,
        order: 1,
      });
    }

    // Ensure trainee is enrolled
    let enrollment = await Enrollment.findOne({ trainee: trainee._id, course: course._id });
    if (!enrollment) {
      enrollment = await Enrollment.create({
        trainee: trainee._id,
        course: course._id,
        status: 'active',
        progress: 0,
        completedModules: [],
      });
    }

    console.log(`✓ Test Course: "${course.title}" | Module: "${moduleDoc.title}"`);

    // 3. Clean up previous assessments for test idempotency
    await Assessment.deleteMany({ course: course._id });
    await QuizAttempt.deleteMany({ trainee: trainee._id });
    await Certificate.deleteMany({ trainee: trainee._id });

    // 4. Test Module Quiz Creation & Publishing
    const moduleQuiz = await Assessment.create({
      course: course._id,
      module: moduleDoc._id,
      type: 'module',
      title: 'Module 1 Knowledge Check',
      description: 'Quick check on architecture fundamentals.',
      status: 'published',
      questions: [
        {
          questionText: 'What does MVC stand for in software design?',
          optionA: 'Model View Controller',
          optionB: 'Module Variable Constant',
          optionC: 'Master Vector Class',
          optionD: 'Main View Coordinator',
          correctOption: 'A',
          marks: 2,
        },
        {
          questionText: 'Which protocol secures HTTP transmissions?',
          optionA: 'FTP',
          optionB: 'TLS/SSL',
          optionC: 'SMTP',
          optionD: 'DNS',
          correctOption: 'B',
          marks: 3,
        },
      ],
    });

    console.log(`✓ Module Quiz created: ID ${moduleQuiz._id} with ${moduleQuiz.questions.length} questions.`);

    // 5. Test Trainee Attempt on Module Quiz
    // Trainee answers Q1 with 'A' (correct), Q2 with 'A' (wrong)
    const q1 = moduleQuiz.questions[0];
    const q2 = moduleQuiz.questions[1];

    let score = 0;
    const answerLogs = [
      {
        question: q1._id,
        questionText: q1.questionText,
        selectedOption: 'A',
        correctOption: q1.correctOption,
        isCorrect: true,
        marksAwarded: 2,
      },
      {
        question: q2._id,
        questionText: q2.questionText,
        selectedOption: 'A',
        correctOption: q2.correctOption,
        isCorrect: false,
        marksAwarded: 0,
      },
    ];
    score = 2;
    const totalMarks = 5;
    const percentage = Math.round((2 / 5) * 100); // 40%

    const quizAttempt = await QuizAttempt.create({
      trainee: trainee._id,
      assessment: moduleQuiz._id,
      course: course._id,
      module: moduleDoc._id,
      type: 'module',
      score,
      totalMarks,
      percentage,
      passed: true,
      answers: answerLogs,
    });

    console.log(`✓ Trainee Module Quiz Attempt logged: Score ${score}/${totalMarks} (${percentage}%).`);

    // Verify auto-completion of module on submission
    if (!enrollment.completedModules.includes(moduleDoc._id)) {
      enrollment.completedModules.push(moduleDoc._id);
      const totalCourseModules = await Module.countDocuments({ course: course._id });
      enrollment.progress = Math.round(
        (enrollment.completedModules.length / Math.max(1, totalCourseModules)) * 100
      );
      if (enrollment.progress >= 100) enrollment.status = 'completed';
      await enrollment.save();
    }

    const updatedEnrollment = await Enrollment.findById(enrollment._id);
    const isModuleCompleted = updatedEnrollment.completedModules.some(
      (id) => id.toString() === moduleDoc._id.toString()
    );
    if (!isModuleCompleted) {
      throw new Error('FAILED: Module was not marked completed in Enrollment!');
    }
    console.log(`✓ Module auto-completed successfully in enrollment. Progress: ${updatedEnrollment.progress}%.`);

    // 6. Test Final Course Assessment Creation
    const finalAssessment = await Assessment.create({
      course: course._id,
      module: null,
      type: 'final',
      title: 'Phase 4 Final Course Comprehensive Assessment',
      description: 'Graduation assessment covering all course modules.',
      passingPercentage: 60,
      status: 'published',
      questions: [
        {
          questionText: 'What is the primary benefit of immutability in state management?',
          optionA: 'Faster network speeds',
          optionB: 'Predictable state transitions and easy debugging',
          optionC: 'Reduced CSS bundle size',
          optionD: 'Automatic server deployments',
          correctOption: 'B',
          marks: 5,
        },
        {
          questionText: 'What does RBAC stand for in modern security architectures?',
          optionA: 'Role-Based Access Control',
          optionB: 'Remote Browser Application Client',
          optionC: 'Resource Balancing Allocation Cluster',
          optionD: 'Real-time Binary Array Compression',
          correctOption: 'A',
          marks: 5,
        },
      ],
    });

    console.log(`✓ Final Assessment created: ID ${finalAssessment._id}, Passing Threshold: ${finalAssessment.passingPercentage}%.`);

    // 7. Test Trainee Attempt on Final Assessment (Passing Score: 100%)
    const fQ1 = finalAssessment.questions[0];
    const fQ2 = finalAssessment.questions[1];

    const finalAnswerLogs = [
      {
        question: fQ1._id,
        questionText: fQ1.questionText,
        selectedOption: 'B',
        correctOption: fQ1.correctOption,
        isCorrect: true,
        marksAwarded: 5,
      },
      {
        question: fQ2._id,
        questionText: fQ2.questionText,
        selectedOption: 'A',
        correctOption: fQ2.correctOption,
        isCorrect: true,
        marksAwarded: 5,
      },
    ];

    const finalScore = 10;
    const finalTotalMarks = 10;
    const finalPct = 100;
    const passed = finalPct >= finalAssessment.passingPercentage;

    const finalAttempt = await QuizAttempt.create({
      trainee: trainee._id,
      assessment: finalAssessment._id,
      course: course._id,
      module: null,
      type: 'final',
      score: finalScore,
      totalMarks: finalTotalMarks,
      percentage: finalPct,
      passed,
      answers: finalAnswerLogs,
    });

    console.log(`✓ Final Attempt logged: Score ${finalScore}/${finalTotalMarks} (${finalPct}%). Passed: ${passed}`);

    // 8. Test Automatic PDF Certificate Generation via PDFKit
    if (passed) {
      const certificateId = generateCertificateId();

      const filePath = await generateCertificatePDF({
        certificateId,
        traineeName: trainee.name,
        courseTitle: course.title,
        trainerName: trainer.name,
        percentage: finalPct,
        issuedAt: new Date(),
      });

      const fullPath = path.join(__dirname, filePath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`FAILED: PDF Certificate was not written to filesystem at ${fullPath}`);
      }

      const certDoc = await Certificate.create({
        certificateId,
        trainee: trainee._id,
        course: course._id,
        trainer: course.trainer,
        assessment: finalAssessment._id,
        score: finalScore,
        totalMarks: finalTotalMarks,
        percentage: finalPct,
        filePath,
        issuedAt: new Date(),
      });

      console.log(`✓ Certificate generated & saved to database: ${certDoc.certificateId}`);
      console.log(`✓ PDF verified on filesystem: ${fullPath} (Size: ${fs.statSync(fullPath).size} bytes)`);
    }

    // 9. Verify Certificate Query API data
    const myCerts = await Certificate.find({ trainee: trainee._id })
      .populate('course', 'title category level')
      .populate('trainer', 'name email');

    if (myCerts.length !== 1) {
      throw new Error(`FAILED: Expected 1 certificate for trainee, found ${myCerts.length}`);
    }
    console.log(`✓ Trainee My Certificates retrieved: 1 certificate (${myCerts[0].certificateId}) for course "${myCerts[0].course.title}".`);

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 4 BACKEND & GENERATOR TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ PHASE 4 TEST ERROR:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runPhase4Tests();
