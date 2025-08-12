# Schema Generation Configuration Guide

## Overview

The SGEX Workbench uses two complementary TypeScript-to-JSON schema generation tools to provide comprehensive schema coverage. This guide covers detailed configuration options, handling complex types, and optimizing the generation process.

## Table of Contents

1. [Schema Generation Tools](#schema-generation-tools)
2. [Configuration Options](#configuration-options)
3. [Type Inclusion and Exclusion](#type-inclusion-and-exclusion)
4. [Handling Complex Types](#handling-complex-types)
5. [Circular Reference Management](#circular-reference-management)
6. [Build Integration](#build-integration)
7. [Advanced Configuration](#advanced-configuration)

## Schema Generation Tools

### TypeScript JSON Schema (typescript-json-schema)

Primary tool for generating JSON schemas from TypeScript types with excellent JSDoc support.

**Strengths:**
- Excellent JSDoc comment integration
- Stable and well-maintained
- Good performance for simple to medium complexity types
- Strong support for union types and enums

**Configuration File:** `typescript-json-schema.config.json`

### TS JSON Schema Generator (ts-json-schema-generator)

Alternative tool with better support for complex TypeScript features.

**Strengths:**
- Superior handling of complex generic types
- Better support for conditional types
- More accurate handling of mapped types
- Advanced intersection type support

**Configuration File:** `ts-json-schema-generator.config.json`

## Configuration Options

### TypeScript JSON Schema Configuration

Create `typescript-json-schema.config.json`:

```json
{
  "required": true,
  "noExtraProps": false,
  "propOrder": false,
  "typeOfKeyword": false,
  "out": "public/docs/schemas/generated-schemas-tjs.json",
  "validationKeywords": [
    "description",
    "format",
    "examples",
    "default",
    "minimum",
    "maximum",
    "pattern",
    "minLength",
    "maxLength"
  ],
  "strictNullChecks": true,
  "esModuleInterop": true,
  "skipLibCheck": true,
  "include": [
    "src/types/**/*.ts"
  ],
  "exclude": [
    "src/types/**/*.test.ts",
    "src/types/**/internal/**/*.ts"
  ],
  "aliasRef": true,
  "topRef": false,
  "titles": true,
  "defaultProps": true,
  "noTypesOnly": false,
  "ref": true,
  "expose": "export",
  "constAsEnum": true,
  "ignoreErrors": false
}
```

### TS JSON Schema Generator Configuration

Create `ts-json-schema-generator.config.json`:

```json
{
  "path": "src/types/**/*.ts",
  "type": "*",
  "out": "public/docs/schemas/generated-schemas-tsjsg.json",
  "schemaId": "https://sgex.who.int/schemas/",
  "expose": "export",
  "topRef": true,
  "jsDoc": "extended",
  "sortProps": true,
  "strictTuples": true,
  "skipTypeCheck": false,
  "encodeRefs": true,
  "extraTags": [
    "format",
    "examples",
    "default",
    "deprecated"
  ],
  "additionalProperties": false,
  "markdownDescription": true
}
```

### Enhanced Package.json Scripts

Update `package.json` with advanced schema generation scripts:

```json
{
  "scripts": {
    "generate-schemas": "npm run generate-schemas:clean && npm run generate-schemas:typescript-json-schema && npm run generate-schemas:ts-json-schema-generator && npm run generate-schemas:merge",
    
    "generate-schemas:clean": "rimraf public/docs/schemas/generated-*.json",
    
    "generate-schemas:typescript-json-schema": "typescript-json-schema --config typescript-json-schema.config.json tsconfig.json \"*\"",
    
    "generate-schemas:ts-json-schema-generator": "ts-json-schema-generator --config ts-json-schema-generator.config.json",
    
    "generate-schemas:merge": "node scripts/mergeGeneratedSchemas.js",
    
    "generate-schemas:validate": "node scripts/validateGeneratedSchemas.js",
    
    "generate-schemas:core-only": "typescript-json-schema tsconfig.json \"GitHubUser|GitHubRepository|SushiConfig|DAKRepository\" --out public/docs/schemas/core-schemas.json",
    
    "generate-schemas:watch": "nodemon --watch src/types --ext ts --exec \"npm run generate-schemas\"",
    
    "prebuild": "npm run type-check && npm run generate-schemas && npm run generate-schemas:validate"
  }
}
```

## Type Inclusion and Exclusion

### Fine-Grained Type Control

```typescript
// src/types/schemaConfig.ts
/**
 * Schema generation configuration for different type categories
 */
export interface SchemaGenerationConfig {
  /** @schema-include Core types that should always be included */
  coreTypes: string[];
  
  /** @schema-exclude Internal types that should be excluded */
  internalTypes: string[];
  
  /** @schema-optional Types that may be included based on build target */
  optionalTypes: string[];
}

// Mark types for inclusion/exclusion using JSDoc annotations
/**
 * GitHub User representation
 * @schema-category core
 * @schema-priority high
 */
export interface GitHubUser {
  // ...
}

/**
 * Internal cache entry - not for external use
 * @schema-exclude
 * @internal
 */
export interface InternalCacheEntry {
  // This will be excluded from generated schemas
}

/**
 * Development-only debugging interface
 * @schema-development-only
 */
export interface DebugInfo {
  // Only included in development builds
}
```

### Dynamic Type Selection

Create `scripts/selectTypesForGeneration.js`:

```javascript
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

class TypeSelector {
  constructor(configPath) {
    this.config = require(configPath);
  }

  /**
   * Parse TypeScript files and extract type information
   */
  analyzeTypes(sourceFiles) {
    const program = ts.createProgram(sourceFiles, {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS
    });

    const typeChecker = program.getTypeChecker();
    const typesToInclude = [];
    const typesToExclude = [];

    program.getSourceFiles().forEach(sourceFile => {
      if (!sourceFile.isDeclarationFile) {
        this.visitNode(sourceFile, typeChecker, typesToInclude, typesToExclude);
      }
    });

    return { typesToInclude, typesToExclude };
  }

  visitNode(node, typeChecker, includeList, excludeList) {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      const symbol = typeChecker.getSymbolAtLocation(node.name);
      const jsDocTags = symbol?.getJsDocTags() || [];
      
      const schemaExclude = jsDocTags.some(tag => tag.name === 'schema-exclude');
      const schemaInclude = jsDocTags.some(tag => tag.name === 'schema-include');
      const isInternal = jsDocTags.some(tag => tag.name === 'internal');
      const isDevelopmentOnly = jsDocTags.some(tag => tag.name === 'schema-development-only');

      const typeName = node.name.getText();

      if (schemaExclude || isInternal) {
        excludeList.push(typeName);
      } else if (schemaInclude || this.shouldIncludeType(typeName, jsDocTags)) {
        includeList.push(typeName);
      }

      if (isDevelopmentOnly && process.env.NODE_ENV !== 'development') {
        excludeList.push(typeName);
      }
    }

    ts.forEachChild(node, child => this.visitNode(child, typeChecker, includeList, excludeList));
  }

  shouldIncludeType(typeName, jsDocTags) {
    // Include core types by default
    const coreTypes = ['GitHubUser', 'GitHubRepository', 'SushiConfig', 'DAKRepository'];
    if (coreTypes.includes(typeName)) {
      return true;
    }

    // Check for schema-category tag
    const categoryTag = jsDocTags.find(tag => tag.name === 'schema-category');
    if (categoryTag && this.config.includedCategories.includes(categoryTag.text[0].text)) {
      return true;
    }

    return false;
  }

  generateTypeList(sourceDir) {
    const tsFiles = this.findTypeScriptFiles(sourceDir);
    const analysis = this.analyzeTypes(tsFiles);
    
    return {
      include: analysis.typesToInclude,
      exclude: analysis.typesToExclude,
      typeList: analysis.typesToInclude.join('|')
    };
  }

  findTypeScriptFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          traverse(itemPath);
        } else if (item.endsWith('.ts') && !item.endsWith('.test.ts')) {
          files.push(itemPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }
}

module.exports = TypeSelector;
```

## Handling Complex Types

### Generic Type Resolution

```typescript
// src/types/generics.ts

/**
 * API Response wrapper with type-safe data
 * @template T The response data type
 */
export interface ApiResponse<T> {
  /** @description Response data */
  data: T;
  
  /** @description HTTP status code */
  status: number;
  
  /** @description Response message */
  message?: string;
  
  /** @description Request metadata */
  meta?: {
    /** @format iso-date */
    timestamp: string;
    requestId: string;
  };
}

/**
 * Paginated response wrapper
 * @template T The item type
 */
export interface PaginatedResponse<T> {
  /** @description Array of items */
  items: T[];
  
  /** @description Total number of items */
  totalCount: number;
  
  /** @description Current page number */
  page: number;
  
  /** @description Items per page */
  pageSize: number;
  
  /** @description Whether more pages exist */
  hasMore: boolean;
}

// Concrete type instantiations for schema generation
/**
 * GitHub User API Response
 * @schema-concrete-type
 */
export type GitHubUserResponse = ApiResponse<GitHubUser>;

/**
 * Paginated GitHub Repositories Response
 * @schema-concrete-type
 */
export type PaginatedRepositoriesResponse = PaginatedResponse<GitHubRepository>;
```

### Union and Intersection Types

```typescript
// src/types/unions.ts

/**
 * Authentication method discriminated union
 */
export type AuthenticationMethod = 
  | PersonalAccessToken
  | OAuthToken
  | AppInstallationToken;

/**
 * Personal Access Token authentication
 */
export interface PersonalAccessToken {
  type: 'personal_access_token';
  /** @format github-token */
  token: string;
  scopes: string[];
}

/**
 * OAuth Token authentication
 */
export interface OAuthToken {
  type: 'oauth_token';
  /** @format github-token */
  access_token: string;
  /** @format github-token */
  refresh_token?: string;
  /** @format iso-date */
  expires_at?: string;
}

/**
 * App Installation Token
 */
export interface AppInstallationToken {
  type: 'app_installation';
  /** @format github-token */
  token: string;
  installation_id: number;
  /** @format iso-date */
  expires_at: string;
}

// Complex intersection type
/**
 * Enhanced GitHub Repository with DAK-specific fields
 */
export type DAKEnhancedRepository = GitHubRepository & {
  dakValidation: DAKValidationResult;
  sushiConfig: SushiConfig;
  isDak: true;
};
```

### Conditional Types Configuration

Create `scripts/handleConditionalTypes.js`:

```javascript
/**
 * Configuration for handling complex TypeScript conditional types
 */
class ConditionalTypeHandler {
  constructor() {
    this.typeMapping = new Map();
    this.setupTypeMappings();
  }

  setupTypeMappings() {
    // Map complex conditional types to simpler schema representations
    this.typeMapping.set('ApiResponse<T>', {
      strategy: 'generic-expansion',
      concreteTypes: ['GitHubUser', 'GitHubRepository', 'SushiConfig'],
      generateFor: (baseType) => ({
        type: 'object',
        properties: {
          data: { $ref: `#/definitions/${baseType}` },
          status: { type: 'number' },
          message: { type: 'string' },
          meta: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              requestId: { type: 'string' }
            }
          }
        },
        required: ['data', 'status']
      })
    });

    this.typeMapping.set('PaginatedResponse<T>', {
      strategy: 'generic-expansion',
      concreteTypes: ['GitHubRepository', 'GitHubUser'],
      generateFor: (baseType) => ({
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: `#/definitions/${baseType}` }
          },
          totalCount: { type: 'number' },
          page: { type: 'number' },
          pageSize: { type: 'number' },
          hasMore: { type: 'boolean' }
        },
        required: ['items', 'totalCount', 'page', 'pageSize', 'hasMore']
      })
    });
  }

  processGeneratedSchemas(schemas) {
    const processedSchemas = { ...schemas };

    // Expand generic types
    this.typeMapping.forEach((config, genericType) => {
      if (config.strategy === 'generic-expansion') {
        config.concreteTypes.forEach(concreteType => {
          const schemaName = `${genericType.replace('<T>', concreteType)}`;
          processedSchemas.definitions[schemaName] = config.generateFor(concreteType);
        });
      }
    });

    return processedSchemas;
  }
}

