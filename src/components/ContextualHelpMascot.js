import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import helpContentService from '../services/helpContentService';
import tutorialService from '../services/tutorialService';
import cacheManagementService from '../services/cacheManagementService';
import issueTrackingService from '../services/issueTrackingService';
import githubService from '../services/githubService';
import HelpModal from './HelpModal';
import TrackedItemsViewer from './TrackedItemsViewer';
import LanguageSelector from './LanguageSelector';
import useThemeImage from '../hooks/useThemeImage';
import { getSavedTheme, toggleTheme } from '../utils/themeManager';
import { ALT_TEXT_KEYS, getAltText } from '../utils/imageAltTextHelper';

// Help state persistence utilities
const HELP_STATE_KEY = 'sgex-help-state';

const getSavedHelpState = () => {
  try {
    const savedState = localStorage.getItem(HELP_STATE_KEY);
    return savedState ? parseInt(savedState, 10) : 0;
  } catch (error) {
    console.warn('Failed to load help state from localStorage:', error);
    return 0;
  }
};

const saveHelpState = (state) => {
  try {
    localStorage.setItem(HELP_STATE_KEY, state.toString());
  } catch (error) {
    console.warn('Failed to save help state to localStorage:', error);
  }
};

const ContextualHelpMascot = ({ pageId, helpContent, position = 'bottom-right', contextData = {}, notificationBadge = false }) => {
  const { t, i18n } = useTranslation();
  const { user, repo } = useParams(); // Extract DAK context from URL
  const [showHelp, setShowHelp] = useState(false);
  const [helpSticky, setHelpSticky] = useState(false);
  const [selectedHelpTopic, setSelectedHelpTopic] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(getSavedTheme() === 'dark');
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [showTrackedItems, setShowTrackedItems] = useState(false);
  const [trackedItemsCount, setTrackedItemsCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [helpState, setHelpState] = useState(() => getSavedHelpState()); // 0: hidden, 1: non-sticky, 2: sticky

  // Theme-aware mascot image
  const mascotImage = useThemeImage('sgex-mascot.png');

  // Initialize help state from saved preferences and sync with derived states
  useEffect(() => {
    const savedState = getSavedHelpState();
    setHelpState(savedState);
    
    // Set derived states based on saved help state
    switch (savedState) {
      case 0: // Hidden
        setShowHelp(false);
        setHelpSticky(false);
        break;
      case 1: // Non-sticky (shown)
        setShowHelp(true);
        setHelpSticky(false);
        break;
      case 2: // Sticky (shown)
        setShowHelp(true);
        setHelpSticky(true);
        break;
    }
  }, []);

  // Save help state whenever it changes
  useEffect(() => {
    saveHelpState(helpState);
  }, [helpState]);

  // Sync local state with actual theme on mount
  useEffect(() => {
    const currentTheme = getSavedTheme();
    setIsDarkMode(currentTheme === 'dark');
  }, []);

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
          // Only update count if it's different to prevent flashing
          setTrackedItemsCount(prevCount => {
            return prevCount !== counts.total ? counts.total : prevCount;
          });
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

    // Set up periodic updates every 60 seconds when authenticated (less frequent to reduce flashing)
    const interval = setInterval(updateAuthAndTrackedCount, 60000);

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

  // Auto-enable DAK repository filter when visiting a DAK page
  useEffect(() => {
    const enableDAKFilter = async () => {
      if (isAuthenticated && user && repo) {
        const dakRepository = `${user}/${repo}`;
        try {
          await issueTrackingService.enableDAKRepositoryFilter(dakRepository);
        } catch (error) {
          console.warn('Failed to enable DAK repository filter:', error);
        }
      }
    };

    enableDAKFilter();
  }, [isAuthenticated, user, repo]);

  const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setIsDarkMode(newTheme === 'dark');
  };

  // Get help topics for the page
  const helpTopics = pageId ? helpContentService.getHelpTopicsForPage(pageId, contextData) : [];

  // Enhanced help topics with tracked items functionality
  const enhancedHelpTopics = [
    ...helpTopics,
    // Add tracked items topic when authenticated - show immediately without waiting for count
    ...(isAuthenticated ? [{
      id: 'tracked-items',
      title: trackedItemsCount > 0 ? `Tracked Items (${trackedItemsCount})` : 'Tracked Items',
      badge: '/sgex/cat-paw-icon.svg',
      type: 'action',
      action: () => setShowTrackedItems(true)
    }] : [])
  ];

  const handleMouseEnter = () => {
    // Only show on hover if we're in non-sticky state (state 1)
    if (helpState === 1) {
      setShowHelp(true);
    }
  };

  const handleMouseLeave = () => {
    // Only hide on mouse leave if we're in non-sticky state (state 1)
    if (helpState === 1) {
      setShowHelp(false);
    }
  };

  const handleClick = () => {
    // Cycle through three states: 0 (hidden) -> 1 (non-sticky) -> 2 (sticky) -> 0 (hidden)
    const nextState = (helpState + 1) % 3;
    setHelpState(nextState);
    
    switch (nextState) {
      case 0: // Hidden
        setShowHelp(false);
        setHelpSticky(false);
        break;
      case 1: // Non-sticky (shown)
        setShowHelp(true);
        setHelpSticky(false);
        break;
      case 2: // Sticky (shown)
        setShowHelp(true);
        setHelpSticky(true);
        break;
    }
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
    setHelpSticky(false);
    setHelpState(0); // Reset to hidden state
  };

  const handleHelpTopicClick = (topic) => {
    // Check if this is an enhanced tutorial
    if (topic.tutorialId) {
      setSelectedHelpTopic({ ...topic, type: 'enhanced-tutorial' });
      setShowHelp(false);
      setHelpSticky(false);
      setHelpState(0); // Reset to hidden state
      return;
    }
    
    // If it's an action type, execute the action immediately
    if (topic.type === 'action' && topic.action) {
      topic.action();
      setShowHelp(false);
      setHelpSticky(false);
      setHelpState(0); // Reset to hidden state
    } else {
      // For slideshow and other types, show in modal
      setSelectedHelpTopic(topic);
      setShowHelp(false);
      setHelpSticky(false);
      setHelpState(0); // Reset to hidden state
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
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          role="button"
          tabIndex={0}
        >
          <img 
            src={mascotImage} 
            alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Helper')} 
            className="mascot-icon"
          />
          
          {/* Notification badge for important help messages only (not for tracked items count) */}
          {notificationBadge && (
            <div className="notification-badge">
              !
            </div>
          )}
          
          {/* Question mark thought bubble - show when no notification badge */}
          {!notificationBadge && (
            <div className={`question-bubble ${showHelp ? 'help-open' : ''}`}>
              ?
            </div>
          )}
        </div>
        
        {showHelp && (
          <div className="help-thought-bubble">
            <div className="bubble-content">
              {helpState === 2 && (
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
                      onClick={handleToggleTheme}
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
                      onClick={handleToggleTheme}
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
          tutorialId={selectedHelpTopic.type === 'enhanced-tutorial' ? selectedHelpTopic.tutorialId : null}
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