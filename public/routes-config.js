/**
 * SGEX Route Configuration
 * 
 * This file defines the DAK components and their route patterns.
 * It is shared between:
 * 1. App.js for React Router route definitions
 * 2. 404.html for SPA routing and component validation
 * 
 * When adding new DAK components:
 * 1. Add the component to the dakComponents array below
 * 2. Add the corresponding routes to App.js following the patterns:
 *    - /{component}/:user/:repo
 *    - /{component}/:user/:repo/:branch  
 *    - /{component}/:user/:repo/:branch/*
 * 
 * This ensures both the React app and GitHub Pages SPA routing
 * recognize the component as valid.
 */

// Global configuration object that will be available in both environments
window.SGEX_ROUTES_CONFIG = {
  /**
   * List of valid DAK component names that follow the pattern:
   * /{component}/:user/:repo/:branch?/*?
   * 
   * These correspond to the DAK components defined in the WHO SMART Guidelines
   * and implemented as React components in the SGEX workbench.
   */
  dakComponents: [
    'dashboard',                    
    'testing-viewer',              
    'core-data-dictionary-viewer', 
    'health-interventions',        
    'actor-editor',               
    'business-process-selection',  
    'bpmn-editor',                
    'bpmn-viewer',                
    'bpmn-source',                
    'decision-support-logic'       
  ],

  /**
   * Deployed branches for GitHub Pages routing.
   * Add branch names here when they are deployed to GitHub Pages.
   */
  deployedBranches: [
    'main', 
    'deploy'
  ],

  /**
   * Check if a component name is a valid DAK component
   * @param {string} component - Component name to validate
   * @returns {boolean} True if component is valid
   */
  isValidDAKComponent: function(component) {
    return this.dakComponents.includes(component);
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