# @sgex/utils

Utility services for SGEX providing lazy loading and factory patterns for optimal performance.

## Overview

This package provides performance optimization utilities with no dependencies on other SGEX packages. It focuses on lazy loading heavy libraries and providing factory functions for common configurations.

## Features

- 🚀 **Lazy Loading**: Load heavy libraries only when needed
- 🏭 **Factory Patterns**: Pre-configured instances with sensible defaults
- 📦 **Module Caching**: Avoid repeated imports for better performance
- 🔧 **DAK-Specific Factories**: Specialized configurations for WHO SMART Guidelines
- 🌐 **Framework Agnostic**: No dependencies on React or other frameworks

## Installation

```bash
npm install @sgex/utils
```

## Usage

### Lazy Loading Libraries

```typescript
import { 
  lazyLoadOctokit, 
  lazyLoadBpmnModeler,
  lazyLoadYaml 
} from '@sgex/utils';

// Load Octokit only when needed
const Octokit = await lazyLoadOctokit();
const octokit = new Octokit({ auth: 'your-token' });

// Load BPMN Modeler for editing
const BpmnModeler = await lazyLoadBpmnModeler();
const modeler = new BpmnModeler({ container: '#canvas' });

// Load YAML parser
const yaml = await lazyLoadYaml();
const data = yaml.parse(yamlString);
```

### Factory Functions

```typescript
import { 
  createLazyOctokit,
  createLazyBpmnModeler,
  createLazyAjv 
} from '@sgex/utils';

// Create pre-configured GitHub client
const github = await createLazyOctokit({
  auth: 'your-token',
  userAgent: 'MyApp/1.0'
});

// Create BPMN modeler with configuration
const modeler = await createLazyBpmnModeler({
  container: '#bpmn-canvas',
  keyboard: { bindTo: document.body }
});

// Create AJV validator with formats
const ajv = await createLazyAjv({
  allErrors: true,
  validateFormats: true
});
```

### DAK-Specific Factories

```typescript
import { 
  createDAKBpmnModeler,
  createDAKAjv,
  createGitHubClient 
} from '@sgex/utils';

// Create BPMN modeler optimized for DAK workflows
const dakModeler = await createDAKBpmnModeler('#workflow-canvas');

// Create AJV instance configured for DAK schemas
const dakValidator = await createDAKAjv();

// Create GitHub client with SGEX defaults
const githubClient = await createGitHubClient(process.env.GITHUB_TOKEN);
```

### Cache Management

```typescript
import { getCacheInfo, clearModuleCache } from '@sgex/utils';

// Get information about cached modules
const info = getCacheInfo();
console.log('Cached modules:', info.keys);
console.log('Cache size:', info.size);

// Clear cache (useful for testing)
clearModuleCache();
```

## Available Libraries

### Core Libraries
- **Octokit** (`@octokit/rest`) - GitHub API client
- **BPMN.js** (`bpmn-js`) - BPMN modeler and viewer
- **AJV** (`ajv`) - JSON schema validator
- **js-yaml** (`js-yaml`) - YAML parser

### UI Libraries (React)
- **MD Editor** (`@uiw/react-md-editor`) - Markdown editor
- **Syntax Highlighter** (`react-syntax-highlighter`) - Code highlighting
- **React Markdown** (`react-markdown`) - Markdown renderer

## Performance Benefits

### Before (Direct Imports)
```typescript
import { Octokit } from '@octokit/rest';        // +500KB immediately
import BpmnModeler from 'bpmn-js/lib/Modeler';  // +1.2MB immediately
import Ajv from 'ajv';                          // +200KB immediately
// Total: ~1.9MB loaded upfront
```

### After (Lazy Loading)
```typescript
import { lazyLoadOctokit } from '@sgex/utils';  // +2KB immediately
// Libraries loaded only when createGitHubClient() is called
// Improves initial page load by ~1.9MB
```

## Factory Configurations

### Octokit Options
```typescript
interface OctokitOptions {
  auth?: string;
  baseUrl?: string;
  userAgent?: string;
  previews?: string[];
  timeZone?: string;
  request?: {
    timeout?: number;
    retries?: number;
  };
}
```

### BPMN Options
```typescript
interface BpmnOptions {
  container?: string | HTMLElement;
  width?: number;
  height?: number;
  moddleExtensions?: any;
  additionalModules?: any[];
  keyboard?: {
    bindTo?: HTMLElement;
  };
}
```

### AJV Options
```typescript
interface AjvOptions {
  allErrors?: boolean;
  verbose?: boolean;
  strict?: boolean;
  validateFormats?: boolean;
  addUsedSchema?: boolean;
}
```

## Best Practices

1. **Use Factory Functions**: Prefer `createLazyOctokit()` over manual instantiation
2. **DAK-Specific Factories**: Use `createDAK*()` functions for WHO SMART Guidelines work
3. **Cache Awareness**: Libraries are cached automatically, no need to cache instances yourself
4. **Error Handling**: All functions include proper error handling with descriptive messages

## Error Handling

All lazy loading functions include comprehensive error handling:

```typescript
try {
  const github = await createGitHubClient('invalid-token');
} catch (error) {
  console.error('Failed to create GitHub client:', error.message);
}
```

## License

Apache 2.0 - See LICENSE file for details.