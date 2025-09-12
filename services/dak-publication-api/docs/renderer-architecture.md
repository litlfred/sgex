# DAK Publication Renderer Architecture

## Overview

The DAK Publication API supports multiple output formats through a unified template-based rendering system. The architecture is designed to be extensible and maintainable while providing high-quality output for WHO SMART Guidelines publications.

## Supported Formats

### 1. HTML (Primary Format)
- **Status**: ✅ Fully Implemented
- **Use Cases**: Web display, WYSIWYG preview, embedded content
- **Features**: 
  - Professional WHO styling with CSS
  - Responsive design for multiple devices
  - Interactive elements support
  - WYSIWYG editing capabilities

### 2. DocBook XML
- **Status**: ✅ Implemented (New)
- **Use Cases**: Professional publishing, print preparation, academic publications
- **Features**:
  - DocBook 5.0 XML structure
  - Semantic markup for proper document hierarchy
  - Professional metadata support
  - Compatible with DocBook toolchains (FOP, XEP, etc.)

### 3. EPUB
- **Status**: ✅ Implemented (New)
- **Use Cases**: E-book distribution, mobile reading, offline access
- **Features**:
  - EPUB 3.0 format support
  - Package structure with manifest
  - XHTML content for cross-platform compatibility
  - Metadata for e-book catalogs

### 4. PDF
- **Status**: ❌ Planned
- **Use Cases**: Print publications, official documents, archival
- **Implementation**: Requires rendering engine (Puppeteer or similar)

### 5. DOCX
- **Status**: ❌ Planned
- **Use Cases**: Microsoft Word editing, collaborative review
- **Implementation**: Requires document generation library

## Renderer Architecture

### Template-Based System
```typescript
interface PublicationRenderer {
  renderTemplate(template: Template, variables: Record<string, any>): Promise<string>;
  addStyling(content: string): string;
  convertFormat(htmlContent: string, targetFormat: string): string;
}
```

### Format-Specific Renderers

#### HTML Renderer
- Direct template substitution with variable replacement
- CSS styling injection for professional appearance
- WYSIWYG-compatible markup generation

#### DocBook Renderer
- HTML-to-DocBook element conversion
- Semantic structure mapping:
  - `<h1>` → `<title>`
  - `<p>` → `<para>`
  - `<ul>` → `<itemizedlist>`
  - `<strong>` → `<emphasis role="bold">`
- Proper XML namespaces and DTD declarations

#### EPUB Renderer
- Package manifest generation (content.opf)
- XHTML content creation
- Metadata embedding for e-book compatibility
- Navigation structure support

## Implementation Details

### Variable Resolution
All formats use the same variable resolution system:
```typescript
// Variable substitution works across all formats
const variables = {
  'publication.title': 'Smart Immunizations DAK',
  'publication.author': 'World Health Organization',
  'dak.components': ['Business Processes', 'Decision Support']
};

// Template placeholder: {{publication.title}}
// Rendered output: Smart Immunizations DAK
```

### Content Conversion Pipeline
1. **Template Processing**: Load section templates
2. **Variable Substitution**: Replace placeholders with resolved values
3. **Format Conversion**: Transform to target format
4. **Styling Application**: Add format-specific styling
5. **Output Generation**: Return formatted content

### Extensibility
Adding new formats requires:
1. Update format enum in types
2. Add format-specific renderer method
3. Implement content conversion logic
4. Add format-specific styling/structure

## Format Comparison

| Format | Complexity | Dependencies | Output Size | Use Case |
|--------|------------|--------------|-------------|----------|
| HTML | Low | None | Small | Web, WYSIWYG |
| DocBook | Low | None | Medium | Publishing, Print |
| EPUB | Medium | None | Medium | E-books, Mobile |
| PDF | High | Puppeteer | Large | Print, Archive |
| DOCX | High | docx library | Medium | Collaboration |

## Quality Considerations

### DocBook Output Quality
- Valid DocBook 5.0 XML structure
- Proper semantic markup for accessibility
- Compatible with professional publishing toolchains
- Structured metadata for document management

### EPUB Output Quality
- EPUB 3.0 compliant structure
- Cross-platform e-reader compatibility
- Proper navigation and table of contents
- Embedded metadata for library systems

### Performance
- Minimal dependencies (no external libraries for XML formats)
- Fast rendering through template caching
- Efficient variable substitution algorithms
- Scalable architecture for multiple concurrent renders

## Integration Examples

### Generate DocBook Publication
```typescript
const publication = await publicationService.generatePublication({
  templateId: 'who-dak-standard-v1',
  dakRepository: 'who/smart-immunizations',
  options: { format: 'docbook' }
});

// Output: Valid DocBook XML ready for professional publishing
```

### Generate EPUB Publication
```typescript
const publication = await publicationService.generatePublication({
  templateId: 'who-dak-standard-v1',
  dakRepository: 'who/smart-immunizations',
  options: { format: 'epub' }
});

// Output: EPUB package structure with content.opf and XHTML
```

## Future Enhancements

1. **PDF Generation**: Add Puppeteer-based PDF rendering
2. **DOCX Support**: Implement Microsoft Word document generation
3. **LaTeX Output**: Academic publishing format support
4. **Markdown Export**: Developer-friendly documentation format
5. **Custom Stylesheets**: User-configurable styling per format

This architecture provides a solid foundation for multi-format publication generation while maintaining simplicity and extensibility for future format additions.