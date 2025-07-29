import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import helpContentService from '../services/helpContentService';
import HelpModal from './HelpModal';
import './ContextualHelpMascot.css';

const ContextualHelpMascot = ({ pageId, helpContent, position = 'bottom-right', contextData = {}, notificationBadge = false }) => {
  const { t, i18n } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);
  const [helpSticky, setHelpSticky] = useState(false);
  const [selectedHelpTopic, setSelectedHelpTopic] = useState(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const languages = [
    { code: 'en-US', name: t('language.english'), flag: '🇺🇸' },
    { code: 'fr-FR', name: t('language.french'), flag: '🇫🇷' },
    { code: 'es-ES', name: t('language.spanish'), flag: '🇪🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Get help topics for the page
  const helpTopics = pageId ? helpContentService.getHelpTopicsForPage(pageId, contextData) : [];

  const handleMouseEnter = () => {
    if (!helpSticky) {
      setShowHelp(true);
    }
  };

  const handleMouseLeave = () => {
    if (!helpSticky) {
      setShowHelp(false);
    }
  };

  const handleClick = () => {
    setHelpSticky(!helpSticky);
    setShowHelp(!helpSticky || showHelp);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
    setHelpSticky(false);
  };

  const handleHelpTopicClick = (topic) => {
    setSelectedHelpTopic(topic);
    setShowHelp(false);
    setHelpSticky(false);
  };

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setShowLanguageSelector(false);
  };

  const toggleLanguageSelector = (e) => {
    e.stopPropagation();
    setShowLanguageSelector(!showLanguageSelector);
  };

  const handleCloseModal = () => {
    setSelectedHelpTopic(null);
  };

  // Always render the mascot now since we have universal topics
  // if (!hasTopics) {
  //   return null;
  // }

  return (
    <>
      <div className={`contextual-help-mascot ${position}`}>
        <div 
          className="mascot-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <img 
            src="/sgex/sgex-mascot.png" 
            alt="SGEX Helper" 
            className="mascot-icon"
          />
          
          {/* Notification badge for important help messages */}
          {notificationBadge && (
            <div className="notification-badge">
              !
            </div>
          )}
          
          {/* Question mark thought bubble - always show since we always have topics now */}
          {!notificationBadge && (
            <div className="question-bubble">
              ?
            </div>
          )}
        </div>
        
        {showHelp && (
          <div className="help-thought-bubble">
            <div className="bubble-content">
              {helpSticky && (
                <button 
                  className="close-bubble-btn"
                  onClick={handleCloseHelp}
                  aria-label={t('buttons.close')}
                >
                  ×
                </button>
              )}
              <div className="help-text">
                {helpTopics.length > 0 ? (
                  <div className="help-topics-list">
                    <h4>{t('help.getHelp')}</h4>
                    {helpTopics.map((topic) => (
                      <button
                        key={topic.id}
                        className="help-topic-btn"
                        onClick={() => handleHelpTopicClick(topic)}
                      >
                        {topic.badge && (
                          <img 
                            src={topic.badge} 
                            alt="" 
                            className="help-topic-badge"
                          />
                        )}
                        <span className="help-topic-title">{topic.title}</span>
                      </button>
                    ))}
                    
                    {/* Language selector as horizontal menu */}
                    <div className="language-section">
                      <button
                        className="help-topic-btn language-toggle-btn"
                        onClick={toggleLanguageSelector}
                        aria-expanded={showLanguageSelector}
                      >
                        <span className="language-flag">{currentLanguage.flag}</span>
                        <span className="help-topic-title">{t('language.selector')}</span>
                        <span className={`language-arrow ${showLanguageSelector ? 'open' : ''}`}>▼</span>
                      </button>
                      
                      {showLanguageSelector && (
                        <div className="language-slideout">
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
                  </div>
                ) : (
                  helpContent
                )}
              </div>
            </div>
            <div className="bubble-tail"></div>
          </div>
        )}
        
        {/* Click outside to close language selector */}
        {showLanguageSelector && (
          <div 
            className="language-overlay" 
            onClick={() => setShowLanguageSelector(false)}
          />
        )}
      </div>
      
      {/* Help Modal for displaying slideshow content */}
      {selectedHelpTopic && (
        <HelpModal
          helpTopic={selectedHelpTopic}
          contextData={contextData}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ContextualHelpMascot;