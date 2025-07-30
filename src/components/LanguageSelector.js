import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LanguageSelector = ({ position = 'top-right', showLabel = true }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en-US', name: t('language.english'), flag: '🇺🇸' },
    { code: 'fr-FR', name: t('language.french'), flag: '🇫🇷' },
    { code: 'es-ES', name: t('language.spanish'), flag: '🇪🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`language-selector language-selector-${position}`}>
      {showLabel && (
        <span className="language-label">{t('language.selector')}:</span>
      )}
      <div className="language-dropdown">
        <button
          className="language-button"
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={isOpen}
          title={t('language.selector')}
        >
          <span className="language-flag">{currentLanguage.flag}</span>
          <span className="language-name">{currentLanguage.name}</span>
          <span className={`language-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>
        
        {isOpen && (
          <div className="language-menu">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`language-option ${
                  language.code === i18n.language ? 'active' : ''
                }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <span className="language-flag">{language.flag}</span>
                <span className="language-name">{language.name}</span>
                {language.code === i18n.language && (
                  <span className="language-check">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="language-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;