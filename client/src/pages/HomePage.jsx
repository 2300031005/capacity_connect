import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Sparkles, 
  User, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight,
  Layers,
  FileCheck,
  BarChart3,
  Bell,
  Brain,
  HelpCircle,
  Award,
  Compass,
  ArrowDown,
  Info,
  ChevronRight,
  Zap,
  Globe,
  Milestone
} from 'lucide-react';

const HomePage = () => {
  const { t } = useLanguage();

  // Spotlight Cursor Interaction States
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const heroRef = useRef(null);

  // Monitor accessibility reduced-motion query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mock Active Announcement List for updates section
  const announcements = [
    {
      category: 'System Update',
      title: 'Adaptive AI Learning Engine v2.4 successfully deployed.',
      date: '28 Aug 2026',
      status: 'Active',
      tag: 'New'
    },
    {
      category: 'Assessment Gating',
      title: 'Anti-cheat sanitization protocols expanded for all final competency exams.',
      date: '24 Aug 2026',
      status: 'Active',
      tag: 'Security'
    },
    {
      category: 'Competency Framework',
      title: '30+ standardized skill rubrics added in cooperation with technical advisors.',
      date: '18 Aug 2026',
      status: 'Archived',
      tag: 'Curriculum'
    }
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* ==================================================
          SECTION 3 — HERO (Expanded Layout, Grid & Spotlight)
          ================================================== */}
      <section 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[85vh] sm:min-h-[580px] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 sm:py-28 overflow-hidden border-b border-slate-200"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(11, 61, 98, 0.04) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(11, 61, 98, 0.04) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
        }}
      >
        {/* Cursor Following Spotlight */}
        {!prefersReducedMotion && (
          <div
            className="absolute inset-0 pointer-events-none opacity-25 transition-transform duration-200 ease-out"
            style={{
              background: `radial-gradient(600px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(11, 61, 98, 0.18), transparent 80%)`,
            }}
          />
        )}

        {/* Small category badge (Increased scale - Saffron accent) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-extrabold uppercase tracking-wider bg-orange-50 text-[#E8751A] border border-orange-100 mb-8 animate-pulse select-none">
          <Sparkles className="w-4 h-4 text-[#E8751A]" />
          <span>{t('aiBadge')}</span>
        </div>

        {/* Brand visual emphasis (Enlarged to 36-48px equivalent - Subtle Blue gradient) */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[0.2em] mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0B3D62] to-[#005A8D]">
            {t('brandTitle')}
          </span>
        </h2>

        {/* Main centered heading (Enlarged to 48px-56px equivalent, line height 1.1) */}
        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#172B3A] max-w-5xl leading-[1.1] mb-8">
          {t('heroHeading1')}<br />
          {t('heroHeading2')}
        </h1>

        {/* Supporting description (Enlarged to 16px-17px equivalent) */}
        <p className="text-base sm:text-lg lg:text-xl text-[#526575] max-w-3xl mx-auto leading-relaxed mb-10">
          {t('heroDesc')}
        </p>

        {/* CTA Buttons (Enlarged height to 48px) */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-4 text-[13px] sm:text-sm font-bold uppercase tracking-wider bg-[#005A8D] hover:bg-[#0B3D62] text-white rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 inline-flex items-center gap-2 h-12 sm:h-[50px] shrink-0"
          >
            <span>{t('getStarted')} &rarr;</span>
          </Link>
          <button
            type="button"
            onClick={() => scrollToSection('about')}
            className="px-8 py-4 text-[13px] sm:text-sm font-bold uppercase tracking-wider bg-white hover:bg-slate-50 text-[#005A8D] border border-[#005A8D] rounded-md shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 h-12 sm:h-[50px] shrink-0"
          >
            {t('explorePlatform')}
          </button>
        </div>

        {/* Floating Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <button 
            type="button" 
            onClick={() => scrollToSection('about')}
            className="p-2 text-slate-400 hover:text-[#005A8D]"
            title="Scroll Down"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* ==================================================
          SECTION 4 — ABOUT (Overview & Visual Rhythm - Expanded max-w)
          ================================================== */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left info content (Enlarged headings and spacing) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#E8751A]">{t('curriculumStandard')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-[34px] font-extrabold tracking-tight text-[#172B3A] leading-tight">
              {t('continuousCapacityTitle')}
            </h2>
            <p className="text-sm sm:text-base text-[#526575] leading-relaxed">
              {t('aboutDesc1')}
            </p>
            <p className="text-xs sm:text-sm text-[#526575] leading-relaxed">
              {t('aboutDesc2')}
            </p>
            <div className="pt-2">
              <button 
                type="button" 
                onClick={() => scrollToSection('how-it-works')}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#005A8D] hover:underline"
              >
                <span>{t('readMethodology')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right info widget: Mapped Transcript Preview Card (Spacious layout) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs space-y-5 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-[#005A8D]" />
                  <span className="text-xs font-bold text-[#172B3A] uppercase tracking-wider">
                    {t('verifiedSkillTranscript')}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-[#16834B] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  {t('proofOfWork')}
                </span>
              </div>

              {/* Progress bars preview */}
              <div className="space-y-4 text-[13px]">
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">{t('TypeScript Development')}</span>
                    <span className="text-[#16834B]">{t('Advanced Verified')}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#16834B] rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">{t('REST API Design')}</span>
                    <span className="text-[#16834B]">{t('Proficient Verified')}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#16834B] rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">{t('Machine Learning')}</span>
                    <span className="text-[#526575]">{t('In Progress')}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E8751A] rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>

              {/* Verification Info */}
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{t('uniqueCredId')}</span>
                <span className="font-mono font-semibold text-slate-600">CC-2026-F98D2E</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 7 — ROLES (Choose your role - Expanded height and padding)
          ================================================== */}
      <section id="roles" className="w-full bg-[#F7F9FB] py-20 sm:py-24 border-y border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-slate-200 pb-5 mb-12 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-[34px] font-extrabold tracking-tight text-[#172B3A] leading-tight">
              {t('chooseRoleTitle')}
            </h2>
            <p className="text-sm sm:text-base text-[#526575] mt-2">
              {t('chooseRoleSub')}
            </p>
          </div>

          {/* Grid of 3 white cards (Increased scale) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* TRAINEE CARD */}
            <div className="bg-white border border-slate-200 hover:border-[#005A8D]/60 rounded-xl p-8 sm:p-9 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#005A8D] flex items-center justify-center mb-5 group-hover:bg-[#005A8D] group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#172B3A] tracking-tight uppercase">{t('traineeSpace')}</h3>
                <p className="text-[11px] font-bold text-[#005A8D] uppercase tracking-wider mt-1 mb-4">{t('traineeSlogan')}</p>
                <p className="text-[13px] sm:text-sm text-[#526575] leading-relaxed mb-6">
                  {t('traineeDesc')}
                </p>
              </div>
              <Link 
                to="/login"
                className="w-full text-center py-3 border border-slate-200 hover:border-[#005A8D] hover:bg-[#005A8D]/5 text-[#005A8D] font-bold text-xs sm:text-[13px] rounded-md uppercase tracking-wider transition-colors"
              >
                {t('accessTrainee')}
              </Link>
            </div>

            {/* TRAINER CARD */}
            <div className="bg-white border border-slate-200 hover:border-[#005A8D]/60 rounded-xl p-8 sm:p-9 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16834B] flex items-center justify-center mb-5 group-hover:bg-[#16834B] group-hover:text-white transition-colors">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#172B3A] tracking-tight uppercase">{t('trainerHub')}</h3>
                <p className="text-[11px] font-bold text-[#16834B] uppercase tracking-wider mt-1 mb-4">{t('trainerSlogan')}</p>
                <p className="text-[13px] sm:text-sm text-[#526575] leading-relaxed mb-6">
                  {t('trainerDesc')}
                </p>
              </div>
              <Link 
                to="/login"
                className="w-full text-center py-3 border border-slate-200 hover:border-[#005A8D] hover:bg-[#005A8D]/5 text-[#005A8D] font-bold text-xs sm:text-[13px] rounded-md uppercase tracking-wider transition-colors"
              >
                {t('accessTrainer')}
              </Link>
            </div>

            {/* ADMINISTRATOR CARD */}
            <div className="bg-white border border-slate-200 hover:border-[#005A8D]/60 rounded-xl p-8 sm:p-9 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#E8751A] flex items-center justify-center mb-5 group-hover:bg-[#E8751A] group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#172B3A] tracking-tight uppercase">{t('platformAdmin')}</h3>
                <p className="text-[11px] font-bold text-[#E8751A] uppercase tracking-wider mt-1 mb-4">{t('adminSlogan')}</p>
                <p className="text-[13px] sm:text-sm text-[#526575] leading-relaxed mb-6">
                  {t('adminDesc')}
                </p>
              </div>
              <Link 
                to="/login"
                className="w-full text-center py-3 border border-slate-200 hover:border-[#005A8D] hover:bg-[#005A8D]/5 text-[#005A8D] font-bold text-xs sm:text-[13px] rounded-md uppercase tracking-wider transition-colors"
              >
                {t('accessAdmin')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 5 — FEATURES (Capabilities - Larger tile structure)
          ================================================== */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="border-b border-slate-200 pb-5 mb-12 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[34px] font-extrabold tracking-tight text-[#172B3A] leading-tight">
            {t('featuresTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[#526575] mt-2">
            {t('featuresSub')}
          </p>
        </div>

        {/* 6 Capabilities Grid (Increased card sizing) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Structured Learning */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#005A8D] flex items-center justify-center mb-4">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#172B3A] tracking-wider">{t('feat1Title')}</h3>
            <p className="text-xs sm:text-[13px] text-[#526575] mt-2.5 leading-relaxed">
              {t('feat1Desc')}
            </p>
          </div>

          {/* Secure Assessments */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-[#16834B] flex items-center justify-center mb-4">
              <FileCheck className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#172B3A] tracking-wider">{t('feat2Title')}</h3>
            <p className="text-xs sm:text-[13px] text-[#526575] mt-2.5 leading-relaxed">
              {t('feat2Desc')}
            </p>
          </div>

          {/* Competency Mapping */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-orange-50 text-[#E8751A] flex items-center justify-center mb-4">
              <Compass className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#172B3A] tracking-wider">{t('feat3Title')}</h3>
            <p className="text-xs sm:text-[13px] text-[#526575] mt-2.5 leading-relaxed">
              {t('feat3Desc')}
            </p>
          </div>

          {/* Real-time Analytics */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#005A8D] flex items-center justify-center mb-4">
              <BarChart3 className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#172B3A] tracking-wider">{t('feat4Title')}</h3>
            <p className="text-xs sm:text-[13px] text-[#526575] mt-2.5 leading-relaxed">
              {t('feat4Desc')}
            </p>
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#0B3D62] flex items-center justify-center mb-4">
              <Target className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#172B3A] tracking-wider">{t('feat5Title')}</h3>
            <p className="text-xs sm:text-[13px] text-[#526575] mt-2.5 leading-relaxed">
              {t('feat5Desc')}
            </p>
          </div>

          {/* PDF Certificate Issuance */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-[#16834B] flex items-center justify-center mb-4">
              <Award className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#172B3A] tracking-wider">{t('feat6Title')}</h3>
            <p className="text-xs sm:text-[13px] text-[#526575] mt-2.5 leading-relaxed">
              {t('feat6Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 23 — LATEST UPDATES / NOTICES (Announcements - Larger text)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-5 mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[34px] font-extrabold tracking-tight text-[#172B3A] leading-tight">
            {t('announcementsTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[#526575] mt-2">
            {t('announcementsSub')}
          </p>
        </div>

        {/* Announcement Container with Blue Corner Brackets */}
        <div className="relative p-8 sm:p-10 bg-[#F7F9FB] border border-slate-200/60 rounded-xl shadow-2xs overflow-hidden">
          {/* Top-Left Bracket */}
          <div className="absolute top-0 left-0 border-t-2 border-l-2 border-[#0B3D62] w-5 h-5" />
          {/* Top-Right Bracket */}
          <div className="absolute top-0 right-0 border-t-2 border-r-2 border-[#0B3D62] w-5 h-5" />
          {/* Bottom-Left Bracket */}
          <div className="absolute bottom-0 left-0 border-b-2 border-l-2 border-[#0B3D62] w-5 h-5" />
          {/* Bottom-Right Bracket */}
          <div className="absolute bottom-0 right-0 border-b-2 border-r-2 border-[#0B3D62] w-5 h-5" />

          {/* List of announcements (Increased padding and font weight) */}
          <div className="divide-y divide-slate-200">
            {announcements.map((ann, index) => (
              <div 
                key={index} 
                className={`py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${index === 0 ? 'pt-0' : ''} ${index === announcements.length - 1 ? 'pb-0' : ''}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-[#526575] tracking-wider">
                      {t(ann.category)}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border tracking-wider ${
                      ann.tag === 'New' 
                        ? 'bg-emerald-50 text-[#16834B] border-emerald-200' 
                        : ann.tag === 'Security' 
                        ? 'bg-rose-50 text-rose-800 border-rose-200' 
                        : 'bg-blue-50 text-[#005A8D] border-blue-200'
                    }`}>
                      {t(ann.tag)}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#172B3A]">
                    {t(ann.title)}
                  </h4>
                </div>
                <div className="flex items-center gap-6 text-sm shrink-0 sm:text-right">
                  <span className="text-xs sm:text-[13px] text-slate-400 font-mono font-medium">{ann.date}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16834B] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16834B]" />
                    <span>{t(ann.status)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 26 — PROGRAM AREAS (Horizontal Cards - Taller cards and text)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-5 mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[34px] font-extrabold tracking-tight text-[#172B3A] leading-tight">
            {t('programsTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[#526575] mt-2">
            {t('programsSub')}
          </p>
        </div>

        {/* snap carousel (Enlarged heights and paddings) */}
        <div className="flex sm:grid sm:grid-cols-4 gap-6 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-0 scrollbar-thin">
          {/* Card 1: Frontend (Institutional Blue) */}
          <div className="bg-gradient-to-br from-[#0B3D62] to-[#172B3A] text-white rounded-xl p-7 min-w-[280px] sm:min-w-0 snap-center shadow-xs flex flex-col justify-between h-48 sm:h-52">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-80">Domain 01</span>
              <h3 className="text-base sm:text-lg font-bold mt-1.5">{t('dom1Title')}</h3>
              <p className="text-xs sm:text-[13px] text-indigo-200 mt-2 leading-relaxed">
                {t('dom1Desc')}
              </p>
            </div>
            <span className="text-xs sm:text-[13px] font-bold underline flex items-center gap-1.5 mt-4 cursor-pointer select-none">
              {t('exploreSkills')}
            </span>
          </div>

          {/* Card 2: Backend (Government Blue) */}
          <div className="bg-gradient-to-br from-[#005A8D] to-[#172B3A] text-white rounded-xl p-7 min-w-[280px] sm:min-w-0 snap-center shadow-xs flex flex-col justify-between h-48 sm:h-52">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-80">Domain 02</span>
              <h3 className="text-base sm:text-lg font-bold mt-1.5">{t('dom2Title')}</h3>
              <p className="text-xs sm:text-[13px] text-blue-200 mt-2 leading-relaxed">
                {t('dom2Desc')}
              </p>
            </div>
            <span className="text-xs sm:text-[13px] font-bold underline flex items-center gap-1.5 mt-4 cursor-pointer select-none">
              {t('exploreSkills')}
            </span>
          </div>

          {/* Card 3: Data & ML (Government Green) */}
          <div className="bg-gradient-to-br from-[#16834B] to-[#172B3A] text-white rounded-xl p-7 min-w-[280px] sm:min-w-0 snap-center shadow-xs flex flex-col justify-between h-48 sm:h-52">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-80">Domain 03</span>
              <h3 className="text-base sm:text-lg font-bold mt-1.5">{t('dom3Title')}</h3>
              <p className="text-xs sm:text-[13px] text-emerald-200 mt-2 leading-relaxed">
                {t('dom3Desc')}
              </p>
            </div>
            <span className="text-xs sm:text-[13px] font-bold underline flex items-center gap-1.5 mt-4 cursor-pointer select-none">
              {t('exploreSkills')}
            </span>
          </div>

          {/* Card 4: Soft Skills (Saffron) */}
          <div className="bg-gradient-to-br from-[#E8751A] to-[#172B3A] text-white rounded-xl p-7 min-w-[280px] sm:min-w-0 snap-center shadow-xs flex flex-col justify-between h-48 sm:h-52">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-80">Domain 04</span>
              <h3 className="text-base sm:text-lg font-bold mt-1.5">{t('dom4Title')}</h3>
              <p className="text-xs sm:text-[13px] text-orange-200 mt-2 leading-relaxed">
                {t('dom4Desc')}
              </p>
            </div>
            <span className="text-xs sm:text-[13px] font-bold underline flex items-center gap-1.5 mt-4 cursor-pointer select-none">
              {t('exploreSkills')}
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 29 — SUPPORTING SECTION (Split layout + Preview panel - Spacing)
          ================================================== */}
      <section id="ai" className="w-full bg-[#F7F9FB] border-y border-[#D7E0E7] py-20 sm:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column info (Increased text sizing and gaps) */}
            <div className="lg:col-span-6 space-y-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-100 text-[#0B3D62] text-xs font-extrabold uppercase border border-blue-200 select-none">
                <Brain className="w-4 h-4 text-[#0B3D62]" />
                <span>{t('aiEcosystemSub')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[34px] font-extrabold tracking-tight text-[#172B3A] leading-tight">
                {t('aiEcosystemTitle')}
              </h2>
              <p className="text-sm sm:text-base text-[#526575] leading-relaxed">
                {t('aiEcosystemDesc')}
              </p>
              
              <ul className="space-y-6 text-[13px] sm:text-sm text-[#172B3A]">
                <li className="flex items-start gap-3.5">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-[#0B3D62] flex items-center justify-center text-xs font-bold shadow-2xs select-none">1</span>
                  <div>
                    <strong className="font-extrabold text-[#172B3A] text-sm sm:text-base block">{t('aiStep1Title')}</strong>
                    <span className="text-[13px] text-[#526575] mt-1 block leading-relaxed">{t('aiStep1Desc')}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-[#0B3D62] flex items-center justify-center text-xs font-bold shadow-2xs select-none">2</span>
                  <div>
                    <strong className="font-extrabold text-[#172B3A] text-sm sm:text-base block">{t('aiStep2Title')}</strong>
                    <span className="text-[13px] text-[#526575] mt-1 block leading-relaxed">{t('aiStep2Desc')}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-[#0B3D62] flex items-center justify-center text-xs font-bold shadow-2xs select-none">3</span>
                  <div>
                    <strong className="font-extrabold text-[#172B3A] text-sm sm:text-base block">{t('aiStep3Title')}</strong>
                    <span className="text-[13px] text-[#526575] mt-1 block leading-relaxed">{t('aiStep3Desc')}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right Column: AI Mock UI Panel (Larger preview details) */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-[#D7E0E7] rounded-2xl p-6 sm:p-8 shadow-md space-y-5 hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between border-b border-[#D7E0E7] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#0B3D62] animate-spin-slow" />
                    <span className="text-xs font-bold text-[#172B3A] uppercase tracking-wider">
                      {t('aiSuggestedNext')}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-[#16834B] border border-emerald-200 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                    {t('priority1')}
                  </span>
                </div>

                {/* Simulated next steps (Increased padding) */}
                <div className="space-y-4">
                  <div className="bg-[#F7F9FB] border border-[#D7E0E7] rounded-xl p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#172B3A] uppercase tracking-wider text-[10px]">
                        {t('activeCourse')}
                      </span>
                      <span className="text-[#005A8D] font-bold text-xs">{t('match88')}</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-[#172B3A]">
                      {t('mockCourseTitle')}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[#526575] leading-relaxed">
                      {t('mockRationale1')}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-[#D7E0E7] text-xs">
                      <span className="text-[#526575] font-medium">{t('mockStatusInProg')}</span>
                      <span className="text-[#005A8D] font-bold cursor-pointer select-none">{t('continueStudy')}</span>
                    </div>
                  </div>

                  <div className="bg-[#F7F9FB] border border-[#D7E0E7] rounded-xl p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#172B3A] uppercase tracking-wider text-[10px]">
                        {t('assessRemediation')}
                      </span>
                      <span className="text-rose-700 font-bold text-xs">{t('actionRequired')}</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-[#172B3A]">
                      {t('mockQuizTitle')}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[#526575] leading-relaxed">
                      {t('mockRationale2')}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-[#D7E0E7] text-xs">
                      <span className="text-[#526575] font-medium">{t('mockScore')}</span>
                      <span className="text-[#005A8D] font-bold cursor-pointer select-none">{t('explainWithAi')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 9 — FINAL CTA (Government Blue Panel - Padding and text)
          ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0B3D62] to-[#005A8D] text-white rounded-2xl p-10 sm:p-16 text-center shadow-lg relative overflow-hidden">
          {/* Decorative backlines */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), 
                                linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: '3rem 3rem',
            }}
          />

          <h2 className="text-3xl sm:text-4xl lg:text-[34px] font-extrabold tracking-tight text-white relative z-10 leading-tight">
            {t('finalCtaTitle')}
          </h2>
          <p className="text-sm sm:text-base text-blue-100 mt-4 max-w-xl mx-auto leading-relaxed relative z-10">
            {t('finalCtaDesc')}
          </p>
          
          <div className="mt-8 relative z-10">
            <Link
              to="/login"
              className="px-8 py-4 text-sm font-bold uppercase tracking-wider bg-white hover:bg-slate-100 text-[#005A8D] rounded-md transition-all shadow-md inline-flex items-center gap-2 h-12 sm:h-[50px]"
            >
              <span>{t('getStartedNow')}</span>
              <ArrowRight className="w-4.5 h-4.5 text-[#005A8D]" />
            </Link>
          </div>

          <p className="text-[11px] text-blue-200 font-bold mt-8 tracking-widest uppercase relative z-10 select-none">
            Learn &bull; Assess &bull; Measure &bull; Improve
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
