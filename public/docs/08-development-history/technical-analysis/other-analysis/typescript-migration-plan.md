# TypeScript Migration Plan and Checklist

## Overview

This document provides a comprehensive, phased migration plan for transitioning all JavaScript usage in the SGEX Workbench repository to TypeScript. This migration aims to improve type safety, developer experience, and code maintainability across the entire codebase.

**Target Completion**: Complete migration to TypeScript with all JavaScript files converted or explicitly approved.

**Policy**: Future use of JavaScript files requires explicit approval from a code maintainer. TypeScript is the default for all new and migrated code.

---

## Migration Policy

### JavaScript Usage Policy

**Effective immediately:**
- ✅ **TypeScript is the default** for all new code (`.ts` for modules, `.tsx` for React components)
- ⚠️ **JavaScript requires approval** - Any use of JavaScript files (`.js`, `.jsx`) must be explicitly approved by a code maintainer
- 📝 **Documentation required** - All JavaScript usage must be documented with a clear justification
- 🔄 **Legacy code exception** - Existing JavaScript files are tracked for migration but do not block development
- 🚫 **No new JavaScript** - Pull requests introducing new JavaScript files will require maintainer justification
- 📊 **JSON Schema required** - All TypeScript types MUST have corresponding JSON Schema validation (auto-generated via `npm run generate-schemas`)
- 📋 **OpenAPI documentation** - All API endpoints and services MUST be documented with OpenAPI specifications

### Approval Process for JavaScript Files

If JavaScript is required (rare cases):
1. Document the technical reason JavaScript is necessary
2. Request explicit approval from @litlfred or designated code maintainer
3. Add comment in the file explaining why TypeScript cannot be used
4. Track the file for future TypeScript conversion when possible

### JSON Schema and OpenAPI Requirements

All TypeScript code must include proper schema validation and documentation:

**JSON Schema Requirements:**
- All TypeScript types and interfaces MUST be exported for schema generation
- Run `npm run generate-schemas` after adding or modifying types
- Schemas are automatically generated to `public/docs/schemas/`
- Use `RuntimeValidationService` for runtime validation of data
- Add JSDoc comments to types for better schema documentation

**OpenAPI Documentation Requirements:**
- All API endpoints MUST be documented with OpenAPI 3.0 specifications
- Service interfaces should include OpenAPI-compatible JSDoc annotations
- Use standard HTTP status codes and response types
- Document authentication requirements and security schemes
- Include examples for request/response payloads

**Example with JSON Schema:**
```typescript
/**
 * User profile information
 * @example { "id": "123", "login": "user", "email": "user@example.com" }
 */
export interface GitHubUser {
  /** Unique user identifier */
  id: string;
  /** GitHub username */
  login: string;
  /** User email address */
  email: string;
}

// Runtime validation
import { validateAndCast } from './services/runtimeValidationService';
const user = validateAndCast<GitHubUser>('GitHubUser', userData);
```

**Example with OpenAPI:**
```typescript
/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GitHubUser'
 */
export async function getUser(id: string): Promise<GitHubUser> {
  // implementation
}
```

---

## Current Status

**Analysis Date**: 2025-01-13

### File Inventory
- **Total JavaScript files**: 297 (excluding node_modules, build, public)
- **TypeScript files**: 11 (3.5% of codebase)
- **Completed phases**: Phase 1 (Foundation), Phase 2 (Utilities), Phase 3 (Services)
- **Current phase**: Phase 4 (Components) - Ready to begin

### JavaScript Files by Category

#### Configuration Files (4 files)
- [x] `.eslintrc.js` - ESLint configuration (CJS module format required)
- [x] `craco.config.js` - Create React App configuration (CJS module format required)
- [x] `src/config/repositoryConfig.js` - Repository configuration
- [x] `src/styles/index.js` - Style exports

#### Core Application Files (7 files)
- [ ] `src/App.js` - Main application component
- [ ] `src/App.test.js` - Main application tests
- [ ] `src/index.js` - Application entry point
- [ ] `src/reportWebVitals.js` - Performance monitoring
- [ ] `src/setupTests.js` - Test configuration
- [ ] `src/setupProxy.js` - Development proxy setup
- [ ] `src/i18n/index.js` - Internationalization setup

