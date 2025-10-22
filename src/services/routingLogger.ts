/**
 * SGEX Routing Logger
 * 
 * Comprehensive logging service for tracking all routing operations.
 * Helps diagnose routing issues by maintaining a complete timeline of:
 * - Route access attempts
 * - Redirect chains
 * - Errors and failures
 * - Component loads
 * - Session storage updates
 * 
 * Usage:
 *   window.SGEX_ROUTING_LOGGER.logAccess(url, context)
 *   window.SGEX_ROUTING_LOGGER.logRedirect(from, to, reason, attempt)
 *   window.SGEX_ROUTING_LOGGER.generateReport()
 */

/**
 * Type of routing event
 * @example "access"
 */
export type RouteEventType = 'access' | 'redirect' | 'error' | 'component-load' | 'session-storage';

/**
 * Context information for route access
 * @example { "handler": "globalNavigationSync", "event": "navigate_to_dak" }
 */
export interface RouteAccessContext {
  /** Handler that triggered the access */
  handler?: string;
  /** Event type */
  event?: string;
  /** Additional context data */
  [key: string]: any;
}

/**
 * Route event log entry
 * @example { "sessionId": "route-123", "timestamp": 1234567890, "type": "access", "url": "/sgex/main/dak/who/anc-dak" }
 */
export interface RouteEvent {
  /** Session identifier */
  sessionId: string;
  /** Timestamp in milliseconds */
  timestamp: number;
  /** Elapsed time since start */
  elapsed: number;
  /** Type of event */
  type: RouteEventType;
  /** Event-specific data */
  [key: string]: any;
}

/**
 * Redirect event details
 * @example { "from": "/old", "to": "/new", "reason": "missing-context", "attempt": 1 }
 */
export interface RedirectEvent extends RouteEvent {
  type: 'redirect';
  /** Source URL */
  from: string;
  /** Target URL */
  to: string;
  /** Redirect reason */
  reason: string;
  /** Attempt number */
  attempt: number;
  /** Redirect chain length */
  chainLength: number;
}

/**
 * Error event details
 * @example { "message": "Redirect limit exceeded", "url": "/current" }
 */
export interface ErrorEvent extends RouteEvent {
  type: 'error';
  /** Error message */
  message: string;
  /** Current URL */
  url: string;
  /** Full chain of events */
  chain?: RouteEvent[];
}

/**
 * Component load event details
 * @example { "component": "DAKDashboard", "url": "/sgex/main/dak/who/anc-dak" }
 */
export interface ComponentLoadEvent extends RouteEvent {
  type: 'component-load';
  /** Component name */
  component: string;
  /** Current URL */
  url: string;
}

/**
 * Session storage update event
 * @example { "key": "sgex_selected_user", "value": "who" }
 */
export interface SessionStorageEvent extends RouteEvent {
  type: 'session-storage';
  /** Storage key */
  key: string;
  /** Storage value */
  value: string;
}

/**
 * Routing log data
 * @example { "sessionId": "route-123", "startTime": 1234567890, "chain": [] }
 */
export interface RoutingLog {
  /** Session identifier */
  sessionId: string;
  /** Start timestamp */
  startTime: number;
  /** Event chain */
  chain: RouteEvent[];
}

/**
 * Diagnostic report structure
 * @example { "sessionId": "route-123", "totalDuration": 1000, "redirectCount": 2 }
 */
export interface DiagnosticReport {
  /** Session identifier */
  sessionId: string;
  /** Total duration in milliseconds */
  totalDuration: number;
  /** Total number of events */
  totalEvents: number;
  /** Number of redirects */
  redirectCount: number;
  /** Number of errors */
  errorCount: number;
  /** Number of component loads */
  componentLoads: number;
  /** Number of session storage updates */
  sessionStorageUpdates: number;
  /** Timeline summary */
  timeline: Array<{
    time: number;
    type: string;
    summary: string;
  }>;
  /** Full event chain */
  fullChain: RouteEvent[];
}

