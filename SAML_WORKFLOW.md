# SAML SSO Authorization Workflow

## Overview

The SAML SSO authorization workflow handles GitHub organization SAML enforcement errors gracefully by presenting users with a modal dialog that guides them through the authorization process. This prevents console spam and provides a better user experience.

## Components

### 1. SAMLAuthService (`src/services/samlAuthService.js`)

A centralized service that manages SAML enforcement error detection and handling.

**Key Features:**
- Detects SAML enforcement errors (403 with SAML message)
- Prevents console spam with cooldown mechanism (1 minute per organization)
- Tracks pending authorization requests
- Provides modal callback registration for UI integration

**API:**
```javascript
// Register a callback to show the modal
samlAuthService.registerModalCallback((samlInfo) => {
  // Show modal with organization, authorization URL, and optional originalRequest
});

// Handle a potential SAML error with optional original request for retry
const handled = samlAuthService.handleSAMLError(
  error, 
  'OrgName', 
  'repo-name',
  originalRequestFunction // Optional function to retry after authorization
);

// Check authorization status for an organization
const isAuthorized = await samlAuthService.checkAuthorizationStatus(
  'OrgName',
  async () => {
    // Test function that makes a SAML-protected API call
    await githubService.getOrganization('OrgName');
  }
);

// Get list of organizations with pending SAML requests
const orgs = samlAuthService.getPendingOrganizations();
// Returns: ['WorldHealthOrganization', 'OtherOrg']

// Get authorization URL for an organization
const url = samlAuthService.getSAMLAuthorizationUrl('WorldHealthOrganization');
// Returns: https://github.com/orgs/WorldHealthOrganization/sso

// Mark SAML authorization as successful (also broadcasts to other tabs)
samlAuthService.markSAMLAuthorized('OrgName', 'repo-name');

// Mark modal as opened/closed for an organization
samlAuthService.markModalOpened('OrgName');
samlAuthService.markModalClosed('OrgName');

// Clear cooldown after successful authorization
samlAuthService.clearCooldown('OrgName');

// Reset all state (including session storage)
samlAuthService.reset();
```

### 2. SAMLAuthModal Component (`src/components/SAMLAuthModal.js`)

An enhanced modal dialog that guides users through the SAML SSO authorization process with automatic polling and retry.

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Called when modal is closed
- `samlInfo` (object): Contains organization, repository, authorization URL, and optional originalRequest
- `onAuthorizationComplete` (function, optional): Called when authorization is successfully detected
- `pollingInterval` (number, optional): Polling interval in ms (default: 3000)
- `pollingTimeout` (number, optional): Polling timeout in ms (default: 300000 - 5 minutes)

**Features:**
- Clear step-by-step instructions
- Direct link to GitHub SSO authorization page
- **Automatic polling** for authorization status
- **Automatic retry** of original request on authorization
- **Live status indicator** showing polling progress
- **Cross-tab coordination** to prevent duplicate modals
- Responsive design with dark mode support
- WHO branding consistent with the rest of the application
- Configurable polling parameters

### 3. GitHub Service Integration (`src/services/githubService.js`)

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

## User Flow

### Automatic Flow (Default)

1. **User triggers a GitHub API call** (e.g., fetching WHO organization data)
2. **GitHub returns 403 with SAML enforcement message**
3. **SAMLAuthService detects the error** and checks:
   - If modal already open for this org (skip if yes)
   - If organization in cooldown period (skip if yes)
4. **If not skipped:**
   - Logs a single warning (not spam)
   - Stores pending request in sessionStorage
   - Broadcasts modal open event to other tabs
   - Calls the registered modal callback
5. **SAMLAuthModal displays** with:
   - Organization name
   - Clear instructions
   - "Authorize on GitHub" and "Later" buttons
6. **User clicks "Authorize on GitHub":**
   - Opens GitHub SSO page in new tab
   - Modal starts **automatic polling** every 3 seconds
   - Shows live status: "Waiting for authorization..."
7. **User authorizes on GitHub** in the SSO tab
8. **Modal automatically detects authorization:**
   - Original request is **automatically retried**
   - Modal shows "Authorization successful!"
   - Modal closes after 1 second
   - Success event broadcasted to all tabs
9. **All tabs update** their SAML status and clear pending requests
10. **Success!** The token now has SAML SSO authorization

### Manual Flow (From User Dropdown)

1. **User opens dropdown menu** in page header
2. **SAML status section shows** for relevant organizations:
   - "✓ Authorized" for authorized orgs
   - "⚠ Not Authorized" for unauthorized orgs
