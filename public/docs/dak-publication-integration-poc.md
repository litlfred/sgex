# DAK Publication System - Integration Proof of Concept

## Overview

This document demonstrates how the DAK publication system would integrate with the existing SGeX Workbench architecture, showing specific code examples and integration patterns.

## 1. Extended Configuration Integration

### 1.1 Enhanced DAK Templates Configuration

**File: `src/config/dak-templates.json`**

```json
{
  "dakTemplates": [
    {
      "id": "who-smart-ig-empty",
      "name": "WHO template SMART Guidelines",
      "description": "Empty WHO SMART Guidelines template for creating new Digital Adaptation Kits",
      "repository": "https://github.com/WorldHealthOrganization/smart-ig-empty",
      "owner": "WorldHealthOrganization",
      "repo": "smart-ig-empty",
      "isDefault": true,
      "type": "dak-template",
      "tags": ["WHO", "SMART Guidelines", "Template", "Empty"],
      "version": "latest",
      "documentation": "https://github.com/WorldHealthOrganization/smart-ig-empty/blob/main/README.md"
    }
  ],
  "publicationTemplates": [
    {
      "id": "who-standard-publication",
      "name": "WHO Standard Publication Template",
      "description": "Default WHO SMART Guidelines publication template with official branding",
      "type": "publication-template",
      "formats": ["html", "pdf", "docx"],
      "branding": "who-standard",
      "isDefault": true,
      "previewImage": "/sgex/templates/who-standard-preview.png",
      "templatePath": "/templates/who-standard/",
      "styles": {
        "primaryColor": "#0093D1",
        "secondaryColor": "#00A651",
        "accentColor": "#F39C12",
        "fontFamily": "Arial, sans-serif"
      },
      "supportedComponents": [
        "health-interventions",
        "personas",
        "user-scenarios", 
        "business-processes",
        "core-data-elements",
        "decision-support-logic",
        "program-indicators",
        "requirements",
        "test-scenarios"
      ]
    },
    {
      "id": "who-technical-report",
      "name": "WHO Technical Report Template", 
      "description": "Template for technical reports and detailed documentation",
      "type": "publication-template",
      "formats": ["html", "pdf", "docx"],
      "branding": "who-technical",
      "isDefault": false,
      "previewImage": "/sgex/templates/who-technical-preview.png",
      "templatePath": "/templates/who-technical/",
      "styles": {
        "primaryColor": "#003366",
        "secondaryColor": "#0093D1", 
        "accentColor": "#00A651",
        "fontFamily": "Times New Roman, serif"
      }
    }
  ],
  "version": "2.0.0",
  "lastUpdated": "2024-01-15T00:00:00Z"
}
```

### 1.2 Publication Service Integration

**File: `src/services/publicationService.js`**

