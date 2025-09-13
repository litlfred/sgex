/**
 * Playwright Script Generator
 * Converts Gherkin feature files to executable Playwright scripts with audio timing
 */

const fs = require('fs');
const path = require('path');
const StepMappingService = require('./stepMappingService');
const { Parser, AstBuilder } = require('@cucumber/gherkin');

// ID generator for @cucumber/gherkin
let idCounter = 0;
const newId = () => (++idCounter).toString();

class PlaywrightScriptGenerator {
  constructor() {
    this.scriptsOutputDir = path.join(process.cwd(), 'scripts', 'playwright');
    this.parser = new Parser(new AstBuilder(newId));
    this.ensureDirectoriesExist();
  }

  /**
   * Ensure output directories exist
   */
  ensureDirectoriesExist() {
    if (!fs.existsSync(this.scriptsOutputDir)) {
      fs.mkdirSync(this.scriptsOutputDir, { recursive: true });
    }
  }

  /**
   * Parse a Gherkin feature file using @cucumber/gherkin
   */
  parseFeatureFile(featureFilePath) {
    const content = fs.readFileSync(featureFilePath, 'utf8');
    
    try {
      // Use @cucumber/gherkin parser
      const gherkinDocument = this.parser.parse(content);
      
      if (!gherkinDocument || !gherkinDocument.feature) {
        console.warn(`@cucumber/gherkin parser failed for ${featureFilePath}, using fallback`);
        return this.parseFeatureFileCustom(content);
      }
      
      const feature = {
        title: gherkinDocument.feature.name || '',
        description: gherkinDocument.feature.description || '',
        background: [],
        scenarios: []
      };

      // Process background steps and scenarios
      if (gherkinDocument.feature.children) {
        for (const child of gherkinDocument.feature.children) {
          if (child.background) {
            feature.background = child.background.steps.map(step => ({
              keyword: step.keyword.trim(),
              text: step.text,
              isNarration: step.text.includes('I say "'),
              originalLine: `${step.keyword}${step.text}`
            }));
          } else if (child.scenario) {
            const scenario = {
              title: child.scenario.name || `Scenario ${feature.scenarios.length + 1}`,
              steps: child.scenario.steps.map(step => ({
                keyword: step.keyword.trim(),
                text: step.text,
                isNarration: step.text.includes('I say "'),
                originalLine: `${step.keyword}${step.text}`
              }))
            };
            feature.scenarios.push(scenario);
          }
        }
      }
      
      return feature;
    } catch (error) {
      console.warn(`@cucumber/gherkin parser error for ${featureFilePath}: ${error.message}`);
      console.warn('Falling back to custom parser');
      // Fallback to custom parser for any parsing issues
      return this.parseFeatureFileCustom(content);
    }
  }

  /**
   * Fallback custom parser for malformed Gherkin files
   */
  parseFeatureFileCustom(content) {
    console.warn('Using fallback custom parser');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    const feature = {
      title: '',
      description: '',
      background: [],
      scenarios: []
    };

    let currentSection = 'header';
    let currentScenario = null;
    
    lines.forEach((line, index) => {
      if (line.startsWith('Feature:')) {
        feature.title = line.replace('Feature:', '').trim();
        currentSection = 'description';
      } else if (line.startsWith('Background:')) {
        currentSection = 'background';
      } else if (line.startsWith('Scenario:')) {
        if (currentScenario) {
          feature.scenarios.push(currentScenario);
        }
        currentScenario = {
          title: line.replace('Scenario:', '').trim(),
          steps: []
        };
        currentSection = 'scenario';
      } else if (line.match(/^(Given|When|Then|And)\s/)) {
        const step = this.parseStep(line);
        if (currentSection === 'background') {
          feature.background.push(step);
        } else if (currentScenario) {
          currentScenario.steps.push(step);
        }
      } else if (currentSection === 'description' && line && !line.startsWith('As a') && !line.startsWith('I want') && !line.startsWith('So that')) {
        feature.description += line + ' ';
      }
    });
    
    if (currentScenario) {
      feature.scenarios.push(currentScenario);
    }
    
    return feature;
  }

  /**
   * Parse a Gherkin step
   */
  parseStep(line) {
    const match = line.match(/^(Given|When|Then|And)\s+(.+)$/);
    if (match) {
      return {
        keyword: match[1],
        text: match[2],
        isNarration: match[2].includes('I say "'),
        originalLine: line
      };
    }
    return { keyword: 'Unknown', text: line, originalLine: line };
  }