/**
 * Routing Logger Service
 * 
 * @openapi
 * /routing-logger:
 *   description: Service for logging and tracking routing operations
 */
class RoutingLogger {
  private sessionId: string;
  private routeChain: RouteEvent[];
  private startTime: number;
  private readonly maxRedirects: number = 7;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.routeChain = [];
    this.startTime = Date.now();
  }
  
  /**
   * Generate unique session identifier
   * @returns Session ID string
   * @example "route-1234567890-abc123def"
   */
  private generateSessionId(): string {
    return `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Log a route access attempt
   * @param url - URL being accessed
   * @param context - Additional context information
   * @returns Created log entry
   * @example
   * window.SGEX_ROUTING_LOGGER.logAccess('/sgex/main/dak/who/anc-dak', { handler: 'globalNavigationSync' });
   */
  logAccess(url: string, context: RouteAccessContext = {}): RouteEvent {
    const entry: RouteEvent = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      type: 'access',
      url: url,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      referrer: document.referrer || 'direct',
      ...context
    };
    
    this.routeChain.push(entry);
    console.log('[SGEX ROUTING]', entry);
    this.persistLog();
    
    return entry;
  }
  
  /**
   * Log a redirect attempt
   * @param from - Source URL
   * @param to - Target URL
   * @param reason - Redirect reason
   * @param attempt - Attempt number
   * @returns false if redirect limit exceeded, true otherwise
   * @example
   * const allowed = window.SGEX_ROUTING_LOGGER.logRedirect('/old', '/new', 'missing-context', 1);
   * // Returns: true (or false if limit exceeded)
   */
  logRedirect(from: string, to: string, reason: string, attempt: number): boolean {
    const redirectCount = this.routeChain.filter(e => e.type === 'redirect').length;
    
    const entry: RedirectEvent = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      type: 'redirect',
      from: from,
      to: to,
      reason: reason,
      attempt: attempt,
      chainLength: redirectCount + 1
    };
    
    this.routeChain.push(entry);
    console.log('[SGEX ROUTING]', entry);
    this.persistLog();
    
    // Check redirect limit
    if (entry.chainLength >= this.maxRedirects) {
      this.logError('Redirect limit exceeded', {
        maxRedirects: this.maxRedirects,
        chain: this.routeChain.filter(e => e.type === 'redirect'),
        finalUrl: to
      });
      return false; // Prevent redirect
    }
    
    return true; // Allow redirect
  }
  
  /**
   * Log an error
   * @param message - Error message
   * @param context - Additional context information
   * @returns Created error entry
   * @example
   * window.SGEX_ROUTING_LOGGER.logError('Failed to load component', { component: 'DAKDashboard' });
   */
  logError(message: string, context: Record<string, any> = {}): ErrorEvent {
    const entry: ErrorEvent = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      type: 'error',
      message: message,
      url: window.location.href,
      chain: this.routeChain,
      ...context
    };
    
    this.routeChain.push(entry);
    console.error('[SGEX ROUTING ERROR]', entry);
    this.persistLog();
    
    return entry;
  }
  
  /**
   * Log a component load
   * @param component - Component name
   * @param context - Additional context information
   * @returns Created load entry
   * @example
   * window.SGEX_ROUTING_LOGGER.logComponentLoad('DAKDashboard', { user: 'who', repo: 'anc-dak' });
   */
  logComponentLoad(component: string, context: Record<string, any> = {}): ComponentLoadEvent {
    const entry: ComponentLoadEvent = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      type: 'component-load',
      component: component,
      url: window.location.href,
      ...context
    };
    
    this.routeChain.push(entry);
    console.log('[SGEX ROUTING]', entry);
    this.persistLog();
    
    return entry;
  }
  
  /**
   * Log a session storage update
   * @param key - Storage key
   * @param value - Storage value
   * @returns Created storage entry
   * @example
   * window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate('sgex_selected_user', 'who');
   */
  logSessionStorageUpdate(key: string, value: any): SessionStorageEvent {
    const entry: SessionStorageEvent = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      type: 'session-storage',
      key: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    };
    
    this.routeChain.push(entry);
    console.log('[SGEX ROUTING]', entry);
    this.persistLog();
    
    return entry;
  }
  
  /**
   * Persist log to session storage
   * @private
   */
  private persistLog(): void {
    try {
      sessionStorage.setItem('sgex_routing_log', JSON.stringify({
        sessionId: this.sessionId,
        startTime: this.startTime,
        chain: this.routeChain
      }));
    } catch (e) {
      console.warn('Failed to persist routing log:', e);
    }
  }
  
  /**
   * Get current log
   * @returns Current routing log with duration
   * @example
   * const log = window.SGEX_ROUTING_LOGGER.getLog();
   * // Returns: { sessionId: "route-123", startTime: 1234567890, duration: 1000, chain: [...] }
   */
  getLog(): RoutingLog & { duration: number } {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: Date.now() - this.startTime,
      chain: this.routeChain
    };
  }
  
  /**
   * Generate diagnostic report
   * @returns Diagnostic report with statistics and timeline
   * @example
   * const report = window.SGEX_ROUTING_LOGGER.generateReport();
   * // Returns: { sessionId: "route-123", totalDuration: 1000, redirectCount: 2, ... }
   */
  generateReport(): DiagnosticReport {
    const log = this.getLog();
    
    return {
      sessionId: log.sessionId,
      totalDuration: log.duration,
      totalEvents: log.chain.length,
      redirectCount: log.chain.filter(e => e.type === 'redirect').length,
      errorCount: log.chain.filter(e => e.type === 'error').length,
      componentLoads: log.chain.filter(e => e.type === 'component-load').length,
      sessionStorageUpdates: log.chain.filter(e => e.type === 'session-storage').length,
      timeline: log.chain.map(e => ({
        time: e.elapsed,
        type: e.type,
        summary: this.summarizeEvent(e)
      })),
      fullChain: log.chain
    };
  }
  
  /**
   * Summarize an event for reporting
   * @param event - Event to summarize
   * @returns Human-readable summary string
   * @private
   */
  private summarizeEvent(event: RouteEvent): string {
    switch(event.type) {
      case 'redirect': {
        const redirectEvent = event as RedirectEvent;
        return `${redirectEvent.from} → ${redirectEvent.to} (${redirectEvent.reason})`;
      }
      case 'error': {
        const errorEvent = event as ErrorEvent;
        return errorEvent.message;
      }
      case 'component-load': {
        const loadEvent = event as ComponentLoadEvent;
        return loadEvent.component;
      }
      case 'access':
        return (event as any).url || '';
      case 'session-storage': {
        const storageEvent = event as SessionStorageEvent;
        return `${storageEvent.key} = ${storageEvent.value}`;
      }
      default:
        return JSON.stringify(event);
    }
  }
  
  /**
   * Clear the log
   * @example
   * window.SGEX_ROUTING_LOGGER.clearLog();
   */
  clearLog(): void {
    this.routeChain = [];
    this.startTime = Date.now();
    try {
      sessionStorage.removeItem('sgex_routing_log');
    } catch (e) {
      console.warn('Failed to clear routing log:', e);
    }
  }
}

// Create and export global instance
// Note: Window interface is already declared in routingContextService.ts
if (typeof window !== 'undefined') {
  // Cast to any to avoid type conflicts with the minimal interface in routingContextService.ts
  (window as any).SGEX_ROUTING_LOGGER = new RoutingLogger();
  
  // Log initialization
  if (window.SGEX_ROUTING_LOGGER) {
    window.SGEX_ROUTING_LOGGER.logAccess(window.location.href, {
      handler: 'routingLogger.ts',
      event: 'initialization'
    });
  }
}

export default RoutingLogger;
