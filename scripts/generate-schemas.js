#!/usr/bin/env node

/**
 * Generate JSON Schemas from TypeScript interfaces
 * 
 * This script generates JSON schemas from TypeScript types and interfaces
 * and publishes them to public/docs/schemas/ for deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TYPE_FILES = [
  'src/types/common.ts'
];

const OUTPUT_DIR = 'public/docs/schemas';
const SCHEMA_INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');

// Types to generate schemas for
const TYPES_TO_GENERATE = [
  'GitHubRepository',
  'GitHubBranch', 
  'GitHubUser',
  'DAKComponent',
  'SushiConfig',
  'AppContext',
  'RouteParams',
  'BaseComponentProps',
  'ApiResponse',
  'ThemeConfig'
];

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateSchemaWithTypescriptJsonSchema(typeFile, typeName, outputPath) {
  try {
    console.log(`Generating schema for ${typeName} using typescript-json-schema...`);
    
    const command = `npx typescript-json-schema ${typeFile} ${typeName} --required --ignoreErrors --out ${outputPath}`;
    execSync(command, { stdio: 'pipe' });
    
    if (fs.existsSync(outputPath)) {
      console.log(`✓ Generated ${outputPath}`);
      return true;
    }
  } catch (error) {
    console.warn(`⚠ typescript-json-schema failed for ${typeName}: ${error.message}`);
  }
  return false;
}

function generateSchemaWithTsJsonSchemaGenerator(typeFile, typeName, outputPath) {
  try {
    console.log(`Generating schema for ${typeName} using ts-json-schema-generator...`);
    
    const command = `npx ts-json-schema-generator --path ${typeFile} --type ${typeName} --out ${outputPath} --expose all --topRef false`;
    execSync(command, { stdio: 'pipe' });
    
    if (fs.existsSync(outputPath)) {
      console.log(`✓ Generated ${outputPath}`);
      return true;
    }
  } catch (error) {
    console.warn(`⚠ ts-json-schema-generator failed for ${typeName}: ${error.message}`);
  }
  return false;
}

function generateSchema(typeFile, typeName) {
  const outputPath = path.join(OUTPUT_DIR, `${typeName}.json`);
  
  // Try typescript-json-schema first, then fallback to ts-json-schema-generator
  if (generateSchemaWithTypescriptJsonSchema(typeFile, typeName, outputPath)) {
    return { typeName, file: `${typeName}.json`, generator: 'typescript-json-schema' };
  }
  
  if (generateSchemaWithTsJsonSchemaGenerator(typeFile, typeName, outputPath)) {
    return { typeName, file: `${typeName}.json`, generator: 'ts-json-schema-generator' };
  }
  
  console.error(`✗ Failed to generate schema for ${typeName}`);
  return null;
}

function generateSchemaIndex(generatedSchemas) {
  const index = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "SGEX TypeScript Schemas Index",
    description: "Generated JSON schemas from TypeScript interfaces for runtime validation",
    version: "1.0.0",
    generated: new Date().toISOString(),
    schemas: generatedSchemas.filter(Boolean).map(schema => ({
      name: schema.typeName,
      file: schema.file,
      url: `./schemas/${schema.file}`,
      generator: schema.generator,
      description: `JSON schema for ${schema.typeName} TypeScript interface`
    }))
  };
  
  fs.writeFileSync(SCHEMA_INDEX_FILE, JSON.stringify(index, null, 2));
  console.log(`✓ Generated schema index: ${SCHEMA_INDEX_FILE}`);
}

function main() {
  console.log('🔨 Generating JSON Schemas from TypeScript interfaces...\n');
  
  // Ensure output directory exists
  ensureDirectory(OUTPUT_DIR);
  
  // Generate schemas for each type
  const generatedSchemas = [];
  
  for (const typeFile of TYPE_FILES) {
    if (!fs.existsSync(typeFile)) {
      console.warn(`⚠ Type file not found: ${typeFile}`);
      continue;
    }
    
    console.log(`\n📂 Processing ${typeFile}...`);
    
    for (const typeName of TYPES_TO_GENERATE) {
      const result = generateSchema(typeFile, typeName);
      if (result) {
        generatedSchemas.push(result);
      }
    }
  }
  
  // Generate index file
  generateSchemaIndex(generatedSchemas);
  
  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`  Generated: ${generatedSchemas.length} schemas`);
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log(`  Index: ${SCHEMA_INDEX_FILE}`);
  
  if (generatedSchemas.length === 0) {
    console.error('❌ No schemas were generated successfully');
    process.exit(1);
  }
  
  console.log('\n✅ Schema generation completed successfully!');
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSchema,
  generateSchemaIndex,
  TYPES_TO_GENERATE,
  OUTPUT_DIR
};