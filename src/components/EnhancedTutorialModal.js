import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import tutorialService from '../services/tutorialService';
import useThemeImage from '../hooks/useThemeImage';
import { ALT_TEXT_KEYS, getAltText } from '../utils/imageAltTextHelper';
import './EnhancedTutorialModal.css';

const EnhancedTutorialModal = ({ tutorialId, onClose, contextData = {} }) => {
  const { t } = useTranslation();
  const [tutorial, setTutorial] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tutorialState, setTutorialState] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showChoices, setShowChoices] = useState(false);

  // Theme-aware mascot image
  const mascotImage = useThemeImage('sgex-mascot.png');

  // Load tutorial and any saved progress
  useEffect(() => {
    if (tutorialId) {
      const tutorialDef = tutorialService.getTutorial(tutorialId);
      if (tutorialDef) {
        setTutorial(tutorialDef);
        
        // Load any saved progress
        const savedProgress = tutorialService.loadTutorialProgress(tutorialId, contextData);
        if (savedProgress && savedProgress.state) {
          setCurrentStepIndex(savedProgress.state.currentStepIndex || 0);
          setTutorialState(savedProgress.state.context || {});
        }
      }
      setIsLoading(false);
    }
  }, [tutorialId, contextData]);

  // Save progress when step changes
  useEffect(() => {
    if (tutorial && currentStepIndex >= 0) {
      tutorialService.saveTutorialProgress(tutorialId, {
        currentStepIndex,
        context: tutorialState
      }, contextData);
    }
  }, [tutorial, tutorialId, currentStepIndex, tutorialState, contextData]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleStepNavigation = (direction, userChoice = null) => {
    if (!tutorial) return;

    let nextIndex = currentStepIndex;
    
    if (direction === 'next') {
      const stepResult = tutorialService.processStep(tutorial, currentStepIndex, userChoice, tutorialState);
      
      if (stepResult.isComplete) {
        // Tutorial complete
        onClose();
        return;
      }
      
      if (stepResult.stepIndex !== undefined) {
        nextIndex = stepResult.stepIndex + 1;
      } else {
        nextIndex = currentStepIndex + 1;
      }
      
      // Update tutorial state/context
      if (stepResult.context) {
        setTutorialState(stepResult.context);
      }
    } else if (direction === 'previous') {
      nextIndex = Math.max(0, currentStepIndex - 1);
    } else if (typeof direction === 'number') {
      nextIndex = direction;
    }

    setCurrentStepIndex(nextIndex);
    setShowChoices(false);
  };

  const handleUserChoice = (choice) => {
    handleStepNavigation('next', choice);
  };

  const renderCurrentStep = () => {
    if (!tutorial || !tutorial.steps || currentStepIndex >= tutorial.steps.length) {
      return null;
    }

    const currentStep = tutorial.steps[currentStepIndex];
    const stepResult = tutorialService.processStep(tutorial, currentStepIndex, null, tutorialState);

    // Check if this step has branching choices
    const hasBranches = currentStep.branches && currentStep.branches.length > 0;

    return (
      <div className="enhanced-tutorial-step">
        <div className="tutorial-header">
          <h3>{currentStep.title}</h3>
          <div className="step-counter">
            <span className="current-step">{currentStepIndex + 1}</span>
            <span className="step-separator">of</span>
            <span className="total-steps">{tutorial.steps.length}</span>
          </div>
        </div>
        
        <div className="tutorial-content">
          <div 
            className="step-content"
            dangerouslySetInnerHTML={{ __html: currentStep.content }}
          />
          
          {hasBranches && (
            <div className="tutorial-choices">
              <div className="choices-container">
                {currentStep.branches.map((branch, index) => (
                  <button
                    key={index}
                    className="choice-btn"
                    onClick={() => handleUserChoice(branch.choice)}
                    aria-describedby={`choice-desc-${index}`}
                  >
                    <span className="choice-label">{branch.label}</span>
                    {branch.description && (
                      <span 
                        id={`choice-desc-${index}`}
                        className="choice-description"
                      >
                        {branch.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="tutorial-controls">
          <button 
            onClick={() => handleStepNavigation('previous')}
            disabled={currentStepIndex === 0}
            className="nav-btn nav-btn-prev"
            aria-label="Previous step"
          >
            <span className="nav-icon">←</span>
            <span className="nav-label">Previous</span>
          </button>
          
          {/* Progress indicators */}
          <div className="step-indicators">
            {tutorial.steps.map((_, index) => (
              <button
                key={index}
                className={`step-dot ${index === currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
                onClick={() => handleStepNavigation(index)}
                aria-label={`Go to step ${index + 1}: ${tutorial.steps[index].title}`}
                title={tutorial.steps[index].title}
              />
            ))}
          </div>
          
          {!hasBranches && (
            <button 
              onClick={() => handleStepNavigation('next')}
              disabled={currentStepIndex >= tutorial.steps.length - 1}
              className="nav-btn nav-btn-next"
              aria-label="Next step"
            >
              <span className="nav-label">
                {currentStepIndex >= tutorial.steps.length - 1 ? 'Complete' : 'Next'}
              </span>
              <span className="nav-icon">→</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="enhanced-tutorial-overlay" onClick={handleOverlayClick}>
        <div className="enhanced-tutorial-modal">
          <div className="tutorial-loading">
            <img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Helper')} className="loading-mascot" />
            <p>Loading tutorial...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="enhanced-tutorial-overlay" onClick={handleOverlayClick}>
        <div className="enhanced-tutorial-modal">
          <div className="tutorial-error">
            <img src={mascotImage} alt={getAltText(t, ALT_TEXT_KEYS.MASCOT_HELPER, 'SGEX Helper')} className="error-mascot" />
            <h3>Tutorial Not Found</h3>
            <p>The requested tutorial could not be found.</p>
            <button onClick={onClose} className="error-close-btn">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-tutorial-overlay" onClick={handleOverlayClick}>
      <div className="enhanced-tutorial-modal">
        <div className="tutorial-modal-header">
          <div className="tutorial-title-section">
            {tutorial.badge && (
              <img 
                src={tutorial.badge} 
                alt="" 
                className="tutorial-badge"
                role="presentation"
              />
            )}
            <div className="tutorial-title-info">
              <h2>{tutorial.title}</h2>
              {tutorial.description && (
                <p className="tutorial-description">{tutorial.description}</p>
              )}
            </div>
          </div>
          
          <button 
            className="tutorial-close-btn"
            onClick={onClose}
            aria-label="Close tutorial"
          >
            ×
          </button>
        </div>
        
        <div className="tutorial-modal-content">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTutorialModal;