#!/usr/bin/env node

/**
 * Audit Canonical References in FAQ Question Schemas
 * 
 * This tool analyzes all FAQ question schemas to identify:
 * - Questions with canonical URL references
 * - Questions that should reference canonicals but don't
 * - Suggestions for adding canonical references
 */

import { FAQSchemaService } from '../server/util/FAQSchemaService.js';
import { CanonicalSchemaService } from '../server/util/CanonicalSchemaService.js';

const COMPONENT_TYPE_CANDIDATES = [
  'componentType',
  'assetType',
  'type',
  'category',
  'status'
];

async function main() {
  console.log('🔍 Auditing FAQ Question Schemas for Canonical References\n');
  console.log('═'.repeat(70));
  
  const schemaService = FAQSchemaService.getInstance();
  const canonicalService = CanonicalSchemaService.getInstance();
  
  // Initialize services
  await schemaService.initialize();
  await canonicalService.initialize();
  
  // Run audit
  const audit = await schemaService.auditCanonicalReferences();
  
  // Display summary
  console.log('\n📊 Summary');
  console.log('─'.repeat(70));
  console.log(`Total questions: ${audit.questionsWithCanonicals.length + audit.questionsWithoutCanonicals.length}`);
  console.log(`Questions with canonical references: ${audit.questionsWithCanonicals.length}`);
  console.log(`Questions without canonical references: ${audit.questionsWithoutCanonicals.length}`);
  console.log(`Total canonical URLs referenced: ${audit.totalCanonicals}`);
  
  // Display questions with canonicals
  if (audit.questionsWithCanonicals.length > 0) {
    console.log('\n✅ Questions with Canonical References');
    console.log('─'.repeat(70));
    
    for (const questionId of audit.questionsWithCanonicals) {
      const canonicals = audit.canonicalsByQuestion[questionId];
      console.log(`\n📋 ${questionId}`);
      for (const url of canonicals) {
        console.log(`   └─ ${url}`);
      }
    }
  }
  
  // Display questions without canonicals
  if (audit.questionsWithoutCanonicals.length > 0) {
    console.log('\n⚠️  Questions without Canonical References');
    console.log('─'.repeat(70));
    
    for (const questionId of audit.questionsWithoutCanonicals) {
      const question = await schemaService.getQuestion(questionId);
      if (!question) continue;
      
      console.log(`\n📋 ${questionId}`);
      console.log(`   Level: ${question.level}`);
      if (question.componentType) {
        console.log(`   Component Type: ${question.componentType}`);
      }
      
      // Analyze schema for potential canonical candidates
      const schema = await schemaService.getQuestionSchema(questionId);
      if (schema) {
        const suggestions = analyzeSchemaCandidates(schema);
        if (suggestions.length > 0) {
          console.log('   💡 Suggestions:');
          for (const suggestion of suggestions) {
            console.log(`      - ${suggestion}`);
          }
        }
      }
    }
  }
  
  // Display cached canonical resources
  const cachedResources = canonicalService.getCachedResources();
  if (cachedResources.length > 0) {
    console.log('\n📦 Cached Canonical Resources');
    console.log('─'.repeat(70));
    for (const resource of cachedResources) {
      console.log(`${resource.type}: ${resource.url}`);
      if (resource.lastFetched) {
        console.log(`   Last fetched: ${new Date(resource.lastFetched).toISOString()}`);
      }
    }
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('Audit complete! 🎉\n');
}

/**
 * Analyze schema for potential canonical candidates
 */
function analyzeSchemaCandidates(schema: any): string[] {
  const suggestions: string[] = [];
  
  const analyzeObject = (obj: any, path: string = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    // Check properties
    if (obj.properties) {
      for (const [key, value] of Object.entries(obj.properties)) {
        const propPath = path ? `${path}.${key}` : key;
        const propSchema = value as any;
        
        // Check if property looks like it should have a canonical reference
        if (COMPONENT_TYPE_CANDIDATES.includes(key)) {
          if (propSchema.enum && !propSchema['x-canonical-url']) {
            suggestions.push(
              `Property '${propPath}' has enum values but no canonical URL reference. Consider adding x-canonical-url.`
            );
          }
        }
        
        // Check for string types with enums
        if (propSchema.type === 'string' && propSchema.enum && !propSchema['x-canonical-url']) {
          if (propSchema.enum.length > 3) {
            suggestions.push(
              `Property '${propPath}' has ${propSchema.enum.length} enum values. Consider referencing a WHO ValueSet via x-canonical-url.`
            );
          }
        }
        
        // Recursively check nested objects
        if (propSchema.properties) {
          analyzeObject(propSchema, propPath);
        }
        
        if (propSchema.items) {
          analyzeObject(propSchema.items, `${propPath}[]`);
        }
      }
    }
    
    // Check items (for arrays)
    if (obj.items) {
      analyzeObject(obj.items, `${path}[]`);
    }
  };
  
  if (schema.input) {
    analyzeObject(schema.input, 'input');
  }
  
  if (schema.output) {
    analyzeObject(schema.output, 'output');
  }
  
  return suggestions;
}

// Run the audit
main().catch((error) => {
  console.error('Error running audit:', error);
  process.exit(1);
});
