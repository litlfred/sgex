# SAML SSO Authorization Workflow

## Overview

The SAML SSO authorization workflow handles GitHub organization SAML enforcement errors gracefully by presenting users with a modal dialog that guides them through the authorization process. The system includes automatic polling, cross-tab coordination, and comprehensive logging.

## Components

### 1. SAMLAuthService (`src/services/samlAuthService.js`)

A centralized service that manages SAML enforcement error detection and handling with enhanced features for polling and cross-tab synchronization.

**Key Features:**
- Detects SAML enforcement errors (403 with SAML message)
- Cross-tab coordination to show only one modal per organization
- Automatic polling for authorization completion (3 second intervals)
- Automatic retry of original failed requests
- Session state persistence across tabs and reloads
- Comprehensive event logging
- Cooldown mechanism (1 minute per organization)
- Multi-organization support

**API:**
```javascript
// Register a callback to show the modal
samlAuthService.registerModalCallback((samlInfo) => {
  // Show modal with organization and authorization URL
});

// Handle a potential SAML error with optional retry callback
const handled = samlAuthService.handleSAMLError(
  error, 
  'OrgName', 
  'repo-name',
  async () => {
    // Retry callback - will be called automatically upon authorization
    return await someApiCall();
  }
);

// Start polling for authorization (called automatically by modal)
samlAuthService.startPolling('OrgName', ssoWindowRef);

// Stop polling
samlAuthService.stopPolling('OrgName');

// Notify modal closed (called by modal component)
samlAuthService.notifyModalClosed('OrgName', laterClicked);

// Check SAML status for an organization (for UI display)
const status = await samlAuthService.checkSAMLStatus('OrgName', async () => {
  await githubService.getOrganization('OrgName');
});

// Get authorization URL for an organization
const url = samlAuthService.getSAMLAuthorizationUrl('WorldHealthOrganization');
// Returns: https://github.com/orgs/WorldHealthOrganization/sso

// Clear cooldown after successful authorization
samlAuthService.clearCooldown('OrgName');

// Reset all state
samlAuthService.reset();
```

### 2. CrossTabSyncService (`src/services/crossTabSyncService.js`)

Provides cross-tab communication using BroadcastChannel API (from main branch).

**Key Features:**
- Event-driven cross-tab communication
- Type-safe event registration
- Automatic cleanup of event listeners
- Browser compatibility detection
- Support for multiple event types

**API:**
```javascript
// Register a listener for an event type
crossTabSyncService.on('SAML_AUTHORIZATION_COMPLETE', (data) => {
  console.log('Received:', data);
});

// Broadcast an event to other tabs
crossTabSyncService.broadcast('SAML_AUTHORIZATION_COMPLETE', { 
  organization: 'OrgName',
  timestamp: Date.now() 
});

// Unregister a specific handler
crossTabSyncService.off('SAML_AUTHORIZATION_COMPLETE', handlerFunction);
```

### 3. SAMLStateStorageService (`src/services/samlStateStorageService.js`)

Manages persistent state for SAML authorization workflows using sessionStorage and localStorage.

**Key Features:**
- Pending request tracking
- Cooldown state management
- Polling state persistence
- Active modal coordination across tabs
- Automatic cleanup of stale state

**API:**
```javascript
// Pending requests
samlStateStorageService.addPendingRequest(org, requestInfo);
samlStateStorageService.removePendingRequest(org);
const pending = samlStateStorageService.getPendingRequests();

// Cooldowns
samlStateStorageService.setCooldown(org, durationMs);
const inCooldown = samlStateStorageService.isInCooldown(org);
samlStateStorageService.clearCooldown(org);

// Polling state
samlStateStorageService.setPollingState(org, state);
samlStateStorageService.clearPollingState(org);

// Active modals
samlStateStorageService.registerActiveModal(org, tabId);
samlStateStorageService.unregisterActiveModal(org);
const hasModal = samlStateStorageService.hasActiveModalInOtherTab(org, tabId);

// Cleanup
samlStateStorageService.clearAll();
samlStateStorageService.cleanup();
```

### 4. SAMLAuthModal Component (`src/components/SAMLAuthModal.js`)

A modal dialog that guides users through the SAML SSO authorization process with polling support.

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Called when modal is closed
- `samlInfo` (object): Contains organization, repository, and authorization URL

**Features:**
- Clear step-by-step instructions
- Direct link to GitHub SSO authorization page
- Automatic polling for authorization completion
- Visual polling indicator
- Cross-tab event handling to auto-close when authorized in another tab
- "Later" button with cooldown behavior
- Responsive design with dark mode support
- WHO branding consistent with the rest of the application

### 5. GitHub Service Integration (`src/services/githubService.js`)

The GitHub service has been updated to use the SAML auth service instead of console logging.

**Changes:**
1. Import `samlAuthService`
2. In `checkSmartGuidelinesCompatibility()`:
   - Detects SAML errors
   - Calls `samlAuthService.handleSAMLError()` instead of `console.log()`
   - Still attempts public API fallback
