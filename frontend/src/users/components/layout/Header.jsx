import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Globe, 
  Menu, 
  X, 
  User,
  Calendar,
  LogOut,
  ChevronDown,
  Home,
  Briefcase,
  Users,
  Info,
  MessageSquare
} from 'lucide-react';
import { performLogout } from '../auth/logout';

export const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
      if (!event.target.closest('.language-dropdown')) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Load user from storage
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem('user');
        setUser(stored ? JSON.parse(stored) : null);
      } catch (err) {
        setUser(null);
      }
    };
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  const handleLogout = () => {
    performLogout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Services', path: '/services', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'Professionals', path: '/professionals', icon: <Users className="w-4 h-4" /> },
    { name: 'About', path: '/about', icon: <Info className="w-4 h-4" /> },
    { name: 'Feedback', path: '/feedback', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'Tamil' },
    { code: 'si', name: 'Sinhala' },
  ];

  const profileMenu = [
    { name: 'Profile', icon: <User className="w-4 h-4" />, action: () => navigate('/profile') },
    { name: 'My Bookings', icon: <Calendar className="w-4 h-4" />, action: () => navigate('/profile') },
    { name: 'Logout', icon: <LogOut className="w-4 h-4" />, action: handleLogout, isDanger: true },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-800/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink 
                to="/" 
                className="flex items-center space-x-2 group"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg transform group-hover:scale-105 transition-transform duration-300">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                  LocalPro
                </span>
              </NavLink>
            </div>

            {/* Desktop Navigation Links - Center */}
            <div className="hidden md:flex items-center justify-center flex-1 mx-8">
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Language Selector */}
            <div className="relative language-dropdown">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{language}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.name);
                        setIsLanguageOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-between"
                    >
                      <span className="font-medium">{lang.name}</span>
                      {language === lang.name && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{user?.name || 'Guest'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'Not available'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {profileMenu.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => item.action()}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3 ${
                        item.isDanger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-300 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}

            {/* Language Selector - Mobile */}
            <div className="px-4 py-3">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Select Language</div>
              <div className="flex space-x-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.name);
                      setIsMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                      language === lang.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Menu - Mobile */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
              <div className="flex items-center space-x-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">John Doe</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">john@example.com</p>
                </div>
              </div>
              
              {profileMenu.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setIsMenuOpen(false);
                    item.action();
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg ${
                    item.isDanger
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};