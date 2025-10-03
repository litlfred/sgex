# Migration Examples: JavaScript to TypeScript DAK Utilities

This document provides concrete examples of migrating existing JavaScript code to use the refactored TypeScript DAK utilities.

## Example 1: QuestionnaireEditor FSH Parsing

### Before (JavaScript - duplicated code)

```javascript
// src/components/QuestionnaireEditor.js

const extractFshTitle = (content) => {
  const patterns = [
    /^\s*Title:\s*"([^"]+)"/m,
    /\*\s*title\s*=\s*"([^"]+)"/,
    /^Instance:\s*\w+\s*"([^"]+)"/m
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

const extractFshStatus = (content) => {
  const patterns = [
    /\*\s*status\s*=\s*#(\w+)/,
    /^\s*Status:\s*#?(\w+)/m
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const extractFshName = (content) => {
  const patterns = [
    /\*\s*name\s*=\s*"([^"]+)"/,
    /^\s*Name:\s*"?([^"\n]+)"?/m,
    /Instance:\s*(\w+)/
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

const extractFshDescription = (content) => {
  const patterns = [
    /\*\s*description\s*=\s*"([^"]+)"/,
    /^\s*Description:\s*"?([^"\n]+)"?/m,
    /\/\/\s*(.+)/
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

// Usage
const title = extractFshTitle(fshContent);
const status = extractFshStatus(fshContent);
const name = extractFshName(fshContent);
const description = extractFshDescription(fshContent);
```

### After (Using TypeScript utilities)

```javascript
// src/components/QuestionnaireEditor.js
import { extractFSHMetadata } from '@sgex/dak-core';

// Single call extracts all metadata
const metadata = extractFSHMetadata(fshContent);
const { title, status, name, description } = metadata;

// Or access individually
const title = metadata.title;
const status = metadata.status;
const name = metadata.name;
const description = metadata.description;
```

**Benefits:**
- 40+ lines → 2 lines
- Single consistent API
- All patterns tested in one place
- Type-safe return values

## Example 2: DecisionSupportLogicView FSH Code System Parsing

### Before (JavaScript - complex custom parser)

```javascript
// src/components/DecisionSupportLogicView.js

const parseFSHCodeSystem = (fshContent) => {
  const lines = fshContent.split('\n');
  const concepts = [];
  let currentConcept = null;
  let multiLineState = null;
  let multiLineContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    const isTopLevel = line.startsWith('* #') && !line.startsWith('  ');
    
    if (isTopLevel) {
      if (multiLineState && currentConcept) {
        if (multiLineState === 'definition') {
          currentConcept.Definition = multiLineContent.join('\n').trim();
        } else if (multiLineState === 'cql') {
          currentConcept.CQL = multiLineContent.join('\n').trim();
        }
        multiLineState = null;
        multiLineContent = [];
      }
      
      if (currentConcept) {
        concepts.push(currentConcept);
      }
      
      const match = trimmed.match(/^\*\s*#(\S+)/);
      if (match) {
        currentConcept = {
          Code: match[1],
          properties: {}
        };
        
        const displayMatch = trimmed.match(/"([^"]+)"/);
        if (displayMatch) {
          currentConcept.Display = displayMatch[1];
        }
      }
    } else if (currentConcept && trimmed) {
      // Parse property lines
      // ... 30+ more lines of parsing logic
    }
  }
  
  if (currentConcept) {
    if (multiLineState) {
      currentConcept[multiLineState] = multiLineContent.join('\n').trim();
    }
    concepts.push(currentConcept);
  }
  
  return concepts;
};

// Usage
const concepts = parseFSHCodeSystem(fshContent);
setDakDTCodeSystem({ concepts });
```

### After (Using TypeScript utilities)

```javascript
// src/components/DecisionSupportLogicView.js
import { parseFSHCodeSystem } from '@sgex/dak-core';

// Single call handles all parsing complexity
const concepts = parseFSHCodeSystem(fshContent);
setDakDTCodeSystem({ concepts });
```

**Benefits:**
- 60+ lines → 1 line
- Handles multi-line content correctly
- Tested for edge cases
- Type-safe concept structure

## Example 3: Actor Definition Service FSH Generation

### Before (JavaScript - manual string building)

