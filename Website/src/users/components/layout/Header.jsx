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

  // Desktop dropdowns (LG+)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // -------------------------
  // Theme
  // -------------------------
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
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
      { code: "en", name: "English" },
      { code: "ta", name: "Tamil" },
      { code: "si", name: "Sinhala" },
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
    return `${parts[0]} ${parts[parts.length - 1][0]}`;
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
        className="sticky top-0 z-50 w-full border-b border-gray-200/70 bg-white/90 backdrop-blur dark:border-gray-800/70 dark:bg-gray-950/90"
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={reduceMotion ? {} : { opacity: 1, y: 0, transition: spring }}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Left: brand + desktop nav */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              {/* Brand */}
              <NavLink
                to="/"
                onClick={closeAll}
                className="inline-flex items-center rounded-xl px-2 py-1.5 transition hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
              >
                <span className="text-lg font-semibold tracking-tight sm:text-xl">
                  <span style={{ color: "#0f64c8" }}>Help</span>
                  <span style={{ color: "#1fa34a" }}>Go</span>
                </span>
              </NavLink>

              {/* Desktop nav (LG+) */}
              <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
                <div className="flex items-center gap-1 rounded-2xl border border-gray-200/70 bg-white/80 p-1 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/70">
                  {navLinks.map((link) => {
                    const active = isActivePath(link.path);
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={closeAll}
                        className={[
                          "group flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition cursor-pointer",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
                          active
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-700/20 dark:text-blue-200 dark:ring-blue-700/30"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900",
                        ].join(" ")}
                      >
                        <motion.span
                          className="opacity-80 transition group-hover:opacity-100"
                          {...(!reduceMotion
                            ? {
                                whileHover: { scale: 1.06 },
                                transition: {
                                  type: "spring",
                                  stiffness: 600,
                                  damping: 30,
                                },
                              }
                            : {})}
                        >
                          <Icon className="h-4 w-4" />
                        </motion.span>
                        <span className="truncate">{link.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: controls (no hamburger on mobile) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsLanguageOpen((v) => !v);
                    setIsProfileOpen(false);
                  }}
                  className={[
                    "group inline-flex items-center gap-2 rounded-xl border border-gray-200/70 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition",
                    "hover:bg-gray-50 hover:shadow-md dark:border-gray-800/70 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
                    "cursor-pointer",
                  ].join(" ")}
                  aria-expanded={isLanguageOpen}
                  aria-haspopup="menu"
                >
                  <Globe className="h-4 w-4 opacity-80 group-hover:opacity-100" />
                  <span className="hidden max-w-[140px] truncate sm:inline">
                    {language}
                  </span>
                  <motion.span
                    animate={
                      reduceMotion ? {} : { rotate: isLanguageOpen ? 180 : 0 }
                    }
                    transition={{ duration: 0.18 }}
                    style={{ display: "inline-flex" }}
                  >
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isLanguageOpen && (
                    <motion.div
                      key="language-panel"
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-950 dark:ring-white/10"
                      variants={dropdownPanel}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Language
                      </div>
                      <div className="pb-2">
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
                              className={[
                                "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition cursor-pointer",
                                "hover:bg-gray-50 dark:hover:bg-gray-900",
                                active
                                  ? "text-gray-900 dark:text-gray-50"
                                  : "text-gray-700 dark:text-gray-200",
                              ].join(" ")}
                              custom={i}
                              variants={dropdownItem}
                              initial="hidden"
                              animate="visible"
                              {...(!reduceMotion
                                ? {
                                    whileHover: { x: 2 },
                                    transition: {
                                      type: "spring",
                                      stiffness: 600,
                                      damping: 32,
                                    },
                                  }
                                : {})}
                            >
                              <span className="font-medium">{lang.name}</span>
                              <span
                                className={[
                                  "h-2 w-2 rounded-full transition",
                                  active
                                    ? "bg-blue-600"
                                    : "bg-gray-200 dark:bg-gray-800",
                                ].join(" ")}
                              />
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark mode */}
              <button
                type="button"
                onClick={() => setIsDarkMode((v) => !v)}
                className={[
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/70 bg-white text-gray-700 shadow-sm transition",
                  "hover:bg-gray-50 hover:shadow-md dark:border-gray-800/70 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
                  "cursor-pointer",
                ].join(" ")}
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
                      style={{ display: "inline-flex" }}
                    >
                      <Sun className="h-5 w-5 text-amber-500" />
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
                      style={{ display: "inline-flex" }}
                    >
                      <Moon className="h-5 w-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Profile (ALL viewports; fixes "not opening" by ensuring it exists everywhere) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    // Prevent any outside-click handler edge cases
                    e.stopPropagation();
                    setIsProfileOpen((v) => !v);
                    setIsLanguageOpen(false);
                  }}
                  className={[
                    "group inline-flex items-center gap-2 rounded-2xl p-1 transition",
                    "hover:bg-gray-100 dark:hover:bg-gray-900",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
                    "cursor-pointer",
                  ].join(" ")}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                >
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    {...(!reduceMotion
                      ? {
                          whileHover: { scale: 1.03 },
                          whileTap: { scale: 0.98 },
                          transition: {
                            type: "spring",
                            stiffness: 650,
                            damping: 34,
                          },
                        }
                      : {})}
                    style={{ willChange: "transform" }}
                  >
                    <User className="h-5 w-5" />
                  </motion.div>

                  <motion.span
                    className="hidden sm:inline-flex"
                    animate={
                      reduceMotion ? {} : { rotate: isProfileOpen ? 180 : 0 }
                    }
                    transition={{ duration: 0.18 }}
                    style={{ display: "inline-flex" }}
                  >
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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
