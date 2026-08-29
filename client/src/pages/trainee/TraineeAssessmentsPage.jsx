import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getMyAssessmentsFeedApi,
  getAssessmentByIdApi,
  getAiCourseRecommendationsApi,
} from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Button from '../../components/Button';
import QuizTakeModal from '../../components/QuizTakeModal';
import CertificateModal from '../../components/CertificateModal';
import AssessmentReviewModal from '../../components/AssessmentReviewModal';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RotateCcw,
  Lock,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Percent,
  Eye,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

const TraineeAssessmentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'insights' ? 'insights' : (searchParams.get('tab') === 'completed' ? 'completed' : 'available');
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [error, setError] = useState(null);
  const [availableList, setAvailableList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [assessmentInsights, setAssessmentInsights] = useState([]);
  const [reviewAttemptId, setReviewAttemptId] = useState(null);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'insights') {
      setActiveTab('insights');
    } else if (tabParam === 'completed') {
      setActiveTab('completed');
    } else if (tabParam === 'available') {
      setActiveTab('available');
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Modal State for taking quiz from assessment feed
  const [activeQuizModal, setActiveQuizModal] = useState({
    isOpen: false,
    assessment: null,
    courseTitle: '',
  });

  // Modal State for viewing certificate
  const [activeCertificateModal, setActiveCertificateModal] = useState({
    isOpen: false,
    certificate: null,
  });

  const [notification, setNotification] = useState(null);

  // Independent fetch for Assessments Feed
  const fetchFeed = useCallback(async () => {
    setLoadingAssessments(true);
    setError(null);
    try {
      const feedRes = await getMyAssessmentsFeedApi();
      if (feedRes?.success) {
        setAvailableList(feedRes.data?.availableAssessments || []);
        setCompletedList(feedRes.data?.completedAssessments || []);
      } else {
        throw new Error(feedRes?.message || 'Failed to load assessments.');
      }
    } catch (err) {
      console.error('Error fetching assessments feed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load assessments.');
    } finally {
      setLoadingAssessments(false);
    }
  }, []);

  // Independent fetch for AI Assessment Insights
  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      setLoadingInsights(true);
      try {
        const recsRes = await getAiCourseRecommendationsApi();
        if (isMounted && recsRes?.success) {
          setAssessmentInsights(recsRes.data?.assessmentInsights || []);
        }
      } catch (err) {
        console.warn('AI assessment insights notice:', err.message);
      } finally {
        if (isMounted) setLoadingInsights(false);
      }
    };
    fetchInsights();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleLaunchQuiz = async (assessmentItem) => {
    try {
      const response = await getAssessmentByIdApi(assessmentItem._id);
      if (response && response.success && response.data?.assessment) {
        setActiveQuizModal({
          isOpen: true,
          assessment: response.data.assessment,
          courseTitle: assessmentItem.courseTitle || '',
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load assessment.');
    }
  };

  const totalCompleted = completedList.length;
  const passedCount = completedList.filter((item) => item.latestAttempt?.passed).length;
  const avgScore =
    totalCompleted > 0
      ? Math.round(
          completedList.reduce((sum, item) => sum + (item.latestAttempt?.percentage || 0), 0) /
            totalCompleted
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Centralized Knowledge Evaluation</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              My Assessments & Quizzes
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
              Track, attempt, and review all module mini-quizzes and final graduation assessments across your enrolled courses, with AI diagnostic mastery insights.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-[var(--surface-muted)] border border-[var(--border)] p-3 rounded-xl flex-shrink-0">
            <div className="text-center px-3 border-r border-[var(--border)]">
              <span className="block text-base font-bold text-[var(--text-primary)]">{availableList.length}</span>
              <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Available</span>
            </div>
            <div className="text-center px-3 border-r border-[var(--border)]">
              <span className="block text-base font-bold text-emerald-700 dark:text-emerald-400">{totalCompleted}</span>
              <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Completed</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-base font-bold text-[var(--primary)]">{avgScore}%</span>
              <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Avg Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 px-4 py-3 rounded-lg text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchFeed} />}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange('available')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer ${
            activeTab === 'available'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Available / Upcoming ({availableList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('completed')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed Attempts ({completedList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('insights')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer ${
            activeTab === 'insights'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>📈 AI Assessment Insights ({assessmentInsights.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'insights' ? (
        /* ASSESSMENT INSIGHTS TAB */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-4">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>AI Assessment Diagnostics & Mastery Trajectory</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Detailed evaluation of question responses, recurring weak points, and recommended review areas.
              </p>
            </div>
            <Link
              to="/trainee/recommendations"
              className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>View AI Recommendations Hub</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loadingInsights ? (
            <div className="py-16 flex justify-center bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xs">
              <Loading message="Analyzing assessment performance & calculating diagnostics..." />
            </div>
          ) : assessmentInsights.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">No assessment insights yet</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                Attempt module quizzes and course graduation exams to generate automated diagnostic insights and mastery feedback.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assessmentInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--surface)] border border-[var(--border)] hover:border-amber-400 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        insight.status === 'positive' || insight.status === 'mastered'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                          : insight.status === 'warning' || insight.status === 'needs_review'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200'
                      }`}>
                        {insight.status || 'Diagnostic'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{insight.title || `Assessment Insight ${idx + 1}`}</span>
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg p-3">
                      {insight.description || insight.insight}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleTabChange('completed')}
                      className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Review Completed Attempts</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'available' ? (
        /* AVAILABLE ASSESSMENTS TAB */
        loadingAssessments ? (
          <div className="py-16 flex justify-center">
            <Loading message="Loading available assessments..." />
          </div>
        ) : availableList.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">No pending assessments</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              You are up to date! All available module quizzes and final assessments have been attempted or no courses are currently enrolled.
            </p>
            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:underline pt-2"
            >
              <span>Explore Course Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableList.map((item) => {
              const isFinal = item.type === 'final';
              const isLocked = item.isLocked;

              return (
                <div
                  key={item._id}
                  className={`bg-[var(--surface)] border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                    isLocked
                      ? 'border-[var(--border)] opacity-80'
                      : isFinal
                      ? 'border-blue-200 dark:border-blue-800 hover:border-blue-400'
                      : 'border-[var(--border)] hover:border-blue-400'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isFinal
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isFinal ? 'Final Course Assessment' : 'Module Mini-Quiz'}
                      </span>

                      {isLocked ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Ready to Take
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Course: <strong className="text-slate-700">{item.courseTitle}</strong>
                      </p>
                    </div>

                    {/* Metadata specs */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono pt-1">
                      <span>{item.questionCount} Questions</span>
                      <span>•</span>
                      <span>{item.totalMarks} Marks</span>
                      <span>•</span>
                      <span className="text-emerald-800 font-bold">Pass: {item.passThreshold}%</span>
                    </div>

                    {/* Gating prompt if locked */}
                    {isLocked && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>
                          Complete all required course modules (
                          <strong>{item.completedModules || 0}</strong> of{' '}
                          <strong>{item.totalModules || 0}</strong> completed) before attempting the final assessment.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/trainee/courses/${item.courseId}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Go to Course</span>
                    </Link>

                    {isLocked ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled
                        className="opacity-60 cursor-not-allowed text-xs font-semibold"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        <span>Locked</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleLaunchQuiz(item)}
                        className="text-xs font-bold px-4"
                      >
                        <Play className="w-3.5 h-3.5 mr-1" />
                        <span>{isFinal ? 'Start Final Assessment' : 'Start Quiz'}</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* COMPLETED ASSESSMENTS TAB */
        loadingAssessments ? (
          <div className="py-16 flex justify-center">
            <Loading message="Loading completed attempts..." />
          </div>
        ) : completedList.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">No completed attempts yet</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              You have not submitted any quizzes yet. Switch to the Available tab to start taking quizzes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedList.map((item) => {
              const isFinal = item.type === 'final';
              const attempt = item.latestAttempt;
              const passed = attempt?.passed;

              return (
                <div
                  key={item._id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isFinal
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {isFinal ? 'Final Assessment' : 'Module Quiz'}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                          passed
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-rose-300'
                        }`}
                      >
                        {passed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                            <span>PASSED</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-700 dark:text-rose-400" />
                            <span>FAILED</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                        Course: <strong className="text-[var(--text-primary)]">{item.courseTitle}</strong>
                      </p>
                    </div>

                    {/* Result Breakdown Card */}
                    <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase block">
                          Score Achieved
                        </span>
                        <strong className="text-sm font-bold text-[var(--text-primary)]">
                          {attempt?.score} / {attempt?.totalMarks} ({attempt?.percentage}%)
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase block">
                          Required Pass
                        </span>
                        <span className="font-bold text-[var(--text-secondary)]">{item.passThreshold}%</span>
                      </div>
                    </div>

                    {/* Certificate Badge if Final Assessment Passed */}
                    {item.certificate && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span>
                            {passed ? 'Certificate Earned:' : 'Certificate Earned (Prior Pass):'}{' '}
                            <strong className="font-mono font-bold">{item.certificate.certificateId}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveCertificateModal({
                              isOpen: true,
                              certificate: item.certificate,
                            })
                          }
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 underline flex-shrink-0"
                        >
                          View
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Attempted on {new Date(attempt?.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {attempt?._id && (
                        <button
                          type="button"
                          onClick={() => setReviewAttemptId(attempt._id)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Review</span>
                        </button>
                      )}

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleLaunchQuiz(item)}
                        className="text-xs font-semibold"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        <span>Retake</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Quiz / Assessment Taking Modal */}
      {activeQuizModal.isOpen && (
        <QuizTakeModal
          isOpen={activeQuizModal.isOpen}
          onClose={() =>
            setActiveQuizModal({ isOpen: false, assessment: null, courseTitle: '' })
          }
          assessment={activeQuizModal.assessment}
          courseTitle={activeQuizModal.courseTitle}
          onCompleted={(result) => {
            setActiveQuizModal({ isOpen: false, assessment: null, courseTitle: '' });
            fetchFeed();
            if (result?.attempt) {
              setNotification(
                result.certificate
                  ? `🎉 Congratulations! Final assessment passed (${result.attempt.percentage}%). Certificate generated!`
                  : `✓ Assessment attempt recorded (${result.attempt.percentage}% score).`
              );
            }
          }}
        />
      )}

      {/* Certificate Viewer Modal */}
      {activeCertificateModal.isOpen && (
        <CertificateModal
          isOpen={activeCertificateModal.isOpen}
          onClose={() =>
            setActiveCertificateModal({ isOpen: false, certificate: null })
          }
          certificate={activeCertificateModal.certificate}
        />
      )}

      {/* Assessment Question-by-Question Review Modal */}
      {reviewAttemptId && (
        <AssessmentReviewModal
          isOpen={Boolean(reviewAttemptId)}
          attemptId={reviewAttemptId}
          onClose={() => setReviewAttemptId(null)}
        />
      )}
    </div>
  );
};

export default TraineeAssessmentsPage;
