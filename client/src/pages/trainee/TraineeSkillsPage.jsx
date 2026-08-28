import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMySkillsProfileApi } from '../../services/api';
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
} from 'lucide-react';

const TraineeSkillsPage = () => {
  const [profileData, setProfileData] = useState({
    summary: { totalVerified: 0, advancedCount: 0, proficientCount: 0, beginnerCount: 0, learningCount: 0 },
    verifiedSkills: [],
    learningSkills: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [proficiencyFilter, setProficiencyFilter] = useState('all');

  // Certificate Modal Preview State
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const fetchSkillsProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMySkillsProfileApi();
      if (response && response.success) {
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
      setError(err.response?.data?.message || err.message || 'Failed to load your skill profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkillsProfile();
  }, [fetchSkillsProfile]);

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
      return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
    }
    return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Consolidated Skill & Evidence Portfolio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Skills
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Your consolidated portfolio of verified skills attained by passing final course assessments, complete with verified proof of work and certificates.
        </p>

        {/* Skill Metrics Pills */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-900 text-white rounded-lg px-4 py-2 shadow-xs">
            <span className="text-[10px] uppercase font-mono text-slate-300 block font-semibold">Total Verified</span>
            <strong className="text-base font-bold">{summary.totalVerified} Skills</strong>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-purple-700 block font-semibold">Advanced</span>
            <strong className="text-base font-bold text-purple-900">{summary.advancedCount}</strong>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-blue-700 block font-semibold">Proficient</span>
            <strong className="text-base font-bold text-blue-900">{summary.proficientCount}</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-emerald-700 block font-semibold">Beginner</span>
            <strong className="text-base font-bold text-emerald-900">{summary.beginnerCount}</strong>
          </div>
          {summary.learningCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2">
              <span className="text-[10px] uppercase font-mono text-amber-700 block font-semibold">In Progress</span>
              <strong className="text-base font-bold text-amber-900">{summary.learningCount}</strong>
            </div>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchSkillsProfile} />}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search skills, keywords, or courses..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Category Tabs */}
          <div className="flex items-center gap-1">
            {['All', 'Technical', 'Soft Skill'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Proficiency Filter */}
          <select
            value={proficiencyFilter}
            onChange={(e) => setProficiencyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700 font-medium"
          >
            <option value="all">All Levels</option>
            <option value="advanced">Advanced Only</option>
            <option value="proficient">Proficient Only</option>
            <option value="beginner">Beginner Only</option>
          </select>
        </div>
      </div>

      {/* ====================================================
          SECTION 1: VERIFIED SKILLS (WITH PROOF OF WORK)
          ==================================================== */}
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

        {loading ? (
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

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Skill</span>
                    </span>
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

      {/* ====================================================
          SECTION 2: LEARNING / NOT YET VERIFIED SKILLS
          ==================================================== */}
      {filteredLearningSkills.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
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

                <div className="pt-2 border-t border-amber-200/60 space-y-1">
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
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default TraineeSkillsPage;
