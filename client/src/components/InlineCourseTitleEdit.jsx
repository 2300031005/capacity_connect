import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';
import { updateCourseTitleApi } from '../services/api';

const InlineCourseTitleEdit = ({
  courseId,
  initialTitle = '',
  onTitleUpdated,
  onNotify,
  className = '',
  headingSize = 'text-xl sm:text-2xl',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setTitle(initialTitle);
    setValidationError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitle(initialTitle);
    setValidationError('');
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setValidationError('Course title cannot be empty.');
      return;
    }

    if (trimmed === initialTitle.trim()) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setValidationError('');

    try {
      const response = await updateCourseTitleApi(courseId, trimmed);
      if (response && response.success) {
        setIsEditing(false);
        if (onTitleUpdated) {
          onTitleUpdated(trimmed, response.data);
        }
        if (onNotify) {
          onNotify({
            type: 'success',
            message: `Course renamed to "${trimmed}"`,
          });
        }
      } else {
        throw new Error(response?.message || 'Failed to rename course');
      }
    } catch (err) {
      console.error('Failed to update course title:', err);
      const errMsg = err.response?.data?.message || err.message || 'Error updating course title';
      setValidationError(errMsg);
      if (onNotify) {
        onNotify({
          type: 'error',
          message: errMsg,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`space-y-1 ${className}`}>
        <form
          onSubmit={handleSave}
          className="flex flex-wrap items-center gap-2 max-w-2xl"
          noValidate
        >
          <div className="relative flex-1 min-w-[240px]">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              onKeyDown={handleKeyDown}
              disabled={saving}
              placeholder="Enter course name..."
              className={`w-full px-3 py-1.5 ${headingSize} font-bold text-slate-900 bg-white border-2 rounded-lg shadow-xs focus:outline-none transition-all ${
                validationError
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                  : 'border-emerald-500 focus:ring-2 focus:ring-emerald-100'
              }`}
              maxLength={150}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              title="Save course title (Enter)"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
              title="Cancel editing (Esc)"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </form>

        {validationError && (
          <p className="text-[11px] font-semibold text-rose-600 pl-1 animate-fadeIn">
            {validationError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`group inline-flex items-center gap-2.5 max-w-full ${className}`}>
      <h1
        className={`${headingSize} font-bold text-slate-900 tracking-tight break-words`}
        title={initialTitle}
      >
        {initialTitle || 'Untitled Course'}
      </h1>

      <button
        type="button"
        onClick={handleStartEdit}
        className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        title="Click to edit course name"
        aria-label="Edit course name"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default InlineCourseTitleEdit;
