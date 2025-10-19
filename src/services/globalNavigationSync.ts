/**
 * SGEX Global Navigation Synchronization Service
 * 
 * Bidirectional synchronization between URL parameters and session storage.
 * Works for ALL components automatically - no per-component changes needed.
 * 
 * Features:
 * - Listens to all URL changes (via React Router or direct navigation)
 * - Automatically updates session storage when URL changes
 * - Provides API for components to trigger URL updates
 * - Integrates with routing logger for diagnostics
 * - Works with both SPA navigation and hard reloads
 * 
 * Usage:
 *   import { syncNavigationToStorage, syncStorageToNavigation } from './services/globalNavigationSync';
 *   
 *   // URL changed? Storage auto-updates
 *   // Component wants to navigate? Use syncStorageToNavigation(user, repo, branch)
 */

import { NavigateFunction } from 'react-router-dom';

/**
 * Navigation context extracted from URL
 * @example { "deploymentBranch": "main", "component": "dak", "user": "who", "repo": "anc-dak", "branch": "main" }
 */
export interface NavigationContext {
  /** Deployment branch (from URL path) */
  deploymentBranch: string | null;
  /** Component name */
  component: string | null;
  /** GitHub user or organization */
  user: string | null;
  /** Repository name */
  repo: string | null;
  /** DAK branch (optional) */
  branch: string | null;
  /** Asset path (optional) */
  asset: string | null;
  /** Intended branch */
  intendedBranch: string | null;
  /** URL hash */
  hash: string;
  /** URL search parameters */
  search: string;
  /** Context timestamp */
  timestamp: number;
}

/**
 * Callback function for navigation changes
 */
export type NavigationListener = (context: NavigationContext) => void;

/**
 * Navigation parameters for DAK navigation
 * @example { "deploymentBranch": "main", "component": "dak", "user": "who", "repo": "anc-dak", "dakBranch": "main" }
 */
export interface NavigationParams {
  /** Deployment branch */
  deploymentBranch: string;
  /** Component name */
  component: string;
  /** GitHub user or organization */
  user: string;
  /** Repository name */
  repo: string;
  /** DAK branch (optional) */
  dakBranch?: string | null;
  /** Asset path (optional) */
  asset?: string | null;
  /** URL hash (optional) */
  hash?: string;
}

/**
 * Global Navigation Synchronization Service
 * 
 * @openapi
 * /global-navigation-sync:
 *   description: Service for synchronizing URL navigation with session storage
 */
class GlobalNavigationSync {
  private initialized: boolean = false;
  private lastUrl: string | null = null;
  private listeners: NavigationListener[] = [];

  /**
   * Initialize the global navigation synchronization
   * Should be called once in App.js
   * @example
   * initializeGlobalNavigationSync();
   */
  initialize(): void {
    if (this.initialized) return;
    
    console.log('🌐 GlobalNavigationSync: Initializing global navigation synchronization');
    
    // Set up URL change listener
    this.setupUrlChangeListener();
    
    // Initial sync from current URL
    this.syncFromUrl(window.location.pathname + window.location.search + window.location.hash);
    
    this.initialized = true;
    
    // Log initialization
    if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
      window.SGEX_ROUTING_LOGGER.logAccess(window.location.href, {
        handler: 'globalNavigationSync',
        event: 'initialize'
      });
    }
    
