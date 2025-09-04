# DAK Publication Generation Options Analysis

## Executive Summary

This document analyzes options for implementing a WHO SMART Guidelines Digital Adaptation Kit (DAK) publication generation system. The goal is to create consistent, professional publications in multiple formats (HTML, PDF, Word/ODT) that follow the WHO DAK logical model structure and support WYSIWYG template editing.

## Problem Statement

Based on the provided WHO published DAK PDFs, there is a need for:

1. **Consistent Publication Templates**: Standardized layout and styling across all DAK publications
2. **Multi-Format Output**: Support for static HTML (CDN), PDF documents, and Word/ODT formats
3. **DAK Logical Model Compliance**: Publications should follow the WHO SMART Guidelines DAK logical model structure
4. **Content Augmentation**: Support for copyright statements, pre-matter, and other publication metadata
5. **WYSIWYG Template Editing**: User-friendly template customization capabilities

## Current Infrastructure Analysis

### Existing Documentation Generation System

The repository already includes a sophisticated documentation generation system:

- **`scripts/generate-dak-faq-docs.js`**: Complete HTML document generator
- **Markdown-to-HTML conversion**: Advanced processing with syntax highlighting
- **Professional styling**: WHO-compliant CSS styling and branding
- **Template infrastructure**: Configurable sections and content organization
- **Multi-source content extraction**: Combines multiple documentation sources

### WHO DAK Logical Model Structure

The WHO SMART Guidelines DAK logical model defines:

```fsh
Logical: DAK
* metadata 1..1 BackboneElement "Metadata"
  * identifier 1..1 id "DAK ID"
  * canonical 1..1 canonical "Canonical URL"
  * name 1..1 string "Name"

// 9 DAK Components:
* healthInterventions 0..* HealthInterventions
* personas 0..* GenericPersona
* userScenarios 0..* UserScenario
* businessProcesses 0..* BusinessProcessWorkflow
* dataElements 0..* CoreDataElement
* decisionLogic 0..* DecisionSupportLogic
* indicators 0..* ProgramIndicator
* requirements 0..* Requirements
* testScenarios 0..* TestScenario
```

### Current Capabilities Assessment

**Strengths:**
- Proven HTML generation with professional styling
- DAK repository analysis and content extraction
- WHO branding and accessibility compliance
- Markdown processing with code highlighting
- Template-based document structure

**Gaps:**
- No PDF generation capability
- No Word/ODT output format support
- No WYSIWYG template editing interface
- Limited to FAQ documentation structure
- No publication metadata management

## Option 1: Extend Existing Documentation Generator

### Description
Extend the current `generate-dak-faq-docs.js` system to support DAK publication generation.

### Implementation Approach
1. **Refactor core generator**: Abstract common functionality for reuse
2. **Create DAK publication module**: New generator specifically for DAK publications
3. **Add output format support**: PDF and Word/ODT generation capabilities
4. **Implement template system**: Configuration-driven publication templates

### Technical Architecture
```javascript
class DAKPublicationGenerator extends DocumentationGenerator {
  constructor(dakRepository, publicationConfig) {
    super();
    this.dakRepo = dakRepository;
    this.config = publicationConfig;
  }

  async generatePublication() {
    const dakData = await this.extractDAKContent();
    const html = await this.generateHTML(dakData);
    
    // Multi-format output
    const outputs = await Promise.all([
      this.generatePDF(html),
      this.generateWord(html),
      this.saveHTML(html)
    ]);
    
    return outputs;
  }
}
```

### Content Extraction Strategy
- **Repository analysis**: Parse DAK repository structure and files
- **Component mapping**: Map repository contents to DAK logical model components
- **Metadata extraction**: Extract publication metadata from sushi-config.yaml
- **Content aggregation**: Combine component content into publication structure

### Template Structure
```yaml
publication:
  metadata:
    title: "${dak.name} - Digital Adaptation Kit"
    copyright: "© 2024 World Health Organization"
    version: "${dak.version}"
    date: "${generation.date}"
  
  sections:
    - type: "cover"
      template: "dak-cover.html"
    - type: "toc"
      template: "dak-toc.html"
    - type: "component"
      name: "healthInterventions"
      template: "dak-health-interventions.html"
    # ... additional components
```

### Pros
- **Leverages existing proven infrastructure**
- **Faster development timeline**
- **Consistent with current architecture**
- **Reuses existing styling and branding**

