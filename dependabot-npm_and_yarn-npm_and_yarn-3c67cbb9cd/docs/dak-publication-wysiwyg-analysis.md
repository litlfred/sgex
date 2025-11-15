# DAK Publication WYSIWYG Architecture and Smart-Base Model Extensions

## Executive Summary

This document provides a detailed analysis of WYSIWYG-first architecture for DAK publication generation and identifies required extensions to the WHO smart-base logical model. The analysis addresses the need for user-editable content, template variables structured around DAK components, and asset metadata management for publication structure.

## WYSIWYG-First Architecture Requirements

### Core WYSIWYG Design Principles

1. **Visual Template Editor**: Users should be able to visually design publication templates
2. **Inline Content Editing**: Direct editing of publication content with live preview
3. **Template Variable System**: Smart template variables aware of DAK component structure
4. **Asset Metadata Management**: Rich metadata for all DAK assets used in publications
5. **User-Customizable Content**: Editable sections like copyright notices, prefaces, and custom content

### Template Variable Architecture

The template system must be structured around DAK components with hierarchical variable access:

```javascript
// Template Variable Structure
template.variables = {
  // Publication metadata (user-editable)
  publication: {
    title: "${user.editable}",
    subtitle: "${user.editable}",
    copyright: "${user.editable}",
    publishDate: "${auto.generated}",
    version: "${dak.metadata.version}",
    customPreface: "${user.editable.rich_text}"
  },
  
  // DAK metadata (auto-extracted)
  dak: {
    metadata: {
      name: "${dak.logical.metadata.name}",
      canonical: "${dak.logical.metadata.canonical}",
      version: "${dak.logical.metadata.version}",
      description: "${dak.logical.metadata.description}"
    }
  },
  
  // Component-specific variables
  components: {
    healthInterventions: {
      count: "${auto.calculated}",
      assets: "${component.assets.metadata}",
      summary: "${user.editable}",
      content: "${auto.extracted}"
    },
    businessProcesses: {
      workflows: "${component.bpmn.metadata}",
      diagrams: "${component.assets.diagrams}",
      customDescription: "${user.editable}"
    }
    // ... other components
  }
};
```

### WYSIWYG Editor Requirements

#### 1. Visual Template Designer
- **Drag-and-drop interface** for arranging publication sections
- **Live preview** with real DAK data
- **Component library** for standard WHO publication elements
- **Responsive design tools** for multi-format output

#### 2. Content Editor
- **Rich text editing** for user-customizable content
- **Template variable insertion** with auto-completion
- **Preview mode** showing final publication appearance
- **Version control** for template changes

#### 3. Asset Management
- **Visual asset browser** for DAK component assets
- **Metadata editor** for asset descriptions and usage
- **Preview integration** showing assets in publication context

## Required Smart-Base Logical Model Extensions

Based on the analysis of publication requirements, the following extensions to the WHO smart-base logical model are needed:

### 1. DAK Publication Metadata Extension

```fsh
// New logical model for publication-specific metadata
Logical: DAKPublicationMetadata
Id: dak-publication-metadata
* publication 1..1 BackboneElement "Publication Information"
  * title 1..1 string "Publication Title"
  * subtitle 0..1 string "Publication Subtitle"
  * publisher 1..1 string "Publisher Name"
  * publishDate 0..1 date "Publication Date"
  * copyright 1..1 string "Copyright Statement"
  * license 1..1 string "License Information"
  * customPreface 0..1 markdown "Custom Preface Content"
  * customFooter 0..1 markdown "Custom Footer Content"
  * branding 0..1 BackboneElement "Branding Configuration"
    * primaryColor 0..1 string "Primary Brand Color"
    * secondaryColor 0..1 string "Secondary Brand Color"
    * logo 0..1 uri "Brand Logo URI"
    * customCSS 0..1 string "Custom CSS Styles"

// Extension to main DAK logical model
Logical: DAK
// ... existing content
* publicationMetadata 0..1 DAKPublicationMetadata "Publication Metadata"
```

