import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCoursesApi } from '../services/api';
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const response = await getCoursesApi({ mine: 'all' });
        if (response && response.success) {
          setCourses(response.data || []);
        }
      } catch (err) {
        console.warn('Could not load courses on admin dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, []);

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

          <Link
            to="/admin/courses"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>Manage Platform Courses</span>
          </Link>
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
          <p className="text-2xl font-bold text-slate-900">1</p>
          <p className="text-[11px] text-slate-400 mt-1">Platform accounts</p>
        </div>

        {/* Trainees */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Trainees</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Registered learners</p>
        </div>

        {/* Trainers */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Trainers</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Curriculum instructors</p>
        </div>

        {/* Courses */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Courses</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{courses.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total authored courses</p>
        </div>
      </div>

      {/* Courses Governance Quick List */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Platform Courses ({courses.length})
          </h2>
          <Link
            to="/admin/courses"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View All Courses
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No courses have been created on the platform yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {courses.slice(0, 5).map((c) => (
              <div key={c._id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                  <p className="text-[11px] text-slate-400">
                    Trainer: {c.trainer?.name || 'Unknown'} &bull; {c.category} &bull; {c.level}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      c.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-slate-500 font-medium">{c.enrolledCount || 0} Enrolled</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