    console.log('✅ GlobalNavigationSync: Initialization complete');
  }

  /**
   * Set up listener for URL changes
   * Works with both React Router navigation and browser back/forward
   * @private
   */
  private setupUrlChangeListener(): void {
    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      const newUrl = window.location.pathname + window.location.search + window.location.hash;
      this.syncFromUrl(newUrl);
    });
    
    // Override pushState and replaceState to catch React Router navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    const self = this;
    
    window.history.pushState = function(data: any, unused: string, url?: string | URL | null) {
      const result = originalPushState.call(this, data, unused, url);
      const newUrl = window.location.pathname + window.location.search + window.location.hash;
      self.syncFromUrl(newUrl);
      return result;
    };
    
    window.history.replaceState = function(data: any, unused: string, url?: string | URL | null) {
      const result = originalReplaceState.call(this, data, unused, url);
      const newUrl = window.location.pathname + window.location.search + window.location.hash;
      self.syncFromUrl(newUrl);
      return result;
    };
    
    console.log('🎯 GlobalNavigationSync: URL change listeners installed');
  }

  /**
   * Extract parameters from URL path and sync to session storage
   * URL pattern: /sgex/{deploymentBranch}/{component}/{user}/{repo}/{dakBranch?}/{asset...}
   * @param url - URL to sync from
   * @example
   * syncFromUrl('/sgex/main/dak/who/anc-dak/main/process.bpmn');
   */
  private syncFromUrl(url: string): void {
    // Skip if URL hasn't changed
    if (url === this.lastUrl) return;
    
    console.log('🔄 GlobalNavigationSync: URL changed, syncing to storage:', url);
    this.lastUrl = url;
    
    try {
      // Parse URL
      const urlObj = new URL(url, window.location.origin);
      const pathname = urlObj.pathname;
      const hash = urlObj.hash;
      const search = urlObj.search;
      
      // Extract path segments (remove /sgex prefix if present)
      let segments = pathname.split('/').filter(Boolean);
      
      // Remove 'sgex' if it's the first segment
      if (segments[0] === 'sgex') {
        segments = segments.slice(1);
      }
      
      // Skip if this is root or a static file
      if (segments.length === 0 || 
          pathname.endsWith('index.html') || 
          pathname.endsWith('404.html') ||
          pathname.endsWith('.js') ||
          pathname.endsWith('.css') ||
          pathname.endsWith('.json')) {
        console.log('⏭️  GlobalNavigationSync: Skipping static file or root:', pathname);
        return;
      }
      
      // Extract context from URL structure
      // Pattern: [{deploymentBranch}, {component}, {user}, {repo}, {dakBranch?}, ...{asset}]
      const context: NavigationContext = {
        deploymentBranch: segments[0] || null,
        component: segments[1] || null,
        user: segments[2] || null,
        repo: segments[3] || null,
        branch: segments[4] || null, // DAK branch (optional)
        asset: segments.length > 5 ? segments.slice(5).join('/') : null,
        intendedBranch: segments[0] || null,
        hash: hash,
        search: search,
        timestamp: Date.now()
      };
      
      console.log('📦 GlobalNavigationSync: Extracted context:', context);
      
      // Update session storage
      this.updateSessionStorage(context);
      
      // Notify listeners
      this.notifyListeners(context);
      
      // Log to routing logger
      if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
        window.SGEX_ROUTING_LOGGER.logAccess(url, {
          handler: 'globalNavigationSync',
          event: 'url_changed',
          context: context
        });
      }
    } catch (error) {
      console.error('❌ GlobalNavigationSync: Error syncing from URL:', error);
      if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
        window.SGEX_ROUTING_LOGGER.logError('Failed to sync from URL', {
          url: url,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    }
  }

  /**
   * Update session storage with context
   * @param context - Navigation context to store
   * @private
   */
  private updateSessionStorage(context: NavigationContext): void {
    if (typeof sessionStorage === 'undefined') {
      console.warn('⚠️  GlobalNavigationSync: sessionStorage not available');
      return;
    }
    
    try {
      // Store structured context
      sessionStorage.setItem('sgex_url_context', JSON.stringify(context));
      
      // Store individual items for backward compatibility
      if (context.user) {
        sessionStorage.setItem('sgex_selected_user', context.user);
        if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
          window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate('sgex_selected_user', context.user);
        }
      }
      
      if (context.repo) {
        sessionStorage.setItem('sgex_selected_repo', context.repo);
        if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
          window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate('sgex_selected_repo', context.repo);
        }
      }
      
      if (context.branch) {
        sessionStorage.setItem('sgex_selected_branch', context.branch);
        if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
          window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate('sgex_selected_branch', context.branch);
        }
      }
      
      if (context.component) {
        sessionStorage.setItem('sgex_current_component', context.component);
        if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
          window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate('sgex_current_component', context.component);
        }
      }
      
      if (context.asset) {
        sessionStorage.setItem('sgex_selected_asset', context.asset);
        if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
          window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate('sgex_selected_asset', context.asset);
        }
      }
      
      if (context.deploymentBranch) {
        sessionStorage.setItem('sgex_deployment_branch', context.deploymentBranch);
        if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
          window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate('sgex_deployment_branch', context.deploymentBranch);
        }
      }
      
      if (context.intendedBranch) {
        sessionStorage.setItem('sgex_intended_branch', context.intendedBranch);
        if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
          window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate('sgex_intended_branch', context.intendedBranch);
        }
      }
      
      console.log('✅ GlobalNavigationSync: Session storage updated');
    } catch (error) {
      console.error('❌ GlobalNavigationSync: Failed to update session storage:', error);
    }
  }

  /**
   * Add a listener for navigation changes
   * Useful for components that need to react to navigation
   * @param callback - Callback function to invoke on navigation change
   * @returns Cleanup function to remove listener
   * @example
   * const removeListener = addNavigationListener((context) => {
   *   console.log('Navigation changed:', context);
   * });
   * // Later: removeListener();
   */
  addListener(callback: NavigationListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of context change
   * @param context - Navigation context
   * @private
   */
  private notifyListeners(context: NavigationContext): void {
    this.listeners.forEach(callback => {
      try {
        callback(context);
      } catch (error) {
        console.error('Error in navigation listener:', error);
      }
    });
  }

  /**
   * Get current context from session storage
   * @returns Current navigation context
   * @example
   * const context = getCurrentNavigationContext();
   * // Returns: { component: 'dak', user: 'who', repo: 'anc-dak', ... }
   */
  getCurrentContext(): Partial<NavigationContext> {
    if (typeof sessionStorage === 'undefined') {
      return {};
    }
    
    try {
      const structured = sessionStorage.getItem('sgex_url_context');
      if (structured) {
        return JSON.parse(structured);
      }
    } catch (error) {
      console.warn('Failed to parse structured context');
    }
    
    // Fallback to individual items
    return {
      component: sessionStorage.getItem('sgex_current_component') || undefined,
      user: sessionStorage.getItem('sgex_selected_user') || undefined,
      repo: sessionStorage.getItem('sgex_selected_repo') || undefined,
      branch: sessionStorage.getItem('sgex_selected_branch') || undefined,
      asset: sessionStorage.getItem('sgex_selected_asset') || undefined,
      deploymentBranch: sessionStorage.getItem('sgex_deployment_branch') || undefined,
      intendedBranch: sessionStorage.getItem('sgex_intended_branch') || undefined
    } as Partial<NavigationContext>;
  }
}

