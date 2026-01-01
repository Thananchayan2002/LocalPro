import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  CreditCard,
  TrendingUp,
  Bell,
  UserCog,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { path: '/worker/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/worker/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/worker/payments', icon: CreditCard, label: 'Payments' },
    { path: '/worker/services', icon: Briefcase, label: 'Services' },
    { path: '/worker/revenue', icon: TrendingUp, label: 'Revenue' },
    { path: '/worker/notifications', icon: Bell, label: 'Notifications' },
    { path: '/worker/account', icon: UserCog, label: 'Account' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950
          text-white w-64 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl border-r border-purple-500/20
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold">LP</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent">
              LocalPro
            </h1>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/50 scale-105'
                    : 'hover:bg-white/10 hover:translate-x-1'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-500/20">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
            <p className="text-xs text-purple-200 text-center">
              © 2026 LocalPro Worker
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