#### Scripts (22 files)
- [ ] `scripts/analyze-github-issues.js`
- [ ] `scripts/bpmn-to-svg.js`
- [ ] `scripts/check-framework-compliance.js`
- [ ] `scripts/check-github-service-compliance.js`
- [ ] `scripts/configure-repository.js`
- [ ] `scripts/demonstrate-fix.js`
- [ ] `scripts/format-security-comment.js`
- [ ] `scripts/format-security-comment.test.js`
- [ ] `scripts/generate-dak-faq-docs.js`
- [ ] `scripts/generate-dak-publication-poc.js`
- [ ] `scripts/generate-qa-report.js`
- [ ] `scripts/generate-service-table.js`
- [ ] `scripts/lib/pr-comment-manager.js`
- [ ] `scripts/lib/pr-comment-manager.test.js`
- [ ] `scripts/run-security-checks.js`
- [ ] `scripts/run-security-checks.test.js`
- [ ] `scripts/test-404-routing.js`
- [ ] `scripts/test-url-integration.js`
- [ ] `scripts/validate-pr-workflow-improvements.js`
- [ ] `scripts/verify-404.js`

#### Components (97 files in src/components/)
Including framework, DAK components, editors, viewers, and UI elements.

#### Services (36 files in src/services/)
Including GitHub integration, caching, validation, and business logic services.

#### Utilities (17 files in src/utils/)
Helper functions and utility modules.

#### Tests (116 files in src/tests/)
Comprehensive test coverage across all features.

---

## Phased Migration Plan

### Phase 1: Foundation & Setup ✅ COMPLETED

**Status**: Completed  
**Completion Date**: Phase 1 complete

**Objectives:**
- [x] Install TypeScript and related dependencies
- [x] Set up TypeScript configuration (tsconfig.json)
- [x] Configure ESLint for TypeScript support
- [x] Create initial type definitions
- [x] Set up JSON schema generation
- [x] Create runtime validation framework

**Completed Work:**
- ✅ Installed TypeScript 5.7.3 and related packages
- ✅ Created `tsconfig.json` with appropriate configuration
- ✅ Updated ESLint configuration for TypeScript support
- ✅ Created core type definitions in `src/types/core.ts`
- ✅ Implemented `RuntimeValidationService` for AJV + TypeScript integration
- ✅ Set up automated JSON schema generation
- ✅ Created comprehensive test suite for new services

---

### Phase 2: Core Infrastructure ✅ COMPLETED

**Status**: Completed  
**Completion Date**: Phase 2 complete

**Objectives:**
- [x] Convert utility functions to TypeScript
- [x] Migrate core services to TypeScript
- [x] Add TypeScript definitions for external APIs
- [x] Implement JSON Schema generation framework
- [x] Set up runtime validation with AJV + TypeScript

**Completed Work:**
- ✅ Migrated all core utilities (`logger.ts`, `schemaGenerator.ts`, `concurrency.ts`, `navigationUtils.ts`, `routeUtils.ts`)
- ✅ Created comprehensive interoperability testing framework
- ✅ Validated JavaScript/TypeScript integration with 9 passing tests
- ✅ Resolved all TypeScript compilation blockers (76 → 0 errors)

---

### Phase 3: Service Migration ✅ COMPLETED

**Status**: Completed  
**Completion Date**: Phase 3 complete

**Objectives:**
- [x] Migrate core services to TypeScript
- [x] Implement service-specific type definitions
- [x] Ensure backward compatibility with existing JavaScript code
- [x] Create comprehensive integration testing

**Completed Work:**
- ✅ Migrated `repositoryCacheService.js` → `repositoryCacheService.ts`
- ✅ Migrated `secureTokenStorage.js` → `secureTokenStorage.ts`
- ✅ Migrated `githubService.js` → `githubService.ts` (foundation)
- ✅ Enhanced core type definitions with service-specific interfaces
- ✅ Created Phase 3 integration test suite with 11 passing tests
- ✅ Maintained full backward compatibility with existing JavaScript imports

---

### Phase 4: Utility & Config Migration 📋 IN PROGRESS

**Status**: Ready to begin  
**Timeline**: 1-2 weeks  
**Priority**: HIGH

**Objectives:**
- [ ] Migrate remaining utility modules to TypeScript
- [ ] Convert configuration files where applicable
- [ ] Update imports throughout the codebase
- [ ] Validate utility function behavior

