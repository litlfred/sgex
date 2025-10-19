# SAML Enhancement TypeScript Migration Plan

## Overview

This document outlines the plan to resolve merge conflicts between the SAML enhancement branch (JavaScript) and the main branch (TypeScript migration).

## Conflict Analysis

### Files in Conflict

1. **src/components/framework/PageHeader.js** (branch) vs **PageHeader.tsx** (main)
2. **src/services/samlAuthService.js** (branch) vs **samlAuthService.ts** (main)  
3. **src/services/crossTabSyncService.js** (branch) vs **crossTabSyncService.ts** (main)

### SAML Enhancements to Migrate

#### 1. crossTabSyncService - New Event Types
**Branch additions:**
- `SAML_POLLING_STARTED` - Polling coordination across tabs
- `SAML_MODAL_OPENED` - Modal coordination (single modal per org)
- `SAML_MODAL_CLOSED` - Modal cleanup coordination

**Migration:** Add these 3 new event types to `CrossTabEventTypes` in crossTabSyncService.ts

#### 2. samlAuthService - Enhanced Features
**Branch additions:**
- Session storage persistence (`loadStateFromStorage`, `saveStateToStorage`)
- Active modal tracking (`activeModals` Map)
- Modal coordination (`isModalOpenForOrg`, `markModalOpened`, `markModalClosed`)
- Original request retry support (new parameter in `handleSAMLError`)
- Cross-tab event listeners for modal coordination
- Authorization status checking (`checkAuthorizationStatus`)
- Polling coordination
- getTabId() method access

**Migration:** Enhance samlAuthService.ts with all these features, maintaining TypeScript types

#### 3. PageHeader - SAML Modal Integration
**Branch additions:**
- SAML modal state (`samlModalOpen`, `samlModalInfo`)
- SAML modal callback registration with refs for reliability
- SPA mode detection (`repositoryConfig.isSAMLSupported()`)
- One-time alert for SPA mode SAML errors
- SAMLAuthModal component import and rendering
- WHO SAML badge in user dropdown

**Migration:** Add SAML modal integration to PageHeader.tsx with proper TypeScript types

#### 4. New Files to Create
- **src/components/SAMLAuthModal.tsx** - Convert from .js to .tsx
- **src/components/SAMLAuthModal.css** - Copy as-is  
- **src/config/repositoryConfig** enhancements - Add SPA detection methods

## Migration Strategy

### Step 1: Update crossTabSyncService.ts
Add the 3 new SAML event types to the existing `CrossTabEventTypes` const.

### Step 2: Enhance samlAuthService.ts
Integrate all SAML enhancements while maintaining:
- Existing TypeScript interfaces
- Type safety for all new methods
- JSDoc comments and OpenAPI annotations
- Consistent coding style

New interfaces needed:
- `SAMLPollingConfig` - Polling configuration
- `SAMLModalState` - Active modal state
- Enhanced `SAMLModalInfo` with `originalRequest` and `isSPAMode` fields

### Step 3: Update PageHeader.tsx  
Add SAML modal integration:
- Import SAMLAuthModal component
- Add state for modal (`samlModalOpen`, `samlModalInfo`)
- Register callback with refs for reliability
- Handle SPA mode detection
- Add WHO SAML badge to user dropdown
- Render SAMLAuthModal conditionally

### Step 4: Convert SAMLAuthModal Component
Convert SAMLAuthModal.js to TypeScript:
- Add proper prop types
- Add TypeScript interfaces for polling state
- Maintain all polling, retry, and cross-tab features
- Add SPA mode informational rendering

### Step 5: Update repositoryConfig
Add SPA detection methods:
```typescript
isGitHubPages(): boolean
isSAMLSupported(): boolean
```

## Implementation Checklist

- [ ] Update crossTabSyncService.ts with new event types
- [ ] Enhance samlAuthService.ts with session storage, modal coordination, retry support
- [ ] Update PageHeader.tsx with SAML modal integration
- [ ] Convert SAMLAuthModal.js to SAMLAuthModal.tsx
- [ ] Add SPA detection to repositoryConfig
- [ ] Update tests to match TypeScript versions
- [ ] Build and verify no TypeScript errors
- [ ] Test SAML workflow end-to-end

## Benefits of This Approach

1. **Clean Integration**: Directly merges features into TypeScript files
2. **Type Safety**: All new code will have proper TypeScript types
3. **No Duplicate Files**: Only TypeScript versions will exist
4. **Consistent Style**: Matches main branch coding patterns
5. **Full Feature Set**: All SAML enhancements preserved

## Testing Requirements

After migration:
1. Verify build passes (`npm run build`)
2. Verify tests pass (`npm test`)
3. Test SAML modal appears on 403 errors
4. Test WHO SAML badge in user dropdown
5. Test SPA mode detection and informational message
6. Test cross-tab modal coordination
7. Test automatic polling and retry
8. Test session storage persistence

## Next Steps

1. Create TypeScript versions of all files with SAML enhancements integrated
2. Remove JavaScript versions (`.js` files)
3. Run build and fix any TypeScript errors
4. Run tests and update as needed
5. Manual testing of SAML workflow
6. Commit and push merged changes
