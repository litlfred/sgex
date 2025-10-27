# Runtime Validation Service Documentation

## Overview

The Runtime Validation Service provides a bridge between TypeScript compile-time type checking and runtime JSON data validation. It uses AJV (Another JSON Schema Validator) with TypeScript-generated JSON schemas to ensure data integrity at runtime.

## Features

- **Type-safe validation**: Validate JSON data against TypeScript-generated schemas
- **AJV integration**: Leverages industry-standard JSON schema validation
- **Custom formats**: GitHub-specific and DAK-specific validation formats
- **Batch validation**: Efficiently validate arrays of data
- **Async support**: Promise-based validation for workflow integration
- **Development tools**: Decorators for automatic validation

## Installation

The service is automatically available when TypeScript dependencies are installed:

```bash
npm install # Includes AJV and related dependencies
```

## Basic Usage

### Importing the Service

```typescript
import { 
  runtimeValidator, 
  validateData, 
  validateAndCast,
  registerSchema 
} from './services/runtimeValidationService';
import { GitHubUser } from './types/core';
```

### Registering Schemas

Before validation, register JSON schemas for your TypeScript types:

```typescript
const userSchema = {
  type: 'object',
  properties: {
    login: { type: 'string', format: 'github-username' },
    id: { type: 'number' },
    avatar_url: { type: 'string', format: 'uri' },
    name: { type: 'string' }
  },
  required: ['login', 'id'],
  additionalProperties: false
};

registerSchema('GitHubUser', userSchema);
```

### Basic Validation

```typescript
// Validate data and get detailed results
const result = validateData<GitHubUser>('GitHubUser', userData);

if (result.isValid) {
  console.log('User data is valid:', result.data);
} else {
  console.error('Validation errors:', result.errors);
}

// Validate and cast (throws on error if configured)
const user = validateAndCast<GitHubUser>('GitHubUser', userData);
```

## Advanced Usage

### Async Validation

```typescript
async function processUserData(userData: unknown) {
  const result = await runtimeValidator.validateAsync<GitHubUser>('GitHubUser', userData);
  
  if (result.isValid) {
    // Process valid data
    await saveUser(result.data);
  } else {
    // Handle validation errors
    throw new Error(`Invalid user data: ${result.errors.map(e => e.message).join(', ')}`);
  }
}
```

### Batch Validation

```typescript
const userDataArray = [userData1, userData2, userData3];
const results = runtimeValidator.validateBatch<GitHubUser>('GitHubUser', userDataArray);

results.forEach((result, index) => {
  if (!result.isValid) {
    console.error(`User ${index} validation failed:`, result.errors);
  }
});
```

### Configuration

```typescript
// Update validation configuration
runtimeValidator.updateConfig({
  strict: true,           // Enable strict mode
  throwOnError: false,    // Don't throw on validation errors
  coerceTypes: true,      // Automatically coerce types (string "123" → number 123)
  removeAdditional: true  // Remove properties not in schema
});
```

## Custom Formats

The service includes custom validation formats for SGEX-specific data:

### GitHub Formats

```typescript
// GitHub username validation
{
  username: { type: 'string', format: 'github-username' }
}

// GitHub repository name validation  
{
  repoName: { type: 'string', format: 'github-repo-name' }
}

// GitHub token validation (basic format checking)
{
  token: { type: 'string', format: 'github-token' }
}
```

### DAK Formats

```typescript
// FHIR ID format
{
  id: { type: 'string', format: 'fhir-id' }
}

// DAK ID format (follows FHIR IG naming)
{
  dakId: { type: 'string', format: 'dak-id' }
}
```

## Decorators

### Parameter Validation

```typescript
import { ValidateParams } from './services/runtimeValidationService';

class UserService {
  @ValidateParams('GitHubUser')
  async saveUser(user: GitHubUser): Promise<void> {
    // user parameter is automatically validated
    // Implementation here
  }
}
```

### Return Value Validation

```typescript
import { ValidateReturn } from './services/runtimeValidationService';

class GitHubService {
  @ValidateReturn('GitHubUser')
  async getUser(username: string): Promise<GitHubUser> {
    // Return value is automatically validated
    const response = await fetch(`/api/users/${username}`);
    return response.json();
  }
}
```

## Error Handling

### Validation Errors

```typescript
interface ValidationError {
  code: string;      // Error code (e.g., 'REQUIRED', 'FORMAT')
  message: string;   // Human-readable error message
  path?: string;     // JSON path to the invalid property
  value?: any;       // The invalid value
}
```

### Common Error Codes

- `REQUIRED`: Missing required property
- `FORMAT`: Invalid format (e.g., invalid email)
- `TYPE`: Wrong data type (e.g., string instead of number)
- `MINIMUM`/`MAXIMUM`: Number out of range
- `SCHEMA_NOT_FOUND`: Referenced schema not registered

## Integration with TypeScript Types

### Automatic Schema Generation

Generate JSON schemas from TypeScript types:

```bash
# Generate schemas from TypeScript types
npm run generate-schemas
```

This creates schemas in `public/docs/schemas/` that can be loaded by the validation service.

### Loading Generated Schemas

