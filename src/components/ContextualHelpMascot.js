import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import helpContentService from '../services/helpContentService';
import cacheManagementService from '../services/cacheManagementService';
import issueTrackingService from '../services/issueTrackingService';
import githubService from '../services/githubService';
import HelpModal from './HelpModal';
import TrackedItemsViewer from './TrackedItemsViewer';
import LanguageSelector from './LanguageSelector';
import useThemeImage from '../hooks/useThemeImage';
import { ALT_TEXT_KEYS, getAltText } from '../utils/imageAltTextHelper';

const ContextualHelpMascot = ({ pageId, helpContent, position = 'bottom-right', contextData = {}, notificationBadge = false }) => {
  const { t, i18n } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);
  const [helpSticky, setHelpSticky] = useState(false);
  const [selectedHelpTopic, setSelectedHelpTopic] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [showTrackedItems, setShowTrackedItems] = useState(false);
  const [trackedItemsCount, setTrackedItemsCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Theme-aware mascot image
  const mascotImage = useThemeImage('sgex-mascot.png');

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

  // Monitor authentication state and tracked items count
  useEffect(() => {
    const updateAuthAndTrackedCount = async () => {
      const authenticated = githubService.isAuth();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        try {
          const counts = await issueTrackingService.getTrackedCounts();
          setTrackedItemsCount(counts.total);
        } catch (error) {
          console.warn('Failed to get tracked items count:', error);
          setTrackedItemsCount(0);
        }
      } else {
        setTrackedItemsCount(0);
      }
    };

    // Update immediately
    updateAuthAndTrackedCount();

    // Set up periodic updates every 30 seconds when authenticated
    const interval = setInterval(updateAuthAndTrackedCount, 30000);

    return () => clearInterval(interval);
  }, []);

  // Start background sync when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      issueTrackingService.startBackgroundSync();
    } else {
      issueTrackingService.stopBackgroundSync();
    }

    return () => {
      issueTrackingService.stopBackgroundSync();
    };
  }, [isAuthenticated]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get help topics for the page
  const helpTopics = pageId ? helpContentService.getHelpTopicsForPage(pageId, contextData) : [];

  // Enhanced help topics with tracked items functionality
  const enhancedHelpTopics = [
    ...helpTopics,
    // Add tracked items topic when authenticated and there are tracked items
    ...(isAuthenticated && trackedItemsCount > 0 ? [{
      id: 'tracked-items',
      title: `Tracked Items (${trackedItemsCount})`,
      badge: '/sgex/cat-paw-icon.svg',
      type: 'action',
      action: () => setShowTrackedItems(true),
      notificationBadge: trackedItemsCount
    }] : []),
    // Add tracked items topic when authenticated even if no tracked items (so users know it exists)
    ...(isAuthenticated && trackedItemsCount === 0 ? [{
      id: 'tracked-items-empty',
      title: 'Tracked Items',
      badge: '/sgex/cat-paw-icon.svg', 
      type: 'action',
      action: () => setShowTrackedItems(true)
    }] : [])
  ];

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
            src={mascotImage} 
            alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Helper')} 
            className="mascot-icon"
          />
          
          {/* Notification badge for tracked items or important help messages */}
          {(notificationBadge || (isAuthenticated && trackedItemsCount > 0)) && (
            <div className="notification-badge">
              {isAuthenticated && trackedItemsCount > 0 ? trackedItemsCount : '!'}
            </div>
          )}
          
          {/* Question mark thought bubble - show when no notification badge */}
          {!notificationBadge && !(isAuthenticated && trackedItemsCount > 0) && (
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
                {enhancedHelpTopics.length > 0 ? (
                  <div className="help-topics-list">
                    <h4>{t('help.title')}</h4>
                    {enhancedHelpTopics.map((topic) => (
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
                        {topic.notificationBadge && (
                          <span className="help-topic-notification-badge">
                            {topic.notificationBadge}
                          </span>
                        )}
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

      {/* Tracked Items Viewer Modal */}
      {showTrackedItems && (
        <TrackedItemsViewer
          onClose={() => setShowTrackedItems(false)}
        />
      )}
    </>
  );
};

export default ContextualHelpMascot;