### Cons
- **May require significant refactoring**
- **Limited by existing architecture constraints**
- **Potential coupling with FAQ-specific features**

### Estimated Complexity: **Medium**

## Option 2: New Dedicated DAK Publication System

### Description
Create a new, purpose-built DAK publication generation system designed specifically for WHO DAK publications.

### Implementation Approach
1. **Clean architecture**: Purpose-built for DAK publication requirements
2. **Microservice pattern**: Separate publication service with clear APIs
3. **Template-first design**: Publication templates as first-class citizens
4. **Multi-format from the ground up**: Native support for all output formats

### Technical Architecture
```javascript
class DAKPublicationService {
  constructor() {
    this.templateEngine = new DAKTemplateEngine();
    this.contentExtractor = new DAKContentExtractor();
    this.formatGenerators = {
      html: new HTMLGenerator(),
      pdf: new PDFGenerator(),
      word: new WordGenerator()
    };
  }

  async createPublication(dakRepo, templateConfig) {
    const content = await this.contentExtractor.extract(dakRepo);
    const template = await this.templateEngine.load(templateConfig);
    
    const publications = {};
    for (const [format, generator] of Object.entries(this.formatGenerators)) {
      publications[format] = await generator.generate(content, template);
    }
    
    return publications;
  }
}
```

### Template System Design
- **Modular templates**: Separate templates for each DAK component
- **Inheritance support**: Base templates with component-specific overrides
- **Styling separation**: CSS/styling separate from content templates
- **Metadata integration**: Rich metadata support throughout templates

### Content Mapping Strategy
```javascript
const DAK_COMPONENT_MAPPING = {
  healthInterventions: {
    sources: ['input/pagecontent/health-interventions.md', 'input/iris-references/'],
    template: 'health-interventions.mustache',
    processor: 'markdownProcessor'
  },
  businessProcesses: {
    sources: ['input/bpmn/*.bpmn', 'input/workflows/'],
    template: 'business-processes.mustache',
    processor: 'bpmnProcessor'
  },
  // ... other components
};
```

### Pros
- **Clean, purpose-built architecture**
- **Optimal for DAK-specific requirements**
- **No legacy constraints**
- **Better separation of concerns**

### Cons
- **Longer development timeline**
- **More initial architecture work**
- **Potential code duplication**
- **Need to rebuild proven capabilities**

### Estimated Complexity: **High**

## Option 3: Template-Based System with WYSIWYG Editor

### Description
Create a user-facing template management system with WYSIWYG editing capabilities for non-technical users.

### Implementation Approach
1. **Rich template editor**: Web-based WYSIWYG editor for template customization
2. **Component library**: Drag-and-drop DAK component blocks
3. **Real-time preview**: Live preview of publication output
4. **Template repository**: Shared template library and version management

### Technical Architecture
```javascript
class DAKTemplateEditor {
  constructor() {
    this.editor = new WYSIWYGEditor();
    this.componentLibrary = new DAKComponentLibrary();
    this.previewEngine = new LivePreviewEngine();
  }

  async loadTemplate(templateId) {
    const template = await this.templateRepository.load(templateId);
    this.editor.setContent(template);
    this.updatePreview();
  }

  onTemplateChange() {
    this.updatePreview();
    this.autoSave();
  }
}
```

### WYSIWYG Editor Features
- **Rich text editing**: Full-featured text editor with WHO styling
- **Component insertion**: Drag-and-drop DAK component blocks
- **Style customization**: Color schemes, fonts, layout options
- **Preview modes**: Desktop, mobile, and print preview
- **Template validation**: Ensure DAK logical model compliance

### User Experience Flow
1. **Template selection**: Choose from WHO template library
2. **Content mapping**: Map DAK repository to template sections
3. **Customization**: Use WYSIWYG editor to modify template
4. **Preview**: Real-time preview in all output formats
5. **Generation**: Generate final publications
6. **Publishing**: Save and share generated publications

### Pros
- **User-friendly for non-developers**
- **Real-time feedback and preview**
- **Flexible customization capabilities**
- **Template sharing and reuse**

### Cons
- **Very complex to implement**
- **Significant UI/UX development required**
- **Performance challenges with real-time preview**
- **Template validation complexity**

### Estimated Complexity: **Very High**

## Option 4: Hybrid Configuration-Driven Approach (Recommended)

### Description
Combine the strengths of existing infrastructure with new DAK-specific capabilities through a configuration-driven approach that can evolve toward WYSIWYG editing.