```javascript
import githubService from './githubService';
import dakTemplates from '../config/dak-templates.json';

class PublicationService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get available publication templates
   */
  getAvailableTemplates() {
    return dakTemplates.publicationTemplates || [];
  }

  /**
   * Get publication configuration for a DAK repository
   */
  async getPublicationConfig(owner, repo, branch = 'main') {
    const cacheKey = `${owner}/${repo}/${branch}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Check for existing publication configuration
      const configContent = await githubService.getFileContent(
        owner, 
        repo, 
        '.sgex/publication.json',
        branch
      );
      
      const config = JSON.parse(configContent);
      this.cache.set(cacheKey, config);
      return config;
    } catch (error) {
      // Return default configuration if file doesn't exist
      const defaultConfig = this.createDefaultConfig(owner, repo);
      return defaultConfig;
    }
  }

  /**
   * Save publication configuration
   */
  async savePublicationConfig(owner, repo, branch, config, commitMessage) {
    const configContent = JSON.stringify(config, null, 2);
    
    await githubService.updateFile(
      owner,
      repo, 
      '.sgex/publication.json',
      configContent,
      commitMessage || 'Update publication configuration',
      branch
    );

    // Update cache
    const cacheKey = `${owner}/${repo}/${branch}`;
    this.cache.set(cacheKey, config);
  }

  /**
   * Aggregate content from all DAK components
   */
  async aggregateDAKContent(owner, repo, branch = 'main') {
    const components = {};

    // Health Interventions - IRIS references
    components.healthInterventions = await this.extractHealthInterventions(owner, repo, branch);

    // Personas - Actor definitions
    components.personas = await this.extractPersonas(owner, repo, branch);

    // User Scenarios - Narrative descriptions
    components.userScenarios = await this.extractUserScenarios(owner, repo, branch);

    // Business Processes - BPMN files
    components.businessProcesses = await this.extractBusinessProcesses(owner, repo, branch);

    // Core Data Elements - Terminology and data dictionaries
    components.coreDataElements = await this.extractCoreDataElements(owner, repo, branch);

    // Decision Support Logic - DMN files
    components.decisionSupportLogic = await this.extractDecisionSupportLogic(owner, repo, branch);

    // Program Indicators - Measurement definitions
    components.programIndicators = await this.extractProgramIndicators(owner, repo, branch);

    // Requirements - Functional and non-functional requirements
    components.requirements = await this.extractRequirements(owner, repo, branch);

    // Test Scenarios - Feature files and test cases
    components.testScenarios = await this.extractTestScenarios(owner, repo, branch);

    return components;
  }

  /**
   * Extract BPMN files and generate SVG views
   */
  async extractBusinessProcesses(owner, repo, branch) {
    try {
      const files = await githubService.getRepositoryContents(owner, repo, 'input/bpmn', branch);
      const bpmnFiles = files.filter(file => file.name.endsWith('.bpmn'));
      
      const processes = [];
      for (const file of bpmnFiles) {
        const content = await githubService.getFileContent(owner, repo, file.path, branch);
        
        // Check for corresponding SVG file
        const svgPath = file.path.replace('.bpmn', '.svg');
        let svgExists = false;
        try {
          await githubService.getFileContent(owner, repo, svgPath, branch);
          svgExists = true;
        } catch (error) {
          // SVG doesn't exist
        }

        processes.push({
          name: file.name,
          path: file.path,
          title: this.extractBPMNTitle(content),
          description: this.extractBPMNDescription(content),
          svgPath: svgExists ? svgPath : null,
          content: content
        });
      }
      
      return processes;
    } catch (error) {
      console.warn('Could not extract business processes:', error);
      return [];
    }
  }

  /**
   * Extract DMN decision tables
   */
  async extractDecisionSupportLogic(owner, repo, branch) {
    try {
      const files = await githubService.getRepositoryContents(owner, repo, 'input/dmn', branch);
      const dmnFiles = files.filter(file => file.name.endsWith('.dmn'));
      
      const decisions = [];
      for (const file of dmnFiles) {
        const content = await githubService.getFileContent(owner, repo, file.path, branch);
        
        decisions.push({
          name: file.name,
          path: file.path,
          title: this.extractDMNTitle(content),
          description: this.extractDMNDescription(content),
          inputRequirements: this.extractDMNInputs(content),
          outputDecisions: this.extractDMNOutputs(content),
          content: content
        });
      }
      
      return decisions;
    } catch (error) {
      console.warn('Could not extract decision support logic:', error);
      return [];
    }
  }

  /**
   * Extract core data elements from terminology files
   */
  async extractCoreDataElements(owner, repo, branch) {
    try {
      const elements = {
        terminologyFiles: [],
        dataDictionaries: [],
        fshFiles: []
      };

      // Extract FSH files
      try {
        const fshFiles = await githubService.getRepositoryContents(owner, repo, 'input/fsh', branch);
        elements.fshFiles = fshFiles
          .filter(file => file.name.endsWith('.fsh'))
          .map(file => ({
            name: file.name,
            path: file.path,
            type: 'fsh'
          }));
      } catch (error) {
        // Directory doesn't exist
      }

      // Extract terminology files
      try {
        const terminologyFiles = await githubService.getRepositoryContents(owner, repo, 'input/vocabulary', branch);
        elements.terminologyFiles = terminologyFiles
          .filter(file => file.name.endsWith('.json') || file.name.endsWith('.xml'))
          .map(file => ({
            name: file.name,
            path: file.path,
            type: 'terminology'
          }));
      } catch (error) {
        // Directory doesn't exist
      }

      return elements;
    } catch (error) {
      console.warn('Could not extract core data elements:', error);
      return { terminologyFiles: [], dataDictionaries: [], fshFiles: [] };
    }
  }

  /**
   * Create default publication configuration
   */
  createDefaultConfig(owner, repo) {
    const defaultTemplate = this.getAvailableTemplates().find(t => t.isDefault);
    
    return {
      publication: {
        metadata: {
          title: `${repo} Digital Adaptation Kit`,
          version: "1.0.0",
          status: "draft",
          authors: [],
          organizations: [
            {
              name: "World Health Organization",
              acronym: "WHO",
              role: "publisher"
            }
          ],
          publicationDate: new Date().toISOString().split('T')[0],
          copyright: {
            statement: `© World Health Organization ${new Date().getFullYear()}`,
            year: new Date().getFullYear(),
            holder: "World Health Organization",
            license: {
              type: "CC-BY",
              url: "https://creativecommons.org/licenses/by/4.0/"
            }
          },
          identifiers: {
            githubRepository: `https://github.com/${owner}/${repo}`
          },
          language: "en-US"
        },
        structure: {
          preMatter: {
            titlePage: true,
            tableOfContents: { enabled: true, depth: 3 },
            executiveSummary: { enabled: true },
            acknowledgments: { enabled: true },
            glossary: { enabled: true, autoGenerate: true }
          },
          mainContent: {
            componentOrder: [
              "health-interventions",
              "personas",
              "user-scenarios", 
              "business-processes",
              "core-data-elements",
              "decision-support-logic",
              "program-indicators",
              "requirements",
              "test-scenarios"
            ]
          }
        },
        formatting: {
          template: defaultTemplate?.id || "who-standard-publication",
          outputFormats: {
            html: { enabled: true, singlePage: false },
            pdf: { enabled: true, includeBookmarks: true },
            docx: { enabled: true }
          }
        }
      }
    };
  }

  // Helper methods for content extraction
  extractBPMNTitle(content) {
    const match = content.match(/<bpmn:process[^>]*name="([^"]*)"[^>]*>/);
    return match ? match[1] : 'Untitled Process';
  }

  extractBPMNDescription(content) {
    const match = content.match(/<bpmn:documentation[^>]*>([^<]*)<\/bpmn:documentation>/);
    return match ? match[1] : '';
  }

  extractDMNTitle(content) {
    const match = content.match(/<decision[^>]*name="([^"]*)"[^>]*>/);
    return match ? match[1] : 'Untitled Decision';
  }

  extractDMNDescription(content) {
    const match = content.match(/<description[^>]*>([^<]*)<\/description>/);
    return match ? match[1] : '';
  }

  extractDMNInputs(content) {
    const matches = content.match(/<inputExpression[^>]*typeRef="([^"]*)"[^>]*>/g);
    return matches ? matches.map(match => {
      const typeMatch = match.match(/typeRef="([^"]*)"/);
      return typeMatch ? typeMatch[1] : 'Unknown';
    }) : [];
  }

  extractDMNOutputs(content) {
    const matches = content.match(/<output[^>]*name="([^"]*)"[^>]*>/g);
    return matches ? matches.map(match => {
      const nameMatch = match.match(/name="([^"]*)"/);
      return nameMatch ? nameMatch[1] : 'Unknown';
    }) : [];
  }
}

