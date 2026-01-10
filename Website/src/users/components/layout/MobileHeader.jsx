import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Globe, Sun, Moon, LogOut, ChevronDown } from "lucide-react";
import logo from "../../../assets/images/logo.png";
import { performLogout } from "../auth/logout";
import { useTheme } from "../../../hooks/useTheme";

const STORAGE_KEYS = {
  language: "helpgo_language",
};

function MobileHeader() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [language, setLanguage] = useState("English");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const [hidden, setHidden] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);
  const languageRef = useRef(null);

  const languages = useMemo(
    () => [
      { code: "en", name: "English" },
      { code: "ta", name: "Tamil" },
      { code: "si", name: "Sinhala" },
    ],
    []
  );

  const handleLogoActivate = useCallback(
    (e) => {
      if (e.type === "click" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsLanguageOpen(false);
        navigate("/app");
      }
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    performLogout();
    setIsLanguageOpen(false);
    navigate("/", { replace: true });
  }, [navigate]);

  // Language persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.language);
      if (saved) setLanguage(saved);
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

  // Close language dropdown on outside click / Escape
  useEffect(() => {
    const onPointerDown = (event) => {
      const t = event.target;
      if (languageRef.current && !languageRef.current.contains(t)) {
        setIsLanguageOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsLanguageOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Enhanced scroll animations (keep your behavior)
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 150);

      if (currentY > lastScrollY.current && currentY > 80) setHidden(true);
      else setHidden(false);

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Keep existing variants (same “feel”)
  const iconButtonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.3, rotate: { duration: 0.4 } },
    },
    tap: { scale: 0.9 },
  };

  const dropdownVariants = {
    closed: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } },
    open: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
  };

  return (
    <motion.header
      initial={false}
      animate={{
        y: hidden ? "-100%" : "0%",
        boxShadow: isScrolling
          ? "0 10px 30px rgba(0, 0, 0, 0.08)"
          : "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        boxShadow: { duration: 0.2 },
      }}
      className="
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
        {/* Mobile-first header (also works on desktop) */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            {/* Brand (logo + app name) */}
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleLogoActivate}
              onKeyDown={handleLogoActivate}
              role="button"
              tabIndex={0}
            >
              {/* Add rotation animation to logo */}
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-lg relative overflow-hidden"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img
                  src={logo}
                  alt="HelpGo Logo"
                  className="h-14 w-14 object-contain relative z-10"
                />
              </motion.div>

              {/* Add subtle rotation animation to app name */}
              <motion.span
                className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400"
                animate={{ rotate: [0, 0.6, -0.6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                HelpGo
              </motion.span>
            </motion.div>

            {/* Actions: Theme, Notifications, Language, Logout */}
            <div className="flex items-center gap-2">
              {/* Dark mode */}
              <motion.button
                variants={iconButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={toggleTheme}
                type="button"
                className="rounded-lg p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </motion.button>

              {/* Notifications */}
              <motion.button
                variants={iconButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                type="button"
                className="relative rounded-lg p-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <motion.span
                  className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.button>

              {/* Language dropdown */}
              <div className="relative" ref={languageRef}>
                <motion.button
                  variants={iconButtonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  type="button"
                  onClick={() => setIsLanguageOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  aria-expanded={isLanguageOpen}
                  aria-label="Select language"
                >
                  <Globe className="h-5 w-5" />
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
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Select Language
                      </div>
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

              {/* Logout icon button (red background) */}
              <motion.button
                variants={iconButtonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 bg-red-600 hover:bg-red-500 text-white shadow-sm cursor-pointer"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default MobileHeader;
