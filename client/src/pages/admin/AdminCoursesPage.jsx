import React, { useState, useEffect, useCallback } from 'react';
import {
  getCoursesApi,
  getCourseByIdApi,
  publishCourseApi,
  deleteCourseApi
} from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import ResourceViewer from '../../components/ResourceViewer';
import {
  BookOpen,
  Search,
  Filter,
  Users,
  Layers,
  Globe,
  Lock,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Image as ImageIcon,
  Link2,
  FileCode,
  FileSpreadsheet,
  Download,
  GraduationCap
} from 'lucide-react';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Inspector Modal State
  const [inspectCourseId, setInspectCourseId] = useState(null);
  const [inspectCourseData, setInspectCourseData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  // Resource Viewer state
  const [previewResource, setPreviewResource] = useState(null);

  const fetchAdminCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCoursesApi({ mine: 'all' });
      if (response && response.success) {
        setCourses(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch platform courses');
      }
    } catch (err) {
      console.error('Error fetching admin courses:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminCourses();
  }, [fetchAdminCourses]);

  const handleOpenInspector = async (courseId) => {
    setInspectCourseId(courseId);
    setInspectLoading(true);
    setInspectCourseData(null);
    setExpandedModuleId(null);

    try {
      const response = await getCourseByIdApi(courseId);
      if (response && response.success && response.data) {
        setInspectCourseData(response.data);
        if (response.data.modules && response.data.modules.length > 0) {
          setExpandedModuleId(response.data.modules[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading course inspection:', err);
      setError('Could not load course details for inspection.');
    } finally {
      setInspectLoading(false);
    }
  };

  const handlePublishToggle = async (course) => {
    setActionLoadingId(course._id);
    setFeedback(null);
    setError(null);

    const nextStatus = course.status === 'published' ? 'draft' : 'published';

    try {
      const response = await publishCourseApi(course._id, nextStatus);
      if (response && response.success) {
        setFeedback(`Course "${course.title}" status updated to ${nextStatus}.`);
        setCourses((prev) =>
          prev.map((c) => (c._id === course._id ? { ...c, status: nextStatus } : c))
        );
        if (inspectCourseData && inspectCourseData.course._id === course._id) {
          setInspectCourseData((prev) => ({
            ...prev,
            course: { ...prev.course, status: nextStatus },
          }));
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to toggle publish status. Ensure course has at least one module.'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCourse = async (course) => {
    const confirm = window.confirm(
      `[ADMIN ACTION] Are you sure you want to permanently delete "${course.title}"? This removes all associated modules, resources, and enrollments.`
    );
    if (!confirm) return;

    setActionLoadingId(course._id);
    try {
      await deleteCourseApi(course._id);
      setFeedback(`Course "${course.title}" deleted.`);
      setCourses((prev) => prev.filter((c) => c._id !== course._id));
      if (inspectCourseId === course._id) {
        setInspectCourseId(null);
        setInspectCourseData(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete course.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (c.trainer?.name && c.trainer.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'link':
        return <Link2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'code':
        return <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Curriculum Moderation & Publishing Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Platform Course Administration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Audit structured modules, inspect attached digital assets, moderate publication statuses, and oversee platform-wide learning offerings.
        </p>
      </div>

      {/* Notifications */}
      {feedback && (
        <div className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search platform courses or instructors..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-1">
            {[
              { label: 'All Courses', value: '' },
              { label: 'Published', value: 'published' },
              { label: 'Drafts', value: 'draft' },
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === f.value
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Table */}
      {loading ? (
        <div className="py-20 flex justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <Loading message="Loading platform course offerings..." />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-700 dark:text-slate-200">No courses found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Category & Level</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Enrolled</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredCourses.map((course) => {
                  const isActionLoading = actionLoadingId === course._id;
                  const isDraft = course.status === 'draft';

                  return (
                    <tr key={course._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{course.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mr-1.5">
                          {course.category}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 capitalize">{course.level}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {course.trainer?.name || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                            isDraft
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isDraft ? (
                            <>
                              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span>Draft</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Published</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{course.enrolledCount || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenInspector(course._id)}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                          title="Inspect Curriculum & Content"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePublishToggle(course)}
                          disabled={isActionLoading}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors inline-flex items-center gap-1 ${
                            isDraft
                              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <span>{isDraft ? 'Publish' : 'Unpublish'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course)}
                          disabled={isActionLoading}
                          className="p-1.5 text-slate-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          COURSE STRUCTURE & CURRICULUM INSPECTOR MODAL
          ==================================================== */}
      {inspectCourseId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Course Structure & Curriculum Inspector
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectCourseId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {inspectLoading ? (
                <div className="py-16 flex justify-center">
                  <Loading message="Inspecting course hierarchy..." />
                </div>
              ) : !inspectCourseData ? (
                <ErrorMessage message="Course details could not be loaded." />
              ) : (
                <>
                  {/* Course Metadata Card */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                            {inspectCourseData.course.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              inspectCourseData.course.status === 'draft'
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {inspectCourseData.course.status}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {inspectCourseData.course.title}
                        </h2>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        <span>Level: <strong className="capitalize text-slate-700 dark:text-slate-200">{inspectCourseData.course.level}</strong></span> &bull;{' '}
                        <span>Enrolled: <strong className="text-slate-700 dark:text-slate-200">{inspectCourseData.course.enrolledCount || 0}</strong></span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                      {inspectCourseData.course.description}
                    </p>

                    {inspectCourseData.course.prerequisites && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[10px] uppercase">Prerequisites:</span>
                        {inspectCourseData.course.prerequisites}
                      </div>
                    )}

                    {/* Skills Covered */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[10px] uppercase mb-1">
                        Skills Covered ({inspectCourseData.course.skills?.length || 0}):
                      </span>
                      {inspectCourseData.course.skills && inspectCourseData.course.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {inspectCourseData.course.skills.map((s) => {
                            const sName = s.name || s.skill?.name || s;
                            const sCat = s.category || s.skill?.category || 'Technical';
                            const sProf = s.proficiency || 'beginner';

                            return (
                              <span
                                key={s._id || s.skill?._id || sName}
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                                  sCat === 'Soft Skill'
                                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                }`}
                              >
                                <span>{sName}</span>
                                <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                  {sProf}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No skills mapped</span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Trainer: <strong className="text-slate-800 dark:text-slate-200">{inspectCourseData.course.trainer?.name}</strong> ({inspectCourseData.course.trainer?.email})
                      </span>
                    </div>
                  </div>

                  {/* Modules & Resources Hierarchy */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Modules & Attached Learning Content ({inspectCourseData.modules?.length || 0})
                      </h4>
                    </div>

                    {!inspectCourseData.modules || inspectCourseData.modules.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4">No modules found in this course.</p>
                    ) : (
                      <div className="space-y-3">
                        {inspectCourseData.modules.map((mod, idx) => {
                          const isExpanded = expandedModuleId === mod._id;

                          return (
                            <div
                              key={mod._id}
                              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                            >
                              {/* Module Bar */}
                              <div
                                onClick={() => setExpandedModuleId(isExpanded ? null : mod._id)}
                                className="px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 block uppercase">
                                    Module {idx + 1} (Order: {mod.order})
                                  </span>
                                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">{mod.title}</h5>
                                  {mod.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{mod.description}</p>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                    {mod.resources?.length || 0} Resources
                                  </span>
                                  <button
                                    type="button"
                                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Resources */}
                              {isExpanded && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                  {!mod.resources || mod.resources.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No resources attached to this module.</p>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {mod.resources.map((res) => {
                                        return (
                                          <div
                                            key={res._id}
                                            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-xs"
                                          >
                                            <div className="flex items-center gap-2.5">
                                              <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                                                {getResourceIcon(res.type)}
                                              </div>
                                              <div>
                                                <span className="font-semibold text-slate-900 dark:text-white block">
                                                  {res.title}
                                                </span>
                                                <span className="text-[10px] text-slate-400 capitalize">
                                                  Type: {res.type}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              <button
                                                type="button"
                                                onClick={() => setPreviewResource(res)}
                                                className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded border border-emerald-200 dark:border-emerald-800"
                                              >
                                                Preview Resource
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {/* Requirement 9: Clean modal experience without redundant footer "Close Inspector" button */}
          </div>
        </div>
      )}

      {/* Resource Viewer Modal */}
      {previewResource && (
        <ResourceViewer
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}
    </div>
  );
};

export default AdminCoursesPage;
