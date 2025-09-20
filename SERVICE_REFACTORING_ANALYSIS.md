# Service Refactoring Analysis

This comprehensive analysis examines all services in both `src/services` and `services` directories to prepare for consolidation.

## Complete Service Analysis

| Relative Path | Description | Methods | Service Category | Split Assessment |
|---------------|-------------|---------|------------------|------------------|
| services/dak-faq-mcp/index.ts | DAK FAQ MCP Server Local-only server providing FAQ functionality for DAK repositories | No methods found | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/mcp-server.ts | MCP (Model Context Protocol) Server Implementation for DAK FAQ Provides standard MCP protocol support alongside existing REST API | switch, start, stop | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/questions/asset/dmn-tables/executor.ts | Decision Table Inputs Question Executor Analyzes DMN files to extract decision table input requirements | No methods found | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/questions/dak/name/executor.ts | DAK Name Question Executor Extracts the DAK name from sushi-config.yaml | No methods found | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/questions/dak/version/executor.ts | DAK Version Question Executor Extracts the DAK version from sushi-config.yaml | No methods found | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/server/routes/catalog.ts | FAQ Questions Catalog Route Provides metadata about available FAQ questions | getRoute, generateOpenAPISchema | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/server/routes/dak-components.ts | DAK Components Route Provides access to DAK component information (valuesets, decision tables, etc.) | getRoute | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/server/routes/execute.ts | FAQ Questions Execute Route Handles batch execution of FAQ questions | postRoute | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/server/routes/schema.ts | FAQ Schema Route Provides access to question schemas and definitions | getRoute, postRoute | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/server/storage/LocalStorageImpl.ts | Local Storage Implementation for MCP Server Provides file system access for DAK FAQ operations | readFile, fileExists, listFiles | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/server/util/FAQExecutionEngineLocal.ts | Local FAQ Execution Engine for MCP Server Uses modular question loading system with i18n support | initialize, getCatalog, executeBatch, executeSingle, t, getQuestionSchemas, readFile, fileExists ... (9 total) | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/server/util/FAQSchemaService.ts | FAQ Schema Service Provides access to question schemas for the React application | getAllSchemas, getQuestionSchema, getAllQuestions, getQuestion, getQuestionsByLevel, getQuestionsByComponentType, getQuestionsByAssetType, validateQuestionParameters ... (9 total) | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/server/util/QuestionLoader.ts | Question Loader for Modular FAQ System Dynamically loads question definitions and executors from the questions directory | loadAllQuestions, getQuestion, getAllQuestions, getQuestionSchemas | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/server/util/validation.ts | Request validation utilities for MCP server | validateExecuteRequest, isValidQuestionId, isValidLocale, isValidRepositoryPath | dak-faq-ai-services | No split needed - Backend service |
| services/dak-faq-mcp/types.ts | TypeScript type definitions for DAK FAQ MCP Server | No methods found | dak-faq-ai-services | No split needed - Backend service |
| services/dak-publication-api/src/index.ts | Main entry point for the application | No methods found | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/middleware/auth.ts | X - No description found | authMiddleware | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/middleware/errorHandler.ts | X - No description found | errorHandler | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/middleware/validation.ts | Skip validation for non-API routes | validationMiddleware | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/routes/content.ts | GET /api/content/user/:userId - Get user content | getRoute, putRoute, postRoute | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/routes/health.ts | X - No description found | getRoute | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/routes/integration.ts | POST /api/integrations/mcp/execute - Execute MCP service calls | postRoute, getRoute | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/routes/publication.ts | POST /api/publication/generate - Generate publication | postRoute, getRoute, putRoute | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/routes/templates.ts | GET /api/templates - List all templates | getRoute, postRoute, putRoute, deleteRoute | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/routes/variables.ts | POST /api/variables/resolve - Resolve template variables | postRoute, getRoute | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/server.ts | X - No description found | No methods found | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/services/contentService.ts | X - No description found | getUserContent, updateUserContent, autoSaveContent, deleteUserContent, listUserContent | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/services/integrationService.ts | X - No description found | executeMCPService, executeFAQBatch, getServiceStatus, processSingleFAQQuestion, getDAKMetadata | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/services/publicationService.ts | X - No description found | generatePublication, getPublication, updatePublication, listPublications, deletePublication | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/services/templateService.ts | X - No description found | listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/services/variableService.ts | X - No description found | resolveVariables, switch, getTemplateVariables, validateVariables | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/types/api.ts | X - No description found | No methods found | dak-publication-services | No split needed - Backend service |
| services/dak-publication-api/src/types/template.ts | X - No description found | No methods found | dak-publication-services | No split needed - Backend service |
| src/services/actorDefinitionService.js | Actor Definition Service Manages actor definitions based on FHIR Persona logical model. Handles conversion to FSH (FHIR Shorthand) format and integration with staging ground. | loadSchema, generateFSH, escapeFSHString, parseFSH, validateActorDefinition, saveToStagingGround, getFromStagingGround, listStagedActors ... (11 total) | dak-authoring-tools | No split needed - Well focused |
| src/services/bookmarkService.js | Bookmark Service - Manages user bookmarks in localStorage Provides functionality to bookmark pages with context-aware titles: - DAK: {user}/{repo} for DAK pages - DAK: {user}/{repo}/{branch} for DAK pages with specific branch - {asset} in DAK: {user}/{repo}/{branch} for asset pages | getBookmarks, saveBookmarks, generateBookmarkTitle, addBookmark, removeBookmark, isBookmarked, getBookmarkByUrl, getBookmarksGroupedByPage ... (11 total) | dak-data-storage | No split needed - Well focused |
| src/services/branchContextService.js | Service for managing DAK branch context in session storage Stores selected branch per repository to maintain context during DAK editing | getRepositoryKey, getSelectedBranch, setSelectedBranch, clearRepositoryBranch, clearAllBranchContext, getBranchContext, setBranchContext, getDefaultBranchName ... (10 total) | dak-data-storage | No split needed - Well focused |
| src/services/branchListingCacheService.js | Branch Listing Cache Service Provides caching functionality for branch and pull request data | getCacheKey, isCacheValid, getCachedData, setCachedData, getCacheInfo, clearAll | dak-performance | No split needed - Well focused |
| src/services/bugReportService.js | X - No description found | ensureHtml2Canvas, _fetchTemplatesFromDirectory, _parseIssueTemplate, _getTemplateType, getDefaultTemplates, _getDefaultTemplates, _truncateConsoleOutput, _generateContextualInfo ... (17 total) | dak-development-tools | No split needed - Well focused |
| src/services/cacheManagementService.js | Cache Management Service Centralized service for managing all application cache and local storage including repository cache, branch context, staging ground, and user data | clearAllCache, clearAllStagingGrounds, clearOtherSGEXData, getCacheInfo, getUncommittedWork | dak-performance | No split needed - Well focused |
| src/services/componentRouteService.js | Lazy import Route to avoid issues during testing | createLazyComponent, SuspenseWrapper, generateDAKRoutes, generateStandardRoutes, generateLazyRoutes, getValidDAKComponents, isValidComponent | dak-navigation | Consider splitting - Route logic may mix concerns |
| src/services/dakComplianceService.js | DAK Compliance Service Provides comprehensive validation for DAK components with support for error, warning, and info levels. Designed to work in multiple environments: React client-side, command-line, and IDE integration. | initializeSchemaValidator, initializeDefaultValidators, addValidator, removeValidator, validateFile, validateStagingGround, canSave, validateXMLWellFormed ... (20 total) | dak-quality-assurance | No split needed - Well focused |
| src/services/dakValidationService.js | Service for validating WHO SMART Guidelines Digital Adaptation Kit repositories A repository is considered a valid DAK if: 1. It has a sushi-config.yaml file in the root 2. The sushi-config.yaml contains a 'dependencies' section 3. The dependencies section contains the key 'smart.who.int.base' | validateDAKRepository, checkRepositoryExists, fetchSushiConfig, validateDemoDAKRepository | dak-quality-assurance | Consider splitting - May mix UI and business logic |
| src/services/dataAccessLayer.js | Data Access Layer Comprehensive service that integrates user access, staging ground, and GitHub for a unified asset management experience across all user types. | initialize, getAsset, saveAssetLocal, saveAssetGitHub, getSaveOptions, getSaveRestrictions, switch, getStagingGroundStatus ... (14 total) | dak-version-control | No split needed - Well focused |
| src/services/documentationService.js | Documentation Service - Manages documentation file discovery and organization Provides functionality to: - Dynamically scan public/docs directory structure - Organize documentation by categories and subdirectories - Support breadcrumb navigation for subdirectories - Manage JSON schema access - Integrate with i18n for documentation titles and descriptions | getDocumentationStructure, scanDocumentationFiles, getFallbackStructure, getCategoryTitle, getDocumentId, getDocument, fetchDocumentContent, fetchSchemaContent ... (12 total) | dak-content-management | No split needed - Well focused |
| src/services/faqSchemaService.ts | FAQ Schema Service - Enhanced with TypeScript Runtime Validation This service provides access to FAQ question schemas and leverages the new TypeScript runtime validation infrastructure while preserving the manual question authoring approach. | getAllQuestionSchemas, getQuestionSchema, validateQuestionParameters, executeQuestion, getQuestionsByLevel, getQuestionsByTags, clearCache, healthCheck | dak-quality-assurance | No split needed - Well focused |
| src/services/githubActionsService.js | Service for interacting with GitHub Actions API Provides functionality to fetch workflow runs and trigger workflows | setToken, getHeaders, getWorkflowId, getLatestWorkflowRun, getAllWorkflowsForBranch, getWorkflowStatusForBranches, parseWorkflowStatus, triggerWorkflow ... (15 total) | dak-version-control | No split needed - Well focused |
| src/services/githubService.js | X - No description found | createOctokitInstance, authenticate, authenticateWithOctokit, initializeFromStoredToken, hasStoredToken, getStoredTokenInfo, checkTokenPermissions, checkRepositoryWritePermissions ... (77 total) | dak-version-control | Split recommended - Too many methods |
| src/services/githubService.ts | GitHub Service - TypeScript Implementation Provides comprehensive GitHub API integration for SGEX Workbench | authenticate, authenticateWithOctokit, initializeFromStoredToken, getAuthenticationState, validateToken, getCurrentUser, signOut | dak-version-control | No split needed - Well focused |
| src/services/helpContentService.js | Help Content Service - Provides page-specific help topics and content | getHelpTopicsForPage, getUniversalTopics, getHelpTopic, hasHelpTopics, addHelpTopicToPage, getAvailablePages, openDakIssue, switch ... (9 total) | dak-user-guidance | No split needed - Well focused |
| src/services/issueTrackingService.js | Issue Tracking Service Manages tracked issues and pull requests for authenticated users. Stores data in localStorage and syncs with GitHub API when possible. | _getStorageKey, _getStoredData, _getRepositoryFilters, _saveRepositoryFilters, _saveStoredData, _getCurrentUsername, getTrackedItems, _initializeDefaultFilters ... (28 total) | dak-version-control | Split recommended - Too many methods |
| src/services/lazyFactoryService.js | SGEX Lazy Factory Service Handles creation of configured instances for lazy-loaded libraries. This service provides: 1. Factory functions for creating pre-configured instances 2. Instance configuration with sensible defaults 3. Convenience functions for common use cases Split from lazyRouteUtils.js for better separation of concerns. | createLazyOctokit, createLazyBpmnModeler, createLazyBpmnViewer, createLazyAjv | dak-system-utilities | No split needed - Small service |
| src/services/libraryLoaderService.js | SGEX Library Loader Service Handles lazy loading of heavy JavaScript libraries to optimize initial page load performance. This service provides: 1. Lazy loading of external libraries (BPMN.js, Octokit, js-yaml, etc.) 2. Module caching to prevent repeated imports 3. Optimized imports with error handling Split from lazyRouteUtils.js for better separation of concerns. | lazyLoadOctokit, lazyLoadBpmnModeler, lazyLoadBpmnViewer, lazyLoadYaml, lazyLoadMDEditor, lazyLoadSyntaxHighlighter, lazyLoadSyntaxHighlighterStyles, lazyLoadReactMarkdown ... (13 total) | dak-system-utilities | No split needed - Well focused |
| src/services/localStorageService.js | Service for managing feature file changes in browser localStorage This allows users to edit and save feature files locally without requiring GitHub authentication | getAllLocalChanges, getLocalContent, saveLocal, removeLocal, getAllMetadata, getMetadata, hasLocalChanges, getLocalChangesCount ... (11 total) | dak-data-storage | No split needed - Well focused |
| src/services/profileSubscriptionService.js | Profile Subscription Service - Manages profile subscriptions in localStorage Provides functionality to manage profile subscriptions: - Always includes WorldHealthOrganization - Includes logged-in user when authenticated - Auto-adds users when browsing their profiles - Allows removal of profiles (except WHO and current user) | getSubscriptions, saveSubscriptions, addSubscription, removeSubscription, isSubscribed, getSubscription, ensureCurrentUserSubscribed, autoAddVisitedProfile ... (14 total) | dak-data-storage | No split needed - Well focused |
| src/services/repositoryCacheService.js | Repository Cache Service Manages caching of discovered SMART Guidelines repositories with expiry | getCacheKey, isStale, getCachedRepositories, setCachedRepositories, clearCache, clearAllCaches, getCacheInfo | dak-performance | No split needed - Well focused |
| src/services/repositoryCacheService.ts | Repository Cache Service - TypeScript Implementation Manages caching of discovered SMART Guidelines repositories with expiry | getCachedRepositories, clearCacheForOwner, clearAllCaches, getCacheStatistics, hasCacheFor, getCacheAge | dak-performance | No split needed - Well focused |
| src/services/routingContextService.js | **🚨 CRITICAL ROUTING SERVICE 🚨** Lightweight service that reads structured routing context prepared by 404.html. Replaces the heavy urlProcessorService.js with minimal parsing logic. | initialize, restoreContext, getFallbackContext, cleanURL, getBasePath, getContext | dak-navigation | No split needed - Critical service |
| src/services/runtimeValidationService.ts | Runtime Validation Service This service provides runtime validation of JSON data against TypeScript-generated JSON schemas using AJV. It serves as a bridge between TypeScript compile-time type checking and runtime data validation. | hasSchema, getRegisteredSchemas, getSchema, unregisterSchema, clearSchemas, updateConfig | dak-quality-assurance | No split needed - Well focused |
| src/services/secureTokenStorage.js | SecureTokenStorage - Secure storage for GitHub Personal Access Tokens Features: - XOR encryption using browser fingerprint-based keys - Token format validation (classic and fine-grained PATs) - Automatic token expiration (24 hours) - Secure token masking for logs and error messages | generateBrowserFingerprint, xorCipher, validateTokenFormat, maskToken, storeToken, retrieveToken, hasValidToken, clearToken ... (10 total) | dak-security-access | No split needed - Well focused |
| src/services/secureTokenStorage.ts | SecureTokenStorage - TypeScript Implementation Secure storage for GitHub Personal Access Tokens with XOR encryption | validateTokenFormat, storeToken, retrieveToken, hasValidToken, clearToken, getTokenInfo, maskToken, migrateLegacyToken | dak-security-access | No split needed - Well focused |
| src/services/stagingGroundService.js | Staging Ground Service Manages local changes to DAK components before they are committed to GitHub. Provides persistent storage, versioning, and integration interfaces for DAK editing tools. | initialize, getStorageKey, getStagingGround, createEmptyStagingGround, saveStagingGround, updateFile, removeFile, updateCommitMessage ... (20 total) | dak-authoring-tools | No split needed - Well focused |
| src/services/tutorialService.js | Enhanced Tutorial Service - Provides branching tutorial support and improved content organization | registerTutorial, getTutorial, getTutorialsForPage, getTutorialsByCategory, getCategories, processStep, validateTutorialDefinition, isTutorialApplicable ... (13 total) | dak-user-guidance | No split needed - Well focused |
| src/services/userAccessService.js | User Access Service Manages user types and access levels throughout the SGEX Workbench. Supports three user types: authenticated, unauthenticated, and demo users. | initialize, detectUserType, getUserType, getCurrentUser, isAuthenticated, isUnauthenticated, getRepositoryAccess, checkGitHubReadAccess ... (17 total) | dak-security-access | No split needed - Well focused |
| src/services/whoDigitalLibraryService.js | WHO Digital Library Service Service for interacting with the WHO digital library (iris.who.int) which uses DSpace software with Dublin Core metadata standards. | search, getItemMetadata, processSearchResults, processDublinCoreMetadata, getMetadataValue, constructItemUrl, constructDownloadUrl, getSuggestions ... (12 total) | dak-who-integration | No split needed - Well focused |

