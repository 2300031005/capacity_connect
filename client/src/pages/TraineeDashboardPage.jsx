import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyCoursesApi,
  getMyCertificatesApi,
  getAiCourseRecommendationsApi,
} from '../services/api';
import CertificateModal from '../components/CertificateModal';
import {
  BookOpen,
  Award,
  Target,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Download,
  Calendar,
  CheckCircle2,
  Lightbulb,
  Star,
  Zap,
  Clock,
  TrendingUp,
} from 'lucide-react';

const TraineeDashboardPage = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [nextSteps, setNextSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCertificate, setActiveCertificate] = useState(null);

  useEffect(() => {
    const loadTraineeData = async () => {
      try {
        const [coursesRes, certsRes, recsRes] = await Promise.allSettled([
          getMyCoursesApi(),
          getMyCertificatesApi(),
          getAiCourseRecommendationsApi(),
        ]);

        if (coursesRes.status === 'fulfilled' && coursesRes.value?.success) {
          setEnrolledCourses(coursesRes.value.data || []);
        }
        if (certsRes.status === 'fulfilled' && certsRes.value?.success) {
          setCertificates(certsRes.value.data || []);
        }
        if (recsRes.status === 'fulfilled' && recsRes.value?.success) {
          setRecommendations(recsRes.value.data?.recommendations || []);
          setNextSteps(recsRes.value.data?.nextSteps || []);
        }
      } catch (err) {
        console.warn('Could not load trainee data on dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTraineeData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Role: Trainee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Trainee'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Department: {user?.department || 'General Learning Track'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/trainee/recommendations"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Recommendations</span>
            </Link>
            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Courses</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Learning Progress / Enrolled Courses */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{enrolledCourses.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {enrolledCourses.length > 0 ? 'Active learning pathways' : 'No courses enrolled yet'}
          </p>
        </div>

        {/* Certificates Earned */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Certificates Earned</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{certificates.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {certificates.length > 0 ? 'Graduated course credentials' : 'Pass final assessments'}
          </p>
        </div>

        {/* Skills Track */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Skills & Gaps</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <Link to="/trainee/skills" className="text-sm font-semibold text-slate-700 hover:text-emerald-700">
            View Skill Passport →
          </Link>
          <p className="text-[11px] text-slate-400 mt-2">Verified via passed final exams</p>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Advisor</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {recommendations.length > 0 ? `${recommendations.length} Tailored Matches` : 'Active Advisor'}
          </p>
          <Link to="/trainee/recommendations" className="text-[11px] text-emerald-700 font-semibold hover:underline mt-2 inline-block">
            Explore recommendations →
          </Link>
        </div>
      </div>

      {/* Recommended for You Section */}
      {recommendations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  ✨ Recommended for You
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Personalized based on your skills, learning progress and assessment performance.
              </p>
            </div>
            <Link
              to="/trainee/recommendations"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View All ({recommendations.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((item, idx) => {
              const course = item.course;
              const matchScore = item.matchScore || 85;

              return (
                <div
                  key={course?._id || idx}
                  className="bg-slate-50/70 border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {course?.category}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{matchScore}% Match</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {course?.title}
                    </h3>

                    <div className="bg-emerald-50/50 border border-emerald-100 rounded p-2 text-[11px] text-emerald-900 leading-snug">
                      <p className="line-clamp-2">{item.reason}</p>
                    </div>

                    {Array.isArray(item.skillAlignment) && item.skillAlignment.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.skillAlignment.slice(0, 2).map((sa, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-700"
                          >
                            <Target className="w-2.5 h-2.5 text-blue-600" />
                            <span>{sa.skill}</span>
                            <span className="text-emerald-700 font-semibold">({sa.targetProficiency})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 capitalize">Level: {course?.level || 'General'}</span>
                    <Link
                      to={`/trainee/courses/${course?._id}`}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                    >
                      <span>View Course</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Next Steps Section (AI Learning Sequence) */}
      {nextSteps.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-600" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  ⚡ AI Suggested Next Steps (Sequential Learning Plan)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Concrete actionable sequence to advance your verified competencies and career roadmap.
              </p>
            </div>
            <Link
              to="/trainee/recommendations"
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1"
            >
              <span>AI Hub</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {nextSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-violet-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-800 text-xs font-bold">
                    {step.step || idx + 1}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
                </div>

                {step.actionUrl && (
                  <Link
                    to={step.actionUrl}
                    className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900 pt-2 border-t border-slate-200"
                  >
                    <span>Take Action</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Courses Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            My Enrolled Courses ({enrolledCourses.length})
          </h2>
          {enrolledCourses.length > 0 && (
            <Link
              to="/trainee/my-courses"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View All
            </Link>
          )}
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs text-slate-500">
              You haven't enrolled in any courses yet.
            </p>
            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrolledCourses.slice(0, 4).map((item) => (
              <div
                key={item._id}
                className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {item.course?.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {item.course?.title}
                  </h3>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Progress: {item.progress || 0}%</span>
                  <Link
                    to={`/trainee/courses/${item.course?._id}`}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificates Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              My Earned Certificates ({certificates.length})
            </h2>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-600">No certificates earned yet.</p>
            <p>Complete all course modules and pass the final course assessment to graduate and receive your certificate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-emerald-50/40 border border-emerald-200 rounded-lg p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">
                      {cert.certificateId}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Score: {cert.percentage}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                    {cert.course?.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Instructor: {cert.trainer?.name || 'Instructor'}
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveCertificate(cert)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors"
                    >
                      View
                    </button>
                    <a
                      href={`http://localhost:5002/${cert.filePath}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-emerald-800 hover:text-emerald-950 rounded hover:bg-emerald-100 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Viewer Modal */}
      {activeCertificate && (
        <CertificateModal
          isOpen={Boolean(activeCertificate)}
          onClose={() => setActiveCertificate(null)}
          certificate={activeCertificate}
        />
      )}
    </div>
  );
};

export default TraineeDashboardPage;
