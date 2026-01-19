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
  MessageSquare,
} from "lucide-react";
import { performLogout } from "../../../auth/Logout";
import { useAuth } from "../../../worker/context/AuthContext";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  LayoutGroup,
} from "framer-motion";

export const Header = () => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");

  // Mobile/Tablet hamburger menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Desktop dropdowns (LG+)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const { user, loading: loadingUser } = useAuth();

  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const headerRef = useRef(null);

  // -------------------------
  // Theme
  // -------------------------
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  // -------------------------
  // Close panels on outside click / ESC
  // -------------------------
  const closeAll = useCallback(() => {
    setIsProfileOpen(false);
    setIsLanguageOpen(false);
    setIsMenuOpen(false);
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
      if (!headerRef.current.contains(e.target)) {
        setIsProfileOpen(false);
        setIsLanguageOpen(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // -------------------------
  // Actions
  // -------------------------
  const handleLogout = useCallback(() => {
    performLogout();
    closeAll();
    navigate("/", { replace: true });
  }, [closeAll, navigate]);

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
      {
        name: "Profile",
        icon: User,
        action: () => navigate("/app/profile"),
      },
      {
        name: "My Bookings",
        icon: Calendar,
        action: () => navigate("/app/bookings"),
      },
      {
        name: "Logout",
        icon: LogOut,
        action: handleLogout,
        isDanger: true,
      },
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
  // Motion variants
  // -------------------------
  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 34, mass: 0.9 };

  const headerEnter = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 },
    visible: reduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0, transition: { ...spring } },
  };

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

  const mobileMenuPanel = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: -10, scale: 0.98, filter: "blur(4px)" },
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
          y: -10,
          scale: 0.985,
          filter: "blur(4px)",
          transition: { duration: 0.16 },
        },
  };

  const subtleHover = reduceMotion
    ? {}
    : {
        whileHover: { y: -1 },
        whileTap: { scale: 0.98 },
        transition: { ...spring },
      };

  const iconSpin = reduceMotion
    ? {}
    : {
        whileHover: { rotate: 10 },
        transition: { type: "spring", stiffness: 500, damping: 28 },
      };

  // -------------------------
  // Helpers
  // -------------------------
  const NavItem = ({ link, onSelect }) => {
    const Icon = link.icon;
    const isActive = location.pathname === link.path;
    return (
      <NavLink
        to={link.path}
        onClick={onSelect}
        className={[
          "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
          isActive
            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900",
        ].join(" ")}
      >
        <motion.span
          className="opacity-80 transition group-hover:opacity-100"
          {...(!reduceMotion
            ? {
                whileHover: { scale: 1.05 },
                transition: { type: "spring", stiffness: 520, damping: 28 },
              }
            : {})}
        >
          <Icon className="h-4 w-4" />
        </motion.span>
        <span className="truncate">{link.name}</span>
      </NavLink>
    );
  };

  return (
    <LayoutGroup>
      <motion.nav
        ref={headerRef}
        className="header-nav sticky top-0  w-full border-b border-gray-200/70 bg-white/80 backdrop-blur-xl dark:border-gray-800/70 dark:bg-gray-950/70"
        variants={headerEnter}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Left */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              {/* Logo */}
              <motion.div
                {...(reduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: -6 },
                      animate: { opacity: 1, y: 0, transition: { ...spring } },
                    })}
              >
                <NavLink
                  to="/"
                  className="group inline-flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-100 dark:hover:bg-gray-900"
                  onClick={() => closeAll()}
                >
                  <motion.span
                    className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50 sm:text-xl md:text-2xl"
                    {...(!reduceMotion
                      ? {
                          initial: { opacity: 0, y: -4, filter: "blur(4px)" },
                          animate: {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: { ...spring, delay: 0.04 },
                          },
                        }
                      : {})}
                  >
                    <motion.span
                      style={{ color: "#0f64c8" }}
                      {...(!reduceMotion
                        ? {
                            initial: { opacity: 0, x: -8 },
                            animate: {
                              opacity: 1,
                              x: 0,
                              transition: { ...spring, delay: 0.08 },
                            },
                          }
                        : {})}
                    >
                      Help
                    </motion.span>
                    <motion.span
                      style={{ color: "#1fa34a" }}
                      {...(!reduceMotion
                        ? {
                            initial: { opacity: 0, x: 8 },
                            animate: {
                              opacity: 1,
                              x: 0,
                              transition: { ...spring, delay: 0.12 },
                            },
                          }
                        : {})}
                    >
                      Go
                    </motion.span>
                  </motion.span>
                </NavLink>
              </motion.div>

              {/* Desktop nav (LG+) */}
              <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
                <motion.div
                  className="flex items-center gap-1 rounded-2xl border border-gray-200/70 bg-gray-50/80 p-1 shadow-sm dark:border-gray-800/70 dark:bg-gray-900/60"
                  {...(!reduceMotion
                    ? {
                        initial: { opacity: 0, y: -8 },
                        animate: {
                          opacity: 1,
                          y: 0,
                          transition: { ...spring, delay: 0.08 },
                        },
                      }
                    : {})}
                >
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.name}
                      {...subtleHover}
                      {...(reduceMotion
                        ? {}
                        : {
                            initial: { opacity: 0, y: -6 },
                            animate: {
                              opacity: 1,
                              y: 0,
                              transition: {
                                ...spring,
                                delay: 0.12 + idx * 0.03,
                              },
                            },
                          })}
                      style={{ willChange: "transform" }}
                    >
                      <NavItem link={link} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Right (language + theme always visible) */}
            <motion.div
              className="flex items-center gap-2 sm:gap-3"
              {...(!reduceMotion
                ? {
                    initial: { opacity: 0, y: -8 },
                    animate: {
                      opacity: 1,
                      y: 0,
                      transition: { ...spring, delay: 0.12 },
                    },
                  }
                : {})}
            >
              {/* Language (always visible) */}
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsLanguageOpen((v) => !v);
                    setIsProfileOpen(false);
                    setIsMenuOpen(false);
                  }}
                  className={[
                    "group inline-flex items-center gap-2 rounded-xl border border-gray-200/70 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition",
                    "hover:bg-gray-50 hover:shadow-md dark:border-gray-800/70 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
                    "cursor-pointer",
                  ].join(" ")}
                  aria-expanded={isLanguageOpen}
                  aria-haspopup="menu"
                  {...subtleHover}
                  style={{ willChange: "transform" }}
                >
                  <motion.span {...iconSpin} style={{ display: "inline-flex" }}>
                    <Globe className="h-4 w-4 opacity-80 group-hover:opacity-100" />
                  </motion.span>
                  <span className="hidden max-w-[140px] truncate sm:inline">
                    {language}
                  </span>
                  <motion.span
                    animate={
                      reduceMotion ? {} : { rotate: isLanguageOpen ? 180 : 0 }
                    }
                    transition={{ duration: 0.2 }}
                    style={{ display: "inline-flex" }}
                  >
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </motion.span>
                </motion.button>

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
                                "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition",
                                "hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer",
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
                                      stiffness: 500,
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

              {/* Dark mode (always visible) */}
              <motion.button
                type="button"
                onClick={() => setIsDarkMode((v) => !v)}
                className={[
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/70 bg-white text-gray-700 shadow-sm transition",
                  "hover:bg-gray-50 hover:shadow-md dark:border-gray-800/70 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
                  "cursor-pointer",
                ].join(" ")}
                aria-label="Toggle dark mode"
                {...subtleHover}
                style={{ willChange: "transform" }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDarkMode ? (
                    <motion.span
                      key="sun"
                      {...(reduceMotion
                        ? {}
                        : {
                            initial: { opacity: 0, rotate: -30, scale: 0.9 },
                            animate: {
                              opacity: 1,
                              rotate: 0,
                              scale: 1,
                              transition: { ...spring },
                            },
                            exit: {
                              opacity: 0,
                              rotate: 25,
                              scale: 0.9,
                              transition: { duration: 0.12 },
                            },
                          })}
                      style={{ display: "inline-flex" }}
                    >
                      <Sun className="h-5 w-5 text-amber-500" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      {...(reduceMotion
                        ? {}
                        : {
                            initial: { opacity: 0, rotate: 30, scale: 0.9 },
                            animate: {
                              opacity: 1,
                              rotate: 0,
                              scale: 1,
                              transition: { ...spring },
                            },
                            exit: {
                              opacity: 0,
                              rotate: -25,
                              scale: 0.9,
                              transition: { duration: 0.12 },
                            },
                          })}
                      style={{ display: "inline-flex" }}
                    >
                      <Moon className="h-5 w-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Profile (desktop LG+) */}
              <div className="relative hidden lg:block">
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen((v) => !v);
                    setIsLanguageOpen(false);
                    setIsMenuOpen(false);
                  }}
                  className={[
                    "group inline-flex items-center gap-2 rounded-2xl border border-transparent bg-transparent p-1 transition",
                    "hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
                  ].join(" ")}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                  {...subtleHover}
                  style={{ willChange: "transform" }}
                >
                  <div className="relative">
                    <motion.div
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-black/5 transition group-hover:shadow-md dark:ring-white/10"
                      {...(!reduceMotion
                        ? {
                            whileHover: { scale: 1.03 },
                            transition: {
                              type: "spring",
                              stiffness: 520,
                              damping: 30,
                            },
                          }
                        : {})}
                      style={{ willChange: "transform" }}
                    >
                      <User className="h-5 w-5" />
                    </motion.div>

                    <motion.span
                      className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-gray-950"
                      {...(!reduceMotion
                        ? {
                            initial: { scale: 0.8, opacity: 0.6 },
                            animate: {
                              scale: [0.95, 1.05, 0.95],
                              opacity: 1,
                              transition: {
                                duration: 1.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                              },
                            },
                          }
                        : {})}
                      style={{ willChange: "transform" }}
                    />
                  </div>

                  <motion.span
                    animate={
                      reduceMotion ? {} : { rotate: isProfileOpen ? 180 : 0 }
                    }
                    transition={{ duration: 0.2 }}
                    style={{ display: "inline-flex" }}
                  >
                    <ChevronDown
                      className={[
                        "h-4 w-4 text-gray-500 transition-transform duration-200 dark:text-gray-400",
                        isProfileOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      key="profile-panel"
                      className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-950 dark:ring-white/10"
                      variants={dropdownPanel}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-900">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
                            {displayName}
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
                                  ? "text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
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
                                      stiffness: 520,
                                      damping: 32,
                                    },
                                  }
                                : {})}
                            >
                              <span className="opacity-80">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span>{item.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hamburger menu (tablet + mobile only) */}
              <motion.button
                type="button"
                onClick={() => {
                  setIsMenuOpen((v) => !v);
                  setIsProfileOpen(false);
                  setIsLanguageOpen(false);
                }}
                className={[
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/70 bg-white text-gray-700 shadow-sm transition lg:hidden",
                  "hover:bg-gray-50 hover:shadow-md dark:border-gray-800/70 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
                  "cursor-pointer",
                ].join(" ")}
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                {...subtleHover}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMenuOpen ? (
                    <motion.span
                      key="x"
                      initial={
                        reduceMotion
                          ? {}
                          : { opacity: 0, rotate: -20, scale: 0.95 }
                      }
                      animate={
                        reduceMotion
                          ? {}
                          : {
                              opacity: 1,
                              rotate: 0,
                              scale: 1,
                              transition: { ...spring },
                            }
                      }
                      exit={
                        reduceMotion
                          ? {}
                          : {
                              opacity: 0,
                              rotate: 20,
                              scale: 0.95,
                              transition: { duration: 0.12 },
                            }
                      }
                      style={{ display: "inline-flex" }}
                    >
                      <X className="h-6 w-6" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={
                        reduceMotion
                          ? {}
                          : { opacity: 0, rotate: 20, scale: 0.95 }
                      }
                      animate={
                        reduceMotion
                          ? {}
                          : {
                              opacity: 1,
                              rotate: 0,
                              scale: 1,
                              transition: { ...spring },
                            }
                      }
                      exit={
                        reduceMotion
                          ? {}
                          : {
                              opacity: 0,
                              rotate: -20,
                              scale: 0.95,
                              transition: { duration: 0.12 },
                            }
                      }
                      style={{ display: "inline-flex" }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Mobile/Tablet menu panel (hamburger) */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Panel */}
              <motion.div
                className="fixed left-1/2 top-20 z-[9999] w-[92vw] max-w-md -translate-x-1/2 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-950 dark:ring-white/10 lg:hidden"
                variants={mobileMenuPanel}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
              >
                {/* Profile header */}
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-900">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {loadingUser ? "Loading..." : displayName}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {user?.email || "Not available"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/70 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800/70 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
                  {/* Nav */}
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Navigation
                    </p>
                    <div className="grid gap-1">
                      {navLinks.map((link) => (
                        <NavItem
                          key={link.name}
                          link={link}
                          onSelect={() => setIsMenuOpen(false)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Account */}
                  <div className="rounded-2xl border border-gray-200/70 bg-white p-3 dark:border-gray-800/70 dark:bg-gray-950">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Account
                    </p>
                    <div className="grid gap-1">
                      {profileMenu.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false);
                              item.action();
                            }}
                            className={[
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                              item.isDanger
                                ? "bg-red-600 text-white hover:bg-red-500"
                                : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900",
                            ].join(" ")}
                            custom={i}
                            variants={dropdownItem}
                            initial="hidden"
                            animate="visible"
                          >
                            <Icon className="h-4 w-4 opacity-90" />
                            <span>{item.name}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500 dark:border-gray-900 dark:text-gray-400">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Session: {user ? "Signed in" : "Guest"}
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>
    </LayoutGroup>
  );
};
