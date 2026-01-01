import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <Topbar onMenuClick={toggleSidebar} />

      <main className="lg:ml-64 min-h-screen">
        <div className="p-0 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