3. In `getWHOOrganization()`:
   - Handles SAML errors with the service
   - Returns fallback data gracefully

### 6. PageHeader Component Integration (`src/components/framework/PageHeader.js`)

The PageHeader displays SAML authorization status in the user dropdown menu.

**Features:**
- Shows SAML status for configured organizations
- Auto-refreshes status every 10 seconds when dropdown is visible
- Allows user-initiated authorization from dropdown
- Visual indicators for authorized/not authorized state
- Integrates with SAML modal workflow

## User Flow

1. **User triggers a GitHub API call** (e.g., fetching WHO organization data)
2. **GitHub returns 403 with SAML enforcement message**
3. **SAMLAuthService detects the error** and checks:
   - If organization is in cooldown
   - If another tab has a modal open for this organization
4. **If not in cooldown and no other modal:**
   - Logs a single warning (not spam)
   - Stores pending request state
   - Calls the registered modal callback
5. **SAMLAuthModal displays** with:
   - Organization name
   - Clear instructions
   - "Authorize on GitHub" button
   - "Later" button (sets 1 minute cooldown)
6. **User clicks "Authorize on GitHub":**
   - Opens GitHub SSO page in new tab
   - Starts polling every 3 seconds
   - Shows polling indicator in modal
7. **Polling checks authorization:**
   - Retries original request periodically
   - Detects when authorization succeeds
   - Broadcasts success to all tabs
8. **On successful authorization:**
   - Automatically retries original request
   - Closes modal in all tabs
   - Clears cooldown and pending state
   - Updates UI with successful result
9. **User clicks "Later":**
   - Closes modal
   - Sets 1 minute cooldown
   - Stops polling
   - Modal won't reappear for that org for 1 minute

## SAML Status in User Dropdown

The user dropdown in the page header shows SAML authorization status:

1. **When dropdown opens:**
   - Checks SAML status for configured organizations
   - Shows "Authorized" or "Not Authorized" for each
2. **Auto-refresh:**
   - Status refreshes every 10 seconds while dropdown is visible
   - Stops refreshing when dropdown closes
3. **User actions:**
   - Click "Authorize" button to initiate SAML workflow
   - Status updates automatically after authorization

## Integration Example

To add SAML support to a component:

```javascript
import React, { useState, useEffect } from 'react';
import samlAuthService from '../services/samlAuthService';
import SAMLAuthModal from './SAMLAuthModal';

const MyComponent = () => {
  const [samlModalOpen, setSamlModalOpen] = useState(false);
  const [samlModalInfo, setSamlModalInfo] = useState(null);

  useEffect(() => {
    // Register modal callback on mount
    samlAuthService.registerModalCallback((samlInfo) => {
      setSamlModalInfo(samlInfo);
      setSamlModalOpen(true);
    });
  }, []);

  return (
    <div>
      {/* Your component content */}
      
      {/* SAML Modal */}
      <SAMLAuthModal
        isOpen={samlModalOpen}
        onClose={() => {
          setSamlModalOpen(false);
          setSamlModalInfo(null);
        }}
        samlInfo={samlModalInfo}
      />
    </div>
  );
};
```

## Components with SAML Integration

The following components have been integrated with the SAML workflow:

1. **LandingPage** - Fetches user data and organizations
2. **OrganizationSelection** - Fetches organization list
3. **RepositorySelection** - Fetches repositories for a profile
4. **PageHeader** - Displays SAML status in user dropdown
5. **Any component using githubService** - Automatically benefits from SAML handling

## Cross-Tab Coordination

The system coordinates SAML workflows across multiple browser tabs using the CrossTabSyncService:

1. **Modal visibility:** Only one tab shows the modal per organization
2. **Polling:** Only one tab polls per organization to minimize API calls
3. **State sync:** All tabs receive authorization completion events
4. **Cleanup:** Stale modal registrations auto-expire after 5 minutes

