import React, { useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import tutorialService from '../services/tutorialService';
import EnhancedTutorialModal from './EnhancedTutorialModal';
import './TutorialManager.css';

interface Tutorial {
  id: string;
  title: string;
  description?: string;
  pages?: string[];
  category?: string;
  badge?: string;
  [key: string]: any;
}

interface TutorialManagerProps {
  pageId: string;
  children: ReactNode | ((props: TutorialProps) => ReactNode);
  contextData?: Record<string, any>;
  tutorials?: Tutorial[];
  autoRegisterTutorials?: boolean;
}

interface TutorialProps {
  availableTutorials: Tutorial[];
  launchTutorial: (tutorialId: string) => void;
  tutorialService: typeof tutorialService;
  pageId: string;
}

/**
 * TutorialManager - Higher-order component that provides tutorial management capabilities
 * to any page component. It handles tutorial registration, menu integration, and modal display.
 */
const TutorialManager: React.FC<TutorialManagerProps> = ({ 
  pageId, 
  children, 
  contextData = {},
  tutorials = [],
  autoRegisterTutorials = true 
}) => {
  const { t } = useTranslation();
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [currentTutorialId, setCurrentTutorialId] = useState<string | null>(null);
  const [availableTutorials, setAvailableTutorials] = useState<Tutorial[]>([]);

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

  const updateAvailableTutorials = (): void => {
    const pageTutorials = tutorialService.getTutorialsForPage(pageId, contextData);
    setAvailableTutorials(pageTutorials);
  };

  const launchTutorial = (tutorialId: string): void => {
    setCurrentTutorialId(tutorialId);
    setShowTutorial(true);
  };

  const closeTutorial = (): void => {
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

interface TutorialLauncherProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tutorialId: string;
  children?: ReactNode;
  className?: string;
  contextData?: Record<string, any>;
  onLaunch?: (tutorialId: string) => void;
}

/**
 * TutorialLauncher - Component for launching specific tutorials
 */
export const TutorialLauncher: React.FC<TutorialLauncherProps> = ({ 
  tutorialId, 
  children, 
  className = 'tutorial-launcher',
  contextData = {},
  onLaunch,
  ...props 
}) => {
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  const handleClick = (): void => {
    if (onLaunch) {
      onLaunch(tutorialId);
    } else {
      setShowTutorial(true);
    }
  };

  const closeTutorial = (): void => {
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

interface TutorialMenuProps {
  pageId: string;
  contextData?: Record<string, any>;
  onTutorialSelect?: (tutorialId: string) => void;
  className?: string;
  showCategories?: boolean;
}

/**
 * TutorialMenu - Component for displaying available tutorials in a menu
 */
export const TutorialMenu: React.FC<TutorialMenuProps> = ({ 
  pageId, 
  contextData = {}, 
  onTutorialSelect,
  className = 'tutorial-menu',
  showCategories = false 
}) => {
  const { t } = useTranslation();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});

  useEffect(() => {
    const pageTutorials = tutorialService.getTutorialsForPage(pageId, contextData);
    setTutorials(pageTutorials);
    
    if (showCategories) {
      setCategories(tutorialService.getCategories());
    }
  }, [pageId, contextData, showCategories]);

  const handleTutorialClick = (tutorialId: string): void => {
    if (onTutorialSelect) {
      onTutorialSelect(tutorialId);
    }
  };

  if (tutorials.length === 0) {
    return null;
  }

  const renderTutorialsByCategory = (): JSX.Element[] => {
    const categorizedTutorials: Record<string, Tutorial[]> = {};
    
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

  const renderTutorialsList = (): JSX.Element[] => {
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

interface UseTutorialsReturn {
  tutorials: Tutorial[];
  launchTutorial: (tutorialId: string) => Tutorial | null;
  registerTutorial: (tutorialId: string, tutorialDefinition: Tutorial) => boolean;
  tutorialService: typeof tutorialService;
}

/**
 * Hook for accessing tutorial functionality in functional components
 */
export const useTutorials = (pageId: string, contextData: Record<string, any> = {}): UseTutorialsReturn => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    const pageTutorials = tutorialService.getTutorialsForPage(pageId, contextData);
    setTutorials(pageTutorials);
  }, [pageId, contextData]);

  const launchTutorial = (tutorialId: string): Tutorial | null => {
    // For hooks, we'll need to use a global modal manager or portal
    // For now, return the tutorial for the component to handle
    return tutorialService.getTutorial(tutorialId);
  };

  const registerTutorial = (tutorialId: string, tutorialDefinition: Tutorial): boolean => {
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