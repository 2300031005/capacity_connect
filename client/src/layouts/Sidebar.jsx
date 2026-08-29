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
  User
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
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
    trainee: { label: 'Trainee Space', icon: GraduationCap, color: 'bg-blue-50 text-[#005A8D] border-[#D7E0E7]' },
    trainer: { label: 'Trainer Hub', icon: UserCheck, color: 'bg-[#F7F9FB] text-[#526575] border-[#D7E0E7]' },
    admin: { label: 'Administrator', icon: ShieldCheck, color: 'bg-[#F7F9FB] text-[#16834B] border-[#D7E0E7]' },
  };

  const currentBadge = roleBadgeInfo[role] || roleBadgeInfo.trainee;
  const RoleIcon = currentBadge.icon;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 min-w-[16rem] bg-white border-r border-[#D7E0E7] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:z-0 flex flex-col justify-between shrink-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Role Badge */}
          <div className="p-4 border-b border-[#D7E0E7]">
            <div className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-semibold ${currentBadge.color}`}>
              <RoleIcon className="w-4 h-4" />
              <span>{currentBadge.label}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              if (item.comingSoon) {
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2.5 rounded text-sm text-slate-400 cursor-not-allowed select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      Soon
                    </span>
                  </div>
                );
              }

              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  end={item.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-[#005A8D] font-semibold'
                        : 'text-[#526575] hover:text-[#172B3A] hover:bg-[#F7F9FB]'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${ 
                    /* Icon inherits parent color from NavLink className above */ '' 
                  }`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-[#D7E0E7] text-xs">
          <p className="font-semibold text-[#0B3D62]">PRAGATI</p>
          <p className="text-[11px] text-[#526575]">Digital Capacity Building Platform</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
