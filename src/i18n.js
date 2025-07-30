import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Import translation resources directly for now
// This can be replaced with HTTP backend for .po files in production
import enTranslations from './locales/en_US/translation.json';
import frTranslations from './locales/fr_FR/translation.json';
import esTranslations from './locales/es_ES/translation.json';

const resources = {
  'en-US': {
    translation: enTranslations
  },
  'fr-FR': {
    translation: frTranslations
  },
  'es-ES': {
    translation: esTranslations
  }
};

i18n
  // Load translation using http backend for .po files
  // In production, this can load from /locales/{lng}/{ns}.po
  .use(HttpApi)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Use direct resources for now, can be replaced with backend
    resources,
    
    // Default language
    lng: 'en-US',
    fallbackLng: 'en-US',
    
    // Allowed languages
    supportedLngs: ['en-US', 'fr-FR', 'es-ES'],
    
    // Language detection options
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      
      // Cache user language
      caches: ['localStorage', 'sessionStorage'],
      
      // Only detect languages from supported list
      checkWhitelist: true
    },
    
    // Backend options (for .po file loading in production)
    backend: {
      loadPath: '/sgex/locales/{{lng}}/{{ns}}.json', // Path to translation files
      addPath: '/sgex/locales/add/{{lng}}/{{ns}}', // Path to save missing translations
      
      // Custom .po file parsing can be added here
      parse: function(data) {
        try {
          return JSON.parse(data);
        } catch (error) {
          console.error('Failed to parse translation data:', error);
          return {};
        }
      }
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ','
    },
    
    // React options
    react: {
      useSuspense: false // Set to false to avoid suspense mode for easier integration
    },
    
    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',
    
    // Namespace and key separator
    ns: ['translation'],
    defaultNS: 'translation',
    keySeparator: '.',
    nsSeparator: ':',
    
    // Return key if translation is missing (useful for development)
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,
    
    // Save missing keys (useful for development)
    saveMissing: process.env.NODE_ENV === 'development',
    
    // Update missing keys
    updateMissing: process.env.NODE_ENV === 'development',
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_'
  });

export default i18n;