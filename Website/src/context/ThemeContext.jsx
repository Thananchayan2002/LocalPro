import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "helpgo_theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light") {
        setMode(saved);
        return;
      }
      if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        setMode("dark");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement.classList;
    if (mode === "dark") root.add("dark");
    else root.remove("dark");

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === "dark",
      setTheme: setMode,
      toggleTheme: () =>
        setMode((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeContext;
