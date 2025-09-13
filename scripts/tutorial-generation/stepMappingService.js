/**
 * Gherkin Step Mapping Service
 * Maps Gherkin steps to Playwright actions for screen recording tutorials
 */

class StepMappingService {
  constructor(page) {
    this.page = page;
    this.stepMappings = new Map();
    this.audioClips = new Map();
    this.initializeStepMappings();
  }

  /**
   * Initialize standard step mappings
   */
  initializeStepMappings() {
    // Navigation steps
    this.stepMappings.set(/^I navigate to the (.+) page$/, this.navigateToPage.bind(this));
    this.stepMappings.set(/^I am on the (.+) page$/, this.verifyOnPage.bind(this));
    
    // Click actions
    this.stepMappings.set(/^I click (?:the|on) "([^"]+)"(?:\s+button|\s+link)?$/, this.clickElement.bind(this));
    this.stepMappings.set(/^I click (?:the|on) (.+) button$/, this.clickButton.bind(this));
    
    // Input actions
    this.stepMappings.set(/^I enter "([^"]+)" in the (.+) field$/, this.enterText.bind(this));
    this.stepMappings.set(/^I enter a sample PAT in the token field$/, this.enterSamplePAT.bind(this));
    
    // Visual verification
    this.stepMappings.set(/^I see the (.+)$/, this.verifyVisible.bind(this));
    this.stepMappings.set(/^I should see (.+)$/, this.verifyVisible.bind(this));
    this.stepMappings.set(/^I locate the (.+)$/, this.locateElement.bind(this));
    
    // Wait actions
    this.stepMappings.set(/^I wait for (.+)$/, this.waitFor.bind(this));
    this.stepMappings.set(/^I wait for scanning to complete$/, this.waitForScanningComplete.bind(this));
    this.stepMappings.set(/^I wait for the scanning to show progress$/, this.waitForScanningProgress.bind(this));
    
    // Search and browse actions
    this.stepMappings.set(/^I look for "([^"]+)" in the (.+)$/, this.searchInList.bind(this));
    this.stepMappings.set(/^I browse through the (.+)$/, this.browseList.bind(this));
    
    // Narration steps
    this.stepMappings.set(/^I say "([^"]+)"$/, this.addNarration.bind(this));
    
    // Background/setup steps
    this.stepMappings.set(/^I am logged in to SGEX Workbench$/, this.ensureLoggedIn.bind(this));
    this.stepMappings.set(/^I am not currently logged in$/, this.ensureLoggedOut.bind(this));
  }

  /**
   * Parse and execute a Gherkin step
   */
  async executeStep(stepText, stepType = 'When') {
    console.log(`Executing step: ${stepType} ${stepText}`);
    
    for (const [pattern, handler] of this.stepMappings) {
      const match = stepText.match(pattern);
      if (match) {
        return await handler(match, stepText);
      }
    }
    
    // If no mapping found, log warning and wait briefly
    console.warn(`No mapping found for step: ${stepText}`);
    await this.page.waitForTimeout(1000);
    return { success: false, warning: `Unmapped step: ${stepText}` };
  }

  /**
   * Navigation actions
   */
  async navigateToPage(match, stepText) {
    const pageName = match[1];
    const url = this.getPageUrl(pageName);
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    return { success: true, action: `Navigated to ${pageName} page` };
  }

  async verifyOnPage(match, stepText) {
    const pageName = match[1];
    const expectedUrl = this.getPageUrl(pageName);
    const currentUrl = this.page.url();
    const isOnPage = currentUrl.includes(expectedUrl) || currentUrl.includes(pageName);
    return { success: isOnPage, action: `Verified on ${pageName} page` };
  }

  /**
   * Click actions
   */
  async clickElement(match, stepText) {
    const elementText = match[1];
    const selector = this.getElementSelector(elementText);
    
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.click(selector);
      await this.page.waitForTimeout(500); // Brief pause after click
      return { success: true, action: `Clicked "${elementText}"` };
    } catch (error) {
      return { success: false, error: `Failed to click "${elementText}": ${error.message}` };
    }
  }

  async clickButton(match, stepText) {
    const buttonName = match[1];
    return await this.clickElement([null, buttonName], stepText);
  }

  /**
   * Input actions
   */
  async enterText(match, stepText) {
    const text = match[1];
    const fieldName = match[2];
    const selector = this.getFieldSelector(fieldName);
    
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.fill(selector, text);
      return { success: true, action: `Entered "${text}" in ${fieldName} field` };
    } catch (error) {
      return { success: false, error: `Failed to enter text in ${fieldName}: ${error.message}` };
    }
  }

  async enterSamplePAT(match, stepText) {
    const selector = this.getFieldSelector('token');
    const samplePAT = 'ghp_sample1234567890abcdefghijklmnopqrstuvwxyz';
    
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.fill(selector, samplePAT);
      return { success: true, action: 'Entered sample PAT in token field' };
    } catch (error) {
      return { success: false, error: `Failed to enter sample PAT: ${error.message}` };
    }
  }

  /**
   * Visual verification
   */
  async verifyVisible(match, stepText) {
    const elementDescription = match[1];
    const selector = this.getElementSelector(elementDescription);
    
    try {
      await this.page.waitForSelector(selector, { timeout: 5000, state: 'visible' });
      return { success: true, action: `Verified ${elementDescription} is visible` };
    } catch (error) {
      return { success: false, error: `Element not visible: ${elementDescription}` };
    }
  }

  async locateElement(match, stepText) {
    return await this.verifyVisible(match, stepText);
  }

  /**
   * Wait actions
   */
  async waitFor(match, stepText) {
    const condition = match[1];
    const waitTime = this.getWaitTime(condition);
    await this.page.waitForTimeout(waitTime);
    return { success: true, action: `Waited for ${condition}` };
  }

  async waitForScanningComplete(match, stepText) {
    try {
      // Wait for scanning completion indicator
      await this.page.waitForSelector('[data-testid="scanning-complete"]', { timeout: 30000 });
      return { success: true, action: 'Waited for scanning to complete' };
    } catch (error) {
      // Fallback: wait for a reasonable time
      await this.page.waitForTimeout(5000);
      return { success: true, action: 'Waited for scanning (fallback timeout)' };
    }
  }

  async waitForScanningProgress(match, stepText) {
    try {
      await this.page.waitForSelector('[data-testid="scanning-progress"]', { timeout: 10000 });
      await this.page.waitForTimeout(2000); // Show progress for a bit
      return { success: true, action: 'Waited for scanning progress' };
    } catch (error) {
      await this.page.waitForTimeout(2000);
      return { success: true, action: 'Waited for scanning progress (fallback)' };
    }
  }

  /**
   * Search and browse actions
   */
  async searchInList(match, stepText) {
    const searchTerm = match[1];
    const listType = match[2];
    
    // Scroll to find the item if needed
    const itemSelector = `[data-testid*="${searchTerm}"], *:contains("${searchTerm}")`;
    try {
      await this.page.waitForSelector(itemSelector, { timeout: 5000 });
      await this.page.locator(itemSelector).scrollIntoViewIfNeeded();
      return { success: true, action: `Located "${searchTerm}" in ${listType}` };
    } catch (error) {
      return { success: false, error: `Could not find "${searchTerm}" in ${listType}` };
    }
  }

  async browseList(match, stepText) {
    const listType = match[1];
    await this.page.waitForTimeout(1000);
    
    // Simulate browsing by scrolling
    await this.page.evaluate(() => {
      window.scrollBy(0, 200);
    });
    await this.page.waitForTimeout(1000);
    
    return { success: true, action: `Browsed through ${listType}` };
  }

  /**
   * Narration handling
   */
  async addNarration(match, stepText) {
    const narrationText = match[1];
    
    // Store narration for audio generation
    const narrationId = `narration_${Date.now()}`;
    this.audioClips.set(narrationId, {
      text: narrationText,
      timestamp: Date.now(),
      stepText: stepText
    });
    
    console.log(`Narration: ${narrationText}`);
    
    // Return the narration info for timing purposes
    return { 
      success: true, 
      action: 'Added narration',
      narration: {
        id: narrationId,
        text: narrationText,
        duration: this.estimateAudioDuration(narrationText)
      }
    };
  }

  /**
   * Authentication setup
   */
  async ensureLoggedIn(match, stepText) {
    // Check if already logged in, if not, perform login
    const isLoggedIn = await this.page.locator('[data-testid="user-profile"]').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      await this.performLogin();
    }
    
    return { success: true, action: 'Ensured user is logged in' };
  }

  async ensureLoggedOut(match, stepText) {
    // Check if logged out, if not, perform logout
    const isLoggedIn = await this.page.locator('[data-testid="user-profile"]').isVisible().catch(() => false);
    
    if (isLoggedIn) {
      await this.performLogout();
    }
    
    return { success: true, action: 'Ensured user is logged out' };
  }

  /**
   * Helper methods
   */
  getPageUrl(pageName) {
    const baseUrl = process.env.SGEX_BASE_URL || 'http://localhost:3000/sgex';
    const pageUrls = {
      'landing': `${baseUrl}/`,
      'login': `${baseUrl}/`,
      'welcome': `${baseUrl}/`,
      'profile selection': `${baseUrl}/`,
      'documentation': `${baseUrl}/docs`
    };
    
    return pageUrls[pageName.toLowerCase()] || baseUrl;
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
      'Core Data Elements': 'a:has-text("Core Data Elements")'
    };
    
    return selectors[elementText] || `*:has-text("${elementText}")`;
  }

  getFieldSelector(fieldName) {
    const fieldSelectors = {
      'token': 'input[data-testid="pat-token"], input[name="token"], input[placeholder*="token"]',
      'token name': 'input[data-testid="token-name"], input[name="tokenName"]'
    };
    
    return fieldSelectors[fieldName.toLowerCase()] || `input[name="${fieldName}"]`;
  }

  getWaitTime(condition) {
    const waitTimes = {
      'scanning': 3000,
      'loading': 2000,
      'animation': 1000,
      'default': 1500
    };
    
    return waitTimes[condition.toLowerCase()] || waitTimes.default;
  }

  estimateAudioDuration(text) {
    // Rough estimate: ~150 words per minute, ~5 characters per word
    const wordsPerMinute = 150;
    const charactersPerWord = 5;
    const words = text.length / charactersPerWord;
    const minutes = words / wordsPerMinute;
    return Math.max(2000, minutes * 60 * 1000); // Minimum 2 seconds
  }

  async performLogin() {
    // Basic login flow for demos
    const loginButton = this.page.locator('button:has-text("Sign In")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async performLogout() {
    // Basic logout flow
    const userProfile = this.page.locator('[data-testid="user-profile"]');
    if (await userProfile.isVisible()) {
      await userProfile.click();
      const logoutButton = this.page.locator('button:has-text("Logout")');
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      }
    }
  }

  /**
   * Get all audio clips for processing
   */
  getAudioClips() {
    return Array.from(this.audioClips.values());
  }

  /**
   * Clear audio clips (for new scenario)
   */
  clearAudioClips() {
    this.audioClips.clear();
  }
}

module.exports = StepMappingService;