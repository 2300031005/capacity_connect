import React from 'react';

const Loading = ({ message = 'Loading...', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  };

  return (
    <div className={`flex items-center justify-center gap-3 py-6 text-slate-600 dark:text-slate-300 ${className}`}>
      <div
        className={`animate-spin rounded-full border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 ${
          sizeClasses[size] || sizeClasses.md
        }`}
      />
      {message && <span className="text-xs sm:text-sm font-medium">{message}</span>}
    </div>
  );
};

export default Loading;
