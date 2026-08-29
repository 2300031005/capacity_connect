import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  getCourseByIdApi,
  publishCourseApi,
  createModuleApi,
  updateModuleApi,
  deleteModuleApi,
  createResourceApi,
  deleteResourceApi,
} from '../../services/api';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Toast from '../../components/Toast';
import InlineCourseTitleEdit from '../../components/InlineCourseTitleEdit';
import EditCourseDetailsModal from '../../components/EditCourseDetailsModal';
import CourseLearnersView from '../../components/CourseLearnersView';
import CourseAssessmentsView from '../../components/CourseAssessmentsView';
import TrainerCourseAiInsightsModal from '../../components/TrainerCourseAiInsightsModal';
import ResourceViewer from '../../components/ResourceViewer';
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
  Tag,
  BarChart3,
  Bot,
  Sparkles,
  Award,
  Clock,
  Settings,
} from 'lucide-react';

const ManageCoursePage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Active Top Navigation Tab
  // 'overview' | 'content' | 'learners' | 'assessments' | 'analytics'
  const [activeTab, setActiveTab] = useState('overview');

  // Modals State
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Module Editor State
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleFormData, setModuleFormData] = useState({ title: '', description: '', order: 1 });
  const [savingModule, setSavingModule] = useState(false);
  const [moduleError, setModuleError] = useState(null);

  // Resource Upload Modal State
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState(null);
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    externalUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [resourceError, setResourceError] = useState(null);

  // Resource Preview Modal
  const [previewResource, setPreviewResource] = useState(null);

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCourseByIdApi(courseId);
      if (response && response.success) {
        setCourse(response.data.course);
        setModules(response.data.modules || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch course data');
      }
    } catch (err) {
      console.error('Error loading course:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load course details.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Handler: Toggle Publish Status
  const handleTogglePublish = async () => {
    if (!course) return;
    try {
      const response = await publishCourseApi(course._id);
      if (response && response.success) {
        setCourse(response.data);
        setToast({
          type: 'success',
          message: `Course ${response.data.status === 'published' ? 'published to catalog' : 'reverted to draft'}.`,
        });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to update publication status.',
      });
    }
  };

  // Handler: Save Module
  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleFormData.title.trim()) {
      setModuleError('Module title is required.');
      return;
    }

    setSavingModule(true);
    setModuleError(null);
    try {
      if (editingModule) {
        const response = await updateModuleApi(editingModule._id, moduleFormData);
        if (response && response.success) {
          setModules((prev) =>
            prev.map((m) => (m._id === editingModule._id ? response.data : m))
          );
          setToast({ type: 'success', message: 'Module updated successfully.' });
        }
      } else {
        const response = await createModuleApi({
          ...moduleFormData,
          course: courseId,
          order: modules.length + 1,
        });
        if (response && response.success) {
          setModules((prev) => [...prev, response.data]);
          setToast({ type: 'success', message: 'New module added to curriculum.' });
        }
      }
      setShowModuleModal(false);
      setEditingModule(null);
    } catch (err) {
      setModuleError(err.response?.data?.message || err.message || 'Failed to save module.');
    } finally {
      setSavingModule(false);
    }
  };

  // Handler: Delete Module
  const handleDeleteModule = async (moduleId, moduleTitle) => {
    const confirm = window.confirm(`Delete module "${moduleTitle}" and all its lessons/quizzes?`);
    if (!confirm) return;

    try {
      const response = await deleteModuleApi(moduleId);
      if (response && response.success) {
        setModules((prev) => prev.filter((m) => m._id !== moduleId));
        setToast({ type: 'success', message: 'Module deleted.' });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to delete module.',
      });
    }
  };

  // Handler: Upload Resource
  const handleSaveResource = async (e) => {
    e.preventDefault();
    if (!resourceFormData.title.trim()) {
      setResourceError('Resource title is required.');
      return;
    }

    setUploadingResource(true);
    setResourceError(null);

    try {
      const formData = new FormData();
      formData.append('title', resourceFormData.title.trim());
      formData.append('description', resourceFormData.description.trim());
      formData.append('type', resourceFormData.type);

      if (resourceFormData.type === 'link') {
        if (!resourceFormData.externalUrl.trim()) {
          setResourceError('Please provide a valid external URL.');
          setUploadingResource(false);
          return;
        }
        formData.append('externalUrl', resourceFormData.externalUrl.trim());
      } else {
        if (!selectedFile) {
          setResourceError('Please select a file to upload.');
          setUploadingResource(false);
          return;
        }
        formData.append('file', selectedFile);
      }

      const response = await createResourceApi(targetModuleId, formData);
      if (response && response.success) {
        await fetchCourseData();
        setShowResourceModal(false);
        setResourceFormData({ title: '', description: '', type: 'pdf', externalUrl: '' });
        setSelectedFile(null);
        setToast({ type: 'success', message: 'Resource uploaded successfully.' });
      }
    } catch (err) {
      setResourceError(err.response?.data?.message || err.message || 'Failed to upload resource.');
    } finally {
      setUploadingResource(false);
    }
  };

  // Handler: Delete Resource
  const handleDeleteResource = async (moduleId, resourceId) => {
    const confirm = window.confirm('Are you sure you want to delete this resource?');
    if (!confirm) return;

    try {
      const response = await deleteResourceApi(moduleId, resourceId);
      if (response && response.success) {
        await fetchCourseData();
        setToast({ type: 'success', message: 'Resource removed.' });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to delete resource.',
      });
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loading message="Loading course workspace and curriculum data..." />
      </div>
    );
  }

  if (error || !course) {
    return <ErrorMessage message={error || 'Course not found'} onRetry={fetchCourseData} />;
  }

  const isPublished = course.status === 'published';

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/trainer/courses"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Courses</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              {isPublished ? <Globe className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
              <span>{course.status}</span>
            </span>

            <span className="text-slate-300">|</span>

            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {course.category}
            </span>

            <span className="text-xs font-bold text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded">
              {course.level}
            </span>
          </div>
        </div>

        {/* Title Row with Inline Editing */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="flex-1 min-w-0">
            <InlineCourseTitleEdit
              courseId={course._id}
              initialTitle={course.title}
              onTitleUpdated={(newTitle) => {
                setCourse((prev) => ({ ...prev, title: newTitle }));
              }}
              onNotify={(n) => setToast(n)}
            />
            {course.shortDescription ? (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.shortDescription}</p>
            ) : (
              <p className="text-xs text-slate-400 mt-1 italic">No headline set. Click "Edit Course Details" to configure metadata.</p>
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowEditDetailsModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={handleTogglePublish}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors ${
                isPublished
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {isPublished ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
              <span>{isPublished ? 'Unpublish' : 'Publish Course'}</span>
            </button>

            <Link
              to={`/courses/${course._id}`}
              className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="View Public Catalog Preview"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Course Navigation Tabs Strip */}
        <div className="flex items-center gap-1 pt-4 border-t border-slate-100 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'content'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Curriculum & Content ({modules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('learners')}
            className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'learners'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Learners</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'assessments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Assessments</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>AI & Analytics</span>
          </button>
        </div>
      </div>

      {/* ====================================================
          TAB 1: COURSE OVERVIEW
          ==================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Course Description & Syllabus
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEditDetailsModal(true)}
                  className="text-xs font-semibold text-teal-700 hover:underline inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {course.description || 'No detailed description provided yet.'}
              </p>
            </div>

            {/* Learning Outcomes Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Learning Outcomes ({course.learningOutcomes?.length || 0})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEditDetailsModal(true)}
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  Manage Outcomes
                </button>
              </div>

              {!course.learningOutcomes || course.learningOutcomes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No learning outcomes defined. Add measurable outcomes to improve trainee clarity.
                </p>
              ) : (
                <div className="space-y-2">
                  {course.learningOutcomes.map((outcome, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs text-slate-800"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-medium leading-relaxed">{outcome}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mapped Skills & Competencies */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span>Targeted Platform Skills ({course.skills?.length || 0})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEditDetailsModal(true)}
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  Map Skills
                </button>
              </div>

              {!course.skills || course.skills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No skills mapped yet. Mapping skills activates automated skill verification badges upon certificate completion.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((s, idx) => {
                    const skillObj = s.skill || s;
                    const name = typeof skillObj === 'object' ? skillObj.name : 'Technical Skill';
                    const category = typeof skillObj === 'object' ? skillObj.category : 'General';
                    const proficiency = s.proficiency || course.level || 'beginner';

                    return (
                      <div
                        key={idx}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center gap-2"
                      >
                        <span className="font-bold text-slate-800">{name}</span>
                        <span className="text-[10px] text-slate-400">({category})</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                            proficiency === 'advanced'
                              ? 'bg-purple-100 text-purple-800'
                              : proficiency === 'proficient'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {proficiency}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Course Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-bold text-slate-800">{course.estimatedDuration || 'Self-Paced'}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Language:</span>
                  <span className="font-bold text-slate-800">{course.language || 'English'}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Passing Score:</span>
                  <span className="font-bold text-slate-800">{course.passingScore || 60}%</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Certificate:</span>
                  <span className="font-bold text-emerald-700">
                    {course.certificateEligibility !== false ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Enrollment Acceptance:</span>
                  <span className="font-bold text-slate-800 uppercase text-[11px]">
                    {course.enrollmentStatus || 'Open'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Assistant Quick Launcher */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Pedagogical Assistant</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Run deep diagnostics on quiz drop-offs, difficult questions, and cohort learning friction.
              </p>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Launch Course AI Diagnostics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 2: CURRICULUM & CONTENT
          ==================================================== */}
      {activeTab === 'content' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Add Module Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Curriculum Modules ({modules.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Organize learning units, attach reading materials, video lectures, and code files.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingModule(null);
                setModuleFormData({ title: '', description: '', order: modules.length + 1 });
                setShowModuleModal(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
          </div>

          {/* Module List */}
          {modules.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-sm space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No curriculum modules added yet</h4>
              <p className="text-slate-400 max-w-sm mx-auto">
                Create your first learning module to begin attaching lectures, resources, and quizzes.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingModule(null);
                  setModuleFormData({ title: '', description: '', order: 1 });
                  setShowModuleModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-xs"
              >
                Create Module 1
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod, idx) => (
                <div
                  key={mod._id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Module Header Bar */}
                  <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{mod.title}</h4>
                        {mod.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">{mod.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Attach Resource */}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetModuleId(mod._id);
                          setResourceFormData({ title: '', description: '', type: 'pdf', externalUrl: '' });
                          setSelectedFile(null);
                          setShowResourceModal(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Upload className="w-3 h-3 text-slate-500" />
                        <span>Add Resource</span>
                      </button>

                      {/* Edit Module */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingModule(mod);
                          setModuleFormData({
                            title: mod.title,
                            description: mod.description || '',
                            order: mod.order || idx + 1,
                          });
                          setShowModuleModal(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition-colors"
                        title="Edit Module"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Module */}
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(mod._id, mod.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Module Resources List */}
                  <div className="p-4">
                    {!mod.resources || mod.resources.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No materials attached to this module yet. Click "Add Resource" to attach PDFs, videos, or links.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {mod.resources.map((res) => (
                          <div
                            key={res._id}
                            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-2 text-xs"
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              <div className="p-1.5 bg-white rounded border border-slate-200 text-teal-700 shrink-0 mt-0.5">
                                {res.type === 'video' ? (
                                  <Video className="w-3.5 h-3.5" />
                                ) : res.type === 'link' ? (
                                  <Link2 className="w-3.5 h-3.5" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate">{res.title}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-mono">{res.type}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewResource(res)}
                                className="p-1 text-slate-500 hover:text-slate-900 rounded"
                                title="Preview"
                              >
                                <Play className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteResource(mod._id, res._id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          TAB 3: LEARNERS MANAGEMENT
          ==================================================== */}
      {activeTab === 'learners' && (
        <div className="animate-fadeIn">
          <CourseLearnersView courseId={courseId} courseTitle={course.title} />
        </div>
      )}

      {/* ====================================================
          TAB 4: ASSESSMENTS WORKSPACE
          ==================================================== */}
      {activeTab === 'assessments' && (
        <div className="animate-fadeIn">
          <CourseAssessmentsView
            courseId={courseId}
            courseTitle={course.title}
            modules={modules}
            onNotify={(n) => setToast(n)}
          />
        </div>
      )}

      {/* ====================================================
          TAB 5: AI & ANALYTICS
          ==================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Curriculum AI Teaching Diagnostics</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated intelligence examining question accuracy, curriculum drop-off points, and skill proficiencies.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Diagnostic Inspector</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase">Curriculum Completion Funnel</h4>
              <p className="text-xs text-slate-600">
                View learners progressing across modules and identify where students require additional review resources.
              </p>
              <div className="pt-2">
                <Link
                  to="/trainer/analytics"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  View Global Training Analytics &rarr;
                </Link>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase">Assessment Accuracy Thresholds</h4>
              <p className="text-xs text-slate-600">
                Continuous machine evaluation of question difficulty and distractor option quality across attempts.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('assessments')}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  Manage Question Bank &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODALS
          ==================================================== */}

      {/* 1. Edit Course Details Modal */}
      {showEditDetailsModal && (
        <EditCourseDetailsModal
          isOpen={showEditDetailsModal}
          onClose={() => setShowEditDetailsModal(false)}
          course={course}
          onCourseUpdated={(updated) => {
            setCourse(updated);
            setToast({ type: 'success', message: 'Course details updated successfully.' });
          }}
          onNotify={(n) => setToast(n)}
        />
      )}

      {/* 2. Course AI Insights Modal */}
      {showAiModal && (
        <TrainerCourseAiInsightsModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          courseId={courseId}
          courseTitle={course.title}
        />
      )}

      {/* 3. Add/Edit Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-slate-900">
              {editingModule ? 'Edit Module' : 'Add New Module'}
            </h3>

            {moduleError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded border border-rose-200">
                {moduleError}
              </p>
            )}

            <form onSubmit={handleSaveModule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={moduleFormData.title}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                  placeholder="e.g., Module 1: Introduction to State & Hooks"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={moduleFormData.description}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                  placeholder="Summary of topics covered in this module..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModule}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs"
                >
                  {savingModule ? 'Saving...' : 'Save Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Upload Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-slate-900">Add Learning Resource</h3>

            {resourceError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded border border-rose-200">
                {resourceError}
              </p>
            )}

            <form onSubmit={handleSaveResource} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={resourceFormData.title}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })}
                  placeholder="e.g., Lecture Slides & Cheatsheet"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Resource Type</label>
                <select
                  value={resourceFormData.type}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 bg-white"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video Lecture</option>
                  <option value="link">External Web Link</option>
                  <option value="code">Code / Project Files</option>
                </select>
              </div>

              {resourceFormData.type === 'link' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">External URL</label>
                  <input
                    type="url"
                    required
                    value={resourceFormData.externalUrl}
                    onChange={(e) => setResourceFormData({ ...resourceFormData, externalUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Attachment</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingResource}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs"
                >
                  {uploadingResource ? 'Uploading...' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Resource Viewer Modal */}
      {previewResource && (
        <ResourceViewer
          isOpen={Boolean(previewResource)}
          onClose={() => setPreviewResource(null)}
          resource={previewResource}
        />
      )}
    </div>
  );
};

export default ManageCoursePage;
