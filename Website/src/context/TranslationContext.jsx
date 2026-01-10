import { createContext, useState, useCallback, useEffect } from "react";

const TranslationContext = createContext();

// UI Static Translations - Manually maintained
export const staticTranslations = {
  en: {
    // Navigation & Common
    home: "Home",
    services: "Professional Services",
    professionals: "Find Professionals",
    about: "About",
    feedback: "Feedback",
    bookings: "My Bookings",
    dashboard: "Dashboard",
    account: "Account",
    payments: "Payments",
    notifications: "Notifications",
    logout: "Logout",
    profile: "Profile",

    // Services Page
    browseServices: "Browse professional services",
    searchServices: "Search services...",
    viewMore: "View more",
    viewLess: "View less",
    selectService: "Select a Service",
    selectIssue: "Select an Issue Type",
    issues: "Issues",
    noIssues: "No issues found for this service",
    bookNow: "Book Now",
    close: "Close",

    // Common Actions
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    previous: "Previous",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    tryAgain: "Try Again",

    // Authentication
    login: "Login",
    signup: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password",

    // Bookings
    upcomingBookings: "Upcoming Bookings",
    completedBookings: "Completed Bookings",
    cancelBooking: "Cancel Booking",
    reschedule: "Reschedule",

    // Error Messages
    failedToLoadServices: "Failed to load services. Please try again.",
    failedToLoadProfessionals:
      "Failed to load professionals. Please try again.",
    somethingWentWrong: "Something went wrong. Please try again.",
  },
  ta: {
    // Navigation & Common
    home: "முகப்பு",
    services: "தொழிலாளர் சேவைகள்",
    professionals: "தொழிலாளர்களைக் கண்டறிக",
    about: "பற்றி",
    feedback: "கருத்து",
    bookings: "எனது முன்பதிவுகள்",
    dashboard: "கட்டுப்பாட்டு பலகம்",
    account: "கணக்கு",
    payments: "பணம் செலுத்துதல்",
    notifications: "அறிவிப்புகள்",
    logout: "வெளியேறு",
    profile: "சுயவிவரம்",

    // Services Page
    browseServices: "தொழிலாளர் சேவைகளை உலாவவும்",
    searchServices: "சேவைகளைத் தேடுக...",
    viewMore: "மேலும் பார்க்கவும்",
    viewLess: "குறைவாக பார்க்கவும்",
    selectService: "சேவையைத் தேர்ந்தெடுக்கவும்",
    selectIssue: "சிக்கல் வகையைத் தேர்ந்தெடுக்கவும்",
    issues: "சிக்கல்கள்",
    noIssues: "இந்த சேவையின் சிக்கல்கள் கிடைக்கவில்லை",
    bookNow: "இப்போது முன்பதிவு செய்யுங்கள்",
    close: "மூடு",

    // Common Actions
    search: "தேடுக",
    filter: "வடிகட்ட",
    sort: "வரிசையாக்குக",
    cancel: "ரத்து செய்",
    save: "சேமிக்க",
    delete: "நீக்க",
    edit: "திருத்த",
    back: "பின்னுக்குத் திரும்பு",
    next: "அடுத்த",
    previous: "முந்தைய",
    loading: "ஏற்றுகிறது...",
    error: "பிழை",
    success: "வெற்றி",
    tryAgain: "மீண்டும் முயற்சிக்கவும்",

    // Authentication
    login: "உள்நுழைக",
    signup: "பதிவு செய்யவும்",
    email: "ইমெल்",
    password: "கடவுச்சொல்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    forgotPassword: "கடவுச்சொல்லை மறந்துவிட்டீர்களா",

    // Bookings
    upcomingBookings: "வரவிருக்கும் முன்பதிவுகள்",
    completedBookings: "முடிந்த முன்பதிவுகள்",
    cancelBooking: "முன்பதிவை ரத்து செய்யவும்",
    reschedule: "மீண்டும் அட்டவணை வகுக்கவும்",

    // Error Messages
    failedToLoadServices:
      "சேவைகளைப் பதிவிறக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    failedToLoadProfessionals:
      "தொழிலாளர்களைப் பதிவிறக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    somethingWentWrong: "ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்.",
  },
  si: {
    // Navigation & Common
    home: "මුල් පිටුව",
    services: "වෘත්තිකවරයා සේවා",
    professionals: "වෘත්තිකවරයා සොයන්න",
    about: "අපි ගැන",
    feedback: "ප්‍රතිපෝෂණ",
    bookings: "මගේ වෙන්කිරීම්",
    dashboard: "ড්যাෂබෝර්ඩ",
    account: "ගිණුම",
    payments: "ගෙවීම්",
    notifications: "දැනුම්දීම්",
    logout: "ඉවත්ව යන්න",
    profile: "පැතිකඩ",

    // Services Page
    browseServices: "වෘත්තිකවරයා සේවා ගවේෂණය කරන්න",
    searchServices: "සේවා සොයන්න...",
    viewMore: "තවත් බලන්න",
    viewLess: "අඩු බලන්න",
    selectService: "සේවාව තෝරන්න",
    selectIssue: "ගැටළු වර්ගය තෝරන්න",
    issues: "ගැටළු",
    noIssues: "මෙම සේවාවට කිසිදු ගැටළු සොයා ගත නොහැක",
    bookNow: "දැන් වෙන්කරවා ගන්න",
    close: "වසන්න",

    // Common Actions
    search: "සොයන්න",
    filter: "පෙරීම",
    sort: "වර්ගීකරණය",
    cancel: "අවලංගු කරන්න",
    save: "සුරකින්න",
    delete: "ඉවත් කරන්න",
    edit: "සංස්කරණය කරන්න",
    back: "ආපසු",
    next: "ඊට පසු",
    previous: "පෙර",
    loading: "පූරණය වෙමින්...",
    error: "දෝෂය",
    success: "සාර්ථකත්වය",
    tryAgain: "නැවත උත්සාහ කරන්න",

    // Authentication
    login: "ඇතුල් වන්න",
    signup: "ලියාපදිංචි වන්න",
    email: "ඊමේල්",
    password: "මුරපදය",
    confirmPassword: "මුරපදය තහවුරු කරන්න",
    forgotPassword: "මුරපදය අමතකයි",

    // Bookings
    upcomingBookings: "ඉදිරි වෙන්කිරීම්",
    completedBookings: "සම්පූර්ණ වෙන්කිරීම්",
    cancelBooking: "වෙන්කිරීම අවලංගු කරන්න",
    reschedule: "නැවත සම්මතයි",

    // Error Messages
    failedToLoadServices: "සේවා පූරණය කිරීමට අපොහොසත් විය. නැවත උත්සාහ කරන්න.",
    failedToLoadProfessionals:
      "වෘත්තිකවරයා පූරණය කිරීමට අපොහොසත් විය. නැවත උත්සාහ කරන්න.",
    somethingWentWrong: "යමක් වැරැද්දට ගිය. නැවත උත්සාහ කරන්න.",
  },
};

export const TranslationProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLanguage") || "en";
    setCurrentLang(savedLang);
    setIsHydrated(true);
  }, []);

  const t = useCallback(
    (key) => {
      if (!staticTranslations[currentLang]) {
        return staticTranslations.en[key] || key;
      }
      return (
        staticTranslations[currentLang][key] ||
        staticTranslations.en[key] ||
        key
      );
    },
    [currentLang]
  );

  const changeLang = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem("selectedLanguage", langCode);
  };

  return (
    <TranslationContext.Provider
      value={{
        currentLang,
        t,
        changeLang,
        staticTranslations,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;
