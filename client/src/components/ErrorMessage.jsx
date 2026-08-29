import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-xs sm:text-sm flex items-start justify-between gap-3 shadow-2xs transition-colors ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-bold text-red-700 dark:text-red-400 underline hover:text-red-900 dark:hover:text-red-200 ml-auto whitespace-nowrap cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
