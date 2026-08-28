const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
  generateLearningPath,
  generateFallbackLearningPath,
} = require('../services/openaiService');

async function verifyLivePhase74() {
  console.log('\n=============================================================');
  console.log('--- PHASE 7.4 REAL OPENAI PERSONALIZED LEARNING PATH TEST ---');
  console.log('=============================================================\n');

  const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';
  console.log('1. OPENAI CONFIGURATION CHECK:');
  console.log(`   - Environment Variable OPENAI_API_KEY present: ${Boolean(apiKey)}`);
  console.log(`   - Key Prefix: ${apiKey ? apiKey.substring(0, 7) + '...' : 'NOT_SET'}`);
  console.log(`   - Secret Protection: FULL KEY IS NEVER LOGGED OR COMMITTED.`);

  // 2. Trainee Learning Profile
  const traineeContext = {
    verifiedSkills: [
      { name: 'JavaScript', highestProficiency: 'proficient', category: 'Software Engineering' },
      { name: 'React', highestProficiency: 'beginner', category: 'Frontend' },
    ],
    competencies: [
      {
        name: 'Full Stack Cloud Engineer',
        demonstratedPercentage: 67,
        status: 'In Progress',
        missingSkills: ['Docker & Containers', 'Kubernetes'],
      },
    ],
    assessmentSummary: {
      totalAttempts: 5,
      passRate: 80,
      avgScore: 82,
      weakAreas: ['Container Operations'],
    },
    completedCoursesCount: 2,
  };

  const activeCourses = [
    {
      _id: new mongoose.Types.ObjectId('672000000000000000000010'),
      title: 'Advanced React State Management',
      progress: 60,
      skills: [{ name: 'React', proficiency: 'proficient' }],
    },
  ];

  const candidateCourses = [
    {
      _id: new mongoose.Types.ObjectId('672000000000000000000011'),
      title: 'Production Docker & Microservices',
      category: 'DevOps',
      level: 'intermediate',
      description: 'Master container packaging and microservices deployment.',
      skills: [{ name: 'Docker & Containers', proficiency: 'proficient' }],
      averageRating: 4.9,
    },
    {
      _id: new mongoose.Types.ObjectId('672000000000000000000012'),
      title: 'Kubernetes Cloud Architecture',
      category: 'Cloud',
      level: 'advanced',
      description: 'Deploy resilient container clusters at scale.',
      skills: [{ name: 'Kubernetes', proficiency: 'advanced' }],
      averageRating: 4.95,
    },
  ];

  // Test 1: Real Learning Path Generation
  console.log('\n2. LEARNING PATH GENERATION (gpt-4o-mini / Fallback):');
  const t0 = Date.now();
  const pathResult = await generateLearningPath({
    traineeContext,
    candidateCourses,
    activeCourses,
    completedCourses: [],
  });
  const latency = Date.now() - t0;
  console.log(`   - Latency: ${latency}ms`);
  console.log(`   - Goal: "${pathResult.goal}"`);
  console.log(`   - Summary: "${pathResult.summary}"`);
  console.log(`   - Sequenced Steps: ${pathResult.steps?.length || 0}`);

  pathResult.steps.forEach((s) => {
    console.log(`     [Step ${s.sequence}] [${s.status.toUpperCase()}] ${s.title} (Why: ${s.reason.slice(0, 60)}...)`);
  });

  // Security Check
  console.log('\n3. SECURITY & SECRET AUDIT:');
  const allJson = JSON.stringify(pathResult);
  const leaks = apiKey && apiKey.length > 15 ? allJson.includes(apiKey) : false;
  console.log(`   - Key Leakage in Responses: ${leaks ? 'FAILED' : 'PASSED (0 Secrets Exposed)'}`);
  console.log('\n=============================================================\n');
}

verifyLivePhase74().catch(console.error);
