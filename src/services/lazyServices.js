/**
 * Lazy Loaded Services
 * 
 * Provides lazy loading for heavy services to improve initial page load performance.
 * These services are only loaded when they are actually needed.
 */

import lazyServiceFactory from './lazyServiceFactory';

// Lazy load GitHub Service (large with Octokit dependency)
export const githubService = lazyServiceFactory.createLazyService(
  'githubService',
  () => import('./githubService')
);

// Lazy load Repository Cache Service (data processing heavy)
export const repositoryCacheService = lazyServiceFactory.createLazyService(
  'repositoryCacheService', 
  () => import('./repositoryCacheService')
);

// Lazy load WHO Digital Library Service (external API integration)
export const whoDigitalLibraryService = lazyServiceFactory.createLazyService(
  'whoDigitalLibraryService',
  () => import('./whoDigitalLibraryService')
);

// Lazy load DAK Validation Service (schema validation heavy)
export const dakValidationService = lazyServiceFactory.createLazyService(
  'dakValidationService',
  () => import('./dakValidationService')
);

// Lazy load DAK Compliance Service (analysis heavy)
export const dakComplianceService = lazyServiceFactory.createLazyService(
  'dakComplianceService',
  () => import('./dakComplianceService')
);

// Lazy load Documentation Service (markdown processing)
export const documentationService = lazyServiceFactory.createLazyService(
  'documentationService',
  () => import('./documentationService')
);

// Lazy load Tutorial Service (interactive content)
export const tutorialService = lazyServiceFactory.createLazyService(
  'tutorialService',
  () => import('./tutorialService')
);

// Lazy load User Access Service (permission management)
export const userAccessService = lazyServiceFactory.createLazyService(
  'userAccessService',
  () => import('./userAccessService')
);

// Lazy load Profile Subscription Service (notification management)
export const profileSubscriptionService = lazyServiceFactory.createLazyService(
  'profileSubscriptionService',
  () => import('./profileSubscriptionService')
);

// Lazy load Cache Management Service (performance optimization)
export const cacheManagementService = lazyServiceFactory.createLazyService(
  'cacheManagementService',
  () => import('./cacheManagementService')
);

// Lazy load Staging Ground Service (data staging)
export const stagingGroundService = lazyServiceFactory.createLazyService(
  'stagingGroundService',
  () => import('./stagingGroundService')
);

// Lazy load Actor Definition Service (BPMN related)
export const actorDefinitionService = lazyServiceFactory.createLazyService(
  'actorDefinitionService',
  () => import('./actorDefinitionService')
);

// Services that need immediate availability (for critical functionality)
// These use eager lazy loading - they preload but can be accessed synchronously after first load

// Data Access Layer - used by many components
export const dataAccessLayer = lazyServiceFactory.createEagerLazyService(
  'dataAccessLayer',
  () => import('./dataAccessLayer')
);

// Bookmark Service - frequently accessed
export const bookmarkService = lazyServiceFactory.createEagerLazyService(
  'bookmarkService', 
  () => import('./bookmarkService')
);

// Local Storage Service - frequently accessed
export const localStorageService = lazyServiceFactory.createEagerLazyService(
  'localStorageService',
  () => import('./localStorageService')
);

// Branch Context Service - needed for many components
export const branchContextService = lazyServiceFactory.createEagerLazyService(
  'branchContextService',
  () => import('./branchContextService')
);

// Export the factory for custom lazy loading
export { lazyServiceFactory };

// Preload critical services in the background
if (typeof window !== 'undefined') {
  // Preload after initial page load
  setTimeout(() => {
    dataAccessLayer._preload?.();
    bookmarkService._preload?.();
    localStorageService._preload?.();
    branchContextService._preload?.();
  }, 100);
}