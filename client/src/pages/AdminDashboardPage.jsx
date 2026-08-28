import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, GraduationCap, UserCheck, BookOpen, ShieldCheck } from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role: Administrator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Department: {user?.department || 'Executive Governance'}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Active platform accounts</p>
        </div>

        {/* Trainees */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Trainees</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Registered learner accounts</p>
        </div>

        {/* Trainers */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Trainers</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Authorized instructors</p>
        </div>

        {/* Courses */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Courses</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Published learning paths</p>
        </div>
      </div>

      {/* Guidance Message */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-600 shadow-sm">
        <p className="text-sm">
          Platform administration and analytics will be available in upcoming modules.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
