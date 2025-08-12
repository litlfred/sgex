#!/usr/bin/env node

/**
 * Schema Generation Script
 * 
 * Generates JSON schemas from TypeScript type definitions
 * Supports both typescript-json-schema and ts-json-schema-generator
 */

const fs = require('fs');
const path = require('path');

// Type definitions to generate schemas for
const coreTypes = [
  'GitHubUser',
  'GitHubRepository', 
  'DAKValidationResult',
  'ValidationContext',
  'FormattedValidationResults',
  'ValidationSummary',
  'DAKFile',
  'SushiConfig',
  'DAKRepository'
];

const outputDir = path.join(__dirname, '../public/schemas');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Generate schemas using typescript-json-schema
 */
async function generateSchemasWithTJS() {
  try {
    const TJS = require('typescript-json-schema');
    
    // Configuration for schema generation
    const settings = {
      required: true,
      ignoreErrors: true,
      excludePrivate: true,
      topRef: false,
      titles: true,
      defaultProps: true,
      noExtraProps: false,
      propOrder: false,
      ref: true,
      aliasRef: true,
      strictNullChecks: true
    };

    const compilerOptions = {
      strictNullChecks: true,
      esModuleInterop: true,
      skipLibCheck: true
    };

    // Create program from TypeScript files
    const program = TJS.getProgramFromFiles(
      [path.resolve(__dirname, '../src/types/core.ts')],
      compilerOptions
    );

    // Generate schema for each type
    for (const typeName of coreTypes) {
      try {
        const schema = TJS.generateSchema(program, typeName, settings);
        
        if (schema) {
          const outputPath = path.join(outputDir, `${typeName}.json`);
          fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
          console.log(`✓ Generated schema for ${typeName}`);
        } else {
          console.warn(`⚠ Could not generate schema for ${typeName}`);
        }
      } catch (error) {
        console.error(`✗ Failed to generate schema for ${typeName}:`, error.message);
      }
    }

    console.log(`\nGenerated ${coreTypes.length} schemas in ${outputDir}`);
    
  } catch (error) {
    console.error('Schema generation failed:', error.message);
    
    // Fallback: create minimal schemas
    console.log('Creating fallback schemas...');
    createFallbackSchemas();
  }
}

/**
 * Create minimal fallback schemas if generation fails
 */
function createFallbackSchemas() {
  const fallbackSchemas = {
    GitHubUser: {
      type: 'object',
      required: ['login', 'id'],
      properties: {
        login: { type: 'string' },
        id: { type: 'number' },
        avatar_url: { type: 'string' },
        html_url: { type: 'string' }
      }
    },
    
    DAKValidationResult: {
      type: 'object', 
      required: ['validationId', 'component', 'level', 'description', 'filePath'],
      properties: {
        validationId: { type: 'string' },
        component: { type: 'string' },
        level: { type: 'string', enum: ['error', 'warning', 'info'] },
        description: { type: 'string' },
        filePath: { type: 'string' },
        message: { type: 'string' },
        line: { type: 'number' },
        column: { type: 'number' },
        suggestion: { type: 'string' }
      }
    },

    FormattedValidationResults: {
      type: 'object',
      required: ['summary', 'byComponent', 'byFile', 'canSave', 'total'],
      properties: {
        summary: {
          type: 'object',
          properties: {
            error: { type: 'number' },
            warning: { type: 'number' },
            info: { type: 'number' }
          }
        },
        byComponent: { type: 'object' },
        byFile: { type: 'object' },
        canSave: { type: 'boolean' },
        total: { type: 'number' },
        error: { type: 'string' }
      }
    }
  };

  for (const [typeName, schema] of Object.entries(fallbackSchemas)) {
    const outputPath = path.join(outputDir, `${typeName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    console.log(`✓ Created fallback schema for ${typeName}`);
  }
}

/**
 * Generate index file for all schemas
 */
function generateSchemaIndex() {
  const indexPath = path.join(outputDir, 'index.json');
  const schemaFiles = fs.readdirSync(outputDir)
    .filter(file => file.endsWith('.json') && file !== 'index.json')
    .map(file => file.replace('.json', ''));

  const index = {
    schemas: schemaFiles,
    generated: new Date().toISOString(),
    types: coreTypes
  };

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`✓ Generated schema index with ${schemaFiles.length} schemas`);
}

// Main execution
if (require.main === module) {
  console.log('Generating TypeScript schemas...\n');
  
  generateSchemasWithTJS()
    .then(() => {
      generateSchemaIndex();
      console.log('\n✅ Schema generation completed successfully!');
    })
    .catch(error => {
      console.error('\n❌ Schema generation failed:', error);
      process.exit(1);
    });
}

module.exports = {
  generateSchemasWithTJS,
  createFallbackSchemas,
  generateSchemaIndex,
  coreTypes,
  outputDir
};