# SAML Enhancement Merge Resolution - Step-by-Step Guide

## Current Situation

- **Main branch**: Fully migrated to TypeScript (.ts, .tsx files)
- **SAML branch**: JavaScript implementation (.js files) with enhancements
- **Conflicts**: 3 files (PageHeader, samlAuthService, crossTabSyncService)

## Resolution Approach

The best approach is to **manually integrate the SAML enhancements into the TypeScript files** from main. This ensures clean TypeScript code without JS/TS coexistence.

## Detailed Steps

### 1. crossTabSyncService.ts - Add 3 New Event Types

**File**: `src/services/crossTabSyncService.ts`
**Line**: ~90 (in `CrossTabEventTypes` const)

**Add these 3 new event types:**
```typescript
  /** SAML polling started for an organization */
  SAML_POLLING_STARTED: 'SAML_POLLING_STARTED',
  /** SAML modal opened for an organization */
  SAML_MODAL_OPENED: 'SAML_MODAL_OPENED',
  /** SAML modal closed for an organization */
  SAML_MODAL_CLOSED: 'SAML_MODAL_CLOSED',
```

Insert them after `SAML_AUTHENTICATED` and before `LOGOUT`.

### 2. samlAuthService.ts - Add Enhanced Features

**File**: `src/services/samlAuthService.ts`

**Changes needed:**

#### A. Add new interfaces (after existing interfaces):
```typescript
/** Active modal state */
interface SAMLModalState {
  tabId: string;
  timestamp: number;
}

/** Session storage state */
interface SAMLSessionState {
  pendingRequests: string[];
  cooldowns: Record<string, number>;
  timestamp: number;
}
```

#### B. Update SAMLModalInfo interface:
```typescript
export interface SAMLModalInfo {
  organization: string;
  repository: string | null;
  authorizationUrl: string;
  message: string;
  originalRequest?: () => Promise<any>;  // ADD THIS
  isSPAMode?: boolean;  // ADD THIS
}
```

#### C. Add to class constructor (after errorCooldownMs):
```typescript
    this.sessionStorageKey = 'sgex_saml_state';
    this.activeModals = new Map<string, SAMLModalState>();
    
    // Load state from session storage
    this.loadStateFromStorage();
```

#### D. Add private properties:
```typescript
  private sessionStorageKey: string;
  private activeModals: Map<string, SAMLModalState>;
```

#### E. Add new methods (copy from JavaScript version):
- `loadStateFromStorage()`
- `saveStateToStorage()`
- `isModalOpenForOrg(organization: string): boolean`
- `markModalOpened(organization: string): void`
- `markModalClosed(organization: string): void`
- `checkAuthorizationStatus(org: string, testFn: () => Promise<any>): Promise<boolean>`
- `getPendingOrganizations(): string[]`

#### F. Update setupCrossTabSync() to listen for modal events:
```typescript
    // Listen for modal open events
    crossTabSyncService.on(CrossTabEventTypes.SAML_MODAL_OPENED, (data) => {
      if (data.organization) {
        this.activeModals.set(data.organization, {
          tabId: data.tabId,
          timestamp: data.timestamp
        });
      }
    });

    // Listen for modal close events
    crossTabSyncService.on(CrossTabEventTypes.SAML_MODAL_CLOSED, (data) => {
      if (data.organization) {
        this.activeModals.delete(data.organization);
      }
    });
```

#### G. Update handleSAMLError signature:
```typescript
  handleSAMLError(
    error: any, 
    owner: string, 
    repo: string | null = null,
    originalRequest?: () => Promise<any>  // ADD THIS
  ): boolean
```

#### H. In handleSAMLError, add modal open check and pass originalRequest:
```typescript
    // Check if modal is already open for this org in any tab
    if (this.isModalOpenForOrg(organization)) {
      this.logger.debug('SAML modal already open in another tab', { organization });
      return true;
    }

    // ... existing code ...

    // When calling modalCallback:
    if (this.modalCallback) {
      this.modalCallback({
        organization,
        repository: repo,
        authorizationUrl: this.getSAMLAuthorizationUrl(organization),
        message: samlError.message,
        originalRequest  // ADD THIS
      });
    }
    
    // Save state after changes
    this.saveStateToStorage();
```

### 3. PageHeader.tsx - Add SAML Modal Integration

**File**: `src/components/framework/PageHeader.tsx`

#### A. Add imports:
```typescript
import samlAuthService from '../../services/samlAuthService';
import SAMLAuthModal from '../SAMLAuthModal';
import repositoryConfig from '../../config/repositoryConfig';
```

#### B. Add state variables:
```typescript
  const [samlModalOpen, setSamlModalOpen] = useState(false);
  const [samlModalInfo, setSamlModalInfo] = useState<any>(null);
```

#### C. Add refs for reliable state updates:
```typescript
  const setModalOpenRef = useRef(setSamlModalOpen);
  const setModalInfoRef = useRef(setSamlModalInfo);
  
  // Keep refs updated
  useEffect(() => {
    setModalOpenRef.current = setSamlModalOpen;
    setModalInfoRef.current = setSamlModalInfo;
  });
```

