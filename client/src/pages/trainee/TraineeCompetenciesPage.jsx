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
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
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

  const demonstratedCount = competencies.filter((c) => c.status === 'Demonstrated').length;
  const inProgressCount = competencies.filter((c) => c.status === 'In Progress').length;
  const notStartedCount = competencies.filter((c) => c.status === 'Not Started').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Competency & Capability Framework</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          My Competencies & Skill Gap Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Competencies represent job-ready capability domains comprising multiple verified skills. Progress is calculated dynamically based on validated assessments and completed modules.
        </p>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Total Domains</span>
            <strong className="text-xl font-bold">{competencies.length}</strong>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono text-emerald-700 dark:text-emerald-400 block font-semibold">Demonstrated</span>
            <strong className="text-xl font-bold text-emerald-900 dark:text-emerald-200">{demonstratedCount}</strong>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono text-blue-700 dark:text-blue-400 block font-semibold">In Progress</span>
            <strong className="text-xl font-bold text-blue-900 dark:text-blue-200">{inProgressCount}</strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block font-semibold">Gaps Remaining</span>
            <strong className="text-xl font-bold text-slate-700 dark:text-slate-300">{notStartedCount}</strong>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCompetencies} />}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search competency frameworks or skills..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { label: 'All Domains', value: 'all' },
            { label: 'Demonstrated', value: 'demonstrated' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Not Started', value: 'not_started' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Competencies Cards Grid */}
      {loading ? (
        <div className="py-16 flex justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <Loading message="Evaluating competency matrix and active skill verifications..." />
        </div>
      ) : filteredCompetencies.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm space-y-3">
          <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No competencies found</p>
            <p className="text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              There are no competency frameworks matching your selected filter or search term.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCompetencies.map((comp) => {
            const isDemonstrated = comp.status === 'Demonstrated';
            const isInProgress = comp.status === 'In Progress';
            const progress = comp.progressPercentage || 0;
            const verifiedCount = comp.verifiedSkillsCount || comp.completedSkillsCount || 0;
            const missingCount = Math.max(0, comp.totalRequiredSkills - verifiedCount);

            return (
              <div
                key={comp._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isDemonstrated
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : isInProgress
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          {comp.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {verifiedCount} of {comp.totalRequiredSkills} Skills Satisfied
                          </span>
                          {missingCount > 0 && (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                              {missingCount} Gap{missingCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border shrink-0 ${
                        isDemonstrated
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : isInProgress
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isDemonstrated ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Demonstrated</span>
                        </>
                      ) : isInProgress ? (
                        <>
                          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
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
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {comp.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">
                        {progress}% Attainment
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {verifiedCount} / {comp.totalRequiredSkills} Requirements
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isDemonstrated
                            ? 'bg-emerald-600 dark:bg-emerald-500'
                            : isInProgress
                            ? 'bg-blue-600 dark:bg-blue-500'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Required Skills Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Required Skill Breakdown ({comp.skills?.length || 0}):
                    </span>

                    <div className="space-y-1.5">
                      {comp.skills?.map((skill) => {
                        const isSkillVerified = skill.state === 'verified' || skill.state === 'completed';
                        const isSkillLearning = skill.state === 'learning' || skill.state === 'in_progress';

                        return (
                          <div
                            key={skill._id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                              isSkillVerified
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-200'
                                : isSkillLearning
                                ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/70 text-amber-950 dark:text-amber-200'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSkillVerified ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : isSkillLearning ? (
                                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                              )}
                              <span className="font-bold text-slate-900 dark:text-white">{skill.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                {skill.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isSkillVerified ? (
                                <>
                                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                                    {skill.proficiency || 'Verified'}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 font-mono">
                                    ✓ Satisfied
                                  </span>
                                </>
                              ) : isSkillLearning ? (
                                <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 font-mono">
                                  Learning
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 font-mono">
                                  Skill Gap
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                {!isDemonstrated && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Need to close remaining gaps?
                    </span>
                    <Link
                      to="/trainee/courses"
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1"
                    >
                      <span>Find Relevant Courses</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
