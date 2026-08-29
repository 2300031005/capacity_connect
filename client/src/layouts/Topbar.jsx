import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { Menu, LogOut, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const Topbar = ({ onMenuClick, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabelMap = {
    trainee: 'Trainee',
    trainer: 'Trainer',
    admin: 'Administrator',
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Collapse Button / Mobile Menu Trigger + Brand */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={onMenuClick}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Toggle */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.svg"
                alt="Capacity Connect Logo"
                className="w-8 h-8 object-contain"
              />
              <div className="hidden sm:block">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
                  COGNISPHERE
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider block uppercase">
                  Capacity Connect
                </span>
              </div>
            </div>
          </div>

          {/* Right: Theme Toggle, User Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* User Profile Link */}
            <Link
              to={`/${user?.role || 'trainee'}/profile`}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              title="View my profile"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs shrink-0 group-hover:border-slate-400 dark:group-hover:border-slate-500 transition-colors">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                ) : user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 capitalize block">
                  {roleLabelMap[user?.role] || user?.role || 'Trainee'}
                </span>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 transition-colors"
              title="Logout session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
