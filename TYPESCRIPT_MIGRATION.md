# TypeScript Migration Guide

## Overview

This document outlines the phased TypeScript migration strategy for the SGEX Workbench React application. The migration follows an incremental approach to minimize disruption while gradually improving type safety and code quality.

**📋 For the complete migration plan with detailed checklists and policy information, see [TYPESCRIPT_MIGRATION_PLAN.md](TYPESCRIPT_MIGRATION_PLAN.md).**

**🔒 TypeScript Policy**: TypeScript is the default for all new and migrated code. Future use of JavaScript files requires explicit approval from a code maintainer (@litlfred).

**📊 JSON Schema & OpenAPI Required**: All TypeScript types must be exported for JSON Schema generation, and all APIs must be documented with OpenAPI specifications.

<!-- Build retry test: 2025-01-12 -->

## Migration Strategy

### Phase 1: Foundation & Setup ✅ COMPLETED

**Objectives:**
- Install TypeScript and related dependencies
- Set up TypeScript configuration
- Configure ESLint for TypeScript support
- Create initial type definitions
- Set up JSON schema generation

**Completed Work:**
- ✅ Installed TypeScript 5.7.3 and related packages
- ✅ Created `tsconfig.json` with appropriate configuration
- ✅ Updated ESLint configuration for TypeScript support
- ✅ Created core type definitions in `src/types/core.ts`
- ✅ Implemented `RuntimeValidationService` for AJV + TypeScript integration
- ✅ Set up automated JSON schema generation
- ✅ Created comprehensive test suite for new services

**Dependencies Added:**
```json
{
  "typescript": "5.7.3",
  "@types/react": "^18.x",
  "@types/react-dom": "^18.x", 
  "@types/node": "^20.x",
  "@types/jest": "^29.x",
  "typescript-json-schema": "^0.65.1",
  "ts-json-schema-generator": "^2.3.0",
  "@typescript-eslint/parser": "^5.62.0",
  "@typescript-eslint/eslint-plugin": "^5.62.0"
}
```

### Phase 2: Core Infrastructure ✅ COMPLETED

**Objectives:**
- Convert utility functions to TypeScript
- Migrate core services to TypeScript  
- Add TypeScript definitions for external APIs
- Implement JSON Schema generation framework
- Set up runtime validation with AJV + TypeScript

**Completed Work:**
- ✅ Migrated all core utilities (`logger.ts`, `schemaGenerator.ts`, `concurrency.ts`, `navigationUtils.ts`, `routeUtils.ts`)
- ✅ Created comprehensive interoperability testing framework
- ✅ Validated JavaScript/TypeScript integration with 9 passing tests
- ✅ Resolved all TypeScript compilation blockers (76 → 0 errors)

**Timeline:** Completed in Phase 2

### Phase 3: Service Migration ✅ COMPLETED

**Objectives:**
- Migrate core services to TypeScript
- Implement service-specific type definitions
- Ensure backward compatibility with existing JavaScript code
- Create comprehensive integration testing

**Completed Work:**
- ✅ `src/services/repositoryCacheService.js` → `repositoryCacheService.ts` - Repository caching with type safety
- ✅ `src/services/secureTokenStorage.js` → `secureTokenStorage.ts` - Secure token storage with validation
- ✅ `src/services/githubService.js` → `githubService.ts` - GitHub API service foundation (authentication & user management)
- ✅ Enhanced core type definitions with service-specific interfaces
- ✅ Created Phase 3 integration test suite with 11 passing tests
- ✅ Maintained full backward compatibility with existing JavaScript imports

**Current Status:** Phase 3 Complete - Core Services Migrated

**TypeScript Files:** 11 total (3.5% of codebase)

### Phase 4: Component Migration (📋 READY TO BEGIN)

**Objectives:**
- Convert shared components and frameworks
- Migrate DAK-specific components
- Update React components with proper typing
- Phase out existing JS prototype code

**Target Files:**
- `src/components/framework/` - Page framework components
- `src/components/DAKDashboard.js` - Main dashboard
- `src/components/LandingPage.js` - Landing page
- `src/components/BPMNEditor.js` - BPMN editing components
- High-usage shared components

**Timeline:** 4-6 weeks

### Phase 5: Testing & Documentation (📋 PLANNED)

**Objectives:**
- Update test configurations for TypeScript
- Migrate test files to TypeScript
- Update all documentation
- Set up automated JSON schema publishing

**Target Files:**
- `src/tests/` - All test files
- Documentation updates
- Build process improvements

**Timeline:** 2-3 weeks

### Phase 6: Final Migration (📋 PLANNED)

**Objectives:**
- Complete remaining file conversions
- Enable strict TypeScript checking  
- Final validation and cleanup
- Update deployment workflows

**Timeline:** 2-3 weeks

## Current Migration Status

### Progress Overview
- **Phase 1: Foundation** ✅ **COMPLETED** (100%)
- **Phase 2: Utilities** ✅ **COMPLETED** (100%) 
- **Phase 3: Services** ✅ **COMPLETED** (100%)
- **Phase 4: Components** 📋 **READY TO BEGIN** (0%)
- **Phase 5: Testing & Documentation** 📋 **PLANNED** (0%)
- **Phase 6: Final Migration** 📋 **PLANNED** (0%)

### File Migration Statistics
- **Total TypeScript Files**: 11 (3.5% of codebase)
- **Core Services Migrated**: 3/3 priority services
- **Utilities Migrated**: 5/5 core utilities  
- **Type Definitions**: Comprehensive interface coverage
- **Integration Tests**: 20 total tests passing (9 Phase 2 + 11 Phase 3)

