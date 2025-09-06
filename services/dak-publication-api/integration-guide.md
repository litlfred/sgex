# DAK Publication Service Integration Guide

This guide explains how the DAK Publication Services API replaces YAML-based configurations with RESTful services that integrate with existing MCP and FAQ services.

## Architecture Overview

The service-oriented architecture eliminates YAML files in favor of dynamic service interactions:

```
┌─────────────────┐    ┌────────────────────┐    ┌─────────────────┐
│   SGeX WYSIWYG  │◄──►│ DAK Publication    │◄──►│   DAK FAQ MCP   │
│   Frontend      │    │ Services API       │    │   Service       │
└─────────────────┘    └────────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌────────────────────┐
                       │  Template Service  │
                       │  Variable Service  │
                       │  Asset Service     │
                       │  Generation Service│
                       └────────────────────┘
```

## Service Integration Patterns

### 1. Template Management (Replaces YAML Template Files)

**Before (YAML-based)**:
```yaml
# templates/who-dak-standard.yaml
template:
  id: who-dak-standard
  name: WHO DAK Standard Template
  sections:
    - id: executive-summary
      order: 1
      enabled: true
      template: |
        # Executive Summary
        ${publication.customPreface}
        ...
```

**After (API-based)**:
```javascript
// Create template via API
const template = await fetch('/api/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'WHO DAK Standard Template',
    templateType: 'standard',
    sections: [
      {
        id: 'executive-summary',
        name: 'Executive Summary',
        order: 1,
        enabled: true,
        template: '# Executive Summary\n${publication.customPreface}\n...'
      }
    ]
  })
});

// Retrieve template dynamically
const templateConfig = await fetch(`/api/templates/${templateId}`).then(r => r.json());
```

### 2. Variable Resolution (Replaces YAML Parameter Registry)

**Before (YAML-based)**:
```yaml
# parameters/registry.yaml
dak:
  repository:
    type: string
    required: true
    description: "GitHub repository URL"
component:
  businessProcess:
    bpmnDirectory:
      type: string
      default: "input/images"
```

**After (API-based with FAQ Integration)**:
```javascript
// Resolve variables through service integration
const variables = await fetch('/api/variables/resolve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dakRepository: 'who/smart-immunizations',
    templateId: 'who-dak-standard-v1',
    serviceIntegration: {
      useFAQ: true,  // Use FAQ service for content extraction
      useMCP: true   // Use MCP for AI-driven content
    }
  })
});

// Variables are resolved dynamically from multiple sources:
// - User-editable content
// - DAK metadata (from FAQ service)
// - MCP service results
// - Asset metadata
```

### 3. FAQ Service Integration

The API integrates with the existing DAK FAQ MCP service to extract DAK content dynamically:

```javascript
// Batch execute FAQ questions for content extraction
const faqResults = await fetch('/api/integrations/faq/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dakRepository: 'who/smart-immunizations',
    questions: [
      { questionId: 'dak-name', parameters: { repository: 'who/smart-immunizations' } },
      { questionId: 'dak-version', parameters: { repository: 'who/smart-immunizations' } },
      { questionId: 'business-process-workflows', parameters: { componentType: 'businessProcess' } }
    ]
  })
});

// Results are automatically integrated into template variables
const { results } = faqResults;
// results[0].result.structured.name -> Used for ${dak.name}
// results[1].result.structured.version -> Used for ${dak.version}  
// results[2].result.structured.workflows -> Used for ${components.businessProcesses.workflows}
```

## WYSIWYG Integration Workflow

### 1. Template Selection and Configuration

```javascript
// Frontend: Get available templates
const templates = await fetch('/api/templates?templateType=standard').then(r => r.json());

// User selects template
const selectedTemplate = templates.templates[0];

// Get template configuration
const templateConfig = await fetch(`/api/templates/${selectedTemplate.id}`).then(r => r.json());
```

### 2. User Content Management

