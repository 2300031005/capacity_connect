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
  formatCleanTitle,
  formatCleanDescription,
  formatCleanCategory,
  formatCleanSkillTags,
  formatCleanLevel,
  formatCleanMatchScore,
} from '../utils/courseFormatters';
import {
  BookOpen,
  Award,
  Target,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Tag,
} from 'lucide-react';

const TraineeDashboardPage = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
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
          1. DASHBOARD HERO BANNER
          ==================================================== */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 sm:p-7 shadow-xs relative overflow-hidden transition-colors">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[var(--surface-muted)] text-[var(--primary)] border border-[var(--border)]">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Trainee Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Welcome back, {user?.name || 'Trainee'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Department: <strong className="text-[var(--text-secondary)]">{user?.department || 'Software Engineering'}</strong>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <Link
              to="/trainee/recommendations"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-soft)] hover:bg-[var(--primary-soft)]/80 text-[var(--primary)] border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Recommendations</span>
            </Link>

            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Courses</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ====================================================
          2. KPI OVERVIEW CARDS (4-COLUMN GRID)
          ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enrolled Courses */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Enrolled Courses
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)] leading-none">
              {enrolledCourses.length}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {enrolledCourses.length > 0 ? 'Active learning pathways' : 'No courses enrolled yet'}
            </p>
          </div>
        </div>

        {/* Certificates Earned */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-400 transition-colors">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Certificates Earned
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)] leading-none">
              {certificates.length}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {certificates.length > 0 ? 'Graduated course credentials' : 'Pass final assessments to earn'}
            </p>
          </div>
        </div>

        {/* Skills & Gaps */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-teal-400 transition-colors">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Skills & Gaps
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <Link
              to="/trainee/skills"
              className="text-base font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
            >
              <span>View Skill Passport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Verified via examination
            </p>
          </div>
        </div>

        {/* AI Advisor */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              AI Advisor
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[var(--primary)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-base font-bold text-[var(--text-primary)]">
              {recommendations.length > 0 ? `${recommendations.length} Tailored Matches` : 'Active Advisor'}
            </p>
            <Link
              to="/trainee/recommendations"
              className="text-xs font-bold text-[var(--primary)] hover:underline mt-2 inline-flex items-center gap-1"
            >
              <span>Explore recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ====================================================
          3. RECOMMENDED FOR YOU (ENTERPRISE RECOMMENDATION SYSTEM)
          Zero internal numeric database IDs visible
          ==================================================== */}
      {recommendations.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Recommended for You
                </h2>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Personalized learning pathways based on your skills, progress, and career goals.
              </p>
            </div>
            <Link
              to="/trainee/recommendations"
              className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              <span>View All ({recommendations.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Equal Height Recommendation Cards (Section 11 Structure) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {recommendations.slice(0, 3).map((item, idx) => {
              const course = item.course || {};
              const cleanTitle = formatCleanTitle(course.title);
              const cleanCategory = formatCleanCategory(course.category);
              const cleanDescription = formatCleanDescription(course, item);
              const cleanSkills = formatCleanSkillTags(item, course);
              const cleanLevel = formatCleanLevel(course.level);
              const cleanMatchScore = formatCleanMatchScore(item.matchScore);
              const courseId = course._id || course.id || item.courseId;

              return (
                <div
                  key={courseId || idx}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between hover:border-blue-400 transition-all duration-150 shadow-xs space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: CATEGORY on left, MATCH BADGE on right */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] truncate">
                        {cleanCategory}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>{cleanMatchScore}</span>
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3
                      className="text-base font-bold text-[var(--text-primary)] leading-snug line-clamp-2"
                      title={cleanTitle}
                    >
                      {cleanTitle}
                    </h3>

                    {/* Short, professional, learner-friendly description (12-25 words) */}
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {cleanDescription}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      {cleanSkills.map((sk, sIdx) => (
                        <div
                          key={sIdx}
                          className="text-[11px] bg-[var(--surface-muted)] text-[var(--text-secondary)] px-2.5 py-1 rounded-md border border-[var(--border)] font-medium flex items-center gap-1.5"
                        >
                          <Tag className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span className="truncate">{sk.displayTag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: LEVEL on left, View Course on right */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {cleanLevel}
                    </span>
                    <Link
                      to={`/trainee/courses/${courseId}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
                    >
                      <span>View Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================
          4. MY ACTIVE COURSES & PROGRESS
          ==================================================== */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
              My Active Courses
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Resume your enrolled training modules and coursework.
            </p>
          </div>
          <Link
            to="/trainee/my-courses"
            className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>Go to My Courses ({enrolledCourses.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            Loading your courses...
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs text-[var(--text-muted)]">You are not enrolled in any courses yet.</p>
            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <span>Explore Course Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledCourses.slice(0, 4).map((item) => {
              const course = item.course;
              if (!course) return null;

              const cleanCourseTitle = formatCleanTitle(course.title);
              const cleanCourseCategory = formatCleanCategory(course.category);
              const courseId = course._id || course.id;

              return (
                <div
                  key={item._id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col justify-between hover:border-blue-400 transition-colors shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                        {cleanCourseCategory}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {item.status || 'Active'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1" title={cleanCourseTitle}>
                      {cleanCourseTitle}
                    </h3>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                        <span>Progress</span>
                        <span className="font-semibold text-[var(--primary)]">{item.progress || 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden border border-[var(--border)]">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full"
                          style={{ width: `${item.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Level: <strong className="capitalize text-[var(--text-secondary)]">{course.level || 'Intermediate'}</strong>
                    </span>
                    <Link
                      to={`/trainee/courses/${courseId}`}
                      className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {activeCertificate && (
        <CertificateModal
          certificate={activeCertificate}
          isOpen={Boolean(activeCertificate)}
          onClose={() => setActiveCertificate(null)}
        />
      )}
    </div>
  );
};

export default TraineeDashboardPage;
