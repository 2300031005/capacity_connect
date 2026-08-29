import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyCoursesApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Award,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Calendar,
} from 'lucide-react';

const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyCoursesApi();
      if (response && response.success) {
        setEnrollments(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch enrolled courses');
      }
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load your courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            My Enrolled Courses
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Access your active courses, learning materials, and track your ongoing progress.
          </p>
        </div>
        <Link
          to="/trainee/courses"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto shadow-xs"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse Course Catalog</span>
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchMyCourses} />}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loading message="Loading your enrolled courses..." />
        </div>
      ) : enrollments.length === 0 ? (
        /* Empty State */
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              You haven't enrolled in any courses yet
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
              Explore the catalog to discover curated topics and begin building job-ready competencies.
            </p>
          </div>
          <Link
            to="/trainee/courses"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Browse Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Enrolled Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((item) => {
            const course = item.course;
            if (!course) return null;

            return (
              <div
                key={item._id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {course.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {item.status || 'Active'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Instructor & Enrolled Date */}
                  <div className="space-y-1 pt-2 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>
                        Trainer: <strong className="text-[var(--text-primary)]">{course.trainer?.name || 'Instructor'}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Enrolled on {new Date(item.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[var(--text-secondary)]">Course Progress</span>
                      <span className="text-[var(--primary)]">{item.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div
                        className="h-full bg-[var(--primary)] rounded-full"
                        style={{ width: `${item.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Continue Learning CTA */}
                <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] capitalize">
                    Level: {course.level}
                  </span>
                  <Link
                    to={`/trainee/courses/${course._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-md text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>Continue Learning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
