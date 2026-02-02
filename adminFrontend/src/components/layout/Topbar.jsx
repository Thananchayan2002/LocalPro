import React, { useState } from 'react';
import { Menu, Bell, LogOut, LayoutDashboard, Briefcase, Users, Calendar, ClipboardList, CreditCard, TrendingUp, UserCog } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ConfirmModal } from '../common/ConfirmModal';

export const Topbar = ({ onMenuClick }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  // Get page title and icon based on current route
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return { title: 'Dashboard', icon: LayoutDashboard };
    if (path === '/services') return { title: 'Services', icon: Briefcase };
    if (path === '/professionals') return { title: 'Professionals', icon: Users };
    if (path === '/active-bookings') return { title: 'Active Bookings', icon: ClipboardList };
    if (path === '/bookings') return { title: 'Bookings', icon: Calendar };
    if (path === '/payments') return { title: 'Payments', icon: CreditCard };
    if (path === '/revenue') return { title: 'Revenue', icon: TrendingUp };
    if (path === '/notifications') return { title: 'Notifications', icon: Bell };
    if (path === '/account') return { title: 'Account', icon: UserCog };
    return { title: 'Dashboard', icon: LayoutDashboard };
  };

  const pageInfo = getPageInfo();
  const PageIcon = pageInfo.icon;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/90 backdrop-blur-lg border-b border-gray-200 z-30 shadow-md">
      <div className="flex items-center justify-between h-full px-3 lg:px-6">
        {/* Left section - Menu button and Brand (Mobile) */}
        <div className="flex items-center gap-3">
          {/* Styled Menu button for mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <Menu size={20} />
          </button>

          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                LocalPro
              </h1>
            </div>
          </div>

          {/* Desktop - Styled Page Title */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
              <PageIcon size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {pageInfo.title}
            </h2>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group">
            <Bell size={20} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Logout button with red shades */}
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 transition-all duration-200 group active:scale-95"
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="block text-sm font-medium">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Logout Confirm Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        isDangerous={true}
        position="right"
      />
    </header>
  );
};
