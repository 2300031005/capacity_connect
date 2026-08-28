import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, Target, Sparkles, GraduationCap } from 'lucide-react';

const TraineeDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Role: Trainee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Trainee'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Department: {user?.department || 'General Learning Track'}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Learning Progress */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Learning Progress</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No courses enrolled yet</p>
          <p className="text-[11px] text-slate-400 mt-2">Course enrollment unlocks in Phase 3</p>
        </div>

        {/* Current Competency */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Competency</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Not assessed yet</p>
          <p className="text-[11px] text-slate-400 mt-2">Initial diagnostic required</p>
        </div>

        {/* Skill Gaps */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Skill Gaps</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No skill gaps identified yet</p>
          <p className="text-[11px] text-slate-400 mt-2">Evaluated via course assessments</p>
        </div>

        {/* Recommended Learning */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Recommended Learning</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Available soon</p>
          <p className="text-[11px] text-slate-400 mt-2">AI-driven recommendations</p>
        </div>
      </div>

      {/* Informative Guidance Box */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-600 shadow-sm">
        <p className="text-sm">
          Your personalized learning journey will appear here as you complete courses and assessments.
        </p>
      </div>
    </div>
  );
};

export default TraineeDashboardPage;