export default new PublicationService();
```

## 2. React Component Integration

### 2.1 Publication Editor Component

**File: `src/components/PublicationEditor.js`**

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import publicationService from '../services/publicationService';
import ContextualHelpMascot from './ContextualHelpMascot';
import './PublicationEditor.css';

const PublicationEditor = () => {
  const { user, repo, branch = 'main' } = useParams();
  const location = useLocation();
  const [config, setConfig] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [dakContent, setDAKContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState('edit');

  // Extract context from URL parameters or location state
  const repository = location.state?.repository || { 
    owner: { login: user }, 
    name: repo,
    full_name: \`\${user}/\${repo}\`
  };

  useEffect(() => {
    const loadPublicationData = async () => {
      try {
        setLoading(true);
        
        // Load publication configuration
        const publicationConfig = await publicationService.getPublicationConfig(user, repo, branch);
        setConfig(publicationConfig);

        // Load available templates
        const availableTemplates = publicationService.getAvailableTemplates();
        setTemplates(availableTemplates);

        // Aggregate DAK content
        const content = await publicationService.aggregateDAKContent(user, repo, branch);
        setDAKContent(content);

      } catch (error) {
        console.error('Error loading publication data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && repo) {
      loadPublicationData();
    }
  }, [user, repo, branch]);

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await publicationService.savePublicationConfig(
        user, 
        repo, 
        branch, 
        config,
        'Update publication configuration'
      );
      // Show success notification
    } catch (error) {
      console.error('Error saving publication config:', error);
      // Show error notification
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format) => {
    try {
      // Export implementation will be added here
      console.log(\`Exporting to \${format}\`);
    } catch (error) {
      console.error(\`Error exporting to \${format}:\`, error);
    }
  };

  if (loading) {
    return (
      <div className="publication-editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading publication configuration...</p>
      </div>
    );
  }

  return (
    <div className="publication-editor">
      <div className="publication-editor-header">
        <div className="header-content">
          <h1>Publication Editor</h1>
          <div className="header-info">
            <span className="repo-info">{user}/{repo}</span>
            <span className="branch-info">Branch: {branch}</span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="view-modes">
            <button 
              className={\`btn \${previewMode === 'edit' ? 'btn-primary' : 'btn-secondary'}\`}
              onClick={() => setPreviewMode('edit')}
            >
              Edit
            </button>
            <button 
              className={\`btn \${previewMode === 'preview' ? 'btn-primary' : 'btn-secondary'}\`}
              onClick={() => setPreviewMode('preview')}
            >
              Preview
            </button>
          </div>
          
          <div className="export-actions">
            <button 
              className="btn btn-outline"
              onClick={() => handleExport('html')}
            >
              Export HTML
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleExport('docx')}
            >
              Export Word
            </button>
          </div>

          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="publication-editor-content">
        {previewMode === 'edit' ? (
          <PublicationConfigEditor 
            config={config}
            templates={templates}
            dakContent={dakContent}
            onChange={handleConfigChange}
          />
        ) : (
          <PublicationPreview 
            config={config}
            dakContent={dakContent}
          />
        )}
      </div>

      <ContextualHelpMascot 
        pageId="publication-editor"
        notificationBadge={null}
      />
    </div>
  );
};

// Configuration editor component
const PublicationConfigEditor = ({ config, templates, dakContent, onChange }) => {
  const [activeSection, setActiveSection] = useState('metadata');

  const handleMetadataChange = (field, value) => {
    const newConfig = {
      ...config,
      publication: {
        ...config.publication,
        metadata: {
          ...config.publication.metadata,
          [field]: value
        }
      }
    };
    onChange(newConfig);
  };

  const handleTemplateChange = (templateId) => {
    const newConfig = {
      ...config,
      publication: {
        ...config.publication,
        formatting: {
          ...config.publication.formatting,
          template: templateId
        }
      }
    };
    onChange(newConfig);
  };

  return (
    <div className="publication-config-editor">
      <div className="config-sidebar">
        <div className="config-nav">
          <button 
            className={\`nav-item \${activeSection === 'metadata' ? 'active' : ''}\`}
            onClick={() => setActiveSection('metadata')}
          >
            📝 Metadata
          </button>
          <button 
            className={\`nav-item \${activeSection === 'structure' ? 'active' : ''}\`}
            onClick={() => setActiveSection('structure')}
          >
            📚 Structure
          </button>
          <button 
            className={\`nav-item \${activeSection === 'formatting' ? 'active' : ''}\`}
            onClick={() => setActiveSection('formatting')}
          >
            🎨 Formatting
          </button>
          <button 
            className={\`nav-item \${activeSection === 'content' ? 'active' : ''}\`}
            onClick={() => setActiveSection('content')}
          >
            📄 Content
          </button>
        </div>
      </div>

      <div className="config-main">
        {activeSection === 'metadata' && (
          <MetadataEditor 
            metadata={config.publication.metadata}
            onChange={handleMetadataChange}
          />
        )}
        
        {activeSection === 'structure' && (
          <StructureEditor 
            structure={config.publication.structure}
            dakContent={dakContent}
            onChange={(structure) => onChange({
              ...config,
              publication: { ...config.publication, structure }
            })}
          />
        )}
        
        {activeSection === 'formatting' && (
          <FormattingEditor 
            formatting={config.publication.formatting}
            templates={templates}
            onChange={(formatting) => onChange({
              ...config,
              publication: { ...config.publication, formatting }
            })}
          />
        )}
        
        {activeSection === 'content' && (
          <ContentEditor 
            dakContent={dakContent}
            componentSettings={config.publication.structure.mainContent.componentSettings || {}}
            onChange={(componentSettings) => onChange({
              ...config,
              publication: {
                ...config.publication,
                structure: {
                  ...config.publication.structure,
                  mainContent: {
                    ...config.publication.structure.mainContent,
                    componentSettings
                  }
                }
              }
            })}
          />
        )}
      </div>
    </div>
  );
};

// Metadata editor component
const MetadataEditor = ({ metadata, onChange }) => {
  return (
    <div className="metadata-editor">
      <h2>Publication Metadata</h2>
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={metadata.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="subtitle">Subtitle</label>
        <input
          id="subtitle"
          type="text"
          value={metadata.subtitle || ''}
          onChange={(e) => onChange('subtitle', e.target.value)}
          className="form-control"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="version">Version</label>
          <input
            id="version"
            type="text"
            value={metadata.version || ''}
            onChange={(e) => onChange('version', e.target.value)}
            className="form-control"
            pattern="\\d+\\.\\d+\\.\\d+"
            placeholder="1.0.0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={metadata.status || 'draft'}
            onChange={(e) => onChange('status', e.target.value)}
            className="form-control"
          >
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="abstract">Abstract/Executive Summary</label>
        <textarea
          id="abstract"
          value={metadata.abstract || ''}
          onChange={(e) => onChange('abstract', e.target.value)}
          className="form-control"
          rows={4}
          placeholder="Brief description of the DAK and its purpose..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="keywords">Keywords</label>
        <input
          id="keywords"
          type="text"
          value={metadata.keywords?.join(', ') || ''}
          onChange={(e) => onChange('keywords', e.target.value.split(',').map(k => k.trim()))}
          className="form-control"
          placeholder="immunization, vaccines, digital health"
        />
        <small className="form-text">Separate keywords with commas</small>
      </div>

      <div className="authors-section">
        <h3>Authors & Contributors</h3>
        <AuthorsEditor 
          authors={metadata.authors || []}
          onChange={(authors) => onChange('authors', authors)}
        />
      </div>

      <div className="copyright-section">
        <h3>Copyright & Licensing</h3>
        <CopyrightEditor 
          copyright={metadata.copyright || {}}
          onChange={(copyright) => onChange('copyright', copyright)}
        />
      </div>
    </div>
  );
};

export default PublicationEditor;
```

