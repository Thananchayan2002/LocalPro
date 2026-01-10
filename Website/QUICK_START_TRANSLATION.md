# Quick Start Guide - Translation System

## ✅ What's Been Implemented

### 1. Core Files Created

- ✅ [TranslationContext.jsx](src/context/TranslationContext.jsx) - Global translation state
- ✅ [useTranslation.js](src/hooks/useTranslation.js) - Hook for accessing translations
- ✅ [translateDynamic.js](src/utils/translateDynamic.js) - Auto-translate utility
- ✅ [LanguageTranslator.jsx](src/components/LanguageTranslator.jsx) - Language selector UI

### 2. Integration Complete

- ✅ App.jsx wrapped with `TranslationProvider`
- ✅ Header.jsx integrated with `LanguageTranslator`
- ✅ Services.jsx fully translated (static + dynamic content)

### 3. Supported Languages

- 🇺🇸 English (en) - Default
- 🇮🇳 Tamil (ta)
- 🇱🇰 Sinhala (si)

## 🚀 How to Test

### 1. Start the development server

```bash
cd Website
npm run dev
```

### 2. Test the language switcher

- Look for the 🌐 Globe icon in the header
- Click it to see language options
- Select Tamil (🇮🇳) or Sinhala (🇱🇰)

### 3. Verify translations

- **Header navigation** → Should change instantly
- **Services page title** → "Professional Services" → "தொழிலாளர் சேவைகள்" / "වෘත්තිකවරයා සේවා"
- **Service descriptions** → Should auto-translate within ~1 second
- **Buttons** → "View more" → "மேலும் பார்க்கவும்" / "තවත් බලන්න"

## 📝 Add Translation to a New Component

### Step 1: Import the hook

```javascript
import { useTranslation } from "../hooks/useTranslation";
```

### Step 2: Use in component

```javascript
function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("home")}</h1>
      <button>{t("bookNow")}</button>
    </div>
  );
}
```

### Step 3: For dynamic content (from database)

```javascript
import { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { translateDynamicContent } from "../utils/translateDynamic";

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

## 🔑 Available Translation Keys

Common keys you can use with `t()`:

### Navigation

```javascript
t("home"); // Home / முகப்பு / මුල් පිටුව
t("services"); // Professional Services
t("professionals"); // Find Professionals
t("about"); // About
t("feedback"); // Feedback
```

### Actions

```javascript
t("search"); // Search
t("bookNow"); // Book Now
t("viewMore"); // View more
t("viewLess"); // View less
t("cancel"); // Cancel
t("save"); // Save
t("tryAgain"); // Try Again
```

### States

```javascript
t("loading"); // Loading...
t("error"); // Error
t("success"); // Success
```

### Error Messages

```javascript
t("failedToLoadServices"); // Failed to load services...
t("somethingWentWrong"); // Something went wrong...
```

**See full list in** [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md)

## 📚 Documentation

- **Full Guide**: [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md)
- **Examples**: [src/examples/TranslationExamples.jsx](src/examples/TranslationExamples.jsx)

## 🎯 Next Components to Translate

Ready to translate more components? Follow this order:

1. **Home page** (`src/users/components/home/Home.jsx`)
2. **Professionals page** (`src/users/components/professionals/Professionals.jsx`)
3. **About page** (`src/users/components/about/About.jsx`)
4. **Feedback page** (`src/users/components/feedback/Feedback.jsx`)
5. **Bookings page** (`src/users/components/bookService/Bookings.jsx`)

Just add:

```javascript
import { useTranslation } from "../../../hooks/useTranslation";
const { t } = useTranslation();
```

Then replace hardcoded text with `t("key")`.

## 💡 Tips

### ✅ DO

- Use `t()` for all UI text (buttons, labels, headings)
- Use `translateDynamicContent()` for database content
- Test in all 3 languages

### ❌ DON'T

- Hardcode text strings: ❌ "Home" → ✅ `t("home")`
- Forget to handle loading states for dynamic content
- Mix up static vs dynamic translation methods

## 🐛 Troubleshooting

### Translation not working?

1. Check if component is inside `<TranslationProvider>` (App.jsx)
2. Verify you imported `useTranslation` correctly
3. Check console for errors

### Dynamic content not translating?

1. Check internet connection (needs API call)
2. Wait ~1 second for translation to load
3. Check if language is not English

### Clear cache if needed:

```javascript
localStorage.removeItem("translation_cache");
```

## ✨ Features

- ✅ Instant UI translation switching
- ✅ Auto-translation for dynamic content
- ✅ 24-hour caching (no repeated API calls)
- ✅ Fallback to English if translation fails
- ✅ Persistent language selection (localStorage)

## 🎉 You're all set!

The translation system is fully functional. Test it now:

1. Run `npm run dev`
2. Click the 🌐 globe icon
3. Switch languages
4. Navigate to Services page to see it in action!

---

**Questions?** Check [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md) for detailed documentation.
