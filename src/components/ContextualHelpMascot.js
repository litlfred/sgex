import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import helpContentService from '../services/helpContentService';
import cacheManagementService from '../services/cacheManagementService';
import HelpModal from './HelpModal';
import LanguageSelector from './LanguageSelector';
import './ContextualHelpMascot.css';

const ContextualHelpMascot = ({ pageId, helpContent, position = 'bottom-right', contextData = {}, notificationBadge = false }) => {
  const { t, i18n } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);
  const [helpSticky, setHelpSticky] = useState(false);
  const [selectedHelpTopic, setSelectedHelpTopic] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sgex-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check if user explicitly prefers light mode
      let prefersLight = false;
      try {
        if (window.matchMedia) {
          prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        }
      } catch (e) {
        // Fallback for test environments
        prefersLight = false;
      }
      // Default to dark mode unless user explicitly prefers light
      setIsDarkMode(!prefersLight);
    }
  }, []);

  // Update body class when theme changes
  useEffect(() => {
    document.body.className = isDarkMode ? 'theme-dark' : 'theme-light';
    localStorage.setItem('sgex-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Update document direction for RTL languages
  useEffect(() => {
    const currentLang = i18n.language || 'en';
    const isRTL = ['ar', 'he', 'fa'].includes(currentLang);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
    // If it's an action type, execute the action immediately
    if (topic.type === 'action' && topic.action) {
      topic.action();
      setShowHelp(false);
      setHelpSticky(false);
    } else {
      // For slideshow and other types, show in modal
      setSelectedHelpTopic(topic);
      setShowHelp(false);
      setHelpSticky(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedHelpTopic(null);
  };

  const handleFlushCache = async () => {
    if (cacheClearing) return; // Prevent multiple clicks
    
    setCacheClearing(true);
    setCacheCleared(false);
    
    try {
      const success = cacheManagementService.clearAllCache();
      if (success) {
        setCacheCleared(true);
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setCacheCleared(false);
        }, 3000);
      } else {
        console.error('Failed to clear cache');
        alert('Failed to clear cache. Please try again.');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache. Please try again.');
    } finally {
      setCacheClearing(false);
    }
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
            src="/sgex-mascot-tabby.svg" 
            alt="SGEX Helper (Tabby Cat)" 
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
            <div className={`question-bubble ${showHelp ? 'help-open' : ''}`}>
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
                  aria-label="Close help"
                >
                  ×
                </button>
              )}
              <div className="help-text">
                {helpTopics.length > 0 ? (
                  <div className="help-topics-list">
                    <h4>{t('help.title')}</h4>
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
                    
                    {/* Language Selector in Help Menu */}
                    <div className="help-menu-divider"></div>
                    <LanguageSelector className="help-menu-language-selector" />
                    
                    {/* Theme Toggle in Help Menu */}
                    <div className="help-menu-divider"></div>
                    <button 
                      className={`help-theme-toggle-btn ${isDarkMode ? 'dark' : 'light'}`}
                      onClick={toggleTheme}
                      aria-label={t('theme.toggle')}
                      title={t('theme.toggle')}
                    >
                      <span className="theme-icon">{isDarkMode ? '🌞' : '🌙'}</span>
                      <span className="theme-label">{isDarkMode ? t('theme.switchToLight', 'Light Mode') : t('theme.switchToDark', 'Dark Mode')}</span>
                    </button>
                    
                    {/* Flush Cache Option */}
                    <div className="help-menu-divider"></div>
                    <div className="help-menu-cache-section">
                      {cacheCleared ? (
                        <div className="cache-success-message">
                          ✅ Cache cleared successfully!
                        </div>
                      ) : (
                        <button
                          className="help-cache-btn"
                          onClick={handleFlushCache}
                          disabled={cacheClearing}
                          title="Clear all cached data including repository info, branch context, and staging ground data"
                        >
                          {cacheClearing ? '🔄 Clearing...' : '🗑️ Flush Cache'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {helpContent}
                    {/* Language Selector in Help Menu */}
                    <div className="help-menu-divider"></div>
                    <LanguageSelector className="help-menu-language-selector" />
                    
                    {/* Theme Toggle in Help Menu */}
                    <div className="help-menu-divider"></div>
                    <button 
                      className={`help-theme-toggle-btn ${isDarkMode ? 'dark' : 'light'}`}
                      onClick={toggleTheme}
                      aria-label={t('theme.toggle')}
                      title={t('theme.toggle')}
                    >
                      <span className="theme-icon">{isDarkMode ? '🌞' : '🌙'}</span>
                      <span className="theme-label">{isDarkMode ? t('theme.switchToLight', 'Light Mode') : t('theme.switchToDark', 'Dark Mode')}</span>
                    </button>
                    
                    {/* Flush Cache Option */}
                    <div className="help-menu-divider"></div>
                    <div className="help-menu-cache-section">
                      {cacheCleared ? (
                        <div className="cache-success-message">
                          ✅ Cache cleared successfully!
                        </div>
                      ) : (
                        <button
                          className="help-cache-btn"
                          onClick={handleFlushCache}
                          disabled={cacheClearing}
                          title="Clear all cached data including repository info, branch context, and staging ground data"
                        >
                          {cacheClearing ? '🔄 Clearing...' : '🗑️ Flush Cache'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bubble-tail"></div>
          </div>
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