import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyCoursesApi } from '../services/api';
import {
  BookOpen,
  Award,
  Target,
  Sparkles,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

const TraineeDashboardPage = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTraineeData = async () => {
      try {
        const response = await getMyCoursesApi();
        if (response && response.success) {
          setEnrolledCourses(response.data || []);
        }
      } catch (err) {
        console.warn('Could not load enrollments on dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTraineeData();
  }, []);

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

          <Link
            to="/trainee/courses"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Courses</span>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Learning Progress / Enrolled Courses */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{enrolledCourses.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {enrolledCourses.length > 0
              ? 'Active learning pathways'
              : 'No courses enrolled yet'}
          </p>
        </div>

        {/* Current Competency */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Competency</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Not assessed yet</p>
          <p className="text-[11px] text-slate-400 mt-2">Assessments unlock in Phase 4</p>
        </div>

        {/* Skill Gaps */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Skill Gaps</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No skill gaps identified</p>
          <p className="text-[11px] text-slate-400 mt-2">Diagnosed via assessments</p>
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

      {/* Enrolled Courses Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            My Enrolled Courses ({enrolledCourses.length})
          </h2>
          {enrolledCourses.length > 0 && (
            <Link
              to="/trainee/my-courses"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View All
            </Link>
          )}
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs text-slate-500">
              You haven't enrolled in any courses yet.
            </p>
            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrolledCourses.slice(0, 4).map((item) => (
              <div
                key={item._id}
                className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {item.course?.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {item.course?.title}
                  </h3>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Progress: {item.progress || 0}%</span>
                  <Link
                    to={`/trainee/courses/${item.course?._id}`}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Continue</span>
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

export default TraineeDashboardPage;
