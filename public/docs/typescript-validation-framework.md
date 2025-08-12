# TypeScript Validation Framework

## Overview

The SGEX Workbench implements a comprehensive TypeScript validation framework that combines compile-time type safety with runtime validation for enhanced reliability and developer experience.

## Architecture

### 1. Type-First Development

All data structures are defined as TypeScript interfaces in `src/types/common.ts`:

```typescript
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: string;
  };
  description?: string;
  private: boolean;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}
```

### 2. Automatic Schema Generation

JSON schemas are automatically generated from TypeScript interfaces using:
- **typescript-json-schema** (primary)
- **ts-json-schema-generator** (fallback)

#### Generation Process

```bash
npm run generate-schemas
```

This script:
1. Reads TypeScript interfaces from `src/types/common.ts`
2. Generates JSON schemas for each type
3. Creates a schema index for runtime discovery
4. Outputs to `public/docs/schemas/` for deployment

#### Generated Files

```
public/docs/schemas/
├── index.json              # Schema catalog
├── GitHubRepository.json   # Repository schema
├── GitHubUser.json        # User schema
├── DAKComponent.json      # DAK component schema
└── ...                    # All TypeScript interfaces
```

### 3. Runtime Validation Service

The `validationService` provides runtime type safety using AJV (Another JSON Schema Validator):

```typescript
import { validationService, validateGitHubRepository } from './services/validationService';

// Validate API responses
const result = validateGitHubRepository(apiResponse);
if (result.isValid) {
  // TypeScript knows result.data is GitHubRepository
  const repo = result.data;
  console.log(repo.name); // Type-safe access
} else {
  console.error('Validation errors:', result.errors);
}
```

## Usage Patterns

### 1. API Response Validation

Validate GitHub API responses before using them:

```typescript
// GitHub service example
async function fetchRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
  const response = await octokit.repos.get({ owner, repo });
  
  const validation = validateGitHubRepository(response.data);
  if (validation.isValid) {
    return validation.data; // Safely typed as GitHubRepository
  } else {
    console.error('Invalid repository data:', validation.errors);
    return null;
  }
}
```

### 2. Component Props Validation

Validate component props in React components:

```typescript
import { validateRouteParams } from '../services/validationService';

function DAKComponent({ params }: { params: unknown }) {
  const validation = validateRouteParams(params);
  
  if (!validation.isValid) {
    return <div>Invalid route parameters</div>;
  }
  
  const { user, repo, branch } = validation.data; // Type-safe
  // ... component implementation
}
```

### 3. Custom Schema Registration

Register additional schemas for application-specific types:

```typescript
import { validationService } from './services/validationService';

interface CustomType {
  id: string;
  metadata: Record<string, unknown>;
}

const customSchema: JSONSchemaType<CustomType> = {
  type: "object",
  properties: {
    id: { type: "string" },
    metadata: { type: "object" }
  },
  required: ["id", "metadata"],
  additionalProperties: false
};

validationService.registerSchema('CustomType', customSchema);

// Now you can validate CustomType
const result = validationService.validateAndCast<CustomType>('CustomType', data);
```

## Benefits

### 1. Compile-Time Safety

- **Type Checking**: Catch type errors during development
- **IDE Support**: Enhanced autocomplete and IntelliSense  
- **Refactoring**: Safe automated refactoring across the codebase

### 2. Runtime Safety

- **API Validation**: Ensure external data conforms to expected types
- **Error Prevention**: Catch invalid data before it causes runtime errors
- **Type Coercion**: Safely cast validated data to TypeScript types

### 3. Development Experience

- **Self-Documenting**: Type annotations serve as living documentation
- **Gradual Adoption**: Mixed JavaScript/TypeScript codebase support
- **Automated Schema Sync**: Schemas automatically update with type changes

## Development Workflow

### 1. Adding New Types

1. Define TypeScript interface in `src/types/common.ts`:
   ```typescript
   export interface NewType {
     id: string;
     data: unknown;
   }
   ```

