import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cognisphere_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cognisphere_sidebar_collapsed', String(next));
      } catch (e) {
        console.warn('Unable to persist sidebar state:', e);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] transition-colors">
      {/* Top Header */}
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Main Workspace with Collapsible Sidebar */}
      <div className="flex-1 flex w-full">
        {/* Role-Specific Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Content Container */}
        <main className="flex-1 min-w-0 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 transition-all duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
