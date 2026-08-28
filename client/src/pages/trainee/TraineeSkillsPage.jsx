import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getMySkillsProfileApi, getSkillAiGuidanceApi, getAiCourseRecommendationsApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import CertificateModal from '../../components/CertificateModal';
import {
  Target,
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Tag,
  Sparkles,
  ArrowRight,
  Award,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Percent,
  Calendar,
  X,
  ChevronRight,
  Lightbulb,
  Zap,
  TrendingUp,
} from 'lucide-react';

const TraineeSkillsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'develop' ? 'develop' : (searchParams.get('tab') === 'learning' ? 'learning' : 'verified');
  const [activeTab, setActiveTab] = useState(initialTab);

  const [profileData, setProfileData] = useState({
    summary: { totalVerified: 0, advancedCount: 0, proficientCount: 0, beginnerCount: 0, learningCount: 0 },
    verifiedSkills: [],
    learningSkills: [],
  });
  const [skillsToDevelop, setSkillsToDevelop] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingSkillsToDevelop, setLoadingSkillsToDevelop] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [proficiencyFilter, setProficiencyFilter] = useState('all');

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'develop') {
      setActiveTab('develop');
    } else if (tabParam === 'learning') {
      setActiveTab('learning');
    } else if (tabParam === 'verified') {
      setActiveTab('verified');
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Certificate Modal Preview State
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Skill Improvement Advisor Modal State (Phase 7.3)
  const [selectedSkillForGuidance, setSelectedSkillForGuidance] = useState(null);
  const [skillGuidance, setSkillGuidance] = useState(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  // Independent fetch for Verified & In-Progress Skills Profile
  const fetchSkillsProfile = useCallback(async () => {
    setLoadingSkills(true);
    setError(null);
    try {
      const response = await getMySkillsProfileApi();
      if (response?.success) {
        setProfileData({
          summary: response.summary || {
            totalVerified: (response.verifiedSkills || []).length,
            advancedCount: 0,
            proficientCount: 0,
            beginnerCount: 0,
            learningCount: (response.learningSkills || []).length,
          },
          verifiedSkills: response.verifiedSkills || response.data || [],
          learningSkills: response.learningSkills || [],
        });
      } else {
        throw new Error(response?.message || 'Failed to load skill profile');
      }
    } catch (err) {
      console.error('Error loading skills profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load skill profile.');
    } finally {
      setLoadingSkills(false);
    }
  }, []);

  // Independent fetch for AI Skills to Develop
  useEffect(() => {
    let isMounted = true;
    const fetchSkillsToDevelop = async () => {
      setLoadingSkillsToDevelop(true);
      try {
        const res = await getAiCourseRecommendationsApi();
        if (isMounted && res?.success) {
          setSkillsToDevelop(res.data?.skillsToDevelop || []);
        }
      } catch (err) {
        console.warn('AI skills to develop notice:', err.message);
      } finally {
        if (isMounted) setLoadingSkillsToDevelop(false);
      }
    };
    fetchSkillsToDevelop();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchSkillsProfile();
  }, [fetchSkillsProfile]);

  const handleOpenSkillGuidance = async (skillName) => {
    const sName = typeof skillName === 'string' ? skillName : skillName.skill || skillName.name;
    setSelectedSkillForGuidance(sName);
    setLoadingGuidance(true);
    setSkillGuidance(null);

    try {
      const res = await getSkillAiGuidanceApi(sName);
      if (res?.success && res.data) {
        setSkillGuidance(res.data);
      }
    } catch (err) {
      console.warn('Could not load skill guidance:', err.message);
    } finally {
      setLoadingGuidance(false);
    }
  };

  const { summary, verifiedSkills, learningSkills } = profileData;

  // Filter verified skills
  const filteredVerifiedSkills = verifiedSkills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
      s.evidence?.some((ev) => ev.courseTitle.toLowerCase().includes(searchTerm.toLowerCase().trim()));

    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesProficiency =
      proficiencyFilter === 'all' || s.highestProficiency === proficiencyFilter;

    return matchesSearch && matchesCategory && matchesProficiency;
  });

  // Filter learning skills
  const filteredLearningSkills = learningSkills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      s.courses?.some((c) => c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getProficiencyBadgeClass = (prof) => {
    const lower = (prof || '').toLowerCase();
    if (lower === 'advanced') {
      return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
    }
    if (lower === 'proficient') {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
    }
    return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
  };

  const categories = ['All', 'Technical', 'Soft Skill', 'Other'];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Institutional Skill Portfolio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Verified Skills & Competencies
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              All verified skills are earned through qualifying courses, assessed via final examinations, and backed by cryptographically verifiable credentials.
            </p>
          </div>

          <Link
            to="/trainee/recommendations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommendation Hub →</span>
          </Link>
        </div>

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Verified</span>
            <p className="text-xl font-bold text-slate-900">{summary.totalVerified || 0}</p>
          </div>
          <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-600">Advanced</span>
            <p className="text-xl font-bold text-purple-900">{summary.advancedCount || 0}</p>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600">Proficient</span>
            <p className="text-xl font-bold text-emerald-900">{summary.proficientCount || 0}</p>
          </div>
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-600">Beginner</span>
            <p className="text-xl font-bold text-blue-900">{summary.beginnerCount || 0}</p>
          </div>
          <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-amber-600">Learning</span>
            <p className="text-xl font-bold text-amber-900">{summary.learningCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search skills or qualifying courses..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Proficiency Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 font-semibold">Proficiency:</span>
            <select
              value={proficiencyFilter}
              onChange={(e) => setProficiencyFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="proficient">Proficient</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange('verified')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'verified'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Skills ({filteredVerifiedSkills.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('learning')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'learning'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>In-Progress Learning ({filteredLearningSkills.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('develop')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'develop'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-indigo-400" />
          <span>🎯 Skills to Develop ({skillsToDevelop.length})</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchSkillsProfile} />}

      {/* ====================================================
          SECTION: SKILLS TO DEVELOP (AI Targeted)
          ==================================================== */}
      {activeTab === 'develop' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-indigo-50/60 border border-indigo-200 rounded-lg p-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Skills to Develop (AI Targeted)</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Identified based on your competency gaps, career roadmap, and current verified proficiencies.
              </p>
            </div>
            <Link
              to="/trainee/recommendations"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 inline-flex items-center gap-1 shrink-0"
            >
              <span>View Career Roadmap</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loadingSkillsToDevelop ? (
            <div className="py-16 flex justify-center bg-white border border-slate-200 rounded-xl shadow-xs">
              <Loading message="Diagnosing competency gaps & skills to develop..." />
            </div>
          ) : skillsToDevelop.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No skill gaps identified yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Continue enrolling in courses and attempting assessments to receive personalized skill recommendations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillsToDevelop.map((sk, idx) => (
                <div
                  key={sk._id || idx}
                  className="bg-white border border-indigo-100 hover:border-indigo-300 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {sk.category || 'Competency Gap'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Target: {sk.targetProficiency || 'Proficient'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {sk.skill || sk.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Current: <span className="font-semibold text-slate-700">{sk.currentProficiency || 'Not Earned'}</span>
                      </p>
                    </div>

                    <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-lg p-3 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                        Why Develop This Skill:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {sk.reason}
                      </p>
                    </div>

                    {sk.mappedCourses && sk.mappedCourses.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Available Courses Covering This Skill:
                        </span>
                        <div className="space-y-1">
                          {sk.mappedCourses.map((mc, mIdx) => (
                            <Link
                              key={mIdx}
                              to={`/trainee/courses/${mc._id || mc.courseId || mc.id}`}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 block truncate"
                            >
                              • {mc.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenSkillGuidance(sk.skill || sk.name)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Improvement Guidance</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          SECTION 1: VERIFIED SKILLS (PROOF OF WORK)
          ==================================================== */}
      {activeTab === 'verified' && (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Verified Skills ({filteredVerifiedSkills.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Backed by passed final assessments & certificates
          </span>
        </div>

        {loadingSkills ? (
          <div className="py-16 flex justify-center bg-white border border-slate-200 rounded-xl shadow-sm">
            <Loading message="Loading verified skills portfolio..." />
          </div>
        ) : filteredVerifiedSkills.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500 shadow-sm space-y-3">
            <Target className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="font-semibold text-slate-800 text-sm">No verified skills yet</p>
              <p className="text-slate-400 mt-1 max-w-sm mx-auto">
                Complete course modules and pass the final course assessment to earn verified skills and official certificates.
              </p>
            </div>
            <Link
              to="/trainee/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore Course Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredVerifiedSkills.map((skill) => (
              <div
                key={skill._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Skill Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{skill.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 rounded border shadow-2xs ${getProficiencyBadgeClass(
                            skill.highestProficiency
                          )}`}
                        >
                          {skill.highestProficiencyLabel || skill.highestProficiency}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {skill.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenSkillGuidance(skill.name)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2 py-1 rounded transition-colors"
                        title="Get AI guidance on advancing to the next level"
                      >
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>Improve</span>
                      </button>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>

                  {skill.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {skill.description}
                    </p>
                  )}

                  {/* Proof of Work / Evidence Section */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Earned Through ({skill.evidence?.length || 0} Qualifying Courses):
                    </span>

                    <div className="space-y-2">
                      {skill.evidence?.map((ev, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900">{ev.courseTitle}</span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600 flex-shrink-0">
                              {ev.proficiencyAwarded}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                            <div className="flex items-center gap-1">
                              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Final Score: <strong>{ev.finalScore}%</strong></span>
                            </div>
                            {ev.certificateId && (
                              <div className="flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="font-mono text-[10px] font-bold text-indigo-700">
                                  {ev.certificateId}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Links */}
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-3 text-xs">
                            <Link
                              to={`/trainee/courses/${ev.courseId}`}
                              className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1"
                            >
                              <span>View Course</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>

                            {ev.certificateId && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedCertificate({
                                    certificateId: ev.certificateId,
                                    filePath: ev.certificateFile,
                                    course: { title: ev.courseTitle },
                                    percentage: ev.finalScore,
                                    issuedAt: ev.earnedAt,
                                  })
                                }
                                className="text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>View Certificate</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

      {/* ====================================================
          SECTION 2: LEARNING / NOT YET VERIFIED SKILLS
          ==================================================== */}
      {activeTab === 'learning' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Learning in Enrolled Courses ({filteredLearningSkills.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Not yet verified &bull; Pass final assessment to earn verified status
            </span>
          </div>

          {loadingSkills ? (
            <div className="py-16 flex justify-center bg-white border border-slate-200 rounded-xl shadow-sm">
              <Loading message="Loading in-progress learning skills..." />
            </div>
          ) : filteredLearningSkills.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500 shadow-sm space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <p className="font-semibold text-slate-800 text-sm">No in-progress skills</p>
                <p className="text-slate-400 mt-1 max-w-sm mx-auto">
                  When you enroll in courses with mapped skills, they will appear here until you pass the final assessment.
                </p>
              </div>
              <Link
                to="/trainee/courses"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explore Course Catalog</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredLearningSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-4 space-y-2 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 text-sm">{skill.name}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        Learning
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{skill.category}</span>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Target Course:
                    </span>
                    {skill.courses?.map((c, i) => (
                      <Link
                        key={i}
                        to={`/trainee/courses/${c.courseId}`}
                        className="text-xs text-slate-700 hover:text-amber-900 font-semibold block truncate"
                      >
                        {c.courseTitle} ({c.progress}%)
                      </Link>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleOpenSkillGuidance(skill.name)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 pt-1"
                    >
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>Improve This Skill</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          isOpen={Boolean(selectedCertificate)}
          onClose={() => setSelectedCertificate(null)}
          certificate={selectedCertificate}
        />
      )}

      {/* Skill Improvement Advisor Modal (Phase 7.3) */}
      {selectedSkillForGuidance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Skill Improvement Advisor: {selectedSkillForGuidance}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSkillForGuidance(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingGuidance && (
              <div className="py-8 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Synthesizing skill progression roadmap...</p>
              </div>
            )}

            {!loadingGuidance && skillGuidance && (
              <div className="space-y-4 text-xs">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-900 space-y-1">
                  <h4 className="font-bold text-xs">{skillGuidance.roadmapTitle}</h4>
                  <p className="leading-relaxed">{skillGuidance.progressionSummary}</p>
                </div>

                {Array.isArray(skillGuidance.recommendedActions) && skillGuidance.recommendedActions.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold uppercase text-[10px] text-slate-400">Actionable Next Steps:</span>
                    <ul className="space-y-1.5">
                      {skillGuidance.recommendedActions.map((act, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(skillGuidance.recommendedCourses) && skillGuidance.recommendedCourses.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="font-bold uppercase text-[10px] text-slate-400">Mapped Platform Courses:</span>
                    <div className="space-y-1.5">
                      {skillGuidance.recommendedCourses.map((mc, mIdx) => (
                        <div key={mIdx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded p-2">
                          <span className="font-semibold text-slate-800">{mc.title}</span>
                          <Link
                            to={`/trainee/courses/${mc.courseId}`}
                            onClick={() => setSelectedSkillForGuidance(null)}
                            className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSkillForGuidance(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraineeSkillsPage;
