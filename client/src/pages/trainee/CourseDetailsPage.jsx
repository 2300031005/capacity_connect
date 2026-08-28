import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getCourseByIdApi,
  enrollCourseApi,
  getCourseReviewsApi,
  createCourseReviewApi,
  updateCourseReviewApi,
  deleteCourseReviewApi,
  getCourseDiscussionsApi,
  createCourseDiscussionMessageApi,
  toggleModuleCompleteApi
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import ResourceViewer from '../../components/ResourceViewer';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Users,
  GraduationCap,
  CheckCircle2,
  FileText,
  Link2,
  ExternalLink,
  Download,
  Award,
  Video,
  Image as ImageIcon,
  FileCode,
  FileSpreadsheet,
  Play,
  Star,
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';

const CourseDetailsPage = () => {
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'reviews' | 'discussion'

  // Course & Enrollment State
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Reviews State
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    totalReviews: 0,
    averageRating: 0,
    myReview: null,
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Discussions State
  const [discussions, setDiscussions] = useState([]);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [discussionError, setDiscussionError] = useState(null);

  // Resource previewer modal state
  const [previewResource, setPreviewResource] = useState(null);

  const isOwnerTrainer =
    user?.role === 'trainer' &&
    course?.trainer &&
    (course.trainer._id === user?._id || course.trainer === user?._id || course.trainer.id === user?._id);
  const isAdmin = user?.role === 'admin';
  const hasCommunityAccess = isEnrolled || isOwnerTrainer || isAdmin;

  // 1. Fetch Course Core Details
  const fetchCourseDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCourseByIdApi(courseId);
      if (response && response.success && response.data) {
        setCourse(response.data.course);
        setModules(response.data.modules || []);
        setIsEnrolled(response.data.isEnrolled);
        setEnrollment(response.data.enrollment);
        if (response.data.enrollment?.completedModules) {
          setCompletedModules(
            response.data.enrollment.completedModules.map((m) =>
              typeof m === 'object' ? m._id : m
            )
          );
        }
      } else {
        throw new Error(response?.message || 'Course details not found');
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load course details.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // 2. Fetch Reviews
  const fetchReviews = useCallback(async () => {
    setReviewLoading(true);
    try {
      const response = await getCourseReviewsApi(courseId);
      if (response && response.success) {
        setReviewsData(response.data);
        if (response.data.myReview) {
          setReviewRating(response.data.myReview.rating);
          setReviewComment(response.data.myReview.comment || '');
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewLoading(false);
    }
  }, [courseId]);

  // 3. Fetch Discussions
  const fetchDiscussions = useCallback(async () => {
    if (!hasCommunityAccess) return;
    setDiscussionLoading(true);
    try {
      const response = await getCourseDiscussionsApi(courseId);
      if (response && response.success) {
        setDiscussions(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching discussions:', err);
    } finally {
      setDiscussionLoading(false);
    }
  }, [courseId, hasCommunityAccess]);

  useEffect(() => {
    fetchCourseDetails();
    fetchReviews();
  }, [fetchCourseDetails, fetchReviews]);

  useEffect(() => {
    if (activeTab === 'discussion' && hasCommunityAccess) {
      fetchDiscussions();
    }
  }, [activeTab, hasCommunityAccess, fetchDiscussions]);

  // ====================================================
  // ENROLLMENT HANDLER
  // ====================================================
  const handleEnroll = async () => {
    setEnrollLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await enrollCourseApi(courseId);
      if (response && response.success) {
        setIsEnrolled(true);
        setEnrollment(response.data);
        setSuccessMessage('Congratulations! You are now enrolled in this course.');
        setCourse((prev) => ({ ...prev, enrolledCount: (prev.enrolledCount || 0) + 1 }));
        await fetchCourseDetails();
        await fetchReviews();
      } else {
        throw new Error(response?.message || 'Enrollment failed');
      }
    } catch (err) {
      console.error('Enroll error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to enroll in course.');
    } finally {
      setEnrollLoading(false);
    }
  };

  // ====================================================
  // REVIEWS HANDLERS
  // ====================================================
  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'trainee' || !isEnrolled) return;

    setSubmittingReview(true);
    setReviewError(null);

    try {
      if (reviewsData.myReview) {
        // Update existing review
        await updateCourseReviewApi(reviewsData.myReview._id, {
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
        setIsEditingReview(false);
      } else {
        // Create new review
        await createCourseReviewApi(courseId, {
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
      }
      await fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message || 'Failed to save review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewsData.myReview) return;
    const confirm = window.confirm('Are you sure you want to delete your review?');
    if (!confirm) return;

    setSubmittingReview(true);
    try {
      await deleteCourseReviewApi(reviewsData.myReview._id);
      setIsEditingReview(false);
      setReviewComment('');
      setReviewRating(5);
      await fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message || 'Failed to delete review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // ====================================================
  // DISCUSSIONS HANDLER
  // ====================================================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    setDiscussionError(null);

    try {
      const response = await createCourseDiscussionMessageApi(courseId, {
        message: newMessage.trim(),
      });
      if (response && response.success) {
        setDiscussions((prev) => [...prev, response.data]);
        setNewMessage('');
      }
    } catch (err) {
      setDiscussionError(err.response?.data?.message || err.message || 'Failed to post message.');
    } finally {
      setSendingMessage(false);
    }
  };

  // ====================================================
  // MODULE COMPLETION TOGGLE HANDLER
  // ====================================================
  const handleToggleModuleCompletion = async (moduleId) => {
    if (!isEnrolled || user?.role !== 'trainee') return;

    try {
      const response = await toggleModuleCompleteApi(courseId, moduleId);
      if (response && response.success) {
        setCompletedModules(response.data.completedModules || []);
        setEnrollment((prev) => ({
          ...prev,
          progress: response.data.progress,
          status: response.data.status,
          completedModules: response.data.completedModules,
        }));
      }
    } catch (err) {
      console.error('Error toggling module completion:', err);
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

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loading message="Loading course syllabus..." />
      </div>
    );
  }

  if (!course) {
    return <ErrorMessage message="Course could not be loaded." onRetry={fetchCourseDetails} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          to="/trainee/courses"
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs px-4 py-3 rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <Link
            to="/trainee/my-courses"
            className="font-bold underline text-emerald-900 ml-3 hover:text-emerald-950"
          >
            Go to My Courses
          </Link>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Course Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {course.category}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {course.level}
              </span>
              {isEnrolled && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Enrolled</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {course.title}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              {reviewsData.totalReviews > 0 ? (
                <>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{reviewsData.averageRating}</span>
                  </div>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-600 font-medium">
                    {reviewsData.totalReviews} {reviewsData.totalReviews === 1 ? 'review' : 'reviews'}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 italic">No reviews yet</span>
              )}
            </div>
          </div>

          {/* Enrollment Button */}
          <div className="flex-shrink-0 self-start sm:self-auto">
            {isEnrolled ? (
              <div className="flex flex-col items-end gap-1.5">
                <Link
                  to="/trainee/my-courses"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>In My Courses</span>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${enrollment?.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600">
                    {enrollment?.progress || 0}%
                  </span>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                loading={enrollLoading}
                disabled={enrollLoading}
                onClick={handleEnroll}
                className="px-6 py-2.5 text-xs font-semibold"
              >
                <span>Enroll in Course</span>
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4">
          {course.description}
        </p>

        {/* Prerequisites (if provided) */}
        {course.prerequisites && (
          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs space-y-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              Prerequisites
            </span>
            <p className="text-slate-600 leading-relaxed">
              {course.prerequisites}
            </p>
          </div>
        )}

        {/* Instructor & Metadata strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Instructor</span>
              <strong className="text-slate-800">{course.trainer?.name || 'Instructor'}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Curriculum</span>
              <strong className="text-slate-800">{modules.length} Modules</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Community</span>
              <strong className="text-slate-800">{course.enrolledCount || 0} Learners</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-3 pt-2 rounded-t-lg shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'curriculum'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Curriculum ({modules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Reviews ({reviewsData.totalReviews})</span>
        </button>

        {hasCommunityAccess && (
          <button
            type="button"
            onClick={() => setActiveTab('discussion')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'discussion'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discussion</span>
          </button>
        )}
      </div>

      {/* ====================================================
          TAB 1: CURRICULUM & MODULES
          ==================================================== */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          {modules.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-400 shadow-sm">
              No modules have been published for this course yet.
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod, idx) => {
                const isModuleCompleted = completedModules.includes(mod._id);

                return (
                  <div
                    key={mod._id}
                    className={`bg-white border rounded-lg p-5 shadow-sm space-y-3 transition-all ${
                      isModuleCompleted ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200'
                    }`}
                  >
                    {/* Module Heading */}
                    <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                            Module {idx + 1}
                          </span>
                          {isEnrolled && isModuleCompleted && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                        {mod.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                        )}
                      </div>

                      {/* Module Completion Toggle Button */}
                      {isEnrolled && user?.role === 'trainee' && (
                        <button
                          type="button"
                          onClick={() => handleToggleModuleCompletion(mod._id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border transition-all flex-shrink-0 ${
                            isModuleCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                              : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                          title={isModuleCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          {isModuleCompleted ? (
                            <CheckSquare className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{isModuleCompleted ? 'Completed' : 'Mark Complete'}</span>
                        </button>
                      )}
                    </div>

                  {/* Module Resources — Shown ONLY after enrollment */}
                  {isEnrolled && (
                    mod.resources && mod.resources.length > 0 ? (
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
                                    {resItem.type}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {isLink ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewResource(resItem)}
                                    className="px-2.5 py-1 bg-white border border-slate-200 text-blue-600 hover:text-blue-800 rounded font-medium inline-flex items-center gap-1 hover:bg-slate-50 text-[11px]"
                                  >
                                    <span>Open Link</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                ) : resItem.type === 'video' ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewResource(resItem)}
                                    className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded font-medium inline-flex items-center gap-1 text-[11px]"
                                  >
                                    <span>Watch</span>
                                    <Play className="w-3 h-3" />
                                  </button>
                                ) : resItem.type === 'image' ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewResource(resItem)}
                                    className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded font-medium inline-flex items-center gap-1 text-[11px]"
                                  >
                                    <span>View</span>
                                    <ImageIcon className="w-3 h-3" />
                                  </button>
                                ) : resItem.type === 'pdf' ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewResource(resItem)}
                                    className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded font-medium inline-flex items-center gap-1 text-[11px]"
                                  >
                                    <span>Open PDF</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                ) : resItem.type === 'text' ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewResource(resItem)}
                                    className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 rounded font-medium inline-flex items-center gap-1 text-[11px]"
                                  >
                                    <span>Read</span>
                                    <FileCode className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <a
                                    href={fileUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 bg-white border border-slate-200 text-emerald-700 hover:text-emerald-900 rounded font-medium inline-flex items-center gap-1 hover:bg-slate-50 text-[11px]"
                                  >
                                    <span>Download</span>
                                    <Download className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No resources attached to this module yet.</p>
                    )
                  )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Enrollment Callout Banner for Non-Enrolled Trainees */}
          {!isEnrolled && modules.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center space-y-3 mt-6">
              <p className="text-xs sm:text-sm font-medium text-emerald-900 max-w-lg mx-auto leading-relaxed">
                Enroll in this course to unlock all video lectures, study guides, reading materials, and curriculum resources.
              </p>
              <Button
                type="button"
                variant="primary"
                size="md"
                loading={enrollLoading}
                disabled={enrollLoading}
                onClick={handleEnroll}
                className="inline-flex items-center gap-1.5 px-6 text-xs font-semibold"
              >
                <span>Enroll Now</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          TAB 2: REVIEWS & RATINGS
          ==================================================== */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Learner Reviews & Feedback</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ratings and authentic feedback submitted by enrolled learners.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 px-4 py-2.5 rounded border border-slate-200">
              <div className="text-center">
                <span className="text-2xl font-bold text-slate-900 block leading-none">
                  {reviewsData.averageRating > 0 ? reviewsData.averageRating : '—'}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono mt-0.5 block">out of 5</span>
              </div>
              <div className="border-l border-slate-200 pl-3 space-y-0.5">
                {renderStarRating(Math.round(reviewsData.averageRating))}
                <span className="text-[11px] text-slate-500 block">
                  {reviewsData.totalReviews} {reviewsData.totalReviews === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
          </div>

          {/* Write / Edit Review Card (For Enrolled Trainees) */}
          {isEnrolled && user?.role === 'trainee' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">
                  {reviewsData.myReview && !isEditingReview
                    ? 'Your Review'
                    : reviewsData.myReview
                    ? 'Edit Your Review'
                    : 'Write a Review'}
                </h4>
                {reviewsData.myReview && !isEditingReview && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingReview(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Review</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteReview}
                      disabled={submittingReview}
                      className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {reviewError && <ErrorMessage message={reviewError} />}

              {reviewsData.myReview && !isEditingReview ? (
                /* Display My Existing Review */
                <div className="bg-slate-50 rounded p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    {renderStarRating(reviewsData.myReview.rating)}
                    <span className="text-[10px] text-slate-400">
                      {new Date(reviewsData.myReview.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &quot;{reviewsData.myReview.comment || 'No written comment provided.'}&quot;
                  </p>
                </div>
              ) : (
                /* Form for Write / Edit Review */
                <form onSubmit={handleSaveReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-semibold text-slate-700 ml-2">
                        {reviewRating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Review <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your feedback about course curriculum, pacing, and learning materials..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {isEditingReview && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingReview(false);
                          setReviewRating(reviewsData.myReview.rating);
                          setReviewComment(reviewsData.myReview.comment || '');
                        }}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded"
                      >
                        Cancel
                      </button>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={submittingReview}
                      disabled={submittingReview}
                    >
                      {reviewsData.myReview ? 'Update Review' : 'Publish Review'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* List of All Reviews */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Community Reviews ({reviewsData.totalReviews})
            </h4>

            {reviewLoading ? (
              <div className="py-8 flex justify-center">
                <Loading message="Loading reviews..." />
              </div>
            ) : reviewsData.reviews.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-400 shadow-sm">
                No reviews yet. Be the first to review this course!
              </div>
            ) : (
              <div className="space-y-3">
                {reviewsData.reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                          {rev.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-900">{rev.user?.name || 'Anonymous'}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      {renderStarRating(rev.rating)}
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-slate-700 leading-relaxed pl-9">
                        &quot;{rev.comment}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 3: DISCUSSION & GROUP CHAT
          ==================================================== */}
      {activeTab === 'discussion' && hasCommunityAccess && (
        <div className="space-y-4">
          {/* Group Chat Container */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-[550px] overflow-hidden">
              {/* Discussion Header */}
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Course Community Discussion
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {discussions.length} Messages
                </span>
              </div>

              {/* Messages Stream */}
              <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50/40">
                {discussionLoading ? (
                  <div className="py-12 flex justify-center">
                    <Loading message="Loading discussion..." />
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-600">No discussion messages yet.</p>
                    <p>Start the conversation with your instructor and classmates!</p>
                  </div>
                ) : (
                  discussions.map((msg) => {
                    const isMe = msg.sender?._id === user?._id;
                    const isTrainerMsg = msg.sender?.role === 'trainer';
                    const isAdminMsg = msg.sender?.role === 'admin';

                    const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-bold text-slate-800">
                            {msg.sender?.name || 'User'}
                          </span>
                          {isTrainerMsg && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                              Trainer
                            </span>
                          )}
                          {isAdminMsg && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              Admin
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">{formattedTime}</span>
                        </div>

                        <div
                          className={`max-w-md rounded-lg px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-slate-900 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              <div className="p-3 bg-white border-t border-slate-200">
                {discussionError && (
                  <p className="text-[11px] text-red-600 mb-2">{discussionError}</p>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    maxLength={1000}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message to the class..."
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={sendingMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-4 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
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

export default CourseDetailsPage;
