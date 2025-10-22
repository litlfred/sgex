# Custom Format Documentation for SGEX Runtime Validation

## Overview

The SGEX Runtime Validation Service includes a comprehensive set of custom validation formats specifically designed for GitHub, FHIR, and DAK-specific data validation. This document provides a complete reference of available formats, how to add new ones, and testing patterns.

## Table of Contents

1. [Available Custom Formats](#available-custom-formats)
2. [Dynamic Format Discovery](#dynamic-format-discovery)
3. [Adding New Custom Formats](#adding-new-custom-formats)
4. [Testing Patterns](#testing-patterns)
5. [Format Validation Examples](#format-validation-examples)
6. [Advanced Format Features](#advanced-format-features)

## Available Custom Formats

### GitHub-Specific Formats

#### `github-username`

Validates GitHub usernames according to GitHub's naming rules.

**Rules:**
- Must start and end with alphanumeric characters
- Can contain hyphens in the middle
- Maximum length of 39 characters
- Minimum length of 1 character

**Pattern:** `/^[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]$`

**Valid Examples:**
```json
["octocat", "github-user", "user123", "my-awesome-repo"]
```

**Invalid Examples:**
```json
["-invalid", "invalid-", "toolong123456789012345678901234567890", ""]
```

#### `github-repo-name`

Validates GitHub repository names.

**Rules:**
- Can contain letters, numbers, dots, underscores, and hyphens
- Maximum length of 100 characters
- Cannot be empty

**Pattern:** `/^[a-zA-Z0-9._-]+$`

**Valid Examples:**
```json
["my-repo", "awesome.project", "repo_name", "test123"]
```

**Invalid Examples:**
```json
["repo with spaces", "repo@invalid", ""]
```

#### `github-token`

Validates GitHub Personal Access Token formats.

**Rules:**
- Classic tokens: 40-character hexadecimal strings
- Fine-grained tokens: Start with `ghp_`, `gho_`, `ghu_`, or `ghs_` followed by 36+ characters

**Pattern:** `/^(gh[pousr]_[a-zA-Z0-9]{36,}|[a-fA-F0-9]{40})$`

**Valid Examples:**
```json
[
  "ghp_1234567890abcdef1234567890abcdef123456",
  "abc123def456789012345678901234567890abcd",
  "gho_1234567890abcdef1234567890abcdef123456"
]
```

### FHIR-Specific Formats

#### `fhir-id`

Validates FHIR resource identifiers according to FHIR R4 specification.

**Rules:**
- Contains only letters, numbers, hyphens, and dots
- Length between 1 and 64 characters
- Used for FHIR resource IDs

**Pattern:** `/^[A-Za-z0-9\-\.]{1,64}$`

**Valid Examples:**
```json
["patient-123", "observation.vital-signs", "encounter-001"]
```

**Invalid Examples:**
```json
["patient_123", "observation@invalid", ""]
```

#### `fhir-canonical`

Validates FHIR canonical URLs.

**Rules:**
- Must be a valid URI
- Often used for profiles, value sets, and implementation guides
- Can include version information with `|` separator

**Pattern:** Custom function validating URI format with optional version

**Valid Examples:**
```json
[
  "http://hl7.org/fhir/StructureDefinition/Patient",
  "https://smart.who.int/base/StructureDefinition/SGProfile|1.0.0"
]
```

### DAK-Specific Formats

#### `dak-id`

Validates Digital Adaptation Kit identifiers following WHO SMART Guidelines naming conventions.

**Rules:**
- Lowercase letters and dots only
- Must end with `.dak`
- Follows reverse domain notation pattern

**Pattern:** `/^[a-z]+(\.[a-z]+)*\.dak$/`

**Valid Examples:**
```json
["who.smart.base.dak", "immunization.routine.dak", "anc.basic.dak"]
```

**Invalid Examples:**
```json
["WHO.smart.base.dak", "immunization_routine.dak", "anc.basic"]
```

#### `sushi-config-id`

Validates SUSHI configuration IDs for FHIR Implementation Guides.

**Rules:**
- Follows FHIR IG naming conventions
- Uses dots as separators
- Lowercase preferred but not required

**Pattern:** `/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/`

**Valid Examples:**
```json
["who.smart.base", "hl7.fhir.us.core", "ihe.pcc.qedm"]
```

### Extended Formats

#### `version-string`

Validates semantic version strings.

**Rules:**
- Follows semantic versioning (semver) specification
- Format: MAJOR.MINOR.PATCH with optional pre-release and build metadata

**Pattern:** `/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/`

**Valid Examples:**
```json
["1.0.0", "2.1.0-beta.1", "1.2.3+build.123"]
```

#### `iso-date`

Validates ISO 8601 date strings.

**Rules:**
- Full ISO 8601 date format
- Supports timezone information

**Pattern:** Custom function using Date parsing

**Valid Examples:**
```json
["2023-12-07", "2023-12-07T15:30:00Z", "2023-12-07T15:30:00+05:00"]
```

## Dynamic Format Discovery

### Automatic Format Registration

The Runtime Validation Service automatically discovers and registers all available custom formats:

```typescript
// src/services/formatDiscovery.ts
export class FormatDiscoveryService {
  static getAvailableFormats(): CustomFormatDefinition[] {
    return [
      {
        name: 'github-username',
        description: 'GitHub username validation',
        pattern: '^[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]$',
        maxLength: 39,
        examples: ['octocat', 'github-user', 'user123'],
        invalidExamples: ['-invalid', 'invalid-', '']
      },
      {
        name: 'github-repo-name',
        description: 'GitHub repository name validation',
        pattern: '^[a-zA-Z0-9._-]+$',
        maxLength: 100,
        examples: ['my-repo', 'awesome.project', 'repo_name'],
        invalidExamples: ['repo with spaces', 'repo@invalid']
      },
      // ... more formats
    ];
  }

  static generateFormatDocumentation(): string {
    const formats = this.getAvailableFormats();
    
    return formats.map(format => {
      return `
### ${format.name}

**Description:** ${format.description}
**Pattern:** \`${format.pattern}\`
**Max Length:** ${format.maxLength || 'No limit'}

**Valid Examples:**
\`\`\`json
${JSON.stringify(format.examples, null, 2)}
\`\`\`

**Invalid Examples:**
\`\`\`json
${JSON.stringify(format.invalidExamples, null, 2)}
\`\`\`
      `.trim();
    }).join('\n\n');
  }
}
```

### Build-Time Format Documentation Generation

Create a script to automatically generate format documentation:

```typescript
// scripts/generateFormatDocs.ts
import { FormatDiscoveryService } from '../src/services/formatDiscovery';
import { writeFileSync } from 'fs';
import { join } from 'path';

function generateFormatDocumentation() {
  const documentation = FormatDiscoveryService.generateFormatDocumentation();
  
  const fullDoc = `
# Auto-Generated Custom Format Reference

This documentation is automatically generated from the custom format definitions in the Runtime Validation Service.

**Generated on:** ${new Date().toISOString()}

## Available Formats

${documentation}

## Usage in JSON Schema

\`\`\`json
{
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "format": "github-username"
    },
    "repository": {
      "type": "string", 
      "format": "github-repo-name"
    }
  }
}
\`\`\`
  `.trim();

  writeFileSync(
    join(__dirname, '../public/docs/generated-custom-formats.md'),
    fullDoc
  );

  console.log('Custom format documentation generated successfully!');
}

generateFormatDocumentation();
```

### Runtime Format Discovery API

```typescript
// src/services/runtimeFormatDiscovery.ts
import { runtimeValidator } from './runtimeValidationService';

export class RuntimeFormatDiscovery {
  static getRegisteredFormats(): string[] {
    // Access AJV instance to get registered formats
    const ajvInstance = (runtimeValidator as any).ajv;
    return Object.keys(ajvInstance.formats);
  }

  static validateFormatExists(formatName: string): boolean {
    return this.getRegisteredFormats().includes(formatName);
  }

  static getFormatValidator(formatName: string): Function | null {
    const ajvInstance = (runtimeValidator as any).ajv;
    return ajvInstance.formats[formatName]?.validate || null;
  }

  static testFormat(formatName: string, testValue: string): boolean {
    const validator = this.getFormatValidator(formatName);
    if (!validator) {
      throw new Error(`Format '${formatName}' not found`);
    }
    
    return validator(testValue);
  }

  // Development helper to test all formats with sample data
  static runFormatTests(): Record<string, any> {
    const results = {};
    const formats = this.getRegisteredFormats();

    for (const formatName of formats) {
      if (formatName.startsWith('github-') || formatName.startsWith('fhir-') || formatName.startsWith('dak-')) {
        const testData = this.getTestDataForFormat(formatName);
        results[formatName] = {
          valid: testData.valid.map(value => ({
            value,
            result: this.testFormat(formatName, value)
          })),
          invalid: testData.invalid.map(value => ({
            value,
            result: this.testFormat(formatName, value)
          }))
        };
      }
    }

    return results;
  }

  private static getTestDataForFormat(formatName: string): { valid: string[], invalid: string[] } {
    const testData = {
      'github-username': {
        valid: ['octocat', 'github-user', 'user123', 'a'],
        invalid: ['-invalid', 'invalid-', '', 'toolong123456789012345678901234567890']
      },
      'github-repo-name': {
        valid: ['my-repo', 'awesome.project', 'repo_name', 'test123'],
        invalid: ['repo with spaces', 'repo@invalid', '']
      },
      'github-token': {
        valid: ['ghp_1234567890abcdef1234567890abcdef123456', 'abc123def456789012345678901234567890abcd'],
        invalid: ['invalid-token', 'ghp_short', '']
      },
      'fhir-id': {
        valid: ['patient-123', 'observation.vital-signs', 'encounter-001', 'a'],
        invalid: ['patient_123', 'observation@invalid', '', 'a'.repeat(65)]
      },
      'dak-id': {
        valid: ['who.smart.base.dak', 'immunization.routine.dak'],
        invalid: ['WHO.smart.base.dak', 'immunization_routine.dak', 'anc.basic']
      }
    };

    return testData[formatName] || { valid: [], invalid: [] };
  }
}
```

## Adding New Custom Formats

### Step 1: Define the Format

```typescript
// src/services/customFormats.ts
export interface CustomFormatDefinition {
  name: string;
  description: string;
  validator: (value: string) => boolean;
  examples?: string[];
  invalidExamples?: string[];
  documentation?: string;
}

export const CUSTOM_FORMATS: CustomFormatDefinition[] = [
  {
    name: 'who-publication-id',
    description: 'WHO publication identifier format',
    validator: (value: string) => {
      // WHO publications follow specific ID patterns
      return /^WHO-[A-Z]{2,}-\d{4}-\d+$/.test(value);
    },
    examples: ['WHO-MCA-2023-001', 'WHO-HTM-2023-015'],
    invalidExamples: ['who-mca-2023-001', 'WHO-MCA-23-1', 'INVALID'],
    documentation: `
WHO publication IDs follow the pattern: WHO-[DEPARTMENT]-[YEAR]-[NUMBER]
- DEPARTMENT: 2-4 uppercase letters
- YEAR: 4-digit year
- NUMBER: Sequential number
    `.trim()
  }
];
```

### Step 2: Register the Format

```typescript
// src/services/runtimeValidationService.ts
private addCustomFormats(): void {
  // ... existing formats ...

  // Add new WHO publication ID format
  this.ajv.addFormat('who-publication-id', {
    type: 'string',
    validate: (value: string) => {
      return /^WHO-[A-Z]{2,}-\d{4}-\d+$/.test(value);
    }
  });

  // Or use the custom formats registry
  CUSTOM_FORMATS.forEach(format => {
    this.ajv.addFormat(format.name, {
      type: 'string',
      validate: format.validator
    });
  });
}
```

### Step 3: Add Format Tests

```typescript
// src/services/__tests__/customFormats.test.ts
import { RuntimeFormatDiscovery } from '../runtimeFormatDiscovery';

describe('Custom Formats', () => {
  describe('who-publication-id', () => {
    test('should validate correct WHO publication IDs', () => {
      const validIds = ['WHO-MCA-2023-001', 'WHO-HTM-2023-015', 'WHO-DEPT-2024-999'];
      
      validIds.forEach(id => {
        expect(RuntimeFormatDiscovery.testFormat('who-publication-id', id)).toBe(true);
      });
    });

    test('should reject invalid WHO publication IDs', () => {
      const invalidIds = ['who-mca-2023-001', 'WHO-MCA-23-1', 'INVALID', ''];
      
      invalidIds.forEach(id => {
        expect(RuntimeFormatDiscovery.testFormat('who-publication-id', id)).toBe(false);
      });
    });
  });
});
```

### Step 4: Document the Format

```typescript
// src/services/formatDocumentationGenerator.ts
export class FormatDocumentationGenerator {
  static generateFormatReference(formatName: string): string {
    const format = CUSTOM_FORMATS.find(f => f.name === formatName);
    if (!format) {
      throw new Error(`Format '${formatName}' not found`);
    }

    return `
## ${format.name}

${format.description}

${format.documentation || ''}

### Examples

**Valid:**
${format.examples?.map(ex => `- \`${ex}\``).join('\n') || 'No examples provided'}

**Invalid:**
${format.invalidExamples?.map(ex => `- \`${ex}\``).join('\n') || 'No examples provided'}

### Usage in Schema

\`\`\`json
{
  "type": "string",
  "format": "${format.name}"
}
\`\`\`
    `.trim();
  }
}
```

## Testing Patterns

### Unit Testing Custom Formats

```typescript
// src/services/__tests__/formatValidation.test.ts
import { runtimeValidator } from '../runtimeValidationService';