```javascript
// src/services/actorDefinitionService.js

class ActorDefinitionService {
  generateFSH(actorDefinition) {
    if (!actorDefinition || !actorDefinition.id) {
      throw new Error('Invalid actor definition');
    }

    const fsh = [];
    
    fsh.push(`Profile: ${actorDefinition.id}`);
    fsh.push(`Parent: ActorDefinition`);
    fsh.push(`Id: ${actorDefinition.id}`);
    fsh.push(`Title: "${this.escapeFSHString(actorDefinition.name)}"`);
    fsh.push(`Description: "${this.escapeFSHString(actorDefinition.description)}"`);
    
    if (actorDefinition.metadata?.status) {
      fsh.push(`* status = #${actorDefinition.metadata.status}`);
    }
    
    if (actorDefinition.type) {
      fsh.push(`* type = #${actorDefinition.type}`);
    }
    
    // ... 50+ more lines of FSH generation
    
    return fsh.join('\n');
  }

  escapeFSHString(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  }
}
```

### After (Using TypeScript utilities)

```javascript
// src/services/actorDefinitionService.js
import { generateFSHHeader, escapeFSHString } from '@sgex/dak-core';

class ActorDefinitionService {
  generateFSH(actorDefinition) {
    if (!actorDefinition || !actorDefinition.id) {
      throw new Error('Invalid actor definition');
    }

    // Generate header with standard fields
    let fsh = generateFSHHeader({
      type: 'Profile',
      id: actorDefinition.id,
      parent: 'ActorDefinition',
      title: actorDefinition.name,
      description: actorDefinition.description,
      status: actorDefinition.metadata?.status
    });
    
    fsh += '\n\n';
    
    // Add actor-specific constraints
    if (actorDefinition.type) {
      fsh += `* type = #${actorDefinition.type}\n`;
    }
    
    // ... component-specific logic only
    
    return fsh;
  }
  
  // No need for escapeFSHString - it's in the utilities
}
```

**Benefits:**
- 15+ lines → 5 lines for header generation
- Consistent formatting
- No need to maintain escape logic
- Type-safe parameters

## Example 4: Creating New Components with Base Class

### Before (JavaScript - reimplementing everything)

```javascript
// Hypothetical new component
class MyNewComponentService {
  constructor() {
    this.components = [];
  }
  
  validate(component) {
    const errors = [];
    
    if (!component.id) {
      errors.push('ID is required');
    }
    
    if (!component.name) {
      errors.push('Name is required');
    }
    
    if (component.id && !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(component.id)) {
      errors.push('Invalid ID format');
    }
    
    // ... more validation
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  generateFSH(component) {
    let fsh = `Profile: ${component.id}\n`;
    fsh += `Title: "${this.escapeFSHString(component.name)}"\n`;
    // ... manual FSH generation
    return fsh;
  }
  
  parseFSH(fshContent) {
    // ... manual parsing logic
  }
  
  escapeFSHString(str) {
    // ... escape logic
  }
  
  toJSON(component) {
    return JSON.stringify(component, null, 2);
  }
}
```

### After (Using BaseDAKComponent)

```typescript
// packages/dak-core/src/my-component.ts
import {
  BaseDAKComponent,
  DAKComponentBase,
  ComponentValidationResult,
  mergeValidationResults,
  generateFSHHeader,
  extractFSHMetadata
} from '@sgex/dak-core';

interface MyComponent extends DAKComponentBase {
  customField: string;
}

export class MyComponentCore extends BaseDAKComponent<MyComponent> {
  
  validate(): ComponentValidationResult {
    // Use base validation for common fields
    const baseValidation = mergeValidationResults(
      this.validateRequiredFields(['id', 'name', 'description']),
      this.validateIdFormat(this.component.id)
    );
    
    // Add custom validation
    const errors = [];
    if (this.component.customField === 'invalid') {
      errors.push({
        code: 'INVALID_CUSTOM_FIELD',
        message: 'Custom field is invalid',
        component: 'my-component'
      });
    }
    
    return mergeValidationResults(baseValidation, {
      isValid: errors.length === 0,
      errors,
      warnings: []
    });
  }
  
  generateFSH(): string {
    // Use utility for header
    return generateFSHHeader({
      type: 'Profile',
      id: this.component.id,
      parent: 'Base',
      title: this.component.name,
      description: this.component.description
    }) + `\n\n* customField = "${escapeFSHString(this.component.customField)}"`;
  }
  
  parseFSH(fshContent: string): MyComponent {
    // Use utility for metadata
    const metadata = extractFSHMetadata(fshContent);
    
    return {
      id: metadata.id || '',
      name: metadata.title || '',
      description: metadata.description || '',
      type: 'my-component',
      customField: '' // Parse custom fields
    };
  }
  
  getSchema(): any {
    return {
      type: 'object',
      required: ['id', 'name', 'customField'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        customField: { type: 'string' }
      }
    };
  }
}

// Export singleton for convenience
export const myComponentCore = new MyComponentCore({
  id: '',
  name: '',
  description: '',
  type: 'my-component',
  customField: ''
});
```

**Benefits:**
- 100+ lines → 50 lines
- Type safety out of the box
- Consistent patterns
- Tested base functionality
- Easy to extend

## Example 5: Using Storage Mixin

### Before (JavaScript - manual storage operations)

```javascript
class ComponentService {
  async loadComponent(id) {
    const content = await githubService.getFile(/* ... */);
    return JSON.parse(content);
  }
  
