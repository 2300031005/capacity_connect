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
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const AdminTrainersPage = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Trainer Details Modal
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerDetails, setTrainerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleToggleStatus = async (trainerObj) => {
    const confirmMsg = trainerObj.isActive
      ? `Are you sure you want to deactivate trainer ${trainerObj.name}?`
      : `Are you sure you want to activate trainer ${trainerObj.name}?`;

    if (!window.confirm(confirmMsg)) return;

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
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 mb-2">
          <UserCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Faculty & Curriculum Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Trainer & Faculty Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Supervise platform instructors, inspect curriculum development portfolios, and monitor learner capacity across courses.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search trainers by name, email, dept..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Total Trainers: <strong className="text-slate-900">{filteredTrainers.length}</strong>
        </span>
      </div>

      {/* Trainers Table */}
      {loading ? (
        <div className="py-20 flex justify-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <Loading message="Loading platform trainers..." />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchTrainers} />
      ) : filteredTrainers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-sm space-y-2">
          <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No trainers found matching your search.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Trainer</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Courses</th>
                  <th className="py-3 px-4 text-center">Published</th>
                  <th className="py-3 px-4 text-center">Total Learners</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTrainers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>
                        <span>{t.name}</span>
                        <span className="text-[11px] text-slate-400 block font-normal">{t.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{t.department}</td>
                    <td className="py-3 px-4 text-center font-bold">{t.totalCourses}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">{t.publishedCourses}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700">{t.totalLearners}</td>
                    <td className="py-3 px-4 text-center">
                      {t.averageRating > 0 ? (
                        <span className="inline-flex items-center gap-0.5 font-bold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{t.averageRating}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Unrated</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${t.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                      >
                        {t.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Deactivated</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(t._id)}
                          className="px-2 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(t)}
                          disabled={actionLoading}
                          className={`px-2 py-1 text-xs font-semibold rounded border transition-colors inline-flex items-center gap-1 ${t.isActive
                              ? 'text-red-700 border-red-200 hover:bg-red-50'
                              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                            }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{t.isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          TRAINER DETAILS MODAL
          ==================================================== */}
      {(selectedTrainer || detailsLoading) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Trainer Portfolio & Course Audit</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTrainer(null);
                  setTrainerDetails(null);
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
                  <Loading message="Loading trainer portfolio..." />
                </div>
              ) : selectedTrainer && trainerDetails ? (
                <>
                  {/* Profile Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{selectedTrainer.name}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">{selectedTrainer.email}</p>
                      <span className="text-slate-600 text-[10px] mt-1 block">
                        Department: <strong>{selectedTrainer.department || 'General'}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${selectedTrainer.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                      >
                        {selectedTrainer.isActive ? 'Active Account' : 'Deactivated'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Member since {new Date(selectedTrainer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Summary Strip */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg">
                      <span className="text-[10px] text-teal-700 uppercase font-mono block">Courses</span>
                      <strong className="text-sm font-bold text-teal-900">{trainerDetails.summary?.totalCourses}</strong>
                    </div>
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="text-[10px] text-emerald-700 uppercase font-mono block">Published</span>
                      <strong className="text-sm font-bold text-emerald-900">{trainerDetails.summary?.publishedCourses}</strong>
                    </div>
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-[10px] text-blue-700 uppercase font-mono block">Learners</span>
                      <strong className="text-sm font-bold text-blue-900">{trainerDetails.summary?.totalLearners}</strong>
                    </div>
                    <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                      <span className="text-[10px] text-purple-700 uppercase font-mono block">Enrollments</span>
                      <strong className="text-sm font-bold text-purple-900">{trainerDetails.summary?.totalEnrollments}</strong>
                    </div>
                  </div>

                  {/* Courses List */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                      Authored Courses ({trainerDetails.courses?.length || 0})
                    </h5>

                    {trainerDetails.courses?.length === 0 ? (
                      <p className="text-slate-400 italic">No courses created yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {trainerDetails.courses.map((c) => (
                          <div
                            key={c.courseId}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">{c.title}</span>
                              <span className="text-[10px] text-slate-400 block">
                                {c.category} &bull; {c.level} &bull; {c.enrollmentCount} learners &bull; {c.completionCount} completed
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {c.averageRating > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold text-[10px]">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{c.averageRating}</span>
                                </span>
                              )}
                              <span
                                className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${c.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-700'
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

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                {selectedTrainer && (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedTrainer)}
                    disabled={actionLoading}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors inline-flex items-center gap-1.5 ${selectedTrainer.isActive
                        ? 'text-red-700 bg-red-50 border-red-300 hover:bg-red-100'
                        : 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                      }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{selectedTrainer.isActive ? 'Deactivate Account' : 'Activate Account'}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTrainer(null);
                  setTrainerDetails(null);
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

export default AdminTrainersPage;