## Service Categories Summary

| Category | Service Count | Services |
|----------|---------------|----------|
| dak-authoring-tools | 2 | actorDefinitionService.js, stagingGroundService.js |
| dak-content-management | 1 | documentationService.js |
| dak-data-storage | 4 | bookmarkService.js, branchContextService.js, profileSubscriptionService.js, localStorageService.js |
| dak-development-tools | 1 | bugReportService.js |
| dak-faq-ai-services | 15 | All services under services/dak-faq-mcp/ |
| dak-navigation | 2 | componentRouteService.js, routingContextService.js |
| dak-performance | 4 | branchListingCacheService.js, cacheManagementService.js, repositoryCacheService.js, repositoryCacheService.ts |
| dak-publication-services | 18 | All services under services/dak-publication-api/ |
| dak-quality-assurance | 4 | dakComplianceService.js, dakValidationService.js, faqSchemaService.ts, runtimeValidationService.ts |
| dak-security-access | 3 | userAccessService.js, secureTokenStorage.js, secureTokenStorage.ts |
| dak-system-utilities | 2 | lazyFactoryService.js, libraryLoaderService.js |
| dak-user-guidance | 2 | helpContentService.js, tutorialService.js |
| dak-version-control | 6 | dataAccessLayer.js, githubActionsService.js, githubService.js, githubService.ts, issueTrackingService.js, stagingGroundService.js |
| dak-who-integration | 1 | whoDigitalLibraryService.js |

