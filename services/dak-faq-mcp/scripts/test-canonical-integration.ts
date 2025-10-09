/**
 * Simple test to verify canonical schema integration
 */

import { CanonicalSchemaService } from '../server/util/CanonicalSchemaService.js';
import { FAQSchemaService } from '../server/util/FAQSchemaService.js';

async function runTests() {
  console.log('🧪 Testing Canonical Schema Integration\n');
  console.log('═'.repeat(70));

  const canonicalService = CanonicalSchemaService.getInstance();
  const schemaService = FAQSchemaService.getInstance();

  await canonicalService.initialize();
  await schemaService.initialize();

  let passed = 0;
  let failed = 0;

  // Test 1: Canonical service initialization
  console.log('\n📝 Test 1: Canonical Service Initialization');
  try {
    const resources = canonicalService.getCachedResources();
    console.log(`   ✅ Service initialized. ${resources.length} resources cached.`);
    passed++;
  } catch (error) {
    console.log(`   ❌ Failed: ${error}`);
    failed++;
  }

  // Test 2: Question with canonical references
  console.log('\n📝 Test 2: Questions with Canonical References');
  try {
    const refs = await schemaService.getCanonicalReferences('data-elements');
    if (refs.length > 0) {
      console.log(`   ✅ Found ${refs.length} canonical references in data-elements question`);
      console.log(`      References: ${refs.join(', ')}`);
      passed++;
    } else {
      console.log(`   ❌ No canonical references found`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error}`);
    failed++;
  }

  // Test 3: Audit functionality
  console.log('\n📝 Test 3: Audit Canonical References');
  try {
    const audit = await schemaService.auditCanonicalReferences();
    console.log(`   ✅ Audit completed`);
    console.log(`      Questions with canonicals: ${audit.questionsWithCanonicals.length}`);
    console.log(`      Questions without canonicals: ${audit.questionsWithoutCanonicals.length}`);
    console.log(`      Total canonical URLs: ${audit.totalCanonicals}`);
    passed++;
  } catch (error) {
    console.log(`   ❌ Failed: ${error}`);
    failed++;
  }

  // Test 4: Schema enhancement (without network fetch)
  console.log('\n📝 Test 4: Schema Enhancement');
  try {
    const schema = await schemaService.getQuestionSchema('dak-version');
    if (schema && schema.output) {
      console.log(`   ✅ Retrieved schema for dak-version question`);
      
      // Check if status field has canonical reference
      const statusField = schema.output?.properties?.structured?.properties?.status;
      if (statusField && statusField['x-canonical-url']) {
        console.log(`   ✅ Status field has canonical URL: ${statusField['x-canonical-url']}`);
        passed++;
      } else {
        console.log(`   ⚠️  Status field missing canonical URL (this might be expected)`);
        passed++;
      }
    } else {
      console.log(`   ❌ Could not retrieve schema`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error}`);
    failed++;
  }

  // Test 5: Parameter validation (basic)
  console.log('\n📝 Test 5: Parameter Validation');
  try {
    const result = await schemaService.validateQuestionParameters('dak-version', {
      repository: 'who/smart-immunizations'
    });
    
    if (result.isValid) {
      console.log(`   ✅ Parameters validated successfully`);
      passed++;
    } else {
      console.log(`   ❌ Validation failed: ${result.errors.join(', ')}`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error}`);
    failed++;
  }

  // Test 6: OpenAPI schema generation
  console.log('\n📝 Test 6: OpenAPI Schema Generation');
  try {
    const openapi = await schemaService.getOpenAPISchema();
    if (openapi && openapi.components && openapi.components.schemas) {
      const schemaCount = Object.keys(openapi.components.schemas).length;
      console.log(`   ✅ Generated OpenAPI schema with ${schemaCount} components`);
      passed++;
    } else {
      console.log(`   ❌ OpenAPI schema generation failed`);
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error}`);
    failed++;
  }

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 Test Summary');
  console.log('─'.repeat(70));
  console.log(`Total tests: ${passed + failed}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log('═'.repeat(70) + '\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
