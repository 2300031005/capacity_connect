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

  const renderResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-indigo-600 flex-shrink-0" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600 flex-shrink-0" />;
      case 'text':
        return <FileCode className="w-4 h-4 text-amber-600 flex-shrink-0" />;
      case 'link':
        return <Link2 className="w-4 h-4 text-blue-600 flex-shrink-0" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 text-slate-600 flex-shrink-0" />;
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      !searchTerm.trim() ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.trainer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Platform Courses ({courses.length})
          </h1>
          <p className="text-xs text-slate-500">
            Inspect the complete hierarchy: Course &rarr; Modules &rarr; Multimedia Learning Resources.
          </p>
        </div>
      </div>

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

      {error && <ErrorMessage message={error} onRetry={fetchAdminCourses} />}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, trainer, category..."
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

      {/* Table Content */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loading message="Loading platform courses..." />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 shadow-sm">
          No courses found matching criteria.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Trainer</th>
                  <th className="py-3 px-4">Category / Level</th>
                  <th className="py-3 px-4">Modules</th>
                  <th className="py-3 px-4">Enrolled</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCourses.map((c) => {
                  const isDraft = c.status === 'draft';
                  const isBusy = actionLoadingId === c._id;

                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block">
                          {c.trainer?.name || 'Unknown'}
                        </span>
                        <span className="text-[11px] text-slate-400">{c.trainer?.email || ''}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="block font-medium">{c.category}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{c.level}</span>
                      </td>
                      <td className="py-3 px-4">{c.moduleCount || 0}</td>
                      <td className="py-3 px-4">{c.enrolledCount || 0}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            isDraft
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        {/* View Course Hierarchy Inspector Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenInspector(c._id)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Course</span>
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handlePublishToggle(c)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                            isDraft
                              ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                              : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {isDraft ? 'Publish' : 'Unpublish'}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDeleteCourse(c)}
                          className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete course"
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
          ADMIN COURSE → MODULE → RESOURCE INSPECTOR MODAL
          ==================================================== */}
      {inspectCourseId && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Course Structure & Curriculum Inspector
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectCourseId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-200 transition-colors"
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
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {inspectCourseData.course.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              inspectCourseData.course.status === 'draft'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {inspectCourseData.course.status}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {inspectCourseData.course.title}
                        </h2>
                      </div>

                      <div className="text-xs text-slate-500">
                        <span>Level: <strong className="capitalize text-slate-700">{inspectCourseData.course.level}</strong></span> &bull;{' '}
                        <span>Enrolled: <strong className="text-slate-700">{inspectCourseData.course.enrolledCount || 0}</strong></span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2">
                      {inspectCourseData.course.description}
                    </p>

                    {inspectCourseData.course.prerequisites && (
                      <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded p-2.5">
                        <span className="font-semibold text-slate-700 block text-[10px] uppercase">Prerequisites:</span>
                        {inspectCourseData.course.prerequisites}
                      </div>
                    )}

                    {/* Skills Covered */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase mb-1">
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
                                    ? 'bg-purple-50 text-purple-900 border-purple-200'
                                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                }`}
                              >
                                <span>{sName}</span>
                                <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-white border border-slate-200 text-slate-700">
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

                    <div className="text-xs text-slate-500 pt-1 flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Trainer: <strong className="text-slate-800">{inspectCourseData.course.trainer?.name}</strong> ({inspectCourseData.course.trainer?.email})
                      </span>
                    </div>
                  </div>

                  {/* Modules & Resources Hierarchy */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
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
                              className="border border-slate-200 rounded-lg overflow-hidden"
                            >
                              {/* Module Bar */}
                              <div
                                onClick={() => setExpandedModuleId(isExpanded ? null : mod._id)}
                                className="px-4 py-3 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <span className="text-[10px] font-mono font-bold text-emerald-700 block uppercase">
                                    Module {idx + 1} (Order: {mod.order})
                                  </span>
                                  <h5 className="text-sm font-bold text-slate-900">{mod.title}</h5>
                                  {mod.description && (
                                    <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {mod.resources?.length || 0} Resources
                                  </span>
                                  <button
                                    type="button"
                                    className="p-1 text-slate-400 hover:text-slate-700"
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              {/* Resources Inside Module */}
                              {isExpanded && (
                                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
                                  {!mod.resources || mod.resources.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No resources in this module.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {mod.resources.map((resItem) => {
                                        const isLink = resItem.type === 'link';
                                        const fileUrl = resItem.filePath
                                          ? `http://localhost:5002/uploads/resources/${resItem.filePath.split(/[\\/]/).pop()}`
                                          : '';

                                        return (
                                          <div
                                            key={resItem._id}
                                            className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between gap-3 text-xs"
                                          >
                                            <div
                                              onClick={() => setPreviewResource(resItem)}
                                              className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                                            >
                                              {renderResourceIcon(resItem.type)}
                                              <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 group-hover:text-emerald-700 truncate transition-colors">
                                                  {resItem.title}
                                                </p>
                                                <p className="text-[10px] text-slate-400 uppercase font-mono">
                                                  {resItem.type}
                                                </p>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-1 flex-shrink-0">
                                              <button
                                                type="button"
                                                onClick={() => setPreviewResource(resItem)}
                                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
                                              >
                                                Inspect
                                              </button>
                                              {!isLink && fileUrl && (
                                                <a
                                                  href={fileUrl}
                                                  download
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="p-1 text-slate-500 hover:text-slate-900"
                                                  title="Download"
                                                >
                                                  <Download className="w-3.5 h-3.5" />
                                                </a>
                                              )}
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

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInspectCourseId(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
              >
                Close Inspector
              </button>
            </div>
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
