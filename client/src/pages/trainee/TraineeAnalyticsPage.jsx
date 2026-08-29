import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTraineeAnalyticsApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import CertificateModal from '../../components/CertificateModal';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  BookOpen,
  Award,
  FileCheck,
  Target,
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const CHART_COLORS = {
  primary: '#2563EB',
  teal: '#0F766E',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  neutral: '#64748B',
};

const PIE_COLORS = ['#16A34A', '#DC2626'];

const TraineeAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTraineeAnalyticsApi();
      if (response && response.success) {
        setAnalyticsData(response.data);
      } else {
        throw new Error(response?.message || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error fetching trainee analytics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load your analytics dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loading message="Compiling your learning analytics and performance insights..." />
      </div>
    );
  }

  if (error || !analyticsData) {
    return <ErrorMessage message={error || 'Failed to load analytics.'} onRetry={fetchAnalytics} />;
  }

  const {
    summary,
    learningProgress = [],
    assessmentPerformance = {},
    skillDistribution = {},
    competencyProgress = [],
    learningTrend = [],
    certificates = [],
  } = analyticsData;

  // Skill Distribution Bar Chart
  const skillChartData = [
    { level: 'Beginner', count: skillDistribution.beginner || 0, fill: CHART_COLORS.neutral },
    { level: 'Proficient', count: skillDistribution.proficient || 0, fill: CHART_COLORS.teal },
    { level: 'Advanced', count: skillDistribution.advanced || 0, fill: CHART_COLORS.primary },
  ];

  // Assessment Pass vs Fail Pie Chart
  const assessmentPieData = [
    { name: 'Passed', value: assessmentPerformance.passedCount || 0 },
    { name: 'Failed', value: assessmentPerformance.failedCount || 0 },
  ].filter((d) => d.value > 0);

  // Course Progress Bar Data
  const courseProgressChartData = learningProgress.map((p) => ({
    name: p.courseTitle.length > 18 ? p.courseTitle.substring(0, 16) + '...' : p.courseTitle,
    progress: p.progress || 0,
    status: p.status,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Real-Time Learning Insights</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          Learning Analytics & Performance Overview
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
          Comprehensive telemetry tracking course progression, exam pass rates, skill acquisition, and institutional capability milestones.
        </p>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[var(--border)]">
          <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Overall Completion</span>
            <strong className="text-2xl font-bold text-[var(--primary)] mt-0.5 block">{summary?.completionRate || 0}%</strong>
          </div>
          <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Active Courses</span>
            <strong className="text-2xl font-bold text-[var(--text-primary)] mt-0.5 block">{summary?.activeCourses || 0}</strong>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Verified Skills</span>
            <strong className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-0.5 block">{summary?.verifiedSkills || 0}</strong>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">Certificates</span>
            <strong className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-0.5 block">{summary?.certificatesCount || 0}</strong>
          </div>
        </div>
      </div>

      {/* Row 1 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Course Progress */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Course Completion Progress</h2>
              <p className="text-xs text-[var(--text-muted)]">Percentage completed across your enrolled courses.</p>
            </div>
          </div>

          {courseProgressChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-[var(--text-muted)]">
              No course progress data available.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseProgressChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} angle={-20} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="progress" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Skill Distribution */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Skill Proficiency Breakdown</h2>
              <p className="text-xs text-[var(--text-muted)]">Verified skills by demonstrated proficiency tier.</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="level" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {skillChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Assessment Pass Rate & Competency Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Pass Rate */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Assessment Evaluation Performance</h2>
              <p className="text-xs text-[var(--text-muted)]">Ratio of passed module quizzes and graduation exams.</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {assessmentPieData.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No assessment attempts recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assessmentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {assessmentPieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Competency Milestones */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Competency Domain Progress</h2>
              <p className="text-xs text-[var(--text-muted)]">Institutional capability frameworks.</p>
            </div>
            <Link
              to="/trainee/competencies"
              className="text-xs font-bold text-[var(--primary)] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {competencyProgress.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-8 text-center">No competency progress records.</p>
            ) : (
              competencyProgress.slice(0, 4).map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)] truncate">{c.name}</span>
                    <span className="text-[var(--primary)] font-bold">{c.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full"
                      style={{ width: `${c.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          isOpen={Boolean(selectedCert)}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};

export default TraineeAnalyticsPage;
