# DAK Publication Generator Technical Specification

## Overview

This document provides detailed technical specifications for implementing the DAK Publication Generator system, following the WHO SMART Guidelines Digital Adaptation Kit logical model for creating consistent, professional publications in multiple formats.

## System Architecture

### Core Components

```
DAK Publication System
├── Content Extraction Layer
│   ├── DAKRepositoryAnalyzer
│   ├── ComponentMapper
│   └── MetadataExtractor
├── Template Management Layer
│   ├── TemplateEngine
│   ├── ConfigurationProcessor
│   └── StyleManager
├── Publication Generation Layer
│   ├── HTMLGenerator
│   ├── PDFGenerator
│   └── WordGenerator
└── Output Management Layer
    ├── AssetManager
    ├── PublicationPackager
    └── DistributionManager
```

### Technology Stack

**Core Technologies:**
- **Node.js**: Server-side processing and build scripts
- **Template Engine**: Mustache/Handlebars for template processing
- **PDF Generation**: Puppeteer for HTML-to-PDF conversion
- **Word Generation**: docx.js for Microsoft Word document creation
- **Configuration**: YAML for publication configuration files
- **Asset Processing**: Sharp for image optimization and processing

**Dependencies:**
```json
{
  "puppeteer": "^21.0.0",
  "docx": "^8.5.0",
  "mustache": "^4.2.0",
  "js-yaml": "^4.1.0",
  "sharp": "^0.32.0",
  "markdown-it": "^13.0.0",
  "prismjs": "^1.29.0"
}
```

## Content Extraction System

### DAK Repository Analyzer

```javascript
class DAKRepositoryAnalyzer {
  constructor(githubService) {
    this.github = githubService;
    this.componentMappers = new Map();
    this.initializeMappers();
  }

  async analyzeRepository(owner, repo, branch = 'main') {
    const repository = await this.github.getRepository(owner, repo);
    const config = await this.extractSushiConfig(repository);
    const components = await this.extractDAKComponents(repository);
    
    return {
      metadata: this.extractMetadata(config, repository),
      components: components,
      assets: await this.discoverAssets(repository),
      structure: await this.analyzeStructure(repository)
    };
  }

  async extractDAKComponents(repository) {
    const components = {};
    
    for (const [componentType, mapper] of this.componentMappers) {
      try {
        components[componentType] = await mapper.extract(repository);
      } catch (error) {
        console.warn(`Failed to extract ${componentType}:`, error.message);
        components[componentType] = null;
      }
    }
    
    return components;
  }

  initializeMappers() {
    this.componentMappers.set('healthInterventions', new HealthInterventionsMapper());
    this.componentMappers.set('personas', new PersonasMapper());
    this.componentMappers.set('userScenarios', new UserScenariosMapper());
    this.componentMappers.set('businessProcesses', new BusinessProcessesMapper());
    this.componentMappers.set('dataElements', new DataElementsMapper());
    this.componentMappers.set('decisionLogic', new DecisionLogicMapper());
    this.componentMappers.set('indicators', new IndicatorsMapper());
    this.componentMappers.set('requirements', new RequirementsMapper());
    this.componentMappers.set('testScenarios', new TestScenariosMapper());
  }
}
```

### Component Mapping Strategy

Each DAK component has a specialized mapper following a common interface:

```javascript
class ComponentMapper {
  constructor() {
    this.supportedFileTypes = [];
    this.processors = new Map();
  }

  async extract(repository) {
    const files = await this.discoverRelevantFiles(repository);
    const processedContent = await this.processFiles(files);
    return this.structureContent(processedContent);
  }

  async discoverRelevantFiles(repository) {
    // Component-specific file discovery logic
  }

  async processFiles(files) {
    // Process files using appropriate processors
  }

  structureContent(content) {
    // Structure content according to DAK logical model
  }
}
```

### Example: Business Processes Mapper

