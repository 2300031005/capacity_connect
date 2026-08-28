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
  UserCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'trainee';

  const roleNavItems = {
    trainee: [
      { name: 'Dashboard', path: '/trainee/dashboard', icon: LayoutDashboard, exact: true },
      { name: 'My Courses', path: '#', icon: BookOpen, comingSoon: true },
      { name: 'Assessments', path: '#', icon: FileCheck, comingSoon: true },
      { name: 'My Skills', path: '#', icon: Target, comingSoon: true },
      { name: 'Progress', path: '#', icon: Award, comingSoon: true },
    ],
    trainer: [
      { name: 'Dashboard', path: '/trainer/dashboard', icon: LayoutDashboard, exact: true },
      { name: 'Courses', path: '#', icon: BookOpen, comingSoon: true },
      { name: 'Assessments', path: '#', icon: FileCheck, comingSoon: true },
      { name: 'Learners', path: '#', icon: Users, comingSoon: true },
      { name: 'Analytics', path: '#', icon: BarChart3, comingSoon: true },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { name: 'Users', path: '#', icon: Users, comingSoon: true },
      { name: 'Courses', path: '#', icon: BookOpen, comingSoon: true },
      { name: 'Competencies', path: '#', icon: Layers, comingSoon: true },
      { name: 'Analytics', path: '#', icon: BarChart3, comingSoon: true },
    ],
  };

  const navItems = roleNavItems[role] || roleNavItems.trainee;

  const roleBadgeInfo = {
    trainee: { label: 'Trainee Space', icon: GraduationCap, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    trainer: { label: 'Trainer Hub', icon: UserCheck, color: 'bg-teal-50 text-teal-700 border-teal-200' },
    admin: { label: 'Administrator', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Role Badge */}
          <div className="p-4 border-b border-slate-100">
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
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
          <p className="font-semibold text-slate-600">Capacity Connect</p>
          <p className="text-[11px]">Phase 2 &bull; Role Protected</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
