/**
 * Lazy Modal Factory
 * 
 * Provides lazy loading for modal components to improve initial page load performance.
 * Modals are typically not needed immediately and can be loaded on demand.
 */

import React, { Suspense } from 'react';
import lazyServiceFactory from '../services/lazyServiceFactory';

// Modal loading fallback component
const ModalLoadingFallback = ({ modalName }) => (
  <div 
    className="modal fade show" 
    style={{ 
      display: 'block', 
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1050
    }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body text-center p-4">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mb-0">Loading {modalName}...</p>
        </div>
      </div>
    </div>
  </div>
);

class LazyModalFactory {
  constructor() {
    this.modalCache = new Map();
  }

  /**
   * Create a lazy-loaded modal component
   * @param {string} modalName - Name of the modal for debugging
   * @param {Function} importFunction - Function that returns import() promise
   * @returns {React.Component} Lazy modal component
   */
  createLazyModal(modalName, importFunction) {
    const cacheKey = modalName;
    
    if (this.modalCache.has(cacheKey)) {
      return this.modalCache.get(cacheKey);
    }

    const LazyModal = React.lazy(importFunction);
    
    const SuspenseWrapper = (props) => (
      <Suspense fallback={<ModalLoadingFallback modalName={modalName} />}>
        <LazyModal {...props} />
      </Suspense>
    );
    
    SuspenseWrapper.displayName = `LazyModal(${modalName})`;
    
    this.modalCache.set(cacheKey, SuspenseWrapper);
    return SuspenseWrapper;
  }

  /**
   * Clear modal cache (useful for testing)
   */
  clearCache() {
    this.modalCache.clear();
  }
}

// Create singleton instance
const lazyModalFactory = new LazyModalFactory();

// Lazy Modal Components

// Help Modal - Large interactive help system
export const LazyHelpModal = lazyModalFactory.createLazyModal(
  'HelpModal',
  () => import('../components/HelpModal')
);

// Enhanced Tutorial Modal - Interactive tutorials
export const LazyEnhancedTutorialModal = lazyModalFactory.createLazyModal(
  'EnhancedTutorialModal', 
  () => import('../components/EnhancedTutorialModal')
);

// Page View Modal - Document viewing
export const LazyPageViewModal = lazyModalFactory.createLazyModal(
  'PageViewModal',
  () => import('../components/PageViewModal')
);

// Commit Diff Modal - Git diff visualization
export const LazyCommitDiffModal = lazyModalFactory.createLazyModal(
  'CommitDiffModal',
  () => import('../components/CommitDiffModal')
);

// Login Modal - Authentication
export const LazyLoginModal = lazyModalFactory.createLazyModal(
  'LoginModal',
  () => import('../components/LoginModal')
);

// Screenshot Editor - Image editing functionality
export const LazyScreenshotEditor = lazyModalFactory.createLazyModal(
  'ScreenshotEditor',
  () => import('../components/ScreenshotEditor')
);

// Framework Components that can be lazy loaded

// Commit Message Dialog - Git operations
export const LazyCommitMessageDialog = lazyModalFactory.createLazyModal(
  'CommitMessageDialog',
  () => import('../components/framework/CommitMessageDialog')
);

// Editor Components that are heavy and can be lazy loaded

// Feature File Editor - Complex editor
export const LazyFeatureFileEditor = lazyModalFactory.createLazyModal(
  'FeatureFileEditor',
  () => import('../components/FeatureFileEditor')
);

// BPMN Editor - Very heavy component
export const LazyBPMNEditor = lazyModalFactory.createLazyModal(
  'BPMNEditor',
  () => import('../components/BPMNEditor')
);

// BPMN Viewer - Heavy viewing component
export const LazyBPMNViewer = lazyModalFactory.createLazyModal(
  'BPMNViewer',
  () => import('../components/BPMNViewer')
);

// Questionnaire Editor - Form building
export const LazyQuestionnaireEditor = lazyModalFactory.createLazyModal(
  'QuestionnaireEditor',
  () => import('../components/QuestionnaireEditor')
);

// Component Editor - Generic editor
export const LazyComponentEditor = lazyModalFactory.createLazyModal(
  'ComponentEditor',
  () => import('../components/ComponentEditor')
);

// Actor Editor - BPMN actor management
export const LazyActorEditor = lazyModalFactory.createLazyModal(
  'ActorEditor',
  () => import('../components/ActorEditor')
);

export { lazyModalFactory };

export default lazyModalFactory;