// Create singleton instance
const globalNavigationSync = new GlobalNavigationSync();

/**
 * Initialize the global navigation synchronization
 * @example
 * initializeGlobalNavigationSync();
 */
export const initializeGlobalNavigationSync = (): void => {
  globalNavigationSync.initialize();
};

/**
 * Add a listener for navigation changes
 * @param callback - Callback function to invoke on navigation change
 * @returns Cleanup function to remove listener
 * @example
 * const removeListener = addNavigationListener((context) => {
 *   console.log('Navigation changed:', context);
 * });
 */
export const addNavigationListener = (callback: NavigationListener): (() => void) => {
  return globalNavigationSync.addListener(callback);
};

/**
 * Get current navigation context from session storage
 * @returns Current navigation context
 * @example
 * const context = getCurrentNavigationContext();
 * // Returns: { component: 'dak', user: 'who', repo: 'anc-dak', ... }
 */
export const getCurrentNavigationContext = (): Partial<NavigationContext> => {
  return globalNavigationSync.getCurrentContext();
};

/**
 * Navigate to a DAK page with proper URL structure
 * @param navigate - React Router navigate function
 * @param deploymentBranch - Deployment branch name
 * @param component - Component name
 * @param user - GitHub user or organization
 * @param repo - Repository name
 * @param dakBranch - DAK branch name (optional)
 * @param asset - Asset path (optional)
 * @param hash - URL hash (optional)
 * @example
 * navigateToDAK(navigate, 'main', 'dak', 'who', 'anc-dak', 'main', 'process.bpmn');
 * // Navigates to: /sgex/main/dak/who/anc-dak/main/process.bpmn
 */
export const navigateToDAK = (
  navigate: NavigateFunction,
  deploymentBranch: string,
  component: string,
  user: string,
  repo: string,
  dakBranch: string | null = null,
  asset: string | null = null,
  hash: string = ''
): void => {
  let path = `/sgex/${deploymentBranch}/${component}/${user}/${repo}`;
  
  if (dakBranch) {
    path += `/${dakBranch}`;
  }
  
  if (asset) {
    path += `/${asset}`;
  }
  
  if (hash && !hash.startsWith('#')) {
    hash = '#' + hash;
  }
  
  const fullPath = path + hash;
  
  console.log('🚀 GlobalNavigationSync: Navigating to:', fullPath);
  
  // Log navigation
  if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
    window.SGEX_ROUTING_LOGGER.logAccess(fullPath, {
      handler: 'globalNavigationSync',
      event: 'navigate_to_dak',
      params: { deploymentBranch, component, user, repo, dakBranch, asset, hash }
    });
  }
  
  // Navigate using React Router
  // The navigation will trigger our URL change listener, which will update session storage
  navigate(fullPath);
};

// Make globally available for debugging
declare global {
  interface Window {
    SGEX_GLOBAL_NAV_SYNC: {
      getCurrentContext: typeof getCurrentNavigationContext;
      addListener: typeof addNavigationListener;
    };
  }
}

if (typeof window !== 'undefined') {
  window.SGEX_GLOBAL_NAV_SYNC = {
    getCurrentContext: getCurrentNavigationContext,
    addListener: addNavigationListener
  };
}

export default globalNavigationSync;