**Target Files (17 utilities, 4 config files):**

#### Utilities to Migrate:
- [ ] `src/utils/browserBuffer.js` → `browserBuffer.ts`
- [ ] `src/utils/concurrency.js` → `concurrency.ts` (if not already done)
- [ ] `src/utils/imageAltTextHelper.js` → `imageAltTextHelper.ts`
- [ ] `src/utils/logger.js` → `logger.ts` (if not already done)
- [ ] `src/utils/navigationUtils.js` → `navigationUtils.ts` (if not already done)
- [ ] `src/utils/repositoryCompatibilityCache.js` → `repositoryCompatibilityCache.ts`
- [ ] `src/utils/themeManager.js` → `themeManager.ts`
- [ ] `src/utils/themeUtils.js` → `themeUtils.ts`
- [ ] `src/utils/timeUtils.js` → `timeUtils.ts`

#### Config Files to Review:
- [ ] `src/config/repositoryConfig.js` - Consider migration to `.ts`
- [ ] `src/styles/index.js` - Review for TypeScript compatibility
- [ ] `.eslintrc.js` - Keep as `.js` (CJS format required) - Document approval
- [ ] `craco.config.js` - Keep as `.js` (CJS format required) - Document approval

**Acceptance Criteria:**
- [ ] All utility files migrated to TypeScript
- [ ] All imports updated across codebase
- [ ] Tests passing for all migrated utilities
- [ ] Configuration files reviewed and documented

---

### Phase 5: Core App & Context Migration 📋 PLANNED

**Status**: Planned  
**Timeline**: 2-3 weeks  
**Priority**: HIGH  
**Depends on**: Phase 4 completion

**Objectives:**
- [ ] Migrate main application entry point
- [ ] Convert React root component to TypeScript
- [ ] Update context providers and hooks
- [ ] Migrate internationalization setup
- [ ] Update performance monitoring

**Target Files (7 core app files):**
- [ ] `src/index.js` → `index.tsx` - Application entry point
- [ ] `src/App.js` → `App.tsx` - Main application component
- [ ] `src/App.test.js` → `App.test.tsx` - Main application tests
- [ ] `src/i18n/index.js` → `index.ts` - Internationalization setup
- [ ] `src/reportWebVitals.js` → `reportWebVitals.ts` - Performance monitoring
- [ ] `src/setupTests.js` → `setupTests.ts` - Test configuration
- [ ] `src/setupProxy.js` → `setupProxy.ts` - Development proxy

**Technical Considerations:**
- Update `public/index.html` if needed for TypeScript entry point
- Ensure React 19.2.0 compatibility with TypeScript
- Update build scripts for TypeScript entry point
- Validate hot module replacement works with TypeScript

**Acceptance Criteria:**
- [ ] Application starts successfully with TypeScript entry point
- [ ] All tests passing
- [ ] Hot reload works in development
- [ ] Build process completes successfully
- [ ] No regression in application behavior

---

### Phase 6: Component Migration 📋 PLANNED

**Status**: Planned  
**Timeline**: 6-8 weeks  
**Priority**: MEDIUM  
**Depends on**: Phase 5 completion

**Objectives:**
- [ ] Convert all React components to TypeScript
- [ ] Add proper prop type definitions
- [ ] Migrate component tests
- [ ] Update component documentation

**Target Files (97 component files):**

#### Framework Components (High Priority):
- [ ] `src/components/framework/PageLayout.js` → `PageLayout.tsx`
- [ ] `src/components/framework/PageHeader.js` → `PageHeader.tsx`
- [ ] `src/components/framework/PageProvider.js` → `PageProvider.tsx`
- [ ] `src/components/framework/PageContext.js` → `PageContext.tsx`
- [ ] `src/components/framework/ErrorHandler.js` → `ErrorHandler.tsx`
- [ ] `src/components/framework/AssetEditorLayout.js` → `AssetEditorLayout.tsx`
- [ ] `src/components/framework/usePageParams.js` → `usePageParams.ts`
- [ ] `src/components/framework/useAssetSave.js` → `useAssetSave.ts`
- [ ] `src/components/framework/index.js` → `index.ts`

