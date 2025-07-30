import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import ru from './locales/ru.json';

// Translation resources
const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  ar: { translation: ar },
  zh: { translation: zh },
  ru: { translation: ru }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    
    // Default language
    fallbackLng: 'en',
    
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
    
    // Language detection options
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      
      // Keys or params to lookup language from
      lookupLocalStorage: 'sgex-language',
      
      // Cache user language on localStorage
      caches: ['localStorage']
    },
    
    // Interpolation options
    interpolation: {
      // Not needed for React as it already escapes by default
      escapeValue: false
    },
    
    // React specific options
    react: {
      // Use Suspense for async loading
      useSuspense: false
    }
  });

export default i18n;