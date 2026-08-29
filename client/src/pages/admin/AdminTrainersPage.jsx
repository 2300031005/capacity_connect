import React, { useState, useEffect, useCallback } from 'react';
import { getTrainersApi, getTrainerByIdApi, toggleUserStatusApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  UserCheck,
  Search,
  BookOpen,
  Users,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  Power,
  X,
  AlertTriangle,
} from 'lucide-react';

const AdminTrainersPage = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Trainer Details Modal & Safe Inline Deactivation State
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerDetails, setTrainerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTrainersApi();
      if (response && response.success) {
        setTrainers(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch trainers');
      }
    } catch (err) {
      console.error('Error fetching trainers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load platform trainers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const handleOpenDetails = async (trainerId) => {
    setDetailsLoading(true);
    setSelectedTrainer(null);
    setTrainerDetails(null);
    setConfirmingDeactivate(false);
    try {
      const response = await getTrainerByIdApi(trainerId);
      if (response && response.success) {
        setSelectedTrainer(response.data.trainer);
        setTrainerDetails(response.data);
      }
    } catch (err) {
      console.error('Error loading trainer details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExecuteStatusToggle = async (trainerObj) => {
    setActionLoading(true);
    try {
      const response = await toggleUserStatusApi(trainerObj._id, !trainerObj.isActive);
      if (response && response.success) {
        setTrainers((prev) =>
          prev.map((t) => (t._id === trainerObj._id ? { ...t, isActive: !t.isActive } : t))
        );
        if (selectedTrainer && selectedTrainer._id === trainerObj._id) {
          setSelectedTrainer((prev) => ({ ...prev, isActive: !prev.isActive }));
        }
        setConfirmingDeactivate(false);
      }
    } catch (err) {
      console.error('Error toggling trainer status:', err);
      alert(err.response?.data?.message || 'Failed to update trainer status.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (t.department && t.department.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-2">
          <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Faculty & Curriculum Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Trainer & Faculty Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Supervise platform instructors, inspect curriculum development portfolios, and monitor learner capacity across courses.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3 transition-colors">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search trainers by name, email, dept..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Total Trainers: <strong className="text-slate-900 dark:text-white">{filteredTrainers.length}</strong>
        </span>
      </div>

      {/* Trainers Table */}
      {loading ? (
        <div className="py-20 flex justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <Loading message="Loading platform trainers..." />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchTrainers} />
      ) : filteredTrainers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm space-y-2">
          <UserCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-700 dark:text-slate-200">No trainers found matching your search.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Trainer</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Courses Created</th>
                  <th className="py-3 px-4">Total Learners</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredTrainers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <div>
                        <span>{t.name}</span>
                        <span className="text-[11px] text-slate-400 block font-normal">{t.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{t.department || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>{t.coursesCount || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{t.learnersCount || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          t.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                        }`}
                      >
                        {t.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                            <span>Deactivated</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {/* Requirement 8: Clean Actions column with Details button only */}
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(t._id)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                        title="Inspect Faculty Portfolio"
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
          TRAINER DETAILS MODAL WITH SAFE INLINE CONFIRMATION
          ==================================================== */}
      {(selectedTrainer || detailsLoading) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Trainer Portfolio & Course Audit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTrainer(null);
                  setTrainerDetails(null);
                  setConfirmingDeactivate(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {detailsLoading ? (
                <div className="py-12 flex justify-center">
                  <Loading message="Loading trainer portfolio..." />
                </div>
              ) : selectedTrainer && trainerDetails ? (
                <>
                  {/* Profile Card */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedTrainer.name}</h4>
                      <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{selectedTrainer.email}</p>
                      <span className="text-slate-600 dark:text-slate-400 text-[10px] mt-1 block">
                        Department: <strong>{selectedTrainer.department || 'General Faculty'}</strong>
                      </span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                          selectedTrainer.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                        }`}
                      >
                        {selectedTrainer.isActive ? 'Active Status' : 'Deactivated'}
                      </span>
                    </div>
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-center">
                      <span className="text-[10px] text-teal-700 dark:text-teal-300 uppercase font-mono block">Total Courses</span>
                      <strong className="text-sm font-bold text-teal-900 dark:text-teal-100">{trainerDetails.totalCourses || 0}</strong>
                    </div>
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-mono block">Published</span>
                      <strong className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{trainerDetails.publishedCourses || 0}</strong>
                    </div>
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                      <span className="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-mono block">Learners</span>
                      <strong className="text-sm font-bold text-blue-900 dark:text-blue-100">{trainerDetails.totalLearners || 0}</strong>
                    </div>
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-mono block">Avg Rating</span>
                      <strong className="text-sm font-bold text-amber-900 dark:text-amber-100">{trainerDetails.averageRating || 0} &starf;</strong>
                    </div>
                  </div>

                  {/* Created Courses */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">
                      Assigned Curriculum Courses ({trainerDetails.courses?.length || 0})
                    </h5>
                    {!trainerDetails.courses || trainerDetails.courses.length === 0 ? (
                      <p className="text-slate-400 italic">No courses created yet.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {trainerDetails.courses.map((c) => (
                          <div
                            key={c.courseId}
                            className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{c.title}</span>
                              <span className="text-[10px] text-slate-400 block">
                                {c.category} &bull; {c.level} &bull; {c.enrolledCount || 0} Learners
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {c.averageRating > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{c.averageRating}</span>
                                </span>
                              )}
                              <span
                                className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                  c.status === 'published'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {c.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer with Safe Inline Confirmation */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between transition-colors">
              <div>
                {selectedTrainer && (
                  confirmingDeactivate ? (
                    <div className="flex items-center gap-2 p-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                        {selectedTrainer.isActive ? 'Confirm deactivation?' : 'Confirm activation?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleExecuteStatusToggle(selectedTrainer)}
                        disabled={actionLoading}
                        className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors shadow-2xs"
                      >
                        {actionLoading ? 'Updating...' : 'Yes, Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeactivate(false)}
                        className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDeactivate(true)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors inline-flex items-center gap-1.5 ${
                        selectedTrainer.isActive
                          ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                          : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{selectedTrainer.isActive ? 'Deactivate Account' : 'Activate Account'}</span>
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTrainer(null);
                  setTrainerDetails(null);
                  setConfirmingDeactivate(false);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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

export default AdminTrainersPage;
