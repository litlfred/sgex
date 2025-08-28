# Runtime Validation Integration Patterns

## Overview

This guide provides comprehensive patterns for integrating the RuntimeValidationService with existing SGEX Workbench services, along with migration strategies and performance considerations for large-scale validation.

## Table of Contents

1. [Integration with Existing Services](#integration-with-existing-services)
2. [Migration Patterns](#migration-patterns)
3. [Performance Considerations](#performance-considerations)
4. [Advanced Integration Scenarios](#advanced-integration-scenarios)
5. [Best Practices](#best-practices)

## Integration with Existing Services

### Pattern 1: Gradual Service Integration

The most effective approach is to gradually integrate validation into existing services without breaking existing functionality.

#### Before Integration (Existing JavaScript Service)

```javascript
// src/services/githubService.js
export class GitHubService {
  async getUser(username) {
    const response = await fetch(`/api/users/${username}`);
    const user = await response.json();
    
    // Manual validation (error-prone)
    if (!user.login || !user.id) {
      throw new Error('Invalid user data');
    }
    
    return user;
  }
}
```

#### After Integration (TypeScript with Validation)

```typescript
// src/services/githubService.ts
import { runtimeValidator, validateAndCast } from './runtimeValidationService';
import { GitHubUser } from '../types/core';

export class GitHubService {
  constructor() {
    this.initializeSchemas();
  }

  private initializeSchemas() {
    // Register schemas at service initialization
    const userSchema = {
      type: 'object',
      properties: {
        login: { type: 'string', format: 'github-username' },
        id: { type: 'number' },
        avatar_url: { type: 'string', format: 'uri' },
        name: { type: 'string' }
      },
      required: ['login', 'id'],
      additionalProperties: true
    };
    
    runtimeValidator.registerSchema('GitHubUser', userSchema);
  }

  async getUser(username: string): Promise<GitHubUser> {
    const response = await fetch(`/api/users/${username}`);
    const userData = await response.json();
    
    // Type-safe validation with detailed error reporting
    return validateAndCast<GitHubUser>('GitHubUser', userData);
  }
}
```

### Pattern 2: Repository Cache Service Integration

Enhance the existing caching service with validation:

```typescript
// src/services/repositoryCacheService.ts
import { runtimeValidator, validateData } from './runtimeValidationService';
import { GitHubRepository, DAKRepository } from '../types/core';

export class RepositoryCacheService {
  private cache = new Map();

  constructor() {
    this.initializeValidation();
  }

  private initializeValidation() {
    // Load schemas for repository types
    this.loadRepositorySchemas();
  }

  async cacheRepository(repoData: unknown): Promise<GitHubRepository> {
    // Validate before caching
    const validation = validateData<GitHubRepository>('GitHubRepository', repoData);
    
    if (!validation.isValid) {
      console.warn('Repository data validation failed:', validation.errors);
      // Still cache but with warnings
      this.logValidationIssues(validation.errors);
    }

    const cacheKey = this.generateCacheKey(validation.data);
    this.cache.set(cacheKey, {
      data: validation.data,
      validationResult: validation,
      timestamp: Date.now()
    });

    return validation.data;
  }

  private logValidationIssues(errors: ValidationError[]) {
    // Log validation issues for monitoring
    console.group('Repository Validation Issues');
    errors.forEach(error => {
      console.warn(`${error.code}: ${error.message}`, error.path);
    });
    console.groupEnd();
  }
}
```

### Pattern 3: Data Access Layer Integration

Create a validated data access layer:

```typescript
// src/services/validatedDataAccessLayer.ts
import { runtimeValidator } from './runtimeValidationService';
import { 
  GitHubUser, 
  GitHubRepository, 
  DAKRepository,
  ValidationResult 
} from '../types/core';

export class ValidatedDataAccessLayer {
  constructor() {
    this.initializeSchemas();
  }

  private async initializeSchemas() {
    // Load all schemas from generated files
    await this.loadGeneratedSchemas();
  }

  private async loadGeneratedSchemas() {
    try {
      // Load TypeScript-generated schemas
      const tjsSchemas = await import('../../public/docs/schemas/generated-schemas-tjs.json');
      const tsjsgSchemas = await import('../../public/docs/schemas/generated-schemas-tsjsg.json');

      // Register TJS schemas
      Object.entries(tjsSchemas.definitions).forEach(([typeName, schema]) => {
        runtimeValidator.registerSchema(`tjs_${typeName}`, schema);
      });

      // Register TSJSG schemas (fallback for complex types)
      Object.entries(tsjsgSchemas.definitions || {}).forEach(([typeName, schema]) => {
        runtimeValidator.registerSchema(`tsjsg_${typeName}`, schema);
      });

    } catch (error) {
      console.warn('Failed to load generated schemas:', error);
      this.initializeFallbackSchemas();
    }
  }

  async saveUserData(userData: unknown): Promise<{ user: GitHubUser; validation: ValidationResult }> {
    const validation = runtimeValidator.validate<GitHubUser>('GitHubUser', userData);
    
    return {
      user: validation.data,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      }
    };
  }

  async queryRepositories(criteria: unknown): Promise<GitHubRepository[]> {
    // Validate search criteria first
    const criteriaValidation = runtimeValidator.validate('RepositorySearchCriteria', criteria);
    
    if (!criteriaValidation.isValid) {
      throw new Error(`Invalid search criteria: ${criteriaValidation.errors.map(e => e.message).join(', ')}`);
    }

    // Perform query with validated criteria
    const results = await this.performRepositoryQuery(criteriaValidation.data);
    
    // Validate each result
    const validatedResults = results.map(repo => {
      const validation = runtimeValidator.validate<GitHubRepository>('GitHubRepository', repo);
      if (!validation.isValid) {
        console.warn('Repository validation failed:', validation.errors);
      }
      return validation.data;
    });

    return validatedResults;
  }
}
```

## Migration Patterns

### Pattern 1: Schema-First Migration

Start by defining comprehensive schemas, then migrate services to use them:

```typescript
// Step 1: Define comprehensive schemas
const DAK_VALIDATION_SCHEMAS = {
  GitHubUser: {
    type: 'object',
    properties: {
      login: { type: 'string', format: 'github-username' },
      id: { type: 'number', minimum: 1 },
      avatar_url: { type: 'string', format: 'uri' },
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' }
    },
    required: ['login', 'id']
  },
  
  SushiConfig: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'fhir-id' },
      dependencies: {
        type: 'object',
        properties: {
          'smart.who.int.base': { type: 'string' }
        },
        required: ['smart.who.int.base']
      }
    }
  }
};

// Step 2: Register all schemas at application startup
export function initializeApplicationValidation() {
  Object.entries(DAK_VALIDATION_SCHEMAS).forEach(([schemaName, schema]) => {
    runtimeValidator.registerSchema(schemaName, schema);
  });
}
```

### Pattern 2: Wrapper-Based Migration

Create validation wrappers around existing services:

```typescript
// src/services/wrappers/validatedGitHubService.ts
import { GitHubService } from '../githubService'; // Existing JS service
import { validateAndCast, runtimeValidator } from '../runtimeValidationService';
import { GitHubUser, GitHubRepository } from '../../types/core';

export class ValidatedGitHubService {
  private githubService: GitHubService;

  constructor() {
    this.githubService = new GitHubService();
    this.initializeValidation();
  }

  private initializeValidation() {
    // Register schemas for GitHub entities
    this.registerGitHubSchemas();
  }

  async getUser(username: string): Promise<GitHubUser> {
    // Call existing service
    const userData = await this.githubService.getUser(username);
    
    // Add validation layer
    return validateAndCast<GitHubUser>('GitHubUser', userData);
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const repoData = await this.githubService.getRepository(owner, repo);
    return validateAndCast<GitHubRepository>('GitHubRepository', repoData);
  }

  // Batch operations with validation
  async getMultipleUsers(usernames: string[]): Promise<GitHubUser[]> {
    const userDataArray = await Promise.all(
      usernames.map(username => this.githubService.getUser(username))
    );

    // Batch validation for performance
    const validationResults = runtimeValidator.validateBatch<GitHubUser>('GitHubUser', userDataArray);
    
    const validUsers = validationResults
      .filter(result => result.isValid)
      .map(result => result.data);

    const invalidUsers = validationResults.filter(result => !result.isValid);
    if (invalidUsers.length > 0) {
      console.warn(`${invalidUsers.length} users failed validation:`, invalidUsers);
    }

    return validUsers;
  }
}
```

### Pattern 3: Incremental Field Migration

Gradually add validation to specific data fields:

```typescript
// src/services/incrementalMigration.ts
import { runtimeValidator } from './runtimeValidationService';

export class IncrementalValidationMigration {
  // Phase 1: Validate critical fields only
  validateCriticalUserData(userData: any) {
    const criticalFieldsSchema = {
      type: 'object',
      properties: {
        login: { type: 'string', format: 'github-username' },
        id: { type: 'number' }
      },
      required: ['login', 'id']
    };

    runtimeValidator.registerSchema('CriticalUserFields', criticalFieldsSchema);
    return runtimeValidator.validate('CriticalUserFields', userData);
  }

  // Phase 2: Add profile validation
  validateUserProfile(userData: any) {
    const profileSchema = {
      type: 'object',
      properties: {
        login: { type: 'string', format: 'github-username' },
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        avatar_url: { type: 'string', format: 'uri' }
      },
      required: ['login', 'id']
    };

    runtimeValidator.registerSchema('UserProfile', profileSchema);
    return runtimeValidator.validate('UserProfile', userData);
  }

  // Phase 3: Full user validation
  validateCompleteUser(userData: any) {
    // Use the full GitHubUser schema
    return runtimeValidator.validate('GitHubUser', userData);
  }
}
```

## Performance Considerations

### 1. Schema Compilation and Caching

```typescript
// src/services/performanceOptimizedValidation.ts
import { runtimeValidator } from './runtimeValidationService';

export class PerformanceOptimizedValidation {
  private schemaLoadPromises = new Map<string, Promise<void>>();
  private precompiledValidators = new Map<string, any>();

  constructor() {
    // Pre-warm frequently used schemas
    this.precompileFrequentSchemas();
  }

  private async precompileFrequentSchemas() {
    const frequentSchemas = ['GitHubUser', 'GitHubRepository', 'SushiConfig'];
    
    await Promise.all(
      frequentSchemas.map(schemaName => this.ensureSchemaLoaded(schemaName))
    );
  }

  private async ensureSchemaLoaded(schemaName: string): Promise<void> {
    if (this.schemaLoadPromises.has(schemaName)) {
      return this.schemaLoadPromises.get(schemaName);
    }

    const loadPromise = this.loadAndCompileSchema(schemaName);
    this.schemaLoadPromises.set(schemaName, loadPromise);
    
    return loadPromise;
  }

  private async loadAndCompileSchema(schemaName: string): Promise<void> {
    try {
      // Load schema definition
      const schema = await this.loadSchemaDefinition(schemaName);
      
      // Register and compile
      runtimeValidator.registerSchema(schemaName, schema);
      
      console.log(`Schema ${schemaName} loaded and compiled`);
    } catch (error) {
      console.error(`Failed to load schema ${schemaName}:`, error);
    }
  }

  // Optimized batch validation with size limits
  async validateLargeBatch<T>(schemaName: string, dataArray: unknown[], batchSize = 100): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize);
      const batchResults = runtimeValidator.validateBatch<T>(schemaName, batch);
      
      const validItems = batchResults
        .filter(result => result.isValid)
        .map(result => result.data);
      
      results.push(...validItems);
      
      // Allow other tasks to run between batches
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
  }
}
```

### 2. Memory Management for Large Datasets

```typescript
// src/services/memoryEfficientValidation.ts
export class MemoryEfficientValidation {
  private validationCache = new Map<string, any>();
  private readonly MAX_CACHE_SIZE = 1000;

  async processLargeDataset(data: unknown[], schemaName: string) {
    const processor = this.createStreamProcessor(schemaName);
    
    for (const item of data) {
      await processor.process(item);
    }
    
    return processor.getResults();
  }

  private createStreamProcessor(schemaName: string) {
    const results: any[] = [];
    let processedCount = 0;

    return {
      async process(item: unknown) {
        const validation = runtimeValidator.validate(schemaName, item);
        
        if (validation.isValid) {
          results.push(validation.data);
        }
        
        processedCount++;
        
        // Periodic memory cleanup
        if (processedCount % 1000 === 0) {
          this.cleanupValidationCache();
          // Force garbage collection hint
          if (global.gc) {
            global.gc();
          }
        }
      },
      
      getResults() {
        return results;
      }
    };
  }

  private cleanupValidationCache() {
    if (this.validationCache.size > this.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(this.validationCache.entries());
      const toRemove = entries.slice(0, this.validationCache.size - this.MAX_CACHE_SIZE);
      
      toRemove.forEach(([key]) => {
        this.validationCache.delete(key);
      });
    }
  }
}
```

### 3. Performance Monitoring

```typescript
// src/services/validationPerformanceMonitor.ts
export class ValidationPerformanceMonitor {
  private metrics = new Map<string, {
    callCount: number;
    totalTime: number;
    avgTime: number;
    errors: number;
  }>();

  measureValidation<T>(schemaName: string, data: unknown): T {
    const startTime = performance.now();
    
    try {
      const result = runtimeValidator.validateAndCast<T>(schemaName, data);
      this.recordSuccess(schemaName, performance.now() - startTime);
      return result;
    } catch (error) {
      this.recordError(schemaName, performance.now() - startTime);
      throw error;
    }
  }

  private recordSuccess(schemaName: string, duration: number) {
    this.updateMetrics(schemaName, duration, false);
  }

  private recordError(schemaName: string, duration: number) {
    this.updateMetrics(schemaName, duration, true);
  }

  private updateMetrics(schemaName: string, duration: number, isError: boolean) {
    const current = this.metrics.get(schemaName) || {
      callCount: 0,
      totalTime: 0,
      avgTime: 0,
      errors: 0
    };

    current.callCount++;
    current.totalTime += duration;
    current.avgTime = current.totalTime / current.callCount;
    
    if (isError) {
      current.errors++;
    }

    this.metrics.set(schemaName, current);
  }

  getPerformanceReport() {
    const report = Array.from(this.metrics.entries()).map(([schema, metrics]) => ({
      schema,
      ...metrics,
      errorRate: (metrics.errors / metrics.callCount) * 100
    }));

    return report.sort((a, b) => b.avgTime - a.avgTime);
  }
}
```

## Advanced Integration Scenarios

### 1. Multi-Service Validation Pipeline

```typescript
// src/services/validationPipeline.ts
export class ValidationPipeline {
  private stages: Array<(data: any) => Promise<any>> = [];

  addStage(validator: (data: any) => Promise<any>) {
    this.stages.push(validator);
    return this;
  }

  async process(initialData: unknown) {
    let currentData = initialData;
    const stageResults: any[] = [];

    for (const [index, stage] of this.stages.entries()) {
      try {
        currentData = await stage(currentData);
        stageResults.push({ stage: index, success: true, data: currentData });
      } catch (error) {
        stageResults.push({ stage: index, success: false, error: error.message });
        throw new Error(`Pipeline failed at stage ${index}: ${error.message}`);
      }
    }

    return { finalData: currentData, stageResults };
  }
}

// Usage example
const dakValidationPipeline = new ValidationPipeline()
  .addStage(async (data) => validateAndCast<GitHubRepository>('GitHubRepository', data))
  .addStage(async (repo) => validateAndCast<SushiConfig>('SushiConfig', repo.sushiConfig))
  .addStage(async (config) => validateDakCompliance(config));
```

### 2. Reactive Validation with RxJS

```typescript
// src/services/reactiveValidation.ts
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

export class ReactiveValidation {
  validateStream<T>(schemaName: string) {
    return (source: Observable<unknown>): Observable<T> => {
      return source.pipe(
        map(data => {
          const validation = runtimeValidator.validate<T>(schemaName, data);
          if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
          }
          return validation.data;
        }),
        retry(2),
        catchError(error => {
          console.error('Stream validation failed:', error);
          return throwError(error);
        })
      );
    };
  }
}

// Usage with data streams
const dataStream$ = new Observable(observer => {
  // Emit data items
  observer.next(userData1);
  observer.next(userData2);
  observer.complete();
});

const validatedUsers$ = dataStream$.pipe(
  new ReactiveValidation().validateStream<GitHubUser>('GitHubUser')
);
```

## Best Practices

### 1. Error Handling Strategy

```typescript
// src/services/validationErrorHandling.ts
export class ValidationErrorHandler {
  static handleValidationError(error: ValidationError, context: string) {
    const errorContext = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        code: error.code,
        message: error.message,
        path: error.path,
        value: error.value
      }
    };

    // Log structured error
    console.error('Validation Error:', errorContext);

    // Send to monitoring service
    this.sendToMonitoring(errorContext);

    // User-friendly error message
    return this.createUserFriendlyMessage(error);
  }

  private static createUserFriendlyMessage(error: ValidationError): string {
    const friendlyMessages = {
      'REQUIRED': 'A required field is missing',
      'FORMAT': 'The data format is invalid',
      'TYPE': 'The data type is incorrect',
      'SCHEMA_NOT_FOUND': 'Validation schema not available'
    };

    return friendlyMessages[error.code] || 'Data validation failed';
  }
}
```

### 2. Testing Integration

```typescript
// src/services/__tests__/validationIntegration.test.ts
import { ValidationTestHelper } from '../testHelpers/validationTestHelper';

describe('Validation Integration', () => {
  let testHelper: ValidationTestHelper;

  beforeEach(() => {
    testHelper = new ValidationTestHelper();
    testHelper.setupTestSchemas();
  });

  test('should validate GitHub user data', async () => {
    const validUser = testHelper.createValidGitHubUser();
    const result = await testHelper.validateUser(validUser);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should handle validation errors gracefully', async () => {
    const invalidUser = testHelper.createInvalidGitHubUser();
    const result = await testHelper.validateUser(invalidUser);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### 3. Configuration Management

```typescript
// src/config/validationConfig.ts
export const VALIDATION_CONFIG = {
  development: {
    strict: false,
    throwOnError: false,
    enablePerformanceMonitoring: true,
    logValidationWarnings: true
  },
  
  production: {
    strict: true,
    throwOnError: false,
    enablePerformanceMonitoring: false,
    logValidationWarnings: false
  },
  
  testing: {
    strict: true,
    throwOnError: true,
    enablePerformanceMonitoring: false,
    logValidationWarnings: true
  }
};

export function configureValidationForEnvironment(env: string) {
  const config = VALIDATION_CONFIG[env] || VALIDATION_CONFIG.development;
  runtimeValidator.updateConfig(config);
}
```

This comprehensive integration guide provides the foundation for successfully adopting runtime validation throughout the SGEX Workbench while maintaining performance and reliability.