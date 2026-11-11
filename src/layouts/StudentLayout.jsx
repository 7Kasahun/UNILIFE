import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import PwaInstallBanner from '../components/PwaInstallBanner.jsx';

export default function StudentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-brand-text">
      {/* PWA Install Banner */}
      <PwaInstallBanner />

      {/* Main Container */}
      <div className="flex-1 flex flex-row">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <Navbar
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