### 2. Asset Metadata Extension

```fsh
// Enhanced asset metadata for publication usage
Logical: DAKAssetMetadata
Id: dak-asset-metadata
* identifier 1..1 id "Asset ID"
* type 1..1 code "Asset Type" // BPMN, DMN, FHIR, Image, Document
* title 1..1 string "Asset Title"
* description 0..1 markdown "Asset Description"
* source 1..1 uri "Asset Source Location"
* publicationUsage 0..* BackboneElement "Publication Usage"
  * section 1..1 code "Publication Section"
  * displayType 1..1 code "Display Type" // inline, figure, appendix
  * caption 0..1 string "Caption Text"
  * altText 0..1 string "Alternative Text"
  * order 0..1 integer "Display Order"
* metadata 0..* BackboneElement "Additional Metadata"
  * key 1..1 string "Metadata Key"
  * value 1..1 string "Metadata Value"
```

### 3. Component-Specific Metadata Extensions

```fsh
// Health Interventions publication metadata
Logical: HealthInterventions
// ... existing content
* publicationMetadata 0..1 BackboneElement "Publication Metadata"
  * summary 0..1 markdown "Component Summary"
  * customIntroduction 0..1 markdown "Custom Introduction"
  * assets 0..* DAKAssetMetadata "Associated Assets"

// Business Process publication metadata
Logical: BusinessProcessWorkflow
// ... existing content
* publicationMetadata 0..1 BackboneElement "Publication Metadata"
  * workflowDiagram 0..1 DAKAssetMetadata "Workflow Diagram"
  * customDescription 0..1 markdown "Custom Description"
  * relatedDocuments 0..* DAKAssetMetadata "Related Documents"

// Core Data Elements publication metadata
Logical: CoreDataElement
// ... existing content
* publicationMetadata 0..1 BackboneElement "Publication Metadata"
  * displayCategory 0..1 string "Display Category"
  * publicationNotes 0..1 markdown "Publication Notes"
  * examples 0..* DAKAssetMetadata "Example Assets"
```

### 4. Template Configuration Logical Model

```fsh
// Publication template configuration
Logical: DAKPublicationTemplate
Id: dak-publication-template
* identifier 1..1 id "Template ID"
* name 1..1 string "Template Name"
* version 1..1 string "Template Version"
* description 0..1 markdown "Template Description"
* templateType 1..1 code "Template Type" // standard, custom, organization
* structure 1..* BackboneElement "Template Structure"
  * section 1..1 code "Section Type"
  * order 1..1 integer "Section Order"
  * enabled 1..1 boolean "Section Enabled"
  * template 1..1 string "Template Content"
  * variables 0..* BackboneElement "Template Variables"
    * name 1..1 string "Variable Name"
    * type 1..1 code "Variable Type" // string, markdown, computed, reference
    * defaultValue 0..1 string "Default Value"
    * userEditable 1..1 boolean "User Editable"
```

## Implementation Architecture for WYSIWYG

### 1. Template Engine with WYSIWYG Support

```javascript
class WYSIWYGTemplateEngine {
  constructor() {
    this.variableRegistry = new DAKVariableRegistry();
    this.assetManager = new DAKAssetManager();
    this.previewEngine = new LivePreviewEngine();
  }

  // Real-time template editing with live preview
  async editTemplate(templateId, changes) {
    const template = await this.loadTemplate(templateId);
    const updatedTemplate = this.applyChanges(template, changes);
    
    // Generate live preview with real DAK data
    const previewData = await this.generatePreview(updatedTemplate);
    
    return {
      template: updatedTemplate,
      preview: previewData,
      variables: this.extractVariables(updatedTemplate)
    };
  }

  // Template variable system aware of DAK structure
  async resolveVariables(template, dakData) {
    const variables = {};
    
    // User-editable variables
    variables.publication = await this.getUserEditableContent(dakData);
    
    // Auto-extracted DAK variables
    variables.dak = await this.extractDAKVariables(dakData);
    
    // Component-specific variables
    variables.components = await this.extractComponentVariables(dakData);
    
    return this.variableRegistry.resolve(template, variables);
  }
}
```

