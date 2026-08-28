import React, { useState, useEffect } from 'react';
import {
  saveModuleQuizApi,
  saveFinalAssessmentApi,
  deleteAssessmentApi,
} from '../services/api';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import {
  X,
  Plus,
  Minus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  Percent,
  FileCheck,
  AlertCircle,
  Layers,
  Maximize2,
  Minimize2,
} from 'lucide-react';

const QuizBuilderModal = ({
  isOpen,
  onClose,
  onSaved,
  type = 'module', // 'module' | 'final'
  moduleId = null,
  courseId,
  moduleTitle = '',
  courseTitle = '',
  initialAssessment = null,
}) => {
  const isFinal = type === 'final';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingPercentage, setPassingPercentage] = useState(60);
  const [status, setStatus] = useState('draft');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (initialAssessment) {
      setTitle(initialAssessment.title || '');
      setPassingPercentage(
        initialAssessment.passingPercentage !== undefined
          ? initialAssessment.passingPercentage
          : isFinal
          ? 60
          : 50
      );
      setStatus(initialAssessment.status || 'draft');
      setQuestions(
        initialAssessment.questions && initialAssessment.questions.length > 0
          ? initialAssessment.questions.map((q) => ({
              _id: q._id,
              questionText: q.questionText || '',
              optionA: q.optionA || '',
              optionB: q.optionB || '',
              optionC: q.optionC || '',
              optionD: q.optionD || '',
              correctOption: (q.correctOption || 'A').toUpperCase(),
              marks: q.marks || 1,
              explanation: q.explanation || '',
            }))
          : [createNewQuestion(1)]
      );
    } else {
      setTitle(isFinal ? `${courseTitle} — Final Assessment` : `${moduleTitle} Quiz`);
      setDescription('');
      setPassingPercentage(isFinal ? 60 : 50);
      setStatus('draft');
      setQuestions([createNewQuestion(1)]);
    }
    setError(null);
  }, [initialAssessment, isFinal, courseTitle, moduleTitle, isOpen]);

  function createNewQuestion(index) {
    return {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      marks: 1,
      explanation: '',
    };
  }

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, createNewQuestion(prev.length + 1)]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) {
      setError('An assessment must have at least 1 question.');
      return;
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, [field]: value } : q))
    );
  };

  const validateForm = (intendedStatus) => {
    if (!title.trim()) {
      setError('Please provide an assessment title.');
      return false;
    }

    const passPct = parseInt(passingPercentage, 10);
    if (isNaN(passPct) || passPct < 0 || passPct > 100) {
      setError('Passing percentage must be between 0% and 100%.');
      return false;
    }

    if (questions.length === 0) {
      setError('Please add at least 1 question.');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} text cannot be empty.`);
        return false;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        setError(`Question ${i + 1} must have all 4 options (A, B, C, D) filled in.`);
        return false;
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correctOption)) {
        setError(`Question ${i + 1} must have a designated correct option (A, B, C, or D).`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (submitStatus) => {
    setError(null);
    if (!validateForm(submitStatus)) return;

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status: submitStatus,
        passingPercentage: parseInt(passingPercentage, 10) || (isFinal ? 60 : 50),
        questions: questions.map((q) => ({
          questionText: q.questionText.trim(),
          optionA: q.optionA.trim(),
          optionB: q.optionB.trim(),
          optionC: q.optionC.trim(),
          optionD: q.optionD.trim(),
          correctOption: q.correctOption,
          marks: Math.max(1, parseInt(q.marks, 10) || 1),
        })),
      };

      if (isFinal) {
        await saveFinalAssessmentApi(courseId, payload);
      } else {
        await saveModuleQuizApi(moduleId, payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialAssessment?._id) return;
    const confirm = window.confirm(
      'Are you sure you want to delete this assessment? All trainee attempts will also be removed.'
    );
    if (!confirm) return;

    setLoading(true);
    try {
      await deleteAssessmentApi(initialAssessment._id);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete assessment.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-3 sm:p-6'
      }`}
    >
      <div
        className={`bg-white shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all duration-200 animate-fadeIn ${
          isFullscreen
            ? 'w-screen h-screen max-w-none max-h-none rounded-none'
            : 'max-w-4xl w-full max-h-[92vh] rounded-2xl'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isFinal ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isFinal ? <FileCheck className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isFinal ? 'Final Course Assessment Builder' : `Module Quiz: ${moduleTitle}`}
              </h2>
              <p className="text-xs text-slate-500">
                Configure MCQ questions, correct answers, and passing criteria.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          <div className="max-w-3xl mx-auto w-full space-y-6">
          {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

          {/* Assessment Title & Description */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assessment Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. React Fundamentals Mastery Assessment"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Instructions / Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Guidelines for learners taking this assessment..."
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              />
            </div>

            {/* Passing Percentage Threshold Configurable by Trainer */}
            <div
              className={`rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                isFinal
                  ? 'bg-indigo-50/60 border-indigo-200'
                  : 'bg-emerald-50/60 border-emerald-200'
              }`}
            >
              <div>
                <span
                  className={`text-xs font-bold flex items-center gap-1.5 ${
                    isFinal ? 'text-indigo-900' : 'text-emerald-900'
                  }`}
                >
                  <Percent
                    className={`w-4 h-4 ${
                      isFinal ? 'text-indigo-600' : 'text-emerald-600'
                    }`}
                  />
                  {isFinal
                    ? 'Final Certification Passing Threshold'
                    : 'Module Quiz Passing Threshold'}
                </span>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isFinal ? 'text-indigo-700' : 'text-emerald-700'
                  }`}
                >
                  {isFinal
                    ? 'Trainees scoring at or above this percentage will graduate and be issued an official Certificate of Completion.'
                    : 'Trainees scoring at or above this percentage will receive a passing grade on this module.'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setPassingPercentage((prev) =>
                      Math.max(0, Math.min(100, (parseInt(prev, 10) || 0) - 5))
                    )
                  }
                  className={`w-7 h-7 rounded border flex items-center justify-center transition-colors ${
                    isFinal
                      ? 'border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-100'
                      : 'border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100'
                  }`}
                  title="Decrease by 5%"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={passingPercentage}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setPassingPercentage('');
                        return;
                      }
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        setPassingPercentage(Math.max(0, Math.min(100, num)));
                      }
                    }}
                    onBlur={() => {
                      if (
                        passingPercentage === '' ||
                        isNaN(parseInt(passingPercentage, 10))
                      ) {
                        setPassingPercentage(isFinal ? 60 : 50);
                      } else {
                        setPassingPercentage(
                          Math.max(0, Math.min(100, parseInt(passingPercentage, 10)))
                        );
                      }
                    }}
                    className={`w-18 px-2 py-1.5 text-xs font-bold border rounded-md bg-white text-center focus:outline-none focus:ring-2 ${
                      isFinal
                        ? 'border-indigo-300 focus:ring-indigo-500 text-indigo-900'
                        : 'border-emerald-300 focus:ring-emerald-500 text-emerald-900'
                    }`}
                  />
                  <span
                    className={`ml-1.5 text-xs font-bold ${
                      isFinal ? 'text-indigo-900' : 'text-emerald-900'
                    }`}
                  >
                    %
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPassingPercentage((prev) =>
                      Math.max(0, Math.min(100, (parseInt(prev, 10) || 0) + 5))
                    )
                  }
                  className={`w-7 h-7 rounded border flex items-center justify-center transition-colors ${
                    isFinal
                      ? 'border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-100'
                      : 'border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100'
                  }`}
                  title="Increase by 5%"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Question List Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  MCQ Questions ({questions.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configure options and select the correct radio answer for automatic grading.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Questions Container */}
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200 rounded-lg p-4 space-y-3 relative group hover:border-slate-300 transition-colors"
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Q{idx + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                        <span>Marks:</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={q.marks}
                          onChange={(e) =>
                            handleQuestionChange(idx, 'marks', parseInt(e.target.value, 10) || 1)
                          }
                          className="w-14 px-2 py-0.5 text-xs font-semibold text-center border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        disabled={questions.length === 1}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <input
                      type="text"
                      required
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                      placeholder={`Enter Question ${idx + 1} prompt...`}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Options (A, B, C, D) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const field = `option${optKey}`;
                      const isCorrect = q.correctOption === optKey;

                      return (
                        <div
                          key={optKey}
                          className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                            isCorrect
                              ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                            <input
                              type="radio"
                              name={`correct-opt-${idx}`}
                              checked={isCorrect}
                              onChange={() => handleQuestionChange(idx, 'correctOption', optKey)}
                              className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span
                              className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {optKey}
                            </span>
                          </label>
                          <input
                            type="text"
                            required
                            value={q[field]}
                            onChange={(e) => handleQuestionChange(idx, field, e.target.value)}
                            placeholder={`Option ${optKey} text`}
                            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Answer Explanation (Optional) */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Answer Explanation <span className="text-slate-400 font-normal">(Optional &bull; displayed to trainee during post-attempt review)</span>
                    </label>
                    <textarea
                      rows={2}
                      maxLength={1000}
                      value={q.explanation || ''}
                      onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                      placeholder="Explain why the designated answer is correct and provide learning context..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors bg-slate-50/50 hover:bg-emerald-50/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Question</span>
            </button>
          </div>
        </div>
      </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-3">
            <div>
              {initialAssessment && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Assessment</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                Save Draft
              </button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={loading}
                disabled={loading}
                onClick={() => handleSubmit('published')}
                className="px-5 text-xs font-bold"
              >
                Publish Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilderModal;