describe('Format Validation', () => {
  beforeEach(() => {
    // Ensure clean state
    runtimeValidator.clearSchemas();
  });

  describe('GitHub Formats', () => {
    test('github-username format validation', () => {
      const schema = {
        type: 'object',
        properties: {
          username: { type: 'string', format: 'github-username' }
        }
      };

      runtimeValidator.registerSchema('TestUser', schema);

      // Valid usernames
      const validUsernames = ['octocat', 'github-user', 'user123'];
      validUsernames.forEach(username => {
        const result = runtimeValidator.validate('TestUser', { username });
        expect(result.isValid).toBe(true);
      });

      // Invalid usernames
      const invalidUsernames = ['-invalid', 'invalid-', ''];
      invalidUsernames.forEach(username => {
        const result = runtimeValidator.validate('TestUser', { username });
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('FHIR Formats', () => {
    test('fhir-id format validation', () => {
      const schema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'fhir-id' }
        }
      };

      runtimeValidator.registerSchema('FHIRResource', schema);

      // Test valid FHIR IDs
      const validIds = ['patient-123', 'observation.vital-signs'];
      validIds.forEach(id => {
        const result = runtimeValidator.validate('FHIRResource', { id });
        expect(result.isValid).toBe(true);
      });

      // Test invalid FHIR IDs
      const invalidIds = ['patient_123', 'observation@invalid'];
      invalidIds.forEach(id => {
        const result = runtimeValidator.validate('FHIRResource', { id });
        expect(result.isValid).toBe(false);
      });
    });
  });
});
```

### Integration Testing with Real Data

```typescript
// src/services/__tests__/formatIntegration.test.ts
import { GitHubService } from '../githubService';
import { runtimeValidator } from '../runtimeValidationService';

describe('Format Integration Tests', () => {
  let githubService: GitHubService;

  beforeEach(() => {
    githubService = new GitHubService();
  });

  test('should validate real GitHub user data', async () => {
    // Mock real GitHub API response
    const mockUserData = {
      login: 'octocat',
      id: 1,
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      name: 'The Octocat'
    };

    const userSchema = {
      type: 'object',
      properties: {
        login: { type: 'string', format: 'github-username' },
        id: { type: 'number' },
        avatar_url: { type: 'string', format: 'uri' },
        name: { type: 'string' }
      },
      required: ['login', 'id']
    };

    runtimeValidator.registerSchema('GitHubUser', userSchema);
    const result = runtimeValidator.validate('GitHubUser', mockUserData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should validate DAK repository data', async () => {
    const mockDakRepo = {
      name: 'smart-immunizations',
      owner: { login: 'WorldHealthOrganization' },
      sushiConfig: {
        id: 'smart.who.int.immunizations',
        dependencies: {
          'smart.who.int.base': '1.0.0'
        }
      }
    };

    const dakSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', format: 'github-repo-name' },
        owner: {
          type: 'object',
          properties: {
            login: { type: 'string', format: 'github-username' }
          }
        },
        sushiConfig: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'sushi-config-id' }
          }
        }
      }
    };

    runtimeValidator.registerSchema('DAKRepository', dakSchema);
    const result = runtimeValidator.validate('DAKRepository', mockDakRepo);

    expect(result.isValid).toBe(true);
  });
});
```

### Performance Testing for Formats

```typescript
// src/services/__tests__/formatPerformance.test.ts
describe('Format Performance Tests', () => {
  test('should validate large batches efficiently', async () => {
    const schema = {
      type: 'object',
      properties: {
        username: { type: 'string', format: 'github-username' }
      }
    };

    runtimeValidator.registerSchema('PerformanceTest', schema);

    // Generate large dataset
    const testData = Array.from({ length: 10000 }, (_, i) => ({
      username: `user${i}`
    }));

    const startTime = performance.now();
    const results = runtimeValidator.validateBatch('PerformanceTest', testData);
    const endTime = performance.now();

    const validCount = results.filter(r => r.isValid).length;
    const duration = endTime - startTime;

    expect(validCount).toBe(10000);
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    
    console.log(`Validated ${testData.length} items in ${duration.toFixed(2)}ms`);
  });
});
```

## Format Validation Examples

### Using Formats in JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "githubUser": {
      "type": "object",
      "properties": {
        "login": {
          "type": "string",
          "format": "github-username",
          "description": "GitHub username"
        },
        "repositories": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "format": "github-repo-name"
              }
            }
          }
        }
      }
    },
    "dakInfo": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "dak-id",
          "description": "Digital Adaptation Kit identifier"
        },
        "fhirResources": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "format": "fhir-id"
              }
            }
          }
        }
      }
    }
  }
}
```

