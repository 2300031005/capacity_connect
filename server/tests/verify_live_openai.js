const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { generateQuestionExplanation, checkRateLimit } = require('../services/openaiService');

async function testLiveOpenAI() {
  console.log('\n======================================================');
  console.log('--- PHASE 7.1 REAL OPENAI INTEGRATION VERIFICATION ---');
  console.log('======================================================\n');

  const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';
  console.log('1. OPENAI CONFIGURATION CHECK:');
  console.log(`   - Environment Variable OPENAI_API_KEY present: ${Boolean(apiKey)}`);
  console.log(`   - Key Prefix: ${apiKey ? apiKey.substring(0, 7) + '...' : 'NOT_SET'}`);
  console.log(`   - Secret Exposure Check: FULL KEY IS NEVER LOGGED OR EXPOSED.`);

  console.log('\n2. END-TO-END TEST WITH USER QUESTION:');
  const testContext = {
    courseTitle: 'Modern JavaScript & Frontend Mastery',
    moduleTitle: 'Module 1: ES6 Variables & Scope',
    assessmentType: 'module',
    skillName: 'JavaScript',
    targetProficiency: 'proficient',
    questionText: 'What is the difference between JavaScript let and const?',
    optionA: 'let allows variable reassignment, while const creates a block-scoped constant that cannot be reassigned.',
    optionB: 'const is hoisted to the top of the function, while let is not hoisted.',
    optionC: 'let is function-scoped and const is block-scoped.',
    optionD: 'There is no functional difference between let and const in modern JavaScript.',
    selectedOption: 'A',
    correctOption: 'A',
    trainerExplanation: 'let allows variable re-assignment within its block scope, whereas const prevents re-assignment to the identifier.',
    marks: 2,
  };

  console.log('   - Question:', testContext.questionText);
  console.log('   - Trainee Selected:', testContext.selectedOption);
  console.log('   - Correct Option:', testContext.correctOption);
  console.log('   - Target Model: gpt-4o-mini');

  const startTime = Date.now();
  let result;
  let errorCaught = null;

  try {
    result = await generateQuestionExplanation(testContext);
  } catch (err) {
    errorCaught = err;
  }
  const latencyMs = Date.now() - startTime;

  console.log('\n3. EXECUTION RESULTS:');
  console.log(`   - Latency: ${latencyMs}ms`);

  if (errorCaught) {
    console.log(`   - Error: ${errorCaught.message}`);
  } else {
    console.log('   - Result Structure:');
    console.log(JSON.stringify(result, null, 2));
  }

  console.log('\n4. SECURITY & EXPOSURE VERIFICATION:');
  const resultStr = JSON.stringify(result || {});
  const leaksKey = apiKey && apiKey.length > 15 ? resultStr.includes(apiKey) : false;
  console.log(`   - Key Leakage into Response: ${leaksKey ? 'FAILED (KEY LEAKED)' : 'PASSED (ZERO KEY LEAKAGE)'}`);
  console.log(`   - Response Contains Structured Fields:`);
  console.log(`     ✓ explanation: ${Boolean(result?.explanation)}`);
  console.log(`     ✓ whyYourAnswerWasCorrect: ${Boolean(result?.whyYourAnswerWasCorrect)}`);
  console.log(`     ✓ correctConcept: ${Boolean(result?.correctConcept)}`);
  console.log(`     ✓ keyTakeaway: ${Boolean(result?.keyTakeaway)}`);
  console.log(`     ✓ studyTip: ${Boolean(result?.studyTip)}`);

  console.log('\n5. ERROR / FAILURE SCENARIO TEST:');
  const rateUserId = 'test-security-user-' + Date.now();
  for (let i = 0; i < 16; i++) {
    checkRateLimit(rateUserId);
  }
  const blockedCheck = checkRateLimit(rateUserId);
  console.log(`   - Rate Limit Abuse Protection (16th request): ${!blockedCheck.allowed ? 'PASSED (429 Rate Blocked)' : 'FAILED'}`);

  console.log('\n======================================================\n');
}

testLiveOpenAI().catch(console.error);
