import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsersApi, getUserByIdApi, toggleUserStatusApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Users,
  Search,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Power,
  X,
  BookOpen,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

const AdminUsersPage = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // User Details Modal & Safe Inline Deactivation State
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [roleData, setRoleData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllUsersApi({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
      });
      if (response && response.success) {
        setUsers(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load platform users.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleOpenDetails = async (userId) => {
    setDetailsLoading(true);
    setSelectedUser(null);
    setRoleData(null);
    setConfirmingDeactivate(false);
    try {
      const response = await getUserByIdApi(userId);
      if (response && response.success) {
        setSelectedUser(response.data.user);
        setRoleData(response.data.roleData);
      }
    } catch (err) {
      console.error('Error loading user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExecuteStatusToggle = async (userObj) => {
    if (authUser?.id === userObj._id || authUser?._id === userObj._id) {
      alert('Security Warning: You cannot deactivate your own administrator account.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await toggleUserStatusApi(userObj._id, !userObj.isActive);
      if (response && response.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userObj._id ? { ...u, isActive: !u.isActive } : u))
        );
        if (selectedUser && selectedUser._id === userObj._id) {
          setSelectedUser((prev) => ({ ...prev, isActive: !prev.isActive }));
        }
        setConfirmingDeactivate(false);
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
          <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>User Directory & Access Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Platform User Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Search, audit, inspect portfolios, and manage active account statuses for all registered platform trainees, trainers, and administrators.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, dept..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Role & Status Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1">
            {['all', 'trainee', 'trainer', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider transition-colors ${
                  roleFilter === r
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <Loading message="Loading platform users..." />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm space-y-2">
          <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-700 dark:text-slate-200">No users found matching your search criteria.</p>
          <p className="text-slate-400 dark:text-slate-500">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {users.map((u) => {
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        <div>
                          <span>{u.name}</span>
                          <span className="text-[11px] text-slate-400 block font-normal">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            u.role === 'admin'
                              ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              : u.role === 'trainer'
                              ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          ) : u.role === 'trainer' ? (
                            <UserCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          ) : (
                            <GraduationCap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          )}
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.department || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            u.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                          }`}
                        >
                          {u.isActive ? (
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
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {/* Requirement 8: Clean Actions column with Details button only */}
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(u._id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          USER DETAILS MODAL WITH SAFE INLINE CONFIRMATION
          ==================================================== */}
      {(selectedUser || detailsLoading) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  User Account & Portfolio Inspection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setRoleData(null);
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
                  <Loading message="Loading user account details..." />
                </div>
              ) : selectedUser ? (
                <>
                  {/* Account Summary Card */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.name}</h4>
                      <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {selectedUser.role}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Dept: <strong>{selectedUser.department || 'Not Assigned'}</strong>
                        </span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                          selectedUser.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                        }`}
                      >
                        {selectedUser.isActive ? 'Active Status' : 'Deactivated'}
                      </span>
                    </div>
                  </div>

                  {/* Role Data: Trainee */}
                  {selectedUser.role === 'trainee' && roleData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-mono block">Enrolled</span>
                          <strong className="text-sm font-bold text-blue-900 dark:text-blue-100">{roleData.totalEnrollments}</strong>
                        </div>
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-mono block">Completed</span>
                          <strong className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{roleData.completedCourses}</strong>
                        </div>
                        <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-center">
                          <span className="text-[10px] text-purple-700 dark:text-purple-300 uppercase font-mono block">Skills</span>
                          <strong className="text-sm font-bold text-purple-900 dark:text-purple-100">{roleData.verifiedSkillsCount}</strong>
                        </div>
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
                          <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-mono block">Avg Score</span>
                          <strong className="text-sm font-bold text-amber-900 dark:text-amber-100">{roleData.averageScore}%</strong>
                        </div>
                      </div>

                      {/* Enrolled Courses */}
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">
                          Course Enrollments ({roleData.enrollments?.length || 0})
                        </h5>
                        {roleData.enrollments?.length === 0 ? (
                          <p className="text-slate-400 italic">No courses enrolled yet.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {roleData.enrollments.map((e) => (
                              <div
                                key={e.courseId}
                                className="p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-semibold text-slate-900 dark:text-white">{e.title}</span>
                                  <span className="text-[10px] text-slate-400 block">{e.category} &bull; {e.level}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{e.progress}%</span>
                                  <span className="text-[10px] text-slate-400 block uppercase">{e.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Role Data: Trainer */}
                  {selectedUser.role === 'trainer' && roleData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-center">
                          <span className="text-[10px] text-teal-700 dark:text-teal-300 uppercase font-mono block">Courses</span>
                          <strong className="text-sm font-bold text-teal-900 dark:text-teal-100">{roleData.totalCourses}</strong>
                        </div>
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-mono block">Published</span>
                          <strong className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{roleData.publishedCourses}</strong>
                        </div>
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-mono block">Learners</span>
                          <strong className="text-sm font-bold text-blue-900 dark:text-blue-100">{roleData.totalLearners}</strong>
                        </div>
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
                          <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-mono block">Avg Rating</span>
                          <strong className="text-sm font-bold text-amber-900 dark:text-amber-100">{roleData.averageRating} &starf;</strong>
                        </div>
                      </div>

                      {/* Created Courses */}
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">
                          Instructed Courses ({roleData.courses?.length || 0})
                        </h5>
                        {roleData.courses?.length === 0 ? (
                          <p className="text-slate-400 italic">No courses created yet.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {roleData.courses.map((c) => (
                              <div
                                key={c.courseId}
                                className="p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-semibold text-slate-900 dark:text-white">{c.title}</span>
                                  <span className="text-[10px] text-slate-400 block">{c.category} &bull; {c.level}</span>
                                </div>
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
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer with Safe Inline Confirmation */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between transition-colors">
              <div>
                {selectedUser && authUser?.id !== selectedUser._id && authUser?._id !== selectedUser._id && (
                  confirmingDeactivate ? (
                    <div className="flex items-center gap-2 p-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                        {selectedUser.isActive ? 'Confirm deactivation?' : 'Confirm activation?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleExecuteStatusToggle(selectedUser)}
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
                        selectedUser.isActive
                          ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                          : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}</span>
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setRoleData(null);
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

export default AdminUsersPage;