#### Core Components (High Priority):
- [ ] `src/components/LandingPage.js` → `LandingPage.tsx`
- [ ] `src/components/DAKDashboard.js` → `DAKDashboard.tsx`
- [ ] `src/components/DAKSelection.js` → `DAKSelection.tsx`
- [ ] `src/components/RepositorySelection.js` → `RepositorySelection.tsx`
- [ ] `src/components/OrganizationSelection.js` → `OrganizationSelection.tsx`

#### Editor Components (Medium Priority):
- [ ] `src/components/BPMNEditor.js` → `BPMNEditor.tsx`
- [ ] `src/components/BPMNViewer.js` → `BPMNViewer.tsx`
- [ ] `src/components/ComponentEditor.js` → `ComponentEditor.tsx`
- [ ] `src/components/QuestionnaireEditor.js` → `QuestionnaireEditor.tsx`
- [ ] `src/components/ActorEditor.js` → `ActorEditor.tsx`

#### Viewer Components (Medium Priority):
- [ ] `src/components/CoreDataDictionaryViewer.js` → `CoreDataDictionaryViewer.tsx`
- [ ] `src/components/DecisionSupportLogicView.js` → `DecisionSupportLogicView.tsx`
- [ ] `src/components/DocumentationViewer.js` → `DocumentationViewer.tsx`
- [ ] `src/components/PersonaViewer.js` → `PersonaViewer.tsx`

#### Remaining Components (Lower Priority):
- [ ] All other component files in `src/components/`
- [ ] DAK FAQ components in `src/dak/faq/components/`

**Migration Strategy:**
1. Start with framework components (foundation)
2. Migrate core navigation and selection components
3. Convert editor and viewer components
4. Finish with utility components and modals
5. Update all component tests

**Acceptance Criteria:**
- [ ] All components migrated to TypeScript
- [ ] Prop types defined using TypeScript interfaces
- [ ] Component tests updated and passing
- [ ] No runtime regressions
- [ ] Improved IntelliSense and type safety

---

### Phase 7: Service Layer Migration 📋 PLANNED

**Status**: Planned  
**Timeline**: 4-5 weeks  
**Priority**: MEDIUM  
**Depends on**: Phase 6 completion

**Objectives:**
- [ ] Convert remaining services to TypeScript
- [ ] Add comprehensive type definitions for service APIs
- [ ] Migrate service tests
- [ ] Update service documentation

**Target Files (36 service files):**

#### Core Services (Remaining):
- [ ] `src/services/githubService.js` - Complete full migration (partially done)
- [ ] `src/services/branchContextService.js`
- [ ] `src/services/cacheManagementService.js`
- [ ] `src/services/dataAccessLayer.js`
- [ ] `src/services/userAccessService.js`

#### Business Logic Services:
- [ ] `src/services/dakComplianceService.js`
- [ ] `src/services/actorDefinitionService.js`
- [ ] `src/services/bookmarkService.js`
- [ ] `src/services/tutorialService.js`
- [ ] `src/services/helpContentService.js`

#### Integration Services:
- [ ] `src/services/whoDigitalLibraryService.js`
- [ ] `src/services/bugReportService.js`
- [ ] `src/services/issueTrackingService.js`
- [ ] `src/services/githubActionsService.js`

#### Utility Services:
- [ ] `src/services/lazyFactoryService.js`
- [ ] `src/services/libraryLoaderService.js`
- [ ] `src/services/localStorageService.js`
- [ ] `src/services/profileSubscriptionService.js`
- [ ] `src/services/routingContextService.js`
- [ ] `src/services/stagingGroundService.js`

#### DAK FAQ Services:
- [ ] `src/dak/faq/engine/FAQExecutionEngine.js`
- [ ] `src/dak/faq/registry/ParameterRegistryService.js`
- [ ] `src/dak/faq/services/faqSchemaService.js`
- [ ] `src/dak/faq/storage/Storage.js`
- [ ] `src/dak/faq/types/QuestionDefinition.js`

**Acceptance Criteria:**
- [ ] All services migrated to TypeScript
- [ ] Service APIs fully typed
- [ ] Service tests updated and passing
- [ ] Integration tests validating service interactions
- [ ] Documentation updated

---

### Phase 8: Test Migration 📋 PLANNED

