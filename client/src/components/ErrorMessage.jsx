import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded text-sm flex items-start justify-between gap-3 ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold text-red-800 underline hover:text-red-900 ml-auto whitespace-nowrap"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
