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
          setCompetencies((prev) =>
            [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name))
          );
          setFeedback(`Competency "${response.data.name}" created successfully.`);
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
        setFeedback(
          `Competency "${comp.name}" is now ${response.data.isActive ? 'Active' : 'Deactivated'}.`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteCompetency = async (comp) => {
    const confirm = window.confirm(
      `Are you sure you want to delete competency "${comp.name}"?`
    );
    if (!confirm) return;

    setError(null);
    try {
      const response = await deleteCompetencyApi(comp._id);
      if (response && response.success) {
        setCompetencies((prev) => prev.filter((c) => c._id !== comp._id));
        setFeedback(`Competency "${comp.name}" deleted.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete competency.');
    }
  };

  // Filter competencies
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
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Organizational Competency Framework</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Competency Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define multi-skill competencies and define the required technical and professional skills needed for proficiency.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Competency</span>
        </Button>
      </div>

      {/* Notifications */}
      {feedback && (
        <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center justify-between shadow-2xs">
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

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search competencies by title or description..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700 font-medium"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Competencies List */}
      {loading ? (
        <div className="py-16 flex justify-center bg-white border border-slate-200 rounded-lg shadow-sm">
          <Loading message="Loading competencies framework..." />
        </div>
      ) : filteredCompetencies.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 shadow-sm space-y-2">
          <Layers className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No competencies found.</p>
          <p className="text-slate-400">Add a competency to establish multi-skill learning pathways.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCompetencies.map((comp) => (
            <div
              key={comp._id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{comp.name}</h3>
                      <span className="text-[11px] text-slate-400">
                        {comp.skills?.length || 0} Required Skills
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border flex-shrink-0 ${
                      comp.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {comp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {comp.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {comp.description}
                  </p>
                )}

                {/* Required Skills Badges */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Required Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.skills && comp.skills.length > 0 ? (
                      comp.skills.map((skill) => (
                        <span
                          key={skill._id || skill}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                            skill.category === 'Soft Skill'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{skill.name || skill}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No skills assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(comp)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(comp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1 ${
                    comp.isActive
                      ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
                      : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{comp.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteCompetency(comp)}
                  className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Competency"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================
          MODAL: ADD / EDIT COMPETENCY
          ==================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingCompetency ? 'Edit Competency' : 'Add New Competency'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCompetency} className="p-6 overflow-y-auto flex-1 space-y-4">
              {error && <ErrorMessage message={error} />}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Competency Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Full Stack Development, Data Engineering, Agile Leadership"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what proficiency in this competency demonstrates..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                />
              </div>

              {/* Skills Covered Selector */}
              <SkillsSelect
                selectedSkills={formData.skills}
                onChange={(skills) => setFormData({ ...formData, skills })}
                label="Required Skills *"
                helperText="Select all standardized skills that a trainee must develop to satisfy this competency."
                withProficiency={false}
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="compIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="compIsActive" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Active (available in platform competency views)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
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