**Status**: Planned  
**Timeline**: 3-4 weeks  
**Priority**: LOW  
**Depends on**: Phase 7 completion

**Objectives:**
- [ ] Convert all test files to TypeScript
- [ ] Update test configurations for TypeScript
- [ ] Add type safety to test utilities
- [ ] Validate test coverage maintained

**Target Files (116 test files):**

#### Integration Tests:
- [ ] All files in `src/tests/` directory
- [ ] Component-specific test files
- [ ] Service test files
- [ ] Compliance test files

#### Test Utilities:
- [ ] Mock files in `src/services/__mocks__/`
- [ ] Test helpers and fixtures

**Technical Considerations:**
- Update Jest configuration for TypeScript
- Add `@types/jest` types
- Configure ts-jest if needed
- Update test scripts in package.json

**Acceptance Criteria:**
- [ ] All tests migrated to TypeScript
- [ ] All tests passing
- [ ] Test coverage maintained or improved
- [ ] Test performance not degraded

---

### Phase 9: Scripts Migration 📋 PLANNED

**Status**: Planned  
**Timeline**: 2-3 weeks  
**Priority**: LOW  
**Depends on**: Phase 8 completion

**Objectives:**
- [ ] Convert Node.js scripts to TypeScript
- [ ] Update build and deployment scripts
- [ ] Add type safety to script utilities
- [ ] Update script runners

**Target Files (22 script files):**

#### Build Scripts:
- [ ] `scripts/configure-repository.js`
- [ ] `scripts/verify-404.js`
- [ ] `scripts/bpmn-to-svg.js`

#### Quality Assurance Scripts:
- [ ] `scripts/check-framework-compliance.js`
- [ ] `scripts/check-github-service-compliance.js`
- [ ] `scripts/generate-qa-report.js`
- [ ] `scripts/generate-service-table.js`

#### CI/CD Scripts:
- [ ] `scripts/format-security-comment.js`
- [ ] `scripts/run-security-checks.js`
- [ ] `scripts/lib/pr-comment-manager.js`

#### Utility Scripts:
- [ ] `scripts/analyze-github-issues.js`
- [ ] `scripts/demonstrate-fix.js`
- [ ] `scripts/generate-dak-faq-docs.js`
- [ ] `scripts/generate-dak-publication-poc.js`
- [ ] `scripts/test-404-routing.js`
- [ ] `scripts/test-url-integration.js`
- [ ] `scripts/validate-pr-workflow-improvements.js`

**Technical Considerations:**
- Use ts-node or compile scripts for execution
- Update package.json scripts for TypeScript execution
- Consider keeping some scripts as JavaScript if Node.js version requires it

**Acceptance Criteria:**
- [ ] All scripts migrated to TypeScript
- [ ] Scripts execute successfully
- [ ] Script tests updated and passing
- [ ] CI/CD workflows updated for TypeScript scripts

---

### Phase 10: Final Cleanup & Validation 📋 PLANNED

**Status**: Planned  
**Timeline**: 2-3 weeks  
**Priority**: HIGH  
**Depends on**: All previous phases

**Objectives:**
- [ ] Remove all redundant JavaScript files
- [ ] Enable strict TypeScript checking
- [ ] Audit for any remaining type issues
- [ ] Update all documentation
- [ ] Final regression testing

**Tasks:**

#### Cleanup:
- [ ] Delete all `.js` and `.jsx` files that have been migrated
- [ ] Remove temporary compatibility shims
- [ ] Clean up any duplicate type definitions
- [ ] Remove unused imports

#### TypeScript Configuration:
- [ ] Enable `strict: true` in tsconfig.json
- [ ] Enable `noImplicitAny`
- [ ] Enable `strictNullChecks`
- [ ] Enable `strictFunctionTypes`
- [ ] Configure `noUnusedLocals` and `noUnusedParameters`

#### Documentation Updates:
- [ ] Update README.md with TypeScript-first approach
- [ ] Update CONTRIBUTING.md with TypeScript guidelines
- [ ] Update all code comments and JSDoc
- [ ] Update developer onboarding documentation
- [ ] Update Copilot instructions with TypeScript policy

#### Testing & Validation:
- [ ] Run full test suite
- [ ] Perform manual testing of all features
- [ ] Validate build performance
- [ ] Check bundle size impact
- [ ] Test in all supported browsers