module.exports = ConditionalTypeHandler;
```

## Circular Reference Management

### Circular Reference Detection

```typescript
// src/types/circularTypes.ts

/**
 * Organization with bidirectional repository references
 * Note: This creates a circular reference that needs special handling
 */
export interface GitHubOrganization {
  id: number;
  login: string;
  /** @description Repositories owned by this organization */
  repositories?: GitHubRepository[];
}

// This creates a circular reference: Repository -> Owner -> Repositories
export interface GitHubRepository {
  id: number;
  name: string;
  /** @description Repository owner (can be organization) */
  owner: GitHubUser | GitHubOrganization;
}

/**
 * User with repositories - another potential circular reference
 */
export interface GitHubUser {
  id: number;
  login: string;
  /** @description Repositories owned by this user */
  repositories?: GitHubRepository[];
}
```

### Circular Reference Resolution Script

Create `scripts/resolveCircularReferences.js`:

```javascript
const fs = require('fs');

class CircularReferenceResolver {
  constructor() {
    this.visited = new Set();
    this.visiting = new Set();
    this.resolved = new Map();
  }

  detectCircularReferences(schema) {
    const cycles = [];
    this.findCycles(schema, [], cycles);
    return cycles;
  }

  findCycles(node, path, cycles) {
    if (!node || typeof node !== 'object') return;

    const nodeId = this.getNodeId(node);
    if (this.visiting.has(nodeId)) {
      // Found a cycle
      const cycleStart = path.indexOf(nodeId);
      cycles.push(path.slice(cycleStart).concat(nodeId));
      return;
    }

    if (this.visited.has(nodeId)) return;

    this.visiting.add(nodeId);
    path.push(nodeId);

    // Check all references
    if (node.$ref) {
      this.findCycles({ $ref: node.$ref }, path, cycles);
    } else if (node.properties) {
      Object.values(node.properties).forEach(prop => {
        this.findCycles(prop, [...path], cycles);
      });
    } else if (node.items) {
      this.findCycles(node.items, [...path], cycles);
    }

    this.visiting.delete(nodeId);
    this.visited.add(nodeId);
    path.pop();
  }

