import React, { useState, useEffect } from 'react';
import { getSkillsApi } from '../services/api';
import { Search, X, Check, Plus, Tag } from 'lucide-react';

const SkillsSelect = ({
  selectedSkills = [],
  onChange,
  label = 'Skills Covered',
  helperText = 'Select the technical and professional skills taught in this course and specify target proficiency.',
  withProficiency = false,
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

  const normalizedSelected = React.useMemo(() => {
    if (!Array.isArray(selectedSkills)) return [];
    return selectedSkills
      .map((item) => {
        if (item && typeof item === 'object') {
          const id = item.skill?._id || item.skill || item.skillId || item._id;
          return {
            skillId: id ? id.toString() : '',
            proficiency: item.proficiency || 'beginner',
          };
        }
        return {
          skillId: item ? item.toString() : '',
          proficiency: 'beginner',
        };
      })
      .filter((s) => s.skillId);
  }, [selectedSkills]);

  const selectedSkillIds = normalizedSelected.map((s) => s.skillId);

  const emitChange = (newNormalized) => {
    if (withProficiency) {
      onChange(
        newNormalized.map((s) => ({
          skill: s.skillId,
          proficiency: s.proficiency || 'beginner',
        }))
      );
    } else {
      onChange(newNormalized.map((s) => s.skillId));
    }
  };

  const handleToggleSkill = (skillId) => {
    if (disabled) return;
    const exists = normalizedSelected.some((s) => s.skillId === skillId);
    if (exists) {
      emitChange(normalizedSelected.filter((s) => s.skillId !== skillId));
    } else {
      emitChange([...normalizedSelected, { skillId, proficiency: 'beginner' }]);
    }
  };

  const handleRemoveSkill = (skillId, e) => {
    e.stopPropagation();
    if (disabled) return;
    emitChange(normalizedSelected.filter((s) => s.skillId !== skillId));
  };

  const handleProficiencyChange = (skillId, newProficiency, e) => {
    e.stopPropagation();
    if (disabled) return;
    emitChange(
      normalizedSelected.map((s) =>
        s.skillId === skillId ? { ...s, proficiency: newProficiency } : s
      )
    );
  };

  const filteredSkills = availableSkills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {normalizedSelected.length} Selected
        </span>
      </div>

      {helperText && <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>}

      {/* Selected Skill Badges */}
      <div className="min-h-[44px] p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-wrap items-center gap-2">
        {normalizedSelected.length === 0 ? (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic px-1">
            No skills selected yet. Click below to add from the Skill Library.
          </span>
        ) : (
          normalizedSelected.map((sel) => {
            const skillObj = availableSkills.find((s) => s._id === sel.skillId) || {
              name: 'Skill',
              category: 'Technical',
            };

            return (
              <div
                key={sel.skillId}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium border shadow-2xs transition-colors ${
                  skillObj.category === 'Soft Skill'
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : skillObj.category === 'Other'
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}
              >
                <Tag className="w-3 h-3 flex-shrink-0 text-slate-400" />
                <span className="font-semibold">{skillObj.name}</span>

                {/* Optional Proficiency Level Selector for Course Mapping */}
                {withProficiency && (
                  <div className="relative inline-flex items-center">
                    <select
                      value={sel.proficiency}
                      disabled={disabled}
                      onChange={(e) => handleProficiencyChange(sel.skillId, e.target.value, e)}
                      className="text-[10px] uppercase font-bold py-0.5 px-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="proficient">Proficient</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                )}

                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSkill(sel.skillId, e)}
                    className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Remove skill"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Toggle Selector Button */}
      {!disabled && (
        <div>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isOpen ? 'Close Skill Selector' : '+ Select Skills from Library'}</span>
          </button>

          {isOpen && (
            <div className="mt-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm space-y-3 animate-fadeIn">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search skills (e.g. React, Python, Leadership)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {['All', 'Technical', 'Soft Skill', 'Other'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                        className={`p-2 rounded-md text-left text-xs border transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-200 font-semibold ring-1 ring-blue-400'
                            : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{skill.name}</span>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
