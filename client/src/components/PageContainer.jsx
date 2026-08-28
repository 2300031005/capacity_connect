import React from 'react';

const PageContainer = ({ children, title, subtitle, className = '' }) => {
  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6 border-b border-slate-200 pb-4">
          {title && <h1 className="text-2xl font-bold text-slate-900">{title}</h1>}
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer;
