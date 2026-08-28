import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getMyAssessmentsFeedApi,
  getAssessmentByIdApi,
} from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Button from '../../components/Button';
import QuizTakeModal from '../../components/QuizTakeModal';
import CertificateModal from '../../components/CertificateModal';
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
} from 'lucide-react';

const TraineeAssessmentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableList, setAvailableList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'completed'

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

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyAssessmentsFeedApi();
      if (response && response.success) {
        setAvailableList(response.data?.availableAssessments || []);
        setCompletedList(response.data?.completedAssessments || []);
      } else {
        throw new Error(response?.message || 'Failed to load assessments.');
      }
    } catch (err) {
      console.error('Error fetching assessments feed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load assessments.');
    } finally {
      setLoading(false);
    }
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
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Centralized Knowledge Evaluation</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Assessments & Quizzes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Track, attempt, and review all module mini-quizzes and final graduation assessments across your enrolled courses.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg flex-shrink-0">
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-base font-bold text-slate-900">{availableList.length}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Available</span>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-base font-bold text-emerald-700">{totalCompleted}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Completed</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-base font-bold text-indigo-700">{avgScore}%</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Avg Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-lg text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchFeed} />}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2 ${
            activeTab === 'available'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Available / Upcoming ({availableList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed Attempts ({completedList.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loading message="Loading assessment feed..." />
        </div>
      ) : activeTab === 'available' ? (
        /* AVAILABLE ASSESSMENTS TAB */
        availableList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No pending assessments</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are up to date! All available module quizzes and final assessments have been attempted or no courses are currently enrolled.
            </p>
            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2"
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
                  className={`bg-white border rounded-lg p-5 shadow-xs flex flex-col justify-between transition-all ${
                    isLocked
                      ? 'border-slate-200 opacity-80'
                      : isFinal
                      ? 'border-indigo-200 hover:border-indigo-300'
                      : 'border-slate-200 hover:border-slate-300'
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
        completedList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No completed attempts yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                  className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
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
                        {isFinal ? 'Final Assessment' : 'Module Quiz'}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                          passed
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}
                      >
                        {passed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>PASSED</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-700" />
                            <span>FAILED</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Course: <strong className="text-slate-700">{item.courseTitle}</strong>
                      </p>
                    </div>

                    {/* Result Breakdown Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                          Score Achieved
                        </span>
                        <strong className="text-sm font-bold text-slate-900">
                          {attempt?.score} / {attempt?.totalMarks} ({attempt?.percentage}%)
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                          Required Pass
                        </span>
                        <span className="font-bold text-slate-700">{item.passThreshold}%</span>
                      </div>
                    </div>

                    {/* Certificate Badge if Final Assessment Passed */}
                    {item.certificate && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-[11px] text-emerald-900 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
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
    </div>
  );
};

export default TraineeAssessmentsPage;
