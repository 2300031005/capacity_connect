const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Enrollment = require('./models/Enrollment');
const Assessment = require('./models/Assessment');
const QuizAttempt = require('./models/QuizAttempt');
const Certificate = require('./models/Certificate');
const Skill = require('./models/Skill');
const Competency = require('./models/Competency');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/capacity_connect';

async function testSkillAttainmentWorkflow() {
  console.log('================================================================');
  console.log('--- STRICT VERIFICATION: SKILL ATTAINMENT UPON PASSED FINAL ---');
  console.log('================================================================\n');

  await mongoose.connect(MONGO_URI);

  try {
    const trainer = await User.findOne({ role: 'trainer' });
    const trainee = await User.findOne({ role: 'trainee' });

    if (!trainer || !trainee) {
      throw new Error('Test trainer or trainee not found');
    }

    // 1. Create unique skills for this test
    const timestamp = Date.now();
    const skillA = await Skill.create({
      name: `Strict Skill A ${timestamp}`,
      normalizedName: `strict skill a ${timestamp}`.toLowerCase().trim(),
      category: 'Technical',
      description: 'Skill A test',
      isActive: true,
    });
    const skillB = await Skill.create({
      name: `Strict Skill B ${timestamp}`,
      normalizedName: `strict skill b ${timestamp}`.toLowerCase().trim(),
      category: 'Technical',
      description: 'Skill B test',
      isActive: true,
    });

    // 2. Create Competency requiring Skill A & Skill B
    const competency = await Competency.create({
      name: `Strict Competency ${timestamp}`,
      description: 'Requires Skill A and Skill B',
      skills: [skillA._id, skillB._id],
      isActive: true,
    });

    // 3. Create Course with Skill A & Skill B and 2 modules
    const course = await Course.create({
      title: `Strict Verification Course ${timestamp}`,
      description: 'Course requiring final assessment to attain skills',
      category: 'Engineering',
      level: 'intermediate',
      trainer: trainer._id,
      skills: [skillA._id, skillB._id],
      status: 'published',
    });

    const module1 = await Module.create({
      course: course._id,
      title: 'Module 1',
      order: 1,
    });
    const module2 = await Module.create({
      course: course._id,
      title: 'Module 2',
      order: 2,
    });

    // 4. Create Published Final Assessment
    const finalAssessment = await Assessment.create({
      course: course._id,
      type: 'final',
      title: 'Final Mastery Assessment',
      passingPercentage: 70,
      questions: [
        {
          questionText: 'Is passing the final assessment required to attain skills?',
          optionA: 'Yes, mandatory requirement',
          optionB: 'No, enrollment is enough',
          optionC: 'No, only module completion is needed',
          optionD: 'None of the above',
          correctOption: 'A',
          marks: 10,
        },
      ],
      status: 'published',
    });

    console.log(`✓ Created Course "${course.title}" with 2 Skills & Published Final Assessment.`);

    // 5. Enroll trainee
    const enrollment = await Enrollment.create({
      trainee: trainee._id,
      course: course._id,
      status: 'active',
      progress: 0,
      completedModules: [],
    });

    // ==============================================================
    // STEP 1: Trainee is enrolled with 0% progress
    // ==============================================================
    console.log('\nSTEP 1: Trainee Enrolled (0% Progress)');
    let { getMySkills, getMyCompetencies } = require('./controllers/traineeSkillController');

    // Simulate GET /api/trainees/me/skills
    let mockReq = { user: trainee };
    let skillsResponseData = null;
    let mockRes = {
      status: () => ({
        json: (data) => {
          skillsResponseData = data.data;
        },
      }),
    };

    await getMySkills(mockReq, mockRes, () => {});
    let skillAProfile = skillsResponseData.find((s) => s._id.toString() === skillA._id.toString());
    console.log(`Skill A Status: "${skillAProfile.status}"`);
    if (skillAProfile.status !== 'Learning') {
      throw new Error(`FAILED STEP 1: Expected "Learning", got "${skillAProfile.status}"`);
    }
    console.log('✓ PASS: Trainee has NOT attained the skill (Status is "Learning").');

    // ==============================================================
    // STEP 2: Trainee completes all modules (100% progress), but hasn't taken Final Assessment
    // ==============================================================
    console.log('\nSTEP 2: Trainee Completed 100% Modules (Final Assessment Pending)');
    enrollment.completedModules = [module1._id.toString(), module2._id.toString()];
    enrollment.progress = 100;
    enrollment.status = 'active'; // Still active because final assessment is pending
    await enrollment.save();

    await getMySkills(mockReq, mockRes, () => {});
    skillAProfile = skillsResponseData.find((s) => s._id.toString() === skillA._id.toString());
    console.log(`Skill A Status: "${skillAProfile.status}"`);
    if (skillAProfile.status !== 'Learning') {
      throw new Error(`FAILED STEP 2: Expected "Learning", got "${skillAProfile.status}"`);
    }
    console.log('✓ PASS: Even at 100% module progress, skills remain "Learning" because final assessment is not passed.');

    // ==============================================================
    // STEP 3: Trainee fails Final Assessment (e.g. 0%)
    // ==============================================================
    console.log('\nSTEP 3: Trainee Takes and FAILS Final Assessment');
    await QuizAttempt.create({
      trainee: trainee._id,
      assessment: finalAssessment._id,
      course: course._id,
      type: 'final',
      answers: [
        {
          question: finalAssessment.questions[0]._id,
          questionText: finalAssessment.questions[0].questionText,
          selectedOption: 'B',
          correctOption: 'A',
          isCorrect: false,
          marksObtained: 0,
        },
      ],
      score: 0,
      totalMarks: 10,
      percentage: 0,
      passed: false,
    });

    await getMySkills(mockReq, mockRes, () => {});
    skillAProfile = skillsResponseData.find((s) => s._id.toString() === skillA._id.toString());
    console.log(`Skill A Status: "${skillAProfile.status}"`);
    if (skillAProfile.status !== 'Learning') {
      throw new Error(`FAILED STEP 3: Expected "Learning", got "${skillAProfile.status}"`);
    }
    console.log('✓ PASS: Trainee failed final assessment. Skills remain strictly "Learning" (NOT attained).');

    // ==============================================================
    // STEP 4: Trainee retakes and PASSES Final Assessment (100%)
    // ==============================================================
    console.log('\nSTEP 4: Trainee Retakes and PASSES Final Assessment');
    const passedAttempt = await QuizAttempt.create({
      trainee: trainee._id,
      assessment: finalAssessment._id,
      course: course._id,
      type: 'final',
      answers: [
        {
          question: finalAssessment.questions[0]._id,
          questionText: finalAssessment.questions[0].questionText,
          selectedOption: 'A',
          correctOption: 'A',
          isCorrect: true,
          marksObtained: 10,
        },
      ],
      score: 10,
      totalMarks: 10,
      percentage: 100,
      passed: true,
    });

    // Enrollment completed
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
    await enrollment.save();

    await getMySkills(mockReq, mockRes, () => {});
    skillAProfile = skillsResponseData.find((s) => s._id.toString() === skillA._id.toString());
    const skillBProfile = skillsResponseData.find((s) => s._id.toString() === skillB._id.toString());
    console.log(`Skill A Status: "${skillAProfile.status}"`);
    console.log(`Skill B Status: "${skillBProfile.status}"`);
    if (skillAProfile.status !== 'Course Completed' || skillBProfile.status !== 'Course Completed') {
      throw new Error(`FAILED STEP 4: Expected "Course Completed", got "${skillAProfile.status}"`);
    }
    console.log('✓ PASS: After PASSING final assessment, trainee attains the skills ("Course Completed").');

    // ==============================================================
    // STEP 5: Check Trainee Competency Checklist
    // ==============================================================
    console.log('\nSTEP 5: Check Competency Checklist Evaluation');
    let compResponseData = null;
    let mockCompRes = {
      status: () => ({
        json: (data) => {
          compResponseData = data.data;
        },
      }),
    };

    await getMyCompetencies(mockReq, mockCompRes, () => {});
    const myComp = compResponseData.find((c) => c._id.toString() === competency._id.toString());
    console.log(`Competency Name: "${myComp.name}"`);
    console.log(`Competency Status: "${myComp.status}"`);
    console.log(`Acquired Skills Count: ${myComp.completedSkillsCount} / ${myComp.totalRequiredSkills}`);

    if (myComp.status !== 'Completed' || myComp.completedSkillsCount !== 2) {
      throw new Error(`FAILED STEP 5: Expected Competency "Completed", got "${myComp.status}"`);
    }
    console.log('✓ PASS: Competency fully satisfied (Status: "Completed", 2/2 skills Acquired ✓).');

    console.log('\n================================================================');
    console.log('🎉 VERIFICATION SUCCEEDED: SKILLS ARE STRICTLY GATED BY FINAL ASSESSMENT!');
    console.log('================================================================\n');
  } finally {
    await mongoose.disconnect();
  }
}

testSkillAttainmentWorkflow().catch((err) => {
  console.error('❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