  /**
   * Generate Playwright test script from feature file
   */
  async generateScript(featureFilePath, audioClips = {}, options = {}) {
    const feature = this.parseFeatureFile(featureFilePath);
    const featureName = path.basename(featureFilePath, '.feature');
    
    const scriptContent = this.buildScriptContent(feature, featureName, audioClips, options);
    
    const outputPath = path.join(this.scriptsOutputDir, `${featureName}.spec.js`);
    fs.writeFileSync(outputPath, scriptContent);
    
    console.log(`Generated Playwright script: ${outputPath}`);
    return outputPath;
  }

  /**
   * Build the complete script content
   */
  buildScriptContent(feature, featureName, audioClips, options) {
    const template = `/**
 * Generated Playwright Test Script
 * Feature: ${feature.title}
 * Generated on: ${new Date().toISOString()}
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('${feature.title}', () => {
  let page;
  let audioClips;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set viewport for consistent recording
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Audio clips for timing
    audioClips = ${JSON.stringify(audioClips, null, 4)};
    
    // Start recording if enabled
    if (process.env.RECORD_VIDEO === 'true') {
      await page.video.saveAs(path.join(__dirname, '../../recordings', '${featureName}-\${Date.now()}.webm'));
    }
  });

  test.afterEach(async () => {
    await page.close();
  });

${this.generateScenarioTests(feature, featureName)}
});

/**
 * Helper function to wait for audio clip duration
 */
async function waitForAudioClip(page, narrationText, audioClips) {
  const clip = Object.values(audioClips).find(clip => 
    clip.text && clip.text.includes(narrationText.substring(0, 20))
  );
  
  if (clip && clip.duration) {
    console.log(\`Waiting for audio clip: "\${narrationText.substring(0, 50)}..." (\${clip.duration}ms)\`);
    await page.waitForTimeout(clip.duration);
  } else {
    // Fallback: estimate based on text length
    const estimatedDuration = Math.max(2000, narrationText.length * 50);
    console.log(\`Estimated audio duration: \${estimatedDuration}ms\`);
    await page.waitForTimeout(estimatedDuration);
  }
}

/**
 * Helper function to handle narration steps
 */
async function handleNarration(page, text, audioClips) {
  console.log(\`🎙️  Narration: \${text}\`);
  await waitForAudioClip(page, text, audioClips);
}

/**
 * Helper function to perform enhanced waits with retries
 */
async function waitForElement(page, selector, options = {}) {
  const timeout = options.timeout || 10000;
  const retries = options.retries || 3;
  
  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout: timeout / retries });
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(\`Retry \${i + 1}/\${retries} for selector: \${selector}\`);
      await page.waitForTimeout(1000);
    }
  }
}`;

    return template;
  }

  /**
   * Generate test scenarios
   */
  generateScenarioTests(feature, featureName) {
    return feature.scenarios.map((scenario, index) => {
      const testName = scenario.title || `Scenario ${index + 1}`;
      const steps = [...feature.background, ...scenario.steps];
      
      return `
  test('${testName}', async () => {
    console.log('🎬 Starting scenario: ${testName}');
    
    // Navigate to SGEX Workbench
    const baseUrl = process.env.SGEX_BASE_URL || 'http://localhost:3000/sgex';
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
${this.generateStepImplementations(steps, 2)}
    
    console.log('✅ Scenario completed: ${testName}');
  });`;
    }).join('\n');
  }

  /**
   * Generate step implementations
   */
  generateStepImplementations(steps, indentLevel = 0) {
    const indent = '  '.repeat(indentLevel);
    
    return steps.map(step => {
      if (step.isNarration) {
        return this.generateNarrationStep(step, indent);
      } else {
        return this.generateActionStep(step, indent);
      }
    }).join('\n\n');
  }