  resolveCircularReferences(schema) {
    const cycles = this.detectCircularReferences(schema);
    
    if (cycles.length === 0) {
      return schema;
    }

    console.log(`Found ${cycles.length} circular references, resolving...`);
    
    // Create resolved schema with proper $ref handling
    const resolvedSchema = JSON.parse(JSON.stringify(schema));
    
    cycles.forEach(cycle => {
      this.breakCycle(resolvedSchema, cycle);
    });

    return resolvedSchema;
  }

  breakCycle(schema, cycle) {
    // Strategy 1: Use $ref to definitions instead of inline objects
    const problemRef = cycle[cycle.length - 1];
    
    // Find the problematic reference and replace with $ref
    this.replaceInlineWithRef(schema, problemRef);
  }

  replaceInlineWithRef(schema, targetRef) {
    function traverse(obj, path = []) {
      if (!obj || typeof obj !== 'object') return;

      for (const [key, value] of Object.entries(obj)) {
        if (key === '$ref' && value === targetRef) {
          // Already a reference, good
          continue;
        }

        if (typeof value === 'object' && value !== null) {
          if (this.shouldReplaceWithRef(value, targetRef)) {
            // Replace inline definition with $ref
            obj[key] = { $ref: `#/definitions/${targetRef}` };
          } else {
            traverse(value, [...path, key]);
          }
        }
      }
    }

    traverse(schema);
  }

