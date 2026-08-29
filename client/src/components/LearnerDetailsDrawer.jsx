import React from 'react';
import {
  X,
  GraduationCap,
  BookOpen,
  FileCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  ArrowLeft,
  Target,
  Bot,
  Activity,
  Check,
} from 'lucide-react';
import Loading from './Loading';

const LearnerDetailsDrawer = ({
  isOpen,
  onClose,
  learner,
  details,
  loading = false,
  courseId = null,
}) => {
  if (!isOpen) return null;

  // Find the selected course details from the learner's enrolled list
  const coursesList = details?.courses || [];
  const activeCourse = courseId
    ? coursesList.find((c) => c.courseId?.toString() === courseId.toString()) || coursesList[0]
    : coursesList[0];

  const summary = details?.summary || {};
  const trainee = learner || details?.learner;

  // Calculate assessment statistics for active course
  const attempts = activeCourse?.attempts || [];
  const passedAttempts = attempts.filter((a) => a.passed);
  const failedAttempts = attempts.filter((a) => !a.passed);
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
    : null;

  // Derive weak and strong topics based on question results or quiz outcomes
  const weakTopics = [];
  const strongTopics = [];

  attempts.forEach((att) => {
    if (att.percentage >= 75) {
      strongTopics.push(`${att.assessmentTitle} (${att.percentage}%)`);
    } else if (att.percentage < 60) {
      weakTopics.push(`${att.assessmentTitle} (${att.percentage}%)`);
    }
  });

  // Generate dynamic pedagogical AI insight for this specific learner
  const isStruggling = failedAttempts.length >= 2 || (avgScore !== null && avgScore < 50);
  const isExcelling = activeCourse?.progress === 100 && (avgScore === null || avgScore >= 80);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
                aria-label="Back to learners"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Learners</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
            {loading ? (
              <div className="py-20 flex justify-center">
                <Loading message="Aggregating learner records, progress, and skill diagnostic data..." />
              </div>
            ) : !trainee ? (
              <div className="py-12 text-center text-slate-400">
                <p>Learner profile unavailable.</p>
              </div>
            ) : (
              <>
                {/* 1. LEARNER PROFILE CARD */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {trainee.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'TL'}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">{trainee.name}</h2>
                        <p className="text-slate-500 font-mono text-[11px]">{trainee.email}</p>
                        <span className="inline-block text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded mt-1">
                          Dept: {trainee.department || 'General'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled Date</span>
                      <span className="font-semibold text-slate-700">
                        {activeCourse?.enrolledAt
                          ? new Date(activeCourse.enrolledAt).toLocaleDateString()
                          : trainee.createdAt
                          ? new Date(trainee.createdAt).toLocaleDateString()
                          : 'Recent'}
                      </span>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-200">
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Overall Progress</span>
                      <strong className="text-sm font-bold text-slate-900">{activeCourse?.progress || 0}%</strong>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Avg Quiz Score</span>
                      <strong className="text-sm font-bold text-indigo-600">{avgScore !== null ? `${avgScore}%` : '--'}</strong>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Certificates</span>
                      <strong className="text-sm font-bold text-emerald-600">{activeCourse?.certificate ? '1 Earned' : '0'}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. LEARNING PROGRESS SECTION */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Learning Progress ({activeCourse?.completedModulesCount || 0} / {activeCourse?.totalModulesCount || 0} Modules)
                      </h3>
                    </div>
                    <span className="font-bold text-emerald-700 text-xs">{activeCourse?.progress || 0}% Complete</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${activeCourse?.progress || 0}%` }}
                    />
                  </div>

                  {/* Module List */}
                  {activeCourse?.modules && activeCourse.modules.length > 0 ? (
                    <div className="space-y-1.5 pt-2">
                      {activeCourse.modules.map((m, idx) => (
                        <div
                          key={m.moduleId || idx}
                          className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                            m.isCompleted
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                m.isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-500 font-semibold text-[10px]'
                              }`}
                            >
                              {m.isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                            </div>
                            <span className="font-semibold text-xs truncate">{m.title}</span>
                          </div>

                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              m.isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {m.isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-[11px]">No module tracking available.</p>
                  )}
                </div>

                {/* 3. ASSESSMENT PERFORMANCE SECTION */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Assessment Performance ({attempts.length} Attempts)
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Pass Rate: {attempts.length > 0 ? Math.round((passedAttempts.length / attempts.length) * 100) : 0}%
                    </span>
                  </div>

                  {attempts.length === 0 ? (
                    <p className="text-slate-400 italic text-[11px] py-2">
                      No assessment attempts logged for this course yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {attempts.map((att) => (
                        <div
                          key={att.attemptId}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{att.assessmentTitle}</span>
                            <span className="text-[10px] text-slate-400">
                              {att.type === 'final' ? 'Final Comprehensive Exam' : 'Module Quiz'} &bull; Score:{' '}
                              <strong>{att.score}</strong>/{att.totalMarks} ({att.percentage}%) &bull;{' '}
                              {new Date(att.submittedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                              att.passed
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border-rose-200'
                            }`}
                          >
                            {att.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      ))}

                      {/* Topic Highlights */}
                      {(weakTopics.length > 0 || strongTopics.length > 0) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {strongTopics.length > 0 && (
                            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                              <span className="text-[10px] font-bold uppercase text-emerald-800 block">Demonstrated Strengths</span>
                              <ul className="list-disc list-inside text-[11px] text-emerald-900 space-y-0.5">
                                {strongTopics.slice(0, 3).map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {weakTopics.length > 0 && (
                            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg space-y-1">
                              <span className="text-[10px] font-bold uppercase text-rose-800 block">Friction / Review Areas</span>
                              <ul className="list-disc list-inside text-[11px] text-rose-900 space-y-0.5">
                                {weakTopics.slice(0, 3).map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. VERIFIED SKILLS SECTION */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Verified & Targeted Skills
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{activeCourse?.courseTitle || 'Curriculum Domain'}</span>
                        <span className="text-[10px] text-slate-400">
                          Status: {activeCourse?.certificate ? 'Verified via Certificate Examination' : 'In Progress Validation'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {activeCourse?.certificate ? 'Demonstrated' : 'Developing'}
                      </span>
                    </div>

                    {activeCourse?.certificate && (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Award className="w-5 h-5 text-indigo-600" />
                          <div>
                            <span className="font-bold text-indigo-950 block">Credential Issued</span>
                            <span className="font-mono text-[10px] text-indigo-700">{activeCourse.certificate.certificateId}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-indigo-800 font-semibold">
                          Score: {activeCourse.certificate.percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. AI DIAGNOSTIC INSIGHT FOR THIS LEARNER */}
                <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-slate-50 border border-indigo-100 rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">
                      AI Pedagogical Insight & Next Action
                    </h3>
                  </div>

                  <div className="space-y-2 bg-white/80 border border-indigo-100 rounded-lg p-3.5">
                    {isStruggling ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Intervention Recommended</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {trainee.name} has recorded multiple failed quiz attempts or low assessment scores. Concept friction appears concentrated on testing questions.
                        </p>
                        <div className="pt-2 border-t border-slate-100 text-[11px] text-indigo-700 font-medium">
                          <strong>Suggested Action:</strong> Recommend reviewing foundational module resources and scheduling a quick concept check before re-attempting.
                        </div>
                      </div>
                    ) : isExcelling ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>High Competency Demonstrated</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {trainee.name} has completed the curriculum with consistently high assessment accuracy and earned credentials.
                        </p>
                        <div className="pt-2 border-t border-slate-100 text-[11px] text-indigo-700 font-medium">
                          <strong>Suggested Action:</strong> Recommend advancing to next-level technical tracks or practical capstone projects.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                          <Activity className="w-3.5 h-3.5 text-teal-600" />
                          <span>Pacing & Engagement Normal</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Learner is systematically moving through modules. Encouraging module quiz completion will help maintain momentum toward certification.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDetailsDrawer;
