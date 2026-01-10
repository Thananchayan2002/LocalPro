# HelpGo Translation System - Hybrid Approach

## Overview

This project implements a **hybrid translation system** with:

- **Manual translations** for UI elements (buttons, navigation, etc.)
- **Auto-translation via Google Translate API** for dynamic content (service descriptions, reviews, etc.)
- **Caching** for translated content (24-hour cache)

## Supported Languages

- 🇺🇸 English (en) - Default
- 🇮🇳 Tamil (ta)
- 🇱🇰 Sinhala (si)

## Architecture

### 1. Translation Context (`src/context/TranslationContext.jsx`)

Provides global state management for translations.

**Static Translations:**

```javascript
const staticTranslations = {
  en: { home: "Home", services: "Services", ... },
  ta: { home: "முகப்பு", services: "சேவைகள்", ... },
  si: { home: "මුල් පිටුව", services: "සේවා", ... }
};
```

### 2. useTranslation Hook (`src/hooks/useTranslation.js`)

Custom hook to access translation functionality.

**Usage:**

```javascript
import { useTranslation } from "../hooks/useTranslation";

function MyComponent() {
  const { t, currentLang, changeLang } = useTranslation();

  return <h1>{t("home")}</h1>; // Outputs: "Home", "முகப்பு", or "මුල් පිටුව"
}
```

### 3. Dynamic Translation Utility (`src/utils/translateDynamic.js`)

Handles auto-translation of dynamic content using Google Translate API.

**Features:**

- ✅ Automatic translation via Google Translate API
- ✅ 24-hour caching in localStorage
- ✅ Fallback to original text on error
- ✅ Batch translation support

**Usage:**

```javascript
import { translateDynamicContent } from "../utils/translateDynamic";

const translatedDescription = await translateDynamicContent(
  "This is a service description",
  "ta"
);
```

### 4. Language Translator Component (`src/components/LanguageTranslator.jsx`)

UI component for language selection.

## How to Use

### Step 1: Wrap Your App

Already done in `App.jsx`:

```javascript
<TranslationProvider>
  <AuthProvider>
    <BrowserRouter>{/* Your app routes */}</BrowserRouter>
  </AuthProvider>
</TranslationProvider>
```

### Step 2: Use in Components

#### For Static UI Text:

```javascript
import { useTranslation } from "../hooks/useTranslation";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("services")}</h1>
      <button>{t("bookNow")}</button>
      <p>{t("loading")}</p>
    </div>
  );
}
```

#### For Dynamic Content:

```javascript
import { useTranslation } from "../hooks/useTranslation";
import { translateDynamicContent } from "../utils/translateDynamic";
import { useState, useEffect } from "react";

function ServiceCard({ service }) {
  const { currentLang } = useTranslation();
  const [translatedDesc, setTranslatedDesc] = useState("");

  useEffect(() => {
    if (currentLang !== "en") {
      translateDynamicContent(service.description, currentLang).then(
        setTranslatedDesc
      );
    } else {
      setTranslatedDesc(service.description);
    }
  }, [currentLang, service.description]);

  return <p>{translatedDesc || service.description}</p>;
}
```

## Adding New Translations

### For UI Text:

Edit `src/context/TranslationContext.jsx`:

```javascript
export const staticTranslations = {
  en: {
    // ... existing translations
    myNewKey: "My New Text",
  },
  ta: {
    // ... existing translations
    myNewKey: "என் புதிய உரை",
  },
  si: {
    // ... existing translations
    myNewKey: "මගේ නව පෙළ",
  },
};
```

Then use it:

```javascript
const { t } = useTranslation();
return <div>{t("myNewKey")}</div>;
```

## Translation Keys Reference

### Navigation

- `home`, `services`, `professionals`, `about`, `feedback`
- `bookings`, `dashboard`, `account`, `payments`, `notifications`

### Actions

- `search`, `filter`, `sort`, `cancel`, `save`, `delete`, `edit`
- `back`, `next`, `previous`, `loading`, `error`, `success`
- `bookNow`, `tryAgain`, `viewMore`, `viewLess`

### Services Page

