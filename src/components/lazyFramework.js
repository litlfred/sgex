/**
 * Lazy Framework Components
 * 
 * Provides lazy loading for framework components that are not immediately critical.
 * This improves initial page load performance by deferring heavy framework components.
 */

import React, { Suspense } from 'react';

// Framework loading fallback component
const FrameworkLoadingFallback = ({ componentName }) => (
  <div className="d-flex justify-content-center align-items-center p-4">
    <div className="text-center">
      <div className="spinner-border text-primary mb-2" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mb-0 text-muted">Loading {componentName}...</p>
    </div>
  </div>
);

class LazyFrameworkFactory {
  constructor() {
    this.componentCache = new Map();
  }

  /**
   * Create a lazy-loaded framework component
   * @param {string} componentName - Name of the component for debugging
   * @param {Function} importFunction - Function that returns import() promise
   * @returns {React.Component} Lazy framework component
   */
  createLazyFrameworkComponent(componentName, importFunction) {
    const cacheKey = componentName;
    
    if (this.componentCache.has(cacheKey)) {
      return this.componentCache.get(cacheKey);
    }

    const LazyComponent = React.lazy(importFunction);
    
    const SuspenseWrapper = (props) => (
      <Suspense fallback={<FrameworkLoadingFallback componentName={componentName} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
    
    SuspenseWrapper.displayName = `LazyFramework(${componentName})`;
    
    this.componentCache.set(cacheKey, SuspenseWrapper);
    return SuspenseWrapper;
  }

  /**
   * Clear component cache (useful for testing)
   */
  clearCache() {
    this.componentCache.clear();
  }
}

// Create singleton instance
const lazyFrameworkFactory = new LazyFrameworkFactory();

// Core Framework Components (keep these loaded for critical functionality)
// These are already imported by componentRouteService for routing

// Heavy Framework Components that can be lazy loaded

// Asset Editor Layout - Complex editing layout
export const LazyAssetEditorLayout = lazyFrameworkFactory.createLazyFrameworkComponent(
  'AssetEditorLayout',
  () => import('./framework/AssetEditorLayout')
);

// Tool Definition - Complex configuration
export const LazyToolDefinition = lazyFrameworkFactory.createLazyFrameworkComponent(
  'ToolDefinition', 
  () => import('./framework/ToolDefinition')
);

// Save Buttons Container - Complex state management
export const LazySaveButtonsContainer = lazyFrameworkFactory.createLazyFrameworkComponent(
  'SaveButtonsContainer',
  () => import('./framework/SaveButtonsContainer')
);

// Utility Components that can be lazy loaded

// Pages Manager - Document management
export const LazyPagesManager = lazyFrameworkFactory.createLazyFrameworkComponent(
  'PagesManager',
  () => import('./PagesManager')
);

// BPMN Preview - Heavy rendering
export const LazyBPMNPreview = lazyFrameworkFactory.createLazyFrameworkComponent(
  'BPMNPreview',
  () => import('./BPMNPreview')
);

// Core Data Dictionary Viewer - Heavy data processing
export const LazyCoreDataDictionaryViewer = lazyFrameworkFactory.createLazyFrameworkComponent(
  'CoreDataDictionaryViewer',
  () => import('./CoreDataDictionaryViewer')
);

// Documentation Viewer - Markdown processing
export const LazyDocumentationViewer = lazyFrameworkFactory.createLazyFrameworkComponent(
  'DocumentationViewer',
  () => import('./DocumentationViewer')
);

// Business Process Selection - Complex selection UI
export const LazyBusinessProcessSelection = lazyFrameworkFactory.createLazyFrameworkComponent(
  'BusinessProcessSelection',
  () => import('./BusinessProcessSelection')
);

// BPMN Source - Source code viewing
export const LazyBPMNSource = lazyFrameworkFactory.createLazyFrameworkComponent(
  'BPMNSource',
  () => import('./BPMNSource')
);

// Decision Support Logic View - Complex logic display
export const LazyDecisionSupportLogicView = lazyFrameworkFactory.createLazyFrameworkComponent(
  'DecisionSupportLogicView',
  () => import('./DecisionSupportLogicView')
);

// DAK FAQ Demo - Demo functionality
export const LazyDAKFAQDemo = lazyFrameworkFactory.createLazyFrameworkComponent(
  'DAKFAQDemo',
  () => import('./DAKFAQDemo')
);

// Repository Selection - Complex repository interface
export const LazyRepositorySelection = lazyFrameworkFactory.createLazyFrameworkComponent(
  'RepositorySelection',
  () => import('./RepositorySelection')
);

// Organization Selection - Complex organization interface
export const LazyOrganizationSelection = lazyFrameworkFactory.createLazyFrameworkComponent(
  'OrganizationSelection',
  () => import('./OrganizationSelection')
);

// DAK Configuration - Complex configuration interface
export const LazyDAKConfiguration = lazyFrameworkFactory.createLazyFrameworkComponent(
  'DAKConfiguration',
  () => import('./DAKConfiguration')
);

// Preload Strategy for Framework Components
// These components are likely to be needed so we preload them after initial load

export function preloadFrameworkComponents() {
  if (typeof window === 'undefined') return; // Skip during SSR
  
  // Preload commonly used framework components after page interaction
  const preloadCommon = () => {
    LazyDocumentationViewer; // Documentation is frequently accessed
    LazyPagesManager; // Page management is common
  };
  
  // Preload after user interaction
  const events = ['click', 'keydown', 'touchstart', 'mousemove'];
  const preloadOnce = () => {
    preloadCommon();
    events.forEach(event => {
      document.removeEventListener(event, preloadOnce);
    });
  };
  
  events.forEach(event => {
    document.addEventListener(event, preloadOnce, { once: true, passive: true });
  });
  
  // Also preload after a delay as fallback
  setTimeout(preloadCommon, 3000);
}

// Start preloading strategy
if (typeof window !== 'undefined') {
  preloadFrameworkComponents();
}

export { lazyFrameworkFactory };

export default lazyFrameworkFactory;