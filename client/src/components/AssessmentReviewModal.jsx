import React, { useState, useEffect } from 'react';
import { getAssessmentAttemptReviewApi } from '../services/api';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Award,
  Calendar,
  Layers,
  FileCheck,
  AlertCircle,
  Info,
} from 'lucide-react';

const AssessmentReviewModal = ({ isOpen, onClose, attemptId }) => {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiModalQuestion, setAiModalQuestion] = useState(null);

  useEffect(() => {
    if (!isOpen || !attemptId) {
      setReviewData(null);
      return;
    }

    const fetchReview = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAssessmentAttemptReviewApi(attemptId);
        if (response && response.success) {
          setReviewData(response.data);
        } else {
          throw new Error(response?.message || 'Failed to load assessment review');
        }
      } catch (err) {
        console.error('Error fetching assessment review:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load assessment review.');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [isOpen, attemptId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {reviewData?.assessmentTitle || 'Assessment Result Review'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {reviewData?.courseTitle} {reviewData?.moduleTitle ? `&bull; ${reviewData.moduleTitle}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loading message="Loading question-by-question review & explanations..." />
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : reviewData ? (
            <>
              {/* Top Score Summary Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  reviewData.passed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-red-50/70 border-red-200 text-red-950'
                }`}
              >
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      reviewData.passed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {reviewData.percentage}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {reviewData.passed ? 'Assessment Passed' : 'Assessment Not Passed'}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          reviewData.passed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {reviewData.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Score: <strong>{reviewData.score} / {reviewData.totalMarks} marks</strong> &bull; Passing threshold: {reviewData.passingPercentage}%
                    </p>
                  </div>
                </div>

                {/* Question Counts Summary */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="text-center px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Correct</span>
                    <strong className="text-emerald-700">{reviewData.correctCount}</strong>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Incorrect</span>
                    <strong className="text-red-700">{reviewData.incorrectCount}</strong>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Total</span>
                    <strong className="text-slate-800">{reviewData.totalQuestions}</strong>
                  </div>
                </div>
              </div>

              {/* Questions Review List */}
              <div className="space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question-by-Question Breakdown
                </h3>

                {reviewData.questions.map((q) => {
                  const isCorrect = q.isCorrect;
                  return (
                    <div
                      key={q.questionId || q.questionIndex}
                      className={`p-4 rounded-xl border transition-all ${
                        isCorrect
                          ? 'bg-white border-slate-200 shadow-2xs'
                          : 'bg-white border-red-200 shadow-2xs'
                      }`}
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5 ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            Q{q.questionIndex}
                          </span>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">
                              {q.questionText}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              isCorrect
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Correct (+{q.marksAwarded} pt)</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-red-600" />
                                <span>Incorrect (0 pt)</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                        {[
                          { key: 'A', text: q.optionA },
                          { key: 'B', text: q.optionB },
                          { key: 'C', text: q.optionC },
                          { key: 'D', text: q.optionD },
                        ].map((opt) => {
                          const isSelected = q.selectedOption === opt.key;
                          const isTargetCorrect = q.correctOption === opt.key;

                          let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                          if (isSelected && isTargetCorrect) {
                            optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                          } else if (isSelected && !isTargetCorrect) {
                            optionStyle = 'bg-red-50 border-red-400 text-red-950 font-semibold ring-1 ring-red-300';
                          } else if (!isSelected && isTargetCorrect) {
                            optionStyle = 'bg-emerald-50/50 border-emerald-300 text-emerald-900 border-dashed';
                          }

                          return (
                            <div
                              key={opt.key}
                              className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                                    isTargetCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : isSelected
                                      ? 'bg-red-600 text-white'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <span>{opt.text}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                {isSelected && (
                                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/80 border border-slate-300 text-slate-600">
                                    Your Choice
                                  </span>
                                )}
                                {isTargetCorrect && (
                                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Section */}
                      {q.explanation && (
                        <div className="mt-3 p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px]">
                            <Info className="w-3.5 h-3.5 text-blue-600" />
                            <span>Instructor's Explanation</span>
                          </div>
                          <p className="text-slate-700 text-[11px] leading-relaxed">{q.explanation}</p>
                        </div>
                      )}

                      {/* Phase 7 AI Integration Hook */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 italic">
                          {isCorrect ? 'Well done!' : 'Need additional clarification?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAiModalQuestion(q)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Explain with AI</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Review
          </button>
        </div>
      </div>

      {/* Phase 7 AI Explanation Modal Hook */}
      {aiModalQuestion && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI Tutor Explanation</span>
              </div>
              <button
                type="button"
                onClick={() => setAiModalQuestion(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-lg space-y-2 text-xs text-slate-700">
              <p className="font-semibold text-purple-900">
                Phase 7 AI Learning Integration Point
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                In <strong>Phase 7 (AI Integration)</strong>, this button will dispatch question context, your selected answer (<strong className="font-mono">{aiModalQuestion.selectedOption || 'None'}</strong>), and the correct answer (<strong className="font-mono">{aiModalQuestion.correctOption}</strong>) to an intelligent tutoring agent to provide personalized, concept-level remediation!
              </p>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setAiModalQuestion(null)}
                className="px-4 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentReviewModal;
