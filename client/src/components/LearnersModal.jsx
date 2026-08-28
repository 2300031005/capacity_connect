import React, { useState, useEffect, useCallback } from 'react';
import { getCourseAssessmentResultsApi } from '../services/api';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import AssessmentReviewModal from './AssessmentReviewModal';
import { Users, X, Search, GraduationCap, Calendar, CheckCircle2, Award, FileCheck, Eye } from 'lucide-react';

const LearnersModal = ({ courseId, onClose }) => {
  if (!courseId) return null;

  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewAttemptId, setReviewAttemptId] = useState(null);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCourseAssessmentResultsApi(courseId);
      if (response && response.success) {
        setResultsData(response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch enrolled learner assessment results');
      }
    } catch (err) {
      console.error('Error loading learners assessment data:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Could not load enrolled learners assessment data.'
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const learners = resultsData?.learners || [];
  const courseInfo = resultsData?.course;

  const filteredLearners = learners.filter((l) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.name.toLowerCase().includes(term) ||
      l.email.toLowerCase().includes(term) ||
      l.department.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Enrolled Learners & Performance {courseInfo ? `(${learners.length})` : ''}
              </h3>
              {courseInfo && (
                <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                  Course: <span className="font-semibold text-slate-700">{courseInfo.title}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by learner name, email, or department..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-slate-50/50">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loading message="Loading learner assessment results..." />
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchResults} />
          ) : filteredLearners.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-xs text-slate-500 space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-5 h-5" />
              </div>
              <p className="font-semibold text-slate-700">
                {searchTerm
                  ? 'No learners match your search.'
                  : 'No learners have enrolled in this course yet.'}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Learner Name</th>
                      <th className="py-3 px-4">Email / Dept</th>
                      <th className="py-3 px-4 text-center">Progress</th>
                      <th className="py-3 px-4 text-center">Module Quizzes Avg</th>
                      <th className="py-3 px-4 text-center">Final Assessment</th>
                      <th className="py-3 px-4 text-center">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredLearners.map((learner) => (
                      <tr key={learner.traineeId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {learner.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <p>{learner.email}</p>
                          <span className="text-[10px] text-slate-400">{learner.department}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-slate-800">{learner.progress}%</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {learner.moduleQuizAvg !== null ? (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                              {learner.moduleQuizAvg}% ({learner.moduleQuizzesAttempted})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No attempts</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {learner.finalScore !== null ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                                  learner.finalPassed
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-red-50 text-red-800 border-red-200'
                                }`}
                              >
                                {learner.finalScore}% — {learner.finalPassed ? 'PASSED' : 'FAILED'}
                              </span>

                              {learner.finalAttemptId && (
                                <button
                                  type="button"
                                  onClick={() => setReviewAttemptId(learner.finalAttemptId)}
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                  title="Review Submission Answers"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Not attempted</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {learner.hasCertificate ? (
                            <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              <Award className="w-3 h-3 text-emerald-600" />
                              <span>{learner.certificateId}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Assessment Review Modal */}
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

export default LearnersModal;
