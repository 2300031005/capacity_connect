import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAiCourseRecommendationsApi,
  getSkillAiGuidanceApi,
  getAiLearningPathApi,
  refreshAiLearningPathApi,
  setAiCareerGoalApi,
  getAiCareerRoadmapApi,
  refreshAiCareerRoadmapApi,
  getAiAdaptiveAdvisorApi,
  refreshAiAdaptiveAdvisorApi,
} from '../../services/api';
import {
  formatCleanTitle,
  formatCleanDescription,
  formatCleanCategory,
  formatCleanSkillTags,
  formatCleanLevel,
  formatCleanMatchScore,
  stripInternalIds,
} from '../../utils/courseFormatters';
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  Target,
  Award,
  Layers,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  ChevronRight,
  Play,
  Lock,
  Route,
  Edit3,
  Check,
  Briefcase,
  GraduationCap,
  Bot,
  Tag,
} from 'lucide-react';

const TraineeRecommendationsPage = () => {
  // Adaptive AI Learning Advisor Data
  const [advisorData, setAdvisorData] = useState({
    careerGoal: '',
    nextAction: null,
    insight: '',
    focusArea: '',
    urgency: 'standard',
    traineeSummary: null,
    cached: false,
    timestamp: null,
  });

  // Recommendation Hub Data
  const [hubData, setHubData] = useState({
    recommendations: [],
    skillsToDevelop: [],
    assessmentInsights: [],
    nextSteps: [],
    traineeSummary: null,
    cached: false,
  });

  // Personalized Learning Path Data
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

  // AI Career Goal & Roadmap Data
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
  const [refreshingAdvisor, setRefreshingAdvisor] = useState(false);
  const [refreshingHub, setRefreshingHub] = useState(false);
  const [refreshingPath, setRefreshingPath] = useState(false);
  const [refreshingRoadmap, setRefreshingRoadmap] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations', 'career', 'path', 'advisor'

  // Fetch all recommendations, learning path, career roadmap, and adaptive advisor
  const fetchAllData = async (isRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const [recsRes, pathRes, goalRes, advisorRes] = await Promise.allSettled([
        getAiCourseRecommendationsApi(),
        getAiLearningPathApi(),
        getAiCareerRoadmapApi(),
        getAiAdaptiveAdvisorApi(),
      ]);

      if (recsRes.status === 'fulfilled' && recsRes.value?.success) {
        const d = recsRes.value.data;
        setHubData({
          recommendations: d.recommendations || [],
          skillsToDevelop: d.skillsToDevelop || [],
          assessmentInsights: d.assessmentInsights || [],
          nextSteps: d.nextSteps || [],
          traineeSummary: d.traineeSummary || null,
          cached: Boolean(d.cached),
        });
      }

      if (pathRes.status === 'fulfilled' && pathRes.value?.success) {
        const p = pathRes.value.data;
        setLearningPathData({
          goal: p.goal || '',
          summary: p.summary || '',
          steps: p.steps || [],
          metrics: p.metrics || {
            totalSteps: 0,
            completedCount: 0,
            currentCount: 0,
            remainingCount: 0,
            progressPercentage: 0,
          },
          cached: Boolean(p.cached),
        });
      }

      if (goalRes.status === 'fulfilled' && goalRes.value?.success) {
        const r = goalRes.value.data;
        setCareerRoadmapData({
          careerGoal: r.careerGoal || '',
          targetCompetency: r.targetCompetency || '',
          summary: r.summary || '',
          skillGaps: r.skillGaps || [],
          stages: r.stages || [],
          metrics: r.metrics || {
            totalStages: 0,
            completedStages: 0,
            currentStages: 0,
            remainingStages: 0,
            progressPercentage: 0,
          },
          cached: Boolean(r.cached),
        });
        setCareerGoalInput(r.careerGoal || '');
      }

      if (advisorRes.status === 'fulfilled' && advisorRes.value?.success) {
        const adv = advisorRes.value.data;
        setAdvisorData({
          careerGoal: adv.careerGoal || '',
          nextAction: adv.nextAction || null,
          insight: adv.insight || '',
          focusArea: adv.focusArea || '',
          urgency: adv.urgency || 'standard',
          traineeSummary: adv.traineeSummary || null,
          cached: Boolean(adv.cached),
          timestamp: adv.timestamp || null,
        });
      }
    } catch (err) {
      console.error('Error fetching recommendation systems:', err);
      setError('Failed to load personalized AI learning guidance.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCareerGoal = async (goalToSave) => {
    const targetGoal = (goalToSave || careerGoalInput || '').trim();
    if (!targetGoal) return;

    setSavingGoal(true);
    setError(null);
    try {
      const setRes = await setAiCareerGoalApi(targetGoal);
      if (setRes?.success) {
        setIsEditingGoal(false);
        setRefreshingRoadmap(true);
        const roadRes = await refreshAiCareerRoadmapApi(targetGoal);
        if (roadRes?.success && roadRes.data) {
          setCareerRoadmapData({
            careerGoal: roadRes.data.careerGoal || targetGoal,
            targetCompetency: roadRes.data.targetCompetency || '',
            summary: roadRes.data.summary || '',
            skillGaps: roadRes.data.skillGaps || [],
            stages: roadRes.data.stages || [],
            metrics: roadRes.data.metrics || {
              totalStages: 0,
              completedStages: 0,
              currentStages: 0,
              remainingStages: 0,
              progressPercentage: 0,
            },
            cached: false,
          });
        }
      }
    } catch (err) {
      console.error('Error setting career goal:', err);
      setError('Could not generate career roadmap right now. Please try again.');
    } finally {
      setSavingGoal(false);
      setRefreshingRoadmap(false);
    }
  };

  const handleRefreshAdvisor = async () => {
    try {
      setRefreshingAdvisor(true);
      const res = await refreshAiAdaptiveAdvisorApi();
      if (res?.success && res.data) {
        setAdvisorData({
          careerGoal: res.data.careerGoal || '',
          nextAction: res.data.nextAction || null,
          insight: res.data.insight || '',
          focusArea: res.data.focusArea || '',
          urgency: res.data.urgency || 'standard',
          traineeSummary: res.data.traineeSummary || null,
          cached: Boolean(res.data.cached),
          timestamp: res.data.timestamp || null,
        });
      }
    } catch (err) {
      console.warn('Failed to refresh adaptive advisor:', err.message);
    } finally {
      setRefreshingAdvisor(false);
    }
  };

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

  useEffect(() => {
    fetchAllData(false);
  }, []);

  const goalSuggestions = [
    'Full Stack Developer',
    'Cloud & DevOps Engineer',
    'AI & Machine Learning Engineer',
    'Data Analyst',
    'Backend Microservices Architect',
  ];

  const recommendations = hubData.recommendations || [];
  const roadmapStages = careerRoadmapData.stages || [];
  const pathSteps = learningPathData.steps || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ====================================================
          1. HEADER BANNER (CLEAN WHITE ENTERPRISE HEADER)
          ==================================================== */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Learning Guidance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Learning Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
              Personalized learning guidance based on your skills, assessment performance, learning progress and career goals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchAllData(true)}
              disabled={loading || refreshingAdvisor || refreshingRoadmap || refreshingPath}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingAdvisor || refreshingRoadmap || refreshingPath ? 'animate-spin' : ''}`} />
              <span>{refreshingAdvisor || refreshingRoadmap || refreshingPath ? 'Refreshing...' : 'Refresh AI Guidance'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================
          2. VIEW NAVIGATION TABS
          ==================================================== */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'recommendations'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Recommendations ({recommendations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('career')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'career'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Career Roadmap ({roadmapStages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('path')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'path'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Learning Path ({pathSteps.length})</span>
        </button>

        {advisorData.nextAction && (
          <button
            type="button"
            onClick={() => setActiveTab('advisor')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'advisor'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Adaptive Next Action</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-3 shadow-xs">
          <div className="inline-flex p-3 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[var(--primary)] animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Synthesizing personalized AI recommendations...
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Evaluating your verified skills, course completions, and career goals to compute the optimal curriculum path.
          </p>
        </div>
      )}

      {!loading && (
        <>
          {/* ========================================================================= */}
          {/* TAB 1: ALL RECOMMENDATIONS (ENTERPRISE STRUCTURED RECOMMENDATION CARDS)   */}
          {/* ========================================================================= */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {recommendations.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">No recommendations available</h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                    Enroll in courses and complete quizzes to generate personalized learning paths.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((item, idx) => {
                    const course = item.course || {};
                    const cleanTitle = formatCleanTitle(course.title);
                    const cleanCategory = formatCleanCategory(course.category);
                    const cleanDescription = formatCleanDescription(course, item);
                    const cleanSkills = formatCleanSkillTags(item, course);
                    const cleanLevel = formatCleanLevel(course.level);
                    const cleanMatchScore = formatCleanMatchScore(item.matchScore);
                    const courseId = course._id || course.id || item.courseId;
                    const cleanReason = stripInternalIds(item.reason) || cleanDescription;
                    const cleanBenefit = stripInternalIds(item.learningBenefit);

                    return (
                      <div
                        key={courseId || idx}
                        className="bg-[var(--surface)] border border-[var(--border)] hover:border-blue-400 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4 transition-all duration-150"
                      >
                        <div className="space-y-3.5">
                          {/* Top: Category & Match Score */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                              {cleanCategory}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>{cleanMatchScore}</span>
                            </span>
                          </div>

                          {/* WHAT: Course Title */}
                          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight leading-snug">
                            {cleanTitle}
                          </h2>

                          {/* Short Description */}
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {cleanDescription}
                          </p>

                          {/* WHY: AI Rationale */}
                          <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg p-3 space-y-1">
                            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                              Why this is recommended
                            </span>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              {cleanReason}
                            </p>
                          </div>

                          {/* SKILL GAP & PROGRESSION */}
                          {cleanSkills.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                                Targeted Skill Alignment
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {cleanSkills.map((sk, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="p-2 bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg flex items-center justify-between text-xs"
                                  >
                                    <span className="font-medium text-[var(--text-primary)] truncate">{sk.name}</span>
                                    <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)] shrink-0">
                                      Target: {sk.proficiency}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* EXPECTED OUTCOME */}
                          {cleanBenefit && (
                            <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)] pt-1">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span><strong>Expected Outcome:</strong> {cleanBenefit}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer Action */}
                        <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                          <span className="text-xs text-[var(--text-muted)] font-medium">
                            {cleanLevel}
                          </span>
                          <Link
                            to={`/trainee/courses/${courseId}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
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

          {/* ========================================================================= */}
          {/* TAB 2: CAREER ROADMAP                                                     */}
          {/* ========================================================================= */}
          {activeTab === 'career' && (
            <div className="space-y-6">
              {/* Career Goal Config Box */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[var(--primary)]" />
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">Target Career Pathway</h2>
                      <p className="text-xs text-[var(--text-muted)]">Set or update your institutional job role target.</p>
                    </div>
                  </div>

                  {!isEditingGoal && (
                    <button
                      type="button"
                      onClick={() => setIsEditingGoal(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Change Career Target</span>
                    </button>
                  )}
                </div>

                {isEditingGoal ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={careerGoalInput}
                        onChange={(e) => setCareerGoalInput(e.target.value)}
                        placeholder="e.g. Full Stack Developer, Cloud Architect..."
                        className="flex-1 px-3 py-2 text-xs border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveCareerGoal(careerGoalInput)}
                        disabled={savingGoal || !careerGoalInput.trim()}
                        className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {savingGoal ? 'Saving...' : 'Set Goal'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingGoal(false)}
                        className="px-3 py-2 border border-[var(--border)] text-xs text-[var(--text-secondary)] rounded-lg hover:bg-[var(--surface-muted)] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-[var(--text-muted)]">Quick Suggestions:</span>
                      {goalSuggestions.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setCareerGoalInput(g);
                            handleSaveCareerGoal(g);
                          }}
                          className="text-[11px] px-2 py-0.5 bg-[var(--surface-muted)] hover:bg-[var(--border)] text-[var(--text-secondary)] rounded-md border border-[var(--border)] cursor-pointer"
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg p-3">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Current Target: {careerRoadmapData.careerGoal || 'Full Stack Developer'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {roadmapStages.length} Milestones Mapped
                    </span>
                  </div>
                )}
              </div>

              {/* Roadmap Milestones */}
              <div className="space-y-4">
                {roadmapStages.map((stage, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[var(--primary)] flex items-center justify-center font-bold text-xs shrink-0">
                          {sIdx + 1}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[var(--text-primary)]">{stage.stageName || stage.name}</h3>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">{stage.description}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)] shrink-0">
                        {stage.status || 'Planned'}
                      </span>
                    </div>

                    {Array.isArray(stage.recommendedCourses) && stage.recommendedCourses.length > 0 && (
                      <div className="pt-2 border-t border-[var(--border)]">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block mb-1.5">
                          Recommended Curriculum for Milestone:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {stage.recommendedCourses.map((c, cIdx) => (
                            <Link
                              key={cIdx}
                              to={`/trainee/courses/${c._id || c.id || ''}`}
                              className="p-2.5 rounded-lg border border-[var(--border)] hover:border-blue-400 bg-[var(--surface-muted)] flex items-center justify-between text-xs transition-colors"
                            >
                              <span className="font-semibold text-[var(--text-primary)] truncate">{c.title || c}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 ml-2" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: LEARNING PATH                                                      */}
          {/* ========================================================================= */}
          {activeTab === 'path' && (
            <div className="space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 sm:p-6 shadow-xs space-y-2">
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>Sequential Learning Path</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Step-by-step ordered trajectory to build domain mastery from fundamentals to advanced specializations.
                </p>
              </div>

              <div className="space-y-4">
                {pathSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">{step.title || step.stepName}</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{step.description}</p>
                      </div>
                    </div>

                    <Link
                      to={step.courseId ? `/trainee/courses/${step.courseId}` : '/trainee/courses'}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline shrink-0 self-start sm:self-auto"
                    >
                      <span>Take Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ADAPTIVE AI LEARNING ADVISOR                                       */}
          {/* ========================================================================= */}
          {activeTab === 'advisor' && advisorData.nextAction && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Real-Time Diagnostic</span>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Recommended Next Action</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Evaluated from your active coursework, assessment gaps, and skill targets.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshAdvisor}
                  disabled={refreshingAdvisor}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingAdvisor ? 'animate-spin' : ''}`} />
                  <span>Re-evaluate</span>
                </button>
              </div>

              {/* Action Container */}
              <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-5 space-y-3">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {advisorData.nextAction.title || 'Complete Next Module'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {advisorData.insight || advisorData.nextAction.reason}
                </p>

                {advisorData.nextAction.courseId && (
                  <div className="pt-2">
                    <Link
                      to={`/trainee/courses/${advisorData.nextAction.courseId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      <span>Resume Coursework</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TraineeRecommendationsPage;