#### CI/CD Updates:
- [ ] Update GitHub Actions workflows for TypeScript
- [ ] Add TypeScript linting to CI
- [ ] Add type checking to PR checks
- [ ] Update deployment workflows

**Acceptance Criteria:**
- [ ] Zero JavaScript files in src/ directory (except approved exceptions)
- [ ] All TypeScript strict checks passing
- [ ] All tests passing
- [ ] Documentation complete and accurate
- [ ] CI/CD fully updated
- [ ] No performance regressions
- [ ] Stakeholder approval received

---

## Documentation Updates

### Files to Update

1. **README.md**
   - [ ] Add JavaScript usage policy to main documentation
   - [ ] Update "TypeScript Migration" section with current status
   - [ ] Add note about approval requirement for JavaScript
   - [ ] Update development workflow for TypeScript

2. **CONTRIBUTING.md**
   - [ ] Add TypeScript-first policy
   - [ ] Document JavaScript approval process
   - [ ] Update code style guidelines for TypeScript
   - [ ] Add TypeScript best practices

3. **.github/copilot-instructions.md**
   - [ ] Add TypeScript policy to Copilot instructions
   - [ ] Update code generation guidelines
   - [ ] Add approval requirement for JavaScript files
   - [ ] Document TypeScript as default for all new code

4. **TYPESCRIPT_MIGRATION.md**
   - [ ] Update with detailed phase checklists
   - [ ] Add current progress tracking
   - [ ] Document migration decisions and rationale
   - [ ] Add troubleshooting guide for migration issues

### Documentation Policy

All documentation must include:
- Clear statement that TypeScript is the default
- JavaScript approval requirement
- Link to this migration plan
- Contact information for approval requests

---

## Technical Guidelines

### TypeScript Configuration

**Current tsconfig.json settings:**
- Target: ES2020
- Module: ESNext
- JSX: react-jsx
- Strict: false (to be enabled in Phase 10)
- Allow JS: true (for gradual migration)

**Phase 10 target settings:**
- Strict: true
- NoImplicitAny: true
- StrictNullChecks: true
- StrictFunctionTypes: true

### Migration Best Practices

1. **File Naming**
   - `.js` → `.ts` for non-React modules
   - `.jsx` → `.tsx` for React components
   - Keep test file extensions consistent

2. **Type Safety**
   - Start with permissive types, gradually strengthen
   - Use interfaces for object shapes
   - Use type aliases for unions and complex types
   - Prefer type inference where clear

3. **JSON Schema Integration**
   - Export all types and interfaces for schema generation
   - Run `npm run generate-schemas` after type changes
   - Use `RuntimeValidationService` for data validation
   - Add JSDoc comments for better schema documentation
   - Test generated schemas with sample data

4. **OpenAPI Documentation**
   - Document all service methods with OpenAPI JSDoc annotations
   - Include request/response examples
   - Document error responses and status codes
   - Use standard HTTP semantics
   - Keep API documentation in sync with implementation

5. **Import Updates**
   - Update imports to use `.ts`/`.tsx` extensions in type definitions
   - Ensure backward compatibility during migration
   - Use named imports for better tree-shaking

6. **Testing**
   - Test each migrated file thoroughly
   - Maintain or improve test coverage
   - Add type-specific tests where valuable
   - Validate JSON schemas with test data

7. **Documentation**
   - Update JSDoc comments to TypeScript style
   - Document complex types
   - Add examples for type usage
   - Include OpenAPI annotations for APIs

### Common Migration Patterns

**Function Migration:**
```typescript
// Before (JavaScript)
export function processData(data) {
  return data.map(item => item.value);
}

// After (TypeScript)
export function processData(data: Array<{value: string}>): string[] {
  return data.map(item => item.value);
}
```

**Component Migration:**
```typescript
// Before (JavaScript)
export default function MyComponent({ title, onSave }) {
  return <div>{title}</div>;
}

// After (TypeScript)
interface MyComponentProps {
  title: string;
  onSave: (data: unknown) => void;
}

export default function MyComponent({ title, onSave }: MyComponentProps) {
  return <div>{title}</div>;
}
```

