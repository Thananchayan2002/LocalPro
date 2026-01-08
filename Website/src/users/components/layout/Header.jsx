import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  X,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  User,
  Calendar,
  LogOut,
  Home,
  Briefcase,
  Users,
  Info,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getColorClasses } from "../../../styles/colors";
import logo from "../../../assets/images/logo.png";
import { performLogout } from "../auth/logout";
import MobileHeader from "./MobileHeader";

const STORAGE_KEYS = {
  theme: "helpgo_theme",
  language: "helpgo_language",
};

function Header() {
  const navigate = useNavigate();
  const colorClasses = getColorClasses();

  // ===== Dynamic state =====
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ===== Enhanced state =====
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);

  const profileRef = useRef(null);
  const languageRef = useRef(null);

  const languages = useMemo(
    () => [
      { code: "en", name: "English" },
      { code: "ta", name: "Tamil" },
      { code: "hi", name: "Hindi" },
      { code: "ml", name: "Malayalam" },
      { code: "te", name: "Telugu" },
    ],
    []
  );

  const navLinks = useMemo(
    () => [
      { name: "Home", path: "/app", icon: <Home className="h-4 w-4" /> },
      {
        name: "Services",
        path: "/app/services",
        icon: <Briefcase className="h-4 w-4" />,
      },
      { name: "About", path: "/app/about", icon: <Info className="h-4 w-4" /> },
      {
        name: "Feedback",
        path: "/app/feedback",
        icon: <MessageSquare className="h-4 w-4" />,
      },
    ],
    []
  );

  const closeAllMenus = useCallback(() => {
    setIsProfileOpen(false);
    setIsLanguageOpen(false);
    setMobileMenuOpen(false);
  }, []);

  const handleLogoActivate = useCallback(
    (e) => {
      if (e.type === "click" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        closeAllMenus();
        navigate("/");
      }
    },
    [closeAllMenus, navigate]
  );

  const handleLogout = useCallback(() => {
    performLogout();
    closeAllMenus();
    navigate("/", { replace: true });
  }, [closeAllMenus, navigate]);

  const profileMenu = useMemo(
    () => [
      {
        name: "Profile",
        icon: <User className="h-4 w-4" />,
        action: () => {
          closeAllMenus();
          navigate("/app/profile");
        },
      },
      {
        name: "My Bookings",
        icon: <Calendar className="h-4 w-4" />,
        action: () => {
          closeAllMenus();
          navigate("/app/bookings");
        },
      },
      {
        name: "Logout",
        icon: <LogOut className="h-4 w-4" />,
        action: handleLogout,
        isDanger: true,
      },
    ],
    [closeAllMenus, navigate, handleLogout]
  );

  // ================== Theme persistence + Tailwind "dark" class ==================
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === "dark") setIsDarkMode(true);
      if (saved === "light") setIsDarkMode(false);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    try {
      localStorage.setItem(STORAGE_KEYS.theme, isDarkMode ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // ================== Language persistence ==================
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEYS.language);
      if (savedLang) setLanguage(savedLang);
    } catch {
      // ignore
    }
  }, []);

  const handleSetLanguage = useCallback((langName) => {
    setLanguage(langName);
    setIsLanguageOpen(false);
    try {
      localStorage.setItem(STORAGE_KEYS.language, langName);
    } catch {
      // ignore
    }
  }, []);

  // ================== Load user from localStorage ==================
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // ================== Close dropdowns on outside click / escape ==================
  useEffect(() => {
    const onPointerDown = (event) => {
      const t = event.target;

      if (profileRef.current && !profileRef.current.contains(t)) {
        setIsProfileOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(t)) {
        setIsLanguageOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsLanguageOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // ================== Prevent background scroll when mobile menu open ==================
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  /* ---------------- Enhanced scroll animations ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 150);

      // Do not hide header while mobile menu is open (prevents UX jank)
      if (!mobileMenuOpen) {
        if (currentY > lastScrollY.current && currentY > 80) setHidden(true);
        else setHidden(false);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [mobileMenuOpen]);

  // Logo animation variants
  const logoVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        duration: 0.6,
        rotate: { repeat: Infinity, duration: 2, ease: "easeInOut" },
      },
    },
  };

  // Icon button animation
  const iconButtonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.3, rotate: { duration: 0.4 } },
    },
    tap: { scale: 0.9 },
  };

  // Mobile menu animation variants
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const mobileItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
  };

  // Small dropdown motion
  const dropdownVariants = {
    closed: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } },
    open: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
  };

  return (
    <>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <motion.header
        initial={false}
        animate={{
          y: "0%",
          boxShadow: isScrolling
            ? "0 10px 30px rgba(0, 0, 0, 0.08)"
            : "0 4px 20px rgba(0, 0, 0, 0.05)",
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
          boxShadow: { duration: 0.2 },
        }}
        className="hidden lg:block
        fixed inset-x-0 top-0 z-50
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
        border-b border-gray-200 dark:border-gray-800
        shadow-lg
      "
      >
        {/* Glowing effect when scrolling */}
        <AnimatePresence>
          {isScrolling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
            />
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-7xl px-4">
          {/* ================= Desktop ================= */}
          <div className="hidden lg:block">
            <div className="flex h-20 items-center justify-between">
              {/* Brand */}
              <motion.div
                variants={logoVariants}
                initial="initial"
                whileHover="hover"
                className="flex items-center gap-3 cursor-pointer group"
                onClick={handleLogoActivate}
                onKeyDown={handleLogoActivate}
                role="button"
                tabIndex={0}
              >
                <motion.div
                  className="flex h-24 w-24 items-center justify-center rounded-xl relative overflow-hidden"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <img
                    src={logo}
                    alt="LocalPro Logo"
                    className="h-24 w-24 object-contain relative z-10"
                  />
                </motion.div>

                <motion.span
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  HelpGo
                </motion.span>
              </motion.div>

              {/* Nav */}
              <nav
                className="flex items-center gap-3"
                aria-label="Main navigation"
              >
                {navLinks.map((link) => (
                  <motion.div
                    key={link.path}
                    onHoverStart={() => setHoveredNav(link.path)}
                    onHoverEnd={() => setHoveredNav(null)}
                  >
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `relative text-sm font-medium cursor-pointer transition-colors ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <div className="relative py-2 px-2">
                          <motion.span
                            className="inline-flex items-center gap-2"
                            animate={{ y: hoveredNav === link.path ? -2 : 0 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {link.icon}
                            {link.name}
                          </motion.span>

                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"
                            initial={{ width: 0 }}
                            animate={{
                              width: isActive
                                ? "100%"
                                : hoveredNav === link.path
                                ? "100%"
                                : 0,
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          />

                          {hoveredNav === link.path && (
                            <motion.div
                              className="absolute -inset-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg blur-sm -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              layoutId="hover-bg"
                            />
                          )}
                        </div>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <motion.button
                  variants={iconButtonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="relative rounded-xl p-2 text-gray-600 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer group"
                  type="button"
                  aria-label="Notifications"
                >
                  <motion.div
                    className="absolute inset-0 rounded-xl ring-2 ring-red-400/30"
                    animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <Bell className="h-5 w-5 relative z-10" />
                  <motion.span
                    className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 z-20"
                    animate={{
                      scale: [1, 1.5, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(239, 68, 68, 0)",
                        "0 0 0 4px rgba(239, 68, 68, 0.3)",
                        "0 0 0 0 rgba(239, 68, 68, 0)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.button>

                {/* Language */}
                <div className="relative" ref={languageRef}>
                  <motion.button
                    variants={iconButtonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onClick={() => {
                      setIsLanguageOpen((v) => !v);
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                    aria-expanded={isLanguageOpen}
                    aria-label="Language"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="hidden xl:inline">{language}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isLanguageOpen ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isLanguageOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl z-50"
                        role="menu"
                        aria-label="Language menu"
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleSetLanguage(lang.name)}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                            role="menuitem"
                          >
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              {lang.name}
                            </span>
                            {language === lang.name && (
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dark mode */}
                <motion.button
                  variants={iconButtonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  type="button"
                  onClick={() => setIsDarkMode((v) => !v)}
                  className="rounded-xl p-2 text-gray-600 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </motion.button>

                {/* Profile / Sign in */}
                {user ? (
                  <div className="relative" ref={profileRef}>
                    <motion.button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen((v) => !v);
                        setIsLanguageOpen(false);
                      }}
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="ml-2 flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                      aria-expanded={isProfileOpen}
                      aria-label="Open profile menu"
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 dark:text-gray-300 transition-transform ${
                          isProfileOpen ? "rotate-180" : ""
                        }`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                          className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl z-50"
                          role="menu"
                          aria-label="Profile menu"
                        >
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                                <User className="h-6 w-6" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                  {user?.name || "Guest"}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {user?.email || "Not available"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {profileMenu.map((item) => (
                            <button
                              key={item.name}
                              type="button"
                              onClick={item.action}
                              role="menuitem"
                              className={`
                              w-full px-4 py-3 text-left text-sm
                              flex items-center gap-3 rounded-lg
                              transition-colors duration-150 cursor-pointer
                                  ${
                                    item.isDanger
                                      ? "bg-red-600 hover:bg-red-500 text-white"
                                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                  }
                                `}
                            >
                              {item.icon}
                              <span className="font-medium">{item.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{
                      y: -2,
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      closeAllMenus();
                      navigate("/signin");
                    }}
                    type="button"
                    className={`ml-2 px-5 py-2.5 rounded-xl font-semibold cursor-pointer relative overflow-hidden ${colorClasses.btnPrimary}`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                      animate={{ translateX: ["0%", "200%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 0.5,
                      }}
                    />
                    <span className="relative z-10">Sign In</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile header is rendered by MobileHeader component above */}
        </div>
      </motion.header>
    </>
  );
}

export default Header;