```typescript
import combinedSchemas from '../../public/docs/schemas/generated-schemas-tjs.json';

// Register all generated schemas
Object.entries(combinedSchemas.definitions).forEach(([typeName, schema]) => {
  runtimeValidator.registerSchema(typeName, schema);
});
```

## Performance Considerations

### Schema Compilation

- Schemas are compiled once during registration for optimal performance
- Use `hasSchema()` to check if a schema is already registered
- Consider lazy loading of schemas for large applications

### Batch Operations

- Use `validateBatch()` for validating multiple items efficiently
- Batch validation reuses compiled validators

### Memory Management

```typescript
// Clear unused schemas to free memory
runtimeValidator.unregisterSchema('UnusedSchema');

// Clear all schemas (useful for testing)
runtimeValidator.clearSchemas();
```

## Testing

### Test Setup

```typescript
import { runtimeValidator } from './services/runtimeValidationService';

describe('User Service', () => {
  beforeEach(() => {
    // Clear schemas before each test
    runtimeValidator.clearSchemas();
    
    // Register test schemas
    runtimeValidator.registerSchema('TestUser', testUserSchema);
  });
});
```

### Mock Validation

```typescript
// Mock the validation service for testing
jest.mock('./services/runtimeValidationService', () => ({
  validateAndCast: jest.fn((schema, data) => data),
  validateData: jest.fn((schema, data) => ({ 
    isValid: true, 
    data, 
    errors: [], 
    warnings: [] 
  }))
}));
```

## Troubleshooting

### Common Issues

**1. Schema Not Found**
```typescript
// Check if schema is registered
if (!runtimeValidator.hasSchema('MyType')) {
  console.error('Schema not registered');
}

// List all registered schemas
console.log('Available schemas:', runtimeValidator.getRegisteredSchemas());
```

**2. Validation Failures**
```typescript
// Enable verbose logging
const result = validateData('MyType', data);
if (!result.isValid) {
  console.error('Validation details:', {
    errors: result.errors,
    schema: runtimeValidator.getSchema('MyType')
  });
}
```

**3. Performance Issues**
- Pre-compile schemas during application startup
- Use batch validation for large datasets
- Consider schema optimization for complex types

### Debugging

Enable debug mode for detailed validation information:

```typescript
// Development configuration
runtimeValidator.updateConfig({
  strict: false,     // Allow additional properties during development
  throwOnError: false // Log errors instead of throwing
});
```

## Best Practices

1. **Register schemas at startup**: Pre-register all schemas for better performance
2. **Use type-safe validation**: Always specify the expected type when validating
3. **Handle errors gracefully**: Always check `isValid` before using validated data
4. **Leverage custom formats**: Use SGEX-specific formats for domain validation
5. **Test validation logic**: Include validation tests in your test suite
6. **Document schemas**: Add descriptions to your JSON schemas for better documentation

## Examples

### Complete Service Example

```typescript
import { runtimeValidator, validateAndCast } from './services/runtimeValidationService';
import { GitHubUser, GitHubRepository } from '../types/core';

export class GitHubService {
  constructor() {
    // Register schemas on service initialization
    this.registerSchemas();
  }

  private registerSchemas() {
    const userSchema = {
      type: 'object',
      properties: {
        login: { type: 'string', format: 'github-username' },
        id: { type: 'number' },
        avatar_url: { type: 'string', format: 'uri' }
      },
      required: ['login', 'id']
    };

    runtimeValidator.registerSchema('GitHubUser', userSchema);
  }

  async getUser(username: string): Promise<GitHubUser> {
    const response = await fetch(`/api/users/${username}`);
    const userData = await response.json();
    
    // Validate and cast the response
    return validateAndCast<GitHubUser>('GitHubUser', userData);
  }

  async createUser(userData: unknown): Promise<GitHubUser> {
    // Validate input data
    const user = validateAndCast<GitHubUser>('GitHubUser', userData);
    
    // Process validated data
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });

    const createdUser = await response.json();
    
    // Validate response
    return validateAndCast<GitHubUser>('GitHubUser', createdUser);
  }
}
```

This runtime validation system ensures data integrity throughout the SGEX Workbench while providing excellent TypeScript integration and developer experience.

## Additional Documentation

For comprehensive coverage of advanced topics, see these detailed guides:

### 📚 [Runtime Validation Integration Patterns](./runtime-validation-integration.md)
Complete guide for integrating the RuntimeValidationService with existing services, migration strategies, and performance optimization for large-scale validation.

### 🎯 [Custom Format Documentation](./custom-formats-documentation.md)
Comprehensive reference for all available custom validation formats, dynamic format discovery, testing patterns, and how to add domain-specific formats.

### ⚙️ [Schema Generation Configuration](./schema-generation-configuration.md)
Detailed configuration options for TypeScript-to-JSON schema generation tools, handling complex types, circular references, and optimization strategies.

### 🚀 [Build Process Integration](./build-process-integration.md)
Complete CI/CD integration guide covering GitHub Actions workflows, deployment pipeline integration, error handling, and performance monitoring.

These guides provide the depth and detail needed for production deployment and advanced use cases of the TypeScript validation system.