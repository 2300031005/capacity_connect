import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Sparkles, 
  User, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight,
  Layers,
  FileCheck,
  BarChart3,
  Bell,
  Brain,
  HelpCircle,
  Award,
  Compass,
  ArrowDown
} from 'lucide-react';

const HomePage = () => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="home" className="space-y-20 sm:space-y-28 py-10 sm:py-16">
      {/* ==================================================
          SECTION 2 — HERO
          ================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Small badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Institutional Digital Skilling & Competency Platform</span>
            </div>

            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Bridge Skill Gaps. <br className="hidden sm:inline" />
              <span className="text-blue-600 dark:text-blue-400">Verify Real Competency.</span>
            </h1>

            {/* Supporting text */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              <strong>Cognisphere</strong> is an intelligent capacity building platform that connects dynamic curriculum delivery, automated evaluation, skill gap diagnostics, and role-based training governance in one unified platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/login"
                className="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-all inline-flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="px-5 py-2.5 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
              >
                Explore Platform
              </button>
            </div>
          </div>

          {/* Right Hero: Compact Platform-Preview Mockup */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm max-w-md mx-auto lg:max-w-none space-y-4">
              {/* Preview Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Competency Intelligence
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Live Preview</span>
              </div>

              {/* Progress Summary */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Curriculum Progress</span>
                  <span className="text-blue-600 dark:text-blue-400">78% Verified</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              {/* Verified Competencies */}
              <div className="space-y-2 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">React & Modern UI</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    Demonstrated
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">REST API & Backend</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300">
                    In Progress
                  </span>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Next Action: Final Assessment</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                  <span>Start Exam</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 3 — WHAT IS CAPACITY CONNECT
          ================================================== */}
      <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-3xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            One Platform for Continuous Capacity Building
          </h2>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Capacity Connect is a digital learning and capacity-building platform designed to connect training, assessment and competency development in one continuous journey.
          </p>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Instead of simply completing courses, learners can understand their current skill level, identify competency gaps and receive personalized learning recommendations.
          </p>
        </div>

        {/* Four Concepts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Learn */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-10 h-10 rounded bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Learn</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Access structured courses and resources.
            </p>
          </div>

          {/* Assess */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Assess</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Measure knowledge through assessments.
            </p>
          </div>

          {/* Measure */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-10 h-10 rounded bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Measure</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Track competencies and skill development.
            </p>
          </div>

          {/* Improve */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-10 h-10 rounded bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Improve</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Identify gaps and follow personalized learning paths.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 4 — HOW IT WORKS
          ================================================== */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="border-b border-slate-200 pb-4 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            From Learning to Measurable Growth
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            A continuous four-stage methodology transforming raw study into verified competency.
          </p>
        </div>

        {/* 4 Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 block mb-2">
                01 — Learn
              </span>
              <h3 className="text-base font-bold text-slate-900">Learn</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Access courses, modules and learning resources curated by trainers.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 block mb-2">
                02 — Assess
              </span>
              <h3 className="text-base font-bold text-slate-900">Assess</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Test knowledge through structured quizzes and assessments.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 block mb-2">
                03 — Identify
              </span>
              <h3 className="text-base font-bold text-slate-900">Identify</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Convert assessment performance into competency levels and identify skill gaps.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-slate-200 rounded p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 block mb-2">
                04 — Improve
              </span>
              <h3 className="text-base font-bold text-slate-900">Improve</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Receive personalized recommendations to strengthen areas that need improvement.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Flow Representation */}
        <div className="bg-slate-900 text-white rounded-lg p-6 sm:p-8">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block mb-4 text-center sm:text-left">
            Continuous Capacity Building Cycle
          </span>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
            <div className="px-3 py-2 rounded bg-slate-800 border border-slate-700 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-bold tracking-wide">LEARN</span>
            </div>
            <span className="text-slate-500 font-bold hidden sm:inline">&rarr;</span>
            <span className="text-slate-500 font-bold sm:hidden">&darr;</span>

            <div className="px-3 py-2 rounded bg-slate-800 border border-slate-700 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-bold tracking-wide">ASSESS</span>
            </div>
            <span className="text-slate-500 font-bold hidden sm:inline">&rarr;</span>
            <span className="text-slate-500 font-bold sm:hidden">&darr;</span>

            <div className="px-3 py-2 rounded bg-slate-800 border border-slate-700 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-bold tracking-wide">IDENTIFY GAPS</span>
            </div>
            <span className="text-slate-500 font-bold hidden sm:inline">&rarr;</span>
            <span className="text-slate-500 font-bold sm:hidden">&darr;</span>

            <div className="px-3 py-2 rounded bg-slate-800 border border-slate-700 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-bold tracking-wide">PERSONALIZED LEARNING</span>
            </div>
            <span className="text-slate-500 font-bold hidden sm:inline">&rarr;</span>
            <span className="text-slate-500 font-bold sm:hidden">&darr;</span>

            <div className="px-3 py-2 rounded bg-emerald-600 border border-emerald-500 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-bold tracking-wide text-white">IMPROVED COMPETENCY</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 5 — KEY CAPABILITIES
          ================================================== */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="border-b border-slate-200 pb-4 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Everything Needed for Effective Capacity Building
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Integrated tooling designed specifically for competency mapping and outcome tracking.
          </p>
        </div>

        {/* 6 Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Structured Learning */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-10 h-10 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Structured Learning</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Courses, modules and learning resources organized into clear learning paths.
            </p>
          </div>

          {/* 2. Assessments */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-10 h-10 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Assessments</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              MCQ-based assessments with automatic scoring and performance tracking.
            </p>
          </div>

          {/* 3. Competency Mapping */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-10 h-10 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Competency Mapping</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Map learner performance to skills and competency levels.
            </p>
          </div>

          {/* 4. Progress & Analytics */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-10 h-10 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Progress & Analytics</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Understand learning progress, assessment performance and competency growth.
            </p>
          </div>

          {/* 5. Skill Gap Analysis */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-10 h-10 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Skill Gap Analysis</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Identify the difference between current competency and required skills for a target role.
            </p>
          </div>

          {/* 6. Notifications */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-10 h-10 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Notifications</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Keep learners and trainers informed about learning activities and important updates.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 6 — AI
          ================================================== */}
      <section id="ai" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="bg-slate-900 text-white rounded-lg p-8 sm:p-10 border border-slate-800">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800 mb-3">
              <Brain className="w-3.5 h-3.5" />
              <span>Intelligent Assistance Layer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              AI That Personalizes the Learning Journey
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
              Capacity Connect uses AI as an intelligent assistance layer to make learning more personalized, efficient and actionable.
            </p>
          </div>

          {/* 3 AI Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* 1. AI Learning Recommendations */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded p-6">
              <h3 className="text-base font-bold text-white mb-2">
                AI Learning Recommendations
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Analyze learner competencies, skill gaps and learning history to suggest relevant courses and learning paths.
              </p>
            </div>

            {/* 2. AI Quiz Generation */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded p-6">
              <h3 className="text-base font-bold text-white mb-2">
                AI Quiz Generation
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Trainers can generate draft assessment questions using AI and review them before publishing.
              </p>
            </div>

            {/* 3. AI Learning Assistant */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded p-6">
              <h3 className="text-base font-bold text-white mb-2">
                AI Learning Assistant
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Learners can ask questions, clarify concepts and get concise explanations while learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 7 — ROLES
          ================================================== */}
      <section id="roles" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="border-b border-slate-200 pb-4 mb-10 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            One Platform. Three Connected Roles.
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Unified workflows tailored for every stakeholder in the capacity building ecosystem.
          </p>
        </div>

        {/* 3 Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TRAINEE */}
          <div className="bg-white border border-slate-200 rounded p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">TRAINEE</h3>
              <p className="text-xs font-semibold text-blue-700 mt-1 mb-4">Learn. Assess. Improve.</p>
              
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Discover courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Enroll and learn</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Take assessments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Track progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>View competencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Identify skill gaps</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Get AI recommendations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* TRAINER */}
          <div className="bg-white border border-slate-200 rounded p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">TRAINER</h3>
              <p className="text-xs font-semibold text-teal-700 mt-1 mb-4">Create. Guide. Evaluate.</p>
              
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Create courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Organize learning resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Create assessments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Generate AI-assisted quizzes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Review learner performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Track competencies</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ADMIN */}
          <div className="bg-white border border-slate-200 rounded p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">ADMIN</h3>
              <p className="text-xs font-semibold text-emerald-700 mt-1 mb-4">Manage. Monitor. Improve.</p>
              
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Manage users</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Manage trainers and trainees</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Monitor courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>View platform analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Manage competency structures</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 8 — MEASURABLE OUTCOMES
          ================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-4 mb-10 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Turn Learning Activity into Measurable Outcomes
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Quantifiable indicators establishing true mastery and job readiness.
          </p>
        </div>

        {/* 4 Concepts (No fake stats!) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Learning Progress */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Learning Progress</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Track course milestone completion, module progress, and resource utilization over time.
            </p>
          </div>

          {/* 2. Assessment Performance */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Assessment Performance</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Objective scoring, quiz analytics, and comprehension benchmarks across subjects.
            </p>
          </div>

          {/* 3. Competency Level */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Competency Level</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Graduated mastery mapping (Basic, Intermediate, Advanced) across technical and domain skills.
            </p>
          </div>

          {/* 4. Skill Gap */}
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Skill Gap</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Clear diagnostic gap visibility between current abilities and target role requirements.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 9 — FINAL CTA
          ================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-lg p-8 sm:p-12 text-center border border-slate-800">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ready to Build Your Next Skill?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-xl mx-auto leading-relaxed">
            Start your learning journey with a platform that connects learning, assessment and competency development.
          </p>
          
          <div className="mt-8">
            <Link
              to="/login"
              className="px-6 py-3 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors inline-flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-6 tracking-wide">
            Learn &bull; Assess &bull; Measure &bull; Improve
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