### Implementation Approach
1. **Phase 1**: Extend existing generator with DAK publication support
2. **Phase 2**: Add PDF and Word output capabilities
3. **Phase 3**: Create web-based configuration interface
4. **Phase 4**: Evolve toward WYSIWYG template editing

### Technical Architecture
```javascript
class HybridDAKPublisher {
  constructor() {
    this.baseGenerator = new DocumentationGenerator();
    this.dakAnalyzer = new DAKRepositoryAnalyzer();
    this.templateManager = new ConfigurableTemplateManager();
    this.outputGenerators = new MultiFormatOutputSystem();
  }

  async generateDAKPublication(dakRepo, publicationConfig) {
    // Phase 1: Content extraction using existing proven methods
    const dakContent = await this.dakAnalyzer.extractDAKComponents(dakRepo);
    
    // Phase 2: Template processing with configuration
    const template = await this.templateManager.buildTemplate(publicationConfig);
    
    // Phase 3: Multi-format generation
    const outputs = await this.outputGenerators.generate(dakContent, template);
    
    return outputs;
  }
}
```

### Configuration Structure
```yaml
# dak-publication-config.yaml
publication:
  metadata:
    title: "${dak.name}"
    subtitle: "WHO SMART Guidelines Digital Adaptation Kit"
    copyright: "© 2024 World Health Organization"
    license: "CC BY-SA 3.0 IGO"
    version: "${dak.version}"
    
  template:
    name: "who-dak-standard"
    theme: "who-blue"
    layout: "standard"
    
  sections:
    cover:
      enabled: true
      template: "cover-page"
      logo: "who-logo.svg"
      
    toc:
      enabled: true
      depth: 3
      
    components:
      healthInterventions:
        enabled: true
        title: "Health Interventions and Recommendations"
        template: "health-interventions"
        content_sources:
          - "input/pagecontent/health-interventions.md"
          - "input/iris-references/"
          
      businessProcesses:
        enabled: true
        title: "Business Processes and Workflows"
        template: "business-processes"
        content_sources:
          - "input/bpmn/*.bpmn"
          - "input/workflows/"
        processors:
          - "bpmn-diagram-generator"
          - "workflow-table-generator"
          
    # ... other DAK components
    
  output:
    formats: ["html", "pdf", "docx"]
    html:
      single_page: true
      toc_sidebar: true
      syntax_highlighting: true
      
    pdf:
      page_size: "A4"
      margins: "2cm"
      footer: "© WHO ${year}"
      
    docx:
      template: "who-document-template.docx"
      styles: "who-styles.xml"
```

### Multi-Format Output Implementation

#### HTML Generation
```javascript
class HTMLPublicationGenerator {
  async generate(dakContent, template) {
    const html = await this.templateEngine.render('base-template.html', {
      metadata: dakContent.metadata,
      sections: dakContent.sections,
      style: template.theme
    });
    
    return {
      content: html,
      assets: await this.generateAssets(dakContent),
      metadata: dakContent.metadata
    };
  }
}
```

#### PDF Generation Options
1. **Headless Chrome/Puppeteer**: Convert HTML to PDF with full CSS support
2. **jsPDF**: JavaScript PDF generation library
3. **PDFKit**: More control over PDF layout and formatting

```javascript
class PDFPublicationGenerator {
  async generate(dakContent, template) {
    // Option 1: HTML-to-PDF via Puppeteer
    const html = await this.htmlGenerator.generate(dakContent, template);
    const pdf = await this.puppeteer.generatePDF(html.content, {
      format: 'A4',
      printBackground: true,
      margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' }
    });
    
    return pdf;
  }
}
```

#### Word Document Generation
```javascript
class WordPublicationGenerator {
  async generate(dakContent, template) {
    // Using docx.js library
    const doc = new Document({
      sections: await this.buildSections(dakContent),
      styles: await this.loadWHOStyles(),
      numbering: await this.buildNumbering()
    });
    
    return await Packer.toBuffer(doc);
  }
}
```

### Phase 1: Foundation (MVP)
- **Extend existing generator** for DAK content extraction
- **Basic HTML output** following DAK logical model
- **Configuration-driven templates** using YAML
- **WHO styling and branding** compliance

### Phase 2: Multi-Format Support
- **PDF generation** via Puppeteer or similar
- **Word document generation** using docx.js
- **Asset management** for images, diagrams, etc.
- **Template validation** and error handling