#### D. Register SAML callback (early registration):
```typescript
  // Register SAML modal callback immediately
  const [callbackRegistered] = useState(() => {
    samlAuthService.registerModalCallback((samlInfo) => {
      // In SPA mode, show one-time alert
      if (!repositoryConfig.isSAMLSupported()) {
        const storageKey = 'sgex_saml_alert_shown';
        const alertShown = sessionStorage.getItem(storageKey);
        
        if (!alertShown) {
          const org = samlInfo.organization || 'an organization';
          alert(
            `SAML Authorization Not Supported\n\n` +
            `Access to resources under the ${org} profile may be limited.\n\n` +
            `SAML SSO authorization requires a hosted service.`
          );
          sessionStorage.setItem(storageKey, 'true');
        }
        return;
      }
      
      // In hosted mode, show modal
      const enrichedSamlInfo = {
        ...samlInfo,
        isSPAMode: !repositoryConfig.isSAMLSupported()
      };
      setModalInfoRef.current(enrichedSamlInfo);
      setModalOpenRef.current(true);
    });
    return true;
  });
```

#### E. Add WHO SAML badge handler:
```typescript
  const handleWHOSAMLAuth = (): void => {
    const samlInfo = {
      organization: 'WorldHealthOrganization',
      repository: null,
      authorizationUrl: samlAuthService.getSAMLAuthorizationUrl('WorldHealthOrganization'),
      message: 'WHO SAML SSO authorization is required.',
      isSPAMode: !repositoryConfig.isSAMLSupported()
    };
    setSamlModalInfo(samlInfo);
    setSamlModalOpen(true);
  };
```

#### F. Add WHO SAML badge in dropdown (after GitHub Profile button):
```typescript
                <button className="dropdown-item saml-badge" onClick={handleWHOSAMLAuth}>
                  🔐 WHO SAML Authorization
                </button>
```

#### G. Add SAML modal rendering (before closing </header>):
```typescript
      {/* SAML Authorization Modal */}
      {samlModalOpen && samlModalInfo && (
        <SAMLAuthModal
          isOpen={samlModalOpen}
          onClose={() => {
            setSamlModalOpen(false);
            if (samlModalInfo?.organization) {
              samlAuthService.markModalClosed(samlModalInfo.organization);
            }
          }}
          organization={samlModalInfo.organization}
          repository={samlModalInfo.repository}
          authorizationUrl={samlModalInfo.authorizationUrl}
          message={samlModalInfo.message}
          originalRequest={samlModalInfo.originalRequest}
          isSPAMode={samlModalInfo.isSPAMode}
        />
      )}
```

### 4. repositoryConfig - Add SPA Detection

**File**: `src/config/repositoryConfig.ts`

**Add methods:**
```typescript
  /**
   * Check if running on GitHub Pages (SPA mode)
   */
  isGitHubPages(): boolean {
    return window.location.hostname.endsWith('.github.io');
  }

  /**
   * Check if SAML authorization is supported
   * SAML requires a backend service, not supported in SPA mode
   */
  isSAMLSupported(): boolean {
    return !this.isGitHubPages();
  }
```

### 5. SAMLAuthModal - Convert to TypeScript

**File**: `src/components/SAMLAuthModal.tsx` (create new file)

- Copy from `src/components/SAMLAuthModal.js`
- Add proper prop interface:
```typescript
interface SAMLAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: string;
  repository: string | null;
  authorizationUrl: string;
  message: string;
  originalRequest?: () => Promise<any>;
  isSPAMode?: boolean;
}
```
- Add TypeScript types for all state variables
- Keep all polling, retry, and cross-tab features
- Add SPA mode informational rendering

### 6. Remove JavaScript Files

After TypeScript versions are working:
```bash
git rm src/services/samlAuthService.js
git rm src/services/crossTabSyncService.js
git rm src/components/framework/PageHeader.js
git rm src/components/SAMLAuthModal.js
```

### 7. Build and Test

```bash
npm run build    # Should pass with no TypeScript errors
npm test        # Should pass all tests
```

### 8. Commit

```bash
git add .
git commit -m "Merge SAML enhancements into TypeScript files - resolve conflicts"
```

## Testing Checklist

After merge:
- [ ] Build passes without TypeScript errors
- [ ] Tests pass
- [ ] SAML modal appears on 403 errors (in hosted mode)
- [ ] WHO SAML badge appears in user dropdown
- [ ] SPA mode shows alert instead of modal
- [ ] Cross-tab coordination works (single modal per org)
- [ ] Automatic polling and retry works
- [ ] Session storage persists state across reloads

## Estimated Time

- Code changes: 2-3 hours (careful TypeScript conversion)
- Testing: 1 hour
- Total: 3-4 hours

## Need Help?

If any step is unclear or errors occur during implementation, I can provide more detailed code snippets for specific sections.
