import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';

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
    <header className="bg-white border-b border-[#D7E0E7] sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={onMenuClick}
              className="p-2 rounded text-[#526575] hover:text-[#172B3A] hover:bg-[#F7F9FB] md:hidden"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3 py-1 select-none">
              <img
                src="/LOGO-PRAGATI.jpg"
                alt="PRAGATI Logo"
                className="w-8 h-8 object-contain rounded"
              />
              <span className="font-bold text-base tracking-tight text-[#0B3D62] hidden sm:inline">
                PRAGATI
              </span>
            </div>
          </div>

          {/* Right: User Info, Home Link & Logout */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-medium text-[#526575] hover:text-[#005A8D] hidden md:inline-flex items-center gap-1"
            >
              <span>Public Portal ↗</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* User Profile info link */}
            <Link
              to={`/${user?.role || 'trainee'}/profile`}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#F7F9FB] transition-colors group"
              title="View my profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#F7F9FB] border border-[#D7E0E7] overflow-hidden flex items-center justify-center text-[#172B3A] font-bold text-xs shrink-0 group-hover:border-[#005A8D] transition-colors">
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
                <span className="text-xs font-bold text-[#172B3A] block leading-tight group-hover:text-[#005A8D] transition-colors">
                  {user?.name || 'User'}
                </span>
                <span className="text-[11px] text-[#526575] capitalize">
                  {roleLabelMap[user?.role] || user?.role || 'Trainee'}
                </span>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-[#526575] hover:text-red-700 hover:bg-red-50 border border-[#D7E0E7] hover:border-red-200 transition-colors ml-2"
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