```javascript
class BusinessProcessesMapper extends ComponentMapper {
  constructor() {
    super();
    this.supportedFileTypes = ['.bpmn', '.md', '.json'];
    this.processors.set('.bpmn', new BPMNProcessor());
    this.processors.set('.md', new MarkdownProcessor());
    this.processors.set('.json', new JSONProcessor());
  }

  async discoverRelevantFiles(repository) {
    const patterns = [
      'input/bpmn/**/*.bpmn',
      'input/workflows/**/*.md',
      'input/pagecontent/business-processes.md',
      'business-processes/**/*'
    ];
    
    return await repository.findFiles(patterns);
  }

  async processFiles(files) {
    const processedContent = {
      workflows: [],
      diagrams: [],
      documentation: []
    };

    for (const file of files) {
      const processor = this.processors.get(path.extname(file.name));
      if (processor) {
        const content = await processor.process(file);
        this.categorizeContent(content, processedContent);
      }
    }

    return processedContent;
  }

  structureContent(content) {
    return {
      title: "Business Processes and Workflows",
      description: "Business processes and workflows for achieving health programme objectives",
      workflows: content.workflows.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        diagram: w.diagram,
        steps: w.steps,
        actors: w.actors
      })),
      summary: this.generateSummary(content)
    };
  }
}
```

## Template System

### Template Configuration Structure

```yaml
# Publication template configuration
template:
  id: "who-dak-standard-v1"
  name: "WHO DAK Standard Publication Template"
  version: "1.0.0"
  description: "Standard WHO SMART Guidelines DAK publication template"
  
  metadata:
    template_type: "dak-publication"
    who_compliant: true
    supported_languages: ["en", "es", "fr", "ar", "zh", "ru"]
    
  layout:
    page_size: "A4"
    margins:
      top: "2.5cm"
      bottom: "2.5cm"
      left: "2cm"
      right: "2cm"
    fonts:
      primary: "Arial, sans-serif"
      headings: "Arial Black, sans-serif"
      monospace: "Courier New, monospace"
      
  branding:
    primary_color: "#0078d4"
    secondary_color: "#005a9e"
    accent_color: "#40e0d0"
    logo: "who-logo.svg"
    watermark: "who-watermark.png"
    
  sections:
    cover:
      enabled: true
      template: "templates/cover-page.mustache"
      style: "styles/cover.css"
      
    copyright:
      enabled: true
      template: "templates/copyright.mustache"
      content: |
        © 2024 World Health Organization
        
        This work is available under the Creative Commons Attribution-ShareAlike 3.0 IGO licence 
        (CC BY-SA 3.0 IGO; https://creativecommons.org/licenses/by-sa/3.0/igo).
        
    table_of_contents:
      enabled: true
      template: "templates/toc.mustache"
      depth: 3
      page_numbers: true
      
    executive_summary:
      enabled: true
      template: "templates/executive-summary.mustache"
      auto_generate: true
      max_length: 500
      
    dak_components:
      health_interventions:
        enabled: true
        order: 1
        title: "Health Interventions and Recommendations"
        template: "templates/components/health-interventions.mustache"
        processors: ["markdown", "iris-references"]
        
      personas:
        enabled: true
        order: 2
        title: "Generic Personas"
        template: "templates/components/personas.mustache"
        processors: ["markdown", "actor-diagrams"]
        
      user_scenarios:
        enabled: true
        order: 3
        title: "User Scenarios"
        template: "templates/components/user-scenarios.mustache"
        processors: ["markdown", "scenario-flow"]
        
      business_processes:
        enabled: true
        order: 4
        title: "Business Processes and Workflows"
        template: "templates/components/business-processes.mustache"
        processors: ["markdown", "bpmn-diagrams", "workflow-tables"]
        
      data_elements:
        enabled: true
        order: 5
        title: "Core Data Elements"
        template: "templates/components/data-elements.mustache"
        processors: ["markdown", "data-dictionaries", "terminology"]
        
      decision_logic:
        enabled: true
        order: 6
        title: "Decision Support Logic"
        template: "templates/components/decision-logic.mustache"
        processors: ["markdown", "dmn-tables", "decision-trees"]
        
      indicators:
        enabled: true
        order: 7
        title: "Program Indicators"
        template: "templates/components/indicators.mustache"
        processors: ["markdown", "indicator-tables", "calculations"]
        
      requirements:
        enabled: true
        order: 8
        title: "Functional and Non-Functional Requirements"
        template: "templates/components/requirements.mustache"
        processors: ["markdown", "requirements-tables"]
        
      test_scenarios:
        enabled: true
        order: 9
        title: "Test Scenarios"
        template: "templates/components/test-scenarios.mustache"
        processors: ["markdown", "test-cases", "validation-rules"]
        
    appendices:
      glossary:
        enabled: true
        template: "templates/appendices/glossary.mustache"
        auto_generate: true
        
      references:
        enabled: true
        template: "templates/appendices/references.mustache"
        style: "ieee"
        
      technical_specifications:
        enabled: true
        template: "templates/appendices/technical-specs.mustache"
        
  output:
    formats:
      html:
        enabled: true
        single_page: true
        include_toc_sidebar: true
        syntax_highlighting: true
        responsive: true
        
      pdf:
        enabled: true
        engine: "puppeteer"
        options:
          format: "A4"
          printBackground: true
          preferCSSPageSize: true
          
      docx:
        enabled: true
        template: "templates/word/who-template.docx"
        styles: "templates/word/who-styles.xml"
        
      odt:
        enabled: false
        template: "templates/odt/who-template.odt"
```

