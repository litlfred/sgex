# PAT Token Loss Investigation Report

## Issue Summary
Users report that SGeX sometimes loses the PAT token authorization, causing unexpected logouts. The issue may be triggered by page reloads but is not consistently reproducible.

## Investigation Findings

### 1. Token Storage Architecture

#### Current Implementation
- **Primary Storage**: `sessionStorage` (key: `sgex_secure_token`)
- **Legacy Storage**: `sessionStorage` and `localStorage` (key: `github_token`)
- **Storage Service**: `src/services/secureTokenStorage.js` and `.ts`
- **Token Types Supported**: Classic PAT (`ghp_*`), Fine-grained PAT (`github_pat_*`), OAuth (`gho_*`), Legacy (40-char hex)

#### Security Features
- XOR encryption using browser fingerprint
- Token expiration (24 hours)
- Token format validation
- Automatic migration from legacy storage

### 2. Potential Scenarios for Token Loss

#### A. **Page Reload Scenarios** ⚠️ HIGH LIKELIHOOD

**Root Cause**: sessionStorage is cleared when the browser tab is closed or in certain reload scenarios.

**Evidence**:
- Token is stored in `sessionStorage.setItem('sgex_secure_token', ...)` (line 169 in secureTokenStorage.js)
- Found 12 instances of `window.location.reload()` across the codebase
- sessionStorage persists only for the page session (not across tabs or browser restarts)

**Affected Locations**:
```
src/components/framework/ErrorHandler.js: window.location.reload()
src/components/framework/PageLayout.js: window.location.reload()
src/components/BranchDeploymentSelector.js: window.location.reload()
src/components/DecisionSupportLogicView.js: window.location.reload()
src/components/BusinessProcessSelection.js: window.location.reload()
src/components/BPMNSource.js: window.location.reload()
src/components/QuestionnaireEditor.js: window.location.reload()
src/components/Publications.js: window.location.reload()
src/components/DAKDashboard.js: window.location.reload()
src/components/DocumentationViewer.js: window.location.reload()
src/dak/faq/components/FAQAccordion.js: window.location.reload()
src/components/CollaborationModal.js: window.location.href = ...
```

**Impact**: 
- Hard page reloads using `window.location.reload()` preserve sessionStorage within the same tab
- However, browser variations and specific reload scenarios may cause sessionStorage to be cleared
- Opening links in new tabs will NOT have the token (sessionStorage is tab-specific)

#### B. **Browser Fingerprint Mismatch** ⚠️ MEDIUM LIKELIHOOD

**Root Cause**: Browser fingerprint changes between sessions can invalidate stored tokens.

**Evidence** (secureTokenStorage.js, lines 215-220):
```javascript
const currentFingerprint = this.generateBrowserFingerprint();
if (data.fingerprint !== currentFingerprint) {
  this.logger.warn('Browser fingerprint mismatch - possible security issue');
  this.clearToken();
  return null;
}
```

**Fingerprint Components**:
- `navigator.userAgent`
- `navigator.language`
- `window.screen.width + 'x' + window.screen.height`
- `window.screen.colorDepth`
- `new Date().getTimezoneOffset()`
- Canvas fingerprint (`canvas.toDataURL()`)

**Triggering Conditions**:
1. **Window Resize**: Changes screen dimensions
2. **Browser Zoom**: Affects canvas rendering and potentially screen dimensions
3. **Language Change**: Browser language settings change
4. **Display Settings**: Changing color depth or moving between monitors
5. **Browser Updates**: User agent string changes
6. **Timezone Changes**: System timezone changes (e.g., traveling)

#### C. **Token Expiration** ⚠️ MEDIUM LIKELIHOOD

**Root Cause**: Tokens expire after 24 hours.

**Evidence** (secureTokenStorage.js, line 164):
```javascript
expires: Date.now() + (this.expirationHours * 60 * 60 * 1000), // 24 hours
```

**Check on Retrieval** (lines 207-212):
```javascript
if (Date.now() > data.expires) {
  this.logger.warn('Stored token has expired');
  this.clearToken();
  return null;
}
```

**Impact**: Users with long-running sessions (>24 hours) will be logged out when the token expires.

#### D. **Token Validation Failure** ⚠️ LOW-MEDIUM LIKELIHOOD

**Root Cause**: Decrypted token fails format validation.

**Evidence** (secureTokenStorage.js, lines 228-233):
```javascript
const validation = this.validateTokenFormat(decryptedToken);
if (!validation.isValid) {
  this.logger.error('Decrypted token failed validation');
  this.clearToken();
  return null;
}
```

**Triggering Conditions**:
1. Corruption during encryption/decryption process
2. Storage corruption (rare browser bug)
3. XOR cipher key mismatch due to fingerprint issues

#### E. **Authentication Initialization Failures** ⚠️ MEDIUM LIKELIHOOD

**Root Cause**: Multiple initialization paths can fail and clear tokens.

**Evidence** (githubService.js):
```javascript
// Line 76: On authentication failure
secureTokenStorage.clearToken(); 

// Line 133: On initialization failure
secureTokenStorage.clearToken();
```

