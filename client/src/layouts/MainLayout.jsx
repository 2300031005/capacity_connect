import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, ArrowRight, LayoutDashboard, LogOut, User } from 'lucide-react';

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-[#dcfce7] selection:text-emerald-950 font-sans">
      {/* SECTION 1 — TOP GOVERNMENT MASTHEAD (Utility Bar - Height 48-52px, IN Badge, larger font) */}
      <div className="w-full bg-[#EA580C] text-white h-12 sm:h-[50px] px-4 sm:px-6 lg:px-8 border-b border-[#d97706]/40 flex items-center justify-between text-[13px] font-bold tracking-wide shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          {/* National Emblem of India */}
          <img
            src="/emblem-india.png"
            alt="Emblem of India"
            className="h-7 sm:h-8 w-auto object-contain select-none"
          />
          <span className="tracking-wider text-xs sm:text-[13px] font-bold uppercase">GOVERNMENT OF INDIA</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#main-content" className="text-xs sm:text-[13px] font-bold hover:underline focus:outline-2 focus:outline-white focus:outline-offset-2">
            {t('skipToMain')}
          </a>
          <span className="text-white/40">|</span>
          <div className="flex items-center gap-1.5">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-bold text-xs sm:text-[13px]"
            >
              <option value="en" className="text-slate-900">English</option>
              <option value="hi" className="text-slate-900">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2 — MAIN NAVIGATION HEADER (Height 64-70px, larger brand logo and title) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs h-16 sm:h-[70px] flex items-center shrink-0">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Logo / Brand (Increased sizing) */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/LOGO-PRAGATI.jpg"
                alt="Pragati Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0"
              />
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-wider text-slate-950 block leading-tight">
                  {t('brandTitle')}
                </span>
                <span className="text-[10px] text-slate-400 font-bold tracking-widest block uppercase leading-none mt-0.5">
                  {t('platformSubtitle')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Increased text to 13px) */}
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-bold uppercase tracking-wider text-slate-600">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className="hover:text-[#613AF5] transition-colors text-left"
              >
                {t('home')}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('about')}
                className="hover:text-[#613AF5] transition-colors text-left"
              >
                {t('about')}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('how-it-works')}
                className="hover:text-[#613AF5] transition-colors text-left"
              >
                {t('howItWorks')}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('features')}
                className="hover:text-[#613AF5] transition-colors text-left"
              >
                {t('features')}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('ai')}
                className="hover:text-[#613AF5] transition-colors text-left"
              >
                {t('aiEcosystem')}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('roles')}
                className="hover:text-[#613AF5] transition-colors text-left"
              >
                {t('roles')}
              </button>
            </nav>

            {/* Desktop Right Side CTA / Authenticated User */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={userDashboard}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold bg-[#613AF5] hover:bg-[#4c2cd4] text-white rounded-md transition-colors shadow-xs"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t('workspace')}</span>
                  </Link>

                  <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200 text-xs">
                    <span className="font-extrabold text-slate-900">{user.name}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-[10px] font-bold uppercase text-indigo-700 border border-indigo-100">
                      {user.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Logout session"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-[13px] font-bold uppercase tracking-wider text-slate-700 hover:text-[#613AF5] transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-[13px] font-bold uppercase tracking-wider bg-[#613AF5] hover:bg-[#4c2cd4] text-white rounded-md transition-all shadow-xs hover:shadow-sm"
                  >
                    {t('getStarted')} &rarr;
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded text-slate-600 hover:text-slate-950 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg absolute top-16 left-0 right-0 z-50">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="block w-full text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-[#613AF5]"
            >
              {t('home')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="block w-full text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-[#613AF5]"
            >
              {t('about')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="block w-full text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-[#613AF5]"
            >
              {t('howItWorks')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('features')}
              className="block w-full text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-[#613AF5]"
            >
              {t('features')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('ai')}
              className="block w-full text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-[#613AF5]"
            >
              {t('aiEcosystem')}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('roles')}
              className="block w-full text-left py-2.5 text-sm font-semibold text-slate-700 hover:text-[#613AF5]"
            >
              {t('roles')}
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
                    className="w-full text-center py-3 text-xs font-bold uppercase tracking-wider bg-[#613AF5] text-white rounded hover:bg-[#4c2cd4]"
                  >
                    {t('workspace')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center py-3 text-xs font-bold uppercase tracking-wider text-rose-600 border border-rose-200 rounded hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 text-xs font-bold uppercase tracking-wider text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 text-xs font-bold uppercase tracking-wider bg-[#613AF5] text-white rounded hover:bg-[#4c2cd4]"
                  >
                    {t('getStarted')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* SECTION 9 — FOOTER (More spacious typography and columns) */}
      <footer className="border-t border-slate-200 bg-white py-16 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-10 border-b border-slate-100">
            {/* Brand column */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/LOGO-PRAGATI.jpg"
                  alt="Pragati Logo"
                  className="w-10 h-10 object-contain shrink-0"
                />
                <span className="font-extrabold text-lg sm:text-xl tracking-wider text-slate-900 block leading-tight">
                  {t('brandTitle')}
                </span>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Empowering organizations through verifiable upskilling, standardized skill taxonomies, and AI-enabled competency tracking.
              </p>
            </div>

            {/* Quick links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">{t('features')}</h4>
              <ul className="space-y-3 text-[13px]">
                <li>
                  <button type="button" onClick={() => handleNavClick('about')} className="hover:text-[#613AF5] transition-colors">About Us</button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('how-it-works')} className="hover:text-[#613AF5] transition-colors">Methodology</button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('features')} className="hover:text-[#613AF5] transition-colors">Platform Capabilities</button>
                </li>
              </ul>
            </div>

            {/* AI Layer */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">AI Intelligence</h4>
              <ul className="space-y-3 text-[13px]">
                <li>
                  <button type="button" onClick={() => handleNavClick('ai')} className="hover:text-[#613AF5] transition-colors">AI Learning Advisor</button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('ai')} className="hover:text-[#613AF5] transition-colors">Contextual Q&A Chat</button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('ai')} className="hover:text-[#613AF5] transition-colors">Trainer Insights</button>
                </li>
              </ul>
            </div>

            {/* Roles */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Stakeholders</h4>
              <ul className="space-y-3 text-[13px]">
                <li>
                  <button type="button" onClick={() => handleNavClick('roles')} className="hover:text-[#613AF5] transition-colors">Trainee space</button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('roles')} className="hover:text-[#613AF5] transition-colors">Trainer center</button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNavClick('roles')} className="hover:text-[#613AF5] transition-colors">Administrator panel</button>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright & bottom text */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-[13px] text-slate-400">
            <p className="font-semibold text-slate-500">{t('copyrightText')}</p>
            <p className="font-bold text-[#613AF5] tracking-widest uppercase">Learn &bull; Assess &bull; Measure &bull; Improve</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
