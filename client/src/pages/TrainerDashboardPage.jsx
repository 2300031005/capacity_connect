import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCoursesApi } from '../services/api';
import {
  BookOpen,
  Users,
  FileCheck,
  BarChart3,
  UserCheck,
  BookPlus,
  ArrowRight
} from 'lucide-react';

const TrainerDashboardPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainerData = async () => {
      try {
        const response = await getCoursesApi({ mine: 'true' });
        if (response && response.success) {
          setCourses(response.data || []);
        }
      } catch (err) {
        console.warn('Could not load trainer courses on dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTrainerData();
  }, []);

  const totalEnrolledLearners = courses.reduce(
    (acc, curr) => acc + (curr.enrolledCount || 0),
    0
  );

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

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/trainer/courses"
              className="px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Manage Courses
            </Link>
            <Link
              to="/trainer/courses/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors"
            >
              <BookPlus className="w-4 h-4" />
              <span>Create Course</span>
            </Link>
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
          <p className="text-2xl font-bold text-slate-900">{courses.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Authored curriculum paths</p>
        </div>

        {/* Active Learners */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Learners</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalEnrolledLearners}</p>
          <p className="text-[11px] text-slate-400 mt-1">Enrolled trainees across courses</p>
        </div>

        {/* Assessments */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Assessments</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Quiz engine unlocks in Phase 4</p>
        </div>

        {/* Average Performance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Performance</span>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">--</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting assessment cohort data</p>
        </div>
      </div>

      {/* Recent Courses Quick Access */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Courses ({courses.length})
          </h2>
          <Link
            to="/trainer/courses"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View All
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs text-slate-500">You haven't authored any courses yet.</p>
            <Link
              to="/trainer/courses/create"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span>Create Your First Course</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.slice(0, 4).map((c) => (
              <div
                key={c._id}
                className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className="text-slate-400">{c.category}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        c.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-1">
                    {c.title}
                  </h3>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{c.enrolledCount || 0} Enrolled</span>
                  <Link
                    to={`/trainer/courses/${c._id}/manage`}
                    className="font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerDashboardPage;