**Initialization Flow Issues**:
1. **Race Conditions**: Multiple components calling `initializeFromStoredToken()` simultaneously
   - Found in: BranchListing.js, BranchListingPage.js, BranchSelector.js, LandingPage.js, SelectProfilePage.js
2. **Network Errors**: GitHub API failures during token validation
3. **Octokit Loading Failures**: Lazy loading of Octokit library fails

#### F. **Legacy Token Migration Issues** ⚠️ LOW LIKELIHOOD

**Root Cause**: Migration from legacy token storage can fail.

**Evidence** (secureTokenStorage.js, lines 282-313):
```javascript
migrateLegacyToken() {
  // Checks sessionStorage and localStorage for 'github_token'
  // If found, validates and stores in secure storage
  // Clears legacy storage on success
}
```

**Potential Issues**:
1. Invalid legacy token format
2. Migration failure leaves no valid token
3. Partial migration (cleared from legacy but not stored in new format)

#### G. **Manual Logout** ✅ EXPECTED BEHAVIOR

**Root Cause**: User explicitly logs out.

**Evidence** (githubService.js, lines 2522-2541):
```javascript
logout() {
  this.octokit = null;
  this.isAuthenticated = false;
  this.tokenType = null;
  this.permissions = null;
  secureTokenStorage.clearToken();
  // Also clears branch context
}
```

#### H. **Error Handler Failures** ⚠️ LOW LIKELIHOOD

**Root Cause**: Error boundaries may trigger navigation that loses context.

**Evidence** (ErrorHandler.js):
- Provides "Go Home" button: `window.location.href = '/sgex/'`
- Provides "Try Again" with reload: `window.location.reload()`

**Impact**: Navigation to home page without proper state restoration.

### 3. sessionStorage vs localStorage Behavior

#### sessionStorage Characteristics:
- **Lifetime**: Persists only for the page session
- **Scope**: Tab-specific (not shared across tabs)
- **Cleared When**: 
  - Tab/window is closed
  - Browser is fully closed (on some browsers)
  - User clears browsing data
  - Incognito/Private mode ends
- **NOT Cleared**: During page reloads in the same tab

#### Specific Browser Behaviors:

**Chrome/Edge**:
- sessionStorage survives page reloads via `window.location.reload()`
- sessionStorage survives navigation within the same tab
- sessionStorage is lost when opening links in new tabs
- sessionStorage MAY be lost on hard refresh (Ctrl+Shift+R) depending on version

**Firefox**:
- Similar to Chrome but may have different behavior with hard refresh
- sessionStorage can be lost when restoring sessions after browser crash

**Safari**:
- More aggressive with sessionStorage clearing
- May clear on certain types of navigations
- Private browsing has stricter sessionStorage handling

### 4. Authentication Check Patterns

#### Current Patterns Found:

**Pattern 1: Direct Storage Check (WelcomePage.js, line 39)**:
```javascript
const token = sessionStorage.getItem('github_token') || localStorage.getItem('github_token');
```
❌ Problem: Checks legacy storage, not secure storage

**Pattern 2: Service Initialization (BranchListing.js, line 308)**:
```javascript
const success = githubService.initializeFromStoredToken();
```
✅ Correct: Uses secure storage service

**Pattern 3: Periodic Check (WelcomePage.js, lines 55-64)**:
```javascript
const interval = setInterval(checkAuthState, 1000);
```
⚠️ Potential Issue: 1-second polling may miss rapid auth state changes

### 5. Critical Code Paths Analysis

#### Path 1: App Initialization (App.js)
- ❌ **Does NOT initialize authentication**
- Only initializes routing context and theme
- Components must initialize auth themselves

#### Path 2: Component-Level Initialization
- Multiple components call `githubService.initializeFromStoredToken()`
- ⚠️ **Potential Race Condition**: No global coordination
- Each component independently checks auth state

#### Path 3: Authentication State Propagation
- No global authentication context/provider
- Components independently check `githubService.isAuth()`
- ⚠️ **State Sync Issues**: Components may have inconsistent views

### 6. Window/Tab Scenarios

#### Scenario A: User Opens New Tab
1. User authenticates in Tab 1
2. User opens a link in Tab 2
3. **Result**: Tab 2 has NO token (sessionStorage is tab-specific)
4. **User Experience**: Appears logged out in new tab

#### Scenario B: User Refreshes Page
1. User is authenticated
2. User presses F5 or uses browser refresh
3. **Expected**: Token should persist (sessionStorage survives normal reload)
4. **But**: Browser fingerprint changes may invalidate token

#### Scenario C: User Returns After Browser Close
1. User authenticates
2. User closes browser
3. User reopens browser and navigates to SGEX
4. **Result**: Token is lost (sessionStorage cleared)
5. **User Experience**: Must re-authenticate

### 7. Console Logging Evidence

The secureTokenStorage service has extensive logging:
- Token retrieval attempts
- Fingerprint mismatches
- Expiration checks
- Validation failures
- Migration attempts

**Recommendation**: Check browser console logs when token loss occurs to identify the specific cause.

## Summary of Likely Causes (Priority Order)