### 2. Asset Management with Publication Context

```javascript
class DAKAssetManager {
  // Asset metadata with publication context
  async getAssetWithPublicationMetadata(assetId, publicationContext) {
    const asset = await this.loadAsset(assetId);
    const metadata = await this.getAssetMetadata(assetId);
    
    return {
      ...asset,
      publicationMetadata: {
        caption: metadata.publicationUsage?.caption,
        displayType: metadata.publicationUsage?.displayType,
        section: publicationContext.section,
        order: metadata.publicationUsage?.order
      }
    };
  }

  // Generate asset usage for publication
  async generateAssetUsage(dakData, templateConfig) {
    const assets = {};
    
    for (const component of dakData.components) {
      const componentAssets = await this.getComponentAssets(component);
      
      for (const asset of componentAssets) {
        const publicationUsage = await this.calculatePublicationUsage(
          asset, 
          templateConfig
        );
        
        assets[asset.id] = {
          ...asset,
          publicationUsage
        };
      }
    }
    
    return assets;
  }
}
```

### 3. User Content Management

```javascript
class UserContentManager {
  // Manage user-editable content with versioning
  async updateUserContent(dakId, contentType, content) {
    const existing = await this.getUserContent(dakId, contentType);
    
    const updated = {
      ...existing,
      content: content,
      lastModified: new Date(),
      version: existing.version + 1
    };
    
    await this.saveUserContent(dakId, contentType, updated);
    
    // Trigger template re-generation with new content
    await this.regenerateTemplatePreview(dakId);
    
    return updated;
  }

  // Content types that users can edit
  getUserEditableContentTypes() {
    return [
      'publication.title',
      'publication.subtitle', 
      'publication.copyright',
      'publication.customPreface',
      'publication.customFooter',
      'components.*.summary',
      'components.*.customIntroduction',
      'components.*.customDescription'
    ];
  }
}
```

## Data Migration Strategy

### 1. Existing DAK Repository Enhancement

For existing DAK repositories, a migration process would:

1. **Analyze existing content** and map to new metadata structure
2. **Generate default publication metadata** based on sushi-config.yaml
3. **Create asset metadata** for all BPMN, DMN, and FHIR resources
4. **Establish publication template** based on repository structure

### 2. Backward Compatibility

The extensions maintain backward compatibility by:

- **Optional metadata**: All publication metadata is optional (0..1 or 0..*)
- **Default values**: System provides sensible defaults for missing metadata
- **Graceful degradation**: Publications work without metadata, just with less customization

## Implementation Phases

### Phase 1: Smart-Base Model Extensions (2 weeks)
- Implement logical model extensions
- Create FHIR StructureDefinitions
- Update validation rules

### Phase 2: Backend Infrastructure (4 weeks)
- Asset metadata management
- User content storage
- Template variable resolution
- Publication generation engine

### Phase 3: WYSIWYG Editor (6 weeks)
- Visual template designer
- Content editing interface
- Live preview system
- Asset management UI

### Phase 4: Integration & Testing (4 weeks)
- SGeX Workbench integration
- End-to-end testing
- Documentation and training

## Benefits of This Architecture

1. **User Empowerment**: Direct control over publication appearance and content
2. **Consistency**: Standardized metadata ensures consistent publications
3. **Flexibility**: Template system allows customization while maintaining standards
4. **Scalability**: Architecture supports complex publications and multiple formats
5. **Future-Proof**: Extensible design accommodates future WHO requirements

## Conclusion

The WYSIWYG-first architecture with smart-base model extensions provides a comprehensive foundation for DAK publication generation. The approach balances user control with standardization, ensuring publications meet WHO requirements while allowing customization for specific organizational needs.

The proposed smart-base extensions are minimal and backward-compatible, focusing on publication-specific metadata that enhances the existing DAK logical model without disrupting current implementations.