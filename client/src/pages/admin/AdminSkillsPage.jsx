import React, { useState, useEffect, useCallback } from 'react';
import {
  getSkillsApi,
  createSkillApi,
  updateSkillApi,
  toggleSkillStatusApi,
  deleteSkillApi,
} from '../../services/api';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Target,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Power,
  X,
  Sparkles,
} from 'lucide-react';

const AdminSkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Technical',
    customCategory: '',
    description: '',
    isActive: true,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSkillsApi({ all: 'true' });
      if (response && response.success) {
        setSkills(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch skills');
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load skills.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const openAddModal = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      category: 'Technical',
      customCategory: '',
      description: '',
      isActive: true,
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      customCategory: skill.customCategory || '',
      description: skill.description || '',
      isActive: skill.isActive,
    });
    setError(null);
    setShowModal(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide a skill name.');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      if (editingSkill) {
        const response = await updateSkillApi(editingSkill._id, formData);
        if (response && response.success) {
          setSkills((prev) =>
            prev.map((s) => (s._id === editingSkill._id ? response.data : s))
          );
          setFeedback(`Skill "${response.data.name}" updated successfully.`);
          setShowModal(false);
        }
      } else {
        const response = await createSkillApi(formData);
        if (response && response.success) {
          setSkills((prev) => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
          setFeedback(`Skill "${response.data.name}" added to library.`);
          setShowModal(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save skill.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (skill) => {
    setError(null);
    try {
      const response = await toggleSkillStatusApi(skill._id);
      if (response && response.success) {
        setSkills((prev) =>
          prev.map((s) => (s._id === skill._id ? response.data : s))
        );
        setFeedback(`Skill "${skill.name}" is now ${response.data.isActive ? 'Active' : 'Deactivated'}.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to toggle status.');
    }
  };

  const handleDeleteSkill = async (skill) => {
    const confirm = window.confirm(
      `Are you sure you want to permanently delete skill "${skill.name}"? If this skill is referenced in courses or competencies, deactivation is recommended instead.`
    );
    if (!confirm) return;

    setError(null);
    try {
      const response = await deleteSkillApi(skill._id);
      if (response && response.success) {
        setSkills((prev) => prev.filter((s) => s._id !== skill._id));
        setFeedback(`Skill "${skill.name}" deleted.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete skill.');
    }
  };

  // Filter skills
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (skill.description && skill.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const matchesCategory =
      categoryFilter === 'All' || skill.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && skill.isActive) ||
      (statusFilter === 'inactive' && !skill.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Master Taxonomy Library</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Skill Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain the standardized catalog of technical and professional skills available for course mapping and competency tracking.
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
          <span>Add New Skill</span>
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search skills by name or keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category and Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1">
            {['All', 'Technical', 'Soft Skill', 'Other'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700 font-medium"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Skills Table */}
      {loading ? (
        <div className="py-16 flex justify-center bg-white border border-slate-200 rounded-lg shadow-sm">
          <Loading message="Loading skill library..." />
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 shadow-sm space-y-2">
          <Target className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No skills found matching your filters.</p>
          <p className="text-slate-400">Try adjusting your search criteria or add a new skill.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Skill Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSkills.map((skill) => (
                  <tr key={skill._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{skill.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          skill.category === 'Soft Skill'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : skill.category === 'Technical'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {skill.category === 'Other' && skill.customCategory
                          ? `Other (${skill.customCategory})`
                          : skill.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-md">
                      {skill.description || <span className="italic text-slate-300">No description</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          skill.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {skill.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(skill)}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                        title="Edit Skill"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(skill)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors inline-flex items-center gap-1 ${
                          skill.isActive
                            ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
                            : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                        }`}
                        title={skill.isActive ? 'Deactivate Skill' : 'Activate Skill'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{skill.isActive ? 'Deactivate' : 'Activate'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skill)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: ADD / EDIT SKILL
          ==================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingSkill ? 'Edit Skill' : 'Add New Skill'}
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
            <form onSubmit={handleSaveSkill} className="p-6 space-y-4">
              {error && <ErrorMessage message={error} />}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skill Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. React, Docker, Critical Thinking"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800"
                >
                  <option value="Technical">Technical</option>
                  <option value="Soft Skill">Soft Skill</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.category === 'Other' && (
                <div className="animate-fadeIn space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Specify Category / Domain <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={formData.customCategory || ''}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    placeholder="e.g. Domain Specific, Methodologies, Regulatory, Tools"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400">
                    Optionally specify the custom category or domain for this skill.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief synopsis of what this skill encompasses..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Active (available for courses and competencies)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="sm" loading={actionLoading}>
                  {editingSkill ? 'Save Changes' : 'Create Skill'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSkillsPage;
