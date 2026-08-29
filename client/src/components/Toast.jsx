import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-900/95 text-white border-emerald-700',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
      title: 'Success',
    },
    error: {
      bg: 'bg-rose-900/95 text-white border-rose-700',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
      title: 'Error',
    },
    warning: {
      bg: 'bg-amber-900/95 text-white border-amber-700',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
      title: 'Notice',
    },
    info: {
      bg: 'bg-slate-900/95 text-white border-slate-700',
      icon: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
      title: 'Info',
    },
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md w-full px-4 sm:px-0">
      <div
        className={`flex items-start gap-3 p-3.5 rounded-xl shadow-2xl border backdrop-blur-md transition-all ${current.bg}`}
        role="alert"
      >
        <div className="mt-0.5">{current.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-snug">{message}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/60 hover:text-white rounded hover:bg-white/10 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
