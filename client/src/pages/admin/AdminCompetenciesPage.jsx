import React, { useState, useEffect, useCallback } from 'react';
import {
  getCompetenciesApi,
  createCompetencyApi,
  updateCompetencyApi,
  toggleCompetencyStatusApi,
  deleteCompetencyApi,
} from '../../services/api';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import SkillsSelect from '../../components/SkillsSelect';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Power,
  X,
  Sparkles,
  Award,
} from 'lucide-react';

const AdminCompetenciesPage = () => {
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    skills: [],
    isActive: true,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCompetencies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCompetenciesApi({ all: 'true' });
      if (response && response.success) {
        setCompetencies(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to load competencies');
      }
    } catch (err) {
      console.error('Error loading competencies:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load competencies.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetencies();
  }, [fetchCompetencies]);

  const openAddModal = () => {
    setEditingCompetency(null);
    setFormData({
      name: '',
      description: '',
      skills: [],
      isActive: true,
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (comp) => {
    setEditingCompetency(comp);
    setFormData({
      name: comp.name,
      description: comp.description || '',
      skills: (comp.skills || []).map((s) => (s._id ? s._id : s)),
      isActive: comp.isActive,
    });
    setError(null);
    setShowModal(true);
  };

  const handleSaveCompetency = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide a competency name.');
      return;
    }

    if (!formData.skills || formData.skills.length === 0) {
      setError('A competency must reference at least one required skill.');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      if (editingCompetency) {
        const response = await updateCompetencyApi(editingCompetency._id, formData);
        if (response && response.success) {
          setCompetencies((prev) =>
            prev.map((c) => (c._id === editingCompetency._id ? response.data : c))
          );
          setFeedback(`Competency "${response.data.name}" updated successfully.`);
          setShowModal(false);
        }
      } else {
        const response = await createCompetencyApi(formData);
        if (response && response.success) {
          setCompetencies((prev) => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
          setFeedback(`Competency "${response.data.name}" registered successfully.`);
          setShowModal(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save competency.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (comp) => {
    setError(null);
    try {
      const response = await toggleCompetencyStatusApi(comp._id);
      if (response && response.success) {
        setCompetencies((prev) =>
          prev.map((c) => (c._id === comp._id ? response.data : c))
        );
        setFeedback(`Competency "${comp.name}" is now ${response.data.isActive ? 'Active' : 'Deactivated'}.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteCompetency = async (comp) => {
    const confirm = window.confirm(
      `Are you sure you want to permanently delete competency "${comp.name}"? If users have achieved progress, deactivation is recommended instead.`
    );
    if (!confirm) return;

    try {
      await deleteCompetencyApi(comp._id);
      setFeedback(`Competency "${comp.name}" deleted.`);
      setCompetencies((prev) => prev.filter((c) => c._id !== comp._id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete competency.');
    }
  };

  const filteredCompetencies = competencies.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (comp.description && comp.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && comp.isActive) ||
      (statusFilter === 'inactive' && !comp.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Capability Domains & Multi-Skill Frameworks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Competency Architecture & Mapping
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Group individual technical and soft skills into overarching capability domains for dynamic trainee progress tracking and organizational capability intelligence.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 text-xs font-semibold self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Competency</span>
        </Button>
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
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search competencies by title or description..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { label: 'All Frameworks', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
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

      {/* Competencies Grid */}
      {loading ? (
        <div className="py-20 flex justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <Loading message="Loading platform competency architecture..." />
        </div>
      ) : filteredCompetencies.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm space-y-2">
          <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-700 dark:text-slate-200">No competency frameworks found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCompetencies.map((comp) => (
            <div
              key={comp._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{comp.name}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {comp.skills?.length || 0} Required Skills Mapped
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border shrink-0 ${
                      comp.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {comp.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-400" />
                        <span>Inactive</span>
                      </>
                    )}
                  </span>
                </div>

                {comp.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {comp.description}
                  </p>
                )}

                {/* Skills tags */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1.5">
                    Standardized Skill Dependencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.skills && comp.skills.length > 0 ? (
                      comp.skills.map((s) => {
                        const sName = s.name || s;
                        const sCat = s.category || 'Technical';
                        return (
                          <span
                            key={s._id || sName}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                              sCat === 'Soft Skill'
                                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            <Tag className="w-2.5 h-2.5 opacity-60" />
                            <span>{sName}</span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-slate-400 italic text-xs">No skills associated</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(comp)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>

                {/* Requirement 10: Clear dedicated push button */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(comp)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors inline-flex items-center gap-1 ${
                    comp.isActive
                      ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                      : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{comp.isActive ? 'Deactivate' : 'Reactivate'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteCompetency(comp)}
                  className="p-1.5 text-slate-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  title="Delete Competency"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================
          MODAL: ADD / EDIT COMPETENCY WITH DEDICATED PUSH BUTTON
          ==================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingCompetency ? 'Edit Competency Framework' : 'Add New Competency Framework'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCompetency} className="p-6 overflow-y-auto flex-1 space-y-4">
              {error && <ErrorMessage message={error} />}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Competency Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Full Stack Development, Meteorological Data Analysis, Agile Leadership"
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what proficiency in this capability domain signifies..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Skills Covered Selector */}
              <SkillsSelect
                selectedSkills={formData.skills}
                onChange={(skills) => setFormData({ ...formData, skills })}
                label="Required Standardized Skills *"
                helperText="Select all standardized skills that a trainee must develop to satisfy this competency."
                withProficiency={false}
              />

              {/* Requirement 10: Dedicated Push Button instead of generic checkbox */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Competency Availability Status
                </label>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        formData.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {formData.isActive ? 'Active Status' : 'Deactivated'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formData.isActive ? 'Visible in Trainee Competency matrix' : 'Hidden from Trainee dashboards'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors inline-flex items-center gap-1.5 shadow-2xs ${
                      formData.isActive
                        ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                        : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{formData.isActive ? 'Deactivate' : 'Reactivate'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="sm" loading={actionLoading}>
                  {editingCompetency ? 'Save Changes' : 'Create Competency'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompetenciesPage;
