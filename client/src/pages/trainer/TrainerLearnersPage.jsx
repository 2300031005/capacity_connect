import React, { useState, useEffect, useCallback } from 'react';
import { getTrainerLearnersApi, getTrainerLearnerDetailsApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Users,
  Search,
  BookOpen,
  Award,
  FileCheck,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

const TrainerLearnersPage = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Learner Details Modal
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [learnerDetails, setLearnerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchLearners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTrainerLearnersApi();
      if (response && response.success) {
        setLearners(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch learners');
      }
    } catch (err) {
      console.error('Error fetching trainer learners:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load your enrolled learners.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);

  const handleOpenDetails = async (traineeId) => {
    setDetailsLoading(true);
    setSelectedLearner(null);
    setLearnerDetails(null);
    try {
      const response = await getTrainerLearnerDetailsApi(traineeId);
      if (response && response.success) {
        setSelectedLearner(response.data.learner);
        setLearnerDetails(response.data);
      }
    } catch (err) {
      console.error('Error loading learner details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredLearners = learners.filter((l) => {
    const t = l.trainee;
    if (!t) return false;
    const matches =
      t.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (t.department && t.department.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    return matches;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 mb-2">
          <Users className="w-3.5 h-3.5 text-teal-600" />
          <span>Learner Roster & Progress Tracking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Consolidated Learner Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Track learners enrolled across your courses, monitor module completion rates, inspect quiz outcomes, and audit earned certificates.
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search learners by name, email, dept..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Enrolled Learners: <strong className="text-slate-900">{filteredLearners.length}</strong>
        </span>
      </div>

      {/* Learners Table */}
      {loading ? (
        <div className="py-20 flex justify-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <Loading message="Loading enrolled learners..." />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchLearners} />
      ) : filteredLearners.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-sm space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No learners enrolled in your courses yet.</p>
          <p className="text-slate-400">Publish courses to begin attracting learners.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Learner</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Courses Enrolled</th>
                  <th className="py-3 px-4 text-center">Avg Progress</th>
                  <th className="py-3 px-4 text-center">Courses Completed</th>
                  <th className="py-3 px-4 text-center">Certificates</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLearners.map((l) => (
                  <tr key={l.trainee._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div>
                          <span>{l.trainee.name}</span>
                          <span className="text-[11px] text-slate-400 block font-normal">{l.trainee.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{l.trainee.department}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700">{l.coursesEnrolledCount}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 rounded-full" style={{ width: `${l.averageProgress}%` }} />
                        </div>
                        <span className="font-semibold">{l.averageProgress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">{l.coursesCompletedCount}</td>
                    <td className="py-3 px-4 text-center">
                      {l.certificatesEarnedCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                          <Award className="w-3 h-3 text-indigo-600" />
                          <span>{l.certificatesEarnedCount}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(l.lastActivity).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(l.trainee._id)}
                        className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:text-teal-900 border border-teal-300 rounded hover:bg-teal-50 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          LEARNER DETAILS MODAL (TRAINER-OWNED COURSES ONLY)
          ==================================================== */}
      {(selectedLearner || detailsLoading) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Learner Progress & Assessment Audit</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLearner(null);
                  setLearnerDetails(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {detailsLoading ? (
                <div className="py-12 flex justify-center">
                  <Loading message="Loading learner details..." />
                </div>
              ) : selectedLearner && learnerDetails ? (
                <>
                  {/* Learner Profile Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{selectedLearner.name}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">{selectedLearner.email}</p>
                      <span className="text-slate-600 text-[10px] mt-1 block">
                        Department: <strong>{selectedLearner.department || 'General'}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px]">
                          {learnerDetails.summary?.trainerCoursesEnrolled} Courses Enrolled
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                          {learnerDetails.summary?.trainerCoursesCompleted} Completed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Breakdowns */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                      Progress in Your Courses ({learnerDetails.courses?.length || 0})
                    </h5>

                    {learnerDetails.courses?.map((c) => (
                      <div key={c.courseId} className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div>
                            <span className="font-bold text-slate-900 block">{c.courseTitle}</span>
                            <span className="text-[10px] text-slate-400">
                              {c.completedModulesCount} / {c.totalModulesCount} Modules Completed
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-emerald-700">{c.progress}%</span>
                            <span className="text-[10px] text-slate-400 block uppercase">{c.status}</span>
                          </div>
                        </div>

                        {/* Quiz & Assessment Performance */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">
                            Assessments & Quizzes ({c.attempts?.length || 0})
                          </span>

                          {c.attempts?.length === 0 ? (
                            <p className="text-slate-400 italic text-[11px]">No assessments attempted for this course yet.</p>
                          ) : (
                            <div className="space-y-1">
                              {c.attempts.map((att) => (
                                <div
                                  key={att.attemptId}
                                  className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                                >
                                  <div>
                                    <span className="font-semibold text-slate-800">{att.assessmentTitle}</span>
                                    <span className="text-[10px] text-slate-400 block">
                                      {att.type === 'final' ? 'Final Exam' : 'Module Quiz'} &bull; Score: {att.score}/{att.totalMarks} ({att.percentage}%)
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                      att.passed
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {att.passed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Certificate */}
                        {c.certificate && (
                          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-indigo-600" />
                              <div>
                                <span className="font-bold text-indigo-950 block">Certificate Earned ({c.certificate.percentage}%)</span>
                                <span className="font-mono text-[10px] text-indigo-700">{c.certificate.certificateId}</span>
                              </div>
                            </div>
                            <span className="text-slate-400 text-[10px]">
                              {new Date(c.certificate.issueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedLearner(null);
                  setLearnerDetails(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerLearnersPage;
