import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  Lightbulb
} from 'lucide-react';

const CourseCatalogPage = () => {
  const [courses, setCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, recsRes] = await Promise.allSettled([
        getCoursesApi({
          search: searchTerm.trim() || undefined,
          category: categoryFilter.trim() || undefined,
          level: levelFilter.trim() || undefined,
        }),
        getAiCourseRecommendationsApi(),
      ]);

      if (coursesRes.status === 'fulfilled' && coursesRes.value?.success) {
        setCourses(coursesRes.value.data || []);
      } else {
        throw new Error(coursesRes.value?.message || 'Failed to fetch catalog');
      }

      if (recsRes.status === 'fulfilled' && recsRes.value?.success) {
        setRecommendations(recsRes.value.data?.recommendations || []);
      }
    } catch (err) {
      console.error('Error loading catalog:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load course catalog.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, levelFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCatalog();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchCatalog]);

  // Extract unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set(courses.map((c) => c.category).filter(Boolean))
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Curated Learning Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore Courses & Competencies
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Discover structured learning pathways created by verified trainers. Enroll to start developing verified competencies.
            </p>
          </div>

          <Link
            to="/trainee/recommendations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Workspace →</span>
          </Link>
        </div>
      </div>

      {/* Compact "Recommended for You" section */}
      {!loading && recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-blue-50/60 border border-emerald-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                ✨ Recommended for You (AI Personalized)
              </h2>
            </div>
            <Link
              to="/trainee/recommendations"
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              View All Recommendations →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div
                key={rec.course?._id || idx}
                className="bg-white border border-emerald-100 rounded-lg p-3.5 shadow-xs flex flex-col justify-between space-y-2 hover:border-emerald-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400">
                      {rec.course?.category}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                      {rec.matchScore}% Match
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {rec.course?.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                    {rec.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 capitalize">{rec.course?.level}</span>
                  <Link
                    to={`/trainee/courses/${rec.course?._id}`}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Catalog Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Explore All Courses ({courses.length})
          </h2>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, subject, or keyword..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                className="text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                className="text-xs text-slate-500 hover:text-slate-900 underline px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCatalog} />}

      {/* Catalog Grid */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loading message="Loading published courses..." />
        </div>
      ) : courses.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No courses found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || levelFilter || categoryFilter
              ? 'Try adjusting your search terms or filters.'
              : 'There are currently no published courses available in the catalog.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const levelStyles = {
              beginner: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              intermediate: 'bg-blue-50 text-blue-800 border-blue-200',
              advanced: 'bg-purple-50 text-purple-800 border-purple-200',
            };

            return (
              <div
                key={course._id}
                className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors"
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
  );
};

export default CourseCatalogPage;
