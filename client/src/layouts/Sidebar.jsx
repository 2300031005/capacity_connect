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
  ChevronLeft,
  ChevronRight,
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
    trainee: { label: 'Trainee Space', icon: GraduationCap, color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' },
    trainer: { label: 'Trainer Hub', icon: UserCheck, color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800' },
    admin: { label: 'Administrator', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' },
  };

  const currentBadge = roleBadgeInfo[role] || roleBadgeInfo.trainee;
  const RoleIcon = currentBadge.icon;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-in-out md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:z-0 flex flex-col justify-between shrink-0 overflow-y-auto overflow-x-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20 w-64' : 'w-64'}`}
      >
        <div>
          {/* Sidebar Role Badge */}
          <div className={`p-3 border-b border-slate-100 dark:border-slate-800 transition-all ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <div
              className={`flex items-center gap-2 py-2 rounded-lg border text-xs font-semibold ${currentBadge.color} ${
                isCollapsed ? 'justify-center px-2' : 'px-3'
              }`}
              title={isCollapsed ? currentBadge.label : undefined}
            >
              <RoleIcon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{currentBadge.label}</span>}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  end={item.exact}
                  onClick={onClose}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all group ${
                      isCollapsed ? 'justify-center px-2' : ''
                    } ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs dark:bg-emerald-600 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Collapse Toggle */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Desktop Expand / Collapse Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`hidden md:flex items-center gap-2 w-full p-2 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {!isCollapsed && <span>Collapse Sidebar</span>}
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}

          {!isCollapsed && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 px-1">
              <p className="font-bold text-slate-700 dark:text-slate-300">Cognisphere</p>
              <p className="truncate">Capacity Connect v1.0</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
