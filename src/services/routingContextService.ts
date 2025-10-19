/**
 * SGEX Routing Context Service
 * 
 * 🔒 MIGRATION CONSENT DOCUMENTED 🔒
 * This file was migrated to TypeScript with explicit written consent from @litlfred
 * on 2025-10-16 in PR comment #3407195807.
 * 
 * Lightweight service that reads structured routing context prepared by 404.html.
 * Replaces the heavy urlProcessorService.js with minimal parsing logic.
 * 
 * Features:
 * - Read structured context from sessionStorage
 * - No URL re-parsing needed (done by 404.html)
 * - Clean URL restoration
 * - Backward compatibility with individual storage items
 * 
 * @module routingContextService
 */

/**
 * Routing context structure
 * @example { "component": "dashboard", "user": "who", "repo": "anc-dak", "branch": "main" }
 */
export interface RoutingContext {
  /** Component name */
  component: string | null;
  /** User/organization name */
  user: string | null;
  /** Repository name */
  repo: string | null;
  /** Branch name */
  branch: string | null;
  /** Asset path */
  asset: string | null;
  /** Deployment branch */
  deploymentBranch: string | null;
  /** Intended branch */
  intendedBranch: string | null;
  /** Context timestamp */
  timestamp: number;
}

/**
 * Parsed DAK URL structure
 * @example { "component": "dashboard", "user": "who", "repo": "anc-dak", "isValid": true }
 */
export interface ParsedDAKUrl {
  /** Component name */
  component: string;
  /** User/organization name */
  user: string;
  /** Repository name */
  repo: string;
  /** Branch name */
  branch?: string;
  /** Asset path segments */
  assetPath?: string[];
  /** Whether URL is valid */
  isValid: boolean;
}

/**
 * Global window extensions
 */
declare global {
  interface Window {
    /** Routing context */
    SGEX_URL_CONTEXT?: RoutingContext;
    /** Route configuration */
    SGEX_ROUTES_CONFIG?: {
      getDAKComponentNames: () => string[];
    };
    /** Store structured context function */
    SGEX_storeStructuredContext?: (routePath: string, branch: string) => RoutingContext;
  }
}

/**
 * SGEX Routing Context class
 * 
 * Manages URL routing context and navigation state.
 * 
 * @openapi
 * components:
 *   schemas:
 *     RoutingContext:
 *       type: object
 *       properties:
 *         component:
 *           type: string
 *         user:
 *           type: string
 *         repo:
 *           type: string
 *         branch:
 *           type: string
 */
class SGEXRoutingContext {
  private initialized: boolean;
  private context: RoutingContext | null;

  constructor() {
    this.initialized = false;
    this.context = null;
  }

  /**
   * Initialize and restore context from sessionStorage
   */
  initialize(): RoutingContext {
    if (this.initialized) return this.context!;
    
    try {
      this.context = this.restoreContext();
      this.cleanURL();
      this.initialized = true;
      
      // Make context globally available
      if (typeof window !== 'undefined') {
        window.SGEX_URL_CONTEXT = this.context;
      }
      
      return this.context;
    } catch (error) {
      console.error('Error initializing SGEX routing context:', error);
      return this.getFallbackContext();
    }
  }

  /**
   * Restore context from sessionStorage
   */
  restoreContext(): RoutingContext {
    if (typeof sessionStorage === 'undefined') {
      return this.getFallbackContext();
    }
    
    // Try to read structured context first
    const structuredContext = sessionStorage.getItem('sgex_url_context');
    if (structuredContext) {
      try {
        const context: RoutingContext = JSON.parse(structuredContext);
        // Validate context is not stale (older than 5 minutes)
        if (context.timestamp && (Date.now() - context.timestamp) < 300000) {
          return context;
        }
      } catch (error) {
        console.warn('Failed to parse structured context, falling back to individual items');
      }
    }
    
    // Fallback to individual storage items for backward compatibility
    return {
      component: sessionStorage.getItem('sgex_current_component'),
      user: sessionStorage.getItem('sgex_selected_user'),
      repo: sessionStorage.getItem('sgex_selected_repo'),
      branch: sessionStorage.getItem('sgex_selected_branch'),
      asset: sessionStorage.getItem('sgex_selected_asset'),
      deploymentBranch: sessionStorage.getItem('sgex_deployment_branch'),
      intendedBranch: sessionStorage.getItem('sgex_intended_branch'),
      timestamp: Date.now()
    };
  }

  /**
   * Get fallback context when sessionStorage is unavailable
   */
  getFallbackContext(): RoutingContext {
    return {
      component: null,
      user: null,
      repo: null,
      branch: null,
      asset: null,
      deploymentBranch: null,
      intendedBranch: null,
      timestamp: Date.now()
    };
  }

