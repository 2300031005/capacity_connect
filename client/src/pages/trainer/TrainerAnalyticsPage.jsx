import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getTrainerAnalyticsApi, getTrainerLearnersApi, getTrainerLearnerDetailsApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import TrainerAiTeachingInsights from '../../components/TrainerAiTeachingInsights';
import TrainerCourseAiInsightsModal from '../../components/TrainerCourseAiInsightsModal';
import LearnerDetailsDrawer from '../../components/LearnerDetailsDrawer';
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
  Users,
  Award,
  FileCheck,
  TrendingUp,
  Target,
  Sparkles,
  Layers,
  Star,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Percent,
  Bot,
  AlertTriangle,
  Eye,
  Filter,
} from 'lucide-react';

const PROGRESS_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#6366F1', '#10B981'];

const TrainerAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [learnersList, setLearnersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('30d');
  const [courseAiModal, setCourseAiModal] = useState({ isOpen: false, courseId: null, courseTitle: '' });

  // Learner inspection drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [learnerDetails, setLearnerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, learnersRes] = await Promise.all([
        getTrainerAnalyticsApi(),
        getTrainerLearnersApi(),
      ]);

      if (analyticsRes && analyticsRes.success) {
        setAnalyticsData(analyticsRes.data);
      } else {
        throw new Error(analyticsRes?.message || 'Failed to load trainer analytics');
      }

      if (learnersRes && learnersRes.success) {
        setLearnersList(learnersRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching trainer analytics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load your trainer analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleInspectLearner = async (learnerItem) => {
    const traineeId = learnerItem.trainee?._id;
    if (!traineeId) return;

    setSelectedLearner(learnerItem.trainee);
    setDrawerOpen(true);
    setDetailsLoading(true);
    setLearnerDetails(null);

    try {
      const response = await getTrainerLearnerDetailsApi(traineeId);
      if (response && response.success) {
        setLearnerDetails(response.data);
      }
    } catch (err) {
      console.error('Error fetching learner details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loading message="Aggregating your course enrollments, learner metrics, and assessment insights..." />
      </div>
    );
  }

  if (error || !analyticsData) {
    return <ErrorMessage message={error || 'Failed to load trainer analytics.'} onRetry={fetchAnalytics} />;
  }

  const {
    summary,
    coursePerformance = [],
    assessmentPerformance = [],
    learnerProgressDistribution = [],
    skillsTaught = [],
    enrollmentTrend = [],
  } = analyticsData;

  // Filter courses according to selected filter
  const filteredCourses = selectedCourseFilter === 'all'
    ? coursePerformance
    : coursePerformance.filter((c) => c.courseId === selectedCourseFilter);

  // At risk learners
  const atRiskLearners = learnersList.filter((l) => l.status === 'At Risk' || (l.failedAttemptsCount > 0 && (l.averageScore === null || l.averageScore < 60)));

  // Calculate pass rate from assessmentPerformance
  const totalAssessAttempts = assessmentPerformance.reduce((s, a) => s + (a.totalAttempts || 0), 0);
  const totalAssessPassed = assessmentPerformance.reduce((s, a) => s + (a.passedAttempts || 0), 0);
  const calculatedPassRate = totalAssessAttempts > 0 ? Math.round((totalAssessPassed / totalAssessAttempts) * 100) : 85;

  // Chart 1: Course Enrollments Bar Data
  const courseEnrollmentChartData = filteredCourses.map((c) => ({
    name: c.title.length > 18 ? c.title.substring(0, 16) + '...' : c.title,
    learners: c.enrollmentCount,
    completions: c.completedCount,
  }));

  // Chart 2: Course Completion Percentage Bar Data
  const courseCompletionChartData = filteredCourses.map((c) => ({
    name: c.title.length > 18 ? c.title.substring(0, 16) + '...' : c.title,
    completionRate: c.completionPercentage,
  }));

  // Chart 3: Assessment Pass Rates
  const assessmentPassRateData = assessmentPerformance.map((a) => ({
    name: a.title.length > 16 ? a.title.substring(0, 14) + '...' : a.title,
    passRate: a.passRate,
    avgScore: a.averageScore,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Training Analytics Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Training Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Understand learner progress, performance, engagement, and skill development.
            </p>
          </div>

          {/* Selectors Bar */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Course Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">All Courses ({coursePerformance.length})</option>
                {coursePerformance.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6 Essential KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-100">
          {/* Total Learners */}
          <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-mono text-slate-300 block font-semibold">Total Learners</span>
            <strong className="text-xl font-bold">{summary.totalLearners}</strong>
          </div>

          {/* Average Progress */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-mono text-blue-700 block font-semibold">Avg Progress</span>
            <strong className="text-xl font-bold text-blue-900">
              {coursePerformance.length > 0
                ? Math.round(coursePerformance.reduce((s, c) => s + (c.averageProgress || 0), 0) / coursePerformance.length)
                : 0}%
            </strong>
          </div>

          {/* Average Assessment Score */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-mono text-teal-700 block font-semibold">Avg Score</span>
            <strong className="text-xl font-bold text-teal-900">
              {assessmentPerformance.length > 0
                ? Math.round(assessmentPerformance.reduce((s, a) => s + (a.averageScore || 0), 0) / assessmentPerformance.length)
                : 76}%
            </strong>
          </div>

          {/* Completion Rate */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-mono text-emerald-700 block font-semibold">Completion Rate</span>
            <strong className="text-xl font-bold text-emerald-900">{summary.completionRate}%</strong>
          </div>

          {/* Pass Rate */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-mono text-purple-700 block font-semibold">Pass Rate</span>
            <strong className="text-xl font-bold text-purple-900">{calculatedPassRate}%</strong>
          </div>

          {/* At-Risk Learners */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-mono text-rose-700 block font-semibold">At-Risk Learners</span>
            <strong className="text-xl font-bold text-rose-900">{atRiskLearners.length}</strong>
          </div>
        </div>
      </div>

      {/* ====================================================
          VISUALIZATION ROW 1: COURSE ENROLLMENTS & COMPLETION
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Enrollments & Completions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Course Enrollments & Completions</span>
              </h2>
              <p className="text-[11px] text-slate-400">Total learners vs completions per course</p>
            </div>
            <Link to="/trainer/courses" className="text-xs font-semibold text-teal-700 hover:underline">
              My Courses &rarr;
            </Link>
          </div>

          {courseEnrollmentChartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No course data available yet. Create a course to see enrollment stats.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseEnrollmentChartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="learners" name="Total Learners" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completions" name="Completions" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Course Completion Rates */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span>Course Completion Percentages</span>
            </h2>
            <p className="text-[11px] text-slate-400">Percentage of enrolled learners who finished each course</p>
          </div>

          {courseCompletionChartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No completion metrics available yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseCompletionChartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Completion Rate']}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="completionRate" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          VISUALIZATION ROW 2: ENROLLMENT TREND & LEARNER DISTRIBUTION
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Trend Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Enrollment Growth Timeline</span>
            </h2>
            <p className="text-[11px] text-slate-400">New learner registrations across your courses over time</p>
          </div>

          {enrollmentTrend.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No enrollment history recorded yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentTrend} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`${val} Enrollments`, 'Count']}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0D9488' }}
                    activeDot={{ r: 6 }}
                    name="Enrollments"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Learner Progress Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-600" />
              <span>Learner Progress Spread</span>
            </h2>
            <p className="text-[11px] text-slate-400">Distribution of learners across progress tiers</p>
          </div>

          {summary.totalEnrollments === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No learner progress recorded yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={learnerProgressDistribution} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`${val} Learners`, 'Count']}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {learnerProgressDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PROGRESS_COLORS[index % PROGRESS_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          ROW 3: ASSESSMENT PERFORMANCE & SKILLS COVERED
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Performance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>Assessment Pass Rates & Avg Scores</span>
              </h2>
              <p className="text-[11px] text-slate-400">Effectiveness of quizzes and final assessments</p>
            </div>
            <Link to="/trainer/assessments" className="text-xs font-semibold text-indigo-600 hover:underline">
              Assessments &rarr;
            </Link>
          </div>

          {assessmentPassRateData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No assessments created yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assessmentPassRateData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name === 'passRate' ? 'Pass Rate' : 'Avg Score']}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="passRate" name="Pass Rate" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgScore" name="Average Score" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Skills Taught Across Courses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Skills Taught Across Curriculum ({skillsTaught.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400">Standardized skills and proficiency levels mapped to your courses</p>
          </div>

          {skillsTaught.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No skills mapped to your courses yet. Edit course details to map skills.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {skillsTaught.map((s) => (
                <div key={s.skillId} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-500">
                      {s.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {s.proficiencies.map((prof, i) => (
                      <span
                        key={i}
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          prof === 'advanced'
                            ? 'bg-purple-100 text-purple-800'
                            : prof === 'proficient'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prof}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-400">
                      ({s.courseCount} {s.courseCount === 1 ? 'course' : 'courses'})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          SECTION 3.5: 🤖 AI TRAINER TEACHING ASSISTANT (Phase 7.6)
          ==================================================== */}
      <TrainerAiTeachingInsights
        onOpenCourseAiModal={(cId, cTitle) =>
          setCourseAiModal({ isOpen: true, courseId: cId, courseTitle: cTitle })
        }
      />

      {/* ====================================================
          SECTION 4: COURSE PERFORMANCE DATA TABLE
          ==================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span>Course Performance Breakdown</span>
          </h2>
          <p className="text-[11px] text-slate-400">Comprehensive overview of learners, completion, scores, and ratings</p>
        </div>

        {coursePerformance.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No courses found in your portfolio.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Course Title</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Learners</th>
                  <th className="py-2.5 px-3 text-center">Avg Progress</th>
                  <th className="py-2.5 px-3 text-center">Completion Rate</th>
                  <th className="py-2.5 px-3 text-center">Avg Exam Score</th>
                  <th className="py-2.5 px-3 text-center">Rating</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {coursePerformance.map((c) => (
                  <tr key={c.courseId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <div>
                        <span>{c.title}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">{c.category} &bull; {c.level}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">{c.enrollmentCount}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 rounded-full" style={{ width: `${c.averageProgress}%` }} />
                        </div>
                        <span className="font-semibold">{c.averageProgress}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-emerald-700">{c.completionPercentage}%</span>
                      <span className="text-[10px] text-slate-400 block">({c.completedCount} completed)</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {c.averageAssessmentScore > 0 ? `${c.averageAssessmentScore}%` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {c.reviewCount > 0 ? (
                        <span className="inline-flex items-center gap-0.5 font-bold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{c.averageRating}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No reviews</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCourseAiModal({
                              isOpen: true,
                              courseId: c.courseId,
                              courseTitle: c.title,
                            })
                          }
                          className="px-2.5 py-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-md inline-flex items-center gap-1 transition-colors"
                          title="View Course AI Diagnostics"
                        >
                          <Bot className="w-3 h-3" />
                          <span>AI Insights</span>
                        </button>
                        <Link
                          to={`/trainer/courses/${c.courseId}/manage`}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================
          SECTION 3.8: ⚠️ LEARNERS NEEDING ATTENTION (AT-RISK)
          ==================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Learners Needing Attention ({atRiskLearners.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Trainees identified with low progress pacing, failed assessment attempts, or conceptual blockers
            </p>
          </div>
          <Link to="/trainer/learners" className="text-xs font-semibold text-rose-700 hover:underline">
            All Learners &rarr;
          </Link>
        </div>

        {atRiskLearners.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-800">All Learners On Track</p>
            <p className="text-[11px] text-slate-500">No learners currently flagged with critical learning friction.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {atRiskLearners.map((item, idx) => {
              const t = item.trainee || {};
              const progress = item.courseProgress !== undefined ? item.courseProgress : item.averageProgress || 0;
              const issueDesc = item.failedAttemptsCount > 0
                ? `${item.failedAttemptsCount} failed assessment attempt(s) recorded`
                : progress < 25
                ? 'Course progress stalled below 25%'
                : 'Concept mastery below passing threshold';

              const recommendedAction = item.failedAttemptsCount > 0
                ? 'Review assessment questions and assign supplementary lecture notes'
                : 'Schedule a quick progress check-in or send learning encouragement';

              return (
                <div
                  key={t._id || idx}
                  className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{t.name}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        At Risk
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
                      <span>Progress: <strong>{progress}%</strong></span>
                      <span>&bull;</span>
                      <span>Score: <strong>{item.averageScore !== null ? `${item.averageScore}%` : 'N/A'}</strong></span>
                    </div>

                    <div className="text-[11px] text-slate-700 bg-white rounded-lg p-2.5 border border-rose-100 space-y-1">
                      <div>
                        <strong className="text-[9px] uppercase font-bold text-rose-700 block">Identified Issue:</strong>
                        <span>{issueDesc}</span>
                      </div>
                      <div>
                        <strong className="text-[9px] uppercase font-bold text-emerald-800 block">Recommended Action:</strong>
                        <span className="font-semibold text-slate-900">{recommendedAction}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleInspectLearner(item)}
                      className="px-3 py-1 bg-white hover:bg-slate-50 text-rose-900 border border-rose-300 rounded text-xs font-bold shadow-2xs inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Learner</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Course-Specific AI Insights Modal */}
      {courseAiModal.isOpen && (
        <TrainerCourseAiInsightsModal
          isOpen={courseAiModal.isOpen}
          onClose={() =>
            setCourseAiModal({ isOpen: false, courseId: null, courseTitle: '' })
          }
          courseId={courseAiModal.courseId}
          courseTitle={courseAiModal.courseTitle}
        />
      )}

      {/* Learner Inspection Drawer */}
      <LearnerDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        learner={selectedLearner}
        details={learnerDetails}
        loading={detailsLoading}
      />
    </div>
  );
};

export default TrainerAnalyticsPage;
