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

class RoutingLogger {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.routeChain = [];
    this.startTime = Date.now();
    this.maxRedirects = 7; // Per user feedback
  }
  
  generateSessionId() {
    return `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Log a route access attempt
   */
  logAccess(url, context = {}) {
    const entry = {
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
   * Returns false if redirect limit exceeded
   */
  logRedirect(from, to, reason, attempt) {
    const redirectCount = this.routeChain.filter(e => e.type === 'redirect').length;
    
    const entry = {
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
   */
  logError(message, context = {}) {
    const entry = {
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
   */
  logComponentLoad(component, context = {}) {
    const entry = {
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
   */
  logSessionStorageUpdate(key, value) {
    const entry = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      type: 'session-storage',
      key: key,
      value: typeof value === 'object' ? JSON.stringify(value) : value
    };
    
    this.routeChain.push(entry);
    console.log('[SGEX ROUTING]', entry);
    this.persistLog();
    
    return entry;
  }
  
  /**
   * Persist log to session storage
   */
  persistLog() {
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
   */
  getLog() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: Date.now() - this.startTime,
      chain: this.routeChain
    };
  }
  
  /**
   * Generate diagnostic report
   */
  generateReport() {
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
   */
  summarizeEvent(event) {
    switch(event.type) {
      case 'redirect':
        return `${event.from} → ${event.to} (${event.reason})`;
      case 'error':
        return event.message;
      case 'component-load':
        return event.component;
      case 'access':
        return event.url;
      case 'session-storage':
        return `${event.key} = ${event.value}`;
      default:
        return JSON.stringify(event);
    }
  }
  
  /**
   * Clear the log
   */
  clearLog() {
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
if (typeof window !== 'undefined') {
  window.SGEX_ROUTING_LOGGER = new RoutingLogger();
  
  // Log initialization
  window.SGEX_ROUTING_LOGGER.logAccess(window.location.href, {
    handler: 'routingLogger.js',
    event: 'initialization'
  });
}

export default RoutingLogger;