### 2.2 Template Preview Component

**File: `src/components/PublicationPreview.js`**

```javascript
import React, { useState, useEffect } from 'react';
import publicationService from '../services/publicationService';
import './PublicationPreview.css';

const PublicationPreview = ({ config, dakContent }) => {
  const [previewFormat, setPreviewFormat] = useState('html');
  const [renderedContent, setRenderedContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    renderPreview();
  }, [config, dakContent, previewFormat]);

  const renderPreview = async () => {
    if (!config || !dakContent) return;

    setLoading(true);
    try {
      // This would be implemented with the template rendering engine
      const content = await renderTemplate(config, dakContent, previewFormat);
      setRenderedContent(content);
    } catch (error) {
      console.error('Error rendering preview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publication-preview">
      <div className="preview-controls">
        <div className="format-selector">
          <button 
            className={\`btn \${previewFormat === 'html' ? 'btn-primary' : 'btn-secondary'}\`}
            onClick={() => setPreviewFormat('html')}
          >
            HTML Preview
          </button>
          <button 
            className={\`btn \${previewFormat === 'pdf' ? 'btn-primary' : 'btn-secondary'}\`}
            onClick={() => setPreviewFormat('pdf')}
          >
            PDF Preview
          </button>
          <button 
            className={\`btn \${previewFormat === 'docx' ? 'btn-primary' : 'btn-secondary'}\`}
            onClick={() => setPreviewFormat('docx')}
          >
            Word Preview
          </button>
        </div>

        <div className="zoom-controls">
          <button className="btn btn-outline">50%</button>
          <button className="btn btn-outline">75%</button>
          <button className="btn btn-primary">100%</button>
          <button className="btn btn-outline">125%</button>
        </div>
      </div>

      <div className="preview-content">
        {loading ? (
          <div className="preview-loading">
            <div className="loading-spinner"></div>
            <p>Rendering {previewFormat.toUpperCase()} preview...</p>
          </div>
        ) : (
          <div 
            className={\`preview-frame preview-\${previewFormat}\`}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        )}
      </div>
    </div>
  );
};

// Template rendering function (simplified)
const renderTemplate = async (config, dakContent, format) => {
  const template = config.publication.formatting.template;
  const metadata = config.publication.metadata;
  
  // This is a simplified template rendering example
  // In practice, this would use a proper template engine
  
  let html = \`
    <!DOCTYPE html>
    <html lang="\${metadata.language || 'en-US'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>\${metadata.title}</title>
      <style>
        body { 
          font-family: \${config.publication.formatting.typography?.fontFamily || 'Arial, sans-serif'};
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .title-page {
          text-align: center;
          page-break-after: always;
          margin-bottom: 2rem;
        }
        .title { 
          color: \${config.publication.formatting.branding?.primaryColor || '#0093D1'};
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .subtitle {
          color: #666;
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        .section {
          margin-bottom: 2rem;
          page-break-inside: avoid;
        }
        .section h2 {
          color: \${config.publication.formatting.branding?.primaryColor || '#0093D1'};
          border-bottom: 2px solid \${config.publication.formatting.branding?.secondaryColor || '#00A651'};
          padding-bottom: 0.5rem;
        }
        .bpmn-diagram, .dmn-diagram {
          text-align: center;
          margin: 1rem 0;
        }
        .bpmn-diagram img, .dmn-diagram img {
          max-width: 100%;
          height: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
  \`;

  // Title page
  if (config.publication.structure.preMatter.titlePage) {
    html += \`
      <div class="title-page">
        <h1 class="title">\${metadata.title}</h1>
        \${metadata.subtitle ? \`<p class="subtitle">\${metadata.subtitle}</p>\` : ''}
        <p><strong>Version:</strong> \${metadata.version}</p>
        <p><strong>Publication Date:</strong> \${metadata.publicationDate}</p>
        \${metadata.authors?.length > 0 ? \`
          <div class="authors">
            <h3>Authors</h3>
            \${metadata.authors.map(author => \`<p>\${author.name}\${author.affiliation ? \` - \${author.affiliation}\` : ''}</p>\`).join('')}
          </div>
        \` : ''}
      </div>
    \`;
  }

  // Table of contents
  if (config.publication.structure.preMatter.tableOfContents?.enabled) {
    html += \`
      <div class="section">
        <h2>Table of Contents</h2>
        <ul>
          \${config.publication.structure.mainContent.componentOrder.map((componentId, index) => {
            const componentName = componentId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return \`<li><a href="#\${componentId}">\${index + 1}. \${componentName}</a></li>\`;
          }).join('')}
        </ul>
      </div>
    \`;
  }

  // Main content sections
  for (const componentId of config.publication.structure.mainContent.componentOrder) {
    const componentData = dakContent[componentId];
    if (!componentData) continue;

    const componentName = componentId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    html += \`<div class="section" id="\${componentId}">
      <h2>\${componentName}</h2>
    \`;

    // Render component-specific content
    if (componentId === 'businessProcesses' && componentData.length > 0) {
      for (const process of componentData) {
        html += \`
          <div class="business-process">
            <h3>\${process.title}</h3>
            \${process.description ? \`<p>\${process.description}</p>\` : ''}
            \${process.svgPath ? \`
              <div class="bpmn-diagram">
                <img src="/api/github/\${process.svgPath}" alt="\${process.title} BPMN Diagram" />
              </div>
            \` : ''}
          </div>
        \`;
      }
    }

    if (componentId === 'decisionSupportLogic' && componentData.length > 0) {
      for (const decision of componentData) {
        html += \`
          <div class="decision-logic">
            <h3>\${decision.title}</h3>
            \${decision.description ? \`<p>\${decision.description}</p>\` : ''}
            \${decision.inputRequirements.length > 0 ? \`
              <h4>Input Requirements</h4>
              <ul>\${decision.inputRequirements.map(input => \`<li>\${input}</li>\`).join('')}</ul>
            \` : ''}
            \${decision.outputDecisions.length > 0 ? \`
              <h4>Output Decisions</h4>
              <ul>\${decision.outputDecisions.map(output => \`<li>\${output}</li>\`).join('')}</ul>
            \` : ''}
          </div>
        \`;
      }
    }

    html += '</div>';
  }

  html += \`
    </body>
    </html>
  \`;

  return html;
};

export default PublicationPreview;
```

## 3. URL Routing Integration

### 3.1 Enhanced App.js Routes

**File: `src/App.js` (additions)**

```javascript
// Add these routes to the existing App.js routing structure

import PublicationEditor from './components/PublicationEditor';
import PublicationPreview from './components/PublicationPreview';
import PublicationTemplates from './components/PublicationTemplates';

// Inside the Router component, add these routes:

{/* Publication Management Routes */}
<Route path="/publication-editor" element={<PublicationEditor />} />
<Route path="/publication-editor/:user/:repo" element={<PublicationEditor />} />
<Route path="/publication-editor/:user/:repo/:branch" element={<PublicationEditor />} />

<Route path="/publication-preview" element={<PublicationPreview />} />
<Route path="/publication-preview/:user/:repo" element={<PublicationPreview />} />
<Route path="/publication-preview/:user/:repo/:branch" element={<PublicationPreview />} />

<Route path="/publication-templates" element={<PublicationTemplates />} />
```

### 3.2 DAK Dashboard Integration

**File: `src/components/DAKDashboard.js` (additions)**

```javascript
// Add publication management button to existing DAK Dashboard

const PublicationManagementCard = ({ user, repo, branch }) => {
  const navigate = useNavigate();

  const handleCreatePublication = () => {
    navigate(\`/publication-editor/\${user}/\${repo}/\${branch}\`);
  };

  const handlePreviewPublication = () => {
    navigate(\`/publication-preview/\${user}/\${repo}/\${branch}\`);
  };

  return (
    <div className="dak-component-card publication-card">
      <div className="card-header">
        <h3>📚 Publication Management</h3>
        <span className="component-badge">Publishing</span>
      </div>
      
      <div className="card-content">
        <p>Create professional publications from your DAK content in multiple formats (HTML, PDF, Word).</p>
        
        <div className="publication-features">
          <div className="feature">
            <span className="feature-icon">🎨</span>
            <span>WYSIWYG Template Editor</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📄</span>
            <span>Multi-format Export</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🏢</span>
            <span>WHO Branding Compliance</span>
          </div>
        </div>
      </div>
      
      <div className="card-actions">
        <button 
          className="btn btn-primary"
          onClick={handleCreatePublication}
        >
          Create Publication
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handlePreviewPublication}
        >
          Preview Publication
        </button>
      </div>
    </div>
  );
};

// Add this component to the existing DAK Dashboard component grid
```

