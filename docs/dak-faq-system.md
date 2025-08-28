# DAK FAQ System Documentation

## Overview

The DAK FAQ (Frequently Asked Questions) system provides a dynamic, internationalized, and extensible framework for answering questions about WHO SMART Guidelines Digital Adaptation Kits (DAKs). The system supports three hierarchical levels of questions and can be accessed both through React components in the UI and via a local MCP (Model Context Protocol) server API.

## Architecture

### Core Components

1. **Question Types & Definitions** (`src/dak/faq/types/`)
   - Type definitions for questions, parameters, contexts, and results
   - Support for three hierarchy levels: DAK, Component, Asset

2. **Storage Abstraction** (`src/dak/faq/storage/`)
   - Unified interface for file access across GitHub and local environments
   - GitHubStorage for browser-based access via GitHub API
   - MockStorage for testing and development

3. **Parameter Registry** (`src/dak/faq/registry/`)
   - YAML-based parameter configuration
   - Type validation and default value application
   - Extensible parameter definitions per question type

4. **Execution Engine** (`src/dak/faq/engine/`)
   - Batch question processing
   - Template question instantiation for asset-level queries
   - Caching and error handling

5. **Question Components** (`src/dak/faq/questions/`)
   - React components that define and execute specific questions
   - Internationalized responses with structured and narrative outputs
   - Self-contained with metadata, validation, and rendering

6. **UI Components** (`src/dak/faq/components/`)
   - React components for rendering FAQ answers
   - Integration with existing i18n system
   - Sanitized HTML rendering for security

7. **MCP Server** (`services/dak-faq-mcp/`)
   - Local-only Express server (127.0.0.1 binding)
   - REST API for programmatic access
   - Question catalog and batch execution endpoints

## Question Hierarchy

### DAK Level
Questions about the entire DAK project:
- **DAK Name**: Extracts the name from `sushi-config.yaml`
- **DAK Version**: Extracts version and metadata from `sushi-config.yaml`

### Component Level  
Questions about specific DAK components:
- **Business Process Workflows**: Scans BPMN files and extracts workflow definitions

### Asset Level
Questions about individual files within components:
- Template questions that can be instantiated for multiple assets
- Support for batch processing across multiple files

## Internationalization

The system provides comprehensive i18n support:

- **Locale-aware Execution**: All questions accept locale parameters
- **Fallback Chain**: Requested locale → base language → en_US
- **Localized Content**: Both structured data and narrative responses are localized
- **Error Messages**: All validation and error messages support localization
- **React Integration**: Uses existing i18next configuration

Supported locales: en_US, fr_FR, es_ES, ar_AR, zh_CN, ru_RU

## API Endpoints (MCP Server)

### Question Catalog
```
GET /faq/questions/catalog
```

Optional query parameters:
- `level`: Filter by question level (dak, component, asset)
- `tags`: Comma-separated list of tags
- `componentType`: Filter by component type
- `assetType`: Filter by asset type
- `format`: Response format (json, openapi)

### Question Execution
```
POST /faq/questions/execute
```

Request body:
```json
{
  "requests": [
    {
      "questionId": "dak-name",
      "parameters": {
        "repository": "owner/repo",
        "locale": "en_US",
        "branch": "main"
      },
      "assetFiles": ["path/to/file.md"]
    }
  ],
  "context": {
    "repositoryPath": "/path/to/local/repo"
  }
}
```

Response:
```json
{
  "success": true,
  "timestamp": "2025-01-08T12:00:00Z",
  "results": [
    {
      "questionId": "dak-name",
      "success": true,
      "result": {
        "structured": {"name": "Example DAK"},
        "narrative": "<h4>DAK Name</h4><p>The name of this DAK is <strong>Example DAK</strong>.</p>",
        "warnings": [],
        "errors": [],
        "meta": {}
      }
    }
  ]
}
```

## Usage Examples

### React Component Usage

```jsx
import FAQAnswer from '../dak/faq/components/FAQAnswer';
import githubService from '../services/githubService';

<FAQAnswer
  questionId="dak-name"
  parameters={{
    repository: "litlfred/sgex", 
    branch: "main"
  }}
  githubService={githubService}
  showRawData={true}
/>
```

