import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  Sparkles,
  X,
  RefreshCw,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Users,
  CheckCircle2,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { getCourseAiTeachingInsightsApi, refreshCourseAiTeachingInsightsApi } from '../services/api';
import Loading from './Loading';

const TrainerCourseAiInsightsModal = ({ isOpen, onClose, courseId, courseTitle }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourseAi = useCallback(async (isRefresh = false) => {
    if (!courseId) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = isRefresh
        ? await refreshCourseAiTeachingInsightsApi(courseId)
        : await getCourseAiTeachingInsightsApi(courseId);

      if (res?.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res?.message || 'Failed to load course AI insights.');
      }
    } catch (err) {
      console.warn('Course AI insights error:', err.message);
      setError(err.response?.data?.message || err.message || 'Could not load course AI insights.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchCourseAi(false);
    }
  }, [isOpen, courseId, fetchCourseAi]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-indigo-100 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-indigo-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.2 rounded border border-indigo-500/30">
                  Course AI Diagnostic
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight truncate max-w-md">
                {courseTitle || data?.courseTitle || 'Course AI Insights'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fetchCourseAi(true)}
              disabled={refreshing || loading}
              title="Refresh AI Analysis"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loading message="Analyzing course curriculum, learner attempts, and question accuracy..." />
            </div>
          ) : error ? (
            <div className="p-8 text-center space-y-3 bg-white border border-rose-100 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-xs font-semibold text-rose-800">{error}</p>
              <button
                type="button"
                onClick={() => fetchCourseAi(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Retry Analysis
              </button>
            </div>
          ) : data ? (
            <>
              {/* Executive Metrics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Learners</span>
                  <span className="text-base font-black text-slate-900">{data.performance?.enrollmentCount || 0}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Progress</span>
                  <span className="text-base font-black text-indigo-600">{data.performance?.averageProgress || 0}%</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completion</span>
                  <span className="text-base font-black text-emerald-600">{data.performance?.completionRate || 0}%</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Exam Score</span>
                  <span className="text-base font-black text-amber-600">{data.performance?.averageScore || 0}%</span>
                </div>
              </div>

              {/* Teaching Suggestions */}
              {data.teachingSuggestions && data.teachingSuggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Recommended Teaching Actions</span>
                  </h4>
                  <div className="space-y-2">
                    {data.teachingSuggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-amber-100 rounded-xl p-3.5 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{sug.title}</span>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {sug.priority || 'medium'} priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{sug.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Difficulties */}
              {data.difficultyAreas && data.difficultyAreas.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Question Difficulty Bottlenecks</span>
                  </h4>
                  <div className="space-y-2">
                    {data.difficultyAreas.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">"{q.topic}"</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                            {q.accuracyPercentage}% Accuracy
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                          {q.insight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Module Drop-Offs */}
              {data.dropOffInsights && data.dropOffInsights.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                    <span>Module Drop-Off Curve</span>
                  </h4>
                  <div className="space-y-2">
                    {data.dropOffInsights.map((d, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{d.moduleTitle}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {d.completionPercentage}% Completion
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{d.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            AI interpretations assist teaching decisions; platform records remain unchanged.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerCourseAiInsightsModal;
