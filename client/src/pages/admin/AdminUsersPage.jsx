import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsersApi, getUserByIdApi, toggleUserStatusApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Power,
  X,
  BookOpen,
  Award,
  Calendar,
  Layers,
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

  // User Details Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [roleData, setRoleData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleToggleStatus = async (userObj) => {
    if (authUser?.id === userObj._id || authUser?._id === userObj._id) {
      alert('Security Warning: You cannot deactivate your own administrator account.');
      return;
    }

    const confirmMsg = userObj.isActive
      ? `Are you sure you want to deactivate ${userObj.name}'s account?`
      : `Are you sure you want to activate ${userObj.name}'s account?`;

    if (!window.confirm(confirmMsg)) return;

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
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>User Directory & Access Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Platform User Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Search, audit, inspect portfolios, and manage active account statuses for all registered platform trainees, trainers, and administrators.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, dept..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
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
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700 font-medium"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex justify-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <Loading message="Loading platform users..." />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-sm space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No users found matching your search criteria.</p>
          <p className="text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => {
                  const isCurrentAdmin = authUser?.id === u._id || authUser?._id === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>
                          <span>{u.name}</span>
                          <span className="text-[11px] text-slate-400 block font-normal">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : u.role === 'trainer'
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                          ) : u.role === 'trainer' ? (
                            <UserCheck className="w-3 h-3 text-teal-600" />
                          ) : (
                            <GraduationCap className="w-3 h-3 text-blue-600" />
                          )}
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{u.department || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          {u.isActive ? (
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
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(u._id)}
                            className="px-2 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {!isCurrentAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              disabled={actionLoading}
                              className={`px-2 py-1 text-xs font-semibold rounded border transition-colors inline-flex items-center gap-1 ${
                                u.isActive
                                  ? 'text-red-700 border-red-200 hover:bg-red-50'
                                  : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                              }`}
                              title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                            >
                              <Power className="w-3 h-3" />
                              <span>{u.isActive ? 'Deactivate' : 'Activate'}</span>
                            </button>
                          )}
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

      {/* ====================================================
          USER DETAILS MODAL
          ==================================================== */}
      {(selectedUser || detailsLoading) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">User Profile & Activity Audit</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setRoleData(null);
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
                  <Loading message="Loading profile and learning records..." />
                </div>
              ) : selectedUser ? (
                <>
                  {/* Basic Profile Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{selectedUser.name}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-300 font-bold uppercase text-[10px] text-slate-700">
                          Role: {selectedUser.role}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-600 text-[10px]">
                          Dept: {selectedUser.department || 'General'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          selectedUser.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        {selectedUser.isActive ? 'Active Account' : 'Deactivated'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Role Data: Trainee */}
                  {selectedUser.role === 'trainee' && roleData && (
                    <div className="space-y-4">
                      {/* Summary Metrics */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                          <span className="text-[10px] text-blue-700 uppercase font-mono block">Enrolled</span>
                          <strong className="text-base text-blue-900 font-bold">{roleData.totalEnrolled}</strong>
                        </div>
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                          <span className="text-[10px] text-emerald-700 uppercase font-mono block">Completed</span>
                          <strong className="text-base text-emerald-900 font-bold">{roleData.completedCount}</strong>
                        </div>
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                          <span className="text-[10px] text-indigo-700 uppercase font-mono block">Certificates</span>
                          <strong className="text-base text-indigo-900 font-bold">{roleData.certificatesEarned}</strong>
                        </div>
                      </div>

                      {/* Enrolled Courses */}
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                          Enrolled Courses ({roleData.enrollments?.length || 0})
                        </h5>
                        {roleData.enrollments?.length === 0 ? (
                          <p className="text-slate-400 italic">No courses enrolled yet.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {roleData.enrollments.map((e) => (
                              <div
                                key={e.enrollmentId}
                                className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-semibold text-slate-900">{e.courseTitle}</span>
                                  <span className="text-[10px] text-slate-400 block">{e.category}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-emerald-700">{e.progress}%</span>
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
                      {/* Summary Metrics */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-center">
                          <span className="text-[10px] text-teal-700 uppercase font-mono block">Courses</span>
                          <strong className="text-sm font-bold text-teal-900">{roleData.totalCourses}</strong>
                        </div>
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                          <span className="text-[10px] text-emerald-700 uppercase font-mono block">Published</span>
                          <strong className="text-sm font-bold text-emerald-900">{roleData.publishedCourses}</strong>
                        </div>
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-center">
                          <span className="text-[10px] text-blue-700 uppercase font-mono block">Learners</span>
                          <strong className="text-sm font-bold text-blue-900">{roleData.totalLearners}</strong>
                        </div>
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-center">
                          <span className="text-[10px] text-amber-700 uppercase font-mono block">Avg Rating</span>
                          <strong className="text-sm font-bold text-amber-900">{roleData.averageRating} &starf;</strong>
                        </div>
                      </div>

                      {/* Created Courses */}
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                          Instructed Courses ({roleData.courses?.length || 0})
                        </h5>
                        {roleData.courses?.length === 0 ? (
                          <p className="text-slate-400 italic">No courses created yet.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {roleData.courses.map((c) => (
                              <div
                                key={c.courseId}
                                className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-semibold text-slate-900">{c.title}</span>
                                  <span className="text-[10px] text-slate-400 block">{c.category} &bull; {c.level}</span>
                                </div>
                                <span
                                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                    c.status === 'published'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-200 text-slate-700'
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

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                {selectedUser && authUser?.id !== selectedUser._id && authUser?._id !== selectedUser._id && (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedUser)}
                    disabled={actionLoading}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors inline-flex items-center gap-1.5 ${
                      selectedUser.isActive
                        ? 'text-red-700 bg-red-50 border-red-300 hover:bg-red-100'
                        : 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setRoleData(null);
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

export default AdminUsersPage;
