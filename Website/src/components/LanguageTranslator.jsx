import { useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

const LanguageTranslator = () => {
  const { currentLang, changeLang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
    { code: "si", name: "සිංහල", flag: "🇱🇰" },
  ];

  const handleLanguageChange = (langCode) => {
    changeLang(langCode);
    setIsOpen(false);
  };

  const currentLanguage = languages.find((lang) => lang.code === currentLang);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20 transition-all duration-300"
        title="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLanguage?.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px] z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors ${
                currentLang === lang.code
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageTranslator;