### Phase 3: Web Interface
- **Configuration editor** for publication settings
- **Template preview** capabilities
- **Repository selection** and analysis UI
- **Publication management** dashboard

### Phase 4: WYSIWYG Evolution
- **Visual template editor** for advanced users
- **Component drag-and-drop** interface
- **Real-time preview** system
- **Template sharing** and version control

### Pros
- **Incremental development** with early value delivery
- **Leverages existing proven infrastructure**
- **Evolution path** toward advanced features
- **Balances complexity with capability**
- **Configuration-driven** flexibility

### Cons
- **Longer overall timeline** due to phases
- **Initial complexity** in configuration system
- **Need coordination** between phases

### Estimated Complexity: **Medium-High**

## Output Format Technical Analysis

### HTML Generation
**Advantages:**
- Reuse existing proven HTML generation system
- Full CSS styling support
- Responsive design capabilities
- Easy to host on CDN

**Implementation:**
- Extend current CSS styling for publication layout
- Add print media queries for PDF-friendly styling
- Implement single-page document structure

### PDF Generation
**Option A: Puppeteer (Recommended)**
```javascript
const pdf = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: {
    top: '2cm',
    bottom: '2cm', 
    left: '2cm',
    right: '2cm'
  }
});
```

**Advantages:**
- Full CSS support including complex layouts
- Perfect for HTML-first approach
- Maintains styling consistency

**Disadvantages:**
- Requires headless Chrome
- Larger resource requirements

**Option B: jsPDF**
**Advantages:**
- Lightweight, browser-compatible
- Good for simple layouts

**Disadvantages:**
- Limited CSS support
- More complex for rich layouts

### Word/ODT Generation
**Option A: docx.js (Recommended)**
```javascript
const doc = new Document({
  sections: [{
    properties: {},
    children: [
      new Paragraph({
        children: [
          new TextRun("Digital Adaptation Kit Publication")
        ]
      })
    ]
  }]
});
```

**Option B: mammoth.js for conversion**
- Convert from HTML to Word format
- Simpler approach but less control

## Template System Design

### Template Inheritance Hierarchy
```
base-template.html
├── who-dak-standard.html
├── who-dak-compact.html
└── who-dak-extended.html
    ├── cover-page.html
    ├── table-of-contents.html
    ├── component-sections/
    │   ├── health-interventions.html
    │   ├── business-processes.html
    │   ├── decision-logic.html
    │   └── ...
    └── appendices.html
```

### Content Processing Pipeline
```
DAK Repository → Content Extraction → Template Processing → Multi-Format Output
      ↓                   ↓                    ↓                      ↓
  File Analysis     Component Mapping    Template Rendering    Format-Specific
  Metadata Parse    Content Aggregation  Variable Substitution    Generation
  Asset Discovery   Validation           Style Application        Asset Packaging
```

## Recommended Implementation Plan

### Phase 1: Foundation (Weeks 1-4)
1. **Refactor existing generator** to support multiple document types
2. **Implement DAK content extractor** following logical model
3. **Create basic HTML templates** for DAK publications
4. **Add configuration system** for publication customization

### Phase 2: Multi-Format Output (Weeks 5-8)
1. **Implement PDF generation** using Puppeteer
2. **Add Word document generation** using docx.js
3. **Create asset management system** for images and diagrams
4. **Implement template validation** and error handling

### Phase 3: Web Interface (Weeks 9-12)
1. **Build configuration editor** web interface
2. **Add repository selection** and analysis UI
3. **Implement preview system** for all formats
4. **Create publication management** dashboard

### Phase 4: Advanced Features (Weeks 13-16)
1. **Template marketplace** for sharing custom templates
2. **Advanced styling options** and theme system
3. **Batch publication** capabilities
4. **Integration with CI/CD** for automated publication

## Conclusion

**Recommended Approach: Option 4 - Hybrid Configuration-Driven System**

This approach provides the optimal balance of:
- **Immediate value** through leveraging existing infrastructure
- **Professional output** with multi-format support
- **Scalability** with clear evolution path
- **User accessibility** through configuration-driven templates
- **WHO compliance** with proper branding and styling

The phased implementation allows for:
- Early delivery of core functionality
- Incremental complexity increase
- User feedback incorporation
- Risk mitigation through proven foundations

This system will enable WHO and partners to create consistent, professional DAK publications while maintaining the flexibility to customize templates and content organization according to specific needs.