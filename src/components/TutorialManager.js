import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import tutorialService from '../services/tutorialService';
import EnhancedTutorialModal from './EnhancedTutorialModal';
import './TutorialManager.css';

/**
 * TutorialManager - Higher-order component that provides tutorial management capabilities
 * to any page component. It handles tutorial registration, menu integration, and modal display.
 */
const TutorialManager = ({ 
  pageId, 
  children, 
  contextData = {},
  tutorials = [],
  autoRegisterTutorials = true 
}) => {
  const { t } = useTranslation();
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialId, setCurrentTutorialId] = useState(null);
  const [availableTutorials, setAvailableTutorials] = useState([]);

  // Register page-specific tutorials
  useEffect(() => {
    if (autoRegisterTutorials && tutorials.length > 0) {
      tutorials.forEach(tutorial => {
        try {
          // Ensure tutorial is registered for this page
          const tutorialDef = {
            ...tutorial,
            pages: tutorial.pages || [pageId]
          };
          
          tutorialService.registerTutorial(tutorial.id, tutorialDef);
        } catch (error) {
          console.warn(`Failed to register tutorial ${tutorial.id}:`, error);
        }
      });
    }

    // Update available tutorials for this page
    updateAvailableTutorials();
  }, [pageId, tutorials, autoRegisterTutorials, contextData]);

  const updateAvailableTutorials = () => {
    const pageTutorials = tutorialService.getTutorialsForPage(pageId, contextData);
    setAvailableTutorials(pageTutorials);
  };

  const launchTutorial = (tutorialId) => {
    setCurrentTutorialId(tutorialId);
    setShowTutorial(true);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    setCurrentTutorialId(null);
  };

  // Provide tutorial functions to children via React context or props
  const tutorialProps = {
    availableTutorials,
    launchTutorial,
    tutorialService,
    pageId
  };

  return (
    <>
      {/* Render children with tutorial props */}
      {typeof children === 'function' ? children(tutorialProps) : children}

      {/* Tutorial Modal */}
      {showTutorial && currentTutorialId && (
        <EnhancedTutorialModal
          tutorialId={currentTutorialId}
          onClose={closeTutorial}
          contextData={contextData}
        />
      )}
    </>
  );
};

/**
 * TutorialLauncher - Component for launching specific tutorials
 */
export const TutorialLauncher = ({ 
  tutorialId, 
  children, 
  className = 'tutorial-launcher',
  contextData = {},
  onLaunch,
  ...props 
}) => {
  const [showTutorial, setShowTutorial] = useState(false);

  const handleClick = () => {
    if (onLaunch) {
      onLaunch(tutorialId);
    } else {
      setShowTutorial(true);
    }
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <>
      <button 
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children || 'Start Tutorial'}
      </button>

      {showTutorial && (
        <EnhancedTutorialModal
          tutorialId={tutorialId}
          onClose={closeTutorial}
          contextData={contextData}
        />
      )}
    </>
  );
};

/**
 * TutorialMenu - Component for displaying available tutorials in a menu
 */
export const TutorialMenu = ({ 
  pageId, 
  contextData = {}, 
  onTutorialSelect,
  className = 'tutorial-menu',
  showCategories = false 
}) => {
  const { t } = useTranslation();
  const [tutorials, setTutorials] = useState([]);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    const pageTutorials = tutorialService.getTutorialsForPage(pageId, contextData);
    setTutorials(pageTutorials);
    
    if (showCategories) {
      setCategories(tutorialService.getCategories());
    }
  }, [pageId, contextData, showCategories]);

  const handleTutorialClick = (tutorialId) => {
    if (onTutorialSelect) {
      onTutorialSelect(tutorialId);
    }
  };

  if (tutorials.length === 0) {
    return null;
  }

  const renderTutorialsByCategory = () => {
    const categorizedTutorials = {};
    
    tutorials.forEach(tutorial => {
      const category = tutorial.category || 'uncategorized';
      if (!categorizedTutorials[category]) {
        categorizedTutorials[category] = [];
      }
      categorizedTutorials[category].push(tutorial);
    });

    return Object.entries(categorizedTutorials).map(([categoryId, categoryTutorials]) => (
      <div key={categoryId} className="tutorial-category">
        <h4 className="tutorial-category-title">
          {categories[categoryId] || categoryId}
        </h4>
        <div className="tutorial-category-items">
          {categoryTutorials.map(tutorial => (
            <button
              key={tutorial.id}
              className="tutorial-menu-item"
              onClick={() => handleTutorialClick(tutorial.id)}
              title={tutorial.description}
            >
              {tutorial.badge && (
                <img 
                  src={tutorial.badge} 
                  alt="" 
                  className="tutorial-menu-badge"
                  role="presentation"
                />
              )}
              <span className="tutorial-menu-title">{tutorial.title}</span>
            </button>
          ))}
        </div>
      </div>
    ));
  };

  const renderTutorialsList = () => {
    return tutorials.map(tutorial => (
      <button
        key={tutorial.id}
        className="tutorial-menu-item"
        onClick={() => handleTutorialClick(tutorial.id)}
        title={tutorial.description}
      >
        {tutorial.badge && (
          <img 
            src={tutorial.badge} 
            alt="" 
            className="tutorial-menu-badge"
            role="presentation"
          />
        )}
        <span className="tutorial-menu-title">{tutorial.title}</span>
      </button>
    ));
  };

  return (
    <div className={className}>
      {showCategories ? renderTutorialsByCategory() : renderTutorialsList()}
    </div>
  );
};

/**
 * Hook for accessing tutorial functionality in functional components
 */
export const useTutorials = (pageId, contextData = {}) => {
  const [tutorials, setTutorials] = useState([]);

  useEffect(() => {
    const pageTutorials = tutorialService.getTutorialsForPage(pageId, contextData);
    setTutorials(pageTutorials);
  }, [pageId, contextData]);

  const launchTutorial = (tutorialId) => {
    // For hooks, we'll need to use a global modal manager or portal
    // For now, return the tutorial for the component to handle
    return tutorialService.getTutorial(tutorialId);
  };

  const registerTutorial = (tutorialId, tutorialDefinition) => {
    try {
      tutorialService.registerTutorial(tutorialId, {
        ...tutorialDefinition,
        pages: tutorialDefinition.pages || [pageId]
      });
      // Refresh tutorials list
      const updated = tutorialService.getTutorialsForPage(pageId, contextData);
      setTutorials(updated);
      return true;
    } catch (error) {
      console.warn(`Failed to register tutorial ${tutorialId}:`, error);
      return false;
    }
  };

  return {
    tutorials,
    launchTutorial,
    registerTutorial,
    tutorialService
  };
};

export default TutorialManager;