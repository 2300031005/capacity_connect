import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCoursesApi, deleteCourseApi, publishCourseApi } from '../../services/api';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import LearnersModal from '../../components/LearnersModal';
import {
  BookPlus,
  BookOpen,
  Layers,
  Users,
  Search,
  Settings,
  Trash2,
  Globe,
  Lock,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const TrainerCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [viewLearnersCourseId, setViewLearnersCourseId] = useState(null);

  const fetchTrainerCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCoursesApi({ mine: 'true' });
      if (response && response.success) {
        setCourses(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching trainer courses:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainerCourses();
  }, [fetchTrainerCourses]);

  const handlePublishToggle = async (course) => {
    setActionLoadingId(course._id);
    setFeedback(null);
    setError(null);

    const nextStatus = course.status === 'published' ? 'draft' : 'published';

    try {
      const response = await publishCourseApi(course._id, nextStatus);
      if (response && response.success) {
        setFeedback(response.message || 'Course status updated successfully.');
        setCourses((prev) =>
          prev.map((c) => (c._id === course._id ? { ...c, status: nextStatus } : c))
        );
      } else {
        throw new Error(response?.message || 'Status update failed');
      }
    } catch (err) {
      console.error('Publish error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not update course status. Note: Courses must contain at least one module before publishing.'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCourse = async (course) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${course.title}"? This will permanently delete all its modules, resources, and enrollments.`
    );
    if (!confirmDelete) return;

    setActionLoadingId(course._id);
    setFeedback(null);
    setError(null);

    try {
      const response = await deleteCourseApi(course._id);
      if (response && response.success) {
        setFeedback('Course and associated content deleted.');
        setCourses((prev) => prev.filter((c) => c._id !== course._id));
      } else {
        throw new Error(response?.message || 'Failed to delete course');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete course.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter in-memory for instant feedback
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchTerm.trim() ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || course.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Courses
          </h1>
          <p className="text-xs text-slate-500">
            Manage your courses, modules, learning resources, and publishing states.
          </p>
        </div>
        <Link
          to="/trainer/courses/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <BookPlus className="w-4 h-4" />
          <span>Create Course</span>
        </Link>
      </div>

      {/* Notifications */}
      {feedback && (
        <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs px-4 py-3 rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchTrainerCourses} />}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your courses..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loading message="Loading your courses..." />
        </div>
      ) : courses.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No courses created yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Get started by creating your first course, structuring modules, and uploading learning resources.
            </p>
          </div>
          <Link
            to="/trainer/courses/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors"
          >
            <BookPlus className="w-4 h-4" />
            <span>Create Your First Course</span>
          </Link>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500 text-xs">
          No courses match your filter criteria.
        </div>
      ) : (
        /* Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((course) => {
            const isDraft = course.status === 'draft';
            const isBusy = actionLoadingId === course._id;

            return (
              <div
                key={course._id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {course.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          isDraft
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isDraft ? 'Draft' : 'Published'}
                      </span>
                      <span className="text-[10px] font-medium capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {course.description}
                  </p>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.moduleCount || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.enrolledCount || 0} Enrolled</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/trainer/courses/${course._id}/manage`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Manage Content</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setViewLearnersCourseId(course._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View Learners</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handlePublishToggle(course)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors inline-flex items-center gap-1 ${
                        isDraft
                          ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isDraft ? 'Publish Course' : 'Move back to Draft'}
                    >
                      {isDraft ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{isDraft ? 'Publish' : 'Unpublish'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDeleteCourse(course)}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enrolled Learners Modal */}
      {viewLearnersCourseId && (
        <LearnersModal
          courseId={viewLearnersCourseId}
          onClose={() => setViewLearnersCourseId(null)}
        />
      )}
    </div>
  );
};

export default TrainerCoursesPage;