### Template Engine Implementation

```javascript
class DAKTemplateEngine {
  constructor() {
    this.mustache = require('mustache');
    this.templateCache = new Map();
    this.partials = new Map();
    this.helpers = new Map();
    this.registerHelpers();
  }

  async loadTemplate(templateConfig) {
    const templateId = templateConfig.id;
    
    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId);
    }

    const template = await this.buildTemplate(templateConfig);
    this.templateCache.set(templateId, template);
    return template;
  }

  async buildTemplate(config) {
    const sections = [];
    
    // Load and order sections according to configuration
    for (const [sectionName, sectionConfig] of Object.entries(config.sections)) {
      if (sectionConfig.enabled) {
        const sectionTemplate = await this.loadSectionTemplate(sectionConfig);
        sections.push({
          name: sectionName,
          order: sectionConfig.order || 999,
          template: sectionTemplate,
          config: sectionConfig
        });
      }
    }

    // Sort sections by order
    sections.sort((a, b) => a.order - b.order);

    return {
      id: config.id,
      metadata: config.metadata,
      layout: config.layout,
      branding: config.branding,
      sections: sections,
      output: config.output
    };
  }

  async render(template, data) {
    const rendered = this.mustache.render(template.masterTemplate, data, this.partials);
    return this.postProcess(rendered, template);
  }

  registerHelpers() {
    this.helpers.set('formatDate', (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });

    this.helpers.set('generateTOC', (sections) => {
      return sections.map(section => ({
        title: section.title,
        level: section.level,
        anchor: this.generateAnchor(section.title),
        pageNumber: section.pageNumber
      }));
    });

    this.helpers.set('sanitizeHTML', (html) => {
      // Sanitize HTML content for safe rendering
      return DOMPurify.sanitize(html);
    });
  }
}
```

## Multi-Format Output Generation

### HTML Generator

```javascript
class HTMLPublicationGenerator {
  constructor(templateEngine) {
    this.templateEngine = templateEngine;
    this.cssProcessor = new CSSProcessor();
    this.assetManager = new AssetManager();
  }

  async generate(dakContent, template) {
    // Prepare template data
    const templateData = await this.prepareTemplateData(dakContent, template);
    
    // Render main content
    const html = await this.templateEngine.render(template, templateData);
    
    // Process CSS and assets
    const css = await this.cssProcessor.compile(template.branding, template.layout);
    const assets = await this.assetManager.processAssets(dakContent.assets);
    
    // Build complete HTML document
    const document = await this.buildHTMLDocument(html, css, assets, templateData);
    
    return {
      content: document,
      assets: assets,
      metadata: {
        title: templateData.metadata.title,
        description: templateData.metadata.description,
        author: "World Health Organization",
        created: new Date().toISOString()
      }
    };
  }

  async buildHTMLDocument(content, css, assets, data) {
    const template = `
<!DOCTYPE html>
<html lang="${data.metadata.language || 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${data.metadata.description}">
    <meta name="author" content="World Health Organization">
    <meta name="generator" content="SGEX DAK Publication Generator">
    
    <title>${data.metadata.title}</title>
    
    <style>
        ${css}
    </style>
    
    <!-- Print-specific styles for PDF generation -->
    <style media="print">
        @page {
            size: ${data.layout.page_size};
            margin: ${data.layout.margins.top} ${data.layout.margins.right} ${data.layout.margins.bottom} ${data.layout.margins.left};
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .no-print {
            display: none;
        }
    </style>
</head>
<body>
    ${content}
    
    <!-- Table of contents sidebar for web viewing -->
    <div class="toc-sidebar no-print">
        ${this.generateTOCSidebar(data)}
    </div>
</body>
</html>`;

    return template;
  }
}
```

### PDF Generator

```javascript
class PDFPublicationGenerator {
  constructor() {
    this.puppeteer = require('puppeteer');
    this.browser = null;
  }

  async initialize() {
    this.browser = await this.puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async generate(htmlContent, template) {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser.newPage();
    
    try {
      // Set up page for PDF generation
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Wait for any dynamic content to load
      await page.evaluate(() => {
        return new Promise((resolve) => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve);
          }
        });
      });

      // Generate PDF
      const pdfOptions = {
        format: template.output.pdf.options.format || 'A4',
        printBackground: template.output.pdf.options.printBackground !== false,
        preferCSSPageSize: template.output.pdf.options.preferCSSPageSize !== false,
        displayHeaderFooter: true,
        headerTemplate: this.generateHeaderTemplate(template),
        footerTemplate: this.generateFooterTemplate(template),
        margin: {
          top: '1.5cm',
          bottom: '1.5cm',
          left: '1cm',
          right: '1cm'
        }
      };

      const pdf = await page.pdf(pdfOptions);
      
      return {
        content: pdf,
        metadata: {
          format: 'PDF',
          pageCount: await this.getPageCount(pdf),
          size: pdf.length
        }
      };
      
    } finally {
      await page.close();
    }
  }

  generateHeaderTemplate(template) {
    return `
      <div style="font-size: 10px; margin: 0 1cm; width: 100%; display: flex; justify-content: space-between;">
        <span>${template.metadata.title}</span>
        <span>WHO SMART Guidelines</span>
      </div>
    `;
  }

  generateFooterTemplate(template) {
    return `
      <div style="font-size: 10px; margin: 0 1cm; width: 100%; display: flex; justify-content: space-between;">
        <span>© 2024 World Health Organization</span>
        <span class="pageNumber"></span>
      </div>
    `;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

### Word Document Generator

```javascript
class WordPublicationGenerator {
  constructor() {
    this.docx = require('docx');
    this.styleManager = new WordStyleManager();
  }

  async generate(dakContent, template) {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = this.docx;
    
    const sections = await this.buildSections(dakContent, template);
    const styles = await this.styleManager.loadWHOStyles();
    
    const doc = new Document({
      creator: "SGEX DAK Publication Generator",
      title: dakContent.metadata.title,
      description: dakContent.metadata.description,
      
      styles: styles,
      numbering: await this.buildNumbering(),
      
      sections: sections
    });

    const buffer = await Packer.toBuffer(doc);
    
    return {
      content: buffer,
      metadata: {
        format: 'DOCX',
        size: buffer.length,
        title: dakContent.metadata.title
      }
    };
  }

  async buildSections(dakContent, template) {
    const sections = [];

    // Cover page
    if (template.sections.cover?.enabled) {
      sections.push(await this.buildCoverSection(dakContent, template));
    }

    // Table of contents
    if (template.sections.table_of_contents?.enabled) {
      sections.push(await this.buildTOCSection(dakContent, template));
    }

    // DAK components
    for (const component of template.sections.dak_components) {
      if (component.enabled && dakContent.components[component.name]) {
        sections.push(await this.buildComponentSection(
          dakContent.components[component.name], 
          component, 
          template
        ));
      }
    }

    return sections;
  }

  async buildComponentSection(componentData, componentConfig, template) {
    const { Paragraph, TextRun, HeadingLevel } = this.docx;
    
    const children = [
      new Paragraph({
        text: componentConfig.title,
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true
      })
    ];

    if (componentData.description) {
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: componentData.description,
            italics: true
          })
        ]
      }));
    }

    // Process component content based on type
    const contentParagraphs = await this.processComponentContent(
      componentData, 
      componentConfig
    );
    children.push(...contentParagraphs);

    return {
      properties: {},
      children: children
    };
  }
}
```

## Configuration and CLI Interface

### Command Line Interface

```javascript
#!/usr/bin/env node

const { Command } = require('commander');
const DAKPublicationService = require('./src/services/DAKPublicationService');

const program = new Command();