## Split Assessment Summary

| Split Recommendation | Count | Services |
|---------------------|-------|----------|
| **Split recommended** | 2 | githubService.js (77 methods), issueTrackingService.js (28 methods) |
| **Consider splitting** | 2 | componentRouteService.js, dakValidationService.js |
| **No split needed** | 60 | All other services |

## Consolidation Recommendations

Based on the analysis, here are the recommended consolidation steps:

### 1. Directory Structure Proposal

```
services/
├── dak-authoring-tools/
│   ├── actorDefinitionService.js
│   └── stagingGroundService.js
├── dak-content-management/
│   └── documentationService.js
├── dak-data-storage/
│   ├── bookmarkService.js
│   ├── branchContextService.js
│   ├── profileSubscriptionService.js
│   └── localStorageService.js
├── dak-development-tools/
│   └── bugReportService.js
├── dak-faq-ai-services/
│   └── [existing dak-faq-mcp structure]
├── dak-navigation/
│   ├── componentRouteService.js
│   └── routingContextService.js
├── dak-performance/
│   ├── branchListingCacheService.js
│   ├── cacheManagementService.js
│   ├── repositoryCacheService.js
│   └── repositoryCacheService.ts
├── dak-publication-services/
│   └── [existing dak-publication-api structure]
├── dak-quality-assurance/
│   ├── dakComplianceService.js
│   ├── dakValidationService.js
│   ├── faqSchemaService.ts
│   └── runtimeValidationService.ts
├── dak-security-access/
│   ├── userAccessService.js
│   ├── secureTokenStorage.js
│   └── secureTokenStorage.ts
├── dak-system-utilities/
│   ├── lazyFactoryService.js
│   └── libraryLoaderService.js
├── dak-user-guidance/
│   ├── helpContentService.js
│   └── tutorialService.js
├── dak-version-control/
│   ├── dataAccessLayer.js
│   ├── githubActionsService.js
│   ├── githubService.js
│   ├── githubService.ts
│   ├── issueTrackingService.js
│   └── stagingGroundService.js
└── dak-who-integration/
    └── whoDigitalLibraryService.js
```

