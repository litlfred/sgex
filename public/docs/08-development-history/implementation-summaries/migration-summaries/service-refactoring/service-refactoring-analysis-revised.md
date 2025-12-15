# Service Refactoring Analysis - Revised for DAK-Centric Architecture

This comprehensive analysis examines all services in both `src/services` and `services` directories to prepare for consolidation based on WHO SMART Guidelines DAK logical model and npm package isolation requirements.

## Executive Summary

Based on feedback, this revised analysis focuses on:

1. **DAK-Centric Architecture**: All services organized around the WHO SMART Guidelines DAK logical model
2. **Business Logic Separation**: Clear separation of DAK business logic from web services and MCP services
3. **NPM Package Isolation**: Each service category as its own npm package
4. **Core DAK Package**: Central package containing all DAK business logic and validation
5. **OpenAPI/JSON Schema Integration**: Proper schema validation throughout

## DAK Logical Model Integration

The WHO SMART Guidelines DAK logical model defines:
- **Core DAK metadata**: id, name, title, description, version, status, publicationUrl, license, copyrightYear, publisher
- **9 DAK Components**: healthInterventions, personas, userScenarios, businessProcesses, dataElements, decisionLogic, indicators, requirements, testScenarios

## Service Classification by Business Logic vs. Infrastructure

### Core DAK Business Logic Services (for `@sgex/dak-core` package)

| Service | Description | DAK Component Mapping | Refactor Required |
|---------|-------------|----------------------|-------------------|
| `dakComplianceService.js` | DAK component validation and compliance checking | All components | **Split**: Extract business validation from UI feedback |
| `dakValidationService.js` | DAK repository structure validation | DAK metadata validation | **Split**: Extract core validation from web UI |
| `actorDefinitionService.js` | Actor definitions based on FHIR Persona logical model | personas (Generic Personas) | **Move to core**: Pure business logic |
| `dataAccessLayer.js` | Asset management and DAK component access | All components | **Split**: Extract DAK operations from UI state |
| `faqSchemaService.ts` | FAQ question schemas and validation | All components (questions about) | **Move to core**: Schema validation logic |
| `runtimeValidationService.ts` | Runtime JSON schema validation | All components | **Move to core**: Pure validation logic |

### Web Service Infrastructure (for `@sgex/web-services` package)

| Service | Description | Web Concern | Extract to Core |
|---------|-------------|-------------|-----------------|
| `componentRouteService.js` | React routing for DAK components | UI routing | DAK component metadata |
| `routingContextService.js` | URL processing and navigation state | UI state management | Repository/branch context |
| `helpContentService.js` | Page-specific help topics | UI help system | DAK documentation structure |
| `tutorialService.js` | Branching tutorial support | UI tutorials | DAK learning paths |
| `bookmarkService.js` | User bookmarks in localStorage | UI state | DAK asset references |
| `branchContextService.js` | DAK branch context in session storage | UI state | DAK branch metadata |
| `bugReportService.js` | Bug reporting with screenshots | UI tooling | DAK context extraction |

### Data Storage & Caching (for `@sgex/storage-services` package)

| Service | Description | Storage Concern | Extract to Core |
|---------|-------------|-----------------|-----------------|
| `localStorageService.js` | Local file changes management | Browser storage | DAK change validation |
| `profileSubscriptionService.js` | Profile subscriptions management | User preferences | DAK organization metadata |
| `repositoryCacheService.js/.ts` | Repository discovery caching | Performance | DAK compatibility detection |
| `branchListingCacheService.js` | Branch and PR data caching | Performance | DAK branch validation |
| `cacheManagementService.js` | Centralized cache management | Performance | DAK-specific cache keys |

### Version Control Integration (for `@sgex/vcs-services` package)

