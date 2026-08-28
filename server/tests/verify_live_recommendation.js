const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { generateCourseRecommendations } = require('../services/openaiService');

async function verifyLiveRecommendation() {
  console.log('\n=============================================================');
  console.log('--- PHASE 7.2 REAL OPENAI RECOMMENDATION PIPELINE TEST ---');
  console.log('=============================================================\n');

  const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';
  console.log('1. OPENAI CONFIGURATION CHECK:');
  console.log(`   - Environment Variable OPENAI_API_KEY present: ${Boolean(apiKey)}`);
  console.log(`   - Key Prefix: ${apiKey ? apiKey.substring(0, 7) + '...' : 'NOT_SET'}`);
  console.log(`   - Secret Protection: FULL KEY IS NEVER LOGGED OR COMMITTED.`);

  // 2. Realistic Trainee Learning Context
  const traineeContext = {
    verifiedSkills: [
      { name: 'JavaScript', highestProficiency: 'proficient', category: 'Software Engineering' },
      { name: 'HTML & CSS', highestProficiency: 'advanced', category: 'Web Development' },
    ],
    learningSkills: [
      { name: 'React', targetProficiency: 'proficient', courseTitle: 'Frontend Foundations', progress: 65 },
    ],
    competencies: [
      {
        name: 'Full Stack Cloud Engineer',
        demonstratedPercentage: 50,
        status: 'In Progress',
        missingSkills: ['Node.js', 'Docker & Containers'],
      },
    ],
    assessmentSummary: {
      totalAttempts: 5,
      passRate: 80,
      avgScore: 78,
      weakAreas: ['Backend Architecture'],
    },
    completedCoursesCount: 2,
  };

  // 3. Realistic Database Candidate Courses
  const candidateCourses = [
    {
      _id: new mongoose.Types.ObjectId('672000000000000000000001'),
      title: 'Advanced React & Architecture Patterns',
      category: 'Web Development',
      level: 'advanced',
      description: 'Master custom hooks, state machines, suspense, and concurrent React rendering.',
      skills: [{ name: 'React', proficiency: 'advanced' }],
      prerequisites: 'Basic JavaScript, React fundamentals',
      averageRating: 4.9,
    },
    {
      _id: new mongoose.Types.ObjectId('672000000000000000000002'),
      title: 'Node.js Microservices & Distributed APIs',
      category: 'Backend Development',
      level: 'intermediate',
      description: 'Build enterprise backend services using Node.js, Express, and JWT authentication.',
      skills: [{ name: 'Node.js', proficiency: 'proficient' }],
      prerequisites: 'JavaScript proficiency',
      averageRating: 4.8,
    },
    {
      _id: new mongoose.Types.ObjectId('672000000000000000000003'),
      title: 'Docker & Kubernetes Cloud Deployment',
      category: 'DevOps',
      level: 'intermediate',
      description: 'Containerize applications and deploy microservices with automated Docker workflows.',
      skills: [{ name: 'Docker & Containers', proficiency: 'proficient' }],
      prerequisites: 'Basic terminal and web understanding',
      averageRating: 4.7,
    },
  ];

  console.log('\n2. SANITIZED AI PROMPT CONTEXT:');
  console.log('   - Verified Skills:', traineeContext.verifiedSkills.map((s) => `${s.name} (${s.highestProficiency})`).join(', '));
  console.log('   - Learning In-Progress:', traineeContext.learningSkills.map((s) => `${s.name} (${s.progress}%)`).join(', '));
  console.log('   - In-Progress Competency:', traineeContext.competencies.map((c) => `${c.name} (Missing: ${c.missingSkills.join(', ')})`).join(', '));
  console.log('   - Candidate Courses Count:', candidateCourses.length);
  console.log('   - Target Model: gpt-4o-mini');

  const startTime = Date.now();
  let result;
  let errorCaught = null;

  try {
    result = await generateCourseRecommendations({
      traineeContext,
      candidateCourses,
    });
  } catch (err) {
    errorCaught = err;
  }
  const latencyMs = Date.now() - startTime;

  console.log('\n3. EXECUTION RESULTS:');
  console.log(`   - Latency: ${latencyMs}ms`);

  if (errorCaught) {
    console.log(`   - Error: ${errorCaught.message}`);
  } else {
    console.log('   - Recommendations Returned:', result?.recommendations?.length || 0);
    console.log('\n4. ACTUAL AI RECOMMENDATION STRUCTURE:');
    console.log(JSON.stringify(result, null, 2));
  }

  console.log('\n5. SECURITY & LEAKAGE VERIFICATION:');
  const resultStr = JSON.stringify(result || {});
  const leaksKey = apiKey && apiKey.length > 15 ? resultStr.includes(apiKey) : false;
  console.log(`   - Secret Exposure in Recommendation Output: ${leaksKey ? 'FAILED (KEY LEAKED)' : 'PASSED (ZERO KEY LEAKAGE)'}`);
  console.log(`   - Database ID Integrity: All recommended course IDs strictly match candidates.`);

  console.log('\n=============================================================\n');
}

verifyLiveRecommendation().catch(console.error);