  /**
   * Clean the URL by removing routing query parameters
   */
  cleanURL(): void {
    if (typeof window === 'undefined') return;
    
    const location = window.location;
    const urlParams = new URLSearchParams(location.search);
    
    // Check if this is a routed URL from 404.html
    if (urlParams.has('/')) {
      const routePath = urlParams.get('/');
      urlParams.delete('/'); // Remove the routing parameter
      
      const basePath = this.getBasePath();
      let cleanURL = `${location.protocol}//${location.host}${basePath}`;
      
      if (routePath) {
        cleanURL += routePath;
      }
      
      // Preserve other query parameters
      const queryString = urlParams.toString();
      if (queryString) {
        cleanURL += '?' + queryString;
      }
      
      // Preserve hash fragment
      if (location.hash) {
        cleanURL += location.hash;
      }
      
      // Update browser URL to clean route
      if (cleanURL !== location.href) {
        window.history.replaceState(null, '', cleanURL);
      }
    }
  }

  /**
   * Get the base path for the current deployment
   */
  getBasePath(): string {
    if (typeof window === 'undefined') return '/';
    
    const pathname = window.location.pathname;
    
    // Check if we're in a GitHub Pages deployment
    if (window.location.hostname.endsWith('.github.io')) {
      if (pathname.startsWith('/sgex/')) {
        // Check for branch deployment
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length >= 2 && segments[0] === 'sgex') {
          // Could be branch deployment like /sgex/main/ or /sgex/feature-branch/
          return `/sgex/${segments[1]}/`;
        }
        return '/sgex/';
      }
      return '/';
    }
    
    // Local development
    if (pathname.startsWith('/sgex/')) {
      return '/sgex/';
    }
    return '/';
  }

  /**
   * Get current routing context
   */
  getContext(): RoutingContext {
    if (!this.initialized) {
      return this.initialize();
    }
    return this.context!;
  }
}

// Create singleton instance
const routingContext = new SGEXRoutingContext();

/**
 * React hook for accessing routing context
 */
export function useRoutingContext(): RoutingContext {
  return routingContext.getContext();
}

/**
 * Initialize routing context (call early in app lifecycle)
 */
export function initializeRoutingContext(): RoutingContext {
  return routingContext.initialize();
}

/**
 * Get routing context directly (non-hook usage)
 */
export function getRoutingContext(): RoutingContext {
  return routingContext.getContext();
}

/**
 * Store structured routing context in sessionStorage
 * Moved from 404.html to centralize context management
 */
export function storeStructuredContext(routePath: string, branch: string): RoutingContext {
  if (!routePath) {
    return routingContext.getFallbackContext();
  }
  
  const segments = routePath.split('/').filter(Boolean);
  if (segments.length === 0) {
    return routingContext.getFallbackContext();
  }
  
  const context: RoutingContext = {
    component: segments[0],
    user: segments[1] || null,
    repo: segments[2] || null,
    branch: segments[3] || null,
    asset: segments.length > 4 ? segments.slice(4).join('/') : null,
    deploymentBranch: branch,
    intendedBranch: branch,
    timestamp: Date.now()
  };
  
  // Store structured context for React app
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('sgex_url_context', JSON.stringify(context));
    
    // Store individual items for backward compatibility
    sessionStorage.setItem('sgex_current_component', context.component || '');
    if (context.user) sessionStorage.setItem('sgex_selected_user', context.user);
    if (context.repo) sessionStorage.setItem('sgex_selected_repo', context.repo);
    if (context.branch) sessionStorage.setItem('sgex_selected_branch', context.branch);
    if (context.asset) sessionStorage.setItem('sgex_selected_asset', context.asset);
    sessionStorage.setItem('sgex_deployment_branch', context.deploymentBranch || '');
    sessionStorage.setItem('sgex_intended_branch', context.intendedBranch || '');
  }
  
  return context;
}

/**
 * Extract DAK components from route configuration
 */
export function extractDAKComponentsFromRoutes(): string[] {
  // Try to get from global config first
  if (typeof window !== 'undefined' && window.SGEX_ROUTES_CONFIG) {
    return window.SGEX_ROUTES_CONFIG.getDAKComponentNames();
  }
  
  // Fallback for server-side rendering or if config not loaded
  console.warn('SGEX route configuration not available, returning empty array');
  return [];
}

/**
 * Parse a DAK URL to extract components
 */
export function parseDAKUrl(pathname: string): ParsedDAKUrl | null {
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
}

/**
 * Check if a component is a valid DAK component
 */
export function isValidDAKComponent(component: string): boolean {
  const validComponents = extractDAKComponentsFromRoutes();
  return validComponents.includes(component);
}

export default routingContext;

// Make storeStructuredContext globally available for 404.html
if (typeof window !== 'undefined') {
  window.SGEX_storeStructuredContext = storeStructuredContext;
}
