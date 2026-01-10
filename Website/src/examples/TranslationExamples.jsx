// Example component showing how to use the translation system

import { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import {
  translateDynamicContent,
  translateMultiple,
} from "../utils/translateDynamic";

// ==================== EXAMPLE 1: Simple Static Translations ====================
export function SimpleExample() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("services")}</h1>
      <p>{t("browseServices")}</p>
      <button>{t("bookNow")}</button>
    </div>
  );
}

// ==================== EXAMPLE 2: Dynamic Content Translation ====================
export function DynamicContentExample({ service }) {
  const { currentLang } = useTranslation();
  const [translatedDesc, setTranslatedDesc] = useState("");

  useEffect(() => {
    if (currentLang !== "en" && service.description) {
      translateDynamicContent(service.description, currentLang)
        .then(setTranslatedDesc)
        .catch(() => setTranslatedDesc(service.description));
    } else {
      setTranslatedDesc(service.description);
    }
  }, [currentLang, service.description]);

  return (
    <div>
      <h3>{service.name}</h3>
      <p>{translatedDesc || service.description}</p>
    </div>
  );
}

// ==================== EXAMPLE 3: Batch Translation ====================
export function BatchTranslationExample({ services }) {
  const { currentLang, t } = useTranslation();
  const [translatedServices, setTranslatedServices] = useState([]);

  useEffect(() => {
    if (currentLang !== "en" && services.length > 0) {
      const descriptions = services.map((s) => s.description);
      translateMultiple(descriptions, currentLang).then((translations) => {
        const translated = services.map((service, index) => ({
          ...service,
          translatedDescription: translations[index],
        }));
        setTranslatedServices(translated);
      });
    } else {
      setTranslatedServices(services);
    }
  }, [currentLang, services]);

  return (
    <div>
      <h1>{t("services")}</h1>
      {translatedServices.map((service) => (
        <div key={service._id}>
          <h3>{service.name}</h3>
          <p>{service.translatedDescription || service.description}</p>
        </div>
      ))}
    </div>
  );
}

// ==================== EXAMPLE 4: With Loading State ====================
export function TranslationWithLoadingExample({ content }) {
  const { currentLang, t } = useTranslation();
  const [translatedContent, setTranslatedContent] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (currentLang !== "en") {
      setIsTranslating(true);
      translateDynamicContent(content, currentLang)
        .then(setTranslatedContent)
        .catch(() => setTranslatedContent(content))
        .finally(() => setIsTranslating(false));
    } else {
      setTranslatedContent(content);
      setIsTranslating(false);
    }
  }, [currentLang, content]);

  if (isTranslating) {
    return <p>{t("loading")}</p>;
  }

  return <p>{translatedContent || content}</p>;
}

// ==================== EXAMPLE 5: Mixed Static + Dynamic ====================
export function MixedTranslationExample({ item }) {
  const { currentLang, t } = useTranslation();
  const [translatedDesc, setTranslatedDesc] = useState("");

  useEffect(() => {
    if (currentLang !== "en") {
      translateDynamicContent(item.description, currentLang).then(
        setTranslatedDesc
      );
    } else {
      setTranslatedDesc(item.description);
    }
  }, [currentLang, item.description]);

  return (
    <div className="card">
      {/* Static UI text uses t() */}
      <h2>{t("services")}</h2>

      {/* Dynamic content uses translateDynamicContent */}
      <p>{translatedDesc || item.description}</p>

      {/* Static buttons/actions use t() */}
      <div className="actions">
        <button>{t("viewMore")}</button>
        <button>{t("bookNow")}</button>
      </div>
    </div>
  );
}

// ==================== EXAMPLE 6: Language Switcher ====================
export function LanguageSwitcherExample() {
  const { currentLang, changeLang } = useTranslation();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
    { code: "si", name: "සිංහල", flag: "🇱🇰" },
  ];

  return (
    <div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLang(lang.code)}
          className={currentLang === lang.code ? "active" : ""}
        >
          {lang.flag} {lang.name}
        </button>
      ))}
    </div>
  );
}

// ==================== EXAMPLE 7: Form with Translations ====================
export function FormExample() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  return (
    <form>
      <div>
        <label>{t("email")}</label>
        <input
          type="email"
          placeholder={t("email")}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label>{t("password")}</label>
        <input
          type="password"
          placeholder={t("password")}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </div>

      <button type="submit">{t("login")}</button>
      <button type="button">{t("cancel")}</button>
    </form>
  );
}

// ==================== EXAMPLE 8: Error Messages ====================
export function ErrorHandlingExample() {
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/data");
      if (!response.ok) throw new Error("Failed");
      // ... process data
    } catch (err) {
      setError(t("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>{t("loading")}</div>;

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={loadData}>{t("tryAgain")}</button>
      </div>
    );
  }

  return <div>{/* Your content */}</div>;
}