### Ready for Next Phase
Phase 4 (Component Migration) can now begin with a solid foundation:
- ✅ Complete type safety infrastructure
- ✅ Runtime validation framework
- ✅ Service layer fully migrated
- ✅ Comprehensive testing coverage
- ✅ Full backward compatibility maintained

## Technical Implementation

### Type Definitions

Core types are defined in `src/types/core.ts` and include:

- **GitHub API Types**: `GitHubUser`, `GitHubRepository`, `GitHubBranch`
- **DAK Types**: `SushiConfig`, `DAKRepository`, `DAKValidationResult`  
- **Authentication Types**: `AuthenticationState`, `TokenValidationResult`
- **Cache Types**: `CacheEntry`, `CacheStatistics`
- **Validation Types**: `ValidationResult`, `ValidationError`, `RuntimeValidationConfig`

### Runtime Validation Framework

The `RuntimeValidationService` provides:

- **Type-safe validation**: Validate JSON data against TypeScript-generated schemas
- **AJV integration**: Uses AJV for robust JSON schema validation
- **Custom formats**: GitHub-specific validation formats
- **Batch validation**: Validate arrays of data efficiently
- **Async support**: Promise-based validation for workflows

**Usage Example:**
```typescript
import { runtimeValidator, validateAndCast } from './services/runtimeValidationService';
import { GitHubUser } from './types/core';

// Register a schema
const userSchema = { /* JSON Schema */ };
runtimeValidator.registerSchema('GitHubUser', userSchema);

// Validate and cast data
const user = validateAndCast<GitHubUser>('GitHubUser', userData);
```

### JSON Schema Generation

Automated schema generation from TypeScript types:

```bash
# Generate schemas
npm run generate-schemas

# Type check without compilation
npm run type-check

# Watch mode for development  
npm run type-check:watch
```

Generated schemas are saved to `public/docs/schemas/` and include:
- Individual type schemas
- Combined schema file
- Type index for easy imports

### Build Integration

TypeScript is integrated into the build process:

- **Pre-build**: Type checking and schema generation
- **Development**: Hot reload with type checking
- **CI/CD**: Automated validation and schema publishing

## File Naming Conventions

- **TypeScript files**: `.ts` for modules, `.tsx` for React components
- **Gradual migration**: Keep `.js` files until conversion is complete
- **Test files**: `.test.ts` or `.test.tsx` for TypeScript tests
- **Type definitions**: `.d.ts` for pure type definitions

## Migration Guidelines

### Converting JavaScript to TypeScript

1. **Rename file**: `.js` → `.ts` (or `.tsx` for React components)
2. **Add type imports**: Import relevant types from `src/types/`
3. **Add function signatures**: Define parameter and return types
4. **Handle any types**: Gradually replace `any` with specific types
5. **Update tests**: Ensure tests work with new types

### Best Practices

- **Start strict**: Use `strict: false` initially, enable gradually
- **Incremental typing**: Add types incrementally, avoid big rewrites
- **Leverage inference**: Use TypeScript's type inference when possible
- **Document types**: Add JSDoc comments for complex types
- **Test coverage**: Maintain test coverage during migration

### Common Patterns

**Service Conversion:**
```typescript
// Before (JavaScript)
export const githubService = {
  async getUser(token) {
    // implementation
  }
};

// After (TypeScript)
import { GitHubUser, ServiceResponse } from '../types/core';

export const githubService = {
  async getUser(token: string): Promise<ServiceResponse<GitHubUser>> {
    // implementation
  }
};
```

**Component Conversion:**
```typescript
// Before (JavaScript)  
export default function MyComponent({ user, onSave }) {
  // implementation
}

// After (TypeScript)
import { GitHubUser } from '../types/core';

interface MyComponentProps {
  user: GitHubUser;
  onSave: (user: GitHubUser) => void;
}

export default function MyComponent({ user, onSave }: MyComponentProps) {
  // implementation  
}
```

## Troubleshooting

### Common Issues

**1. Module Resolution Errors**
- Update `tsconfig.json` paths
- Check import statements
- Verify file extensions

**2. Type Errors in Tests**
- Update Jest configuration
- Add `@types/jest` for test types
- Mock TypeScript modules properly

**3. Build Performance**
- Use `tsc --noEmit` for type checking only
- Configure incremental compilation
- Exclude unnecessary files

**4. External Library Types**
- Install `@types/` packages for libraries
- Create custom type definitions if needed
- Use module declaration for untyped libraries

### Getting Help

- **Documentation**: Check TypeScript handbook and React TypeScript docs
- **Community**: React TypeScript community and discussions
- **Tools**: Use IDE TypeScript support for real-time feedback

## Current Status

### ✅ Completed (Phase 1)
- TypeScript configuration and tooling
- Core type definitions  
- Runtime validation framework
- JSON schema generation
- Initial test coverage

### 🔄 In Progress (Phase 2)
- Utility functions migration
- Core services conversion
- Enhanced type definitions

### 📋 Planned
- Component migration (Phase 3)
- Test migration (Phase 4)  
- Final cleanup (Phase 5)

## Benefits Achieved

- **Type Safety**: Compile-time error detection
- **Better IDE Support**: IntelliSense, refactoring, navigation
- **Documentation**: Self-documenting APIs through types
- **Runtime Validation**: JSON Schema + TypeScript integration
- **Schema Generation**: Automated schema publishing

## Next Steps

1. Continue Phase 2: Core services migration
2. Set up CI/CD integration for type checking
3. Begin component migration planning
4. Update developer documentation
5. Train team on TypeScript best practices