  async saveComponent(component, message) {
    const content = JSON.stringify(component, null, 2);
    await githubService.createOrUpdateFile(/* ... */, content, message);
  }
  
  async deleteComponent(id) {
    await githubService.deleteFile(/* ... */);
  }
  
  async listComponents() {
    const files = await githubService.listFiles(/* ... */);
    return Promise.all(files.map(f => this.loadComponent(f.id)));
  }
}
```

### After (Using StorageMixin)

```typescript
import { StorageMixin, ComponentStorage } from '@sgex/dak-core';
import githubService from './githubService';

// Create storage adapter
const githubStorage: ComponentStorage = {
  async load(id: string) {
    const content = await githubService.getFile(/* ... */);
    return JSON.parse(content);
  },
  
  async save(component: any, commitMessage?: string) {
    const content = JSON.stringify(component, null, 2);
    await githubService.createOrUpdateFile(/* ... */, content, commitMessage);
  },
  
  async delete(id: string) {
    await githubService.deleteFile(/* ... */);
  },
  
  async list() {
    const files = await githubService.listFiles(/* ... */);
    return Promise.all(files.map(f => this.load(f.id)));
  }
};

// Use mixin for storage operations
const componentStorage = new StorageMixin(githubStorage);

// Simple, consistent API
const component = await componentStorage.load('component-id');
await componentStorage.save(component, 'Updated component');
const allComponents = await componentStorage.list();
await componentStorage.delete('component-id');
```

**Benefits:**
- Separation of concerns
- Reusable storage adapters
- Consistent error handling
- Easy to swap storage backends

## Migration Checklist

When migrating a component to use the new utilities:

- [ ] Import utilities from `@sgex/dak-core`
- [ ] Replace custom FSH parsing with `extractFSHMetadata()` or `parseFSHField()`
- [ ] Replace custom FSH generation with `generateFSHHeader()` and `escapeFSHString()`
- [ ] Replace custom validation with base class methods
- [ ] Replace manual string escaping with `escapeFSHString()`
- [ ] Consider extending `BaseDAKComponent` for new components
- [ ] Update tests to use new API
- [ ] Remove duplicated utility functions
- [ ] Update documentation

## Gradual Migration Strategy

You don't need to migrate everything at once:

1. **Phase 1:** Use shared utilities in existing code
   - Replace FSH parsing functions
   - Replace string escaping
   - Keep existing structure

2. **Phase 2:** Refactor to use base classes
   - Create TypeScript versions extending BaseDAKComponent
   - Keep JavaScript versions for backward compatibility
   - Update one component at a time

3. **Phase 3:** Full migration
   - Remove JavaScript duplicates
   - Use TypeScript versions everywhere
   - Clean up deprecated code

## Testing Migration

Ensure your migration is correct by:

1. **Run existing tests** - Should pass with no changes
2. **Add new tests** - For utility functions
3. **Compare outputs** - FSH generation should match exactly
4. **Validate parsing** - Parsed data should match old results

Example test:
```javascript
describe('Migration validation', () => {
  it('should generate same FSH as old code', () => {
    const component = { id: 'test', name: 'Test', description: 'Test' };
    
    const oldFSH = oldService.generateFSH(component);
    const newFSH = newService.generateFSH(component);
    
    expect(newFSH).toBe(oldFSH);
  });
});
```

## Common Pitfalls

1. **Breaking API Changes**
   - Keep old methods as wrappers
   - Use TypeScript for new code only
   - Deprecate gradually

2. **Import Confusion**
   - Use `@sgex/dak-core` for TypeScript
   - May need build/transpilation for JavaScript
   - Check module resolution

3. **Type Mismatches**
   - FSH utilities return `undefined`, not `null`
   - Update comparisons: `if (value)` instead of `if (value !== null)`

4. **Missing Dependencies**
   - Ensure `@sgex/dak-core` is built
   - Check package.json dependencies
   - Run `npm install` in packages

## Support

For questions or issues:
1. Check the main documentation: `docs/DAK_TYPESCRIPT_REFACTORING.md`
2. Review test examples: `packages/dak-core/src/__tests__/`
3. See working migration: `packages/dak-core/src/actor-definition.ts`

## Conclusion

The migration to shared TypeScript utilities provides:
- **40-50% code reduction** per component
- **Better type safety** with TypeScript
- **Easier maintenance** with single source of truth
- **Faster development** of new components
- **Better testing** with shared test coverage

Start with small, high-value migrations (like FSH parsing) and gradually expand to full component refactoring.
