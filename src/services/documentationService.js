/**
 * Documentation Service - Manages documentation file discovery and organization
 * 
 * Provides functionality to:
 * - Dynamically scan public/docs directory structure
 * - Organize documentation by categories and subdirectories  
 * - Support breadcrumb navigation for subdirectories
 * - Manage JSON schema access
 * - Integrate with i18n for documentation titles and descriptions
 */
class DocumentationService {
  constructor() {
    this.baseUrl = `${process.env.PUBLIC_URL}/docs`;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all available documentation files and organize by category
   * @returns {Promise<Object>} Organized documentation structure
   */
  async getDocumentationStructure() {
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
  async scanDocumentationFiles() {
    const structure = {
      categories: {},
      schemas: {
        title: 'JSON Schemas',
        description: 'Generated JSON schemas for SGEX types and interfaces',
        files: []
      },
      breadcrumbs: new Map()
    };

    // Core documentation files (root level)
    const coreFiles = [
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
    structure.breadcrumbs.set('workflows-overview', [
      { label: 'Documentation', path: '/docs/overview' },
      { label: 'Workflows', path: '/docs/workflows-overview', current: true }
    ]);

    // Add JSON schemas
    const schemaFiles = [
      {
        id: 'schemas-tjs',
        file: 'schemas/generated-schemas-tjs.json',
        title: 'TypeScript JSON Schema Generated Schemas',
        description: 'Schemas generated using typescript-json-schema tool',
        url: `${this.baseUrl}/schemas/generated-schemas-tjs.json`
      },
      {
        id: 'schemas-tsjsg',
        file: 'schemas/generated-schemas-tsjsg.json', 
        title: 'TS JSON Schema Generator Schemas',
        description: 'Schemas generated using ts-json-schema-generator tool',
        url: `${this.baseUrl}/schemas/generated-schemas-tsjsg.json`
      }
    ];

    structure.schemas.files = schemaFiles;

    return structure;
  }

  /**
   * Get a fallback structure when scanning fails
   */
  getFallbackStructure() {
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
  getCategoryTitle(category) {
    const titles = {
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
  getDocumentId(filePath) {
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
   * @param {string} docId - Document identifier
   * @returns {Promise<Object>} Document content and metadata
   */
  async getDocument(docId) {
    const structure = await this.getDocumentationStructure();
    
    // Search through all categories
    for (const category of Object.values(structure.categories)) {
      const doc = category.files.find(f => f.id === docId);
      if (doc) {
        const content = await this.fetchDocumentContent(doc.url);
        return {
          ...doc,
          content,
          breadcrumbs: structure.breadcrumbs.get(docId) || this.generateBreadcrumbs(doc)
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
          { label: 'Documentation', path: '/docs/overview' },
          { label: 'JSON Schemas', path: '/docs/schemas-overview' },
          { label: schema.title, current: true }
        ]
      };
    }

    throw new Error(`Document not found: ${docId}`);
  }

  /**
   * Fetch document content from URL
   */
  async fetchDocumentContent(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load document: ${response.status}`);
    }
    return await response.text();
  }

  /**
   * Fetch and format schema content
   */
  async fetchSchemaContent(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load schema: ${response.status}`);
    }
    const json = await response.json();
    return JSON.stringify(json, null, 2);
  }

  /**
   * Generate breadcrumbs for a document
   */
  generateBreadcrumbs(doc) {
    const breadcrumbs = [{ label: 'Documentation', path: '/docs/overview' }];
    
    if (doc.path) {
      // Add path segments as breadcrumbs
      const pathSegments = doc.path.split('/').filter(Boolean);
      pathSegments.forEach((segment, index) => {
        const path = pathSegments.slice(0, index + 1).join('-');
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          path: `/docs/${path}`
        });
      });
    }
    
    breadcrumbs.push({ label: doc.title, current: true });
    return breadcrumbs;
  }

  /**
   * Get navigation menu structure for sidebar
   */
  async getNavigationMenu() {
    const structure = await this.getDocumentationStructure();
    
    const menu = [];
    
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
          path: `/docs/${file.id}`,
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
          path: `/docs/${file.id}`,
          description: file.description
        }))
      });
    }

    return menu;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
const documentationService = new DocumentationService();
export default documentationService;