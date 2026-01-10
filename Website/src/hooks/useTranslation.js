import { useContext } from "react";
import TranslationContext from "../context/TranslationContext";

/**
 * Custom hook for accessing translation functions
 * @returns {Object} { currentLang, t, changeLang }
 */
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return context;
};

export default useTranslation;
