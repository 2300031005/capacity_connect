import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { Menu, X, ArrowRight, LayoutDashboard, LogOut, User } from 'lucide-react';

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (!isHome) {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleDashboardMap = {
    trainee: '/trainee/dashboard',
    trainer: '/trainer/dashboard',
    admin: '/admin/dashboard',
  };

  const userDashboard = user?.role ? roleDashboardMap[user.role] : '/login';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] transition-colors">
      {/* Top Navigation */}
      <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="Capacity Connect Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
                  CAPACITY CONNECT
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-normal block">
                  Digital Capacity Building & Learning Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Ordered by page sequence) */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('about')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('how-it-works')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('features')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('ai')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
              >
                AI
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('roles')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors text-left"
              >
                Roles
              </button>
            </nav>

            {/* Desktop Right Side CTA / Theme Toggle / Authenticated User Header */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={userDashboard}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>

                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-300">
                      {user.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                    title="Logout session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu & Theme Button */}
            <div className="flex md:hidden items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="block w-full text-left py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="block w-full text-left py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="block w-full text-left py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('features')}
              className="block w-full text-left py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('ai')}
              className="block w-full text-left py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              AI
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('roles')}
              className="block w-full text-left py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Roles
            </button>
            
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <div className="py-2 text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>{user.name}</span>
                    <span className="uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                      {user.role}
                    </span>
                  </div>
                  <Link
                    to={userDashboard}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
                  >
                    Enter Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center py-2 text-sm font-medium text-red-700 border border-red-200 rounded hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-slate-600 dark:text-slate-400 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
            {/* Brand in Footer */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="Capacity Connect Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight block">
                  CAPACITY CONNECT
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Digital Capacity Building & Learning Platform
                </span>
              </div>
            </div>

            {/* Footer Navigation Links */}
            <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
              <button
                type="button"
                onClick={() => handleNavClick('about')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('how-it-works')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('features')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('ai')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                AI
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('roles')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Roles
              </button>
              {isAuthenticated ? (
                <Link to={userDashboard} className="hover:text-slate-900 dark:hover:text-white transition-colors font-semibold">
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Login
                </Link>
              )}
            </nav>
          </div>

          {/* Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
            <p>&copy; 2026 Capacity Connect</p>
            <p>Learn &bull; Assess &bull; Measure &bull; Improve</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
