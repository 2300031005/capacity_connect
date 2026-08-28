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
  XCircle,
  ExternalLink,
  ShieldCheck,
  Download,
  Calendar,
} from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#64748B'];
const PIE_COLORS = ['#10B981', '#EF4444'];

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
    recentActivity = [],
  } = analyticsData;

  // Chart 1: Skill Distribution Bar Chart
  const skillChartData = [
    { level: 'Beginner', count: skillDistribution.beginner || 0, fill: '#10B981' },
    { level: 'Proficient', count: skillDistribution.proficient || 0, fill: '#3B82F6' },
    { level: 'Advanced', count: skillDistribution.advanced || 0, fill: '#8B5CF6' },
  ];

  // Chart 2: Assessment Pass vs Fail Pie Chart
  const assessmentPieData = [
    { name: 'Passed', value: assessmentPerformance.passedCount || 0 },
    { name: 'Failed', value: assessmentPerformance.failedCount || 0 },
  ].filter((d) => d.value > 0);

  // Chart 3: Course Progress Bar Data
  const courseProgressChartData = learningProgress.map((p) => ({
    name: p.courseTitle.length > 18 ? p.courseTitle.substring(0, 16) + '...' : p.courseTitle,
    progress: p.progress || 0,
    status: p.status,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-Time Learning Insights</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Learning Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Visual insights into your enrolled courses, assessment performance, verified skill growth, and competency progress.
        </p>

        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xs">
            <span className="text-[10px] uppercase font-mono text-slate-300 block font-semibold">Overall Progress</span>
            <strong className="text-xl font-bold">{summary.overallProgress}%</strong>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-blue-700 block font-semibold">Active Courses</span>
            <strong className="text-xl font-bold text-blue-900">{summary.activeCourses}</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-emerald-700 block font-semibold">Completed</span>
            <strong className="text-xl font-bold text-emerald-900">{summary.completedCourses}</strong>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-purple-700 block font-semibold">Verified Skills</span>
            <strong className="text-xl font-bold text-purple-900">{summary.verifiedSkills}</strong>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-indigo-700 block font-semibold">Certificates</span>
            <strong className="text-xl font-bold text-indigo-900">{summary.certificatesEarned}</strong>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-amber-700 block font-semibold">Competencies</span>
            <strong className="text-xl font-bold text-amber-900">{summary.competenciesDemonstrated}</strong>
          </div>
        </div>
      </div>

      {/* ====================================================
          VISUALIZATION ROW 1: COURSE PROGRESS & SKILL DISTRIBUTION
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course-Wise Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Course Progress Overview</span>
              </h2>
              <p className="text-[11px] text-slate-400">Current progress across enrolled courses</p>
            </div>
            <Link to="/trainee/my-courses" className="text-xs font-semibold text-blue-600 hover:underline">
              View Courses &rarr;
            </Link>
          </div>

          {courseProgressChartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No course enrollment data available yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseProgressChartData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`${val}% Progress`, 'Completion']}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="progress" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Verified Skill Proficiency Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Verified Skills by Proficiency</span>
              </h2>
              <p className="text-[11px] text-slate-400">Skills unlocked via passed final assessments</p>
            </div>
            <Link to="/trainee/skills" className="text-xs font-semibold text-emerald-600 hover:underline">
              My Skills &rarr;
            </Link>
          </div>

          {summary.verifiedSkills === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No verified skills yet. Pass final assessments to unlock skills.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillChartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`${val} Skills`, 'Count']}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {skillChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          VISUALIZATION ROW 2: ASSESSMENT PERFORMANCE & TIMELINE
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Pass/Fail Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-purple-600" />
              <span>Assessment Results</span>
            </h2>
            <p className="text-[11px] text-slate-400">Pass rate & attempt breakdown</p>
          </div>

          {assessmentPerformance.totalAttempts === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No assessment attempts recorded yet.
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={assessmentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {assessmentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center pt-1 text-xs">
                <span className="text-slate-400">Average Score: </span>
                <strong className="text-slate-900 font-bold">{assessmentPerformance.averageScore}%</strong>
              </div>
            </div>
          )}
        </div>

        {/* Chronological Learning & Score Trend */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Assessment Performance Trend</span>
            </h2>
            <p className="text-[11px] text-slate-400">Chronological average score trajectory over time</p>
          </div>

          {learningTrend.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No timeline activity recorded yet. Take quizzes and exams to view trends.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={learningTrend} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val, name) => [
                      name === 'averageScore' ? `${val}%` : val,
                      name === 'averageScore' ? 'Avg Score' : 'Passed Count',
                    ]}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="averageScore"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10B981' }}
                    activeDot={{ r: 6 }}
                    name="Average Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          SECTION 3: COMPETENCY READINESS & RECENT ACTIVITY
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competencies Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Institutional Competencies</span>
              </h2>
              <p className="text-[11px] text-slate-400">Progress toward domain mastery</p>
            </div>
            <Link to="/trainee/competencies" className="text-xs font-semibold text-indigo-600 hover:underline">
              All Competencies &rarr;
            </Link>
          </div>

          {competencyProgress.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No competencies defined yet.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {competencyProgress.map((comp) => (
                <div key={comp._id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{comp.name}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        comp.status === 'Demonstrated'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : comp.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        comp.status === 'Demonstrated' ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${comp.percentageDemonstrated}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{comp.percentageDemonstrated}% Demonstrated</span>
                    <span>
                      {comp.satisfiedSkillsCount} / {comp.totalRequiredSkills} Skills Satisfied
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Recent Activity Feed</span>
            </h2>
            <p className="text-[11px] text-slate-400">Your latest actions, quiz attempts, and certificates</p>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No recent activity recorded yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {recentActivity.map((act, idx) => (
                <div key={idx} className="flex items-start justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 block">{act.title}</span>
                    {act.detail && <span className="text-[11px] text-slate-500 block">{act.detail}</span>}
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      act.color === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800'
                        : act.color === 'red'
                        ? 'bg-red-100 text-red-800'
                        : act.color === 'indigo'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {act.badge}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          SECTION 4: EARNED CERTIFICATES GALLERY
          ==================================================== */}
      {certificates.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Earned Certificates of Completion ({certificates.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400">Official verified credentials backed by passed final assessments</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div key={cert._id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{cert.courseTitle}</span>
                  <span className="font-mono text-[10px] text-indigo-700 font-bold block mt-0.5">
                    {cert.certificateId}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                    <span>Score: <strong>{cert.percentage}%</strong></span>
                    <span>&bull;</span>
                    <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCert({
                        certificateId: cert.certificateId,
                        filePath: cert.filePath,
                        course: { title: cert.courseTitle },
                        percentage: cert.percentage,
                        issuedAt: cert.issueDate,
                      })
                    }
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Certificate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          isOpen={Boolean(selectedCert)}
          onClose={() => setSelectedCert(null)}
          certificate={selectedCert}
        />
      )}
    </div>
  );
};

export default TraineeAnalyticsPage;
