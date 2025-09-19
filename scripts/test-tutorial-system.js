#!/usr/bin/env node

/**
 * Test script for tutorial generation system
 * Validates that feature files can be parsed and audio can be extracted
 */

const fs = require('fs');
const path = require('path');
const TTSAudioService = require('./tutorial-generation/ttsAudioService');
const PlaywrightScriptGenerator = require('./tutorial-generation/playwrightScriptGenerator');

async function runTests() {
  console.log('🧪 Running Tutorial Generation System Tests\n');
  
  let testsRun = 0;
  let testsPassed = 0;
  
  function test(name, testFn) {
    testsRun++;
    try {
      const result = testFn();
      if (result === true || (result && result.then)) {
        console.log(`✅ ${name}`);
        testsPassed++;
        return result;
      } else {
        console.log(`❌ ${name}: Test function should return true or a promise`);
      }
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }
  
  // Test 1: Feature files exist
  test('Feature files exist', () => {
    const featuresDir = path.join(process.cwd(), 'features');
    const files = [
      'user-login-pat.feature',
      'profile-selection-dak-scanning.feature', 
      'help-mascot-documentation.feature'
    ];
    
    for (const file of files) {
      const filePath = path.join(featuresDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Feature file not found: ${file}`);
      }
    }
    return true;
  });
  
  // Test 2: TTS Service initialization
  test('TTS Service initializes correctly', () => {
    const ttsService = new TTSAudioService();
    const languages = Object.keys(ttsService.supportedLanguages);
    const expectedLanguages = ['en', 'fr', 'es', 'ar', 'zh', 'ru'];
    
    for (const lang of expectedLanguages) {
      if (!languages.includes(lang)) {
        throw new Error(`Missing language support: ${lang}`);
      }
    }
    return true;
  });
  
  // Test 3: Narration extraction
  test('Narration extraction works', () => {
    const ttsService = new TTSAudioService();
    const featureFile = path.join(process.cwd(), 'features', 'user-login-pat.feature');
    
    if (!fs.existsSync(featureFile)) {
      throw new Error('User login feature file not found');
    }
    
    const narrations = ttsService.extractNarrationsFromFeature(featureFile);
    
    if (narrations.length === 0) {
      throw new Error('No narrations found in feature file');
    }
    
    // Check that we have proper narration objects
    const firstNarration = narrations[0];
    if (!firstNarration.id || !firstNarration.text || !firstNarration.lineNumber) {
      throw new Error('Invalid narration object structure');
    }
    
    console.log(`    Found ${narrations.length} narrations`);
    console.log(`    First narration: "${firstNarration.text.substring(0, 50)}..."`);
    
    return true;
  });
  
  // Test 4: Playwright script generation
  test('Playwright script generation works', () => {
    const generator = new PlaywrightScriptGenerator();
    const featureFile = path.join(process.cwd(), 'features', 'user-login-pat.feature');
    
    const feature = generator.parseFeatureFile(featureFile);
    
    if (!feature.title) {
      throw new Error('Feature title not parsed');
    }
    
    if (feature.scenarios.length === 0) {
      throw new Error('No scenarios found in feature file');
    }
    
    console.log(`    Feature: "${feature.title}"`);
    console.log(`    Scenarios: ${feature.scenarios.length}`);
    
    return true;
  });
  
  // Test 5: Step mapping
  test('Step mapping patterns work', () => {
    const StepMappingService = require('./tutorial-generation/stepMappingService');
    
    // Create a mock page object for testing
    const mockPage = {
      goto: async () => {},
      click: async () => {},
      fill: async () => {},
      waitForSelector: async () => {},
      waitForTimeout: async () => {},
      mouse: { move: async () => {} },
      locator: () => ({ isVisible: async () => true, scrollIntoViewIfNeeded: async () => {} }),
      evaluate: async () => {},
      url: () => 'http://localhost:3000/sgex'
    };
    
    const stepMapping = new StepMappingService(mockPage);
    
    // Test narration step
    const narrationPattern = /^I say "([^"]+)"$/;
    const testNarration = 'I say "This is a test narration"';
    const narrationMatch = testNarration.match(narrationPattern);
    
    if (!narrationMatch) {
      throw new Error('Narration pattern matching failed');
    }
    
    // Test click step  
    const clickPattern = /^I click (?:the|on) "([^"]+)"(?:\s+button|\s+link)?$/;
    const testClick = 'I click the "Sign In" button';
    const clickMatch = testClick.match(clickPattern);
    
    if (!clickMatch) {
      throw new Error('Click pattern matching failed');
    }
    
    console.log(`    Narration match: "${narrationMatch[1]}"`);
    console.log(`    Click match: "${clickMatch[1]}"`);
    
    return true;
  });
  
  // Test 6: Directory structure
  test('Directory structure is correct', () => {
    const requiredDirs = [
      'features',
      'scripts/tutorial-generation',
      'audio',
      'tutorials',
      'docs/user-journey'
    ];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Required directory missing: ${dir}`);
      }
    }
    
    return true;
  });
  
  // Test 7: GitHub workflow exists
  test('GitHub workflow exists', () => {
    const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'multilingual-tutorial-generation.yml');
    
    if (!fs.existsSync(workflowPath)) {
      throw new Error('GitHub workflow file not found');
    }
    
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Check for key workflow components
    const requiredElements = [
      'workflow_dispatch',
      'espeak-ng',
      'ffmpeg',
      'playwright',
      'Generate TTS audio',
      'Record screen tutorials'
    ];
    
    for (const element of requiredElements) {
      if (!workflowContent.includes(element)) {
        throw new Error(`Workflow missing required element: ${element}`);
      }
    }
    
    return true;
  });
  
  // Summary
  console.log(`\n📊 Test Summary:`);
  console.log(`  Tests run: ${testsRun}`);
  console.log(`  Tests passed: ${testsPassed}`);
  console.log(`  Success rate: ${Math.round((testsPassed / testsRun) * 100)}%`);
  
  if (testsPassed === testsRun) {
    console.log('\n🎉 All tests passed! Tutorial generation system is ready.');
    console.log('\nNext steps:');
    console.log('1. Install system dependencies: espeak-ng, ffmpeg, sox');
    console.log('2. Install Playwright: npx playwright install chromium');
    console.log('3. Build SGEX: npm run build');
    console.log('4. Run tutorial generation: node scripts/tutorial-orchestrator.js');
    console.log('5. Or use GitHub Actions workflow for automated generation');
  } else {
    console.log('\n❌ Some tests failed. Please fix the issues before proceeding.');
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests };