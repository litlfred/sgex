/**
 * Documentation Service - Manages documentation file discovery and organization
 * 
 * Provides functionality to:
 * - Dynamically scan public/docs directory structure
 * - Organize documentation by categories and subdirectories  
 * - Support breadcrumb navigation for subdirectories
 * - Manage JSON schema access
 * - Integrate with i18n for documentation titles and descriptions
 * 
 * @module documentationService
 */

/**
 * Documentation file metadata
 * @example { "id": "requirements", "file": "requirements.md", "title": "Requirements" }
 */
export interface DocumentFile {
  /** Unique document ID */
  id: string;
  /** File path */
  file: string;
  /** Document title */
  title: string;
  /** Subdirectory path */
  path: string;
  /** Full URL to document */
  url: string;
  /** Optional description */
  description?: string;
}

/**
 * Documentation category
 */
export interface DocumentCategory {
  /** Category title */
  title: string;
  /** Files in category */
  files: DocumentFile[];
}

/**
 * Schema information
 */
export interface SchemaInfo {
  /** Section title */
  title: string;
  /** Section description */
  description: string;
  /** Schema files */
  files: DocumentFile[];
}

/**
 * Documentation structure
 */
export interface DocumentationStructure {
  /** Categories of documents */
  categories: Record<string, DocumentCategory>;
  /** JSON schemas section */
  schemas: SchemaInfo;
  /** Breadcrumb mappings */
  breadcrumbs: Map<string, string>;
}

/**
 * Breadcrumb item
 */
export interface Breadcrumb {
  /** Breadcrumb label */
  label: string;
  /** Navigation path */
  path?: string;
  /** Whether this is current page */
  current?: boolean;
}

/**
 * Document with content
 */
export interface DocumentWithContent extends DocumentFile {
  /** Document content */
  content: string;
  /** Breadcrumb trail */
  breadcrumbs: Breadcrumb[];
  /** Whether this is a schema */
  isSchema?: boolean;
}

/**
 * Menu item
 */
export interface MenuItem {
  /** Item type */
  type: 'category' | 'document' | 'schema';
  /** Unique ID */
  id: string;
  /** Display title */
  title: string;
  /** Navigation path */
  path?: string;
  /** Description */
  description?: string;
  /** Child items */
  items?: MenuItem[];
  /** Has subpath */
  hasSubpath?: boolean;
}

/**
 * Cached data
 */
interface CachedData<T> {
  /** Cached data */
  data: T;
  /** Cache timestamp */
  timestamp: number;
}

/**
 * Documentation Service class
 * 
 * Manages documentation structure and content.
 * 
 * @openapi
 * components:
 *   schemas:
 *     DocumentFile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 */
class DocumentationService {
  private baseUrl: string;
  private cache: Map<string, CachedData<any>>;
  private cacheTimeout: number;

  constructor() {
    this.baseUrl = `${process.env.PUBLIC_URL}/docs`;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all available documentation files and organize by category
   */
  async getDocumentationStructure(): Promise<DocumentationStructure> {
    const cacheKey = 'doc-structure';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const structure = await this.scanDocumentationFiles();
      this.cache.set(cacheKey, {
        data: structure,
        timestamp: Date.now()
      });
      return structure;
    } catch (error) {
      console.error('Error loading documentation structure:', error);
      return this.getFallbackStructure();
    }
  }

