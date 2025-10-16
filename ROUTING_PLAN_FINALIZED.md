# Finalized Routing Implementation Plan

## Executive Summary

Based on user feedback, this document summarizes the finalized approach for fixing SGEX routing issues.

## Key Decisions from User Feedback

### 1. URL Pattern Prioritization
**Decision**: No prioritization - all non-root paths treated as branches optimistically

### 2. Redirect Limit
**Decision**: **7 redirect attempts** before showing error (increased from initial proposal of 2)

### 3. Local Development Approach
**Decision**: **UNIFIED structure** - Use `/sgex` for both local and production
- `localhost:3000/sgex/` - Branch listing page (shows remote GitHub PR previews)
- `localhost:3000/sgex/main/` - Local development environment
- **Benefits**: Eliminates conditional logic, easier maintenance, consistent behavior

### 4. Analytics and Logging
**Decision**: **Comprehensive logging required**
- Log all route access attempts
- Track complete redirect chains with timestamps
- Capture all errors and failures
- Store in session storage and console
- Help diagnose routing and other issues

## Simplified Architecture

### Same Structure Everywhere

```
Production Landing:     https://litlfred.github.io/sgex/
Production Main:        https://litlfred.github.io/sgex/main/
Production Feature:     https://litlfred.github.io/sgex/feature-branch/

Local Landing:          http://localhost:3000/sgex/
Local Development:      http://localhost:3000/sgex/main/
```

### Benefits of Unified Approach

1. **Less Conditional Logic**: No special cases for local vs production
2. **Easier Testing**: Same URLs work in both environments
3. **Consistent Behavior**: Users and developers see same structure
4. **Simplified Maintenance**: One routing logic path instead of multiple
5. **Better Debugging**: Routing logs work identically everywhere

## Implementation Phases

### Phase 1: Create Routing Logger (NEW)
- Implement comprehensive logging service
- Track all routing operations
- Enforce 7-redirect limit
- Store logs in session storage
- Expose via `window.SGEX_ROUTING_LOGGER`

### Phase 2: Update 404.html
- Add logging calls throughout
- Remove component detection logic
- Implement optimistic branch routing
- Preserve hash and query parameters
- Check redirect limit before redirecting

### Phase 3: Update routeConfig.js
- Remove local/production conditionals
- Simplify to single unified logic
- Keep as single source of component truth

### Phase 4: Update routingContextService.js
- Integrate routing logger
- Log session storage updates
- Restore context with logging

### Phase 5: Update useDAKUrlParams Hook
- Add logging for context resolution
- Log when falling back to session storage

### Phase 6: Unify Local Development
- Update package.json: `"start": "PUBLIC_URL=/sgex craco start"`
- Configure branch listing to show remote GitHub previews
- Test unified structure works locally

### Phase 7: Integration Testing
- Test with logging enabled
- Verify 7-redirect limit
- Confirm unified local/production behavior

## Routing Logger API

### Core Methods

```javascript
// Access logging
window.SGEX_ROUTING_LOGGER.logAccess(url, context)

// Redirect logging (returns false if limit exceeded)
window.SGEX_ROUTING_LOGGER.logRedirect(from, to, reason, attempt)

// Error logging
window.SGEX_ROUTING_LOGGER.logError(message, context)

// Component load logging
window.SGEX_ROUTING_LOGGER.logComponentLoad(component, context)

// Session storage logging
window.SGEX_ROUTING_LOGGER.logSessionStorageUpdate(key, value)

// Generate diagnostic report
window.SGEX_ROUTING_LOGGER.generateReport()
```

### Example Log Output

```javascript
{
  sessionId: "route-1697456789-x7k2m9",
  totalDuration: 1234,
  totalEvents: 5,
  redirectCount: 2,
  errorCount: 0,
  componentLoads: 1,
  timeline: [
    {
      type: "access",
      url: "https://litlfred.github.io/sgex/main/dashboard/user/repo",
      timestamp: 1697456789000,
      elapsed: 0
    },
    {
      type: "redirect",
      from: "https://litlfred.github.io/sgex/main/dashboard/user/repo",
      to: "https://litlfred.github.io/sgex/main/?/dashboard/user/repo",
      reason: "optimistic-branch",
      attempt: 1,
      chainLength: 1,
      timestamp: 1697456789050,
      elapsed: 50
    },
    {
      type: "component-load",
      component: "DAKDashboard",
      url: "https://litlfred.github.io/sgex/main/?/dashboard/user/repo",
      timestamp: 1697456790234,
      elapsed: 1234
    }
  ]
}
```

## Testing Enhancements

### Additional Test Scenarios

1. **Redirect Limit Test**:
   - Trigger 7 redirects
   - Expected: Error page shown with routing log
   - Verify: Log shows all 7 attempts

2. **Logging Verification**:
   - Access any URL
   - Check console for [ROUTING] entries
   - Call `window.SGEX_ROUTING_LOGGER.generateReport()`
   - Verify: Complete timeline available

3. **Local Development Test**:
   - Run `npm start`
   - Navigate to `localhost:3000/sgex/`
   - Click "Main" card
   - Verify: Redirects to `localhost:3000/sgex/main/`
   - Check: Routing logs show unified behavior

## Migration Notes

### For Developers

**Updated npm scripts**:
```json
{
  "start": "PUBLIC_URL=/sgex craco start",
  "build": "PUBLIC_URL=/sgex craco build"
}
```

**Updated workflow**:
1. Run `npm start` → opens to `localhost:3000/sgex/`
2. See branch listing with remote GitHub previews
3. Click "Main" → develop at `localhost:3000/sgex/main/`
4. Same structure as production

### For Users

**No changes required** - all existing URLs continue to work:
- Bookmarks remain valid
- Shared links work
- No user action needed

## Key Improvements

### Compared to Original Proposal

| Aspect | Original | Finalized |
|--------|----------|-----------|
| Redirect Limit | 2 attempts | **7 attempts** |
| Local Development | Conditional logic | **Unified `/sgex` structure** |
| Logging | Mentioned | **Comprehensive implementation** |
| Component Detection | In 404.html | **Removed from 404.html** |
| Local Base Path | Special case | **Same as production** |

### Why These Changes Matter

1. **7 Redirects**: Provides more flexibility for complex routing scenarios while still preventing infinite loops
2. **Unified Structure**: Eliminates ~50% of conditional code, easier to maintain
3. **Comprehensive Logging**: Critical for diagnosing issues in production
4. **No Component Detection in 404.html**: Simpler, more reliable, deployment-agnostic

## Next Steps

1. ✅ Finalized plan approved by user
2. ⏳ Awaiting explicit consent to modify prohibited files
3. ⏳ Implementation of Phase 1-7
4. ⏳ Testing and validation
5. ⏳ Deployment

## Files Requiring Explicit Consent

As per prohibition warnings, these files need explicit consent:

1. **public/404.html** - Will be simplified, no component detection
2. **public/routeConfig.js** - Will remove conditional logic
3. **src/services/routingContextService.js** - Will add logging integration

All changes maintain backward compatibility and improve reliability.

---

**Document Status**: Finalized based on user feedback  
**Date**: 2025-10-16  
**Approval**: Awaiting explicit consent for implementation
