/**
 * Translate dynamic content (like service descriptions, reviews, etc.)
 * Uses Google Translate API for auto-translation
 * Falls back to original text if translation fails
 */

const CACHE_KEY = "translation_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached translation if available and not expired
 */
const getCachedTranslation = (text, targetLang) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const key = `${text}_${targetLang}`;
    const cached = cache[key];

    if (cached) {
      const expiry = cached.expiry || 0;
      if (Date.now() < expiry) {
        return cached.translation;
      } else {
        // Remove expired entry
        delete cache[key];
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      }
    }
  } catch (error) {
    console.warn("Cache retrieval failed:", error);
  }
  return null;
};

/**
 * Cache translation result
 */
const cacheTranslation = (text, targetLang, translation) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const key = `${text}_${targetLang}`;
    cache[key] = {
      translation,
      expiry: Date.now() + CACHE_DURATION,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn("Cache storage failed:", error);
  }
};

/**
 * Translate text using Google Translate API
 * Results are cached for 24 hours
 */
export const translateDynamicContent = async (text, targetLang) => {
  // Return original if language is English or text is empty
  if (targetLang === "en" || !text || text.trim().length === 0) {
    return text;
  }

  // Check cache first
  const cached = getCachedTranslation(text, targetLang);
  if (cached) {
    return cached;
  }

  try {
    // Using Google Translate API (free endpoint, no API key required)
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`
    );

    if (!response.ok) {
      throw new Error("Translation API error");
    }

    const data = await response.json();
    const translatedText = data[0]?.map((item) => item[0]).join("") || text;

    // Cache the result
    cacheTranslation(text, targetLang, translatedText);

    return translatedText;
  } catch (error) {
    console.error("Translation failed:", error);
    // Return original text if translation fails
    return text;
  }
};

/**
 * Batch translate multiple texts
 * More efficient for translating multiple items
 */
export const translateMultiple = async (texts, targetLang) => {
  if (targetLang === "en") {
    return texts;
  }

  const promises = texts.map((text) =>
    translateDynamicContent(text, targetLang)
  );
  return Promise.all(promises);
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear cache:", error);
    return false;
  }
};

export default translateDynamicContent;
