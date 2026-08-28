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
  ExternalLink,
  GraduationCap,
  UserCheck,
} from 'lucide-react';

const USER_ROLE_COLORS = ['#3B82F6', '#0D9488', '#8B5CF6'];
const COURSE_STATUS_COLORS = ['#10B981', '#F59E0B'];
const ASSESSMENT_COLORS = ['#10B981', '#EF4444'];
const SKILL_PROF_COLORS = ['#10B981', '#3B82F6', '#8B5CF6'];

const AdminAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Chart 1: Skill Distribution Bar Chart
  const skillProficiencyChartData = [
    { level: 'Beginner', count: skillsDistribution.beginner || 0, fill: '#10B981' },
    { level: 'Proficient', count: skillsDistribution.proficient || 0, fill: '#3B82F6' },
    { level: 'Advanced', count: skillsDistribution.advanced || 0, fill: '#8B5CF6' },
  ];

  // Chart 2: Popular Skills Data
  const popularSkillsChartData = popularSkills.map((s) => ({
    name: s.name.length > 15 ? s.name.substring(0, 13) + '...' : s.name,
    courses: s.coursesCount,
  }));

  // Chart 3: Assessment Pass vs Fail Pie Chart
  const assessmentPieData = [
    { name: 'Passed Attempts', value: assessmentStatistics.passCount || 0 },
    { name: 'Failed Attempts', value: assessmentStatistics.failCount || 0 },
  ].filter((d) => d.value > 0);

  // Chart 4: Top Courses Data
  const topCoursesChartData = topCourses.map((c) => ({
    name: c.title.length > 16 ? c.title.substring(0, 14) + '...' : c.title,
    enrollments: c.enrollmentCount,
    completions: c.completionCount,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Platform Executive Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Platform Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Comprehensive real-time telemetry across users, course curriculum, learner enrollments, assessment outcomes, and institutional competencies.
        </p>

        {/* Top Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xs">
            <span className="text-[10px] uppercase font-mono text-slate-300 block font-semibold">Total Users</span>
            <strong className="text-xl font-bold">{summary.totalUsers}</strong>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-blue-700 block font-semibold">Trainees</span>
            <strong className="text-xl font-bold text-blue-900">{summary.totalTrainees}</strong>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-teal-700 block font-semibold">Trainers</span>
            <strong className="text-xl font-bold text-teal-900">{summary.totalTrainers}</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-emerald-700 block font-semibold">Total Courses</span>
            <strong className="text-xl font-bold text-emerald-900">{summary.totalCourses}</strong>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-purple-700 block font-semibold">Enrollments</span>
            <strong className="text-xl font-bold text-purple-900">{summary.totalEnrollments}</strong>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-indigo-700 block font-semibold">Certificates</span>
            <strong className="text-xl font-bold text-indigo-900">{summary.totalCertificates}</strong>
          </div>
        </div>
      </div>

      {/* ====================================================
          VISUALIZATION ROW 1: USER DISTRIBUTION & COURSE STATUS
          ==================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Distribution Donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>User Role Distribution</span>
            </h2>
            <p className="text-[11px] text-slate-400">Breakdown of platform accounts</p>
          </div>

          <div className="h-48 flex flex-col items-center justify-center">
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
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Status Donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Course Catalog Status</span>
            </h2>
            <p className="text-[11px] text-slate-400">Published vs Draft catalog</p>
          </div>

          <div className="h-48 flex flex-col items-center justify-center">
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
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assessment Pass / Fail Donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-purple-600" />
                <span>Assessment Outcomes & Accuracy</span>
              </h2>
              <p className="text-[11px] text-slate-400">Total attempts, pass rate & average score</p>
            </div>
            <span className="text-xs font-bold text-emerald-700">
              {assessmentStatistics.passPercentage}% Pass Rate
            </span>
          </div>

          {assessmentStatistics.totalAttempts === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              No assessment attempts recorded across the platform yet.
            </div>
          ) : (
            <div className="h-48 flex items-center justify-around">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
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
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Attempts</span>
                  <strong className="text-sm font-bold text-slate-900">{assessmentStatistics.totalAttempts}</strong>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Average Score</span>
                  <strong className="text-sm font-bold text-emerald-700">{assessmentStatistics.averageScore}%</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          VISUALIZATION ROW 2: TIMELINE TREND & TOP COURSES
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline: Enrollments & Completions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Platform Learning Trajectory</span>
            </h2>
            <p className="text-[11px] text-slate-400">Enrollments and course completions over time</p>
          </div>

          {enrollmentTrend.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No historical trend data available yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentTrend} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    name="Enrollments"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    name="Completions"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Courses by Enrollment & Completion */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Top Performing Courses</span>
              </h2>
              <p className="text-[11px] text-slate-400">Most enrolled & completed courses</p>
            </div>
            <Link to="/admin/courses" className="text-xs font-semibold text-teal-700 hover:underline">
              All Courses &rarr;
            </Link>
          </div>

          {topCoursesChartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No course performance metrics recorded yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCoursesChartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="enrollments" name="Learners" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completions" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          VISUALIZATION ROW 3: SKILLS DISTRIBUTION & POPULAR SKILLS
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verified Skills by Proficiency */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Mapped Skill Proficiency Spread</span>
              </h2>
              <p className="text-[11px] text-slate-400">Beginner, Proficient, and Advanced offerings</p>
            </div>
            <Link to="/admin/skills" className="text-xs font-semibold text-emerald-700 hover:underline">
              Skill Library &rarr;
            </Link>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillProficiencyChartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val) => [`${val} Course Mappings`, 'Count']}
                  contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {skillProficiencyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Frequently Taught Skills */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Most Frequently Mapped Skills</span>
            </h2>
            <p className="text-[11px] text-slate-400">Skills most integrated into active courses</p>
          </div>

          {popularSkillsChartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No skills mapped to courses yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularSkillsChartData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`${val} Courses`, 'Mapped in']}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                  />
                  <Bar dataKey="courses" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          SECTION 4: INSTITUTIONAL COMPETENCIES & TRAINER ACTIVITY
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competencies Framework Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Institutional Competency Frameworks ({competencyOverview.length})</span>
              </h2>
              <p className="text-[11px] text-slate-400">Job-ready capabilities defined on platform</p>
            </div>
            <Link to="/admin/competencies" className="text-xs font-semibold text-indigo-700 hover:underline">
              Competencies &rarr;
            </Link>
          </div>

          {competencyOverview.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No competencies defined yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {competencyOverview.map((c) => (
                <div key={c._id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">
                      {c.totalRequiredSkills} Required Skills
                    </span>
                  </div>
                  {c.description && <p className="text-[11px] text-slate-500">{c.description}</p>}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.requiredSkillNames?.slice(0, 4).map((sName, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600">
                        {sName}
                      </span>
                    ))}
                    {(c.requiredSkillNames?.length || 0) > 4 && (
                      <span className="text-[10px] text-slate-400">+{c.requiredSkillNames.length - 4} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trainer Activity Breakdown Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Trainer Activity & Capacity Metrics</span>
            </h2>
            <p className="text-[11px] text-slate-400">Overview of trainer courses and learner enrollments</p>
          </div>

          {trainerActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No trainer activity recorded yet.</p>
          ) : (
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Trainer</th>
                    <th className="py-2.5 px-3 text-center">Courses</th>
                    <th className="py-2.5 px-3 text-center">Enrollments</th>
                    <th className="py-2.5 px-3 text-center">Completions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {trainerActivity.map((t) => (
                    <tr key={t.trainerId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        <div>
                          <span>{t.name}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{t.email}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        {t.courseCount}
                        <span className="text-[10px] text-slate-400 block font-normal">({t.publishedCourseCount} pub)</span>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-blue-700">{t.enrollmentsCount}</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-700">{t.completionsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
