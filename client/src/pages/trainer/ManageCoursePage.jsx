import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  getCourseByIdApi,
  updateCourseApi,
  publishCourseApi,
  createModuleApi,
  updateModuleApi,
  deleteModuleApi,
  createResourceApi,
  deleteResourceApi,
  getFinalAssessmentApi,
  getModuleQuizApi,
  toggleAssessmentStatusApi
} from '../../services/api';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import ResourceViewer from '../../components/ResourceViewer';
import LearnersModal from '../../components/LearnersModal';
import QuizBuilderModal from '../../components/QuizBuilderModal';
import SkillsSelect from '../../components/SkillsSelect';
import {
  ArrowLeft,
  BookOpen,
  Globe,
  Lock,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Link2,
  Upload,
  ExternalLink,
  Layers,
  CheckCircle2,
  Video,
  Image as ImageIcon,
  FileCode,
  FileSpreadsheet,
  Download,
  Play,
  Users,
  HelpCircle,
  FileCheck,
  Percent,
  Check,
  Tag
} from 'lucide-react';

const ManageCoursePage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [finalAssessment, setFinalAssessment] = useState(null);
  const [moduleQuizzes, setModuleQuizzes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(location.state?.message || null);
  const [showLearnersModal, setShowLearnersModal] = useState(false);

  // Modals / Forms State
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    prerequisites: '',
    skills: [],
  });

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleFormData, setModuleFormData] = useState({ title: '', description: '', order: 1 });

  const [showResourceModal, setShowResourceModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState(null);
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    externalUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Quiz Builder Modal Config State
  const [quizModalConfig, setQuizModalConfig] = useState({
    isOpen: false,
    type: 'module',
    moduleId: null,
    moduleTitle: '',
    initialAssessment: null,
  });

  // Resource Viewer Modal state
  const [previewResource, setPreviewResource] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCourseByIdApi(courseId);
      if (response && response.success && response.data) {
        setCourse(response.data.course);
        const mods = response.data.modules || [];
        setModules(mods);
        setCourseFormData({
          title: response.data.course.title,
          description: response.data.course.description,
          category: response.data.course.category,
          level: response.data.course.level,
          prerequisites: response.data.course.prerequisites || '',
          skills: (response.data.course.skills || []).map((s) => (s._id ? s._id : s)),
        });

        // Fetch Final Assessment
        try {
          const finalRes = await getFinalAssessmentApi(courseId);
          if (finalRes && finalRes.success) {
            setFinalAssessment(finalRes.data?.assessment || null);
          }
        } catch (e) {
          console.error('Error loading final assessment:', e);
        }

        // Fetch Module Quizzes
        const quizMap = {};
        await Promise.all(
          mods.map(async (m) => {
            try {
              const qRes = await getModuleQuizApi(m._id);
              if (qRes && qRes.success && qRes.data?.quiz) {
                quizMap[m._id] = qRes.data.quiz;
              }
            } catch (e) {}
          })
        );
        setModuleQuizzes(quizMap);
      } else {
        throw new Error(response?.message || 'Course not found');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load course.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // ====================================================
  // COURSE HANDLERS
  // ====================================================
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const response = await updateCourseApi(courseId, courseFormData);
      if (response && response.success) {
        setCourse(response.data);
        setShowEditCourseModal(false);
        setFeedback('Course details updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update course.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    setActionLoading(true);
    setFeedback(null);
    setError(null);

    const nextStatus = course.status === 'published' ? 'draft' : 'published';

    try {
      const response = await publishCourseApi(courseId, nextStatus);
      if (response && response.success) {
        setCourse((prev) => ({ ...prev, status: nextStatus }));
        setFeedback(`Course is now ${nextStatus === 'published' ? 'published in the trainee catalog' : 'moved back to draft'}.`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not update publish state. Ensure course has at least one module.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ====================================================
  // MODULE HANDLERS
  // ====================================================
  const openAddModuleModal = () => {
    setEditingModule(null);
    setModuleFormData({
      title: '',
      description: '',
      order: modules.length + 1,
    });
    setShowModuleModal(true);
  };

  const openEditModuleModal = (mod) => {
    setEditingModule(mod);
    setModuleFormData({
      title: mod.title,
      description: mod.description || '',
      order: mod.order,
    });
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleFormData.title.trim()) return;

    setActionLoading(true);
    setError(null);

    try {
      if (editingModule) {
        const response = await updateModuleApi(editingModule._id, moduleFormData);
        if (response && response.success) {
          setModules((prev) =>
            prev.map((m) => (m._id === editingModule._id ? { ...m, ...response.data } : m))
          );
          setFeedback('Module updated.');
        }
      } else {
        const response = await createModuleApi(courseId, moduleFormData);
        if (response && response.success) {
          setModules((prev) => [...prev, { ...response.data, resources: [] }]);
          setFeedback('Module created.');
        }
      }
      setShowModuleModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save module.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId, moduleTitle) => {
    const confirm = window.confirm(`Delete module "${moduleTitle}" and all its resources?`);
    if (!confirm) return;

    setActionLoading(true);
    try {
      await deleteModuleApi(moduleId);
      setModules((prev) => prev.filter((m) => m._id !== moduleId));
      setFeedback('Module deleted.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete module.');
    } finally {
      setActionLoading(false);
    }
  };

  // ====================================================
  // RESOURCE HANDLERS
  // ====================================================
  const openAddResourceModal = (moduleId) => {
    setTargetModuleId(moduleId);
    setResourceFormData({
      title: '',
      description: '',
      type: 'pdf',
      externalUrl: '',
    });
    setSelectedFile(null);
    setShowResourceModal(true);
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    if (!resourceFormData.title.trim()) return;

    setActionLoading(true);
    setError(null);

    try {
      if (resourceFormData.type === 'link') {
        const response = await createResourceApi(targetModuleId, {
          title: resourceFormData.title.trim(),
          description: resourceFormData.description.trim(),
          type: 'link',
          externalUrl: resourceFormData.externalUrl.trim(),
        });

        if (response && response.success) {
          setModules((prev) =>
            prev.map((m) =>
              m._id === targetModuleId
                ? { ...m, resources: [...(m.resources || []), response.data] }
                : m
            )
          );
          setShowResourceModal(false);
          setFeedback('Link resource added.');
        }
      } else {
        // File Upload
        if (!selectedFile) {
          setError('Please choose a file to upload.');
          setActionLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('title', resourceFormData.title.trim());
        formData.append('description', resourceFormData.description.trim());
        formData.append('type', resourceFormData.type);
        formData.append('file', selectedFile);

        const response = await createResourceApi(targetModuleId, formData, true);
        if (response && response.success) {
          setModules((prev) =>
            prev.map((m) =>
              m._id === targetModuleId
                ? { ...m, resources: [...(m.resources || []), response.data] }
                : m
            )
          );
          setShowResourceModal(false);
          setFeedback('Learning resource uploaded successfully.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add resource.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId, moduleId) => {
    const confirm = window.confirm('Are you sure you want to delete this resource?');
    if (!confirm) return;

    try {
      await deleteResourceApi(resourceId);
      setModules((prev) =>
        prev.map((m) =>
          m._id === moduleId
            ? { ...m, resources: m.resources.filter((r) => r._id !== resourceId) }
            : m
        )
      );
      setFeedback('Resource removed.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete resource.');
    }
  };

  // ====================================================
  // ASSESSMENT & QUIZ HANDLERS
  // ====================================================
  const openModuleQuizBuilder = (mod) => {
    setQuizModalConfig({
      isOpen: true,
      type: 'module',
      moduleId: mod._id,
      moduleTitle: mod.title,
      initialAssessment: moduleQuizzes[mod._id] || null,
    });
  };

  const openFinalAssessmentBuilder = () => {
    setQuizModalConfig({
      isOpen: true,
      type: 'final',
      moduleId: null,
      moduleTitle: '',
      initialAssessment: finalAssessment,
    });
  };

  const handleToggleAssessmentStatus = async (assessmentId) => {
    try {
      await toggleAssessmentStatusApi(assessmentId);
      await fetchCourseData();
      setFeedback('Assessment publication status updated.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update assessment status.');
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loading message="Loading course manager..." />
      </div>
    );
  }

  if (!course) {
    return <ErrorMessage message="Course not found." onRetry={fetchCourseData} />;
  }

  const isDraft = course.status === 'draft';

  // Helper to render type icon
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/trainer/courses"
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back to my courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {course.title}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                  isDraft
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {isDraft ? 'Draft' : 'Published'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: <span className="font-semibold text-slate-700">{course.category}</span> &bull; Level:{' '}
              <span className="font-semibold capitalize text-slate-700">{course.level}</span>
            </p>
          </div>
        </div>

        {/* Global Course Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowLearnersModal(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded transition-colors inline-flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Learners ({course.enrolledCount || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEditCourseModal(true)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 rounded transition-colors inline-flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>

          <Button
            type="button"
            variant={isDraft ? 'primary' : 'outline'}
            size="sm"
            loading={actionLoading}
            disabled={actionLoading}
            onClick={handlePublishToggle}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            {isDraft ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isDraft ? 'Publish Course' : 'Unpublish'}</span>
          </Button>
        </div>
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

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Course Overview Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Course Description
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mt-1">
            {course.description}
          </p>
        </div>

        {course.prerequisites && (
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Prerequisites
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {course.prerequisites}
            </p>
          </div>
        )}

        {/* Skills Covered Overview */}
        <div className="pt-3 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Skills Covered ({course.skills?.length || 0})</span>
          </h3>
          {course.skills && course.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {course.skills.map((skill) => (
                <span
                  key={skill._id || skill}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium border ${
                    skill.category === 'Soft Skill'
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {skill.name || 'Skill'}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No skills mapped yet. Click "Edit Details" above to map skills taught in this course.
            </p>
          )}
        </div>
      </div>

      {/* Modules & Resources Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Course Curriculum & Modules ({modules.length})
            </h2>
            <p className="text-xs text-slate-500">
              Structure modules and attach multimedia content (Videos, PDFs, Images, Notes, and Links).
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openAddModuleModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </Button>
        </div>

        {modules.length === 0 ? (
          /* Empty Modules State */
          <div className="bg-white border border-slate-200 border-dashed rounded-lg p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">No modules added yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Courses must have at least one module before they can be published to trainees.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddModuleModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Module</span>
            </button>
          </div>
        ) : (
          /* Modules List */
          <div className="space-y-4">
            {modules.map((mod, index) => (
              <div
                key={mod._id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4"
              >
                {/* Module Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 block uppercase">
                      Module {index + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {mod.title}
                    </h3>
                    {mod.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                    )}
                  </div>

                  {/* Module Action Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => openAddResourceModal(mod._id)}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Resource</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModuleModal(mod)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      title="Edit module"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod._id, mod.title)}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Delete module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Resources List inside Module */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Learning Content ({mod.resources?.length || 0})
                  </span>

                  {!mod.resources || mod.resources.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">
                      No learning resources added yet. Click &quot;Add Resource&quot; to upload media.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {mod.resources.map((resItem) => {
                        const isLink = resItem.type === 'link';
                        const fileUrl = resItem.filePath
                          ? `http://localhost:5002/uploads/resources/${resItem.filePath.split(/[\\/]/).pop()}`
                          : '';

                        return (
                          <div
                            key={resItem._id}
                            className="bg-slate-50 border border-slate-200 rounded p-3 flex items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
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
                                  {resItem.type} {resItem.fileName ? `• ${resItem.fileName}` : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewResource(resItem)}
                                className="px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-medium"
                                title="Inspect resource"
                              >
                                {resItem.type === 'video'
                                  ? 'Watch'
                                  : resItem.type === 'image'
                                  ? 'View'
                                  : resItem.type === 'link'
                                  ? 'Open'
                                  : 'Preview'}
                              </button>

                              {!isLink && fileUrl && (
                                <a
                                  href={fileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200"
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteResource(resItem._id, mod._id)}
                                className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Delete resource"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Module Quiz Section */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {moduleQuizzes[mod._id]?.title || 'Module Quiz'}
                        </span>
                        {moduleQuizzes[mod._id] ? (
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                              moduleQuizzes[mod._id].status === 'published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {moduleQuizzes[mod._id].status}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No quiz created</span>
                        )}
                      </div>
                      {moduleQuizzes[mod._id] && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          {moduleQuizzes[mod._id].questions?.length || 0} Questions •{' '}
                          {moduleQuizzes[mod._id].questions?.reduce(
                            (sum, q) => sum + (q.marks || 1),
                            0
                          ) || 0}{' '}
                          Marks • Pass: {moduleQuizzes[mod._id].passingPercentage || 50}%
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {moduleQuizzes[mod._id] ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleAssessmentStatus(moduleQuizzes[mod._id]._id)
                          }
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                        >
                          {moduleQuizzes[mod._id].status === 'published'
                            ? 'Unpublish'
                            : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openModuleQuizBuilder(mod)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Manage Quiz</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openModuleQuizBuilder(mod)}
                        className="px-2.5 py-1 text-xs font-semibold bg-white text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-300 transition-colors inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Quiz</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Final Course Assessment Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {finalAssessment?.title || 'Final Course Assessment'}
                  </h3>
                  {finalAssessment ? (
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                        finalAssessment.status === 'published'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {finalAssessment.status}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Not created</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comprehensive evaluation for automatic certificate generation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {finalAssessment ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleToggleAssessmentStatus(finalAssessment._id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                  >
                    {finalAssessment.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={openFinalAssessmentBuilder}
                    className="px-4 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Manage Assessment</span>
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={openFinalAssessmentBuilder}
                  className="px-4 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Final Assessment</span>
                </Button>
              )}
            </div>
          </div>

          {finalAssessment ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Questions</span>
                <strong className="text-slate-800 font-bold">
                  {finalAssessment.questions?.length || 0} Questions
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Marks</span>
                <strong className="text-slate-800 font-bold">
                  {finalAssessment.questions?.reduce(
                    (sum, q) => sum + (q.marks || 1),
                    0
                  ) || 0}{' '}
                  Marks
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Passing Percentage</span>
                <strong className="text-indigo-700 font-bold">
                  {finalAssessment.passingPercentage || 60}% required
                </strong>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No final assessment created yet. Trainees who complete the curriculum must pass the final assessment to be issued an official Certificate of Completion.
            </p>
          )}
        </div>
      </div>

      {/* ====================================================
          MODAL 1: EDIT COURSE METADATA
          ==================================================== */}
      {showEditCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Edit Course Details</h3>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prerequisites <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={courseFormData.prerequisites}
                  onChange={(e) => setCourseFormData({ ...courseFormData, prerequisites: e.target.value })}
                  placeholder="e.g. Basic JavaScript, HTML, CSS"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={courseFormData.category}
                    onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Level</label>
                  <select
                    value={courseFormData.level}
                    onChange={(e) => setCourseFormData({ ...courseFormData, level: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Skills Covered Multi-Select */}
              <SkillsSelect
                selectedSkillIds={courseFormData.skills || []}
                onChange={(newSkills) => setCourseFormData({ ...courseFormData, skills: newSkills })}
                label="Skills Covered"
                helperText="Select active skills from the Skill Library mapped to this course."
                disabled={actionLoading}
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditCourseModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="sm" loading={actionLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL 2: ADD / EDIT MODULE
          ==================================================== */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingModule ? 'Edit Module' : 'Add New Module'}
            </h3>
            <form onSubmit={handleSaveModule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Module Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={moduleFormData.title}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                  placeholder="e.g. Introduction to React Fundamentals"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={moduleFormData.description}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                  placeholder="Brief synopsis of topics covered in this module..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sequence Order</label>
                <input
                  type="number"
                  min={1}
                  value={moduleFormData.order}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, order: Number(e.target.value) })}
                  className="w-24 px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="sm" loading={actionLoading}>
                  {editingModule ? 'Save Module' : 'Create Module'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL 3: ADD LEARNING RESOURCE (EXPANDED TYPES)
          ==================================================== */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Learning Resource</h3>
              <button
                type="button"
                onClick={() => setShowResourceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={resourceFormData.title}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })}
                  placeholder="e.g. Architecture Overview Lecture"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Resource Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={resourceFormData.type}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, type: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video (MP4, WEBM, MOV)</option>
                  <option value="image">Image (PNG, JPG, WEBP)</option>
                  <option value="text">Text / Notes (TXT, MD)</option>
                  <option value="document">Document (DOC, DOCX)</option>
                  <option value="presentation">Presentation (PPT, PPTX)</option>
                  <option value="link">External Web Link</option>
                </select>
              </div>

              {/* Conditional Input based on Type */}
              {resourceFormData.type === 'link' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    External URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={resourceFormData.externalUrl}
                    onChange={(e) => setResourceFormData({ ...resourceFormData, externalUrl: e.target.value })}
                    placeholder="https://react.dev/"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {resourceFormData.type === 'video'
                      ? 'Select Video File'
                      : resourceFormData.type === 'image'
                      ? 'Select Image File'
                      : resourceFormData.type === 'pdf'
                      ? 'Select PDF File'
                      : 'Select File'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    accept={
                      resourceFormData.type === 'video'
                        ? 'video/mp4,video/webm,video/quicktime,video/*'
                        : resourceFormData.type === 'image'
                        ? 'image/png,image/jpeg,image/jpg,image/webp,image/*'
                        : resourceFormData.type === 'pdf'
                        ? '.pdf,application/pdf'
                        : resourceFormData.type === 'text'
                        ? '.txt,.md,text/plain'
                        : '*/*'
                    }
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Max file size: 100MB
                  </span>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={resourceFormData.description}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, description: e.target.value })}
                  placeholder="Supplementary guide or study objectives"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="sm" loading={actionLoading}>
                  {actionLoading ? 'Uploading...' : 'Add Resource'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL 4: RESOURCE VIEWER
          ==================================================== */}
      {previewResource && (
        <ResourceViewer
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}

      {/* ====================================================
          MODAL 5: LEARNERS MODAL
          ==================================================== */}
      {showLearnersModal && (
        <LearnersModal
          courseId={courseId}
          onClose={() => setShowLearnersModal(false)}
        />
      )}

      {/* ====================================================
          MODAL 6: QUIZ & ASSESSMENT BUILDER MODAL
          ==================================================== */}
      {quizModalConfig.isOpen && (
        <QuizBuilderModal
          isOpen={quizModalConfig.isOpen}
          onClose={() =>
            setQuizModalConfig({
              isOpen: false,
              type: 'module',
              moduleId: null,
              moduleTitle: '',
              initialAssessment: null,
            })
          }
          onSaved={fetchCourseData}
          type={quizModalConfig.type}
          moduleId={quizModalConfig.moduleId}
          courseId={courseId}
          moduleTitle={quizModalConfig.moduleTitle}
          courseTitle={course?.title || ''}
          initialAssessment={quizModalConfig.initialAssessment}
        />
      )}
    </div>
  );
};

export default ManageCoursePage;
