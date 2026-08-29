import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  Target,
  BarChart3,
  Users,
  Award,
  Layers,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Sparkles,
  User,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
  const { user } = useAuth();
  const role = user?.role || 'trainee';

  const roleNavItems = {
    trainee: [
      { name: 'Dashboard', path: '/trainee/dashboard', icon: LayoutDashboard, exact: true },
      { name: 'Recommendations', path: '/trainee/recommendations', icon: Sparkles },
      { name: 'Courses', path: '/trainee/courses', icon: BookOpen },
      { name: 'Assessments', path: '/trainee/assessments', icon: FileCheck },
      { name: 'My Skills', path: '/trainee/skills', icon: Target },
      { name: 'My Competencies', path: '/trainee/competencies', icon: Layers },
      { name: 'Analytics', path: '/trainee/analytics', icon: BarChart3 },
      { name: 'Profile', path: '/trainee/profile', icon: User },
    ],
    trainer: [
      { name: 'Dashboard', path: '/trainer/dashboard', icon: LayoutDashboard, exact: true },
      { name: 'Courses', path: '/trainer/courses', icon: BookOpen },
      { name: 'Learners', path: '/trainer/learners', icon: Users },
      { name: 'Assessments', path: '/trainer/assessments', icon: FileCheck },
      { name: 'Analytics', path: '/trainer/analytics', icon: BarChart3 },
      { name: 'Profile', path: '/trainer/profile', icon: User },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Trainers', path: '/admin/trainers', icon: UserCheck },
      { name: 'Courses', path: '/admin/courses', icon: BookOpen },
      { name: 'Skills', path: '/admin/skills', icon: Target },
      { name: 'Competencies', path: '/admin/competencies', icon: Layers },
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      { name: 'Profile', path: '/admin/profile', icon: User },
    ],
  };

  const navItems = roleNavItems[role] || roleNavItems.trainee;

  const roleBadgeInfo = {
    trainee: { label: 'Trainee Space', icon: GraduationCap, color: 'bg-blue-950/60 text-blue-300 border-blue-800/80' },
    trainer: { label: 'Trainer Hub', icon: UserCheck, color: 'bg-teal-950/60 text-teal-300 border-teal-800/80' },
    admin: { label: 'Administrator', icon: ShieldCheck, color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80' },
  };

  const currentBadge = roleBadgeInfo[role] || roleBadgeInfo.trainee;
  const RoleIcon = currentBadge.icon;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transform transition-all duration-200 ease-in-out md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:z-0 flex flex-col justify-between shrink-0 overflow-y-auto overflow-x-hidden text-slate-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20 w-64' : 'md:w-64 w-64'}`}
      >
        <div className="flex-1">
          {/* Sidebar Role Badge */}
          <div className={`p-3 border-b border-slate-800/80 transition-all ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <div
              className={`flex items-center gap-2.5 py-2 rounded-lg border text-xs font-semibold ${currentBadge.color} ${
                isCollapsed ? 'justify-center px-2' : 'px-3'
              }`}
              title={currentBadge.label}
            >
              <RoleIcon className="w-4 h-4 shrink-0 text-blue-400" />
              {!isCollapsed && <span className="truncate tracking-wide">{currentBadge.label}</span>}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 mt-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  end={item.exact}
                  onClick={onClose}
                  title={item.name}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isCollapsed ? 'justify-center px-2' : ''
                    } ${
                      isActive
                        ? 'bg-blue-600/15 text-white border-l-3 border-blue-500 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70 border-l-3 border-transparent'
                    }`
                  }
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors group-hover:text-blue-400 ${
                      window.location.pathname === item.path ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Exclusive Bottom Collapse Action */}
        <div className="p-3 border-t border-slate-800/80">
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`flex items-center gap-2.5 w-full p-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700/80 cursor-pointer ${
                isCollapsed ? 'justify-center' : 'justify-start'
              }`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">Collapse Sidebar</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