### 2. High Priority Splits

The following services should be split before consolidation:

- **src/services/githubService.js**: Split recommended - Too many methods (77 total)
  - Suggested split: API operations vs UI helpers vs authentication
- **src/services/issueTrackingService.js**: Split recommended - Too many methods (28 total)
  - Suggested split: Data operations vs sync operations vs filtering

### 3. Services Needing Documentation

The following services have missing descriptions (marked with "X"):

- services/dak-publication-api/src/middleware/auth.ts
- services/dak-publication-api/src/middleware/errorHandler.ts  
- services/dak-publication-api/src/routes/health.ts
- services/dak-publication-api/src/server.ts
- services/dak-publication-api/src/services/contentService.ts
- services/dak-publication-api/src/services/integrationService.ts
- services/dak-publication-api/src/services/publicationService.ts
- services/dak-publication-api/src/services/templateService.ts
- services/dak-publication-api/src/services/variableService.ts
- services/dak-publication-api/src/types/api.ts
- services/dak-publication-api/src/types/template.ts
- src/services/bugReportService.js
- src/services/githubService.js

### 4. Implementation Notes

- All service categories are prefixed with `dak-` as requested
- Backend services (in `services/`) are already well-organized
- Frontend services (in `src/services/`) would benefit from categorization
- Consider gradual migration to avoid breaking changes
- Maintain backward compatibility during transition
- The `routingContextService.js` is marked as a critical protected file - any changes require explicit approval

### 5. Separation of Concerns Analysis

**Services that mix presentation and business logic:**

1. **componentRouteService.js** - Mixes route generation (business) with React components (presentation)
2. **dakValidationService.js** - May mix validation logic (business) with UI feedback (presentation)

**Well-separated services:**

- Most backend services maintain clean separation
- Storage services focus purely on data operations
- Authentication services handle only security concerns
- Performance services handle only caching

*Analysis generated on: 2025-01-22T11:58:41.137Z*