  shouldReplaceWithRef(obj, targetRef) {
    // Heuristic: if object is complex and matches a known type, use $ref
    return obj.type === 'object' && 
           obj.properties && 
           Object.keys(obj.properties).length > 3;
  }

  getNodeId(node) {
    if (node.$ref) return node.$ref;
    if (node.title) return node.title;
    return JSON.stringify(node).substring(0, 50);
  }

  generateCircularReferenceReport(schema) {
    const cycles = this.detectCircularReferences(schema);
    
    const report = {
      totalCycles: cycles.length,
      cycles: cycles.map(cycle => ({
        cycle: cycle.join(' -> '),
        length: cycle.length,
        severity: cycle.length > 5 ? 'high' : 'medium'
      })),
      recommendations: this.generateRecommendations(cycles)
    };

    return report;
  }

  generateRecommendations(cycles) {
    const recommendations = [];

    if (cycles.length > 0) {
      recommendations.push('Consider using $ref for complex object references');
      recommendations.push('Break cycles by making some references optional');
      recommendations.push('Use separate schemas for different use cases');
    }

    return recommendations;
  }
}

module.exports = CircularReferenceResolver;
```

## Build Integration

### Schema Generation Pipeline

Create `scripts/schemaGenerationPipeline.js`:

```javascript
const TypeSelector = require('./selectTypesForGeneration');
const CircularReferenceResolver = require('./resolveCircularReferences');
const ConditionalTypeHandler = require('./handleConditionalTypes');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SchemaGenerationPipeline {
  constructor(config = {}) {
    this.config = {
      sourceDir: 'src/types',
      outputDir: 'public/docs/schemas',
      enableCircularResolution: true,
      enableConditionalTypes: true,
      validate: true,
      ...config
    };

    this.typeSelector = new TypeSelector('./schema-generation.config.json');
    this.circularResolver = new CircularReferenceResolver();
    this.conditionalHandler = new ConditionalTypeHandler();
  }

  async run() {
    console.log('Starting schema generation pipeline...');

    try {
      // Step 1: Clean output directory
      await this.cleanOutputDirectory();

      // Step 2: Analyze types and generate type lists
      const typeAnalysis = this.typeSelector.generateTypeList(this.config.sourceDir);
      console.log(`Identified ${typeAnalysis.include.length} types for inclusion`);

      // Step 3: Generate schemas with typescript-json-schema
      await this.generateWithTypeScriptJsonSchema(typeAnalysis.typeList);

      // Step 4: Generate schemas with ts-json-schema-generator
      await this.generateWithTsJsonSchemaGenerator();

      // Step 5: Merge and process schemas
      const mergedSchemas = await this.mergeSchemas();

      // Step 6: Resolve circular references
      let processedSchemas = mergedSchemas;
      if (this.config.enableCircularResolution) {
        processedSchemas = this.circularResolver.resolveCircularReferences(mergedSchemas);
      }

      // Step 7: Handle conditional types
      if (this.config.enableConditionalTypes) {
        processedSchemas = this.conditionalHandler.processGeneratedSchemas(processedSchemas);
      }

      // Step 8: Save final schemas
      await this.saveFinalSchemas(processedSchemas);

      // Step 9: Generate validation report
      if (this.config.validate) {
        await this.generateValidationReport(processedSchemas);
      }

      console.log('Schema generation pipeline completed successfully!');
      return processedSchemas;

    } catch (error) {
      console.error('Schema generation pipeline failed:', error);
      throw error;
    }
  }

  async cleanOutputDirectory() {
    const outputDir = this.config.outputDir;
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      files.filter(file => file.startsWith('generated-')).forEach(file => {
        fs.unlinkSync(path.join(outputDir, file));
      });
    } else {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  async generateWithTypeScriptJsonSchema(typeList) {
    console.log('Generating schemas with typescript-json-schema...');
    
    const command = `typescript-json-schema tsconfig.json "${typeList}" --out ${this.config.outputDir}/generated-schemas-tjs.json --required --noExtraProps --titles`;
    
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.warn('typescript-json-schema failed, continuing with partial generation...');
    }
  }

  async generateWithTsJsonSchemaGenerator() {
    console.log('Generating schemas with ts-json-schema-generator...');
    
    const command = `ts-json-schema-generator --path "src/types/**/*.ts" --type "*" --out ${this.config.outputDir}/generated-schemas-tsjsg.json`;
    
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.warn('ts-json-schema-generator failed, continuing with partial generation...');
    }
  }

  async mergeSchemas() {
    const tjsPath = path.join(this.config.outputDir, 'generated-schemas-tjs.json');
    const tsjsgPath = path.join(this.config.outputDir, 'generated-schemas-tsjsg.json');

    let tjsSchemas = {};
    let tsjsgSchemas = {};

    if (fs.existsSync(tjsPath)) {
      tjsSchemas = JSON.parse(fs.readFileSync(tjsPath, 'utf8'));
    }

    if (fs.existsSync(tsjsgPath)) {
      tsjsgSchemas = JSON.parse(fs.readFileSync(tsjsgPath, 'utf8'));
    }

    // Merge schemas, preferring tjs for simple types, tsjsg for complex types
    const mergedDefinitions = {
      ...tjsSchemas.definitions,
      ...tsjsgSchemas.definitions
    };

    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: mergedDefinitions,
      generatedAt: new Date().toISOString(),
      tools: {
        'typescript-json-schema': !!tjsSchemas.definitions,
        'ts-json-schema-generator': !!tsjsgSchemas.definitions
      }
    };
  }

  async saveFinalSchemas(schemas) {
    const outputPath = path.join(this.config.outputDir, 'combined-schemas.json');
    fs.writeFileSync(outputPath, JSON.stringify(schemas, null, 2));
    
    console.log(`Final schemas saved to ${outputPath}`);
    console.log(`Generated schemas for ${Object.keys(schemas.definitions).length} types`);
  }

  async generateValidationReport(schemas) {
    const circularReport = this.circularResolver.generateCircularReferenceReport(schemas);
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalSchemas: Object.keys(schemas.definitions).length,
        circularReferences: circularReport.totalCycles,
        tools: schemas.tools
      },
      circularReferences: circularReport,
      schemaList: Object.keys(schemas.definitions).sort(),
      recommendations: [
        ...circularReport.recommendations,
        'Review generated schemas for accuracy',
        'Test schemas with runtime validation service'
      ]
    };

    const reportPath = path.join(this.config.outputDir, 'generation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('Validation report generated:', reportPath);
    
    if (circularReport.totalCycles > 0) {
      console.warn(`Warning: ${circularReport.totalCycles} circular references detected`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const pipeline = new SchemaGenerationPipeline();
  pipeline.run().catch(error => {
    console.error('Pipeline failed:', error);
    process.exit(1);
  });
}

module.exports = SchemaGenerationPipeline;
```

## Advanced Configuration

### Environment-Specific Schema Generation

Create `config/schema-generation.config.js`:

```javascript
module.exports = {
  development: {
    include: ['**/*'],
    exclude: ['**/*.test.ts'],
    enableDebugTypes: true,
    strict: false,
    outputFormat: 'verbose'
  },
  
  production: {
    include: ['core/**/*', 'api/**/*'],
    exclude: ['**/*.test.ts', '**/debug/**/*', '**/internal/**/*'],
    enableDebugTypes: false,
    strict: true,
    outputFormat: 'minified'
  },
  
  testing: {
    include: ['**/*'],
    exclude: [],
    enableDebugTypes: true,
    strict: true,
    outputFormat: 'testing'
  }
};
```

### Performance Optimization

```javascript
// scripts/optimizeSchemaGeneration.js
class SchemaGenerationOptimizer {
  constructor() {
    this.cache = new Map();
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      generationTime: 0
    };
  }

  async optimizedGeneration(sourceFiles) {
    const startTime = Date.now();
    
    // Check if source files have changed
    const sourceHash = this.calculateSourceHash(sourceFiles);
    const cacheKey = `schemas-${sourceHash}`;
    
    if (this.cache.has(cacheKey)) {
      this.stats.cacheHits++;
      console.log('Using cached schemas');
      return this.cache.get(cacheKey);
    }

    this.stats.cacheMisses++;
    
    // Generate schemas in parallel
    const [tjsSchemas, tsjsgSchemas] = await Promise.all([
      this.generateTjsSchemas(sourceFiles),
      this.generateTsjsgSchemas(sourceFiles)
    ]);

    const result = this.mergeSchemas(tjsSchemas, tsjsgSchemas);
    
    // Cache result
    this.cache.set(cacheKey, result);
    
    this.stats.generationTime = Date.now() - startTime;
    console.log(`Schema generation completed in ${this.stats.generationTime}ms`);
    
    return result;
  }

  calculateSourceHash(sourceFiles) {
    const crypto = require('crypto');
    const fs = require('fs');
    
    const hash = crypto.createHash('sha256');
    
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      hash.update(content);
    });
    
    return hash.digest('hex');
  }

  async generateTjsSchemas(sourceFiles) {
    // Implement optimized TJS generation
    return new Promise((resolve, reject) => {
      // Use worker threads for CPU-intensive operations
      const { Worker } = require('worker_threads');
      const worker = new Worker('./workers/tjsWorker.js', {
        workerData: { sourceFiles }
      });
      
      worker.on('message', resolve);
      worker.on('error', reject);
    });
  }

  getOptimizationReport() {
    const hitRate = this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses);
    
    return {
      cacheHitRate: hitRate,
      totalCacheHits: this.stats.cacheHits,
      totalCacheMisses: this.stats.cacheMisses,
      averageGenerationTime: this.stats.generationTime,
      recommendations: hitRate < 0.5 ? ['Consider increasing cache TTL', 'Review source file organization'] : []
    };
  }
}

module.exports = SchemaGenerationOptimizer;
```

This comprehensive schema generation configuration guide provides complete control over the TypeScript-to-JSON schema generation process, handling complex scenarios and optimizing for performance and accuracy.