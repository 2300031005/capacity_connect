import React, { useState } from 'react';
import { submitAssessmentAttemptApi } from '../services/api';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Download,
  FileCheck,
  Sparkles,
} from 'lucide-react';

const QuizTakeModal = ({
  isOpen,
  onClose,
  assessment,
  courseTitle = '',
  onCompleted,
}) => {
  const isFinal = assessment?.type === 'final';
  const questions = assessment?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: 'A' | 'B' | 'C' | 'D' }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // stores server evaluation result

  if (!isOpen || !assessment) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (questionId, optionKey) => {
    if (result) return; // cannot change after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        answers: Object.keys(selectedAnswers).map((qId) => ({
          questionId: qId,
          selectedOption: selectedAnswers[qId],
        })),
      };

      const response = await submitAssessmentAttemptApi(assessment._id, payload);
      if (response && response.success) {
        if (onCompleted) {
          onCompleted(response.data);
        }
        onClose();
      } else {
        throw new Error(response?.message || 'Failed to evaluate assessment');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error submitting assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setError(null);
  };

  const downloadCertUrl = result?.certificate
    ? `http://localhost:5002/${result.certificate.filePath}`
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isFinal ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isFinal ? <FileCheck className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{assessment.title}</h2>
              <p className="text-xs text-slate-500">
                {isFinal
                  ? `Comprehensive Final Assessment • Pass Threshold: ${assessment.passingPercentage || 60}%`
                  : 'Module Knowledge Check'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

          {/* ====================================================
              VIEW 1: RESULT EVALUATION VIEW (AFTER SUBMISSION)
              ==================================================== */}
          {result ? (
            <div className="space-y-6">
              {/* Outcome Banner */}
              <div
                className={`p-6 rounded-xl border text-center space-y-3 ${
                  result.attempt.passed
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-red-50/80 border-red-300 text-red-950'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                    result.attempt.passed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {result.attempt.passed ? (
                    isFinal ? (
                      <Sparkles className="w-8 h-8 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-8 h-8" />
                    )
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold">
                    {result.attempt.passed
                      ? isFinal
                        ? 'Congratulations! Final Assessment Passed'
                        : 'Module Quiz Passed & Completed!'
                      : isFinal
                      ? 'Final Assessment Not Passed'
                      : 'Quiz Completed'}
                  </h3>
                  <p className="text-xs mt-1 text-slate-600">
                    {isFinal
                      ? result.attempt.passed
                        ? 'You have successfully satisfied the graduation criteria. Your official Certificate of Completion is ready!'
                        : `You scored ${result.attempt.percentage}%. The minimum passing threshold is ${
                            assessment.passingPercentage || 60
                          }%. You may retake the assessment.`
                      : 'Your module progress has been updated in the course syllabus.'}
                  </p>
                </div>

                {/* Score Pills */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Score</span>
                    <strong className="text-base font-bold text-slate-900">
                      {result.attempt.score} / {result.attempt.totalMarks}
                    </strong>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Percentage</span>
                    <strong
                      className={`text-base font-bold ${
                        result.attempt.passed ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {result.attempt.percentage}%
                    </strong>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Status</span>
                    <strong
                      className={`text-base font-bold uppercase text-xs ${
                        result.attempt.passed ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {result.attempt.passed ? 'Passed' : 'Failed'}
                    </strong>
                  </div>
                </div>

                {/* Certificate Action Banner (If Passed Final Assessment) */}
                {result.certificate && (
                  <div className="bg-white border border-emerald-300 rounded-lg p-4 mt-4 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                          Certificate Issued
                        </span>
                        <strong className="text-xs font-bold text-slate-900">
                          {result.certificate.certificateId}
                        </strong>
                      </div>
                    </div>

                    <a
                      href={downloadCertUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Certificate</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Answers Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Performance Breakdown ({result.attempt.answers?.length || 0} Questions)
                </h4>

                <div className="space-y-3">
                  {result.attempt.answers?.map((ans, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                        ans.isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-red-50/40 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {ans.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          )}
                          <span>
                            Q{idx + 1}: {ans.questionText}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 flex-shrink-0">
                          {ans.marksAwarded} Marks
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pl-5.5">
                        <p className="text-slate-600">
                          Your choice:{' '}
                          <strong
                            className={ans.isCorrect ? 'text-emerald-700' : 'text-red-700'}
                          >
                            Option {ans.selectedOption || 'None'}
                          </strong>
                        </p>
                        <p className="text-slate-600">
                          Correct answer:{' '}
                          <strong className="text-emerald-700">Option {ans.correctOption}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ====================================================
                VIEW 2: QUESTION TAKING STEPPER
                ==================================================== */
            <div className="space-y-6">
              {/* Question Navigation Chips */}
              <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-100 pb-3">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(selectedAnswers[q._id]);
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q._id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-7 h-7 rounded text-xs font-mono font-bold transition-all flex items-center justify-center ${
                        isCurrent
                          ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-1'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Active Question Prompt */}
              {currentQ && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                      Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {currentQ.marks || 1} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {currentQ.questionText}
                  </h3>

                  {/* 4 MCQ Radio Option Cards */}
                  <div className="space-y-2.5 pt-2">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optionText = currentQ[`option${optKey}`];
                      const isSelected = selectedAnswers[currentQ._id] === optKey;

                      return (
                        <div
                          key={optKey}
                          onClick={() => handleSelectOption(currentQ._id, optKey)}
                          className={`p-3.5 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {optKey}
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              isSelected ? 'text-slate-900 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            {optionText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {result ? (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Assessment</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 disabled:opacity-30 inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {!isLastQuestion ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={submitting}
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="px-5 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <span>Submit Assessment</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTakeModal;
