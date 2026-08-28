import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAiCourseRecommendationsApi,
  getSkillAiGuidanceApi,
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
  X
} from 'lucide-react';

const TraineeRecommendationsPage = () => {
  const [hubData, setHubData] = useState({
    recommendations: [],
    skillsToDevelop: [],
    assessmentInsights: [],
    nextSteps: [],
    traineeSummary: null,
    cached: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'courses', 'skills', 'insights', 'steps'

  // Skill guidance modal state
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillGuidance, setSkillGuidance] = useState(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  const fetchRecommendations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await getAiCourseRecommendationsApi(isRefresh ? { refresh: 'true' } : {});
      if (res?.success && res.data) {
        setHubData({
          recommendations: res.data.recommendations || [],
          skillsToDevelop: res.data.skillsToDevelop || [],
          assessmentInsights: res.data.assessmentInsights || [],
          nextSteps: res.data.nextSteps || [],
          traineeSummary: res.data.traineeSummary || null,
          cached: Boolean(res.data.cached),
        });
      }
    } catch (err) {
      console.warn('Failed to load recommendation hub:', err.message);
      setError('Recommendations are temporarily unavailable. You can continue exploring the course catalog.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    fetchRecommendations(false);
  }, []);

  const {
    recommendations = [],
    skillsToDevelop = [],
    assessmentInsights = [],
    nextSteps = [],
    traineeSummary = null,
    cached = false,
  } = hubData;

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Telemetry */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Learning Advisor & Recommendation Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Personalized Learning Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Dynamically synthesized by analyzing your verified skills, quiz performance, diagnosed gaps, and institutional competency milestones.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => fetchRecommendations(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh AI'}</span>
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
              ? 'bg-indigo-700 text-white'
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
            <h3 className="text-base font-bold text-slate-900">Synthesizing personalized learning plan...</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Evaluating your verified skills, quiz performance, and competency frameworks to formulate the best learning path.
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
            <p>You can still discover all platform courses directly via the Course Catalog.</p>
          </div>
        </div>
      )}

      {/* Main Hub Content */}
      {!loading && (
        <div className="space-y-10">
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
                          <h3 className="text-sm font-bold text-slate-900">{sk.skill}</h3>
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
