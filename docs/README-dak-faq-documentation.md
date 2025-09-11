# DAK FAQ Documentation Generator

This document describes the automated documentation generation system for the DAK FAQ MCP Service.

## Overview

The DAK FAQ Documentation Generator creates comprehensive, pretty-printed static HTML documentation by synthesizing content from multiple sources:

- **System Documentation**: `docs/dak-faq-system.md`
- **Implementation Summary**: `docs/dak/faq/implementation-summary.md`
- **Question Catalog**: `docs/dak/faq/component-questions-draft.md`
- **Source Code**: JSDoc comments from `/src/dak/faq/questions/*`
- **MCP Service API**: Live introspection of endpoints and OpenAPI schemas

## Generated Output

The generator creates a single, comprehensive HTML file at:
```
public/docs/dak-faq-documentation.html
```

### Documentation Sections

1. **Overview** - System introduction and purpose
2. **System Architecture** - Core components and design
3. **API Endpoints** - Complete REST API reference
4. **Question Catalog** - All available questions by component type
5. **Implementation Examples** - Usage examples and code samples
6. **Source Documentation** - JSDoc comments and metadata
7. **OpenAPI Schema** - Complete API schema specification

## Usage

### Generate Documentation

```bash
# Using npm script (recommended)
npm run generate-dak-faq-docs

# Direct execution
node scripts/generate-dak-faq-docs.js
```

### Build Process Integration

The documentation generator can be integrated into build processes:

```bash
# Generate docs as part of build
npm run build && npm run generate-dak-faq-docs
```

## Features

### Professional Styling
- WHO SMART Guidelines branding and color scheme
- Responsive design for mobile and desktop
- Clean, navigable table of contents
- Syntax highlighting for code blocks

### Content Synthesis
- **Automatic Extraction**: Pulls content from multiple markdown sources
- **Live API Introspection**: Queries running MCP server for current endpoints
- **JSDoc Parsing**: Extracts documentation from source code comments
- **OpenAPI Integration**: Includes complete API schemas

### Technical Features
- **MCP Server Management**: Automatically starts/stops MCP server for introspection
- **Error Handling**: Graceful degradation when sources are unavailable
- **Markdown Processing**: Enhanced markdown to HTML conversion
- **HTML Escaping**: Secure handling of code and schema content

## Generator Architecture

### Main Class: `DAKFAQDocumentationGenerator`

```javascript
class DAKFAQDocumentationGenerator {
  async generate()              // Main entry point
  async startMCPServer()        // Start MCP server for API introspection
  async extractDocumentationSources()  // Read markdown files
  async extractJSDocComments()  // Parse source code documentation
  async extractMCPServiceDetails()     // Query live API endpoints
  async generateHTML()          // Create final HTML document
}
```

### Configuration

```javascript
const CONFIG = {
  outputPath: 'public/docs/dak-faq-documentation.html',
  mcpServerPort: 3001,
  title: 'DAK FAQ MCP Service Documentation',
  subtitle: 'Comprehensive API and Question Reference'
};
```

## Development

### Adding New Content Sources

To include additional documentation sources:

1. **Markdown Files**: Add to `CONFIG.sourcePaths`
2. **Source Parsing**: Extend `extractJSDocComments()` method
3. **API Endpoints**: Extend `extractMCPServiceDetails()` method

### Customizing Output

- **Styling**: Modify `getCSS()` method
- **HTML Structure**: Update section generation methods
- **Content Processing**: Enhance `markdownToHtml()` function

### Dependencies

- **Node.js**: JavaScript runtime for script execution
- **MCP Service**: TypeScript-based service must be built
- **Fetch API**: For querying MCP server endpoints

## Error Handling

The generator includes comprehensive error handling:

- **Missing Sources**: Warns but continues if documentation files are missing
- **MCP Server Issues**: Gracefully handles server startup failures
- **Parsing Errors**: Logs warnings for malformed content
- **Build Failures**: Provides clear error messages and cleanup

## Output Quality

The generated documentation provides:

- **Complete API Reference**: All endpoints with descriptions
- **Rich Question Catalog**: Detailed question definitions by component
- **Implementation Guidance**: Code examples and usage patterns
- **Technical Specifications**: OpenAPI schemas and parameter definitions
- **Professional Presentation**: Publication-ready formatting

## Publishing

The generated HTML file is suitable for:

- **GitHub Pages**: Direct deployment as static content
- **Documentation Portals**: Integration with doc sites
- **Offline Distribution**: Self-contained HTML with embedded styles
- **Print Documentation**: CSS print media queries included

## Maintenance

### Regular Updates

Run the generator whenever:
- New questions are implemented
- API endpoints are added or modified
- Documentation sources are updated
- MCP service schemas change

### Version Control

The generated HTML file should be committed to version control to:
- Track documentation changes over time
- Provide stable references for releases
- Enable diff reviews of documentation updates

## Integration with Pull Requests

For automated documentation updates in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Generate Documentation
  run: |
    npm install
    npm run build-mcp
    npm run generate-dak-faq-docs
    git add public/docs/dak-faq-documentation.html
    git commit -m "Update DAK FAQ documentation" || exit 0
```

This ensures documentation stays current with code changes and provides reviewers with up-to-date reference material.