**Implementation:**
- CrossTabSyncService from main branch (PR #1120)
- BroadcastChannel API for cross-tab messaging
- Event-driven architecture with typed events
- Single channel for all events

**Event Types:**
- `SAML_MODAL_OPENED`: When a modal is opened in a tab
- `SAML_MODAL_CLOSED`: When a modal is closed
- `SAML_POLLING_STARTED`: When polling begins
- `SAML_AUTHORIZATION_COMPLETE`: When SAML authorization succeeds

## Session State Persistence

State is persisted across tabs and reloads:

- **sessionStorage:** Tab-specific pending requests and polling state
- **localStorage:** Cross-tab cooldowns and active modal tracking
- **Automatic cleanup:** Expired cooldowns and stale registrations are cleaned up

## Polling Mechanism

When "Authorize" is clicked:

1. **Start:** Polling begins every 3 seconds
2. **Check:** Retries the original failed request
3. **Detect:** Success when request no longer returns SAML error
4. **Timeout:** Stops after 5 minutes if no success
5. **Coordinate:** Only one tab polls per organization
6. **Broadcast:** Notifies all tabs when authorization detected

## Automatic Retry

On successful authorization:

1. Original request is automatically retried
2. If success, modal closes and UI updates
3. If different error, error is shown to user
4. All tabs are notified to clean up state

## Cooldown Mechanism

The service implements a cooldown mechanism to prevent modal spam:

- **Duration:** 1 minute per organization (configurable)
- **Trigger:** Activated when user clicks "Later"
- **Purpose:** Prevents modal from reappearing for same org within cooldown
- **Behavior:** Service still returns `true` for SAML errors during cooldown, but doesn't trigger modal
- **Storage:** Persisted in localStorage for cross-tab coordination
- **Clearing:** Automatically cleared on successful authorization

## Testing

Tests are located in:
- `src/services/samlAuthService.test.js` - SAML auth service tests (12 tests)
- `src/services/crossTabSyncService.test.js` - Cross-tab sync tests (22 tests)

Coverage includes:

- ✓ SAML error detection
- ✓ Non-SAML error handling
- ✓ Organization name extraction
- ✓ Modal callback invocation
- ✓ Cooldown mechanism
- ✓ Pending request tracking
- ✓ Authorization URL generation
- ✓ Cross-tab event broadcasting and handling
- ✓ Browser compatibility detection
- ✓ Standard event types

Run tests:
```bash
npm test -- --testPathPattern="saml|crossTab"
```

All 34 tests passing.

## Logging

All major events are logged with structured data:

**Event Types:**
- `saml-error-detected` - SAML enforcement error detected
- `saml-authorization-required` - Modal will be shown
- `modal-opened` - Modal displayed to user
- `modal-closed` - Modal closed by user
- `later-clicked` - User clicked "Later" button
- `cooldown-set` - Cooldown activated
- `cooldown-cleared` - Cooldown removed
- `polling-started` - Authorization polling begun
- `polling-tick` - Polling check performed
- `polling-timeout` - Polling timeout reached
- `polling-stopped` - Polling stopped
- `authorization-detected` - SAML authorization succeeded
- `authorization-successful` - Automatic retry succeeded
- `authorization-complete-other-tab` - Authorization in another tab
- `saml-status-check` - Status check initiated
- `service-reset` - Service state reset

**Log Levels:**
- `debug` - Detailed diagnostic information
- `info` - Important events and state changes
- `warn` - Issues that don't prevent operation
- `error` - Failures and critical issues

**Viewing Logs:**
All logs are accessible through the browser console and the logger service.

## Known Limitations

1. **Browser support:** BroadcastChannel not supported in all browsers (falls back to localStorage)
2. **Rate limiting:** Polling may trigger rate limits if too frequent (currently 3 seconds)
3. **SSO window:** If user closes SSO window, they must manually reopen (polling continues)
4. **Single token:** Authorization is per-token, per-organization

## Future Enhancements

1. **Configurable polling:** Allow customization of polling interval and timeout
2. **Batch authorization:** If GitHub supports it, authorize multiple orgs at once
3. **Custom redirect:** Return user directly to SGEX after SSO (if GitHub allows)
4. **Authorization history:** Track which orgs/tokens have been authorized
5. **Smart polling:** Adjust polling frequency based on typical authorization time
6. **Better error messages:** More specific guidance for different SAML error types

## Troubleshooting

### Modal doesn't appear
- Check that `samlAuthService.registerModalCallback()` is called
- Verify the error is actually a SAML enforcement error (403 with SAML message)
- Check if cooldown is active for the organization
- Check if another tab has the modal open

### Polling doesn't detect authorization
- Verify original request was passed as retry callback
- Check browser console for polling tick logs
- Ensure SSO authorization was actually completed on GitHub
- Check for rate limiting (reduce polling frequency)

### Authorization doesn't persist
- GitHub PAT SAML authorization is per-token, per-organization
- If you generate a new token, you must authorize it again
- Classic PATs and fine-grained PATs have different authorization requirements

### Cross-tab sync not working
- Check BroadcastChannel support (localStorage fallback should work)
- Verify both tabs are on same origin
- Check browser console for cross-tab event logs

### Status not showing in dropdown
- Ensure organizations are added to `SAML_ORGS_TO_CHECK` in PageHeader
- Check if user is authenticated
- Verify dropdown is actually opening (triggers status check)

## Related Files

- `src/services/samlAuthService.js` - SAML auth service
- `src/services/samlAuthService.test.js` - Service tests
- `src/services/crossTabSyncService.js` - Cross-tab communication
- `src/services/crossTabSyncService.test.js` - Cross-tab sync tests
- `src/services/samlStateStorageService.js` - State persistence
- `src/components/SAMLAuthModal.js` - Modal component
- `src/components/SAMLAuthModal.css` - Modal styles
- `src/components/framework/PageHeader.js` - Header with SAML status
- `src/components/framework/PageHeader.css` - Header styles
- `src/services/githubService.js` - GitHub service integration
- `src/components/LandingPage.js` - Landing page integration
- `src/components/OrganizationSelection.js` - Organization selection integration
- `src/components/RepositorySelection.js` - Repository selection integration
