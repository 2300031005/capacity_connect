import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, ExternalLink, User } from 'lucide-react';

const Topbar = ({ onMenuClick }) => {
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu Trigger + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="p-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/logo.svg"
                alt="Capacity Connect Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-base tracking-tight text-slate-900 hidden sm:inline">
                CAPACITY CONNECT
              </span>
            </Link>
          </div>

          {/* Right: User Info, Home Link & Logout */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 hidden md:inline-flex items-center gap-1"
            >
              <span>Public Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

            {/* User Profile info link */}
            <Link
              to={`/${user?.role || 'trainee'}/profile`}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors group"
              title="View my profile"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-xs shrink-0 group-hover:border-slate-400 transition-colors">
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
                <span className="text-xs font-bold text-slate-900 block leading-tight group-hover:text-blue-600 transition-colors">
                  {user?.name || 'User'}
                </span>
                <span className="text-[11px] text-slate-500 capitalize">
                  {roleLabelMap[user?.role] || user?.role || 'Trainee'}
                </span>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-700 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors ml-2"
              title="Logout session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
