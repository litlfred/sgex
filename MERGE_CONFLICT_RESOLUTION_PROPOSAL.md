# Merge Conflict Resolution Proposal for routingContextService

## Summary

The `main` branch has added logging instrumentation to `src/services/routingContextService.js` that needs to be merged into our TypeScript version (`src/services/routingContextService.ts`).

## Upstream Changes in main Branch

The main branch added **SGEX_ROUTING_LOGGER** integration at three key points:

### 1. **Initialization Logging** (lines 32-36 in main)
```javascript
if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
  window.SGEX_ROUTING_LOGGER.logAccess(window.location.href, {
    handler: 'routingContextService',
    event: 'initialize'
  });
}
```

### 2. **Error Logging** (lines 49-53 in main)
```javascript
if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
  window.SGEX_ROUTING_LOGGER.logError('Failed to initialize routing context', {
    error: error.message,
    stack: error.stack
  });
}
```

### 3. **Session Storage Update Logging** (lines 235-237 in main)
```javascript
if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
  window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate('sgex_url_context', context);
}
```

## Recommended Resolution: Merge Logging into TypeScript Version

### Option 1: Full Merge with TypeScript Types (RECOMMENDED)

Add the logging functionality to the TypeScript version with proper type definitions:

**Step 1:** Add SGEX_ROUTING_LOGGER type definition to the global Window interface:

```typescript
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
    /** Routing logger for instrumentation */
    SGEX_ROUTING_LOGGER?: {
      logAccess: (url: string, metadata: Record<string, any>) => void;
      logError: (message: string, metadata: Record<string, any>) => void;
      logSessionStorageUpdate: (key: string, value: any) => void;
    };
  }
}
```

**Step 2:** Add logging calls in `initialize()` method (after line 115):

```typescript
initialize(): RoutingContext {
  if (this.initialized) return this.context!;
  
  try {
    // Log initialization
    if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
      window.SGEX_ROUTING_LOGGER.logAccess(window.location.href, {
        handler: 'routingContextService',
        event: 'initialize'
      });
    }
    
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
    
    // Log initialization error
    if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
      window.SGEX_ROUTING_LOGGER.logError('Failed to initialize routing context', {
        error: (error as Error).message,
        stack: (error as Error).stack
      });
    }
    
    return this.getFallbackContext();
  }
}
```

**Step 3:** Add logging in `storeContext()` method (after line 238):

```typescript
storeContext(context: RoutingContext): void {
  if (typeof sessionStorage === 'undefined') return;
  
  // Store structured context
  sessionStorage.setItem('sgex_url_context', JSON.stringify(context));
  
  // Log session storage update
  if (typeof window !== 'undefined' && window.SGEX_ROUTING_LOGGER) {
    window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate('sgex_url_context', context);
  }
  
  // Store individual items for backward compatibility
  // ... rest of method
}
```

### Option 2: Keep TypeScript Version As-Is (NOT RECOMMENDED)

Keep the cleaner TypeScript version without logging and document that logging is intentionally excluded for now.

**Pros:**
- TypeScript version stays cleaner
- Can add logging later if needed

**Cons:**
- Loses upstream functional changes
- May cause debugging/monitoring issues
- Creates maintenance divergence

## Impact Analysis

### Functional Impact
- **HIGH**: Logging is important for debugging routing issues in production
- The SGEX_ROUTING_LOGGER appears to be part of a broader instrumentation system
- Missing logs will make it harder to debug routing problems

### Migration Impact
- **LOW**: Changes are additive, no breaking changes
- TypeScript provides better type safety for the logger interface
- Easy to implement and test

### Testing Requirements
1. Verify logging calls are made when SGEX_ROUTING_LOGGER is available
2. Verify no errors when SGEX_ROUTING_LOGGER is undefined
3. Confirm all existing functionality still works
4. Test error scenarios trigger error logging

## Recommendation

**Implement Option 1 (Full Merge with TypeScript Types)**

### Rationale:
1. Preserves all upstream functional improvements
2. Adds proper TypeScript type safety to the logging interface  
3. Maintains compatibility with instrumentation system
4. Minimal code changes required
5. Better debugging/monitoring capabilities

### Implementation Steps:
1. Add SGEX_ROUTING_LOGGER type to Window interface
2. Add logging call in initialize() method (success path)
3. Add logging call in initialize() error handler
4. Add logging call in storeContext() method
5. Test all paths
6. Commit changes with clear message

### Commit Message Template:
```
Merge upstream logging instrumentation into TypeScript routingContextService

- Add SGEX_ROUTING_LOGGER type definitions to Window interface
- Add logAccess call on initialization
- Add logError call on initialization failure  
- Add logSessionStorageUpdate call in storeContext
- Maintain backward compatibility with optional logger

Resolves merge conflict from main branch changes to routingContextService.js
```

## Next Steps

After resolution:
1. Update TypeScript file with logging additions
2. Test the changes
3. Commit with clear message referencing this proposal
4. Remove obsolete JavaScript file if not already removed
5. Continue with Phase 7 migration of remaining services
