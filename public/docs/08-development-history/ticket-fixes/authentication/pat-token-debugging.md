# PAT Token Loss Debugging Guide

## Quick Debugging Steps

When a user reports token loss, ask them to follow these steps:

### 1. Open Browser Console (F12)
Press F12 to open Developer Tools and check the Console tab for messages from SecureTokenStorage.

### 2. Look for Key Messages

#### Token Expiration:
```
[SecureTokenStorage] Stored token has expired
```
**Cause**: Token is older than 24 hours
**Solution**: User needs to re-authenticate

#### Fingerprint Mismatch:
```
[SecureTokenStorage] Browser fingerprint mismatch - possible security issue
```
**Cause**: Browser fingerprint changed since last authentication
**Common Triggers**:
- Window resizing
- Browser zoom changes
- Moving to different monitor
- Language setting changes
- Timezone changes

#### Token Not Found:
```
[SecureTokenStorage] No secure token found in storage
```
**Cause**: sessionStorage was cleared
**Common Triggers**:
- Opening link in new tab
- Browser closed and reopened
- Private/Incognito mode ended
- Browser crash recovery

#### Validation Failed:
```
[SecureTokenStorage] Decrypted token failed validation
```
**Cause**: Token corruption or decryption failure
**Rare**: Usually indicates storage corruption

### 3. Check sessionStorage

In the Console, run:
```javascript
// Check if secure token exists
sessionStorage.getItem('sgex_secure_token');

// Check legacy token
sessionStorage.getItem('github_token');
localStorage.getItem('github_token');

// View all sessionStorage keys
Object.keys(sessionStorage).filter(k => k.includes('token') || k.includes('sgex'));
```

### 4. Check Browser Fingerprint

Run this in Console to see current fingerprint:
```javascript
// Create a test instance to check fingerprint
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.textBaseline = 'top';
ctx.font = '14px Arial';
ctx.fillText('Browser fingerprint', 2, 2);

const fingerprint = [
  navigator.userAgent,
  navigator.language,
  window.screen.width + 'x' + window.screen.height,
  window.screen.colorDepth,
  new Date().getTimezoneOffset(),
  canvas.toDataURL()
].join('|');

console.log('Screen:', window.screen.width + 'x' + window.screen.height);
console.log('Color Depth:', window.screen.colorDepth);
console.log('Language:', navigator.language);
console.log('Timezone Offset:', new Date().getTimezoneOffset());
console.log('User Agent:', navigator.userAgent.substring(0, 100) + '...');
```

## Common Scenarios and Their Signatures

### Scenario 1: New Tab Opening

**User Action**: Opens SGEX link in new tab (Ctrl+Click, middle-click, or "Open in New Tab")

**Console Output**:
```
[SecureTokenStorage] Attempting to retrieve secure token
[SecureTokenStorage] No secure token found in storage
```

**Why**: sessionStorage is NOT shared across tabs

**Workaround**: User must authenticate in each new tab, or use same tab for navigation

---

### Scenario 2: Window Resize

**User Action**: Resizes browser window while using SGEX

**Console Output**:
```
[SecureTokenStorage] Attempting to retrieve secure token
[SecureTokenStorage] Browser fingerprint mismatch - possible security issue
[SecureTokenStorage] Token cleared from storage
```

**Why**: Screen dimensions are part of browser fingerprint

**Trigger Detection**:
```javascript
// Before resize
Screen: 1920x1080

// After resize
Screen: 1280x720
```

**Workaround**: Avoid resizing browser window while authenticated

---

### Scenario 3: Browser Zoom

**User Action**: Changes browser zoom level (Ctrl +/-)

**Console Output**:
```
[SecureTokenStorage] Attempting to retrieve secure token
[SecureTokenStorage] Browser fingerprint mismatch - possible security issue
```

**Why**: Zoom can affect canvas rendering fingerprint

**Trigger Detection**: Canvas rendering changes with zoom level

**Workaround**: Maintain consistent zoom level

---

### Scenario 4: Multiple Monitors

**User Action**: Moves browser window between monitors with different resolutions/color depths

**Console Output**:
```
[SecureTokenStorage] Attempting to retrieve secure token
[SecureTokenStorage] Browser fingerprint mismatch - possible security issue
```