| Service | Description | VCS Concern | Extract to Core |
|---------|-------------|-------------|-----------------|
| `githubService.js` | **SPLIT REQUIRED** GitHub API operations | Git operations | DAK repository operations |
| `githubActionsService.js` | GitHub Actions workflow management | CI/CD operations | DAK validation workflows |
| `secureTokenStorage.js/.ts` | Secure token storage with encryption | Authentication | None (pure infrastructure) |
| `stagingGroundService.js` | Local changes before GitHub commit | VCS staging | DAK component validation |
| `issueTrackingService.js` | **SPLIT REQUIRED** Issue/PR tracking | Issue management | DAK issue templates |

### External Service Integration (for `@sgex/integration-services` package)

| Service | Description | Integration Concern | Extract to Core |
|---------|-------------|-------------------|-----------------|
| `whoDigitalLibraryService.js` | WHO digital library integration | External API | DAK publication metadata |
| `userAccessService.js` | User type and access level management | Access control | DAK permission validation |
| `documentationService.js` | Documentation file discovery | File system | DAK documentation structure |

### Backend API Services (separate npm packages)

| Package | Services | Description |
|---------|----------|-------------|
| `@sgex/dak-faq` | services/dak-faq-mcp/* | AI-powered FAQ system for DAK components |
| `@sgex/dak-publication` | services/dak-publication-api/* | Publication generation from DAK content |

### System Utilities (for `@sgex/utils` package)

| Service | Description | Utility Type |
|---------|-------------|--------------|
| `libraryLoaderService.js` | Lazy loading of JavaScript libraries | Performance optimization |
| `lazyFactoryService.js` | Factory functions for lazy-loaded instances | Instance management |

## Missing Documentation Analysis

Services requiring documentation updates:

| Service | Current Status | Required Documentation |
|---------|---------------|----------------------|
| `services/dak-publication-api/src/middleware/auth.ts` | ❌ Missing | Authentication middleware for publication API |
| `services/dak-publication-api/src/middleware/errorHandler.ts` | ❌ Missing | Error handling middleware for Express routes |
| `services/dak-publication-api/src/routes/health.ts` | ❌ Missing | Health check endpoint implementation |
| `services/dak-publication-api/src/server.ts` | ❌ Missing | Express server setup and configuration |
| `services/dak-publication-api/src/services/contentService.ts` | ❌ Missing | Content management service for publications |
| `services/dak-publication-api/src/services/integrationService.ts` | ❌ Missing | Integration service for external APIs |
| `services/dak-publication-api/src/services/publicationService.ts` | ❌ Missing | Core publication generation service |
| `services/dak-publication-api/src/services/templateService.ts` | ❌ Missing | Template management for publications |
| `services/dak-publication-api/src/services/variableService.ts` | ❌ Missing | Variable resolution for publication templates |
| `services/dak-publication-api/src/types/api.ts` | ❌ Missing | TypeScript API type definitions |
| `services/dak-publication-api/src/types/template.ts` | ❌ Missing | TypeScript template type definitions |
| `src/services/githubService.js` | ❌ Missing | Comprehensive GitHub API integration service |
| `src/services/bugReportService.js` | ❌ Missing | Bug reporting service with context capture |

## JSON Schema and OpenAPI Requirements

### Current Schema Usage Assessment

| Service | Schema Type | Current Status | Required Action |
|---------|-------------|---------------|-----------------|
| `dakComplianceService.js` | JSON Schema | ✅ Uses AJV validation | Integrate DAK component schemas |
| `runtimeValidationService.ts` | JSON Schema | ✅ Runtime validation | Add DAK-specific schemas |
| `faqSchemaService.ts` | JSON Schema | ✅ Question schemas | Align with DAK component schemas |
| `services/dak-faq-mcp/*` | OpenAPI | ✅ Generated schemas | Ensure DAK component coverage |
| `services/dak-publication-api/*` | OpenAPI | ❌ Needs implementation | Add comprehensive API documentation |

### Required Schema Integration

1. **DAK Core Schema**: https://worldhealthorganization.github.io/smart-base/StructureDefinition-DAK.schema.json
2. **DAK API Documentation**: https://worldhealthorganization.github.io/smart-base/dak-api.html
3. **Component-Specific Schemas**: Each of the 9 DAK components needs dedicated schemas

## NPM Package Architecture

### Package Dependencies

```
@sgex/dak-core (no dependencies on other SGEX packages)
├── DAK logical model types
├── DAK component validation
├── DAK business logic operations
└── JSON schema validation

@sgex/web-services (depends on @sgex/dak-core)
├── React components
├── UI routing
├── Help systems
└── Web-specific utilities

@sgex/vcs-services (depends on @sgex/dak-core)
├── Git operations
├── GitHub integration
├── Staging and commit logic
└── VCS workflow management

@sgex/storage-services (depends on @sgex/dak-core)
├── Browser storage
├── Caching mechanisms
├── Local data management
└── Performance optimization

@sgex/integration-services (depends on @sgex/dak-core)
├── External API clients
├── WHO service integration
├── Third-party connectors
└── Authentication management

@sgex/utils (no dependencies)
├── Lazy loading
├── Factory patterns
├── Common utilities
└── Helper functions

@sgex/dak-faq (depends on @sgex/dak-core)
├── MCP server implementation
├── FAQ execution engine
├── Question loading system
└── AI integration

@sgex/dak-publication (depends on @sgex/dak-core)
├── Publication generation
├── Template management
├── Content processing
└── Variable resolution
```

## Critical Service Splits Required

### 1. Split githubService.js (77 methods)

**Current Issues**: Massive monolithic service mixing concerns

**Proposed Split**:
```
@sgex/dak-core:
├── dakGitHubOperations.js (DAK-specific GitHub operations)
│   ├── validateDAKRepository()
│   ├── getDAKComponents()
│   ├── validateDAKStructure()
│   └── extractDAKMetadata()

@sgex/vcs-services:
├── gitHubApiClient.js (Low-level GitHub API)
│   ├── authenticate()
│   ├── getRepository()
│   ├── createCommit()
│   └── manageBranches()
├── gitHubPermissions.js (Permission checking)
│   ├── checkRepositoryAccess()
│   ├── validateTokenPermissions()
│   └── checkWriteAccess()

@sgex/web-services:
└── gitHubUIHelpers.js (UI-specific helpers)
    ├── formatRepositoryDisplay()
    ├── generateRepositoryLinks()
    └── handleUIErrorStates()
```

### 2. Split issueTrackingService.js (28 methods)

**Current Issues**: Mixes tracking logic with UI state management

**Proposed Split**:
```
@sgex/dak-core:
├── dakIssueClassification.js (DAK-specific issue logic)
│   ├── classifyDAKIssue()
│   ├── validateDAKIssueTemplate()
│   └── extractDAKContext()

@sgex/integration-services:
├── issueDataManager.js (Issue data operations)
│   ├── syncWithGitHub()
│   ├── manageIssueFilters()
│   └── handleIssueDiscovery()

@sgex/web-services:
└── issueUIManager.js (UI state management)
    ├── manageUIState()
    ├── handleDisplayFiltering()
    └── formatIssueDisplay()
```

## Phased Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
**Objective**: Establish core DAK package and basic structure

1. **Create @sgex/dak-core package**
   - Set up npm package structure
   - Integrate WHO SMART Guidelines DAK schema
   - Create DAK logical model TypeScript types
   - Implement basic DAK validation

2. **Extract pure business logic services**
   - Move `actorDefinitionService.js` business logic
   - Move `runtimeValidationService.ts` 
   - Extract DAK validation core from `dakComplianceService.js`

3. **Set up JSON Schema infrastructure**
   - Integrate DAK component schemas
   - Create schema validation utilities
   - Set up runtime validation pipeline

### Phase 2: Service Package Creation (Weeks 3-4)
**Objective**: Create specialized service packages

1. **Create @sgex/utils package**
   - Move `libraryLoaderService.js`
   - Move `lazyFactoryService.js`
   - No dependencies on other SGEX packages

2. **Create @sgex/storage-services package**
   - Move and refactor storage-related services
   - Extract DAK-specific logic to core package
   - Implement DAK-aware caching

3. **Create @sgex/integration-services package**
   - Move external service integrations
   - Extract DAK-specific metadata operations
   - Add missing documentation

### Phase 3: Critical Service Splits (Weeks 5-6)
**Objective**: Split monolithic services

1. **Split githubService.js**
   - Create DAK-specific GitHub operations in core
   - Move API client to VCS services
   - Create UI helpers for web services
   - Ensure all 77 methods are properly categorized

2. **Split issueTrackingService.js**
   - Extract DAK issue classification to core
   - Move data operations to integration services
   - Move UI state to web services

3. **Add comprehensive documentation**
   - Document all previously undocumented services
   - Add OpenAPI specifications where missing
   - Create JSON schemas for all data types

### Phase 4: VCS and Web Services (Weeks 7-8)
**Objective**: Complete major service packages

1. **Create @sgex/vcs-services package**
   - Move GitHub API client (from split)
   - Move `githubActionsService.js`
   - Move `stagingGroundService.js`
   - Extract DAK operations to core

2. **Create @sgex/web-services package**
   - Move all React/UI-specific services
   - Extract DAK business logic to core
   - Implement proper separation of concerns

### Phase 5: Backend Service Refactoring (Weeks 9-10)
**Objective**: Refactor backend services for DAK integration

1. **Refactor @sgex/dak-faq (renamed from dak-faq-ai-services)**
   - Integrate with DAK core package
   - Add comprehensive OpenAPI documentation
   - Ensure DAK component schema compliance

2. **Refactor @sgex/dak-publication**
   - Add missing documentation to all services
   - Integrate with DAK core package
   - Implement proper OpenAPI specifications
   - Add JSON schema validation

### Phase 6: Integration and Testing (Weeks 11-12)
**Objective**: Ensure all packages work together

1. **Integration testing**
   - Test package dependencies
   - Verify DAK core integration
   - Validate schema compliance

2. **Documentation completion**
   - Complete all missing service documentation
   - Create package-level documentation
   - Add migration guides

3. **Backward compatibility**
   - Ensure existing functionality preserved
   - Create compatibility layers where needed
   - Plan deprecation of old interfaces

## Success Criteria

### Technical Requirements
- ✅ All services properly categorized into npm packages
- ✅ @sgex/dak-core contains only DAK business logic
- ✅ Clear separation of web/MCP services from business logic
- ✅ All services have comprehensive documentation
- ✅ JSON Schema validation throughout
- ✅ OpenAPI documentation for all APIs
- ✅ WHO SMART Guidelines DAK model integration

### Package Isolation
- ✅ No circular dependencies between packages
- ✅ @sgex/dak-core has no dependencies on other SGEX packages
- ✅ Clear dependency hierarchy established
- ✅ Each package can be independently versioned and deployed

### Documentation Standards
- ✅ All services have descriptive comments
- ✅ All APIs have OpenAPI specifications
- ✅ All data types have JSON schemas
- ✅ All packages have comprehensive README files

## Risk Mitigation

### Breaking Changes
- Implement compatibility layers during transition
- Use semantic versioning for all packages
- Provide migration guides for each breaking change

### Dependency Management
- Carefully manage package dependencies
- Avoid circular dependencies through design
- Use peer dependencies where appropriate

### Testing Coverage
- Maintain comprehensive test coverage during refactoring
- Test package boundaries and interfaces
- Validate DAK schema compliance

*Analysis revised on: 2025-01-22T12:30:00.000Z*
*Based on WHO SMART Guidelines DAK logical model: https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/DAK.fsh*