### 1. **Browser Fingerprint Changes** (Most Likely)
- **Probability**: HIGH
- **Frequency**: Can happen during normal usage
- **Triggers**: Window resize, zoom, display changes, language changes
- **Evidence**: Strict fingerprint validation with immediate token clearing

### 2. **Opening Links in New Tabs** (Very Likely)
- **Probability**: HIGH
- **Frequency**: Common user behavior
- **Triggers**: Ctrl+Click, "Open in New Tab", middle-click
- **Evidence**: sessionStorage is not shared across tabs

### 3. **Token Expiration** (Moderate Likelihood)
- **Probability**: MEDIUM
- **Frequency**: Once per 24 hours
- **Triggers**: Long-running sessions
- **Evidence**: Hard-coded 24-hour expiration

### 4. **Browser-Specific sessionStorage Behavior** (Moderate Likelihood)
- **Probability**: MEDIUM
- **Frequency**: Varies by browser
- **Triggers**: Hard refresh, session restoration, crash recovery
- **Evidence**: Browser differences in sessionStorage handling

### 5. **Authentication Initialization Race Conditions** (Lower Likelihood)
- **Probability**: LOW-MEDIUM
- **Frequency**: Intermittent
- **Triggers**: Fast navigation, concurrent initialization attempts
- **Evidence**: Multiple components independently initialize auth

### 6. **Token Decryption/Validation Failures** (Low Likelihood)
- **Probability**: LOW
- **Frequency**: Rare
- **Triggers**: Storage corruption, encryption issues
- **Evidence**: Strict validation with token clearing on failure

## Recommendations for Further Investigation

### Immediate Actions (DO NOT IMPLEMENT - Investigation Only):

1. **Add Detailed Logging**:
   - Log every token clearing event with stack traces
   - Log browser fingerprint changes with before/after values
   - Log sessionStorage access patterns
   - Add telemetry for token loss events

2. **Reproduce Scenarios**:
   - Test window resizing while authenticated
   - Test opening links in new tabs
   - Test browser zoom changes
   - Test with different browsers
   - Test hard refresh (Ctrl+Shift+R)
   - Test display configuration changes

3. **Monitor Console Logs**:
   - Check for "Browser fingerprint mismatch" warnings
   - Check for "Stored token has expired" messages
   - Check for "Decrypted token failed validation" errors
   - Check for authentication initialization failures

### Potential Solutions (DO NOT IMPLEMENT):

1. **Relax Fingerprint Validation**:
   - Use partial fingerprint matching
   - Exclude volatile components (screen size, canvas)
   - Only clear token on critical mismatches

2. **Consider localStorage for Token Persistence**:
   - Use localStorage instead of sessionStorage for longer persistence
   - Add explicit "Remember Me" option
   - Implement secure cross-tab token sharing

3. **Implement Authentication Context**:
   - Create React Context for global auth state
   - Prevent multiple initialization race conditions
   - Provide consistent auth state across components

4. **Add Token Refresh Mechanism**:
   - Refresh token before expiration
   - Provide user warning before expiration
   - Implement background token validation

5. **Improve New Tab Handling**:
   - Detect new tab scenario
   - Provide clear "Please sign in" message
   - Consider localStorage for cross-tab auth (with security considerations)

6. **Add User Feedback**:
   - Show clear message when token expires
   - Show clear message when fingerprint mismatch occurs
   - Provide "Stay Signed In" option
   - Add session timeout warnings

## Testing Recommendations

### Test Cases to Reproduce Issue:

1. **Fingerprint Change Test**:
   - Authenticate
   - Resize browser window significantly
   - Navigate to a new page
   - Check if still authenticated

2. **New Tab Test**:
   - Authenticate in Tab 1
   - Open SGEX in Tab 2
   - Verify authentication state

3. **Zoom Test**:
   - Authenticate
   - Change browser zoom (Ctrl + / Ctrl -)
   - Navigate to different page
   - Check authentication

4. **Long Session Test**:
   - Authenticate
   - Wait > 24 hours (or temporarily reduce expiration for testing)
   - Try to use authenticated features

5. **Multiple Monitors Test**:
   - Authenticate
   - Move browser window to different monitor
   - Check if still authenticated

6. **Hard Refresh Test**:
   - Authenticate
   - Press Ctrl+Shift+R (hard refresh)
   - Check if still authenticated

## Conclusion

The PAT token disappearance issue likely stems from **multiple interacting factors**, with **browser fingerprint changes** and **sessionStorage limitations** being the most probable root causes. The strict security measures (fingerprint validation) and the use of sessionStorage (which is tab-specific and session-only) create a trade-off between security and user experience.

The issue is **intermittent** because it depends on:
- User behavior (new tabs, window resizing, zoom)
- Browser-specific sessionStorage handling
- Session duration (24-hour expiration)
- Environmental factors (display changes, timezone changes)

To definitively identify the cause in production, **enhanced logging and telemetry** are essential. The existing logger infrastructure in secureTokenStorage provides a good foundation for this investigation.

---

**Investigation Date**: 2025-10-15
**Investigated By**: GitHub Copilot
**Status**: Investigation Complete - Implementation NOT Required per Issue Instructions
