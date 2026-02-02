import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Sun,
  Moon,
  Globe,
  X,
  User,
  Calendar,
  LogOut,
  ChevronDown,
  Home,
  Briefcase,
  Users,
  Info,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../worker/context/AuthContext";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  LayoutGroup,
} from "framer-motion";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const headerRef = useRef(null);
  const { logout, user, loading: authLoading } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [isScrolled, setIsScrolled] = useState(false);

  // Desktop dropdowns (LG+)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // -------------------------
  // Scroll effect
  // -------------------------
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -------------------------
  // Theme
  // -------------------------
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [isDarkMode]);

  // -------------------------
  // Close dropdowns
  // -------------------------
  const closeAll = useCallback(() => {
    setIsProfileOpen(false);
    setIsLanguageOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAll]);

  useEffect(() => {
    const onClick = (e) => {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(e.target)) closeAll();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [closeAll]);

  // -------------------------
  // Actions
  // -------------------------
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const navLinks = useMemo(
    () => [
      { name: "Home", path: "/app", icon: Home },
      { name: "Services", path: "/app/services", icon: Briefcase },
      { name: "Professionals", path: "/app/professionals", icon: Users },
      { name: "About", path: "/app/about", icon: Info },
      { name: "Feedback", path: "/app/feedback", icon: MessageSquare },
    ],
    [],
  );

  const languages = useMemo(
    () => [
      { code: "en", name: "English", flag: "🇺🇸" },
      { code: "ta", name: "Tamil", flag: "🇮🇳" },
      { code: "si", name: "Sinhala", flag: "🇱🇰" },
    ],
    [],
  );

  const profileMenu = useMemo(
    () => [
      { name: "Profile", icon: User, action: () => navigate("/app/profile") },
      {
        name: "My Bookings",
        icon: Calendar,
        action: () => navigate("/app/bookings"),
      },
      { name: "Logout", icon: LogOut, action: handleLogout, isDanger: true },
    ],
    [handleLogout, navigate],
  );

  const displayName = useMemo(() => {
    if (!user?.name) return "Guest";
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }, [user]);

  // -------------------------
  // Motion
  // -------------------------
  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 520, damping: 34, mass: 0.9 };

  const dropdownPanel = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: -8, scale: 0.98, filter: "blur(4px)" },
    visible: reduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { ...spring },
        },
    exit: reduceMotion
      ? { opacity: 1 }
      : {
          opacity: 0,
          y: -6,
          scale: 0.985,
          filter: "blur(4px)",
          transition: { duration: 0.16 },
        },
  };

  const dropdownItem = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 },
    visible: (i = 0) =>
      reduceMotion
        ? { opacity: 1 }
        : {
            opacity: 1,
            y: 0,
            transition: { ...spring, delay: 0.03 + i * 0.03 },
          },
  };

  // -------------------------
  // Helpers
  // -------------------------
  const isActivePath = (path) => location.pathname === path;

  return (
    <LayoutGroup>
      <motion.nav
        ref={headerRef}
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-gray-200/80 bg-white/95 backdrop-blur-xl shadow-lg dark:border-gray-800/80 dark:bg-gray-950/95"
            : "border-b border-gray-100/50 bg-white/90 backdrop-blur-lg dark:border-gray-900/50 dark:bg-gray-950/90"
        }`}
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: spring }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: brand + desktop nav */}
            <div className="flex items-center gap-6 lg:gap-10">
              {/* Brand */}
              <NavLink
                to="/"
                onClick={closeAll}
                className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-900/80 cursor-pointer"
              >
                <div className="flex flex-row">
                    <img 
                      src="/src/assets/images/logoHeader.png" 
                      alt="HelpGo Logo" 
                      className="h-8 md:h-10 mt-2 md:mt-0 w-auto"
                    />
                      <span className="text-2xl font-bold tracking-tight sm:text-xl">
                      <span style={{ color: "#0f64c8" }}>Help</span>
                      <span style={{ color: "#1fa34a" }}>Go</span>
                      </span>
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 -mt-1">
                  </span>
                </div>
              </NavLink>

              {/* Desktop nav (LG+) */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const active = isActivePath(link.path);
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onClick={closeAll}
                      className={`
                        group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2
                        ${
                          active
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        }
                      `}
                    >
                      <motion.span
                        className="relative"
                        {...(!reduceMotion
                          ? {
                              whileHover: { scale: 1.1 },
                              transition: {
                                type: "spring",
                                stiffness: 600,
                                damping: 30,
                              },
                            }
                          : {})}
                      >
                        <Icon
                          className={`h-4 w-4 transition-all duration-200 ${
                            active
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                          }`}
                        />
                      </motion.span>
                      <span className="relative">
                        {link.name}
                        {active && (
                          <motion.div
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                            layoutId="activeTab"
                            transition={spring}
                          />
                        )}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2">
              {/* Language */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsLanguageOpen((v) => !v);
                    setIsProfileOpen(false);
                  }}
                  className={`
                    group inline-flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium 
                    transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
                    cursor-pointer
                    ${isLanguageOpen ? "ring-2 ring-blue-500/20" : ""}
                  `}
                  aria-expanded={isLanguageOpen}
                  aria-haspopup="menu"
                >
                  <Globe className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
                  <span className="hidden text-gray-700 dark:text-gray-300 sm:inline">
                    {language}
                  </span>
                  <motion.span
                    animate={
                      reduceMotion ? {} : { rotate: isLanguageOpen ? 180 : 0 }
                    }
                    transition={{ duration: 0.2 }}
                    className="text-gray-400"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isLanguageOpen && (
                    <motion.div
                      key="language-panel"
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white 
                        shadow-2xl ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-900 dark:ring-white/10"
                      variants={dropdownPanel}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Select Language
                        </div>
                        <div className="space-y-1">
                          {languages.map((lang, i) => {
                            const active = language === lang.name;
                            return (
                              <motion.button
                                key={lang.code}
                                type="button"
                                onClick={() => {
                                  setLanguage(lang.name);
                                  setIsLanguageOpen(false);
                                }}
                                className={`
                                  flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm 
                                  transition-all duration-150 cursor-pointer
                                  ${
                                    active
                                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }
                                `}
                                custom={i}
                                variants={dropdownItem}
                                initial="hidden"
                                animate="visible"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{lang.flag}</span>
                                  <span className="font-medium">{lang.name}</span>
                                </div>
                                {active && (
                                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark mode */}
              <button
                type="button"
                onClick={() => setIsDarkMode((v) => !v)}
                className={`
                  inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white 
                  text-gray-700 shadow-sm transition-all duration-200 hover:shadow-md 
                  dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:shadow-lg
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
                  cursor-pointer
                `}
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDarkMode ? (
                    <motion.span
                      key="sun"
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, rotate: -30, scale: 0.95 }
                      }
                      animate={
                        reduceMotion
                          ? {}
                          : {
                              opacity: 1,
                              rotate: 0,
                              scale: 1,
                              transition: spring,
                            }
                      }
                      exit={
                        reduceMotion
                          ? {}
                          : {
                              opacity: 0,
                              rotate: 25,
                              scale: 0.95,
                              transition: { duration: 0.12 },
                            }
                      }
                    >
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur" />
                        <Sun className="relative h-5 w-5 text-amber-500" />
                      </div>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, rotate: 30, scale: 0.95 }
                      }
                      animate={
                        reduceMotion
                          ? {}
                          : {
                              opacity: 1,
                              rotate: 0,
                              scale: 1,
                              transition: spring,
                            }
                      }
                      exit={
                        reduceMotion
                          ? {}
                          : {
                              opacity: 0,
                              rotate: -25,
                              scale: 0.95,
                              transition: { duration: 0.12 },
                            }
                      }
                    >
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur" />
                        <Moon className="relative h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </div>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen((v) => !v);
                    setIsLanguageOpen(false);
                  }}
                  className={`
                    group inline-flex items-center gap-2.5 rounded-xl px-1 transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
                    cursor-pointer ${isProfileOpen ? "ring-2 ring-blue-500/20" : ""}
                  `}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                >
                  <motion.div
                    className="relative"
                    {...(!reduceMotion
                      ? {
                          whileHover: { scale: 1.05 },
                          whileTap: { scale: 0.95 },
                          transition: {
                            type: "spring",
                            stiffness: 650,
                            damping: 34,
                          },
                        }
                      : {})}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 blur opacity-50 group-hover:opacity-70 transition-opacity" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-600 
                      text-white shadow-lg ring-2 ring-white dark:ring-gray-900">
                      {user?.name ? (
                        <span className="font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                  </motion.div>

                  <div className="hidden flex-col items-start sm:flex">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {authLoading ? "Loading..." : displayName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role || "User"}
                    </span>
                  </div>

                  <motion.span
                    animate={
                      reduceMotion ? {} : { rotate: isProfileOpen ? 180 : 0 }
                    }
                    transition={{ duration: 0.2 }}
                    className="text-gray-400"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                        key="profile-panel"
                        className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-950 dark:ring-white/10"
                        variants={dropdownPanel}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-900">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                            <User className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
                            {authLoading ? "Loading..." : displayName}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {user?.email || "Not available"}
                          </p>
                        </div>
                      </div>
                
                      <div className="py-2">
                        {profileMenu.map((item, i) => {
                          const Icon = item.icon;
                            return (
                              <motion.button
                                key={item.name}
                                type="button"
                                onClick={() => {
                                setIsProfileOpen(false);
                                item.action();
                              }}
                                className={[
                                  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold transition cursor-pointer",
                                  item.isDanger
                                    ? "text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900",
                                ].join(" ")}
                                  custom={i}
                                  variants={dropdownItem}
                                  initial="hidden"
                                  animate="visible"
                                  {...(!reduceMotion
                                      ? {
                                      whileHover: { x: 2 },
                                      whileTap: { scale: 0.99 },
                                      transition: {
                                      type: "spring",
                                      stiffness: 650,
                                      damping: 34,
                                    },
                                  }
                              : {})}
                              >
                                <Icon className="h-4 w-4 opacity-85" />
                                <span>{item.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    </LayoutGroup>
  );
};