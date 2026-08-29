import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getProfileApi,
  updateProfileApi,
  uploadProfilePhotoApi,
  deleteProfilePhotoApi,
} from '../../services/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  BookOpen,
  Users,
  Award,
  BarChart3,
  TrendingUp,
  Pencil,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const COMMON_TEACHING_EXPERTISE = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Python',
  'Data Structures & Algorithms',
  'Cloud Architecture (AWS / GCP / Azure)',
  'DevOps & Docker',
  'Cybersecurity & Network Defense',
  'Machine Learning & Deep Learning',
  'SQL & Database Design',
  'API & Microservices Architecture',
  'UI/UX Design Systems',
  'Agile Project Management',
];

const TrainerProfilePage = () => {
  const { user: authUser, updateUserContext } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [toast, setToast] = useState(null);

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isExpertiseModalOpen, setIsExpertiseModalOpen] = useState(false);

  // Form State
  const [trainerForm, setTrainerForm] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    designation: '',
    organization: '',
    yearsOfExperience: '',
    professionalBackground: '',
  });

  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [customExpertiseInput, setCustomExpertiseInput] = useState('');

  // Photo upload state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProfileApi();
      if (res && res.success) {
        setProfileData(res);
        if (res.user) {
          setTrainerForm({
            name: res.user.name || '',
            phone: res.user.phone || '',
            location: res.user.location || '',
            bio: res.user.bio || '',
            designation: res.user.designation || '',
            organization: res.user.organization || '',
            yearsOfExperience: res.user.yearsOfExperience !== undefined ? String(res.user.yearsOfExperience) : '0',
            professionalBackground: res.user.professionalBackground || '',
          });
          setSelectedExpertise(res.user.teachingInterests || []);
          updateUserContext(res.user);
        }
      }
    } catch (err) {
      console.error('Failed to load trainer profile:', err);
      showToast(err.response?.data?.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }, [updateUserContext]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfileApi({
        name: trainerForm.name.trim(),
        phone: trainerForm.phone.trim(),
        location: trainerForm.location.trim(),
        bio: trainerForm.bio.trim(),
        designation: trainerForm.designation.trim(),
        organization: trainerForm.organization.trim(),
        yearsOfExperience: Number(trainerForm.yearsOfExperience) || 0,
        professionalBackground: trainerForm.professionalBackground.trim(),
      });
      if (res.success) {
        showToast('Trainer profile updated successfully');
        setIsEditProfileOpen(false);
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update trainer profile', 'error');
    }
  };

  const handleSaveExpertise = async () => {
    try {
      const res = await updateProfileApi({
        teachingInterests: selectedExpertise,
      });
      if (res.success) {
        showToast('Teaching expertise areas updated');
        setIsExpertiseModalOpen(false);
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update expertise', 'error');
    }
  };

  const toggleExpertise = (tag) => {
    setSelectedExpertise((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomExpertise = (e) => {
    e.preventDefault();
    const tag = customExpertiseInput.trim();
    if (tag && !selectedExpertise.includes(tag)) {
      setSelectedExpertise([...selectedExpertise, tag]);
      setCustomExpertiseInput('');
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Profile image size must not exceed 5MB', 'error');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    const formData = new FormData();
    formData.append('photo', photoFile);

    try {
      setUploadingPhoto(true);
      const res = await uploadProfilePhotoApi(formData);
      if (res.success) {
        showToast('Profile photo updated');
        setIsPhotoModalOpen(false);
        setPhotoFile(null);
        setPhotoPreview('');
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    try {
      setUploadingPhoto(true);
      const res = await deleteProfilePhotoApi();
      if (res.success) {
        showToast('Profile photo removed');
        setIsPhotoModalOpen(false);
        setPhotoFile(null);
        setPhotoPreview('');
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const user = profileData?.user || authUser || {};
  const summary = profileData?.summary || {};
  const teachingOverview = summary.teachingOverview || {};
  const performanceSummary = summary.performanceSummary || {};
  const expertiseList = user.teachingInterests || [];

  if (loading && !profileData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading trainer profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-2 animate-fadeIn ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. TRAINER PROFILE HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-teal-50/80 via-slate-50/40 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar with upload overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-linear-to-tr from-teal-600 to-emerald-600 border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-white text-3xl font-bold">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span>{user.name ? user.name.charAt(0).toUpperCase() : 'T'}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setPhotoPreview(user.photo || '');
                setPhotoFile(null);
                setIsPhotoModalOpen(true);
              }}
              className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-xl shadow-md hover:bg-teal-600 transition-colors"
              title="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Trainer Bio & Identity */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {user.name || 'Trainer Name'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wide">
                Instructor / Trainer
              </span>
            </div>

            {/* Designation & Org */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 font-medium">
              {user.designation && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{user.designation}</span>
                </div>
              )}
              {user.organization && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{user.organization}</span>
                </div>
              )}
              {user.yearsOfExperience > 0 && (
                <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  <span>{user.yearsOfExperience} yrs exp</span>
                </div>
              )}
            </div>

            {user.bio ? (
              <p className="text-sm text-slate-600 line-clamp-2 max-w-3xl">
                {user.bio}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">
                No bio provided yet. Add your instructor summary and pedagogical focus.
              </p>
            )}

            {/* Contact details */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Trainer Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS & TEACHING OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Teaching Overview & Teaching Expertise */}
        <div className="lg:col-span-6 space-y-6">
          {/* Teaching Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Teaching Overview</h2>
                  <p className="text-xs text-slate-500">Curriculum and course delivery volume</p>
                </div>
              </div>
              <Link
                to="/trainer/courses"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View My Courses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Courses Created</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {teachingOverview.coursesCreated || 0}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Published</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
                  {teachingOverview.publishedCourses || 0}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Draft Courses</span>
                <span className="text-xl font-extrabold text-amber-600 mt-1 block">
                  {teachingOverview.draftCourses || 0}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Learners Trained</span>
                <span className="text-xl font-extrabold text-blue-600 mt-1 block">
                  {teachingOverview.totalLearners || 0}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-2">
                <span className="text-xs text-slate-500 block">Certificates Issued</span>
                <span className="text-xl font-extrabold text-teal-700 mt-1 block">
                  {teachingOverview.certificatesIssued || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Teaching Expertise Chips Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Teaching Expertise</h2>
                  <p className="text-xs text-slate-500">Subjects and technical competencies taught</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedExpertise(user.teachingInterests || []);
                  setIsExpertiseModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-xs"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Manage Expertise</span>
              </button>
            </div>

            <div className="pt-2">
              {expertiseList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {expertiseList.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No teaching expertise tags added</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                    Add topics you teach so learners and administrators understand your specialization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Performance Summary & Professional Background */}
        <div className="lg:col-span-6 space-y-6">
          {/* Performance Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Performance Summary</h2>
                  <p className="text-xs text-slate-500">Aggregated learner outcomes across your courses</p>
                </div>
              </div>
              <Link
                to="/trainer/analytics"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Total Enrollments</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {performanceSummary.totalEnrollments || 0}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Completion Rate</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
                  {performanceSummary.completionRate || 0}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Avg Assessment</span>
                <span className="text-xl font-extrabold text-blue-600 mt-1 block">
                  {performanceSummary.averageAssessmentScore || 0}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Instructor Rating</span>
                <span className="text-xl font-extrabold text-amber-600 mt-1 block">
                  {performanceSummary.averageRating ? `${performanceSummary.averageRating} ★` : '—'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-2">
                <span className="text-xs text-slate-500 block">Certificates Awarded</span>
                <span className="text-xl font-extrabold text-teal-700 mt-1 block">
                  {performanceSummary.certificatesIssued || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Professional Background Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Professional Background</h2>
                  <p className="text-xs text-slate-500">Industry career trajectory and credentials</p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              {user.professionalBackground ? (
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {user.professionalBackground}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No professional background added. Click "Edit Trainer Profile" to add your work history.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* MODALS */}
      {/* ================================================= */}

      {/* 1. Edit Trainer Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Trainer Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trainerForm.name}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={trainerForm.designation}
                    onChange={(e) => setTrainerForm({ ...trainerForm, designation: e.target.value })}
                    placeholder="e.g. Lead Instructor"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization / Dept
                  </label>
                  <input
                    type="text"
                    value={trainerForm.organization}
                    onChange={(e) => setTrainerForm({ ...trainerForm, organization: e.target.value })}
                    placeholder="e.g. Tech Academy"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={trainerForm.yearsOfExperience}
                    onChange={(e) => setTrainerForm({ ...trainerForm, yearsOfExperience: e.target.value })}
                    placeholder="e.g. 8"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={trainerForm.phone}
                    onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                    placeholder="+1 555-0199"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location (City / Country)
                </label>
                <input
                  type="text"
                  value={trainerForm.location}
                  onChange={(e) => setTrainerForm({ ...trainerForm, location: e.target.value })}
                  placeholder="e.g. Boston, MA"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Bio
                </label>
                <textarea
                  rows={2}
                  value={trainerForm.bio}
                  onChange={(e) => setTrainerForm({ ...trainerForm, bio: e.target.value })}
                  placeholder="Brief instructor overview..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Professional Background
                </label>
                <textarea
                  rows={3}
                  value={trainerForm.professionalBackground}
                  onChange={(e) => setTrainerForm({ ...trainerForm, professionalBackground: e.target.value })}
                  placeholder="Detailed work experience, previous teaching roles, certifications..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Profile Photo</h3>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 bg-slate-100 flex items-center justify-center shadow-md">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-400" />
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-xs"
                >
                  Choose Image
                </button>
                {user.photo && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Supported formats: JPG, PNG, WEBP, GIF (Max size: 5MB)
              </p>
            </div>

            {photoFile && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(user.photo || '');
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={uploadingPhoto}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Uploading...' : 'Save Photo'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Teaching Expertise Modal */}
      {isExpertiseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Teaching Expertise</h3>
              <button
                type="button"
                onClick={() => setIsExpertiseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Select Competency & Teaching Areas:
                </span>
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
                  {COMMON_TEACHING_EXPERTISE.map((tag) => {
                    const isSelected = selectedExpertise.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleExpertise(tag)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add custom tag */}
              <form onSubmit={handleAddCustomExpertise} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customExpertiseInput}
                  onChange={(e) => setCustomExpertiseInput(e.target.value)}
                  placeholder="Add custom teaching skill (e.g. Next.js, Kubernetes)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900"
                >
                  Add Tag
                </button>
              </form>

              {/* Selected preview */}
              {selectedExpertise.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                    Selected Expertise Areas ({selectedExpertise.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedExpertise.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => toggleExpertise(item)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpertiseModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveExpertise}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-xs"
                >
                  Save Expertise
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerProfilePage;