  /**
   * Scan the docs directory for files and subdirectories
   */
  async scanDocumentationFiles(): Promise<DocumentationStructure> {
    const structure: DocumentationStructure = {
      categories: {},
      schemas: {
        title: 'JSON Schemas',
        description: 'Generated JSON schemas for SGEX types and interfaces',
        files: []
      },
      breadcrumbs: new Map()
    };

    // Core documentation files (root level)
    const coreFiles: Array<{file: string; title: string; category: string}> = [
      { file: 'README.md', title: 'Documentation Overview', category: 'overview' },
      { file: 'requirements.md', title: 'Requirements', category: 'architecture' },
      { file: 'solution-architecture.md', title: 'Solution Architecture', category: 'architecture' },
      { file: 'dak-components.md', title: 'DAK Components', category: 'architecture' },
      { file: 'page-framework.md', title: 'Page Framework', category: 'development' },
      { file: 'framework-developer-guide.md', title: 'Framework Developer Guide', category: 'development' },
      { file: 'page-inventory.md', title: 'Page Inventory', category: 'development' },
      { file: 'UI_STYLING_REQUIREMENTS.md', title: 'UI Styling Requirements', category: 'development' },
      { file: 'bpmn-integration.md', title: 'BPMN Integration', category: 'features' },
      { file: 'decision-table-editor.md', title: 'Decision Table Editor', category: 'features' },
      { file: 'bookmark-system.md', title: 'Bookmark System', category: 'features' },
      { file: 'tutorial-framework.md', title: 'Tutorial Framework', category: 'features' },
      { file: 'qa-testing.md', title: 'QA Testing', category: 'testing' },
      { file: 'compliance-framework.md', title: 'Compliance Framework', category: 'testing' },
      { file: 'runtime-validation.md', title: 'Runtime Validation', category: 'testing' },
      { file: 'project-plan.md', title: 'Project Plan', category: 'planning' },
      { file: 'WHO_CORS_WORKAROUND.md', title: 'WHO CORS Workaround', category: 'technical' },
      { file: 'security-headers.md', title: 'Security Headers', category: 'technical' },
      { file: 'build-process-integration.md', title: 'Build Process Integration', category: 'technical' }
    ];

    // Add core files to categories
    coreFiles.forEach(doc => {
      if (!structure.categories[doc.category]) {
        structure.categories[doc.category] = {
          title: this.getCategoryTitle(doc.category),
          files: []
        };
      }
      structure.categories[doc.category].files.push({
        id: this.getDocumentId(doc.file),
        file: doc.file,
        title: doc.title,
        path: '',
        url: `${this.baseUrl}/${doc.file}`
      });
    });

    // Add workflows subdirectory
    structure.categories['workflows'] = {
      title: 'Workflows & Processes',
      files: [
        {
          id: 'workflows-overview',
          file: 'workflows/README.md',
          title: 'Workflows Overview',
          path: 'workflows',
          url: `${this.baseUrl}/workflows/README.md`
        }
      ]
    };

    // Set up breadcrumbs for subdirectories
    structure.breadcrumbs.set('workflows-overview', 'workflows');

    // Add JSON schemas
    const schemaFiles: DocumentFile[] = [
      {
        id: 'schemas-tjs',
        file: 'schemas/generated-schemas-tjs.json',
        title: 'TypeScript JSON Schema Generated Schemas',
        description: 'Schemas generated using typescript-json-schema tool',
        path: '',
        url: `${this.baseUrl}/schemas/generated-schemas-tjs.json`
      },
      {
        id: 'schemas-tsjsg',
        file: 'schemas/generated-schemas-tsjsg.json', 
        title: 'TS JSON Schema Generator Schemas',
        description: 'Schemas generated using ts-json-schema-generator tool',
        path: '',
        url: `${this.baseUrl}/schemas/generated-schemas-tsjsg.json`
      }
    ];

    structure.schemas.files = schemaFiles;

    return structure;
  }

  /**
   * Get a fallback structure when scanning fails
   */
  getFallbackStructure(): DocumentationStructure {
    return {
      categories: {
        overview: {
          title: 'Overview',
          files: [{
            id: 'overview',
            file: 'README.md',
            title: 'Documentation Overview',
            path: '',
            url: `${this.baseUrl}/README.md`
          }]
        }
      },
      schemas: {
        title: 'JSON Schemas',
        description: 'Generated JSON schemas for SGEX types and interfaces',
        files: []
      },
      breadcrumbs: new Map()
    };
  }

