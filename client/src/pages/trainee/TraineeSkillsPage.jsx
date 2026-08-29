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
  ShieldCheck,
  Calendar,
  X,
  Lightbulb,
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

  // Skill Improvement Advisor Modal State
  const [selectedSkillForGuidance, setSelectedSkillForGuidance] = useState(null);
  const [skillGuidance, setSkillGuidance] = useState(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  // Fetch verified & learning skills
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

  // Fetch AI skills to develop
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
      return 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold';
    }
    if (lower === 'proficient') {
      return 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800 font-semibold';
    }
    return 'bg-[var(--surface-muted)] text-[var(--text-secondary)] border-[var(--border)] font-semibold';
  };

  const categories = ['All', 'Technical', 'Soft Skill', 'Other'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Institutional Skill Passport</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              My Verified Skills & Competencies
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
              All verified skills are earned through qualifying courses, assessed via final examinations, and backed by verifiable credentials.
            </p>
          </div>

          <Link
            to="/trainee/recommendations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--primary-soft)] text-[var(--primary)] border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommendation Hub →</span>
          </Link>
        </div>

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[var(--border)]">
          <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Total Verified</span>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{summary.totalVerified || 0}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">Advanced</span>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-0.5">{summary.advancedCount || 0}</p>
          </div>
          <div className="bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300">Proficient</span>
            <p className="text-2xl font-bold text-teal-900 dark:text-teal-100 mt-0.5">{summary.proficientCount || 0}</p>
          </div>
          <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">In Progress</span>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{summary.learningCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange('verified')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'verified'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verified Skills ({verifiedSkills.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('learning')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'learning'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>In Progress ({learningSkills.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('develop')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'develop'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Skills to Develop ({skillsToDevelop.length})</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchSkillsProfile} />}

      {/* Main Content */}
      {activeTab === 'verified' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--surface)] p-3 border border-[var(--border)] rounded-xl shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search verified skills or courses..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={proficiencyFilter}
                onChange={(e) => setProficiencyFilter(e.target.value)}
                className="text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Proficiencies</option>
                <option value="Advanced">Advanced</option>
                <option value="Proficient">Proficient</option>
                <option value="Beginner">Beginner</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c} Categories</option>
                ))}
              </select>
            </div>
          </div>

          {loadingSkills ? (
            <div className="py-16 flex justify-center">
              <Loading message="Loading verified skills..." />
            </div>
          ) : filteredVerifiedSkills.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">No verified skills found</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                {searchTerm || categoryFilter !== 'All' || proficiencyFilter !== 'all'
                  ? 'Try adjusting your search query or filters.'
                  : 'Complete course final assessments to earn verified skills backed by cryptographic credentials.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVerifiedSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                        {skill.category || 'Technical'}
                      </span>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${getProficiencyBadgeClass(skill.highestProficiency)}`}>
                        {skill.highestProficiency || 'Proficient'}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">{skill.name}</h3>
                        {skill.description && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{skill.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Evidence Verification */}
                    {Array.isArray(skill.evidence) && skill.evidence.length > 0 && (
                      <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg p-2.5 text-[11px] text-[var(--text-secondary)] space-y-1">
                        <span className="font-semibold text-[10px] uppercase text-[var(--text-muted)] block">Verified Through:</span>
                        {skill.evidence.slice(0, 2).map((ev, eIdx) => (
                          <div key={eIdx} className="flex items-center justify-between gap-2">
                            <span className="truncate">{ev.courseTitle}</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{ev.examScore}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenSkillGuidance(skill.name)}
                      className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI Growth Path</span>
                    </button>

                    {skill.evidence?.[0]?.certificateId && (
                      <button
                        type="button"
                        onClick={() => setSelectedCertificate({ certificateId: skill.evidence[0].certificateId })}
                        className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Award className="w-3 h-3" />
                        <span>Credential</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* In-Progress Skills Tab */}
      {activeTab === 'learning' && (
        <div className="space-y-4">
          {filteredLearningSkills.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">No skills currently in progress</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Enroll in catalog courses to begin developing new skills.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLearningSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                        {skill.category || 'Technical'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[var(--primary)] border border-blue-200 dark:border-blue-800">
                        In Progress
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{skill.name}</h3>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Target: <strong className="text-[var(--text-secondary)]">{skill.targetProficiency || 'Proficient'}</strong>
                    </span>
                    <Link
                      to="/trainee/courses"
                      className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Courses</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Skills To Develop Tab */}
      {activeTab === 'develop' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillsToDevelop.map((item, idx) => {
              const sName = typeof item === 'string' ? item : item.skill || item.name;
              return (
                <div
                  key={idx}
                  className="bg-[var(--surface)] border border-[var(--border)] hover:border-teal-400 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                        High Priority Gap
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{sName}</h3>
                    {item.reason && (
                      <p className="text-xs text-[var(--text-secondary)] bg-[var(--surface-muted)] p-2.5 rounded-lg border border-[var(--border)]">
                        {item.reason}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <Link
                      to="/trainee/courses"
                      className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Find Courses</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          isOpen={Boolean(selectedCertificate)}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
};

export default TraineeSkillsPage;
