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
  Search,
  Sparkles,
  ArrowRight,
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

  const demonstratedCount = competencies.filter((c) => c.status === 'Demonstrated').length;
  const inProgressCount = competencies.filter((c) => c.status === 'In Progress').length;
  const notStartedCount = competencies.filter((c) => c.status === 'Not Started').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Competency & Capability Framework</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          My Competencies & Skill Gap Analysis
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
          Competencies represent job-ready capability domains comprising multiple verified skills. Progress is calculated dynamically based on validated assessments and completed coursework.
        </p>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[var(--border)]">
          <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Total Domains</span>
            <strong className="text-2xl font-bold text-[var(--text-primary)] mt-0.5 block">{competencies.length}</strong>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Demonstrated</span>
            <strong className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-0.5 block">{demonstratedCount}</strong>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">In Progress</span>
            <strong className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-0.5 block">{inProgressCount}</strong>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Gaps Remaining</span>
            <strong className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-0.5 block">{notStartedCount}</strong>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCompetencies} />}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--surface)] p-3 border border-[var(--border)] rounded-xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search competency frameworks..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { label: 'All Domains', value: 'all' },
            { label: 'Demonstrated', value: 'demonstrated' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Not Started', value: 'not_started' },
          ].map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                statusFilter === f.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Competency Cards Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loading message="Loading competencies and calculating progress..." />
        </div>
      ) : filteredCompetencies.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">No competencies found</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Institutional competencies will appear as curriculum frameworks are defined.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCompetencies.map((comp) => {
            const isDemonstrated = comp.status === 'Demonstrated';
            const isInProgress = comp.status === 'In Progress';
            const progress = comp.progressPercentage || 0;

            return (
              <div
                key={comp._id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                      Capability Domain
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                        isDemonstrated
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : isInProgress
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-[var(--primary)] border-blue-200 dark:border-blue-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {isDemonstrated && <CheckCircle2 className="w-3 h-3" />}
                      <span>{comp.status}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)]">{comp.name}</h3>
                  {comp.description && (
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {comp.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>Proficiency Completion</span>
                      <strong className={isDemonstrated ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--primary)]'}>
                        {progress}%
                      </strong>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDemonstrated ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-[var(--primary)]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Required Skills tags */}
                  {Array.isArray(comp.skills) && comp.skills.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Included Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {comp.skills.map((sk, sIdx) => {
                          const sName = typeof sk === 'string' ? sk : sk.name || sk.skill?.name;
                          return (
                            <span
                              key={sIdx}
                              className="text-[10px] bg-[var(--surface-muted)] text-[var(--text-secondary)] px-2 py-0.5 rounded border border-[var(--border)] font-medium inline-flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5 text-[var(--primary)]" />
                              <span>{sName}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <Link
                    to="/trainee/recommendations"
                    className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Aligned Courses</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TraineeCompetenciesPage;