  /**
   * Get category title for i18n
   */
  getCategoryTitle(category: string): string {
    const titles: Record<string, string> = {
      overview: 'Overview',
      architecture: 'Architecture & Design',
      development: 'Development Guidelines',
      features: 'Features & Components',
      testing: 'Testing & Validation',
      planning: 'Planning & Management',
      technical: 'Technical Guides',
      workflows: 'Workflows & Processes'
    };
    return titles[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Generate document ID from file path
   */
  getDocumentId(filePath: string): string {
    let id = filePath
      .replace(/\.md$/, '')
      .replace(/\//g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Convert README to overview
    if (id === 'readme' || id === '') {
      id = 'overview';
    }
    
    return id;
  }

  /**
   * Get specific document content
   */
  async getDocument(docId: string): Promise<DocumentWithContent | null> {
    const structure = await this.getDocumentationStructure();
    const docsBasePath = this.getCurrentDocsBasePath();
    
    // Search through all categories
    for (const category of Object.values(structure.categories)) {
      const doc = category.files.find(f => f.id === docId);
      if (doc) {
        const content = await this.fetchDocumentContent(doc.url);
        
        // Generate breadcrumbs
        let breadcrumbs: Breadcrumb[];
        const breadcrumbContext = structure.breadcrumbs.get(docId);
        if (breadcrumbContext && typeof breadcrumbContext === 'string') {
          breadcrumbs = [
            { label: 'Documentation', path: `${docsBasePath}/overview` },
            { label: breadcrumbContext.charAt(0).toUpperCase() + breadcrumbContext.slice(1), path: `${docsBasePath}/${docId}`, current: true }
          ];
        } else {
          breadcrumbs = this.generateBreadcrumbs(doc);
        }
        
        return {
          ...doc,
          content,
          breadcrumbs
        };
      }
    }

    // Check schemas
    const schema = structure.schemas.files.find(f => f.id === docId);
    if (schema) {
      const content = await this.fetchSchemaContent(schema.url);
      return {
        ...schema,
        content,
        isSchema: true,
        breadcrumbs: [
          { label: 'Documentation', path: `${docsBasePath}/overview` },
          { label: 'JSON Schemas', path: `${docsBasePath}/schemas-overview` },
          { label: schema.title, current: true }
        ]
      };
    }

    return null;
  }

  /**
   * Fetch document content from URL
   */
  async fetchDocumentContent(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    return response.text();
  }

  /**
   * Fetch schema content from URL
   */
  async fetchSchemaContent(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.statusText}`);
    }
    const json = await response.json();
    return JSON.stringify(json, null, 2);
  }

  /**
   * Generate breadcrumbs for a document
   */
  generateBreadcrumbs(doc: DocumentFile): Breadcrumb[] {
    const docsBasePath = this.getCurrentDocsBasePath();
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Documentation', path: `${docsBasePath}/overview` }
    ];

    if (doc.path) {
      breadcrumbs.push({
        label: doc.path.charAt(0).toUpperCase() + doc.path.slice(1),
        path: `${docsBasePath}/${doc.path}`
      });
    }

    breadcrumbs.push({
      label: doc.title,
      current: true
    });

    return breadcrumbs;
  }

  /**
   * Get current docs base path from window location
   */
  getCurrentDocsBasePath(): string {
    if (typeof window !== 'undefined' && window.location) {
      const path = window.location.pathname;
      const docsMatch = path.match(/(.*)\/documentation/);
      return docsMatch ? `${docsMatch[1]}/documentation` : '/sgex/documentation';
    }
    return '/sgex/documentation';
  }

  /**
   * Generate navigation menu from documentation structure
   */
  async getDocumentationMenu(): Promise<MenuItem[]> {
    const structure = await this.getDocumentationStructure();
    const docsBasePath = this.getCurrentDocsBasePath();
    
    const menu: MenuItem[] = [];
    
    // Add category sections
    Object.entries(structure.categories).forEach(([key, category]) => {
      menu.push({
        type: 'category',
        id: key,
        title: category.title,
        items: category.files.map(file => ({
          type: 'document',
          id: file.id,
          title: file.title,
          path: `${docsBasePath}/${file.id}`,
          hasSubpath: !!file.path
        }))
      });
    });

    // Add schemas section
    if (structure.schemas.files.length > 0) {
      menu.push({
        type: 'category',
        id: 'schemas',
        title: structure.schemas.title,
        description: structure.schemas.description,
        items: structure.schemas.files.map(file => ({
          type: 'schema',
          id: file.id,
          title: file.title,
          path: `${docsBasePath}/${file.id}`,
          description: file.description
        }))
      });
    }

    return menu;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
const documentationService = new DocumentationService();
export default documentationService;
