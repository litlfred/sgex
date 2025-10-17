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
  // Show modal with organization and authorization URL
});

// Handle a potential SAML error
const handled = samlAuthService.handleSAMLError(error, 'OrgName', 'repo-name');

// Get authorization URL for an organization
const url = samlAuthService.getSAMLAuthorizationUrl('WorldHealthOrganization');
// Returns: https://github.com/orgs/WorldHealthOrganization/sso

// Clear cooldown after successful authorization
samlAuthService.clearCooldown('OrgName');

// Reset all state
samlAuthService.reset();
```

### 2. SAMLAuthModal Component (`src/components/SAMLAuthModal.js`)

A modal dialog that guides users through the SAML SSO authorization process.

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Called when modal is closed
- `samlInfo` (object): Contains organization, repository, and authorization URL

**Features:**
- Clear step-by-step instructions
- Direct link to GitHub SSO authorization page
- Responsive design with dark mode support
- WHO branding consistent with the rest of the application

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

1. **User triggers a GitHub API call** (e.g., fetching WHO organization data)
2. **GitHub returns 403 with SAML enforcement message**
3. **SAMLAuthService detects the error** and checks cooldown
4. **If not in cooldown:**
   - Logs a single warning (not spam)
   - Calls the registered modal callback
5. **SAMLAuthModal displays** with:
   - Organization name
   - Clear instructions
   - "Authorize on GitHub" button
6. **User clicks "Authorize on GitHub":**
   - Opens GitHub SSO page in new tab
   - User authorizes their PAT on GitHub
7. **User returns to SGEX** and tries the action again
8. **Success!** The token now has SAML SSO authorization

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

## Known Limitations

1. **Manual refresh required:** After authorizing on GitHub, users must manually refresh or retry their action
2. **No automatic retry:** The service doesn't automatically retry failed requests after authorization
3. **Single callback:** Only one modal callback can be registered at a time (singleton pattern)

## Future Enhancements

1. **Automatic retry** after successful authorization
2. **Session storage** to remember which organizations have been authorized
3. **Batch authorization** for multiple organizations at once
4. **Authorization status indicator** in the UI
5. **Integration with other GitHub API error types** (rate limiting, permissions)

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