program
  .name('dak-publisher')
  .description('WHO SMART Guidelines DAK Publication Generator')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate DAK publication from repository')
  .requiredOption('-r, --repo <repo>', 'GitHub repository (owner/repo)')
  .option('-b, --branch <branch>', 'Repository branch', 'main')
  .option('-t, --template <template>', 'Template configuration file', 'templates/who-dak-standard.yaml')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-f, --formats <formats>', 'Output formats (html,pdf,docx)', 'html,pdf')
  .action(async (options) => {
    try {
      const service = new DAKPublicationService();
      const result = await service.generatePublication(options);
      console.log('✅ Publication generated successfully:', result);
    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate DAK repository structure')
  .requiredOption('-r, --repo <repo>', 'GitHub repository (owner/repo)')
  .option('-b, --branch <branch>', 'Repository branch', 'main')
  .action(async (options) => {
    try {
      const service = new DAKPublicationService();
      const validation = await service.validateRepository(options);
      
      if (validation.isValid) {
        console.log('✅ Repository is valid for publication');
      } else {
        console.log('❌ Repository validation failed:');
        validation.errors.forEach(error => console.log(`  - ${error}`));
      }
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  });

program.parse();
```

### Package.json Scripts

```json
{
  "scripts": {
    "dak:generate": "node scripts/generate-dak-publication.js",
    "dak:validate": "node scripts/validate-dak-repository.js",
    "dak:templates": "node scripts/manage-dak-templates.js",
    "dak:preview": "node scripts/preview-dak-publication.js"
  }
}
```

## File Structure

```
sgex/
├── scripts/
│   ├── generate-dak-publication.js         # Main publication generator
│   ├── validate-dak-repository.js          # Repository validation
│   └── manage-dak-templates.js             # Template management
├── src/
│   ├── services/
│   │   ├── DAKPublicationService.js        # Main service class
│   │   ├── DAKRepositoryAnalyzer.js        # Repository analysis
│   │   ├── TemplateEngine.js               # Template processing
│   │   └── OutputGenerators/               # Format-specific generators
│   │       ├── HTMLGenerator.js
│   │       ├── PDFGenerator.js
│   │       └── WordGenerator.js
│   ├── mappers/                            # DAK component mappers
│   │   ├── ComponentMapper.js              # Base mapper class
│   │   ├── HealthInterventionsMapper.js
│   │   ├── BusinessProcessesMapper.js
│   │   └── ...                             # Other component mappers
│   └── processors/                         # Content processors
│       ├── MarkdownProcessor.js
│       ├── BPMNProcessor.js
│       ├── DMNProcessor.js
│       └── AssetProcessor.js
├── templates/
│   ├── who-dak-standard/                   # Standard WHO template
│   │   ├── config.yaml                     # Template configuration
│   │   ├── templates/                      # Mustache templates
│   │   │   ├── master.mustache
│   │   │   ├── cover-page.mustache
│   │   │   ├── components/
│   │   │   └── appendices/
│   │   ├── styles/                         # CSS styles
│   │   │   ├── main.css
│   │   │   ├── print.css
│   │   │   └── components/
│   │   └── assets/                         # Template assets
│   │       ├── who-logo.svg
│   │       └── fonts/
│   └── who-dak-compact/                    # Compact template variant
├── public/
│   └── docs/
│       ├── dak-publication-options-analysis.md
│       └── dak-publication-technical-spec.md
└── examples/                               # Example configurations
    ├── immunization-dak-config.yaml
    ├── anc-dak-config.yaml
    └── custom-template-config.yaml
```

## Implementation Timeline

### Phase 1: Foundation (4 weeks)
- ✅ Core DAK repository analyzer
- ✅ Basic component mappers
- ✅ Template engine foundation
- ✅ HTML output generation
- ✅ Configuration system

### Phase 2: Multi-Format Support (4 weeks)
- ⏳ PDF generation via Puppeteer
- ⏳ Word document generation
- ⏳ Asset management system
- ⏳ Template validation

### Phase 3: Advanced Features (4 weeks)
- ⏳ Web-based configuration interface
- ⏳ Preview system
- ⏳ Batch processing
- ⏳ Template marketplace

### Phase 4: Production Ready (2 weeks)
- ⏳ Performance optimization
- ⏳ Error handling and logging
- ⏳ Documentation and examples
- ⏳ CI/CD integration

## Testing Strategy

### Unit Tests
- Component mappers
- Template engine
- Output generators
- Configuration processing

### Integration Tests
- End-to-end publication generation
- Multi-format output validation
- Template inheritance testing
- Asset processing pipeline

### Performance Tests
- Large repository processing
- Memory usage optimization
- Concurrent generation capability
- Output file size optimization

This technical specification provides the foundation for implementing a comprehensive DAK publication generation system that meets WHO SMART Guidelines requirements while providing flexibility for customization and future enhancement.