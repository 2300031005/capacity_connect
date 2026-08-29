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
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Layers,
  BookOpen,
  Users,
  Award,
  BarChart3,
  Pencil,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  UserCheck,
  Target,
  ExternalLink,
} from 'lucide-react';

const AdminProfilePage = () => {
  const { user: authUser, updateUserContext } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [toast, setToast] = useState(null);

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Form State
  const [adminForm, setAdminForm] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
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
          setAdminForm({
            name: res.user.name || '',
            phone: res.user.phone || '',
            location: res.user.location || '',
            bio: res.user.bio || '',
          });
          updateUserContext(res.user);
        }
      }
    } catch (err) {
      console.error('Failed to load admin profile:', err);
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
        name: adminForm.name.trim(),
        phone: adminForm.phone.trim(),
        location: adminForm.location.trim(),
        bio: adminForm.bio.trim(),
      });
      if (res.success) {
        showToast('Admin profile updated successfully');
        setIsEditProfileOpen(false);
        fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update admin profile', 'error');
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
  const platformSnapshot = summary.platformSnapshot || {};

  if (loading && !profileData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading administrator profile...</p>
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

      {/* 1. ADMIN HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-emerald-50/80 via-slate-50/40 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar with upload overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-linear-to-tr from-emerald-700 to-teal-800 border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-white text-3xl font-bold">
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
                <span>{user.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setPhotoPreview(user.photo || '');
                setPhotoFile(null);
                setIsPhotoModalOpen(true);
              }}
              className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-colors"
              title="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Details */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {user.name || 'Administrator'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Platform Administrator</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {user.isActive ? 'Active Account' : 'Inactive'}
              </span>
            </div>

            {user.bio ? (
              <p className="text-sm text-slate-600 max-w-3xl">
                {user.bio}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">
                Platform governance administrator responsible for institutional oversight, taxonomies, and analytics.
              </p>
            )}

            {/* Account Details */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
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
              {user.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
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
              <span>Edit Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PLATFORM SNAPSHOT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Platform Snapshot</h2>
              <p className="text-xs text-slate-500">Live operational overview across all users and courses</p>
            </div>
          </div>
          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <span>View Platform Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Snapshot Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total Users</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {platformSnapshot.totalUsers || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-xs font-medium text-slate-500">Trainees</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-2xl font-extrabold text-blue-600 block">
              {platformSnapshot.traineesCount || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-teal-600 mb-1">
              <span className="text-xs font-medium text-slate-500">Trainers</span>
              <UserCheck className="w-4 h-4 text-teal-500" />
            </div>
            <span className="text-2xl font-extrabold text-teal-600 block">
              {platformSnapshot.trainersCount || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-indigo-600 mb-1">
              <span className="text-xs font-medium text-slate-500">Courses</span>
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-extrabold text-indigo-600 block">
              {platformSnapshot.totalCourses || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-purple-600 mb-1">
              <span className="text-xs font-medium text-slate-500">Enrollments</span>
              <Layers className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-2xl font-extrabold text-purple-600 block">
              {platformSnapshot.totalEnrollments || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-xs font-medium text-slate-500">Certificates</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-700 block">
              {platformSnapshot.totalCertificates || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. GOVERNANCE SHORTCUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Management</h3>
              <p className="text-xs text-slate-500">Manage trainees & accounts</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        <Link
          to="/admin/trainers"
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Trainer Roster</h3>
              <p className="text-xs text-slate-500">Instructor governance</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
        </Link>

        <Link
          to="/admin/skills"
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Skill Taxonomy</h3>
              <p className="text-xs text-slate-500">Master skill catalog</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </Link>

        <Link
          to="/admin/competencies"
          className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Competencies</h3>
              <p className="text-xs text-slate-500">Multi-skill framework</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
        </Link>
      </div>

      {/* ================================================= */}
      {/* MODALS */}
      {/* ================================================= */}

      {/* 1. Edit Admin Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Administrator Details</h3>
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
                  Administrator Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  placeholder="+1 555-0199"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={adminForm.location}
                  onChange={(e) => setAdminForm({ ...adminForm, location: e.target.value })}
                  placeholder="e.g. Headquarters / Remote"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Bio / Role Notes
                </label>
                <textarea
                  rows={2}
                  value={adminForm.bio}
                  onChange={(e) => setAdminForm({ ...adminForm, bio: e.target.value })}
                  placeholder="Notes on administrative governance responsibilities..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs"
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs"
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
    </div>
  );
};

export default AdminProfilePage;
