/**
 * SGEX Route Configuration
 * 
 * This file defines the DAK components and their route patterns.
 * It is shared between:
 * 1. App.js for React Router route definitions
 * 2. 404.html for SPA routing and component validation
 * 
 * When adding new DAK components:
 * 1. Add the component mapping to dakComponents below: 'route-name': 'ReactComponentName'
 * 2. Import the React component in App.js and add it to componentRegistry
 * 
 * The system will automatically:
 * - Generate all React Router routes (/{component}, /{component}/:user/:repo, etc.)
 * - Update 404.html component validation
 * - Work across all deployment scenarios (local, GitHub Pages, standalone)
 * 
 * This ensures both the React app and GitHub Pages SPA routing
 * recognize the component as valid with minimal maintenance.
 */

// Global configuration object that will be available in both environments
window.SGEX_ROUTES_CONFIG = {
  /**
   * DAK component configurations that define both routing and component mapping.
   * Each entry follows the pattern: /{component}/:user/:repo/:branch?/*?
   * 
   * These correspond to the DAK components defined in the WHO SMART Guidelines
   * and implemented as React components in the SGEX workbench.
   */
  dakComponents: {
    'dashboard': 'DAKDashboardWithFramework',                    
    'testing-viewer': 'TestingViewer',              
    'core-data-dictionary-viewer': 'CoreDataDictionaryViewer', 
    'health-interventions': 'ComponentEditor',        
    'actor-editor': 'ActorEditor',               
    'business-process-selection': 'BusinessProcessSelection',  
    'bpmn-editor': 'BPMNEditor',                
    'bpmn-viewer': 'BPMNViewer',                
    'bpmn-source': 'BPMNSource',                
    'decision-support-logic': 'DecisionSupportLogicView'       
  },

  /**
   * Deployed branches for GitHub Pages routing.
   * Add branch names here when they are deployed to GitHub Pages.
   */
  deployedBranches: [
    'main', 
    'deploy'
  ],

  /**
   * Get list of DAK component names
   * @returns {Array} Array of valid DAK component names
   */
  getDAKComponentNames: function() {
    return Object.keys(this.dakComponents);
  },

  /**
   * Get React component name for a DAK component
   * @param {string} component - DAK component name
   * @returns {string|null} React component name or null if not found
   */
  getReactComponent: function(component) {
    return this.dakComponents[component] || null;
  },

  /**
   * Check if a component name is a valid DAK component
   * @param {string} component - Component name to validate
   * @returns {boolean} True if component is valid
   */
  isValidDAKComponent: function(component) {
    return Object.prototype.hasOwnProperty.call(this.dakComponents, component);
  },

  /**
   * Check if a branch name is a deployed branch
   * @param {string} branch - Branch name to validate  
   * @returns {boolean} True if branch is deployed
   */
  isDeployedBranch: function(branch) {
    return this.deployedBranches.includes(branch);
  }
};