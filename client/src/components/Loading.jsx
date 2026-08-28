import React from 'react';

const Loading = ({ message = 'Loading...', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  };

  return (
    <div className={`flex items-center justify-center gap-3 py-4 text-slate-600 ${className}`}>
      <div
        className={`animate-spin rounded-full border-slate-300 border-t-emerald-600 ${sizeClasses[size] || sizeClasses.md}`}
      />
      {message && <span className="text-sm font-medium">{message}</span>}
    </div>
  );
};

export default Loading;
