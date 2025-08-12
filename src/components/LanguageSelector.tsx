import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language, LanguageSelectorProps } from '../types/core';

// Default UN languages
const UN_LANGUAGES: Language[] = [
  { code: 'en', name: 'language.english', flag: '🇺🇸' },
  { code: 'fr', name: 'language.french', flag: '🇫🇷' },
  { code: 'es', name: 'language.spanish', flag: '🇪🇸' },
  { code: 'ar', name: 'language.arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'language.chinese', flag: '🇨🇳' },
  { code: 'ru', name: 'language.russian', flag: '🇷🇺' }
];

// Comprehensive ISO 639-1 language list with native names and English names for searchability
const ADDITIONAL_LANGUAGES: Language[] = [
  // European languages
  { code: 'de', name: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', englishName: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', englishName: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Svenska', englishName: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', englishName: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', englishName: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', englishName: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polski', englishName: 'Polish', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', englishName: 'Czech', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', englishName: 'Slovak', flag: '🇸🇰' },
  { code: 'hu', name: 'Magyar', englishName: 'Hungarian', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', englishName: 'Romanian', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', englishName: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', englishName: 'Croatian', flag: '🇭🇷' },
  { code: 'el', name: 'Ελληνικά', englishName: 'Greek', flag: '🇬🇷' },
  { code: 'sr', name: 'Српски', englishName: 'Serbian', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenščina', englishName: 'Slovenian', flag: '🇸🇮' },
  { code: 'lv', name: 'Latviešu', englishName: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', englishName: 'Lithuanian', flag: '🇱🇹' },
  { code: 'et', name: 'Eesti', englishName: 'Estonian', flag: '🇪🇪' },
  { code: 'mt', name: 'Malti', englishName: 'Maltese', flag: '🇲🇹' },
  { code: 'is', name: 'Íslenska', englishName: 'Icelandic', flag: '🇮🇸' },
  { code: 'ga', name: 'Gaeilge', englishName: 'Irish', flag: '🇮🇪' },
  { code: 'cy', name: 'Cymraeg', englishName: 'Welsh', flag: '🏴' },
  { code: 'eu', name: 'Euskera', englishName: 'Basque', flag: '🇪🇸' },
  { code: 'ca', name: 'Català', englishName: 'Catalan', flag: '🇪🇸' },
  { code: 'gl', name: 'Galego', englishName: 'Galician', flag: '🇪🇸' },

  // Middle Eastern & Turkic languages
  { code: 'tr', name: 'Türkçe', englishName: 'Turkish', flag: '🇹🇷' },
  { code: 'he', name: 'עברית', englishName: 'Hebrew', flag: '🇮🇱' },
  { code: 'fa', name: 'فارسی', englishName: 'Persian', flag: '🇮🇷' },
  { code: 'ur', name: 'اردو', englishName: 'Urdu', flag: '🇵🇰' },
  { code: 'ku', name: 'Kurdî', englishName: 'Kurdish', flag: '🇹🇷' },
  { code: 'az', name: 'Azərbaycan', englishName: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'hy', name: 'Հայերեն', englishName: 'Armenian', flag: '🇦🇲' },
  { code: 'ka', name: 'ქართული', englishName: 'Georgian', flag: '🇬🇪' },

  // Asian languages
  { code: 'ja', name: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', englishName: 'Korean', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', englishName: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', englishName: 'Vietnamese', flag: '🇻🇳' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', flag: '🇧🇩' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia', flag: '🇮🇳' },
  { code: 'as', name: 'অসমীয়া', englishName: 'Assamese', flag: '🇮🇳' },
  { code: 'ne', name: 'नेपाली', englishName: 'Nepali', flag: '🇳🇵' },
  { code: 'si', name: 'සිංහල', englishName: 'Sinhala', flag: '🇱🇰' },
  { code: 'my', name: 'မြန်မာ', englishName: 'Myanmar', flag: '🇲🇲' },
  { code: 'km', name: 'ខ្មែរ', englishName: 'Khmer', flag: '🇰🇭' },
  { code: 'lo', name: 'ລາວ', englishName: 'Lao', flag: '🇱🇦' },
  { code: 'mn', name: 'Монгол', englishName: 'Mongolian', flag: '🇲🇳' },
  { code: 'bo', name: 'བོད་ཡིག', englishName: 'Tibetan', flag: '🇨🇳' },
  { code: 'dz', name: 'རྫོང་ཁ', englishName: 'Dzongkha', flag: '🇧🇹' },

  // Southeast Asian languages
  { code: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', englishName: 'Malay', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', englishName: 'Filipino', flag: '🇵🇭' },
  { code: 'ceb', name: 'Cebuano', englishName: 'Cebuano', flag: '🇵🇭' },
  { code: 'jv', name: 'Basa Jawa', englishName: 'Javanese', flag: '🇮🇩' },

  // African languages
  { code: 'sw', name: 'Kiswahili', englishName: 'Swahili', flag: '🇰🇪' },
  { code: 'am', name: 'አማርኛ', englishName: 'Amharic', flag: '🇪🇹' },
  { code: 'yo', name: 'Yorùbá', englishName: 'Yoruba', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', englishName: 'Igbo', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', englishName: 'Hausa', flag: '🇳🇬' },
  { code: 'zu', name: 'isiZulu', englishName: 'Zulu', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', englishName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'xh', name: 'isiXhosa', englishName: 'Xhosa', flag: '🇿🇦' },
  { code: 'st', name: 'Sesotho', englishName: 'Sotho', flag: '🇱🇸' },
  { code: 'tn', name: 'Setswana', englishName: 'Tswana', flag: '🇧🇼' },
  { code: 'ss', name: 'SiSwati', englishName: 'Swati', flag: '🇸🇿' },
  { code: 've', name: 'Tshivenḓa', englishName: 'Venda', flag: '🇿🇦' },
  { code: 'ts', name: 'Xitsonga', englishName: 'Tsonga', flag: '🇿🇦' },
  { code: 'sn', name: 'ChiShona', englishName: 'Shona', flag: '🇿🇼' },
  { code: 'ny', name: 'ChiCheŵa', englishName: 'Chewa', flag: '🇲🇼' },
  { code: 'rw', name: 'Kinyarwanda', englishName: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'rn', name: 'Kirundi', englishName: 'Kirundi', flag: '🇧🇮' },
  { code: 'lg', name: 'Luganda', englishName: 'Luganda', flag: '🇺🇬' },
  { code: 'so', name: 'Soomaali', englishName: 'Somali', flag: '🇸🇴' },
  { code: 'om', name: 'Afaan Oromoo', englishName: 'Oromo', flag: '🇪🇹' },
  { code: 'ti', name: 'ትግርኛ', englishName: 'Tigrinya', flag: '🇪🇷' },

  // Latin American indigenous languages
  { code: 'qu', name: 'Quechua', englishName: 'Quechua', flag: '🇵🇪' },
  { code: 'gn', name: 'Guaraní', englishName: 'Guarani', flag: '🇵🇾' },
  { code: 'ay', name: 'Aymará', englishName: 'Aymara', flag: '🇧🇴' },

  // Pacific languages
  { code: 'mi', name: 'Te Reo Māori', englishName: 'Maori', flag: '🇳🇿' },
  { code: 'sm', name: 'Gagana Samoa', englishName: 'Samoan', flag: '🇼🇸' },
  { code: 'to', name: 'Lea Faka-Tonga', englishName: 'Tongan', flag: '🇹🇴' },
  { code: 'fj', name: 'Na Vosa Vakaviti', englishName: 'Fijian', flag: '🇫🇯' },

  // Additional European languages
  { code: 'fo', name: 'Føroyskt', englishName: 'Faroese', flag: '🇫🇴' },
  { code: 'kl', name: 'Kalaallisut', englishName: 'Greenlandic', flag: '🇬🇱' },
  { code: 'se', name: 'Davvisámegiella', englishName: 'Northern Sami', flag: '🇳🇴' },

  // Other languages
  { code: 'eo', name: 'Esperanto', englishName: 'Esperanto', flag: '🌍' },
  { code: 'la', name: 'Latina', englishName: 'Latin', flag: '🇻🇦' },
  { code: 'sa', name: 'संस्कृतम्', englishName: 'Sanskrit', flag: '🇮🇳' }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
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
            englishName: additionalLang.englishName, // Include English name for consistency
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
       (lang.englishName && lang.englishName.toLowerCase().includes(searchLower)) ||
       lang.code.toLowerCase().includes(searchLower))
    ).slice(0, 10); // Limit to 10 results
  }, [searchTerm, selectedLanguages]);

  const currentLanguage = availableLanguages.find(lang => lang.code === i18n.language) || availableLanguages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddLanguage = (langCode: string) => {
    const newSelectedLanguages = [...selectedLanguages, langCode];
    setSelectedLanguages(newSelectedLanguages);
    localStorage.setItem('sgex-selected-languages', JSON.stringify(newSelectedLanguages));
    
    // Optionally switch to the newly added language
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                <span className="language-name">
                  {language.name}
                  {language.englishName !== language.name && (
                    <span className="language-english-name"> ({language.englishName})</span>
                  )}
                </span>
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