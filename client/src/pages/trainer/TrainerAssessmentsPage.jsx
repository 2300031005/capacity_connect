import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTrainerAssessmentsOverviewApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import LearnersModal from '../../components/LearnersModal';
import {
  FileCheck,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
  ArrowRight,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

const TrainerAssessmentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [activeLearnersModal, setActiveLearnersModal] = useState({
    isOpen: false,
    courseId: null,
    courseTitle: '',
  });

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTrainerAssessmentsOverviewApi();
      if (response && response.success) {
        setAssessments(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to load assessment overview.');
      }
    } catch (err) {
      console.error('Error loading trainer assessments:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load assessment overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const totalAssessments = assessments.length;
  const publishedCount = assessments.filter((a) => a.status === 'published').length;
  const totalAttempts = assessments.reduce((sum, a) => sum + (a.totalAttempts || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Curriculum Evaluation Hub</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Assessment Management & Performance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Centralized oversight of all module quizzes and final course assessments created across your instructional courses.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg flex-shrink-0">
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-base font-bold text-slate-900">{totalAssessments}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Total</span>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-base font-bold text-emerald-700">{publishedCount}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Published</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-base font-bold text-indigo-700">{totalAttempts}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Attempts</span>
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchOverview} />}

      {/* Assessment Table / List */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loading message="Loading assessment overview..." />
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No assessments created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not created any module quizzes or final assessments. Navigate to your courses to add interactive quizzes.
          </p>
          <Link
            to="/trainer/courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2"
          >
            <span>Go to My Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Assessment Title</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Questions & Marks</th>
                  <th className="py-3 px-4">Pass Req.</th>
                  <th className="py-3 px-4">Attempts / Avg</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map((ass) => {
                  const isFinal = ass.type === 'final';
                  const isPublished = ass.status === 'published';

                  return (
                    <tr key={ass._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 font-bold block">{ass.title}</strong>
                        {ass.moduleTitle && (
                          <span className="text-[11px] text-slate-400">
                            Module: {ass.moduleTitle}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {ass.courseTitle || 'Course'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            isFinal
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isFinal ? 'Final Exam' : 'Module Quiz'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {ass.questionCount} Qs • {ass.totalMarks} Marks
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-700 font-mono">
                        {ass.passingPercentage}%
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 font-bold font-mono">
                          {ass.totalAttempts} attempts
                        </div>
                        {ass.avgScore !== null && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            Avg: {ass.avgScore}% ({ass.passedCount} passed)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {ass.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveLearnersModal({
                                isOpen: true,
                                courseId: ass.courseId,
                                courseTitle: ass.courseTitle || '',
                              })
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                          >
                            <Users className="w-3 h-3" />
                            <span>Learners</span>
                          </button>

                          <Link
                            to={`/trainer/courses/${ass.courseId}/manage`}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
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

      {/* Learners Performance Roster Modal */}
      {activeLearnersModal.isOpen && (
        <LearnersModal
          isOpen={activeLearnersModal.isOpen}
          onClose={() =>
            setActiveLearnersModal({ isOpen: false, courseId: null, courseTitle: '' })
          }
          courseId={activeLearnersModal.courseId}
          courseTitle={activeLearnersModal.courseTitle}
        />
      )}
    </div>
  );
};

export default TrainerAssessmentsPage;
