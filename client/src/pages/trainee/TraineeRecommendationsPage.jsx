import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAiCourseRecommendationsApi,
  getSkillAiGuidanceApi,
  getAiLearningPathApi,
  refreshAiLearningPathApi,
  getAiCareerGoalApi,
  setAiCareerGoalApi,
  getAiCareerRoadmapApi,
  refreshAiCareerRoadmapApi,
} from '../../services/api';
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  Target,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  FileCheck,
  Compass,
  Zap,
  ChevronRight,
  HelpCircle,
  X,
  Play,
  Lock,
  Milestone,
  Flame,
  Route,
  Edit3,
  Check,
  Briefcase,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';

const TraineeRecommendationsPage = () => {
  // Recommendation Hub Data (Phase 7.3)
  const [hubData, setHubData] = useState({
    recommendations: [],
    skillsToDevelop: [],
    assessmentInsights: [],
    nextSteps: [],
    traineeSummary: null,
    cached: false,
  });

  // Personalized Learning Path Data (Phase 7.4)
  const [learningPathData, setLearningPathData] = useState({
    goal: '',
    summary: '',
    steps: [],
    metrics: {
      totalSteps: 0,
      completedCount: 0,
      currentCount: 0,
      remainingCount: 0,
      progressPercentage: 0,
    },
    cached: false,
  });

  // AI Career Goal & Roadmap Data (Phase 7.4.1)
  const [careerGoalInput, setCareerGoalInput] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [careerRoadmapData, setCareerRoadmapData] = useState({
    careerGoal: '',
    targetCompetency: '',
    summary: '',
    skillGaps: [],
    stages: [],
    metrics: {
      totalStages: 0,
      completedStages: 0,
      currentStages: 0,
      remainingStages: 0,
      progressPercentage: 0,
    },
    cached: false,
  });

  const [loading, setLoading] = useState(true);
  const [refreshingHub, setRefreshingHub] = useState(false);
  const [refreshingPath, setRefreshingPath] = useState(false);
  const [refreshingRoadmap, setRefreshingRoadmap] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'career', 'path', 'courses', 'skills', 'insights', 'steps'

  // Skill guidance modal state
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillGuidance, setSkillGuidance] = useState(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  // Quick suggestion goal chips
  const goalSuggestions = [
    'Full Stack Developer',
    'Cloud & DevOps Engineer',
    'AI & Machine Learning Engineer',
    'Data Analyst',
    'Backend Microservices Architect',
  ];

  // Fetch all recommendations, learning path, and career roadmap
  const fetchAllData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshingHub(true);
        setRefreshingPath(true);
        setRefreshingRoadmap(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [hubRes, pathRes, goalRes, roadmapRes] = await Promise.allSettled([
        getAiCourseRecommendationsApi(isRefresh ? { refresh: 'true' } : {}),
        getAiLearningPathApi(isRefresh ? { refresh: 'true' } : {}),
        getAiCareerGoalApi(),
        getAiCareerRoadmapApi(isRefresh ? { refresh: 'true' } : {}),
      ]);

      if (hubRes.status === 'fulfilled' && hubRes.value?.success && hubRes.value.data) {
        setHubData({
          recommendations: hubRes.value.data.recommendations || [],
          skillsToDevelop: hubRes.value.data.skillsToDevelop || [],
          assessmentInsights: hubRes.value.data.assessmentInsights || [],
          nextSteps: hubRes.value.data.nextSteps || [],
          traineeSummary: hubRes.value.data.traineeSummary || null,
          cached: Boolean(hubRes.value.data.cached),
        });
      }

      if (pathRes.status === 'fulfilled' && pathRes.value?.success && pathRes.value.data) {
        setLearningPathData({
          goal: pathRes.value.data.goal || '',
          summary: pathRes.value.data.summary || '',
          steps: pathRes.value.data.steps || [],
          metrics: pathRes.value.data.metrics || {
            totalSteps: 0,
            completedCount: 0,
            currentCount: 0,
            remainingCount: 0,
            progressPercentage: 0,
          },
          cached: Boolean(pathRes.value.data.cached),
        });
      }

      if (goalRes.status === 'fulfilled' && goalRes.value?.success && goalRes.value.data) {
        const savedGoal = goalRes.value.data.careerGoal || '';
        setCareerGoalInput(savedGoal);
        if (!savedGoal) {
          setIsEditingGoal(true);
        }
      }

      if (roadmapRes.status === 'fulfilled' && roadmapRes.value?.success && roadmapRes.value.data) {
        setCareerRoadmapData({
          careerGoal: roadmapRes.value.data.careerGoal || '',
          targetCompetency: roadmapRes.value.data.targetCompetency || '',
          summary: roadmapRes.value.data.summary || '',
          skillGaps: roadmapRes.value.data.skillGaps || [],
          stages: roadmapRes.value.data.stages || [],
          metrics: roadmapRes.value.data.metrics || {
            totalStages: 0,
            completedStages: 0,
            currentStages: 0,
            remainingStages: 0,
            progressPercentage: 0,
          },
          cached: Boolean(roadmapRes.value.data.cached),
        });
        if (roadmapRes.value.data.careerGoal) {
          setCareerGoalInput(roadmapRes.value.data.careerGoal);
          setIsEditingGoal(false);
        }
      }
    } catch (err) {
      console.warn('Failed to load recommendations / roadmap:', err.message);
      setError('AI recommendations are temporarily unavailable. You can continue exploring the course catalog.');
    } finally {
      setLoading(false);
      setRefreshingHub(false);
      setRefreshingPath(false);
      setRefreshingRoadmap(false);
    }
  };

  // Submit Career Goal and Generate Roadmap
  const handleSaveGoalAndGenerateRoadmap = async (customGoal) => {
    const goalToSave = (customGoal || careerGoalInput || '').trim();
    if (!goalToSave) return;

    try {
      setSavingGoal(true);
      setRefreshingRoadmap(true);
      setError(null);

      // Save goal to trainee profile
      await setAiCareerGoalApi(goalToSave);
      setCareerGoalInput(goalToSave);
      setIsEditingGoal(false);

      // Generate roadmap
      const res = await refreshAiCareerRoadmapApi(goalToSave);
      if (res?.success && res.data) {
        setCareerRoadmapData({
          careerGoal: res.data.careerGoal || goalToSave,
          targetCompetency: res.data.targetCompetency || '',
          summary: res.data.summary || '',
          skillGaps: res.data.skillGaps || [],
          stages: res.data.stages || [],
          metrics: res.data.metrics || {
            totalStages: 0,
            completedStages: 0,
            currentStages: 0,
            remainingStages: 0,
            progressPercentage: 0,
          },
          cached: false,
        });
      }
    } catch (err) {
      console.warn('Failed to generate career roadmap:', err.message);
      setError('Could not generate career roadmap right now. Please try again.');
    } finally {
      setSavingGoal(false);
      setRefreshingRoadmap(false);
    }
  };

  // Single refresh for Career Roadmap
  const handleRefreshCareerRoadmap = async () => {
    try {
      setRefreshingRoadmap(true);
      const res = await refreshAiCareerRoadmapApi(careerRoadmapData.careerGoal || careerGoalInput);
      if (res?.success && res.data) {
        setCareerRoadmapData({
          careerGoal: res.data.careerGoal || '',
          targetCompetency: res.data.targetCompetency || '',
          summary: res.data.summary || '',
          skillGaps: res.data.skillGaps || [],
          stages: res.data.stages || [],
          metrics: res.data.metrics || {
            totalStages: 0,
            completedStages: 0,
            currentStages: 0,
            remainingStages: 0,
            progressPercentage: 0,
          },
          cached: false,
        });
      }
    } catch (err) {
      console.warn('Failed to refresh career roadmap:', err.message);
    } finally {
      setRefreshingRoadmap(false);
    }
  };

  // Single refresh for Learning Path (Phase 7.4)
  const handleRefreshLearningPath = async () => {
    try {
      setRefreshingPath(true);
      const res = await refreshAiLearningPathApi();
      if (res?.success && res.data) {
        setLearningPathData({
          goal: res.data.goal || '',
          summary: res.data.summary || '',
          steps: res.data.steps || [],
          metrics: res.data.metrics || {
            totalSteps: 0,
            completedCount: 0,
            currentCount: 0,
            remainingCount: 0,
            progressPercentage: 0,
          },
          cached: false,
        });
      }
    } catch (err) {
      console.warn('Failed to refresh learning path:', err.message);
    } finally {
      setRefreshingPath(false);
    }
  };

  const handleOpenSkillGuidance = async (skillItem) => {
    const sName = typeof skillItem === 'string' ? skillItem : skillItem.skill;
    setSelectedSkill(sName);
    setLoadingGuidance(true);
    setSkillGuidance(null);

    try {
      const res = await getSkillAiGuidanceApi(sName);
      if (res?.success && res.data) {
        setSkillGuidance(res.data);
      }
    } catch (err) {
      console.warn('Could not load skill guidance:', err.message);
    } finally {
      setLoadingGuidance(false);
    }
  };

  useEffect(() => {
    fetchAllData(false);
  }, []);

  const {
    recommendations = [],
    skillsToDevelop = [],
    assessmentInsights = [],
    nextSteps = [],
    traineeSummary = null,
    cached = false,
  } = hubData;

  const {
    goal: pathGoal,
    summary: pathSummary,
    steps: pathSteps = [],
    metrics: pathMetrics = {},
    cached: pathCached = false,
  } = learningPathData;

  const {
    careerGoal: activeCareerGoal,
    targetCompetency,
    summary: roadmapSummary,
    skillGaps = [],
    stages: roadmapStages = [],
    metrics: roadmapMetrics = {},
    cached: roadmapCached = false,
  } = careerRoadmapData;

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Profile Telemetry */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Learning Advisor & Career Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Career Roadmaps & Learning Trajectories
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Tell us your target career destination. Our AI maps your verified capabilities, diagnoses missing skills, and crafts an ordered path with published courses.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => fetchAllData(true)}
              disabled={refreshingHub || refreshingPath || refreshingRoadmap || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingHub || refreshingPath || refreshingRoadmap ? 'animate-spin' : ''}`} />
              <span>{refreshingHub || refreshingPath || refreshingRoadmap ? 'Refreshing...' : 'Refresh All AI'}</span>
            </button>
            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>All Courses</span>
            </Link>
          </div>
        </div>

        {/* Trainee Profile Telemetry Badges */}
        {traineeSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Verified Skills</span>
              <p className="text-lg font-bold text-slate-800">{traineeSummary.verifiedSkillsCount || 0}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Target Competencies</span>
              <p className="text-lg font-bold text-blue-700">{traineeSummary.inProgressCompetenciesCount || 0}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Completed Courses</span>
              <p className="text-lg font-bold text-emerald-700">{traineeSummary.completedCoursesCount || 0}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active In-Progress</span>
              <p className="text-lg font-bold text-amber-700">{traineeSummary.activeCoursesCount || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Recommendations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('career')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
            activeTab === 'career'
              ? 'bg-indigo-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Briefcase className="w-3 h-3" />
          <span>🎯 Career Roadmap ({roadmapStages.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('path')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
            activeTab === 'path'
              ? 'bg-teal-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Compass className="w-3 h-3" />
          <span>🧭 Learning Path ({pathSteps.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
            activeTab === 'courses'
              ? 'bg-emerald-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-3 h-3" />
          <span>Recommended Courses ({recommendations.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
            activeTab === 'skills'
              ? 'bg-blue-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Target className="w-3 h-3" />
          <span>Skills to Develop ({skillsToDevelop.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('insights')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
            activeTab === 'insights'
              ? 'bg-amber-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-3 h-3" />
          <span>Assessment Insights ({assessmentInsights.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('steps')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
            activeTab === 'steps'
              ? 'bg-violet-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Suggested Next Steps ({nextSteps.length})</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Synthesizing personalized career roadmap...</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Comparing your verified skills with career requirements and mapping each stage to real platform courses.
            </p>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {!loading && error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-1">
            <p className="font-semibold">{error}</p>
            <p>You can still explore all platform courses and tracks directly via the catalog.</p>
          </div>
        </div>
      )}

      {/* Main Hub Content */}
      {!loading && (
        <div className="space-y-12">
          {/* ========================================================================= */}
          {/* SECTION: 🎯 MY CAREER GOAL → PERSONALIZED LEARNING ROADMAP (Phase 7.4.1) */}
          {/* ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'career') && (
            <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-md space-y-6 border border-indigo-900/50">
              {/* Header & Goal Input / Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/40 pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Career Navigator</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span>🎯 My Career Goal & Learning Roadmap</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                    Tell us where you want to go. The AI evaluates your existing capabilities, identifies gaps, and charts a course sequence to achieve your career goal.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {activeCareerGoal && !isEditingGoal && (
                    <button
                      type="button"
                      onClick={() => setIsEditingGoal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 rounded text-xs font-semibold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Goal</span>
                    </button>
                  )}
                  {activeCareerGoal && (
                    <button
                      type="button"
                      onClick={handleRefreshCareerRoadmap}
                      disabled={refreshingRoadmap}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshingRoadmap ? 'animate-spin' : ''}`} />
                      <span>{refreshingRoadmap ? 'Recalculating...' : 'Refresh Roadmap'}</span>
                    </button>
                  )}
                  {roadmapCached && (
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                      Cached
                    </span>
                  )}
                </div>
              </div>

              {/* Goal Input Field / Edit Mode */}
              {isEditingGoal || !activeCareerGoal ? (
                <div className="bg-slate-900/80 border border-indigo-700/40 rounded-lg p-5 space-y-4">
                  <div>
                    <label htmlFor="careerGoalInput" className="block text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">
                      What is your target career destination?
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Enter any natural-language role or domain (e.g. &quot;Full Stack Developer&quot;, &quot;Cloud DevOps Engineer&quot;, &quot;AI Specialist&quot;).
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="careerGoalInput"
                        type="text"
                        value={careerGoalInput}
                        onChange={(e) => setCareerGoalInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveGoalAndGenerateRoadmap()}
                        placeholder="e.g. Full Stack Developer"
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-indigo-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveGoalAndGenerateRoadmap()}
                        disabled={savingGoal || !careerGoalInput.trim()}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${savingGoal ? 'animate-spin' : ''}`} />
                        <span>{savingGoal ? 'Generating...' : 'Generate My Roadmap'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400">Popular Career Goals:</span>
                    <div className="flex flex-wrap gap-2">
                      {goalSuggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => {
                            setCareerGoalInput(sug);
                            handleSaveGoalAndGenerateRoadmap(sug);
                          }}
                          className="px-2.5 py-1 bg-slate-800/80 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500 text-xs text-indigo-200 rounded-full transition-colors"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Goal Banner */
                <div className="bg-slate-900/80 border border-indigo-700/50 rounded-lg p-5 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">Target Career Destination</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {activeCareerGoal}
                      </h3>
                    </div>

                    {targetCompetency && (
                      <div className="bg-indigo-950/80 border border-indigo-600/40 rounded-md px-3.5 py-2 text-xs self-start md:self-auto">
                        <span className="text-[10px] uppercase font-bold text-indigo-300 block">Institutional Milestone Track</span>
                        <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{targetCompetency}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-indigo-900/50">
                    {roadmapSummary || `Personalized learning roadmap designed to guide you step-by-step toward becoming a ${activeCareerGoal}.`}
                  </p>

                  {/* Real-Time Database Progress Bar */}
                  <div className="pt-3 border-t border-indigo-900/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-indigo-200 font-semibold flex items-center gap-1.5">
                        <Route className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Overall Roadmap Progress: <strong>{roadmapMetrics.progressPercentage || 0}%</strong></span>
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Completed: <strong className="text-emerald-400">{roadmapMetrics.completedStages || 0}</strong></span>
                        <span>Current: <strong className="text-amber-400">{roadmapMetrics.currentStages || 0}</strong></span>
                        <span>Remaining: <strong className="text-slate-300">{roadmapMetrics.remainingStages || 0}</strong></span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
                        style={{ width: `${Math.min(roadmapMetrics.progressPercentage || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Skill Gap Analysis Strip */}
              {skillGaps.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Skill Gap Analysis for {activeCareerGoal}</span>
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> Demonstrated</span>
                      <span className="flex items-center gap-1"><span className="text-amber-400">🟡</span> In Progress</span>
                      <span className="flex items-center gap-1"><span className="text-slate-400">○</span> Missing</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {skillGaps.map((sg, gIdx) => {
                      const isDemo = sg.status === 'demonstrated';
                      const isInProg = sg.status === 'in_progress';

                      return (
                        <div
                          key={gIdx}
                          className={`border rounded-md p-2.5 text-xs flex flex-col justify-between gap-1.5 ${
                            isDemo
                              ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-100'
                              : isInProg
                              ? 'bg-amber-950/40 border-amber-600/40 text-amber-100'
                              : 'bg-slate-900/80 border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              {isDemo ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : isInProg ? (
                                <span className="text-amber-400 font-bold">🟡</span>
                              ) : (
                                <span className="text-slate-400 font-bold">○</span>
                              )}
                              <span>{sg.skillName}</span>
                            </span>
                            <span className="text-[10px] uppercase font-bold opacity-80">
                              {isDemo ? 'Verified' : isInProg ? 'Learning' : 'Required'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                            <span>Level: <strong className="text-slate-300">{sg.currentProficiency}</strong></span>
                            <span className="text-indigo-300">→ Target: {sg.requiredProficiency}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ordered Career Roadmap Skill Steps */}
              {activeCareerGoal && roadmapStages.length > 0 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Route className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ordered Skill Progression & Mapped Courses</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {roadmapStages.length} Sequential Milestones
                    </span>
                  </div>

                  <div className="space-y-4">
                    {roadmapStages.map((stage, idx) => {
                      const isLast = idx === roadmapStages.length - 1;
                      const orderNumber = String(stage.order || stage.sequence || idx + 1).padStart(2, '0');
                      const skillName = stage.skill || stage.skillName || `Skill ${idx + 1}`;
                      const isDemonstrated = stage.isDemonstrated || stage.status === 'Already Demonstrated' || stage.status === 'completed';
                      const isInProgress = stage.isCurrent || stage.status === 'In Progress' || stage.status === 'current';
                      const isNotStarted = !isDemonstrated && !isInProgress;

                      const course = stage.course || (Array.isArray(stage.courses) && stage.courses.length > 0 ? stage.courses[0] : null);
                      const isCourseAvailable = stage.courseAvailable !== undefined ? stage.courseAvailable : Boolean(course);

                      return (
                        <div key={idx} className="space-y-3">
                          <div
                            className={`border rounded-xl p-5 sm:p-6 transition-all space-y-4 ${
                              isInProgress
                                ? 'bg-slate-900/95 border-amber-500/60 ring-1 ring-amber-400/40 shadow-lg'
                                : isDemonstrated
                                ? 'bg-slate-900/80 border-emerald-500/50 opacity-95'
                                : isCourseAvailable
                                ? 'bg-slate-900/80 border-indigo-500/40'
                                : 'bg-slate-950/70 border-slate-800 opacity-90'
                            }`}
                          >
                            {/* Step Header: Order + Skill Name + Status */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3.5">
                                <div className="text-2xl sm:text-3xl font-black text-indigo-400/80 font-mono shrink-0">
                                  {orderNumber}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                      {skillName}
                                    </h3>
                                    <span
                                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider flex items-center gap-1 ${
                                        isDemonstrated
                                          ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                                          : isInProgress
                                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                                          : 'bg-slate-800 text-slate-400 border-slate-700'
                                      }`}
                                    >
                                      {isDemonstrated ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                                          <span>Already Demonstrated</span>
                                        </>
                                      ) : isInProgress ? (
                                        <>
                                          <span className="text-amber-400 font-bold">🟡</span>
                                          <span>In Progress</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-slate-400">○</span>
                                          <span>Not Started</span>
                                        </>
                                      )}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>
                                      Current:{' '}
                                      <strong className={isDemonstrated ? 'text-emerald-300' : isInProgress ? 'text-amber-300' : 'text-slate-300'}>
                                        {stage.currentProficiency || (isDemonstrated ? 'Proficient' : isInProgress ? 'Beginner' : 'Not Earned')}
                                      </strong>
                                    </span>
                                    <span>&bull;</span>
                                    <span className="text-indigo-300">
                                      Target: <strong>{stage.targetProficiency || 'Proficient'}</strong>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Why this skill is needed */}
                            <p className="text-xs text-slate-300 leading-relaxed pl-0 sm:pl-10">
                              {stage.reason || `Foundational milestone for your career progression as a ${activeCareerGoal}.`}
                            </p>

                            {/* Course Section (Database-Authoritative) */}
                            <div className="pl-0 sm:pl-10 pt-2 border-t border-indigo-900/40">
                              {isCourseAvailable && course ? (
                                <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-600/50 transition-colors">
                                  <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        <BookOpen className="w-3 h-3 text-indigo-400" />
                                        <span>Capacity Connect Course</span>
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        Level: <strong className="text-slate-200 uppercase">{course.level || 'Intermediate'}</strong>
                                      </span>
                                      {course.category && (
                                        <span className="text-[10px] text-slate-500">&bull; {course.category}</span>
                                      )}
                                    </div>

                                    <h4 className="text-sm font-bold text-white tracking-tight">
                                      {course.title}
                                    </h4>

                                    <p className="text-[11px] text-slate-400">
                                      Instructor:{' '}
                                      <span className="text-slate-300">
                                        {typeof course.trainer === 'object' ? course.trainer?.name || 'Faculty' : (course.trainer || 'Faculty')}
                                      </span>
                                    </p>

                                    {isInProgress && typeof course.progress === 'number' && (
                                      <div className="space-y-1 pt-1 max-w-sm">
                                        <div className="flex justify-between text-[11px] text-amber-300 font-semibold">
                                          <span>In Progress &mdash; {course.progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-amber-400 h-full" style={{ width: `${course.progress}%` }} />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="shrink-0 flex items-center">
                                    {isInProgress ? (
                                      <Link
                                        to={`/trainee/courses/${course.courseId || course.id || course._id}`}
                                        className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>Continue Course</span>
                                      </Link>
                                    ) : isDemonstrated ? (
                                      <Link
                                        to={`/trainee/courses/${course.courseId || course.id || course._id}`}
                                        className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-800/60 hover:bg-emerald-800 text-emerald-200 rounded-lg text-xs font-semibold border border-emerald-600/40 transition-colors"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                        <span>Completed ✓</span>
                                      </Link>
                                    ) : (
                                      <Link
                                        to={`/trainee/courses/${course.courseId || course.id || course._id}`}
                                        className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                      >
                                        <span>View Course</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                /* Course Not Available Card */
                                <div className="bg-slate-950/90 border border-rose-900/40 rounded-lg p-4 space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs">
                                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                    <span>⚠ Course Not Available</span>
                                  </div>
                                  <p className="text-xs text-slate-400 leading-relaxed">
                                    {stage.unavailableMessage ||
                                      `This skill is required for your roadmap, but Capacity Connect currently does not have a published course covering this skill.`}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Downward Connector between skills */}
                          {!isLast && (
                            <div className="flex justify-center py-1">
                              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-indigo-400 border border-indigo-800/60 shadow-xs">
                                <span className="text-sm font-bold">↓</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION: 🧭 MY PERSONALIZED LEARNING PATH (Phase 7.4)           */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'path') && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-xl p-6 sm:p-8 shadow-md space-y-6">
              {/* Path Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
                    <Compass className="w-3.5 h-3.5 text-teal-400" />
                    <span>Intelligent Trajectory Architecture</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span>🧭 My Personalized Learning Path</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                    Your AI-guided journey based on your verified skills, assessment performance and career development.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleRefreshLearningPath}
                    disabled={refreshingPath}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-teal-300 border border-teal-500/40 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshingPath ? 'animate-spin' : ''}`} />
                    <span>{refreshingPath ? 'Recalculating...' : 'Refresh Learning Path'}</span>
                  </button>
                  {pathCached && (
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                      Cached
                    </span>
                  )}
                </div>
              </div>

              {/* Goal & Journey Summary */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-teal-200">
                    {pathGoal || 'Achieve Advanced Institutional Competencies'}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pathSummary || 'This sequenced trajectory prioritizes your active coursework, bridges diagnosed skill gaps, and unlocks institutional competencies.'}
                </p>

                {/* Progress Bar Strip */}
                <div className="pt-3 border-t border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Route className="w-3.5 h-3.5 text-teal-400" />
                      <span>Learning Path Progress: <strong>{pathMetrics.progressPercentage || 0}%</strong></span>
                    </span>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Completed: <strong className="text-emerald-400">{pathMetrics.completedCount || 0}</strong></span>
                      <span>Current: <strong className="text-amber-400">{pathMetrics.currentCount || 0}</strong></span>
                      <span>Remaining: <strong className="text-slate-300">{pathMetrics.remainingCount || 0}</strong></span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-700/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full transition-all duration-500"
                      style={{ width: `${Math.min(pathMetrics.progressPercentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Learning Path Steps Timeline */}
              {pathSteps.length === 0 ? (
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-8 text-center space-y-2 text-slate-300">
                  <Compass className="w-8 h-8 text-teal-400 mx-auto opacity-80" />
                  <h4 className="text-sm font-bold text-white">No active learning path steps</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    No personalized learning path is available yet. Complete a course or assessment to give the AI more learning context.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pathSteps.map((step, idx) => {
                    const isLast = idx === pathSteps.length - 1;
                    const isCurrent = step.status === 'current';
                    const isCompleted = step.status === 'completed';

                    const statusStyles = {
                      current: 'border-amber-400/60 bg-slate-800/90 ring-1 ring-amber-400/40',
                      completed: 'border-emerald-500/50 bg-slate-800/70 opacity-90',
                      recommended: 'border-teal-500/40 bg-slate-800/80',
                      next: 'border-slate-700 bg-slate-800/50',
                      locked: 'border-slate-700 bg-slate-800/30 opacity-70',
                    };

                    const statusBadges = {
                      current: { label: 'Current Stage', bg: 'bg-amber-400/20 text-amber-300 border-amber-400/40' },
                      completed: { label: 'Completed ✓', bg: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40' },
                      recommended: { label: 'Recommended', bg: 'bg-teal-400/20 text-teal-300 border-teal-400/40' },
                      next: { label: 'Next Milestone', bg: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/40' },
                      locked: { label: 'Locked', bg: 'bg-slate-700 text-slate-400 border-slate-600' },
                    };

                    const badge = statusBadges[step.status] || statusBadges.recommended;

                    return (
                      <div key={step.courseId || idx} className="space-y-3">
                        <div className={`border rounded-lg p-5 transition-all flex flex-col md:flex-row gap-4 justify-between items-start ${statusStyles[step.status] || statusStyles.recommended}`}>
                          <div className="flex-1 space-y-3">
                            {/* Sequence Number & Status Badge */}
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 text-slate-950 text-xs font-bold shrink-0">
                                {step.sequence || idx + 1}
                              </div>

                              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${badge.bg}`}>
                                {badge.label}
                              </span>

                              {step.priority === 'high' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  High Priority
                                </span>
                              )}

                              <span className="text-slate-400 text-xs font-medium">
                                Level: <strong className="text-slate-200 uppercase text-[11px]">{step.level || 'Intermediate'}</strong>
                              </span>

                              {step.category && (
                                <span className="text-slate-400 text-xs font-medium">
                                  &bull; {step.category}
                                </span>
                              )}
                            </div>

                            {/* Title & Rationale */}
                            <div>
                              <h3 className="text-base font-bold text-white tracking-tight">
                                {step.title}
                              </h3>
                              <p className="text-xs text-teal-100/90 mt-1 leading-relaxed">
                                <strong className="text-teal-300">Why:</strong> {step.reason}
                              </p>
                            </div>

                            {/* In-Progress Progress Bar for Current Stage */}
                            {isCurrent && typeof step.progress === 'number' && (
                              <div className="bg-slate-900/60 border border-slate-700 rounded p-2.5 space-y-1.5 max-w-md">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-amber-300 font-semibold">Course Progress</span>
                                  <span className="text-white font-bold">{step.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-amber-400 h-full transition-all"
                                    style={{ width: `${step.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Skill Advancement Alignment */}
                            {Array.isArray(step.skills) && step.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {step.skills.map((sk, sIdx) => {
                                  const skName = sk.name || sk.skill?.name || sk.skill || 'Skill';
                                  const curProf = sk.currentProficiency || 'Beginner';
                                  const tarProf = sk.targetProficiency || 'Proficient';

                                  return (
                                    <div
                                      key={sIdx}
                                      className="inline-flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 px-2.5 py-1 rounded text-xs"
                                    >
                                      <Target className="w-3.5 h-3.5 text-teal-400" />
                                      <span className="font-semibold text-slate-200">{skName}:</span>
                                      <span className="text-slate-400 capitalize">{curProf}</span>
                                      <span className="text-teal-400">→</span>
                                      <span className="font-bold text-teal-300 capitalize">{tarProf}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Right Action CTA */}
                          <div className="w-full md:w-44 shrink-0 flex flex-col justify-center space-y-2 self-stretch pt-2 md:pt-0">
                            {isCurrent ? (
                              <Link
                                to={`/trainee/courses/${step.courseId}`}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-xs transition-colors shadow-xs"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Continue Course</span>
                              </Link>
                            ) : isCompleted ? (
                              <Link
                                to={`/trainee/courses/${step.courseId}`}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition-colors border border-emerald-500/40"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                <span>Completed ✓</span>
                              </Link>
                            ) : (
                              <Link
                                to={`/trainee/courses/${step.courseId}`}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded text-xs transition-colors shadow-xs"
                              >
                                <span>View Course</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Downward Connector to next stage */}
                        {!isLast && (
                          <div className="flex justify-center py-1">
                            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-teal-400 border border-slate-700 shadow-xs">
                              <span className="text-sm font-bold">↓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 1: RECOMMENDED COURSES                                  */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'courses') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Recommended Courses ({recommendations.length})
                  </h2>
                </div>
                {cached && (
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Cached
                  </span>
                )}
              </div>

              {recommendations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900">All Published Courses Explored!</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You have enrolled in or completed all published courses matching your profile. Check back soon for new offerings!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {recommendations.map((item, idx) => {
                    const course = item.course;
                    const matchScore = item.matchScore || 85;

                    return (
                      <div
                        key={course?._id || idx}
                        className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5 justify-between items-start"
                      >
                        <div className="flex-1 space-y-3">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{matchScore}% Match</span>
                            </span>

                            {item.priority === 'high' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                                High Priority
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600">
                              {course?.category || 'General'}
                            </span>

                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600">
                              Level: {course?.level || 'Intermediate'}
                            </span>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight">
                              {course?.title}
                            </h3>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {course?.description}
                            </p>
                          </div>

                          {/* Reason */}
                          <div className="bg-emerald-50/60 border border-emerald-200 rounded-md p-3 text-xs text-emerald-900 flex items-start gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <p><strong>Why recommended:</strong> {item.reason}</p>
                          </div>

                          {/* Skill Alignment */}
                          {Array.isArray(item.skillAlignment) && item.skillAlignment.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {item.skillAlignment.map((sa, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]"
                                >
                                  <Target className="w-3 h-3 text-blue-600" />
                                  <span className="font-semibold text-slate-800">{sa.skill}:</span>
                                  <span className="text-slate-500">{sa.currentProficiency || 'None'}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="font-bold text-emerald-700">{sa.targetProficiency}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right CTA */}
                        <div className="w-full md:w-48 shrink-0 bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between space-y-3 self-stretch">
                          <div className="space-y-1 text-xs">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Instructor</span>
                            <p className="font-semibold text-slate-800">{course?.trainer?.name || 'Faculty'}</p>
                          </div>

                          <Link
                            to={`/trainee/courses/${course?._id}`}
                            className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-xs"
                          >
                            <span>View Course</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 2: SKILLS TO DEVELOP                                    */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'skills') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Skills to Develop ({skillsToDevelop.length})
                  </h2>
                </div>
                <Link
                  to="/trainee/skills"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  View My Skills Passport →
                </Link>
              </div>

              {skillsToDevelop.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
                  No critical skill gaps diagnosed. Keep exploring advanced competency modules!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skillsToDevelop.map((sk, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">{typeof sk.skill === 'object' ? sk.skill?.name : (sk.skill || sk.name || 'Skill')}</h3>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            sk.priority === 'high'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {sk.priority || 'medium'} priority
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">Current: <strong>{sk.currentProficiency}</strong></span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-700 font-bold">Target: {sk.targetProficiency}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {sk.reason}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Competency Gated</span>
                        <button
                          type="button"
                          onClick={() => handleOpenSkillGuidance(sk)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Improve This Skill</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 3: ASSESSMENT INSIGHTS                                  */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'insights') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Assessment Insights ({assessmentInsights.length})
                  </h2>
                </div>
                <Link
                  to="/trainee/assessments"
                  className="text-xs font-semibold text-amber-800 hover:underline"
                >
                  View All Assessments →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assessmentInsights.map((ins, idx) => {
                  const statusColors = {
                    positive: 'bg-emerald-50/60 border-emerald-200 text-emerald-900',
                    warning: 'bg-amber-50/60 border-amber-200 text-amber-900',
                    needs_attention: 'bg-rose-50/60 border-rose-200 text-rose-900',
                    neutral: 'bg-slate-50 border-slate-200 text-slate-800',
                  };

                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg p-4 space-y-2 ${statusColors[ins.status] || statusColors.neutral}`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 opacity-80" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">{ins.title}</h4>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">{ins.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 4: SUGGESTED NEXT STEPS                                 */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'steps') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Suggested Next Steps (Sequential Learning Plan)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {nextSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                        {step.step || idx + 1}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
                    </div>

                    {step.actionUrl && (
                      <Link
                        to={step.actionUrl}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 pt-2 border-t border-slate-100"
                      >
                        <span>Take Action</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* CONTEXTUAL MODAL: SKILL IMPROVEMENT ADVISOR                     */}
      {/* ============================================================== */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Skill Advisor: {selectedSkill}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingGuidance && (
              <div className="py-8 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Formulating progression roadmap...</p>
              </div>
            )}

            {!loadingGuidance && skillGuidance && (
              <div className="space-y-4 text-xs">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-900 space-y-1">
                  <h4 className="font-bold text-xs">{skillGuidance.roadmapTitle}</h4>
                  <p className="leading-relaxed">{skillGuidance.progressionSummary}</p>
                </div>

                {Array.isArray(skillGuidance.recommendedActions) && skillGuidance.recommendedActions.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold uppercase text-[10px] text-slate-400">Action Plan:</span>
                    <ul className="space-y-1.5">
                      {skillGuidance.recommendedActions.map((act, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(skillGuidance.recommendedCourses) && skillGuidance.recommendedCourses.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="font-bold uppercase text-[10px] text-slate-400">Mapped Platform Courses:</span>
                    <div className="space-y-1.5">
                      {skillGuidance.recommendedCourses.map((mc, mIdx) => (
                        <div key={mIdx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded p-2">
                          <span className="font-semibold text-slate-800">{mc.title}</span>
                          <Link
                            to={`/trainee/courses/${mc.courseId}`}
                            onClick={() => setSelectedSkill(null)}
                            className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Explore</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
              >
                Close Advisor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraineeRecommendationsPage;