  /**
   * Generate narration step
   */
  generateNarrationStep(step, indent) {
    const narrationMatch = step.text.match(/I say "([^"]+)"/);
    if (narrationMatch) {
      const narrationText = narrationMatch[1];
      return `${indent}// Narration step
${indent}await handleNarration(page, "${narrationText.replace(/"/g, '\\"')}", audioClips);`;
    }
    return `${indent}// Unknown narration step: ${step.text}`;
  }

  /**
   * Generate action step
   */
  generateActionStep(step, indent) {
    const stepText = step.text;
    
    // Navigation steps
    if (stepText.match(/^I navigate to the (.+) page$/)) {
      const pageName = stepText.match(/^I navigate to the (.+) page$/)[1];
      return this.generateNavigationStep(pageName, indent);
    }
    
    // Click steps
    if (stepText.match(/^I click (?:the|on) "([^"]+)"(?:\s+button|\s+link)?$/)) {
      const elementText = stepText.match(/^I click (?:the|on) "([^"]+)"(?:\s+button|\s+link)?$/)[1];
      return this.generateClickStep(elementText, indent);
    }
    
    // Input steps
    if (stepText.match(/^I enter "([^"]+)" in the (.+) field$/)) {
      const match = stepText.match(/^I enter "([^"]+)" in the (.+) field$/);
      return this.generateInputStep(match[1], match[2], indent);
    }
    
    // Special input steps
    if (stepText.includes('I enter a sample PAT in the token field')) {
      return this.generateSamplePATStep(indent);
    }
    
    // Verification steps
    if (stepText.match(/^I see the (.+)$/) || stepText.match(/^I should see (.+)$/)) {
      const match = stepText.match(/^I (?:see|should see) (?:the )?(.+)$/);
      return this.generateVerificationStep(match[1], indent);
    }
    
    // Wait steps
    if (stepText.match(/^I wait for (.+)$/)) {
      const condition = stepText.match(/^I wait for (.+)$/)[1];
      return this.generateWaitStep(condition, indent);
    }
    
    // Search steps
    if (stepText.match(/^I look for "([^"]+)" in the (.+)$/)) {
      const match = stepText.match(/^I look for "([^"]+)" in the (.+)$/);
      return this.generateSearchStep(match[1], match[2], indent);
    }
    
    // Browse steps
    if (stepText.match(/^I browse through the (.+)$/)) {
      const listType = stepText.match(/^I browse through the (.+)$/)[1];
      return this.generateBrowseStep(listType, indent);
    }
    
    // Background/authentication steps
    if (stepText.includes('I am logged in to SGEX Workbench')) {
      return this.generateLoginStep(indent);
    }
    
    if (stepText.includes('I am not currently logged in')) {
      return this.generateLogoutStep(indent);
    }
    
    // Default step
    return this.generateDefaultStep(step, indent);
  }

  generateNavigationStep(pageName, indent) {
    return `${indent}// Navigate to ${pageName} page
${indent}console.log('🔗 Navigating to ${pageName} page');
${indent}const ${pageName.replace(/\s+/g, '')}Url = baseUrl + '${this.getPagePath(pageName)}';
${indent}await page.goto(${pageName.replace(/\s+/g, '')}Url);
${indent}await page.waitForLoadState('networkidle');`;
  }

  generateClickStep(elementText, indent) {
    const selector = this.getElementSelector(elementText);
    return `${indent}// Click "${elementText}"
${indent}console.log('👆 Clicking "${elementText}"');
${indent}await waitForElement(page, '${selector}');
${indent}await page.click('${selector}');
${indent}await page.waitForTimeout(500);`;
  }

  generateInputStep(text, fieldName, indent) {
    const selector = this.getFieldSelector(fieldName);
    return `${indent}// Enter "${text}" in ${fieldName} field
${indent}console.log('✏️  Entering text in ${fieldName} field');
${indent}await waitForElement(page, '${selector}');
${indent}await page.fill('${selector}', '${text.replace(/'/g, "\\'")}');
${indent}await page.waitForTimeout(300);`;
  }

  generateSamplePATStep(indent) {
    return `${indent}// Enter sample PAT
${indent}console.log('🔑 Entering sample Personal Access Token');
${indent}const samplePAT = 'ghp_sample1234567890abcdefghijklmnopqrstuvwxyz';
${indent}await waitForElement(page, 'input[data-testid="pat-token"], input[name="token"]');
${indent}await page.fill('input[data-testid="pat-token"], input[name="token"]', samplePAT);
${indent}await page.waitForTimeout(500);`;
  }

  generateVerificationStep(elementDescription, indent) {
    const selector = this.getElementSelector(elementDescription);
    return `${indent}// Verify "${elementDescription}" is visible
${indent}console.log('👀 Verifying "${elementDescription}" is visible');
${indent}await waitForElement(page, '${selector}');
${indent}await expect(page.locator('${selector}')).toBeVisible();`;
  }

  generateWaitStep(condition, indent) {
    const waitTime = this.getWaitTime(condition);
    return `${indent}// Wait for ${condition}
${indent}console.log('⏱️  Waiting for ${condition}');
${indent}await page.waitForTimeout(${waitTime});`;
  }

  generateSearchStep(searchTerm, listType, indent) {
    return `${indent}// Search for "${searchTerm}" in ${listType}
${indent}console.log('🔍 Looking for "${searchTerm}" in ${listType}');
${indent}const searchSelector = '[data-testid*="${searchTerm}"], *:has-text("${searchTerm}")';
${indent}await waitForElement(page, searchSelector);
${indent}await page.locator(searchSelector).scrollIntoViewIfNeeded();
${indent}await page.waitForTimeout(1000);`;
  }

  generateBrowseStep(listType, indent) {
    return `${indent}// Browse through ${listType}
${indent}console.log('📋 Browsing through ${listType}');
${indent}await page.evaluate(() => window.scrollBy(0, 200));
${indent}await page.waitForTimeout(1000);`;
  }

  generateLoginStep(indent) {
    return `${indent}// Ensure user is logged in
${indent}console.log('🔐 Ensuring user is logged in');
${indent}const isLoggedIn = await page.locator('[data-testid="user-profile"]').isVisible().catch(() => false);
${indent}if (!isLoggedIn) {
${indent}  // Perform login if needed
${indent}  const loginBtn = page.locator('button:has-text("Sign In")');
${indent}  if (await loginBtn.isVisible()) {
${indent}    await loginBtn.click();
${indent}    await page.waitForTimeout(1000);
${indent}  }
${indent}}`;
  }

  generateLogoutStep(indent) {
    return `${indent}// Ensure user is logged out
${indent}console.log('🚪 Ensuring user is logged out');
${indent}const isLoggedIn = await page.locator('[data-testid="user-profile"]').isVisible().catch(() => false);
${indent}if (isLoggedIn) {
${indent}  await page.locator('[data-testid="user-profile"]').click();
${indent}  const logoutBtn = page.locator('button:has-text("Logout")');
${indent}  if (await logoutBtn.isVisible()) {
${indent}    await logoutBtn.click();
${indent}  }
${indent}}`;
  }

  generateDefaultStep(step, indent) {
    return `${indent}// ${step.keyword}: ${step.text}
${indent}console.log('❓ Step: ${step.text.replace(/'/g, "\\'")}');
${indent}await page.waitForTimeout(1000); // Default wait for unmapped step`;
  }

  /**
   * Helper methods for selectors and paths
   */
  getPagePath(pageName) {
    const paths = {
      'landing': '/',
      'login': '/',
      'welcome': '/',
      'profile selection': '/',
      'documentation': '/docs'
    };
    return paths[pageName.toLowerCase()] || '/';
  }

  getElementSelector(elementText) {
    const selectors = {
      'Sign In': 'button[data-testid="sign-in-button"], button:has-text("Sign In")',
      'Sign In with PAT': 'button[data-testid="pat-sign-in"], button:has-text("Sign In with PAT")',
      'WorldHealthOrganization': '[data-testid="profile-who"], [data-profile="WorldHealthOrganization"]',
      'smart-immunization': '[data-testid="repo-smart-immunization"], *:has-text("smart-immunization")',
      'help mascot': '[data-testid="help-mascot"], .help-mascot',
      'Documentation': 'a:has-text("Documentation"), [data-testid="docs-link"]',
      'DAK Components': 'a:has-text("DAK Components"), [data-testid="dak-components-link"]',
      'Business Processes': 'a:has-text("Business Processes")',
      'Decision Support Logic': 'a:has-text("Decision Support Logic")',
      'Core Data Elements': 'a:has-text("Core Data Elements")',
      'PAT login form': 'form[data-testid="pat-form"], .pat-login-section',
      'user profile information': '[data-testid="user-profile"], .user-info',
      'list of available profiles': '[data-testid="profile-list"], .profile-selection',
      'list of scanned DAK repositories': '[data-testid="repository-list"], .repository-grid',
      'DAK components available for editing': '[data-testid="dak-components"], .dak-dashboard',
      'help menu': '[data-testid="help-menu"], .help-menu'
    };
    
    return selectors[elementText] || `*:has-text("${elementText}")`;
  }

  getFieldSelector(fieldName) {
    const fieldSelectors = {
      'token': 'input[data-testid="pat-token"], input[name="token"]',
      'token name': 'input[data-testid="token-name"], input[name="tokenName"]'
    };
    
    return fieldSelectors[fieldName.toLowerCase()] || `input[name="${fieldName}"]`;
  }

  getWaitTime(condition) {
    const waitTimes = {
      'scanning': 3000,
      'scanning to complete': 5000,
      'scanning to show progress': 2000,
      'loading': 2000,
      'animation': 1000,
      'default': 1500
    };
    
    return waitTimes[condition.toLowerCase()] || waitTimes.default;
  }

  /**
   * Generate scripts for all feature files
   */
  async generateAllScripts(featuresDir, audioClipsMap = {}) {
    const featureFiles = fs.readdirSync(featuresDir)
      .filter(file => file.endsWith('.feature'))
      .map(file => path.join(featuresDir, file));

    const generatedScripts = [];

    for (const featureFile of featureFiles) {
      const featureName = path.basename(featureFile, '.feature');
      const audioClips = audioClipsMap[featureName] || {};
      
      try {
        const scriptPath = await this.generateScript(featureFile, audioClips);
        generatedScripts.push(scriptPath);
      } catch (error) {
        console.error(`Failed to generate script for ${featureFile}:`, error.message);
      }
    }

    return generatedScripts;
  }
}

module.exports = PlaywrightScriptGenerator;