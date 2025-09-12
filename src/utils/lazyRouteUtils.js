/**
 * SGEX Unified Lazy Loading Utility (Legacy Compatibility Layer)
 * 
 * DEPRECATED: This file now serves as a compatibility layer for existing imports.
 * New code should import directly from the specific services:
 * 
 * - Component routes: '../services/componentRouteService'
 * - Library loading: '../services/libraryLoaderService' 
 * - Factory instances: '../services/lazyFactoryService'
 * 
 * This consolidation was completed in Phase 4 of the routing consolidation
 * to achieve better separation of concerns and reduce file complexity.
 */

// Import for default export aggregation
import { 
  generateLazyRoutes, 
  getValidDAKComponents, 
  isValidComponent 
} from '../services/componentRouteService';

import { 
  lazyLoadOctokit,
  lazyLoadBpmnModeler,
  lazyLoadBpmnViewer,
  lazyLoadYaml,
  lazyLoadMDEditor,
  lazyLoadSyntaxHighlighter,
  lazyLoadSyntaxHighlighterStyles,
  lazyLoadReactMarkdown,
  lazyLoadAjv,
  lazyLoadAjvFormats,
  lazyLoadDOMPurify,
  lazyLoadRehypeRaw,
  clearLazyImportCache
} from '../services/libraryLoaderService';

import { 
  createLazyOctokit,
  createLazyBpmnModeler,
  createLazyBpmnViewer,
  createLazyAjv
} from '../services/lazyFactoryService';

// Re-export component route functionality
export { 
  generateLazyRoutes, 
  getValidDAKComponents, 
  isValidComponent 
} from '../services/componentRouteService';

// Re-export library loading functionality  
export { 
  lazyLoadOctokit,
  lazyLoadBpmnModeler,
  lazyLoadBpmnViewer,
  lazyLoadYaml,
  lazyLoadMDEditor,
  lazyLoadSyntaxHighlighter,
  lazyLoadSyntaxHighlighterStyles,
  lazyLoadReactMarkdown,
  lazyLoadAjv,
  lazyLoadAjvFormats,
  lazyLoadDOMPurify,
  lazyLoadRehypeRaw,
  clearLazyImportCache
} from '../services/libraryLoaderService';

// Re-export factory functionality
export { 
  createLazyOctokit,
  createLazyBpmnModeler,
  createLazyBpmnViewer,
  createLazyAjv
} from '../services/lazyFactoryService';

// Default export with all utilities for comprehensive access
const LazyUtils = {
  // Component route functions (from componentRouteService)
  generateLazyRoutes,
  getValidDAKComponents,
  isValidComponent,
  
  // Library loading functions (from libraryLoaderService)
  lazyLoadOctokit,
  lazyLoadBpmnModeler,
  lazyLoadBpmnViewer,
  lazyLoadYaml,
  lazyLoadMDEditor,
  lazyLoadSyntaxHighlighter,
  lazyLoadSyntaxHighlighterStyles,
  lazyLoadReactMarkdown,
  lazyLoadAjv,
  lazyLoadAjvFormats,
  lazyLoadDOMPurify,
  lazyLoadRehypeRaw,
  clearLazyImportCache,
  
  // Factory functions (from lazyFactoryService)
  createLazyOctokit,
  createLazyBpmnModeler,
  createLazyBpmnViewer,
  createLazyAjv
};

export default LazyUtils;