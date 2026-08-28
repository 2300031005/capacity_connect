import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyCoursesApi, getMyCertificatesApi } from '../services/api';
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
  CheckCircle2
} from 'lucide-react';

const TraineeDashboardPage = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCertificate, setActiveCertificate] = useState(null);

  useEffect(() => {
    const loadTraineeData = async () => {
      try {
        const [coursesRes, certsRes] = await Promise.allSettled([
          getMyCoursesApi(),
          getMyCertificatesApi(),
        ]);

        if (coursesRes.status === 'fulfilled' && coursesRes.value?.success) {
          setEnrolledCourses(coursesRes.value.data || []);
        }
        if (certsRes.status === 'fulfilled' && certsRes.value?.success) {
          setCertificates(certsRes.value.data || []);
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

          <Link
            to="/trainee/courses"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Courses</span>
          </Link>
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

        {/* Skill Gaps */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Skill Gaps</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No gaps identified</p>
          <p className="text-[11px] text-slate-400 mt-2">Diagnosed via assessments</p>
        </div>

        {/* Recommended Learning */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Recommended</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Active catalog</p>
          <p className="text-[11px] text-slate-400 mt-2">Explore available courses</p>
        </div>
      </div>

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