## 4. Help System Integration

### 4.1 Contextual Help Topics

**File: `src/services/helpContentService.js` (additions)**

```javascript
// Add publication help topics to existing help content

'publication-editor': [
  {
    id: 'publication-overview',
    title: 'DAK Publication System Overview',
    badge: '/sgex/cat-paw-icon.svg',
    type: 'slideshow',
    content: [
      {
        title: 'Welcome to DAK Publications',
        content: \`
          <p>The DAK Publication system creates professional documents from your Digital Adaptation Kit content.</p>
          <ul>
            <li><strong>Multiple Formats:</strong> Export to HTML, PDF, and Word documents</li>
            <li><strong>WHO Branding:</strong> Automatic compliance with WHO style guidelines</li>
            <li><strong>Content Aggregation:</strong> Combines all 9 DAK components into cohesive publications</li>
            <li><strong>Template System:</strong> Customizable templates for different publication types</li>
          </ul>
        \`
      },
      {
        title: 'Publication Workflow',
        content: \`
          <p>Creating a DAK publication follows these steps:</p>
          <ol>
            <li><strong>Configure:</strong> Set metadata, authors, and publication details</li>
            <li><strong>Structure:</strong> Organize content and select components to include</li>
            <li><strong>Format:</strong> Choose template and styling options</li>
            <li><strong>Preview:</strong> Review output in different formats</li>
            <li><strong>Export:</strong> Generate final publication files</li>
          </ol>
        \`
      }
    ]
  },
  {
    id: 'template-editing',
    title: 'Template Editing Guide',
    badge: '/sgex/cat-paw-icon.svg',
    type: 'slideshow',
    content: [
      {
        title: 'WYSIWYG Template Editor',
        content: \`
          <p>The template editor provides visual editing capabilities:</p>
          <ul>
            <li><strong>Real-time Preview:</strong> See changes immediately as you edit</li>
            <li><strong>Component Blocks:</strong> Drag and drop pre-built WHO-compliant components</li>
            <li><strong>Style Controls:</strong> Adjust colors, fonts, and spacing</li>
            <li><strong>Variable System:</strong> Insert dynamic content using template variables</li>
          </ul>
        \`
      },
      {
        title: 'Template Variables',
        content: \`
          <p>Use these variables to insert dynamic content:</p>
          <ul>
            <li><code>{{publication.metadata.title}}</code> - Publication title</li>
            <li><code>{{publication.metadata.version}}</code> - Version number</li>
            <li><code>{{dakComponents.businessProcesses}}</code> - BPMN diagrams</li>
            <li><code>{{dakComponents.decisionSupportLogic}}</code> - DMN tables</li>
          </ul>
        \`
      }
    ]
  }
],

'publication-preview': [
  {
    id: 'preview-modes',
    title: 'Publication Preview Modes',
    badge: '/sgex/cat-paw-icon.svg',
    type: 'slideshow',
    content: [
      {
        title: 'Multi-Format Preview',
        content: \`
          <p>Preview your publication in different output formats:</p>
          <ul>
            <li><strong>HTML Preview:</strong> Interactive web version with navigation</li>
            <li><strong>PDF Preview:</strong> Print-ready layout with page breaks</li>
            <li><strong>Word Preview:</strong> Microsoft Word compatible formatting</li>
          </ul>
        \`
      }
    ]
  }
]
```

## 5. GitHub Integration Points

### 5.1 Publication Configuration Storage

**File Structure in DAK Repository:**
```
.sgex/
├── publication.json          # Publication configuration
├── templates/               # Custom templates (optional)
│   ├── custom-template/
│   │   ├── template.html
│   │   ├── styles.css
│   │   └── config.json
└── exports/                 # Generated publication files
    ├── html/
    ├── pdf/
    └── docx/
```

### 5.2 Automated Publication Updates

**File: `.github/workflows/publication-update.yml`**

```yaml
name: Update Publications

on:
  push:
    branches: [ main ]
    paths:
      - 'input/**'
      - '.sgex/publication.json'

jobs:
  update-publications:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install -g @sgex/publication-cli
        
    - name: Generate publications
      run: |
        sgex-publish --config .sgex/publication.json --output .sgex/exports/
        
    - name: Commit generated files
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add .sgex/exports/
        git commit -m "Auto-update publications [skip ci]" || exit 0
        git push
```

This proof of concept demonstrates how the DAK publication system would integrate seamlessly with the existing SGeX Workbench architecture while providing powerful new capabilities for creating professional WHO-compliant publications from DAK content.