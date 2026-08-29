import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg border transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 hover:border-slate-600 shadow-xs'
          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 shadow-xs'
      } ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 shrink-0" />
      )}
    </button>
  );
};

export default ThemeToggle;
