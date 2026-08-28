import React, { useState, useEffect } from 'react';
import { getSkillsApi } from '../services/api';
import { Search, X, Check, Plus, Tag, Layers } from 'lucide-react';

const SkillsSelect = ({
  selectedSkillIds = [],
  onChange,
  label = 'Skills Covered',
  helperText = 'Select the technical and professional skills taught in this course.',
  disabled = false,
}) => {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await getSkillsApi();
        if (response && response.success) {
          setAvailableSkills(response.data || []);
        }
      } catch (err) {
        console.error('Failed to load active skills library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const handleToggleSkill = (skillId) => {
    if (disabled) return;
    if (selectedSkillIds.includes(skillId)) {
      onChange(selectedSkillIds.filter((id) => id !== skillId));
    } else {
      onChange([...selectedSkillIds, skillId]);
    }
  };

  const handleRemoveSkill = (skillId, e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedSkillIds.filter((id) => id !== skillId));
  };

  // Filter skills based on search term and category
  const filteredSkills = availableSkills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const matchesCategory =
      categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const selectedSkillsObjects = availableSkills.filter((s) =>
    selectedSkillIds.includes(s._id)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
        <span className="text-[11px] text-slate-400">
          {selectedSkillIds.length} Selected
        </span>
      </div>

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      {/* Selected Skill Badges */}
      <div className="min-h-[42px] p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-1.5">
        {selectedSkillsObjects.length === 0 ? (
          <span className="text-xs text-slate-400 italic px-1">
            No skills selected yet. Click below to add from the Skill Library.
          </span>
        ) : (
          selectedSkillsObjects.map((skill) => (
            <span
              key={skill._id}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border shadow-2xs transition-colors ${
                skill.category === 'Soft Skill'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <Tag className="w-3 h-3 flex-shrink-0" />
              <span>{skill.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveSkill(skill._id, e)}
                  className="p-0.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 transition-colors"
                  title="Remove skill"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {/* Toggle Selector Button */}
      {!disabled && (
        <div>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isOpen ? 'Close Skill Selector' : '+ Select Skills from Library'}</span>
          </button>

          {isOpen && (
            <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3 animate-fadeIn">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search skills (e.g. React, Python, Leadership)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {['All', 'Technical', 'Soft Skill'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        categoryFilter === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Grid */}
              <div className="max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                {loading ? (
                  <p className="text-xs text-slate-400 col-span-3 py-4 text-center">
                    Loading skill library...
                  </p>
                ) : filteredSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 col-span-3 py-4 text-center">
                    No matching skills found in library.
                  </p>
                ) : (
                  filteredSkills.map((skill) => {
                    const isSelected = selectedSkillIds.includes(skill._id);
                    return (
                      <button
                        key={skill._id}
                        type="button"
                        onClick={() => handleToggleSkill(skill._id)}
                        className={`p-2 rounded-md text-left text-xs border transition-all flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-400'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{skill.name}</span>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillsSelect;