2. Add to schema generation list in `scripts/generate-schemas.js`:
   ```javascript
   const TYPES_TO_GENERATE = [
     // ... existing types
     'NewType'
   ];
   ```

3. Generate schemas:
   ```bash
   npm run generate-schemas
   ```

4. Create validation function:
   ```typescript
   export const validateNewType = (data: unknown): ValidationResult<NewType> =>
     validationService.validateAndCast<NewType>('NewType', data);
   ```

### 2. Testing Validation

Add tests for new validation functions:

```typescript
// src/tests/validationService.test.ts
describe('NewType Validation', () => {
  test('should validate valid NewType object', () => {
    const validData: NewType = { id: 'test', data: {} };
    const result = validateNewType(validData);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual(validData);
  });
  
  test('should reject invalid NewType object', () => {
    const invalidData = { id: 123 }; // Wrong type
    const result = validateNewType(invalidData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toBeDefined();
  });
});
```

### 3. Migration Strategy

For migrating existing JavaScript code:

1. **Start with types**: Define TypeScript interfaces for existing data structures
2. **Generate schemas**: Use the schema generation pipeline
3. **Add validation**: Integrate validation at API boundaries
4. **Migrate gradually**: Convert JavaScript files to TypeScript incrementally

## Configuration

### TypeScript Configuration

Key settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": false,           // Allow gradual migration
    "strictNullChecks": true,  // Required for AJV JSONSchemaType
    "allowJs": true,           // Support mixed JS/TS codebase
    "noImplicitAny": false     // Gradual type adoption
  }
}
```

### Schema Generation Configuration

Customize schema generation in `scripts/generate-schemas.js`:

```javascript
// Types to generate schemas for
const TYPES_TO_GENERATE = [
  'GitHubRepository',
  'GitHubUser',
  // Add new types here
];

// Output directory
const OUTPUT_DIR = 'public/docs/schemas';
```

### Build Integration

Schema generation is integrated into the build process:

```json
{
  "scripts": {
    "build": "npm run generate-schemas && react-scripts build",
    "generate-schemas": "node scripts/generate-schemas.js"
  }
}
```

## Error Handling

### Validation Errors

The validation service provides detailed error information:

```typescript
const result = validateGitHubRepository(invalidData);
if (!result.isValid) {
  result.errors?.forEach(error => {
    console.error(`Validation error: ${error}`);
  });
}
```

### Schema Loading Errors

Schema loading failures are handled gracefully:

```typescript
// Automatically attempts to load schemas from deployment
await validationService.loadSchemasFromDirectory('/sgex/docs/schemas');

// Falls back to built-in schemas if loading fails
const stats = validationService.getValidationStats();
console.log(`Loaded ${stats.registeredValidators} validators`);
```

## Performance Considerations

### Schema Compilation

- Schemas are compiled once during service initialization
- Validation functions are cached for reuse
- No performance impact on subsequent validations

### Bundle Size

- AJV adds ~50KB to bundle size
- Schema generation happens at build time, not runtime
- Schemas are loaded on-demand in browser environment

### Memory Usage

- Compiled validators are memory-efficient
- Schema caching prevents duplicate compilation
- Validation service uses singleton pattern

## Future Enhancements

### 1. Advanced Schema Features

- Custom validation keywords
- Conditional schemas based on data content
- Schema composition and inheritance

### 2. Development Tools

- Visual schema browser in development mode
- Validation error highlighting in IDEs
- Automatic test generation from schemas

### 3. Performance Optimizations

- Lazy schema loading
- Worker-based validation for large datasets
- Schema bundling optimization

## Best Practices

### 1. Type Design

- Use specific types over `any` or `unknown`
- Leverage union types for variant data
- Document complex types with JSDoc comments

### 2. Validation Strategy

- Validate at system boundaries (API responses, user input)
- Use validation for data transformation pipelines
- Prefer validation over defensive programming

### 3. Error Handling

- Provide meaningful error messages to users
- Log validation failures for debugging
- Implement fallback behavior for validation failures

---

This TypeScript validation framework provides a robust foundation for type-safe development while maintaining flexibility for gradual migration and real-world usage patterns.