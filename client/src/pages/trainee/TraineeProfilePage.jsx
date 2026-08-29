import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getProfileApi,
  updateProfileApi,
  uploadProfilePhotoApi,
  deleteProfilePhotoApi,
} from '../../services/api';
import CertificateModal from '../../components/CertificateModal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Target,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Camera,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  X,
  AlertCircle,
  Layers,
  BarChart2,
  Compass,
} from 'lucide-react';

const COMMON_INTERESTS = [
  'Web Development',
  'Frontend Engineering',
  'Backend Engineering',
  'Full Stack Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cloud Computing',
  'Cybersecurity',
  'DevOps & CI/CD',
  'UI/UX Design',
  'Mobile App Development',
  'System Design',
  'Database Management',
  'Agile Methodologies',
  'Software Architecture',
];

const COMMON_CAREER_GOALS = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Cloud & DevOps Engineer',
  'Data Scientist',
  'AI / ML Engineer',
  'Cybersecurity Specialist',
  'Software Architect',
  'Mobile Application Developer',
  'Technical Product Manager',
];

const TraineeProfilePage = () => {
  const { user: authUser, updateUserContext } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'education-experience' | 'skills-competencies' | 'certificates' | 'career-interests'
  const [toast, setToast] = useState(null);

  // Selected Certificate for modal view
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCareerGoalModalOpen, setIsCareerGoalModalOpen] = useState(false);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const [educationModalState, setEducationModalState] = useState({ isOpen: false, item: null, index: -1 });
  const [experienceModalState, setExperienceModalState] = useState({ isOpen: false, item: null, index: -1 });

  // Form states for modals
  const [basicForm, setBasicForm] = useState({ name: '', phone: '', location: '', bio: '' });
  const [careerGoalInput, setCareerGoalInput] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [customInterestInput, setCustomInterestInput] = useState('');

  // Education Form
  const [eduForm, setEduForm] = useState({
    qualification: '',
    institution: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: '',
    description: '',
  });

  // Experience Form
  const [expForm, setExpForm] = useState({
    jobTitle: '',
    organization: '',
    employmentType: 'Full-time',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });

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
          setBasicForm({
            name: res.user.name || '',
            phone: res.user.phone || '',
            location: res.user.location || '',
            bio: res.user.bio || '',
          });
          setCareerGoalInput(res.user.careerGoal || '');
          setSelectedInterests(res.user.interests || []);
          updateUserContext(res.user);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      showToast(err.response?.data?.message || 'Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  }, [updateUserContext]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle Basic Profile Update
  const handleSaveBasicProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfileApi({
        name: basicForm.name.trim(),
        phone: basicForm.phone.trim(),
        location: basicForm.location.trim(),
        bio: basicForm.bio.trim(),
      });
      if (res.success) {
        showToast('Profile information updated successfully');
        setIsEditProfileOpen(false);
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  // Handle Career Goal Update
  const handleSaveCareerGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfileApi({
        careerGoal: careerGoalInput.trim(),
      });
      if (res.success) {
        showToast('Career goal saved! AI recommendation engine updated.');
        setIsCareerGoalModalOpen(false);
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update career goal', 'error');
    }
  };

  // Handle Interests Update
  const handleSaveInterests = async () => {
    try {
      const res = await updateProfileApi({
        interests: selectedInterests,
      });
      if (res.success) {
        showToast('Learning interests updated successfully');
        setIsInterestsModalOpen(false);
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update interests', 'error');
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleAddCustomInterest = (e) => {
    e.preventDefault();
    const tag = customInterestInput.trim();
    if (tag && !selectedInterests.includes(tag)) {
      setSelectedInterests([...selectedInterests, tag]);
      setCustomInterestInput('');
    }
  };

  // Education Handlers
  const openAddEducation = () => {
    setEduForm({
      qualification: '',
      institution: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
      description: '',
    });
    setEducationModalState({ isOpen: true, item: null, index: -1 });
  };

  const openEditEducation = (item, index) => {
    setEduForm({
      qualification: item.qualification || '',
      institution: item.institution || '',
      fieldOfStudy: item.fieldOfStudy || '',
      startYear: item.startYear !== null ? String(item.startYear) : '',
      endYear: item.endYear !== null ? String(item.endYear) : '',
      description: item.description || '',
    });
    setEducationModalState({ isOpen: true, item, index });
  };

  const handleSaveEducation = async (e) => {
    e.preventDefault();
    const currentList = [...(profileData?.user?.education || [])];
    const newEntry = {
      qualification: eduForm.qualification.trim(),
      institution: eduForm.institution.trim(),
      fieldOfStudy: eduForm.fieldOfStudy.trim(),
      startYear: eduForm.startYear ? Number(eduForm.startYear) : null,
      endYear: eduForm.endYear ? Number(eduForm.endYear) : null,
      description: eduForm.description.trim(),
    };

    if (educationModalState.index >= 0) {
      currentList[educationModalState.index] = newEntry;
    } else {
      currentList.unshift(newEntry);
    }

    try {
      const res = await updateProfileApi({ education: currentList });
      if (res.success) {
        showToast('Education background updated successfully');
        setEducationModalState({ isOpen: false, item: null, index: -1 });
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save education entry', 'error');
    }
  };

  const handleDeleteEducation = async (index) => {
    if (!window.confirm('Are you sure you want to remove this education entry?')) return;
    const currentList = [...(profileData?.user?.education || [])];
    currentList.splice(index, 1);
    try {
      const res = await updateProfileApi({ education: currentList });
      if (res.success) {
        showToast('Education entry removed');
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete education entry', 'error');
    }
  };

  // Experience Handlers
  const openAddExperience = () => {
    setExpForm({
      jobTitle: '',
      organization: '',
      employmentType: 'Full-time',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    });
    setExperienceModalState({ isOpen: true, item: null, index: -1 });
  };

  const openEditExperience = (item, index) => {
    setExpForm({
      jobTitle: item.jobTitle || '',
      organization: item.organization || '',
      employmentType: item.employmentType || 'Full-time',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      isCurrent: Boolean(item.isCurrent),
      description: item.description || '',
    });
    setExperienceModalState({ isOpen: true, item, index });
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    const currentList = [...(profileData?.user?.experience || [])];
    const newEntry = {
      jobTitle: expForm.jobTitle.trim(),
      organization: expForm.organization.trim(),
      employmentType: expForm.employmentType,
      startDate: expForm.startDate.trim(),
      endDate: expForm.isCurrent ? '' : expForm.endDate.trim(),
      isCurrent: expForm.isCurrent,
      description: expForm.description.trim(),
    };

    if (experienceModalState.index >= 0) {
      currentList[experienceModalState.index] = newEntry;
    } else {
      currentList.unshift(newEntry);
    }

    try {
      const res = await updateProfileApi({ experience: currentList });
      if (res.success) {
        showToast('Work experience updated successfully');
        setExperienceModalState({ isOpen: false, item: null, index: -1 });
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save experience entry', 'error');
    }
  };

  const handleDeleteExperience = async (index) => {
    if (!window.confirm('Are you sure you want to remove this experience entry?')) return;
    const currentList = [...(profileData?.user?.experience || [])];
    currentList.splice(index, 1);
    try {
      const res = await updateProfileApi({ experience: currentList });
      if (res.success) {
        showToast('Work experience entry removed');
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete experience entry', 'error');
    }
  };

  // Photo Upload Handlers
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
        showToast('Profile photo updated successfully');
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
  const overview = summary.overview || {};
  const learningSnapshot = summary.learningSnapshot || {};
  const verifiedSkills = summary.verifiedSkills || [];
  const competencies = summary.competencies || [];
  const recentCertificates = summary.recentCertificates || [];
  const educationList = user.education || [];
  const experienceList = user.experience || [];
  const interestsList = user.interests || [];

  if (loading && !profileData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading professional profile...</p>
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

      {/* 1. STRONG PROFILE HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-blue-50/80 via-slate-50/40 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar with upload overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:end sm:h-28 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-white text-3xl font-bold">
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
              className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-xl shadow-md hover:bg-blue-600 transition-colors"
              title="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Bio & Identity Info */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {user.name || 'Trainee Name'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                Trainee
              </span>
            </div>

            {user.bio ? (
              <p className="text-sm text-slate-600 line-clamp-2 max-w-3xl">
                {user.bio}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">
                No bio added yet. Tell others about your learning background and ambitions.
              </p>
            )}

            {/* Career Goal Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  Career Goal: <strong className="text-indigo-900">{user.careerGoal || 'Full Stack Developer'}</strong>
                </span>
              </div>

              {user.location && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.location}</span>
                </div>
              )}

              {user.email && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </div>
              )}

              {user.phone && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCareerGoalModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Edit Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'education-experience', label: 'Education & Experience', icon: GraduationCap },
            { id: 'skills-competencies', label: 'Skills & Competencies', icon: Target },
            { id: 'certificates', label: 'Certificates', icon: Award },
            { id: 'career-interests', label: 'Career Goal & Interests', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-2 sm:px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. TAB CONTENTS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Achievement Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Courses Completed</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {overview.coursesCompleted ?? 0}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">In Progress</span>
              <span className="text-2xl font-extrabold text-blue-600 mt-1 block">
                {overview.coursesInProgress ?? 0}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Certificates</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                {overview.certificatesEarned ?? 0}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Verified Skills</span>
              <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">
                {overview.verifiedSkillsCount ?? 0}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Competencies</span>
              <span className="text-2xl font-extrabold text-purple-600 mt-1 block">
                {overview.competenciesDemonstrated ?? 0}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Overall Progress</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {overview.overallProgress ?? 0}%
              </span>
            </div>
          </div>

          {/* Desktop 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: About / Learning Snapshot */}
            <div className="lg:col-span-6 space-y-6">
              {/* Learning Snapshot Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Learning Snapshot</h2>
                      <p className="text-xs text-slate-500">Summary of academic performance & completion</p>
                    </div>
                  </div>
                  <Link
                    to="/trainee/analytics"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Full Analytics</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 block">Active Courses</span>
                    <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                      {learningSnapshot.activeCourses || 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 block">Completed Courses</span>
                    <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                      {learningSnapshot.completedCourses || 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 block">Avg Assessment</span>
                    <span className="text-lg font-bold text-emerald-600 mt-0.5 block">
                      {learningSnapshot.averageAssessment || 0}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Degree of Completion</span>
                    <span className="font-bold text-slate-900">{learningSnapshot.overallProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${learningSnapshot.overallProgress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Verified Skills Summary Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Verified Skills</h2>
                      <p className="text-xs text-slate-500">System-verified competencies</p>
                    </div>
                  </div>
                  <Link
                    to="/trainee/skills"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View All Skills</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="pt-4">
                  {verifiedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {verifiedSkills.slice(0, 8).map((sk) => (
                        <div
                          key={sk._id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium hover:bg-slate-100 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{sk.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                              sk.proficiency === 'advanced'
                                ? 'bg-purple-100 text-purple-700'
                                : sk.proficiency === 'proficient'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {sk.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">No verified skills yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                        Complete courses and pass final assessments to build your verified skill profile.
                      </p>
                      <Link
                        to="/trainee/courses"
                        className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                      >
                        <span>Explore Courses</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Competencies & Certificates */}
            <div className="lg:col-span-6 space-y-6">
              {/* Competency Summary Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Competency Progress</h2>
                      <p className="text-xs text-slate-500">Industry-aligned competency tracks</p>
                    </div>
                  </div>
                  <Link
                    to="/trainee/competencies"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View Competencies</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="pt-4 space-y-3">
                  {competencies.length > 0 ? (
                    competencies.slice(0, 3).map((comp) => (
                      <div
                        key={comp._id}
                        className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{comp.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              comp.status === 'Demonstrated'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {comp.status}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              comp.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${comp.progressPercentage || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>
                            {comp.acquiredCount || 0} / {comp.totalRequired || 0} required skills demonstrated
                          </span>
                          <span className="font-semibold text-slate-700">{comp.progressPercentage || 0}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">No competencies evaluated yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Certificates Summary Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Recent Certificates</h2>
                      <p className="text-xs text-slate-500">Official proof of completion</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('certificates')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>All Certificates</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-4 space-y-2.5">
                  {recentCertificates.length > 0 ? (
                    recentCertificates.slice(0, 3).map((cert) => (
                      <div
                        key={cert.certificateId}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{cert.courseTitle}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono text-emerald-700 font-semibold">{cert.certificateId}</span>
                            <span>•</span>
                            <span>Score: {cert.percentage}%</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCertificate(cert)}
                          className="px-2.5 py-1 rounded bg-white text-xs font-semibold text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-200 shadow-2xs shrink-0 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">No certificates earned yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                        Pass your course final assessments to receive verifiable credentials.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDUCATION & EXPERIENCE */}
      {activeTab === 'education-experience' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Education Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Education & Qualifications</h2>
                  <p className="text-xs text-slate-500">Your academic background and degrees</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openAddEducation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {educationList.length > 0 ? (
                educationList.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {edu.qualification}
                          {edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}
                        </h3>
                        <p className="text-xs font-medium text-slate-700 mt-0.5">{edu.institution}</p>
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {edu.startYear || '—'} – {edu.endYear || 'Expected'}
                          </p>
                        )}
                        {edu.description && (
                          <p className="text-xs text-slate-600 mt-2 whitespace-pre-line">{edu.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => openEditEducation(edu, idx)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEducation(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No education added yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Add your educational background to build your professional profile.
                  </p>
                  <button
                    type="button"
                    onClick={openAddEducation}
                    className="inline-flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Education</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Work Experience Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Work Experience</h2>
                  <p className="text-xs text-slate-500">Internships, full-time, and project roles</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openAddExperience}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {experienceList.length > 0 ? (
                experienceList.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{exp.jobTitle}</h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {exp.employmentType || 'Full-time'}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 mt-0.5">{exp.organization}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {exp.startDate || '—'} – {exp.isCurrent ? 'Present' : exp.endDate || '—'}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-slate-600 mt-2 whitespace-pre-line">{exp.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => openEditExperience(exp, idx)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No experience added yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Add your professional or internship experience to showcase your industry background.
                  </p>
                  <button
                    type="button"
                    onClick={openAddExperience}
                    className="inline-flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experience</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SKILLS & COMPETENCIES */}
      {activeTab === 'skills-competencies' && (
        <div className="space-y-6">
          {/* Informational Banner */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 space-y-1">
              <p className="font-bold">System-Verified Competency Engine</p>
              <p>
                Skills and competencies are automatically updated and verified based on your passing scores in course final assessments. They cannot be manually fabricated.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verified Skills Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Verified Skills</h2>
                  <p className="text-xs text-slate-500">Retrieved from authoritative course completions</p>
                </div>
                <Link
                  to="/trainee/skills"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Go to My Skills</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5 pt-2">
                {verifiedSkills.length > 0 ? (
                  verifiedSkills.map((sk) => (
                    <div
                      key={sk._id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-900">{sk.name}</span>
                          <span className="text-[11px] text-slate-500 block">{sk.category || 'Technical'}</span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          sk.proficiency === 'advanced'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : sk.proficiency === 'proficient'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {sk.proficiencyLabel || sk.proficiency}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No verified skills yet. Pass final assessments to earn skills.
                  </div>
                )}
              </div>
            </div>

            {/* Competencies Breakdown Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Platform Competencies</h2>
                  <p className="text-xs text-slate-500">Aggregate multi-skill attainment tracks</p>
                </div>
                <Link
                  to="/trainee/competencies"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Go to Competencies</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 pt-2">
                {competencies.length > 0 ? (
                  competencies.map((comp) => (
                    <div
                      key={comp._id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{comp.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            comp.status === 'Demonstrated'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{comp.description}</p>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            comp.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${comp.progressPercentage || 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>
                          {comp.acquiredCount || 0} / {comp.totalRequired || 0} required skills demonstrated
                        </span>
                        <span className="font-bold text-slate-700">{comp.progressPercentage || 0}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">No platform competencies available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Earned Certificates</h2>
              <p className="text-xs text-slate-500">Verified credentials issued directly by Capacity Connect</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Total: {recentCertificates.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {recentCertificates.length > 0 ? (
              recentCertificates.map((cert) => (
                <div
                  key={cert.certificateId}
                  className="p-4 rounded-xl border border-slate-200 bg-linear-to-b from-white to-slate-50 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                        <Award className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cert.percentage}% Score
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{cert.courseTitle}</h3>
                    <p className="text-[11px] font-mono text-slate-500">{cert.certificateId}</p>
                    <p className="text-[11px] text-slate-400">
                      Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCertificate(cert)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 text-center transition-colors"
                    >
                      View Certificate
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Award className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No certificates earned yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Complete 100% of course modules and pass the final exam with at least 70% to receive verified credentials.
                </p>
                <Link
                  to="/trainee/courses"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Available Courses</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CAREER GOAL & INTERESTS */}
      {activeTab === 'career-interests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Career Goal Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Career Goal</h2>
                  <p className="text-xs text-slate-500">Your target professional objective</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCareerGoalModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Career Goal</span>
              </button>
            </div>

            <div className="p-5 rounded-xl bg-linear-to-r from-indigo-50/70 to-blue-50/70 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Target Career Roadmap</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {user.careerGoal || 'Full Stack Developer'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your career goal is used by our AI system to personalize your course recommendations, sequenced skill roadmap, and adaptive progression path.
              </p>
              <div className="pt-2">
                <Link
                  to="/trainee/recommendations"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900"
                >
                  <span>Open AI Career Roadmap</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Interests Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Learning Interests</h2>
                  <p className="text-xs text-slate-500">Technical domains you are passionate about</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedInterests(user.interests || []);
                  setIsInterestsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Manage Interests</span>
              </button>
            </div>

            <div className="pt-2">
              {interestsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interestsList.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No interests selected</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                    Select your areas of technical interest to help AI tailor your experience.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInterests([]);
                      setIsInterestsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    <span>Select Interests</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODALS */}
      {/* ================================================= */}

      {/* 1. Edit Basic Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Basic Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBasicProfile} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={basicForm.name}
                  onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={basicForm.phone}
                  onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  placeholder="+1 555-0199 or 9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location (City / Country)
                </label>
                <input
                  type="text"
                  value={basicForm.location}
                  onChange={(e) => setBasicForm({ ...basicForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g. San Francisco, CA or New Delhi, India"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Bio / About Me
                </label>
                <textarea
                  rows={3}
                  value={basicForm.bio}
                  onChange={(e) => setBasicForm({ ...basicForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  placeholder="Briefly describe your background, interests, and aspirations..."
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
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Photo Upload / Edit Modal */}
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
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
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

      {/* 3. Career Goal Modal */}
      {isCareerGoalModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Set Career Goal</h3>
              <button
                type="button"
                onClick={() => setIsCareerGoalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCareerGoal} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Career Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={careerGoalInput}
                  onChange={(e) => setCareerGoalInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                  placeholder="e.g. Full Stack Developer, Data Scientist..."
                />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-600 block mb-2">
                  Popular Career Goals:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CAREER_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setCareerGoalInput(goal)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        careerGoalInput === goal
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-800">
                <strong>AI Personalization Notice:</strong> Changing your career goal updates your AI recommendations and roadmap without altering your verified skills or completed courses.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCareerGoalModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Update Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Interests Modal */}
      {isInterestsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Manage Learning Interests</h3>
              <button
                type="button"
                onClick={() => setIsInterestsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Select Interests:
                </span>
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
                  {COMMON_INTERESTS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add custom tag */}
              <form onSubmit={handleAddCustomInterest} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customInterestInput}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                  placeholder="Add custom topic (e.g. Next.js, Rust)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900"
                >
                  Add Tag
                </button>
              </form>

              {/* Selected preview */}
              {selectedInterests.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                    Selected Topics ({selectedInterests.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterests.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => toggleInterest(item)}
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
                  onClick={() => setIsInterestsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveInterests}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Save Interests
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Education Modal */}
      {educationModalState.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {educationModalState.index >= 0 ? 'Edit Education' : 'Add Education'}
              </h3>
              <button
                type="button"
                onClick={() => setEducationModalState({ isOpen: false, item: null, index: -1 })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEducation} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qualification / Degree <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.qualification}
                  onChange={(e) => setEduForm({ ...eduForm, qualification: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g. B.Tech, Master of Science, High School Diploma"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution / University <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g. ABC University, National Institute of Technology"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={eduForm.fieldOfStudy}
                  onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g. Computer Science & Engineering"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Year
                  </label>
                  <input
                    type="number"
                    min="1950"
                    max="2050"
                    value={eduForm.startYear}
                    onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g. 2022"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End / Expected Year
                  </label>
                  <input
                    type="number"
                    min="1950"
                    max="2050"
                    value={eduForm.endYear}
                    onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g. 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Honors
                </label>
                <textarea
                  rows={2}
                  value={eduForm.description}
                  onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  placeholder="Additional academic details, CGPA, major achievements..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEducationModalState({ isOpen: false, item: null, index: -1 })}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Experience Modal */}
      {experienceModalState.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {experienceModalState.index >= 0 ? 'Edit Experience' : 'Add Experience'}
              </h3>
              <button
                type="button"
                onClick={() => setExperienceModalState({ isOpen: false, item: null, index: -1 })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExperience} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expForm.jobTitle}
                  onChange={(e) => setExpForm({ ...expForm, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                  placeholder="e.g. Software Development Intern, Junior Developer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organization / Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expForm.organization}
                  onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                  placeholder="e.g. XYZ Technologies, Open Source Project"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employment Type
                </label>
                <select
                  value={expForm.employmentType}
                  onChange={(e) => setExpForm({ ...expForm, employmentType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                    placeholder="e.g. June 2025"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    disabled={expForm.isCurrent}
                    value={expForm.isCurrent ? 'Present' : expForm.endDate}
                    onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600 disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="e.g. August 2025"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="currentlyWorking"
                  checked={expForm.isCurrent}
                  onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="currentlyWorking" className="text-xs font-medium text-slate-700 select-none">
                  I am currently working in this role
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                  placeholder="Key responsibilities, technologies used, achievements..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExperienceModalState({ isOpen: false, item: null, index: -1 })}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Certificate Viewer Modal */}
      {selectedCertificate && (
        <CertificateModal
          isOpen={Boolean(selectedCertificate)}
          onClose={() => setSelectedCertificate(null)}
          certificate={selectedCertificate}
        />
      )}
    </div>
  );
};

export default TraineeProfilePage;
