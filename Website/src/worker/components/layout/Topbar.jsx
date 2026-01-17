import React, { useState, useEffect } from 'react';
import { Menu, Bell, LogOut, LayoutDashboard, Briefcase, Calendar, CreditCard, TrendingUp, UserCog, Power } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { authFetch } from '../../../utils/authFetch';

export const Topbar = ({ onMenuClick }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAvailabilityConfirm, setShowAvailabilityConfirm] = useState(false);
  const [pendingAvailability, setPendingAvailability] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Get page title and icon based on current route
  const getPageInfo = () => {
    const path = location.pathname.replace(/^\/worker/, '') || '/';
    if (path === '/' || path === '/dashboard') return { title: 'Dashboard', icon: LayoutDashboard };
    if (path === '/services') return { title: 'Services', icon: Briefcase };
    if (path === '/bookings') return { title: 'Bookings', icon: Calendar };
    if (path === '/payments') return { title: 'Payments', icon: CreditCard };
    if (path === '/notifications') return { title: 'Notifications', icon: Bell };
    if (path === '/account') return { title: 'Account', icon: UserCog };
    return { title: 'Dashboard', icon: LayoutDashboard };
  };

  const pageInfo = getPageInfo();
  const PageIcon = pageInfo.icon;

  // Fetch current availability status
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.professionalId) return;
      
      try {
        const res = await authFetch(`${apiUrl}/api/worker/availability/${user.professionalId}`);
        const data = await res.json();
        
        if (data.success) {
          setIsAvailable(data.isAvailable);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      }
    };

    fetchAvailability();
  }, [user?.professionalId, apiUrl]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  }; 

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  const handleToggleClick = () => {
    setPendingAvailability(!isAvailable);
    setShowAvailabilityConfirm(true);
  };

  const confirmAvailabilityToggle = async () => {
    setLoading(true);
    setShowAvailabilityConfirm(false);

    try {
      const res = await authFetch(`${apiUrl}/api/worker/availability/${user.professionalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAvailable: pendingAvailability })
      });

      const data = await res.json();

      if (data.success) {
        setIsAvailable(pendingAvailability);
        toast.success(`You are now ${pendingAvailability ? 'available' : 'unavailable'} for bookings`);
      } else {
        toast.error(data.message || 'Failed to update availability');
      }
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setLoading(false);
      setPendingAvailability(null);
    }
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
          {/* Availability Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
            <Power className={`${isAvailable ? 'text-green-600' : 'text-red-600'}`} size={18} />
            <span className="hidden sm:inline text-sm font-medium text-gray-700">
              {isAvailable ? 'Available' : 'Unavailable'}
            </span>
            <button
              onClick={handleToggleClick}
              disabled={loading}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isAvailable ? 'bg-green-600' : 'bg-gray-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  isAvailable ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Logout button with red shades */}
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 transition-all duration-200 group active:scale-95"
          >
            <LogOut size={18} className="group-hover:rotate-12 text-white transition-transform" />
            <span className="block text-sm font-medium text-white">
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

      {/* Availability Confirm Modal */}
      <ConfirmModal
        isOpen={showAvailabilityConfirm}
        title="Confirm Availability Change"
        message={`Are you sure you want to change your availability status to ${pendingAvailability ? 'Available' : 'Unavailable'}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={confirmAvailabilityToggle}
        onCancel={() => {
          setShowAvailabilityConfirm(false);
          setPendingAvailability(null);
        }}
        isDangerous={!pendingAvailability}
        position="right"
      />
    </header>
  );
};
