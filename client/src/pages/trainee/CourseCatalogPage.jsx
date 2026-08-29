import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCoursesApi, getAiCourseRecommendationsApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  BookOpen,
  Search,
  Filter,
  Users,
  Layers,
  ArrowRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Target,
  Lightbulb,
  Award,
  Zap,
  TrendingUp,
} from 'lucide-react';

const CourseCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'recommended' ? 'recommended' : 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [courses, setCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'recommended') {
      setActiveTab('recommended');
    } else if (tabParam === 'all') {
      setActiveTab('all');
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Independent fetch for published courses
  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    setError(null);
    try {
      const res = await getCoursesApi({
        search: searchTerm.trim() || undefined,
        category: categoryFilter.trim() || undefined,
        level: levelFilter.trim() || undefined,
      });

      if (res?.success) {
        setCourses(res.data || []);
      } else {
        throw new Error(res?.message || 'Failed to fetch catalog');
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load course catalog.');
    } finally {
      setLoadingCourses(false);
    }
  }, [searchTerm, categoryFilter, levelFilter]);

  // Independent fetch for AI course recommendations
  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        const res = await getAiCourseRecommendationsApi();
        if (isMounted && res?.success) {
          setRecommendations(res.data?.recommendations || []);
        }
      } catch (err) {
        console.warn('AI course recommendations notice:', err.message);
      } finally {
        if (isMounted) setLoadingRecommendations(false);
      }
    };
    fetchRecommendations();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchCourses]);

  // Extract unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set(courses.map((c) => c.category).filter(Boolean))
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Curated Learning Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Explore Courses & Competencies
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
              Discover structured learning pathways created by verified trainers, or explore personalized AI-recommended courses tailored to your skills and career targets.
            </p>
          </div>

          <Link
            to="/trainee/recommendations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--surface-muted)] text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--border)] rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Learning Advisor →</span>
          </Link>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3">
        <button
          type="button"
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>All Published Courses ({courses.length})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('recommended')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'recommended'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>✨ AI Recommended for You ({recommendations.length})</span>
        </button>
      </div>

      {/* Recommended Courses Dedicated View */}
      {activeTab === 'recommended' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-4">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Personalized AI Course Recommendations</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Evaluated against your completed coursework, verified skill proficiencies, and institutional competency targets.
              </p>
            </div>
            <Link
              to="/trainee/recommendations"
              className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>View Career Roadmap</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loadingRecommendations ? (
            <div className="py-16 flex justify-center bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xs">
              <Loading message="Synthesizing personalized AI course recommendations..." />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">No course recommendations yet</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                Enroll in courses and complete assessments to generate personalized AI recommendations tailored to your learning trajectory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, idx) => {
                const priorityStyles = {
                  high: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300',
                  medium: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300',
                  low: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300',
                };

                return (
                  <div
                    key={rec.course?._id || idx}
                    className="bg-[var(--surface)] border border-[var(--border)] hover:border-blue-400 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Match Score & Priority */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {rec.course?.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {rec.priority && (
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                                priorityStyles[rec.priority] || priorityStyles.medium
                              }`}
                            >
                              {rec.priority} Priority
                            </span>
                          )}
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                            {rec.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-2">
                        {rec.course?.title}
                      </h3>

                      {/* AI Why Recommended */}
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Why Recommended:
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {rec.reason}
                        </p>
                      </div>

                      {/* Learning Benefit */}
                      {rec.learningBenefit && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-600">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{rec.learningBenefit}</span>
                        </div>
                      )}

                      {/* Aligned Skills */}
                      {rec.skillAlignment && rec.skillAlignment.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Skills You Will Develop:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {rec.skillAlignment.map((sk, sIdx) => {
                              const sName = typeof sk === 'string' ? sk : sk.skill || sk.name;
                              const prof = sk.targetProficiency;
                              return (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium"
                                >
                                  <span>{sName}</span>
                                  {prof && (
                                    <span className="text-emerald-700 font-bold">({prof})</span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{typeof rec.course?.trainer === 'object' ? rec.course.trainer?.name : (rec.course?.trainer || 'Faculty')}</span>
                      </div>

                      <Link
                        to={`/trainee/courses/${rec.course?._id || rec.course?.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-xs"
                      >
                        <span>View Course</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Catalog View */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Main Catalog Header & Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                Explore All Courses ({courses.length})
              </h2>
            </div>

            {/* Search & Filters Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[var(--surface)] p-3 border border-[var(--border)] rounded-xl shadow-xs">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, subject, or keyword..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:inline" />

                {/* Level Filter */}
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="text-xs border border-[var(--border)] rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--surface)] text-[var(--text-primary)] cursor-pointer"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                {/* Category Filter */}
                {uniqueCategories.length > 0 && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs border border-[var(--border)] rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--surface)] text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}

                {(searchTerm || levelFilter || categoryFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setLevelFilter('');
                      setCategoryFilter('');
                    }}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline px-2 py-1 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && <ErrorMessage message={error} onRetry={fetchCourses} />}

          {/* Catalog Grid */}
          {loadingCourses ? (
            <div className="py-16 flex justify-center">
              <Loading message="Loading published courses..." />
            </div>
          ) : courses.length === 0 ? (
            /* Empty State */
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">No courses found</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                {searchTerm || levelFilter || categoryFilter
                  ? 'Try adjusting your search terms or filters.'
                  : 'There are currently no published courses available in the catalog.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const levelStyles = {
                  beginner: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                  intermediate: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                  advanced: 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                };

                return (
                  <div
                    key={course._id}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors"
                  >
                    <div className="space-y-3">
                      {/* Category & Level Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {course.category}
                          </span>
                          {course.isEnrolled && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Enrolled</span>
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            levelStyles[course.level] || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {course.level}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Mapped Skills Pills */}
                      {course.skills && course.skills.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Target Skills:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {course.skills.map((skillItem, sIdx) => {
                              const skillName = skillItem.name || skillItem.skill?.name || 'Skill';
                              const prof = skillItem.proficiency;
                              return (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium"
                                >
                                  <span>{skillName}</span>
                                  {prof && (
                                    <span className="text-emerald-700 font-bold">
                                      ({prof})
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Prerequisites */}
                      {course.prerequisites && (
                        <p className="text-[11px] text-slate-400 italic">
                          Prerequisites: {course.prerequisites}
                        </p>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{course.trainer?.name || 'Trainer'}</span>
                      </div>

                      <Link
                        to={`/trainee/courses/${course._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        <span>View Course</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCatalogPage;
