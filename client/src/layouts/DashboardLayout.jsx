import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FB] text-[#172B3A]">
      {/* Top Header */}
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex">
        {/* Role-Specific Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Container */}
        <main className="flex-1 min-w-0 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
