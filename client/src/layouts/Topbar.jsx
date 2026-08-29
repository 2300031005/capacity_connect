import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { Menu, LogOut, User, ChevronDown, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  const roleLabelMap = {
    trainee: 'Trainee',
    trainer: 'Trainer',
    admin: 'Administrator',
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const handleViewProfile = () => {
    setProfileOpen(false);
    navigate(`/${user?.role || 'trainee'}/profile`);
  };

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 transition-colors shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Title (Clean layout with generous breathing room, NO top-left collapse icon) */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={onMenuClick}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3 py-1 select-none">
              <img
                src="/logo.svg"
                alt="Cognisphere Capacity Connect"
                className="w-8 h-8 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wider text-white leading-tight">
                  COGNISPHERE
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                  Capacity Connect
                </span>
              </div>
            </div>
          </div>

          {/* Right: Theme Toggle & Interactive Profile Menu Trigger */}
          <div className="flex items-center gap-3 relative">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            {/* User Profile Popover Trigger Button */}
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                className={`flex items-center gap-2.5 p-1.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  profileOpen
                    ? 'bg-slate-800 border-slate-700 text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800/80 border-transparent hover:border-slate-800 text-slate-200'
                }`}
                title="Account Menu"
              >
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-blue-500/40">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover rounded-lg"
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

                {/* User Name & Role */}
                <div className="hidden sm:block text-left pr-1">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 capitalize block">
                    {roleLabelMap[user?.role] || user?.role || 'Trainee'}
                  </span>
                </div>

                {/* Chevron indicator */}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    profileOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Profile Popover / Dropdown Menu */}
              {profileOpen && (
                <div
                  ref={popoverRef}
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn divide-y divide-slate-800"
                >
                  {/* Account Header Info */}
                  <div className="p-4 bg-slate-950/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/40">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@capacityconnect.gov'}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-blue-950 text-blue-300 border border-blue-800/80">
                          {roleLabelMap[user?.role] || user?.role || 'Trainee'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={handleViewProfile}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>View Profile</span>
                    </button>
                  </div>

                  {/* Logout Action */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
