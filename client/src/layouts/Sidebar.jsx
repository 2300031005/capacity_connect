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
    trainee: { label: 'Trainee Space', icon: GraduationCap },
    trainer: { label: 'Trainer Hub', icon: UserCheck },
    admin: { label: 'Administrator', icon: ShieldCheck },
  };

  const currentBadge = roleBadgeInfo[role] || roleBadgeInfo.trainee;
  const RoleIcon = currentBadge.icon;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container: Light & Professional by Default, Adapts in Dark Theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[var(--cc-sidebar-background)] border-r border-[var(--cc-sidebar-border)] transform transition-all duration-200 ease-in-out md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:z-0 flex flex-col justify-between shrink-0 overflow-y-auto overflow-x-hidden text-[var(--cc-sidebar-text)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20 w-64' : 'md:w-64 w-64'}`}
      >
        <div className="flex-1">
          {/* Workspace Space Selector Header */}
          <div className={`p-3 border-b border-[var(--cc-sidebar-border)] transition-all ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <div
              className={`flex items-center gap-2.5 py-2 rounded-lg bg-[var(--cc-sidebar-workspace-bg)] border border-[var(--cc-sidebar-workspace-border)] text-xs font-semibold text-[var(--cc-sidebar-workspace-text)] transition-colors ${
                isCollapsed ? 'justify-center px-2' : 'px-3'
              }`}
              title={currentBadge.label}
            >
              <RoleIcon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate tracking-wide">{currentBadge.label}</span>}
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
                  title={item.name}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-2' : ''
                    } ${
                      isActive
                        ? 'bg-[var(--cc-sidebar-active)] text-[var(--cc-sidebar-active-text)] border-l-3 border-[var(--cc-sidebar-indicator)] font-semibold shadow-xs'
                        : 'text-[var(--cc-sidebar-text)] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[var(--cc-sidebar-hover)] border-l-3 border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[var(--cc-sidebar-active-icon)]'
                            : 'text-[var(--cc-sidebar-icon)] group-hover:text-[var(--cc-sidebar-active-icon)]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Bottom Collapse Action */}
        <div className="p-3 border-t border-[var(--cc-sidebar-border)]">
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`flex items-center gap-2.5 w-full p-2.5 rounded-lg text-xs font-semibold text-[var(--cc-sidebar-icon)] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[var(--cc-sidebar-hover)] transition-colors cursor-pointer ${
                isCollapsed ? 'justify-center' : 'justify-start'
              }`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ArrowRight className="w-4 h-4 text-[var(--cc-sidebar-active-icon)] shrink-0" />
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 text-[var(--cc-sidebar-icon)] shrink-0" />
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