- `browseServices`, `searchServices`, `selectService`
- `selectIssue`, `issues`, `noIssues`

### Authentication

- `login`, `signup`, `email`, `password`, `confirmPassword`, `forgotPassword`

### Bookings

- `upcomingBookings`, `completedBookings`, `cancelBooking`, `reschedule`

### Error Messages

- `failedToLoadServices`, `failedToLoadProfessionals`, `somethingWentWrong`

## Components Already Translated

✅ Services page (Services.jsx)
✅ Header navigation (Header.jsx with LanguageTranslator)
✅ Service descriptions (auto-translated)

## Next Steps to Translate

### 1. Home Page (`src/users/components/home/Home.jsx`)

```javascript
const { t } = useTranslation();
<h1>{t("home")}</h1>;
```

### 2. Professionals Page (`src/users/components/professionals/Professionals.jsx`)

```javascript
const { t } = useTranslation();
<h1>{t("professionals")}</h1>
<button>{t("bookNow")}</button>
```

### 3. About Page (`src/users/components/about/About.jsx`)

```javascript
const { t } = useTranslation();
<h1>{t("about")}</h1>;
```

### 4. Feedback Page (`src/users/components/feedback/Feedback.jsx`)

```javascript
const { t } = useTranslation();
<h1>{t("feedback")}</h1>;
```

### 5. Bookings Page

```javascript
const { t } = useTranslation();
<h2>{t("upcomingBookings")}</h2>
<h2>{t("completedBookings")}</h2>
```

## Best Practices

### ✅ DO:

- Use `t()` for all UI text
- Use `translateDynamicContent()` for user-generated or database content
- Add new keys to all three languages (en, ta, si)
- Test each language after adding translations

### ❌ DON'T:

- Hardcode text strings directly in JSX
- Mix static translations with dynamic content
- Forget to handle loading states for dynamic translations
- Clear translation cache unnecessarily

## Performance Tips

1. **Batch Translations**: Use `translateMultiple()` for lists

```javascript
import { translateMultiple } from "../utils/translateDynamic";

const descriptions = services.map((s) => s.description);
const translated = await translateMultiple(descriptions, currentLang);
```

2. **Cache Management**: Translations are cached for 24 hours automatically

3. **Clear Cache** (if needed):

```javascript
import { clearTranslationCache } from "../utils/translateDynamic";
clearTranslationCache();
```

## Troubleshooting

### Translation not showing?

1. Check console for errors
2. Verify the key exists in `staticTranslations`
3. Check if component is wrapped in `TranslationProvider`

### Dynamic content not translating?

1. Check internet connection (API call required)
2. Check browser console for API errors
3. Verify `currentLang` is not "en"

### Cache issues?

```javascript
// Clear cache manually
localStorage.removeItem("translation_cache");
```

## File Structure

```
src/
├── context/
│   └── TranslationContext.jsx    # Translation provider & static translations
├── hooks/
│   └── useTranslation.js          # Custom hook
├── utils/
│   └── translateDynamic.js        # Auto-translation utility
├── components/
│   └── LanguageTranslator.jsx     # Language selector UI
└── App.jsx                        # Wrapped with TranslationProvider
```

## Example: Complete Component

```javascript
import { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { translateDynamicContent } from "../../utils/translateDynamic";

function ServiceCard({ service }) {
  const { t, currentLang } = useTranslation();
  const [translatedDesc, setTranslatedDesc] = useState("");

  useEffect(() => {
    if (currentLang !== "en") {
      translateDynamicContent(service.description, currentLang).then(
        setTranslatedDesc
      );
    } else {
      setTranslatedDesc(service.description);
    }
  }, [currentLang, service.description]);

  return (
    <div>
      <h3>{service.name}</h3>
      <p>{translatedDesc || service.description}</p>
      <button>{t("bookNow")}</button>
    </div>
  );
}
```

## Support

For questions or issues with translations, check:

1. This documentation
2. Console errors
3. Translation cache in localStorage

---

**Last Updated**: January 9, 2026
**Version**: 1.0
**Languages Supported**: English, Tamil, Sinhala