```javascript
// Frontend: Get user-editable content fields
const editableFields = await fetch(
  `/api/content/user/${dakRepository}/fields?templateId=${templateId}`
).then(r => r.json());

// Load existing user content
const userContent = await fetch(
  `/api/content/user/${dakRepository}?templateId=${templateId}`
).then(r => r.json());

// Update user content via WYSIWYG editor
const updatedContent = await fetch(`/api/content/user/${dakRepository}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId,
    content: {
      'publication.title': 'Custom Publication Title',
      'publication.customPreface': '<p>Custom preface content...</p>',
      'components.healthInterventions.summary': '<p>Custom summary...</p>'
    }
  })
});
```

### 3. Real-time Variable Resolution

```javascript
// Frontend: Resolve variables with user content and service integration
const resolvedVariables = await fetch('/api/variables/resolve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dakRepository,
    templateId,
    userContent: userEditableContent,
    serviceIntegration: {
      useFAQ: true,      // Extract DAK metadata via FAQ service
      useMCP: true,      // Use MCP for AI content generation
      useAssetMetadata: true  // Include asset metadata
    }
  })
});

// Variables object contains:
// {
//   publication: { title: "Custom Title", copyright: "© 2024 WHO", ... },
//   dak: { name: "Smart Immunizations", version: "1.0.0", ... },
//   components: { 
//     healthInterventions: { count: 5, assets: [...], ... },
//     businessProcesses: { workflows: [...], ... }
//   }
// }
```

### 4. Publication Generation with WYSIWYG Support

```javascript
// Frontend: Generate publication with WYSIWYG capabilities
const publication = await fetch('/api/publications/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dakRepository,
    templateId,
    formats: ['html'],
    userContent: userEditableContent,
    options: {
      wysiwygMode: true,    // Include WYSIWYG editing in output
      includeAssets: true,
      generateTOC: true
    }
  })
});

// Response includes:
// {
//   publicationId: "uuid",
//   formats: [{ format: "html", url: "/publications/uuid.html" }],
//   wysiwygSupport: {
//     enabled: true,
//     editableFields: ["publication.title", "publication.customPreface", ...],
//     toolbarUrl: "/wysiwyg/toolbar.js"
//   }
// }
```

## Service Implementation Example

Here's how to implement a service that replaces YAML configuration:

### Template Service Implementation

```typescript
// services/template.service.ts
export class TemplateService {
  
  // Replace YAML template loading with database/API storage
  async getTemplate(templateId: string): Promise<Template> {
    // Instead of: fs.readFileSync(`templates/${templateId}.yaml`)
    const template = await this.database.templates.findById(templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    return template;
  }
  
  // Dynamic template creation instead of static YAML files
  async createTemplate(request: CreateTemplateRequest): Promise<Template> {
    const template: Template = {
      id: generateId(),
      name: request.name,
      templateType: request.templateType,
      sections: request.sections,
      variables: this.extractVariables(request.sections),
      created: new Date(),
      lastModified: new Date()
    };
    
    await this.database.templates.create(template);
    return template;
  }
  
  // Extract variables from template content
  private extractVariables(sections: TemplateSection[]): TemplateVariableDefinitions {
    const variables: TemplateVariableDefinitions = {
      publication: {},
      dak: {},
      components: {}
    };
    
    for (const section of sections) {
      const sectionVariables = this.parseTemplateVariables(section.template);
      this.mergeVariables(variables, sectionVariables);
    }
    
    return variables;
  }
}
```

### Variable Resolution Service

```typescript
// services/variable-resolution.service.ts
export class VariableResolutionService {
  
  constructor(
    private faqService: FAQService,
    private mcpService: MCPService,
    private assetService: AssetService
  ) {}
  
