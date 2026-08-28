import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, FileCheck, BarChart3, UserCheck } from 'lucide-react';

const TrainerDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Role: Trainer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Trainer'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Department: {user?.department || 'Instructional Faculty'}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Courses Created */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Courses Created</span>
            <BookOpen className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Curriculum authoring in Phase 3</p>
        </div>

        {/* Active Learners */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Learners</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Enrolled trainees across cohorts</p>
        </div>

        {/* Assessments */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Assessments</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Quizzes and milestone evaluations</p>
        </div>

        {/* Average Performance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Performance</span>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">--</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting cohort assessment data</p>
        </div>
      </div>

      {/* Guidance Message */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-600 shadow-sm">
        <p className="text-sm">
          Your trainer workspace is ready. Course and learner management will be available in the next modules.
        </p>
      </div>
    </div>
  );
};

export default TrainerDashboardPage;
