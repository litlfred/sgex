/**
 * Utility functions for extracting route information from React Router routes
 * 
 * 🚨 COPILOT PROHIBITION WARNING 🚨
 * 
 * THIS FILE IS ABSOLUTELY CRITICAL TO URL ROUTING AND COMPONENT RESOLUTION
 * 
 * ⛔ COPILOT AGENTS ARE STRICTLY PROHIBITED FROM MAKING ANY CHANGES TO THIS FILE
 * ⛔ WITHOUT EXPLICIT WRITTEN CONSENT FROM THE REPOSITORY OWNER (@litlfred)
 * 
 * This file contains core routing utilities for DAK component URL parsing,
 * route generation, and component resolution. It's a compatibility layer
 * for the lazy loading system and integrates with the global route configuration.
 * Any unauthorized changes can break application routing and component loading.
 * 
 * 🔒 REQUIRED PROCESS FOR CHANGES:
 * 1. Request explicit consent from @litlfred in a GitHub comment
 * 2. Wait for written approval before making ANY changes
 * 3. Document the explicit consent in the commit message
 * 4. Test extensively in a separate environment before merging
 * 
 * Violation of this prohibition will result in immediate reversion and 
 * potential blocking of copilot access to this repository.
 * 
 * 🚨 END PROHIBITION WARNING 🚨
 * 
 * This is now a compatibility layer for the new lazy loading system
 */
import React from 'react';

/**
 * Global SGEX route configuration interface
 */
interface SGEXRouteConfig {
  getDAKComponentNames(): string[];
  dakComponents: Record<string, any>;
}

/**
 * Global window interface extensions
 */
declare global {
  interface Window {
    getSGEXRouteConfig?: () => SGEXRouteConfig | null;
  }
}

/**
 * DAK URL parsing result interface
 */
export interface DAKUrlInfo {
  component: string;
  user: string;
  repo: string;
  branch?: string;
  assetPath?: string[];
  isValid: boolean;
}

/**
 * React Router route object interface
 */
export interface RouteObject {
  path: string;
  element: React.ReactElement;
  key: string;
}

/**
 * Extract valid DAK component names from the shared route configuration
 * This function reads from the global SGEX route configuration that is shared
 * between App.js and 404.html to ensure consistency.
 * 
 * @returns Array of valid DAK component names
 */
export const extractDAKComponentsFromRoutes = (): string[] => {
  // In browser environment, try to get from global config first
  if (typeof window !== 'undefined' && window.getSGEXRouteConfig) {
    const config = window.getSGEXRouteConfig();
    if (config) {
      return config.getDAKComponentNames();
    }
  }
  
  // Fallback for server-side rendering or if config not loaded
  // This should match the configuration in public/routes-config.json
  console.warn('SGEX route configuration not available, using fallback');
  return [
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
  ];
};

/**
 * Check if a given component name is a valid DAK component
 * @param component - Component name to validate
 * @returns True if component is valid DAK component
 */
export const isValidDAKComponent = (component: string): boolean => {
  const validComponents = extractDAKComponentsFromRoutes();
  return validComponents.includes(component);
};

/**
 * Parse a URL path to extract DAK component information
 * @param pathname - URL pathname to parse
 * @returns Parsed DAK URL info or null if not a valid DAK URL
 */
export const parseDAKUrl = (pathname: string): DAKUrlInfo | null => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Valid DAK component routes have at least 3 segments: [component, user, repo]
  if (pathSegments.length >= 3) {
    const [component, user, repo, branch, ...assetPath] = pathSegments;
    
    if (isValidDAKComponent(component) && user && repo) {
      return {
        component,
        user,
        repo,
        branch,
        assetPath,
        isValid: true
      };
    }
  }
  
  return null;
};

/**
 * Generate React Router Route objects for all DAK components
 * This is now a legacy function kept for compatibility.
 * The new lazy loading system uses generateLazyRoutes() from componentRouteService.js
 * 
 * @param importedComponents - Object containing all imported React components
 * @returns Array of route objects for React Router
 */
export const generateDAKRoutes = (importedComponents: Record<string, React.ComponentType>): RouteObject[] => {
  console.warn('generateDAKRoutes() is deprecated. Use generateLazyRoutes() from componentRouteService.js instead.');
  
  const routes: RouteObject[] = [];
  
  // Get configuration 
  const config = (typeof window !== 'undefined' && window.getSGEXRouteConfig) 
    ? window.getSGEXRouteConfig() 
    : null;
  
  if (!config) {
    console.warn('SGEX route configuration not available for dynamic route generation');
    return routes;
  }
  
  // Generate routes for each DAK component using old system
  const componentNames = config.getDAKComponentNames();
  
  componentNames.forEach(componentName => {
    const dakComponent = config.dakComponents[componentName];
    const reactComponentName = dakComponent.component || dakComponent;
    
    // Smart component lookup - find the imported component by name
    const ReactComponentClass = importedComponents[reactComponentName];
    
    if (!ReactComponentClass) {
      console.warn(`React component ${reactComponentName} not found in imported components for DAK component ${componentName}`);
      console.warn('Available components:', Object.keys(importedComponents));
      return;
    }
    
    // Create React element from the component class
    const ReactElement = React.createElement(ReactComponentClass);
    
    // Generate the standard DAK route patterns
    routes.push(
      {
        path: `/${componentName}`,
        element: ReactElement,
        key: `${componentName}-base`
      },
      {
        path: `/${componentName}/:user/:repo`,
        element: ReactElement,
        key: `${componentName}-user-repo`
      },
      {
        path: `/${componentName}/:user/:repo/:branch`,
        element: ReactElement,
        key: `${componentName}-user-repo-branch`
      },
      {
        path: `/${componentName}/:user/:repo/:branch/*`,
        element: ReactElement,
        key: `${componentName}-user-repo-branch-asset`
      }
    );
  });
  
  return routes;
};