/**
 * Capacity Connect — Course AI Doubt Assistant Automated Test Suite
 * Validates in-course contextual doubts chatbot Q&A endpoint
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Skill = require('../models/Skill');
const { connectDB } = require('../config/db');
const { answerCourseDoubt, generateFallbackCourseDoubt } = require('../services/openaiService');

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 Starting Course AI Doubt Assistant Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    await connectDB();

    // 1. Test fallback answer generation unit test
    console.log('--- Test 1: Deterministic Fallback Unit Test ---');
    const mockCourse = {
      title: 'Full Stack Modern Web Development',
      category: 'Web Development',
      level: 'intermediate',
      description: 'Master React, Node.js, Express, and MongoDB.',
      skills: ['React.js', 'Node.js', 'REST API Architecture'],
      modules: [
        { title: 'Module 1: React Fundamentals', description: 'Components, state, and props.' },
        { title: 'Module 2: Node.js and Express', description: 'Server architecture and routing.' },
      ],
    };

    const overviewFallback = generateFallbackCourseDoubt({
      course: mockCourse,
      question: 'Can you summarize this course?',
      traineeName: 'Alex',
    });

    assert(
      overviewFallback && overviewFallback.answer.includes('Course Overview') && overviewFallback.suggestedFollowUps.length > 0,
      'Generates structured course overview fallback with suggested follow-ups'
    );

    const moduleFallback = generateFallbackCourseDoubt({
      course: mockCourse,
      question: 'What is covered in Module 1: React Fundamentals?',
      traineeName: 'Alex',
    });

    assert(
      moduleFallback && moduleFallback.answer.includes('Module Focus') && moduleFallback.answer.includes('React Fundamentals'),
      'Identifies specific module keyword and returns contextual module guidance'
    );

    const quizFallback = generateFallbackCourseDoubt({
      course: mockCourse,
      question: 'How do I pass the final assessment quiz and get my certificate?',
      traineeName: 'Alex',
    });

    assert(
      quizFallback && quizFallback.answer.includes('80%') && quizFallback.answer.includes('Certificate'),
      'Provides accurate certification and passing threshold details in assessment fallback'
    );

    // 2. Test answerCourseDoubt service function
    console.log('\n--- Test 2: AI / Fallback Service Execution ---');
    const serviceRes = await answerCourseDoubt({
      course: mockCourse,
      question: 'How do I build a REST API in Node.js?',
      history: [],
      traineeName: 'Alex',
    });

    assert(
      serviceRes && typeof serviceRes.answer === 'string' && serviceRes.answer.length > 20,
      'Service returns comprehensive answer string',
      serviceRes?.answer?.slice(0, 60)
    );
    assert(
      Array.isArray(serviceRes.suggestedFollowUps),
      'Service returns suggested follow-ups array'
    );

    // 3. Database Course Integration
    console.log('\n--- Test 3: Database Course Integration ---');
    const existingCourse = await Course.findOne({ status: 'published' });
    if (existingCourse) {
      const courseModules = await Module.find({ course: existingCourse._id });
      const courseObj = existingCourse.toObject ? existingCourse.toObject() : { ...existingCourse };
      courseObj.modules = courseModules;

      const dbCourseRes = await answerCourseDoubt({
        course: courseObj,
        question: 'What skills will I develop in this course?',
        history: [],
        traineeName: 'Trainee User',
      });

      assert(
        dbCourseRes && dbCourseRes.answer.length > 0,
        `Resolves doubt for database course: "${existingCourse.title}"`
      );
    } else {
      console.log('  ⚠️ Notice: No published course in DB to test DB lookup, skipping.');
    }

  } catch (err) {
    console.error('Unhandled test suite error:', err);
    failed++;
  } finally {
    console.log('\n====================================================');
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