3. **Status auto-refreshes** every 10 seconds while dropdown is visible
4. **User clicks "Authorize Now"** for an unauthorized org
5. **SAMLAuthModal opens** and proceeds with automatic flow (steps 6-10 above)

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
4. **PageHeader** (NEW) - Displays SAML authorization status in user dropdown with:
   - Real-time status for relevant organizations
   - 10-second auto-refresh when dropdown is visible
   - Manual authorization initiation
   - Smart organization detection

## Cooldown Mechanism

The service implements a cooldown mechanism to prevent modal spam:

- **Duration:** 1 minute per organization
- **Purpose:** If the same organization triggers multiple SAML errors within 1 minute, only the first one shows the modal
- **Behavior:** The service still returns `true` for SAML errors during cooldown, but doesn't trigger the modal
- **Clearing:** Cooldown can be manually cleared after successful authorization using `clearCooldown(orgName)`

## Testing

Tests are located in `src/services/samlAuthService.test.js` and cover:

- ✓ SAML error detection
- ✓ Non-SAML error handling
- ✓ Organization name extraction
- ✓ Modal callback invocation
- ✓ Cooldown mechanism
- ✓ Pending request tracking
- ✓ Authorization URL generation

Run tests:
```bash
npm test -- --testPathPattern=samlAuthService.test.js
```

## Enhanced Features (Latest Update)

### Automatic Polling and Retry ✅

The SAML authorization modal now includes:

1. **Automatic Status Polling**: After clicking "Authorize on GitHub", the modal starts polling every 3 seconds to check if authorization is complete
2. **Automatic Request Retry**: When authorization is detected, the original failed request is automatically retried
3. **Configurable Timeouts**: Polling timeout defaults to 5 minutes but can be configured
4. **Visual Feedback**: Users see a live status indicator showing "Waiting for authorization..."

### Cross-Tab Coordination ✅

Enhanced cross-tab synchronization ensures:

1. **Single Modal Per Organization**: Only one tab shows the modal for a given organization at a time
2. **Polling Coordination**: Only one tab polls for a given organization to avoid rate limiting
3. **State Broadcasting**: When authorization completes in any tab, all tabs are notified and updated
4. **Session Persistence**: SAML state persists across page reloads via sessionStorage

### User Dropdown SAML Status ✅

The user dropdown menu now displays:

1. **Authorization Status**: Shows "✓ Authorized" or "⚠ Not Authorized" for each relevant organization
2. **Dynamic Refresh**: Status updates every 10 seconds when dropdown is visible
3. **Manual Authorization**: Users can initiate SAML authorization for any organization from the dropdown
4. **Smart Organization Detection**: Automatically detects relevant organizations from:
   - Current repository context
   - Pending SAML requests
   - WHO organization when accessing WHO repos

### Session Storage Management ✅

The service now persists state in sessionStorage:

1. **Pending Requests**: Tracks which organizations need authorization
2. **Cooldown Timers**: Prevents modal spam with 1-minute cooldown per org
3. **Reload Recovery**: Restores state after page reload to resume polling if needed

## Known Limitations

1. **Single callback:** Only one modal callback can be registered at a time (singleton pattern)
2. **Session-based:** sessionStorage is tab-specific; cross-tab sync uses BroadcastChannel API

## Future Enhancements

1. **Batch authorization** for multiple organizations at once
2. **Custom redirect** if GitHub allows, return user directly to SGEX after SSO
3. **Integration with other GitHub API error types** (rate limiting, permissions)

## Troubleshooting

### Modal doesn't appear
- Check that `samlAuthService.registerModalCallback()` is called
- Verify the error is actually a SAML enforcement error (403 with SAML message)
- Check if cooldown is active for the organization

### Console still shows messages
- The service intentionally logs one warning per SAML error (for debugging)
- This is not spam - it's a single log entry vs. multiple console.logs before
- Check the logger configuration if you need to suppress these

### Authorization doesn't persist
- GitHub PAT SAML authorization is per-token, per-organization
- If you generate a new token, you must authorize it again
- Classic PATs and fine-grained PATs have different authorization requirements

## Related Files

- `src/services/samlAuthService.js` - SAML auth service
- `src/services/samlAuthService.test.js` - Service tests
- `src/components/SAMLAuthModal.js` - Modal component
- `src/components/SAMLAuthModal.css` - Modal styles
- `src/services/githubService.js` - GitHub service integration
- `src/components/LandingPage.js` - Landing page integration
- `src/components/OrganizationSelection.js` - Organization selection integration
- `src/components/RepositorySelection.js` - Repository selection integration
