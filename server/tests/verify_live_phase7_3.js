const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
  generateCourseRecommendations,
  generateSkillGuidance,
  generateCourseRationale,
} = require('../services/openaiService');

async function verifyLivePhase73() {
  console.log('\n=============================================================');
  console.log('--- PHASE 7.3 REAL OPENAI RECOMMENDATION HUB & ACTIONS TEST ---');
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
    learningSkills: [
      { name: 'Node.js', targetProficiency: 'proficient', courseTitle: 'Backend Architecture', progress: 50 },
    ],
    competencies: [
      {
        name: 'Full Stack Cloud Engineer',
        demonstratedPercentage: 67,
        status: 'In Progress',
        missingSkills: ['Docker & Containers'],
      },
    ],
    assessmentSummary: {
      totalAttempts: 6,
      passRate: 83,
      avgScore: 82,
      weakAreas: ['Cloud Infrastructure'],
    },
    completedCoursesCount: 2,
  };

  const candidateCourses = [
    {
      _id: new mongoose.Types.ObjectId('672000000000000000000001'),
      title: 'Docker & Kubernetes Cloud Engineering',
      category: 'DevOps',
      level: 'intermediate',
      description: 'Master containerization and cloud orchestration for enterprise applications.',
      skills: [{ name: 'Docker & Containers', proficiency: 'proficient' }],
      averageRating: 4.9,
    },
    {
      _id: new mongoose.Types.ObjectId('672000000000000000000002'),
      title: 'Advanced React Design Patterns',
      category: 'Frontend',
      level: 'advanced',
      description: 'Master concurrent React and advanced state management architecture.',
      skills: [{ name: 'React', proficiency: 'advanced' }],
      averageRating: 4.8,
    },
  ];

  // Test 1: Hub Generation
  console.log('\n2. RECOMMENDATION HUB GENERATION (gpt-4o-mini / Fallback):');
  const t0 = Date.now();
  const hubResult = await generateCourseRecommendations({ traineeContext, candidateCourses });
  const hubLatency = Date.now() - t0;
  console.log(`   - Latency: ${hubLatency}ms`);
  console.log(`   - Recommended Courses: ${hubResult.recommendations?.length || 0}`);
  console.log(`   - Skills to Develop: ${hubResult.skillsToDevelop?.length || 0}`);
  console.log(`   - Assessment Insights: ${hubResult.assessmentInsights?.length || 0}`);
  console.log(`   - Suggested Next Steps: ${hubResult.nextSteps?.length || 0}`);

  // Test 2: Skill Guidance
  console.log('\n3. CONTEXTUAL SKILL GUIDANCE (React: Beginner -> Advanced):');
  const t1 = Date.now();
  const skillGuidance = await generateSkillGuidance({
    traineeContext,
    skillName: 'React',
    currentProficiency: 'Beginner',
    targetProficiency: 'Advanced',
    mappedCourses: candidateCourses,
  });
  const skillLatency = Date.now() - t1;
  console.log(`   - Latency: ${skillLatency}ms`);
  console.log(`   - Roadmap Title: "${skillGuidance.roadmapTitle}"`);
  console.log(`   - Actions Count: ${skillGuidance.recommendedActions?.length || 0}`);

  // Test 3: Course Rationale
  console.log('\n4. CONTEXTUAL COURSE RATIONALE (Docker Course):');
  const t2 = Date.now();
  const courseRationale = await generateCourseRationale({
    traineeContext,
    course: candidateCourses[0],
  });
  const courseLatency = Date.now() - t2;
  console.log(`   - Latency: ${courseLatency}ms`);
  console.log(`   - Fit Headline: "${courseRationale.fitHeadline}"`);
  console.log(`   - Why Recommended: "${courseRationale.whyRecommended}"`);

  // Security Check
  console.log('\n5. SECURITY & SECRET AUDIT:');
  const allJson = JSON.stringify({ hubResult, skillGuidance, courseRationale });
  const leaks = apiKey && apiKey.length > 15 ? allJson.includes(apiKey) : false;
  console.log(`   - Key Leakage in Responses: ${leaks ? 'FAILED' : 'PASSED (0 Secrets Exposed)'}`);
  console.log('\n=============================================================\n');
}

verifyLivePhase73().catch(console.error);
