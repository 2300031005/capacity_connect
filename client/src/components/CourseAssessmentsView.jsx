import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileCheck,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Globe,
  Lock,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  ArrowRight,
  Eye,
  HelpCircle,
  Clock,
  Shuffle,
  Tag,
  Percent,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  getFinalAssessmentApi,
  getModuleQuizApi,
  toggleAssessmentStatusApi,
  deleteAssessmentApi,
  duplicateAssessmentApi,
  getCourseAssessmentResultsApi,
} from '../services/api';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import QuizBuilderModal from './QuizBuilderModal';
import AssessmentReviewModal from './AssessmentReviewModal';

const CourseAssessmentsView = ({
  courseId,
  courseTitle = 'Course',
  modules = [],
  onNotify,
}) => {
  const [subTab, setSubTab] = useState('overview'); // overview | question_bank | results
  const [assessments, setAssessments] = useState([]);
  const [resultsData, setResultsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Question Bank Search & Filter
  const [qbSearch, setQbSearch] = useState('');
  const [qbDifficulty, setQbDifficulty] = useState('all');

  // Results Filter & Search
  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsStatusFilter, setResultsStatusFilter] = useState('all'); // all | passed | failed

  // Quiz Builder Modal Config
  const [quizModalConfig, setQuizModalConfig] = useState({
    isOpen: false,
    type: 'module',
    moduleId: null,
    moduleTitle: '',
    initialAssessment: null,
  });

  // Assessment Review Modal Config
  const [reviewModalConfig, setReviewModalConfig] = useState({
    isOpen: false,
    attemptId: null,
    assessmentTitle: '',
  });

  const fetchAssessmentsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = [];

      // 1. Fetch Final Assessment
      try {
        const finalRes = await getFinalAssessmentApi(courseId);
        if (finalRes && finalRes.success && finalRes.data?.assessment) {
          list.push({
            ...finalRes.data.assessment,
            isFinal: true,
            moduleTitle: null,
          });
        }
      } catch (e) {
        console.warn('No final assessment found or error:', e.message);
      }

      // 2. Fetch Module Quizzes for each module
      if (modules && modules.length > 0) {
        await Promise.all(
          modules.map(async (mod) => {
            try {
              const qRes = await getModuleQuizApi(mod._id);
              if (qRes && qRes.success && qRes.data?.quiz) {
                list.push({
                  ...qRes.data.quiz,
                  isFinal: false,
                  moduleTitle: mod.title,
                });
              }
            } catch (e) {
              console.warn(`No quiz for module ${mod.title}`);
            }
          })
        );
      }

      setAssessments(list);

      // 3. Fetch Course Results Roster
      try {
        const resRoster = await getCourseAssessmentResultsApi(courseId);
        if (resRoster && resRoster.success) {
          setResultsData(resRoster.data || []);
        }
      } catch (e) {
        console.warn('Could not fetch assessment results roster:', e.message);
      }
    } catch (err) {
      console.error('Error fetching course assessments data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  }, [courseId, modules]);

  useEffect(() => {
    fetchAssessmentsData();
  }, [fetchAssessmentsData]);

  // Handler: Toggle Assessment Status (Draft / Published)
  const handleToggleStatus = async (assessmentId) => {
    setActionLoading(true);
    try {
      const res = await toggleAssessmentStatusApi(assessmentId);
      if (res && res.success) {
        if (onNotify) {
          onNotify({
            type: 'success',
            message: `Assessment status updated to "${res.data?.status}"`,
          });
        }
        await fetchAssessmentsData();
      }
    } catch (err) {
      if (onNotify) {
        onNotify({
          type: 'error',
          message: err.response?.data?.message || err.message || 'Failed to update assessment status.',
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Duplicate Assessment
  const handleDuplicate = async (assessmentId) => {
    setActionLoading(true);
    try {
      const res = await duplicateAssessmentApi(assessmentId);
      if (res && res.success) {
        if (onNotify) {
          onNotify({
            type: 'success',
            message: 'Assessment duplicated as draft.',
          });
        }
        await fetchAssessmentsData();
      }
    } catch (err) {
      if (onNotify) {
        onNotify({
          type: 'error',
          message: err.response?.data?.message || err.message || 'Failed to duplicate assessment.',
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Delete Assessment
  const handleDelete = async (assessmentId, assessmentTitle) => {
    const confirm = window.confirm(
      `Delete assessment "${assessmentTitle}"? This will also remove any trainee attempt records for this quiz.`
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      const res = await deleteAssessmentApi(assessmentId);
      if (res && res.success) {
        if (onNotify) {
          onNotify({
            type: 'success',
            message: 'Assessment removed successfully.',
          });
        }
        await fetchAssessmentsData();
      }
    } catch (err) {
      if (onNotify) {
        onNotify({
          type: 'error',
          message: err.response?.data?.message || err.message || 'Failed to delete assessment.',
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Compute Overall KPI Metrics
  const kpis = useMemo(() => {
    const totalAssessments = assessments.length;
    const activeAssessments = assessments.filter((a) => a.status === 'published').length;

    // Flatten results attempts
    const allAttempts = [];
    resultsData.forEach((r) => {
      if (r.moduleAttempts) allAttempts.push(...r.moduleAttempts);
      if (r.finalAttempt) allAttempts.push(r.finalAttempt);
    });

    const totalAttempts = allAttempts.length;
    const passedAttempts = allAttempts.filter((a) => a.passed).length;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    const avgScore = totalAttempts > 0
      ? Math.round(allAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts)
      : null;

    return {
      totalAssessments,
      activeAssessments,
      totalAttempts,
      passRate,
      avgScore,
    };
  }, [assessments, resultsData]);

  // Aggregate All Questions for the Question Bank Tab
  const questionBankList = useMemo(() => {
    const questions = [];
    assessments.forEach((ass) => {
      (ass.questions || []).forEach((q, qIdx) => {
        questions.push({
          ...q,
          assessmentId: ass._id,
          assessmentTitle: ass.title,
          assessmentType: ass.type,
          moduleTitle: ass.moduleTitle,
          qNumber: qIdx + 1,
        });
      });
    });

    return questions.filter((q) => {
      const matchesSearch =
        qbSearch.trim() === '' ||
        q.questionText?.toLowerCase().includes(qbSearch.toLowerCase().trim()) ||
        q.topic?.toLowerCase().includes(qbSearch.toLowerCase().trim()) ||
        q.assessmentTitle?.toLowerCase().includes(qbSearch.toLowerCase().trim());

      const matchesDifficulty =
        qbDifficulty === 'all' || (q.difficulty || 'medium') === qbDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [assessments, qbSearch, qbDifficulty]);

  // Filter Results Roster
  const filteredResults = useMemo(() => {
    return resultsData.filter((r) => {
      const traineeName = r.trainee?.name?.toLowerCase() || '';
      const traineeEmail = r.trainee?.email?.toLowerCase() || '';
      const q = resultsSearch.toLowerCase().trim();
      const matchesSearch = q === '' || traineeName.includes(q) || traineeEmail.includes(q);

      const hasPassed = (r.finalAttempt && r.finalAttempt.passed) || (r.moduleQuizAvg !== null && r.moduleQuizAvg >= 60);
      const matchesStatus =
        resultsStatusFilter === 'all' ||
        (resultsStatusFilter === 'passed' && hasPassed) ||
        (resultsStatusFilter === 'failed' && !hasPassed);

      return matchesSearch && matchesStatus;
    });
  }, [resultsData, resultsSearch, resultsStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Navigation Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-1">
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Assessment & Evaluation Hub</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Course Assessments & Knowledge Checks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Design quizzes, manage question banks, review trainee score distributions, and verify competency attainment.
            </p>
          </div>

          {/* Quick Create Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                const finalAss = assessments.find((a) => a.isFinal);
                setQuizModalConfig({
                  isOpen: true,
                  type: 'final',
                  moduleId: null,
                  moduleTitle: '',
                  initialAssessment: finalAss || null,
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{assessments.some((a) => a.isFinal) ? 'Edit Final Exam' : 'Create Final Exam'}</span>
            </button>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => setSubTab('overview')}
            className={`px-3.5 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              subTab === 'overview'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overview ({assessments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('question_bank')}
            className={`px-3.5 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              subTab === 'question_bank'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Question Bank ({questionBankList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('results')}
            className={`px-3.5 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              subTab === 'results'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Learner Results ({resultsData.length})</span>
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="py-20 flex justify-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <Loading message="Loading course assessments and attempt records..." />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchAssessmentsData} />
      ) : (
        <>
          {/* ====================================================
              SUB-TAB 1: ASSESSMENT OVERVIEW
              ==================================================== */}
          {subTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Summary KPI Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Quizzes</span>
                  <strong className="text-xl font-bold text-slate-900">{kpis.totalAssessments}</strong>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">Published</span>
                  <strong className="text-xl font-bold text-emerald-700">{kpis.activeAssessments}</strong>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase text-indigo-600 block">Total Attempts</span>
                  <strong className="text-xl font-bold text-indigo-700">{kpis.totalAttempts}</strong>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Avg Score</span>
                  <strong className="text-xl font-bold text-slate-900">
                    {kpis.avgScore !== null ? `${kpis.avgScore}%` : '--'}
                  </strong>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">Pass Rate</span>
                  <strong className="text-xl font-bold text-emerald-700">{kpis.passRate}%</strong>
                </div>
              </div>

              {/* Assessment Table */}
              {assessments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-sm space-y-3">
                  <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">No assessments created for this course yet</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    Add module quizzes to reinforce each topic, or build a comprehensive Final Assessment to unlock digital certificate issuance.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizModalConfig({
                        isOpen: true,
                        type: 'final',
                        moduleId: null,
                        moduleTitle: '',
                        initialAssessment: null,
                      });
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    Build Final Assessment
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3.5 px-4">Assessment Title & Placement</th>
                          <th className="py-3.5 px-4 text-center">Type</th>
                          <th className="py-3.5 px-4 text-center">Questions</th>
                          <th className="py-3.5 px-4 text-center">Time Limit</th>
                          <th className="py-3.5 px-4 text-center">Passing Req.</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {assessments.map((ass) => {
                          const isFinal = ass.isFinal || ass.type === 'final';
                          const isPublished = ass.status === 'published';
                          const qCount = ass.questions?.length || 0;
                          const totalMarks = (ass.questions || []).reduce((s, q) => s + (q.marks || 1), 0);

                          return (
                            <tr key={ass._id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Title & Placement */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-900 block text-xs">{ass.title}</span>
                                  {ass.moduleTitle ? (
                                    <span className="text-[11px] text-slate-400">
                                      Module: <strong className="text-slate-600">{ass.moduleTitle}</strong>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-indigo-600 font-semibold">
                                      Graduation Certification Exam
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Type */}
                              <td className="py-3.5 px-4 text-center">
                                <span
                                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                                    isFinal
                                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}
                                >
                                  {isFinal ? 'Final Exam' : 'Module Quiz'}
                                </span>
                              </td>

                              {/* Questions & Marks */}
                              <td className="py-3.5 px-4 text-center font-mono">
                                <strong>{qCount}</strong> Qs &bull; {totalMarks} Marks
                              </td>

                              {/* Time Limit */}
                              <td className="py-3.5 px-4 text-center font-mono">
                                {ass.timeLimit ? `${ass.timeLimit} mins` : 'Untimed'}
                              </td>

                              {/* Passing Percentage */}
                              <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                                {ass.passingPercentage || (isFinal ? 60 : 50)}%
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => handleToggleStatus(ass._id)}
                                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border transition-all ${
                                    isPublished
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                      : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                  }`}
                                  title="Click to toggle publish status"
                                >
                                  {ass.status}
                                </button>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Edit Quiz */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQuizModalConfig({
                                        isOpen: true,
                                        type: isFinal ? 'final' : 'module',
                                        moduleId: ass.module || null,
                                        moduleTitle: ass.moduleTitle || '',
                                        initialAssessment: ass,
                                      })
                                    }
                                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                    title="Edit Assessment"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Duplicate Quiz */}
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleDuplicate(ass._id)}
                                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                    title="Duplicate Assessment"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Quiz */}
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleDelete(ass._id, ass.title)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                    title="Delete Assessment"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              SUB-TAB 2: QUESTION BANK EXPLORER
              ==================================================== */}
          {subTab === 'question_bank' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Question Bank Toolbar */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={qbSearch}
                    onChange={(e) => setQbSearch(e.target.value)}
                    placeholder="Search questions by keyword, topic, or concept..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Difficulty:</span>
                    <select
                      value={qbDifficulty}
                      onChange={(e) => setQbDifficulty(e.target.value)}
                      className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Questions Grid */}
              {questionBankList.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-sm space-y-2">
                  <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800">No questions found in question bank</h4>
                  <p className="text-slate-400">Create quizzes or adjust your search filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questionBankList.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-colors flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[200px]">
                            {q.assessmentTitle}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                              q.difficulty === 'hard'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : q.difficulty === 'easy'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {q.difficulty || 'medium'}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {q.questionText}
                        </h4>

                        {/* Options List */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {['A', 'B', 'C', 'D'].map((optKey) => {
                            const optText = q[`option${optKey}`];
                            const isCorrect = q.correctOption === optKey;
                            if (!optText) return null;

                            return (
                              <div
                                key={optKey}
                                className={`p-1.5 rounded text-[11px] flex items-center gap-1.5 border ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {optKey}
                                </span>
                                <span className="truncate">{optText}</span>
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="p-2 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-600 leading-relaxed">
                            <span className="font-bold text-slate-400 uppercase text-[9px] block">Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{q.topic ? `Topic: ${q.topic}` : 'General Concept'}</span>
                        <span className="font-bold font-mono text-slate-700">{q.marks || 1} Marks</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              SUB-TAB 3: LEARNER ASSESSMENT RESULTS ROSTER
              ==================================================== */}
          {subTab === 'results' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Toolbar */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={resultsSearch}
                    onChange={(e) => setResultsSearch(e.target.value)}
                    placeholder="Search results by trainee name or email..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Outcome:</span>
                    <select
                      value={resultsStatusFilter}
                      onChange={(e) => setResultsStatusFilter(e.target.value)}
                      className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
                    >
                      <option value="all">All Trainees</option>
                      <option value="passed">Passed Assessment</option>
                      <option value="failed">At Risk / Failed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Roster Table */}
              {filteredResults.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-sm space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800">No assessment results recorded yet</h4>
                  <p className="text-slate-400">As enrolled learners submit quizzes and exams, their scores will appear here.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Learner Name</th>
                          <th className="py-3 px-4 text-center">Module Quizzes Avg</th>
                          <th className="py-3 px-4 text-center">Final Exam Score</th>
                          <th className="py-3 px-4 text-center">Overall Outcome</th>
                          <th className="py-3 px-4 text-center">Certificate</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredResults.map((item, idx) => {
                          const trainee = item.trainee || {};
                          const hasPassedFinal = item.finalAttempt?.passed;
                          const hasCert = Boolean(item.certificate);

                          return (
                            <tr key={trainee._id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900 block">{trainee.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono">{trainee.email}</span>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono">
                                {item.moduleQuizAvg !== null ? (
                                  <span className="font-bold text-slate-800">{item.moduleQuizAvg}%</span>
                                ) : (
                                  <span className="text-slate-400">--</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono">
                                {item.finalAttempt ? (
                                  <span
                                    className={`font-bold px-2 py-0.5 rounded border ${
                                      hasPassedFinal
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-rose-50 text-rose-800 border-rose-200'
                                    }`}
                                  >
                                    {item.finalAttempt.percentage}% ({item.finalAttempt.score}/{item.finalAttempt.totalMarks})
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Not Attempted</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                    hasPassedFinal
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : item.finalAttempt
                                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {hasPassedFinal ? 'Passed' : item.finalAttempt ? 'Failed' : 'Pending'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                {hasCert ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                                    <Award className="w-3 h-3 text-indigo-600" />
                                    <span>Verified</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">--</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                {item.finalAttempt ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReviewModalConfig({
                                        isOpen: true,
                                        attemptId: item.finalAttempt._id,
                                        assessmentTitle: 'Final Exam Attempt',
                                      })
                                    }
                                    className="px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 border border-indigo-300 rounded hover:bg-indigo-50 transition-colors inline-flex items-center gap-1"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Audit Attempt</span>
                                  </button>
                                ) : (
                                  <span className="text-slate-400 text-[11px] italic">No exam attempt</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Quiz / Assessment Builder Modal */}
      {quizModalConfig.isOpen && (
        <QuizBuilderModal
          isOpen={quizModalConfig.isOpen}
          onClose={() =>
            setQuizModalConfig({
              isOpen: false,
              type: 'module',
              moduleId: null,
              moduleTitle: '',
              initialAssessment: null,
            })
          }
          onSaved={() => {
            fetchAssessmentsData();
            if (onNotify) {
              onNotify({
                type: 'success',
                message: 'Assessment saved successfully.',
              });
            }
          }}
          type={quizModalConfig.type}
          moduleId={quizModalConfig.moduleId}
          courseId={courseId}
          moduleTitle={quizModalConfig.moduleTitle}
          courseTitle={courseTitle}
          initialAssessment={quizModalConfig.initialAssessment}
        />
      )}

      {/* Assessment Review Modal */}
      {reviewModalConfig.isOpen && (
        <AssessmentReviewModal
          isOpen={reviewModalConfig.isOpen}
          onClose={() =>
            setReviewModalConfig({
              isOpen: false,
              attemptId: null,
              assessmentTitle: '',
            })
          }
          attemptId={reviewModalConfig.attemptId}
        />
      )}
    </div>
  );
};

export default CourseAssessmentsView;