  async resolveVariables(request: VariableResolutionRequest): Promise<VariableResolutionResponse> {
    const variables: any = {};
    const sources = {
      userContent: [],
      dakMetadata: [],
      faqService: [],
      mcpService: []
    };
    
    // 1. Start with user-editable content
    if (request.userContent) {
      Object.assign(variables, request.userContent);
      sources.userContent = Object.keys(request.userContent);
    }
    
    // 2. Extract DAK metadata via FAQ service (replaces YAML parameter registry)
    if (request.serviceIntegration?.useFAQ) {
      const dakMetadata = await this.extractDAKMetadata(request.dakRepository);
      this.mergeVariables(variables, dakMetadata);
      sources.faqService = Object.keys(dakMetadata);
    }
    
    // 3. Generate AI content via MCP service
    if (request.serviceIntegration?.useMCP) {
      const mcpContent = await this.generateMCPContent(request);
      this.mergeVariables(variables, mcpContent);
      sources.mcpService = Object.keys(mcpContent);
    }
    
    // 4. Enrich with asset metadata
    if (request.serviceIntegration?.useAssetMetadata) {
      const assetMetadata = await this.assetService.getAssetMetadata(request.dakRepository);
      variables.components = this.enrichComponentsWithAssets(variables.components, assetMetadata);
    }
    
    return {
      variables,
      sources,
      errors: [],
      metadata: {
        resolvedAt: new Date().toISOString(),
        sources: Object.keys(sources).filter(key => sources[key].length > 0)
      }
    };
  }
  
  // Extract DAK metadata using FAQ service instead of YAML parsing
  private async extractDAKMetadata(dakRepository: string): Promise<any> {
    const faqQuestions = [
      { questionId: 'dak-name', parameters: { repository: dakRepository } },
      { questionId: 'dak-version', parameters: { repository: dakRepository } },
      { questionId: 'business-process-workflows', parameters: { componentType: 'businessProcess' } }
    ];
    
    const results = await this.faqService.batchExecute({
      dakRepository,
      questions: faqQuestions
    });
    
    const metadata = {
      dak: {
        name: results.results[0]?.result?.structured?.name || 'Unknown DAK',
        version: results.results[1]?.result?.structured?.version || '1.0.0'
      },
      components: {
        businessProcesses: {
          workflows: results.results[2]?.result?.structured?.workflows || []
        }
      }
    };
    
    return metadata;
  }
}
```

## Migration from YAML to API Services

### Step 1: Inventory YAML Files

Current YAML files to migrate:
- `docs/dak/faq/parameters/registry.yaml` → Variable resolution service
- Template YAML configurations → Template management service  
- Asset metadata YAML → Asset metadata service

### Step 2: Create Service Endpoints

1. **Template Service**: `/api/templates/*` - Manage publication templates
2. **Variable Service**: `/api/variables/*` - Resolve template variables
3. **Asset Service**: `/api/assets/*` - Manage asset metadata
4. **Integration Service**: `/api/integrations/*` - Integrate with MCP/FAQ services

### Step 3: Update Frontend Integration

```javascript
// Replace YAML loading with API calls
// Before:
// const config = yaml.load(fs.readFileSync('config.yaml'));

// After:
const config = await fetch('/api/templates/who-dak-standard-v1').then(r => r.json());
```

### Step 4: Service Integration Points

1. **FAQ Service Integration**: Batch execute FAQ questions for DAK metadata
2. **MCP Service Integration**: Use MCP for AI-driven content generation
3. **Template Service**: Dynamic template management without YAML files
4. **Variable Service**: Real-time variable resolution from multiple sources

## Benefits of API-Driven Architecture

1. **Dynamic Configuration**: Templates and variables can be updated without file deployments
2. **Service Integration**: Seamless integration with MCP and FAQ services
3. **Real-time Updates**: WYSIWYG editing with live variable resolution
4. **Scalability**: Services can be scaled independently
5. **Consistency**: Single source of truth through API endpoints
6. **Extensibility**: Easy to add new variable sources and template types

## Implementation Checklist

- [x] Create OpenAPI specification for DAK Publication Services
- [x] Define service integration patterns with MCP and FAQ services  
- [ ] Implement Template Management Service
- [ ] Implement Variable Resolution Service with FAQ integration
- [ ] Implement Asset Metadata Service
- [ ] Implement Publication Generation Service with WYSIWYG support
- [ ] Create frontend integration layer
- [ ] Migrate existing YAML configurations to API services
- [ ] Add comprehensive testing for service integrations
- [ ] Document API usage and migration guides

This architecture ensures that the WYSIWYG DAK publication system is fully service-oriented, eliminating YAML files while providing seamless integration with existing MCP and FAQ services.