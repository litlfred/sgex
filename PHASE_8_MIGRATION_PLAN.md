# Phase 8: Frontend TypeScript Migration Plan

## Overview

Phase 7 completed the migration of all service layer files (src/services/). Phase 8 will migrate the remaining frontend code.

## Current Status

### ✅ Completed (Phase 7)
- **src/services/**: 34 TypeScript files (100% complete)
- All service test files migrated

### 📋 Remaining JavaScript Files: ~193 files

## Directory Structure Explanation

### `src/` - React Application Source Code
The main frontend application with React components, hooks, utilities, and services.

**Structure:**
- `src/components/` - React UI components (70 .js files)
- `src/services/` - Backend services (✅ COMPLETE - 34 .ts files)
- `src/contexts/` - React contexts (2 .js files)
- `src/hooks/` - Custom React hooks (3 .js files)
- `src/utils/` - Utility functions (4 .js files)
- `src/dak/` - DAK-specific modules (14 .js files)
- `src/config/` - Configuration files (1 .js file)
- `src/tests/` - Test files (93 .test.js files)
- Root files: App.js, index.js, setupProxy.js, etc. (6 files)

### `services/` - Backend Microservices (SEPARATE)
Standalone backend services with their own package.json files.

**Services:**
1. **dak-faq-mcp**: Model Context Protocol server (TypeScript) ✅
2. **dak-publication-api**: Publication API service (TypeScript) ✅
3. **dak-catalog**: Catalog service

**Important:** These are NOT part of the React app and should remain separate.

## Recommendation: Keep Separate

❌ **DO NOT consolidate `services/` into `src/`**

**Reasons:**
1. Different purposes: `services/` = backend APIs, `src/` = frontend React app
2. Different deployment targets: services can be deployed independently
3. Different package.json and dependencies
4. Different build processes
5. Clean separation of concerns

## Phase 8 Migration Priority

### Priority 1: Core Infrastructure (10 files)
1. ✅ **src/contexts/AuthContext.js** → AuthContext.tsx
2. **src/contexts/AuthContext.test.js** → AuthContext.test.tsx
3. **src/hooks/useAuth.js** → useAuth.ts (if separate)
4. **src/hooks/useDAKUrlParams.js** → useDAKUrlParams.ts
5. **src/hooks/useThemeImage.js** → useThemeImage.ts
6. **src/hooks/useURLContext.js** → useURLContext.ts
7. **src/config/repositoryConfig.js** → repositoryConfig.ts
8. **src/utils/*.js** → *.ts (4 files)
9. **src/App.js** → App.tsx
10. **src/index.js** → index.tsx

### Priority 2: Framework Components (7 files)
These are used by many other components:
- src/components/framework/PageContext.js
- src/components/framework/PageProvider.js
- src/components/framework/AssetEditorLayout.js
- src/components/framework/PageBreadcrumbs.js
- src/components/framework/SaveButtonsContainer.js
- src/components/framework/ToolDefinition.js
- src/components/framework/index.js

### Priority 3: High-Impact Components (20 files)
Most commonly used components:
- DAKDashboard.js
- DAKSelection.js
- BusinessProcessSelection.js
- CoreDataDictionaryViewer.js
- DocumentationViewer.js
- BPMNEditor.js
- BPMNViewer.js
- ContextualHelpMascot.js
- LoginModal.js
- PATLogin.js
- SaveDialog.js
- LandingPage.js
- WelcomePage.js
- RepositorySelection.js
- OrganizationSelection.js
- BranchSelector.js
- And others...

### Priority 4: Remaining Components (43 files)
All other components in src/components/

### Priority 5: DAK Modules (14 files)
- src/dak/faq/components/
- src/dak/faq/engine/
- src/dak/faq/questions/
- src/dak/faq/services/
- src/dak/faq/storage/
- src/dak/faq/types/

### Priority 6: Test Files (93 files)
Convert all .test.js to .test.tsx/.test.ts

### Priority 7: Root Files (6 files)
- App.test.js
- setupProxy.js
- setupTests.js
- reportWebVitals.js
- i18n/index.js
- styles/index.js

## Migration Standards

Each file migration must include:

1. **TypeScript Conversion**
   - Add proper type annotations
   - Export all interfaces
   - Use React.FC or proper function types
   
2. **Props Types**
   - Define interface for component props
   - Use proper children types
   
3. **JSDoc Documentation**
   - Add @param and @returns tags
   - Include @example tags
   
4. **Import Cleanup**
   - Update imports to .ts/.tsx
   - Fix any circular dependencies
   
5. **Testing**
   - Ensure component still works
   - Run linter
   - Run tests

## Estimated Timeline

- Priority 1 (Core): 1-2 hours
- Priority 2 (Framework): 1-2 hours
- Priority 3 (High-Impact): 4-6 hours
- Priority 4 (Components): 8-12 hours
- Priority 5 (DAK): 2-3 hours
- Priority 6 (Tests): 6-8 hours
- Priority 7 (Root): 1 hour

**Total: 23-34 hours of migration work**

## Progress Tracking

Will be updated as migration progresses.

---

**Status**: Phase 8 Started - October 19, 2025
**Phase 7 Completion**: October 19, 2025 (services/)