**Why**: Different monitor = different screen dimensions/color depth

**Trigger Detection**:
```javascript
// Monitor 1
Screen: 1920x1080, Color Depth: 24

// Monitor 2
Screen: 2560x1440, Color Depth: 32
```

**Workaround**: Use SGEX on single monitor

---

### Scenario 5: Hard Refresh

**User Action**: Presses Ctrl+Shift+R or uses browser's hard refresh

**Console Output**:
Varies by browser - may or may not clear sessionStorage

**Why**: Some browsers clear sessionStorage on hard refresh

**Browser Differences**:
- **Chrome**: Usually preserves sessionStorage
- **Firefox**: May clear sessionStorage
- **Safari**: More aggressive clearing

**Workaround**: Use normal refresh (F5) instead of hard refresh

---

### Scenario 6: Token Expiration

**User Action**: Keeps SGEX open for more than 24 hours

**Console Output**:
```
[SecureTokenStorage] Attempting to retrieve secure token
[SecureTokenStorage] Stored token has expired
[SecureTokenStorage] Token cleared from storage
```

**Why**: Hard-coded 24-hour expiration in secureTokenStorage

**Detection**:
```javascript
// Check token info
const storedData = sessionStorage.getItem('sgex_secure_token');
if (storedData) {
  const data = JSON.parse(storedData);
  console.log('Token created:', new Date(data.created));
  console.log('Token expires:', new Date(data.expires));
  console.log('Time until expiration:', 
    Math.round((data.expires - Date.now()) / 1000 / 60), 'minutes');
}
```

**Workaround**: Re-authenticate every 24 hours

---

### Scenario 7: Language Setting Change

**User Action**: Changes browser language settings

**Console Output**:
```
[SecureTokenStorage] Browser fingerprint mismatch - possible security issue
```

**Why**: navigator.language is part of fingerprint

**Trigger Detection**:
```javascript
// Before
Language: en-US

// After
Language: es-ES
```

**Workaround**: Maintain consistent browser language

---

### Scenario 8: Timezone Change

**User Action**: System timezone changes (traveling, DST change)

**Console Output**:
```
[SecureTokenStorage] Browser fingerprint mismatch - possible security issue
```

**Why**: Timezone offset is part of fingerprint

**Trigger Detection**:
```javascript
// Before
Timezone Offset: -420 (PDT)

// After
Timezone Offset: -480 (PST)
```

**Workaround**: Re-authenticate after timezone changes

## Code Locations for Investigation

### Primary Token Storage Service:
- `src/services/secureTokenStorage.js` (Lines 195-251)
- `src/services/secureTokenStorage.ts` (Lines 168-203)

### Fingerprint Generation:
- `src/services/secureTokenStorage.js` (Lines 25-50)
- `src/services/secureTokenStorage.ts` (Lines 25-74)

### Token Clearing Logic:
- `src/services/githubService.js` (Lines 76, 133, 2531)
- `src/services/secureTokenStorage.js` (Lines 210, 218, 231, 249)

### Page Reload Triggers:
```
src/components/framework/ErrorHandler.js:61
src/components/framework/PageLayout.js:2 locations
src/components/BranchDeploymentSelector.js
src/components/DecisionSupportLogicView.js
src/components/BusinessProcessSelection.js
src/components/BPMNSource.js
src/components/QuestionnaireEditor.js
src/components/Publications.js
src/components/DAKDashboard.js
src/components/DocumentationViewer.js
src/dak/faq/components/FAQAccordion.js
```

### Authentication Initialization:
```
src/components/BranchListing.js:308
src/components/BranchListingPage.js:365
src/components/BranchSelector.js:29
src/components/LandingPage.js:143
src/components/SelectProfilePage.js:157
```

## Testing Instructions

### Test 1: Verify Token Persistence Across Normal Reload

1. Authenticate in SGEX
2. Open Console and run:
   ```javascript
   console.log('Before reload:', !!sessionStorage.getItem('sgex_secure_token'));
   ```
3. Press F5 (normal reload)
4. After reload, run:
   ```javascript
   console.log('After reload:', !!sessionStorage.getItem('sgex_secure_token'));
   ```
5. **Expected**: Token should still exist

### Test 2: Verify Token Loss on Window Resize