### Direct Engine Usage

```javascript
import faqExecutionEngine from '../dak/faq/engine/FAQExecutionEngine';

// Initialize engine
await faqExecutionEngine.initialize();

// Execute question
const result = await faqExecutionEngine.executeQuestion({
  questionId: 'dak-version',
  parameters: {
    repository: 'owner/repo',
    locale: 'en_US'
  }
}, { githubService });
```

### MCP Server Usage

Start the server:
```bash
cd services/dak-faq-mcp
npm install
npm start
```

Query via HTTP:
```bash
# Get catalog
curl http://127.0.0.1:3001/faq/questions/catalog

# Execute questions
curl -X POST http://127.0.0.1:3001/faq/questions/execute \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [{"questionId": "dak-name", "parameters": {"repository": "owner/repo"}}],
    "context": {"repositoryPath": "/path/to/repo"}
  }'
```

## Adding New Questions

### Step 1: Create Question Component

Create a new file in the appropriate directory structure:
- DAK level: `src/dak/faq/questions/dak/MyQuestion.js`
- Component level: `src/dak/faq/questions/component/[type]/MyQuestion.js`
- Asset level: `src/dak/faq/questions/asset/[type]/MyQuestion.js`

### Step 2: Implement Required Exports

```javascript
import { QuestionDefinition, QuestionResult, QuestionLevel } from '../../types/QuestionDefinition.js';

// Question metadata
export const metadata = new QuestionDefinition({
  id: 'my-question',
  level: QuestionLevel.DAK,
  title: 'My Question',
  description: 'Description of what this question answers',
  parameters: [],
  tags: ['tag1', 'tag2'],
  version: '1.0.0'
});

// Execution function
export async function execute(input) {
  const { locale = 'en_US', storage } = input;
  
  // Your question logic here
  
  return new QuestionResult({
    structured: { /* JSON data */ },
    narrative: '<h4>Title</h4><p>Localized narrative</p>',
    warnings: [],
    errors: [],
    meta: {}
  });
}

// Optional React component for custom rendering
export function Render({ result, locale }) {
  // Custom React rendering
}
```

### Step 3: Register Question

Add the question to the execution engine's `loadQuestions()` method:

```javascript
// In src/dak/faq/engine/FAQExecutionEngine.js
{
  id: 'my-question',
  module: () => import('../questions/dak/MyQuestion.js')
}
```

### Step 4: Update Parameter Registry

Add any new parameters to `docs/dak/faq/parameters/registry.yaml`.

## Testing

The system includes comprehensive tests:

```bash
# Run FAQ-specific tests
npm test -- --testPathPattern=DAKFAQCore.test.js

# Run all tests
npm test
```

Test coverage includes:
- Type definitions and parameter validation
- Question execution and error handling
- Storage abstraction interfaces
- Internationalization functionality

## Security Considerations

- **Path Traversal Protection**: File access is restricted to repository boundaries
- **HTML Sanitization**: All narrative content is sanitized using DOMPurify
- **Local-only MCP**: Server binds to 127.0.0.1 only, no remote access
- **Input Validation**: All parameters are validated against schemas
- **GitHub Permissions**: Respects existing GitHub repository access controls

## Performance Features

- **Caching**: Question results include cache hints for optimization
- **Lazy Loading**: Questions are loaded on-demand in the browser
- **Batch Processing**: Multiple questions can be executed efficiently
- **Template Instantiation**: Asset-level questions support bulk operations

## Extensibility

The system is designed for easy extension:

- **New Question Types**: Add questions by creating new React components
- **Custom Storage**: Implement Storage interface for new backends
- **Parameter Types**: Extend the parameter registry with new validation rules
- **Output Formats**: Support for both structured JSON and rendered HTML
- **Localization**: Add new locales by extending the i18n configuration

## Future Enhancements

Phase 2 considerations:
- Server-Sent Events (SSE) for streaming responses
- Advanced BPMN parsing with full xmldom support
- Asset discovery automation
- User feedback and helpfulness voting
- Enhanced caching strategies
- Additional question templates for more asset types