### TypeScript Usage

```typescript
// Define types with format documentation
interface GitHubUserData {
  /** @format github-username */
  login: string;
  
  /** @format uri */
  avatar_url: string;
  
  /** @format github-token */
  token?: string;
}

interface DAKConfiguration {
  /** @format dak-id */
  id: string;
  
  /** @format version-string */
  version: string;
  
  dependencies: {
    /** @format sushi-config-id */
    [key: string]: string;
  };
}

// Use in validation
function processGitHubUser(userData: unknown): GitHubUserData {
  return validateAndCast<GitHubUserData>('GitHubUser', userData);
}
```

## Advanced Format Features

### Conditional Format Validation

```typescript
// src/services/conditionalFormats.ts
export class ConditionalFormatValidator {
  static createConditionalSchema(baseSchema: any, conditions: any) {
    return {
      ...baseSchema,
      allOf: [
        baseSchema,
        {
          if: conditions.if,
          then: conditions.then,
          else: conditions.else
        }
      ]
    };
  }
}

// Example: Different validation rules based on repository type
const repositorySchema = ConditionalFormatValidator.createConditionalSchema(
  {
    type: 'object',
    properties: {
      name: { type: 'string', format: 'github-repo-name' },
      type: { type: 'string', enum: ['dak', 'regular'] }
    }
  },
  {
    if: { properties: { type: { const: 'dak' } } },
    then: {
      properties: {
        name: { 
          type: 'string', 
          format: 'github-repo-name',
          pattern: '.*-dak$'  // DAK repos should end with '-dak'
        }
      }
    },
    else: {
      properties: {
        name: { type: 'string', format: 'github-repo-name' }
      }
    }
  }
);
```

### Format Composition

```typescript
// src/services/formatComposition.ts
export class FormatComposer {
  static combineFormats(formats: string[]): (value: string) => boolean {
    return (value: string) => {
      return formats.every(formatName => {
        return RuntimeFormatDiscovery.testFormat(formatName, value);
      });
    };
  }

  static createUnionFormat(formats: string[]): (value: string) => boolean {
    return (value: string) => {
      return formats.some(formatName => {
        return RuntimeFormatDiscovery.testFormat(formatName, value);
      });
    };
  }
}

// Register composite formats
runtimeValidator.ajv.addFormat('github-identifier', FormatComposer.createUnionFormat([
  'github-username',
  'github-repo-name'
]));
```

This comprehensive custom format documentation provides complete coverage of available formats, dynamic discovery capabilities, and extensibility patterns for the SGEX Runtime Validation Service.