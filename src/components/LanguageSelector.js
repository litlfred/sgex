import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

// Default UN languages
const UN_LANGUAGES = [
  { code: 'en', name: 'language.english', flag: '🇺🇸' },
  { code: 'fr', name: 'language.french', flag: '🇫🇷' },
  { code: 'es', name: 'language.spanish', flag: '🇪🇸' },
  { code: 'ar', name: 'language.arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'language.chinese', flag: '🇨🇳' },
  { code: 'ru', name: 'language.russian', flag: '🇷🇺' }
];

// Additional searchable languages
const ADDITIONAL_LANGUAGES = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
  { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'lo', name: 'ລາວ', flag: '🇱🇦' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'xh', name: 'isiXhosa', flag: '🇿🇦' }
];

const LanguageSelector = ({ className = '' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState(() => {
    // Get selected languages from localStorage or default to UN languages
    const saved = localStorage.getItem('sgex-selected-languages');
    return saved ? JSON.parse(saved) : UN_LANGUAGES.map(lang => lang.code);
  });

  // Get available languages (UN languages + any additional selected languages)
  const availableLanguages = useMemo(() => {
    // Start with all UN languages
    const languages = [...UN_LANGUAGES];
    
    // Add any additional languages that have been selected
    selectedLanguages.forEach(langCode => {
      // If this language code is not already in UN_LANGUAGES, find it in ADDITIONAL_LANGUAGES
      if (!UN_LANGUAGES.some(unLang => unLang.code === langCode)) {
        const additionalLang = ADDITIONAL_LANGUAGES.find(addLang => addLang.code === langCode);
        if (additionalLang) {
          languages.push({
            code: additionalLang.code,
            name: additionalLang.name, // Use the native name for additional languages
            flag: additionalLang.flag
          });
        }
      }
    });
    
    // Map the languages to include translated names for UN languages
    return languages.map(lang => ({
      ...lang,
      name: UN_LANGUAGES.some(unLang => unLang.code === lang.code) ? t(lang.name) : lang.name
    }));
  }, [selectedLanguages, t]);

  // Get searchable languages (excluding already selected ones)
  const searchableLanguages = useMemo(() => {
    if (!searchTerm) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return ADDITIONAL_LANGUAGES.filter(lang => 
      !selectedLanguages.includes(lang.code) &&
      (lang.name.toLowerCase().includes(searchLower) || 
       lang.code.toLowerCase().includes(searchLower))
    ).slice(0, 10); // Limit to 10 results
  }, [searchTerm, selectedLanguages]);

  const currentLanguage = availableLanguages.find(lang => lang.code === i18n.language) || availableLanguages[0];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddLanguage = (langCode) => {
    const newSelectedLanguages = [...selectedLanguages, langCode];
    setSelectedLanguages(newSelectedLanguages);
    localStorage.setItem('sgex-selected-languages', JSON.stringify(newSelectedLanguages));
    
    // Optionally switch to the newly added language
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={`language-selector ${className}`}>
      <button
        className="language-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('language.select')}
        title={t('language.select')}
      >
        <span className="language-icon">🐾🎧</span>
        <span className="language-name">{currentLanguage?.name}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {/* Available Languages */}
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${i18n.language === language.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="language-flag">{language.flag}</span>
              <span className="language-name">{language.name}</span>
              {i18n.language === language.code && (
                <span className="language-checkmark">✓</span>
              )}
            </button>
          ))}
          
          {/* Search Section */}
          <div className="language-search-section">
            <div className="language-search-divider"></div>
            <div className="language-search-input">
              <input
                type="text"
                placeholder={t('language.search')}
                value={searchTerm}
                onChange={handleSearchChange}
                className="language-search"
                autoFocus={false}
              />
            </div>
            
            {/* Search Results */}
            {searchableLanguages.map((language) => (
              <button
                key={language.code}
                className="language-option language-option-addable"
                onClick={() => handleAddLanguage(language.code)}
              >
                <span className="language-flag">{language.flag}</span>
                <span className="language-name">{language.name}</span>
                <span className="language-add-icon">+</span>
              </button>
            ))}
            
            {searchTerm && searchableLanguages.length === 0 && (
              <div className="language-no-results">
                No languages found for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;