**Service Migration:**
```typescript
// Before (JavaScript)
export const myService = {
  async fetchData(id) {
    // implementation
  }
};

// After (TypeScript)
import { DataResponse } from '../types/core';

export const myService = {
  async fetchData(id: string): Promise<DataResponse> {
    // implementation
  }
};
```

---

## Troubleshooting

### Common Issues

#### Issue: TypeScript compiler errors in existing code
**Solution**: Use `// @ts-ignore` or `// @ts-expect-error` temporarily, document for future fix

#### Issue: Missing type definitions for libraries
**Solution**: Install `@types/` packages or create custom `.d.ts` files

#### Issue: Build performance degradation
**Solution**: Configure incremental compilation, use `skipLibCheck: true`

#### Issue: Test failures after migration
**Solution**: Update Jest configuration, ensure test types are correct

---

## Progress Tracking

### Overall Progress: 10% Complete

- ✅ Phase 1: Foundation & Setup - 100%
- ✅ Phase 2: Core Infrastructure - 100%
- ✅ Phase 3: Service Migration - 100% (partial)
- 📋 Phase 4: Utility & Config Migration - 0%
- 📋 Phase 5: Core App & Context Migration - 0%
- 📋 Phase 6: Component Migration - 0%
- 📋 Phase 7: Service Layer Migration - 0%
- 📋 Phase 8: Test Migration - 0%
- 📋 Phase 9: Scripts Migration - 0%
- 📋 Phase 10: Final Cleanup & Validation - 0%

### Key Metrics

- **Files Migrated**: 11 / 297 (3.7%)
- **Services Migrated**: 3 / 36 (8.3%)
- **Components Migrated**: 1 / 97 (1.0%) (LanguageSelector.tsx)
- **Tests Migrated**: 0 / 116 (0%)
- **Scripts Migrated**: 0 / 22 (0%)

---

## Approval and Exceptions

### Pre-Approved JavaScript Files

The following files are approved to remain as JavaScript:
1. **.eslintrc.js** - ESLint requires CommonJS format
2. **craco.config.js** - Create React App override requires CommonJS format

**Justification**: These configuration files must use CommonJS `module.exports` syntax, which is not compatible with TypeScript's ESM output in this context.

### Requesting JavaScript Approval

To request approval for a new JavaScript file:

1. Create an issue with title: "JavaScript Approval Request: [filename]"
2. Include in the issue:
   - Technical reason why TypeScript cannot be used
   - Alternative solutions considered
   - Estimated effort to convert to TypeScript in the future
   - Impact on the project if not approved
3. Tag @litlfred or designated code maintainer
4. Wait for explicit written approval before proceeding

**Template:**
```markdown
## JavaScript Approval Request

**File**: `path/to/file.js`

**Reason**: [Technical reason why TypeScript cannot be used]

**Alternatives Considered**:
- [Alternative 1]
- [Alternative 2]

**Future Migration Plan**: [How this could be migrated to TypeScript later]

**Impact**: [What happens if not approved]

**Requester**: @username
```

---

## Support and Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [SGEX TypeScript Migration Guide](TYPESCRIPT_MIGRATION.md)

### Getting Help
- Create an issue with label `typescript-migration`
- Contact @litlfred for approval requests
- Check existing migration PRs for examples

### Useful Commands
```bash
# Type check without compilation
npm run type-check

# Type check in watch mode
npm run type-check:watch

# Generate JSON schemas from types
npm run generate-schemas

# Lint TypeScript and JavaScript
npm run lint

# Fix linting issues
npm run lint:fix
```

---

## Conclusion

This migration plan provides a comprehensive roadmap for transitioning SGEX Workbench to TypeScript. By following this phased approach, we will:

1. ✅ Improve type safety and catch errors at compile time
2. ✅ Enhance developer experience with better IDE support
3. ✅ Create self-documenting code through type definitions
4. ✅ Establish TypeScript as the standard for all future development
5. ✅ Maintain code quality and consistency across the codebase

**Next Steps:**
1. Review and approve this migration plan
2. Begin Phase 4: Utility & Config Migration
3. Track progress using this document
4. Update stakeholders regularly on migration status

**Questions or Concerns?**
Please open an issue or contact @litlfred for clarification on any aspect of this migration plan.

---

*Last Updated: 2025-01-13*  
*Document Owner: @litlfred*  
*Status: Active - In Progress*
