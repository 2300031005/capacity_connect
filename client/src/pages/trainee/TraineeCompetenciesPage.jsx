import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyCompetenciesOverviewApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Layers,
  Award,
  CheckCircle2,
  Clock,
  Circle,
  Search,
  Sparkles,
  BookOpen,
  Tag,
} from 'lucide-react';

const TraineeCompetenciesPage = () => {
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCompetencies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyCompetenciesOverviewApi();
      if (response && response.success) {
        setCompetencies(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to load competencies');
      }
    } catch (err) {
      console.error('Error loading competencies overview:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load your competencies.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetencies();
  }, [fetchCompetencies]);

  const filteredCompetencies = competencies.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (comp.description && comp.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const matchesStatus =
      statusFilter === 'all' || comp.status.toLowerCase().replace(/\s+/g, '_') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedCount = competencies.filter((c) => c.status === 'Completed').length;
  const inProgressCount = competencies.filter((c) => c.status === 'In Progress').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Multi-Skill Pathways</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Competencies
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Competencies represent collections of required technical and professional skills. Complete courses to satisfy skill requirements and achieve competency proficiency.
        </p>

        {/* Metric Pills */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Available Competencies</span>
            <strong className="text-base font-bold text-slate-900">{competencies.length}</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-emerald-700 block font-semibold">Completed</span>
            <strong className="text-base font-bold text-emerald-900">{completedCount}</strong>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-blue-700 block font-semibold">In Progress</span>
            <strong className="text-base font-bold text-blue-900">{inProgressCount}</strong>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCompetencies} />}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search competencies..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {[
            { label: 'All', value: 'all' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Completed', value: 'completed' },
            { label: 'Not Started', value: 'not_started' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Competencies Cards */}
      {loading ? (
        <div className="py-16 flex justify-center bg-white border border-slate-200 rounded-lg shadow-sm">
          <Loading message="Loading competencies overview..." />
        </div>
      ) : filteredCompetencies.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 shadow-sm space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">No competencies found</p>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto">
              There are no competencies matching your selected filter.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCompetencies.map((comp) => {
            const isCompleted = comp.status === 'Completed';
            const isInProgress = comp.status === 'In Progress';

            return (
              <div
                key={comp._id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{comp.name}</h3>
                        <span className="text-[11px] text-slate-400">
                          {comp.completedSkillsCount} of {comp.totalRequiredSkills} Skills Acquired
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isInProgress
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Completed</span>
                        </>
                      ) : isInProgress ? (
                        <>
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>In Progress</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3 h-3 text-slate-400" />
                          <span>Not Started</span>
                        </>
                      )}
                    </span>
                  </div>

                  {comp.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {comp.description}
                    </p>
                  )}

                  {/* Required Skills Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Required Skills Checklist ({comp.skills?.length || 0}):
                    </span>

                    <div className="space-y-1.5">
                      {comp.skills?.map((skill) => {
                        const skillCompleted = skill.state === 'completed';
                        const skillInProgress = skill.state === 'in_progress';

                        return (
                          <div
                            key={skill._id}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                              skillCompleted
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                                : skillInProgress
                                ? 'bg-blue-50/50 border-blue-200 text-blue-950'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {skillCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              ) : skillInProgress ? (
                                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                              )}
                              <span className="font-semibold">{skill.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-500">
                                {skill.category}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-bold uppercase font-mono ${
                                skillCompleted
                                  ? 'text-emerald-700'
                                  : skillInProgress
                                  ? 'text-blue-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {skillCompleted
                                ? 'Acquired'
                                : skillInProgress
                                ? 'Learning'
                                : 'Missing'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer CTA */}
                {!isCompleted && (
                  <div className="pt-3 border-t border-slate-100">
                    <Link
                      to="/trainee/courses"
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Find Courses Covering Remaining Skills</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TraineeCompetenciesPage;
