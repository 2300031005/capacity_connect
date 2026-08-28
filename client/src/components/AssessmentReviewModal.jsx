import React, { useState, useEffect } from 'react';
import { getAssessmentAttemptReviewApi, explainAssessmentQuestionApi } from '../services/api';
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
  Lightbulb,
  Target,
  RefreshCw,
} from 'lucide-react';

const AssessmentReviewModal = ({ isOpen, onClose, attemptId }) => {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Explanation State
  const [activeAiQuestion, setActiveAiQuestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiExplanationsMap, setAiExplanationsMap] = useState({}); // { [questionId]: aiExplanationData }

  useEffect(() => {
    if (!isOpen || !attemptId) {
      setReviewData(null);
      setActiveAiQuestion(null);
      setAiExplanationsMap({});
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

  const handleOpenAiExplanation = async (question) => {
    const qId = question.questionId || question._id;
    setActiveAiQuestion(question);
    setAiError(null);

    // If already fetched during this session, use cached result
    if (aiExplanationsMap[qId]) {
      return;
    }

    setAiLoading(true);
    try {
      const response = await explainAssessmentQuestionApi(attemptId, qId);
      if (response && response.success && response.data) {
        setAiExplanationsMap((prev) => ({
          ...prev,
          [qId]: response.data,
        }));
      } else {
        throw new Error(response?.message || 'Failed to generate AI explanation.');
      }
    } catch (err) {
      console.error('Error generating AI explanation:', err);
      setAiError(
        err.response?.data?.message ||
        err.message ||
        'AI explanation is temporarily unavailable. Please try again later.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentAiData = activeAiQuestion
    ? aiExplanationsMap[activeAiQuestion.questionId || activeAiQuestion._id]
    : null;

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

                      {/* Phase 7.1 AI Explanation Action */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 italic">
                          {isCorrect ? 'Great job!' : 'Need personalized conceptual help?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenAiExplanation(q)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors shadow-2xs"
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

      {/* Phase 7.1 Structured AI Explanation Modal */}
      {activeAiQuestion && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[88vh] flex flex-col border border-purple-200 overflow-hidden">
            {/* AI Modal Header */}
            <div className="px-6 py-4 border-b border-purple-100 bg-purple-50/70 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                    <span>AI Tutor Explanation</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-200/80 text-purple-800">
                      Phase 7.1 AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-purple-700">
                    Question {activeAiQuestion.questionIndex} &bull; Conceptual Remediation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAiQuestion(null)}
                className="p-1.5 text-purple-400 hover:text-purple-800 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Question Context Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Question Prompt
                </span>
                <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                  {activeAiQuestion.questionText}
                </p>
                <div className="flex items-center gap-4 pt-1 text-[11px]">
                  <span className="text-slate-600">
                    Your Selection:{' '}
                    <strong className={activeAiQuestion.isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                      Option {activeAiQuestion.selectedOption || 'None'}
                    </strong>
                  </span>
                  <span className="text-slate-600">
                    Correct Option:{' '}
                    <strong className="text-emerald-700">Option {activeAiQuestion.correctOption}</strong>
                  </span>
                </div>
              </div>

              {aiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-purple-900">
                    AI is analyzing your answer and synthesizing conceptual feedback...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Evaluating question choices & instructor context
                  </p>
                </div>
              ) : aiError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 text-red-900">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>AI Explanation Notice</span>
                  </div>
                  <p className="text-xs text-red-800">{aiError}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenAiExplanation(activeAiQuestion)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Request</span>
                  </button>
                </div>
              ) : currentAiData?.aiExplanation ? (
                <div className="space-y-3.5 animate-fadeIn">
                  {/* High Level Explanation */}
                  <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Executive Explanation</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {currentAiData.aiExplanation.explanation}
                    </p>
                  </div>

                  {/* Why Your Answer Was Right / Wrong */}
                  {currentAiData.isCorrect ? (
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Why Your Answer Was Correct</span>
                      </div>
                      <p className="text-emerald-950 leading-relaxed">
                        {currentAiData.aiExplanation.whyYourAnswerWasCorrect}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        <span>Why Your Selection Was Incorrect</span>
                      </div>
                      <p className="text-amber-950 leading-relaxed">
                        {currentAiData.aiExplanation.whyYourAnswerWasWrong}
                      </p>
                    </div>
                  )}

                  {/* Correct Concept */}
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Core Concept to Master</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {currentAiData.aiExplanation.correctConcept}
                    </p>
                  </div>

                  {/* Key Takeaway & Study Tip Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Key Takeaway</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {currentAiData.aiExplanation.keyTakeaway}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                        <Target className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recommended Study Tip</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {currentAiData.aiExplanation.studyTip}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* AI Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveAiQuestion(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentReviewModal;

