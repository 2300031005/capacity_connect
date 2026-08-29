import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAnalyticsApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
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
  Users,
  BookOpen,
  Award,
  FileCheck,
  Target,
  Layers,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
  GraduationCap,
  UserCheck,
  Sparkles,
} from 'lucide-react';

const USER_ROLE_COLORS = ['#3B82F6', '#0D9488', '#8B5CF6'];
const COURSE_STATUS_COLORS = ['#10B981', '#F59E0B'];
const ASSESSMENT_COLORS = ['#10B981', '#EF4444'];
const SKILL_PROF_COLORS = ['#10B981', '#3B82F6', '#8B5CF6'];

const AdminAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminAnalyticsApi();
      if (response && response.success) {
        setAnalyticsData(response.data);
      } else {
        throw new Error(response?.message || 'Failed to load platform analytics');
      }
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load platform analytics.');
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
        <Loading message="Aggregating platform-wide capacity building, assessment, and competency metrics..." />
      </div>
    );
  }

  if (error || !analyticsData) {
    return <ErrorMessage message={error || 'Failed to load platform analytics.'} onRetry={fetchAnalytics} />;
  }

  const {
    summary,
    userDistribution = [],
    courseStatusDistribution = [],
    topCourses = [],
    enrollmentTrend = [],
    assessmentStatistics = {},
    skillsDistribution = {},
    popularSkills = [],
    competencyOverview = [],
    trainerActivity = [],
  } = analyticsData;

  // Skill Distribution Bar Chart Data
  const skillProficiencyChartData = [
    { level: 'Beginner', count: skillsDistribution.beginner || 0, fill: '#10B981' },
    { level: 'Proficient', count: skillsDistribution.proficient || 0, fill: '#3B82F6' },
    { level: 'Advanced', count: skillsDistribution.advanced || 0, fill: '#8B5CF6' },
  ];

  // Popular Skills Data
  const popularSkillsChartData = popularSkills.map((s) => ({
    name: s.name.length > 15 ? s.name.substring(0, 13) + '...' : s.name,
    courses: s.coursesCount,
  }));

  // Assessment Pass vs Fail Pie Chart Data
  const assessmentPieData = [
    { name: 'Passed Attempts', value: assessmentStatistics.passCount || 0 },
    { name: 'Failed Attempts', value: assessmentStatistics.failCount || 0 },
  ].filter((d) => d.value > 0);

  // Top Courses Data
  const topCoursesChartData = topCourses.map((c) => ({
    name: c.title.length > 16 ? c.title.substring(0, 14) + '...' : c.title,
    enrollments: c.enrollmentCount,
    completions: c.completionCount,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Platform Organizational Intelligence & Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Executive Analytics Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Comprehensive real-time telemetry across platform user growth, instructional curriculum delivery, examination outcomes, and institutional competencies.
        </p>

        {/* Top Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-mono text-slate-300 dark:text-slate-400 block font-semibold">Total Users</span>
            <strong className="text-xl font-bold">{summary.totalUsers}</strong>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono text-blue-700 dark:text-blue-400 block font-semibold">Trainees</span>
            <strong className="text-xl font-bold text-blue-900 dark:text-blue-200">{summary.totalTrainees}</strong>
          </div>
          <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono text-teal-700 dark:text-teal-400 block font-semibold">Trainers</span>
            <strong className="text-xl font-bold text-teal-900 dark:text-teal-200">{summary.totalTrainers}</strong>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono text-emerald-700 dark:text-emerald-400 block font-semibold">Courses</span>
            <strong className="text-xl font-bold text-emerald-900 dark:text-emerald-200">{summary.totalCourses}</strong>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono text-purple-700 dark:text-purple-400 block font-semibold">Enrollments</span>
            <strong className="text-xl font-bold text-purple-900 dark:text-purple-200">{summary.totalEnrollments}</strong>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono text-indigo-700 dark:text-indigo-400 block font-semibold">Certificates</span>
            <strong className="text-xl font-bold text-indigo-900 dark:text-indigo-200">{summary.totalCertificates}</strong>
          </div>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-x-auto transition-colors">
        {[
          { id: 'all', label: 'All Telemetry', icon: Activity },
          { id: 'activity', label: '1. Platform Activity & Infrastructure', icon: Users },
          { id: 'outcomes', label: '2. Learning Outcomes & Assessments', icon: FileCheck },
          { id: 'competency', label: '3. Competency & Skill Intelligence', icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ====================================================
          PILLAR 1: PLATFORM ACTIVITY & INFRASTRUCTURE
          ==================================================== */}
      {(activeTab === 'all' || activeTab === 'activity') && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Pillar 1: Platform Activity & User Infrastructure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Role Distribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>User Distribution</span>
                </h3>
                <p className="text-[10px] text-slate-400">Platform account breakdown</p>
              </div>

              <div className="h-44 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={userDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={USER_ROLE_COLORS[index % USER_ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#fff', border: 'none' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Course Status */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Course Status</span>
                </h3>
                <p className="text-[10px] text-slate-400">Published vs Draft modules</p>
              </div>

              <div className="h-44 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={courseStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {courseStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COURSE_STATUS_COLORS[index % COURSE_STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#fff', border: 'none' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Enrollment Growth Trend */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Monthly Enrollment Growth</span>
                </h3>
                <p className="text-[10px] text-slate-400">Platform registration & enrollment trajectory</p>
              </div>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#fff', border: 'none' }} />
                    <Line type="monotone" dataKey="enrollments" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          PILLAR 2: LEARNING OUTCOMES & EXAMINATION
          ==================================================== */}
      {(activeTab === 'all' || activeTab === 'outcomes') && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Pillar 2: Learning Outcomes & Examination Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Assessment Outcomes Donut */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Assessment Pass Rate</h3>
                  <p className="text-[10px] text-slate-400">Total Attempts: {assessmentStatistics.totalAttempts || 0}</p>
                </div>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {assessmentStatistics.passRate || 0}%
                </span>
              </div>

              <div className="h-44 flex flex-col items-center justify-center">
                {assessmentPieData.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No quiz attempts recorded yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={assessmentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {assessmentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ASSESSMENT_COLORS[index % ASSESSMENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#fff', border: 'none' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Performing Courses Bar Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Top Courses by Enrollments & Completions</span>
                </h3>
                <p className="text-[10px] text-slate-400">High impact curriculum delivery</p>
              </div>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCoursesChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#fff', border: 'none' }} />
                    <Bar dataKey="enrollments" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Enrollments" />
                    <Bar dataKey="completions" fill="#10B981" radius={[4, 4, 0, 0]} name="Completions" />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          PILLAR 3: COMPETENCY & SKILL INTELLIGENCE
          ==================================================== */}
      {(activeTab === 'all' || activeTab === 'competency') && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Pillar 3: Competency & Skill Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Skill Proficiency Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Skill Proficiency Levels</span>
                </h3>
                <p className="text-[10px] text-slate-400">Distribution of demonstrated skills across learners</p>
              </div>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillProficiencyChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="level" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#fff', border: 'none' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {skillProficiencyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular Skills in Curriculum */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>High Demand Skills in Curriculum</span>
                </h3>
                <p className="text-[10px] text-slate-400">Skills most frequently embedded across courses</p>
              </div>

              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularSkillsChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#fff', border: 'none' }} />
                    <Bar dataKey="courses" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Courses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Competency Overview Table */}
          {competencyOverview.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-5 space-y-3 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Institutional Competency Attainment Matrix
                  </h3>
                  <p className="text-[10px] text-slate-400">Trainee completion rates per capability framework</p>
                </div>
                <Link
                  to="/admin/competencies"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Manage Frameworks &rarr;
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Competency Framework</th>
                      <th className="py-2.5 px-3">Required Skills</th>
                      <th className="py-2.5 px-3">Demonstrated Trainees</th>
                      <th className="py-2.5 px-3">In Progress Trainees</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {competencyOverview.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{c.name}</td>
                        <td className="py-2.5 px-3">{c.skillsCount || 0} Skills</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-700 dark:text-emerald-400">
                          {c.completedTraineesCount || 0} Trainees
                        </td>
                        <td className="py-2.5 px-3 text-blue-700 dark:text-blue-400">
                          {c.inProgressTraineesCount || 0} Trainees
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
