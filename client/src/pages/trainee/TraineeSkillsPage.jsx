import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMySkillsProfileApi } from '../../services/api';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Target,
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Tag,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const TraineeSkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchSkillsProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMySkillsProfileApi();
      if (response && response.success) {
        setSkills(response.data || []);
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

  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      s.courses?.some((c) => c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const completedSkillsCount = skills.filter((s) => s.status === 'Course Completed').length;
  const learningSkillsCount = skills.filter((s) => s.status === 'Learning').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>My Learning Skill Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Skills
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Track the technical and professional skills you are actively learning and developing through your enrolled courses.
        </p>

        {/* Skill Metrics Pills */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Total Skills</span>
            <strong className="text-base font-bold text-slate-900">{skills.length}</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-emerald-700 block font-semibold">Course Completed</span>
            <strong className="text-base font-bold text-emerald-900">{completedSkillsCount}</strong>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2">
            <span className="text-[10px] uppercase font-mono text-blue-700 block font-semibold">In Progress (Learning)</span>
            <strong className="text-base font-bold text-blue-900">{learningSkillsCount}</strong>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchSkillsProfile} />}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search skills or course origin..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto">
          {['All', 'Technical', 'Soft Skill'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="py-16 flex justify-center bg-white border border-slate-200 rounded-lg shadow-sm">
          <Loading message="Loading your skill profile..." />
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 shadow-sm space-y-3">
          <Target className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">No skills mapped in your profile</p>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto">
              Enroll in published courses to start acquiring verified skills on your profile.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const isCompleted = skill.status === 'Course Completed';

            return (
              <div
                key={skill._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          skill.category === 'Soft Skill'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{skill.name}</h3>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {skill.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-blue-50 text-blue-800 border-blue-300'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Course Completed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Learning</span>
                        </>
                      )}
                    </span>
                  </div>

                  {skill.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {skill.description}
                    </p>
                  )}
                </div>

                {/* Course Origin List */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Developed Through:
                  </span>
                  <div className="space-y-1">
                    {skill.courses?.map((c, idx) => (
                      <Link
                        key={idx}
                        to={`/trainee/courses/${c.courseId}`}
                        className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors group"
                      >
                        <span className="font-medium truncate group-hover:text-emerald-700">
                          {c.courseTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                          <span>{c.progress}%</span>
                          <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TraineeSkillsPage;
