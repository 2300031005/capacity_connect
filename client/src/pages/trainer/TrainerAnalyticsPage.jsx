import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTrainerAnalyticsApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import TrainerAiTeachingInsights from '../../components/TrainerAiTeachingInsights';
import TrainerCourseAiInsightsModal from '../../components/TrainerCourseAiInsightsModal';
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
} from 'lucide-react';

const PROGRESS_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#6366F1', '#10B981'];

const TrainerAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseAiModal, setCourseAiModal] = useState({ isOpen: false, courseId: null, courseTitle: '' });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTrainerAnalyticsApi();
      if (response && response.success) {
        setAnalyticsData(response.data);
      } else {
        throw new Error(response?.message || 'Failed to load trainer analytics');
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

  // Chart 1: Course Enrollments Bar Data
  const courseEnrollmentChartData = coursePerformance.map((c) => ({
    name: c.title.length > 18 ? c.title.substring(0, 16) + '...' : c.title,
    learners: c.enrollmentCount,
    completions: c.completedCount,
  }));

  // Chart 2: Course Completion Percentage Bar Data
  const courseCompletionChartData = coursePerformance.map((c) => ({
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
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Curriculum & Learner Performance Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Trainer Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Real-time metrics for courses you own, including enrollment growth, learner completion rates, assessment results, and skills alignment.
        </p>

        {/* Top Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xs">
            <span className="text-[10px] uppercase font-mono text-slate-300 block font-semibold">Total Courses</span>
            <strong className="text-xl font-bold">{summary.totalCourses}</strong>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-blue-700 block font-semibold">Unique Learners</span>
            <strong className="text-xl font-bold text-blue-900">{summary.totalLearners}</strong>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-teal-700 block font-semibold">Enrollments</span>
            <strong className="text-xl font-bold text-teal-900">{summary.totalEnrollments}</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-emerald-700 block font-semibold">Completion Rate</span>
            <strong className="text-xl font-bold text-emerald-900">{summary.completionRate}%</strong>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-purple-700 block font-semibold">Assessments</span>
            <strong className="text-xl font-bold text-purple-900">{summary.totalAssessments}</strong>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-mono text-indigo-700 block font-semibold">Certificates</span>
            <strong className="text-xl font-bold text-indigo-900">{summary.totalCertificatesIssued}</strong>
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
    </div>
  );
};

export default TrainerAnalyticsPage;