1. Authenticate in SGEX
2. Note current window size:
   ```javascript
   console.log('Initial size:', window.screen.width, 'x', window.screen.height);
   ```
3. Resize browser window significantly
4. Navigate to a different page
5. Check Console for fingerprint mismatch warning
6. **Expected**: Token may be cleared due to fingerprint change

### Test 3: Verify Token Loss in New Tab

1. Authenticate in SGEX (Tab 1)
2. Verify token exists:
   ```javascript
   console.log('Tab 1 token:', !!sessionStorage.getItem('sgex_secure_token'));
   ```
3. Open SGEX in new tab (Tab 2)
4. In Tab 2, check:
   ```javascript
   console.log('Tab 2 token:', !!sessionStorage.getItem('sgex_secure_token'));
   ```
5. **Expected**: Tab 2 should NOT have token (sessionStorage is tab-specific)

### Test 4: Verify Browser Fingerprint Stability

1. Authenticate in SGEX
2. Run fingerprint check (see "Check Browser Fingerprint" above)
3. Change one factor (zoom, language, etc.)
4. Run fingerprint check again
5. **Expected**: Fingerprint values should differ

### Test 5: Verify Token Expiration (Time-Accelerated)

Note: This requires temporarily modifying code, which is NOT recommended for production.

1. In `secureTokenStorage.js`, temporarily change line 17:
   ```javascript
   // From:
   this.expirationHours = 24;
   // To:
   this.expirationHours = 0.01; // ~36 seconds
   ```
2. Authenticate
3. Wait 1 minute
4. Try to use authenticated feature
5. **Expected**: Token should be expired

## Monitoring and Telemetry

### Recommended Logging Additions (DO NOT IMPLEMENT)

To better understand token loss in production, consider adding:

1. **Token Loss Event Logging**:
   ```javascript
   // When token is cleared, log:
   logger.error('Token cleared', {
     reason: 'fingerprint_mismatch|expiration|validation_failure',
     lastUsed: timestamp,
     sessionDuration: duration,
     fingerprintBefore: oldFingerprint,
     fingerprintAfter: newFingerprint,
     userAgent: navigator.userAgent,
     screenSize: window.screen.width + 'x' + window.screen.height,
     timestamp: Date.now()
   });
   ```

2. **Fingerprint Change Detection**:
   ```javascript
   // Store fingerprint components separately
   // Compare on each retrieval
   // Log specific components that changed
   ```

3. **Session Duration Tracking**:
   ```javascript
   // Track time between token storage and retrieval
   // Log session duration when token is lost
   ```

4. **Browser Context Tracking**:
   ```javascript
   // Log browser type, version, OS
   // Track sessionStorage size and available space
   // Monitor for quota errors
   ```

## Support Response Templates

### Template 1: New Tab Issue
```
It appears you opened SGEX in a new tab. Due to browser security, 
authentication tokens are not shared across tabs. Please either:
1. Use the same tab for navigation, OR
2. Re-authenticate in the new tab
```

### Template 2: Fingerprint Change
```
Your browser configuration changed (window size, zoom, or display settings) 
which invalidated your authentication for security reasons. 
Please sign in again and try to avoid resizing your browser window.
```

### Template 3: Token Expiration
```
Your session expired after 24 hours of inactivity. 
Please sign in again to continue using SGEX.
```

### Template 4: Browser-Specific Issue
```
This appears to be a browser-specific issue. Please try:
1. Using normal refresh (F5) instead of hard refresh (Ctrl+Shift+R)
2. Using a different browser (Chrome recommended)
3. Disabling browser extensions that might interfere with storage
```

## Summary Checklist for User Reports

When investigating a token loss report, check:

- [ ] Browser Console logs (look for SecureTokenStorage messages)
- [ ] Whether user opened a new tab
- [ ] Whether user resized browser window
- [ ] Whether user changed zoom level
- [ ] Whether user moved browser between monitors
- [ ] Whether session exceeded 24 hours
- [ ] Whether user used hard refresh
- [ ] Browser type and version
- [ ] Whether browser is in private/incognito mode
- [ ] Whether user has browser extensions that might interfere

---

**Last Updated**: 2025-10-15
**For**: GitHub Issue - PAT Token Disappears Investigation
