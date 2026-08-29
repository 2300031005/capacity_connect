import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyCoursesApi,
  getMyCertificatesApi,
  getAiCourseRecommendationsApi,
} from '../services/api';
import CertificateModal from '../components/CertificateModal';
import {
  BookOpen,
  Award,
  Target,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Download,
  Calendar,
  CheckCircle2,
  Zap,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

const TraineeDashboardPage = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [nextSteps, setNextSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCertificate, setActiveCertificate] = useState(null);

  useEffect(() => {
    const loadTraineeData = async () => {
      try {
        const [coursesRes, certsRes, recsRes] = await Promise.allSettled([
          getMyCoursesApi(),
          getMyCertificatesApi(),
          getAiCourseRecommendationsApi(),
        ]);

        if (coursesRes.status === 'fulfilled' && coursesRes.value?.success) {
          setEnrolledCourses(coursesRes.value.data || []);
        }
        if (certsRes.status === 'fulfilled' && certsRes.value?.success) {
          setCertificates(certsRes.value.data || []);
        }
        if (recsRes.status === 'fulfilled' && recsRes.value?.success) {
          setRecommendations(recsRes.value.data?.recommendations || []);
          setNextSteps(recsRes.value.data?.nextSteps || []);
        }
      } catch (err) {
        console.warn('Could not load trainee data on dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTraineeData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ====================================================
          1. WELCOME HEADER CARD
          ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Role: Trainee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.name || 'Trainee'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Department: <strong className="text-slate-700 dark:text-slate-300">{user?.department || 'Software Engineer'}</strong>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <Link
              to="/trainee/recommendations"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>AI Recommendations</span>
            </Link>

            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Courses</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ====================================================
          2. KPI OVERVIEW CARDS (4 CARDS)
          ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enrolled Courses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Enrolled Courses
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none">
              {enrolledCourses.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {enrolledCourses.length > 0 ? 'Active learning pathways' : 'No courses enrolled yet'}
            </p>
          </div>
        </div>

        {/* Certificates Earned */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Certificates Earned
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none">
              {certificates.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {certificates.length > 0 ? 'Graduated course credentials' : 'Pass final assessments'}
            </p>
          </div>
        </div>

        {/* Skills & Gaps */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Skills & Gaps
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <Link
              to="/trainee/skills"
              className="text-base font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View Skill Passport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Verified via passed final exams
            </p>
          </div>
        </div>

        {/* AI Advisor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              AI Advisor
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {recommendations.length > 0 ? `${recommendations.length} Tailored Matches` : 'Active Advisor'}
            </p>
            <Link
              to="/trainee/recommendations"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-flex items-center gap-1"
            >
              <span>Explore recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ====================================================
          3. RECOMMENDED FOR YOU SECTION (EQUAL HEIGHT CARDS & TITLE CLAMPING)
          ==================================================== */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Recommended for You
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Curated learning pathways tailored to your verified competencies and skill gap diagnostics.
              </p>
            </div>
            <Link
              to="/trainee/recommendations"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All ({recommendations.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 3 Equal Height Recommendation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {recommendations.slice(0, 3).map((item, idx) => {
              const course = item.course;
              const matchScore = item.matchScore || 85;

              return (
                <div
                  key={course?._id || idx}
                  className="bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Category & Match Score Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {course?.category || 'Curriculum'}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{matchScore}% Match</span>
                      </span>
                    </div>

                    {/* Course Title with Line Clamping and Tooltip so long names never break layout */}
                    <h3
                      className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug"
                      title={course?.title}
                    >
                      {course?.title}
                    </h3>

                    {/* Rationale description */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg p-2.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      <p className="line-clamp-2">{item.reason}</p>
                    </div>

                    {/* Skills Covered Tags */}
                    {Array.isArray(item.skillAlignment) && item.skillAlignment.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.skillAlignment.slice(0, 2).map((sa, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300 font-medium"
                          >
                            <Target className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                            <span className="truncate max-w-[90px]">{sa.skill}</span>
                            <span className="text-teal-700 dark:text-teal-400 font-semibold">({sa.targetProficiency})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Level & CTA Button */}
                  <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 capitalize">
                      Level: {course?.level || 'General'}
                    </span>
                    <Link
                      to={`/trainee/courses/${course?._id}`}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1"
                    >
                      <span>View Course</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================
          4. ENROLLED COURSES (ACTIVE LEARNING PROGRESS)
          ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              My Enrolled Courses ({enrolledCourses.length})
            </h2>
          </div>
          {enrolledCourses.length > 0 && (
            <Link
              to="/trainee/my-courses"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You haven't enrolled in any courses yet.
            </p>
            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
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
                className="bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                    {item.course?.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5" title={item.course?.title}>
                    {item.course?.title}
                  </h3>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    Progress: <strong className="text-blue-600 dark:text-blue-400">{item.progress || 0}%</strong>
                  </span>
                  <Link
                    to={`/trainee/courses/${item.course?._id}`}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====================================================
          5. MY EARNED CERTIFICATES SECTION
          ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              My Earned Certificates ({certificates.length})
            </h2>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-600 dark:text-slate-300">No certificates earned yet.</p>
            <p>Complete all course modules and pass the final course assessment to graduate and receive your certificate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                      {cert.certificateId}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                      Score: {cert.percentage}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1" title={cert.course?.title}>
                    {cert.course?.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Instructor: {cert.trainer?.name || 'Faculty'}
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveCertificate(cert)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                    >
                      View
                    </button>
                    <a
                      href={`http://localhost:5002/${cert.filePath}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {activeCertificate && (
        <CertificateModal
          isOpen={Boolean(activeCertificate)}
          onClose={() => setActiveCertificate(null)}
          certificate={activeCertificate}
        />
      )}
    </div>
  );
};

export default TraineeDashboardPage;
