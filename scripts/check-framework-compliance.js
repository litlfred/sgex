#!/usr/bin/env node

/**
 * SGEX Page Framework Compliance Checker
 * 
 * This script validates that all pages in the SGEX Workbench comply with
 * the Page Framework requirements.
 * 
 * DESIGN PRINCIPLE: NO HEURISTICS
 * ================================
 * This checker uses EXPLICIT EXCLUSIONS ONLY. No heuristics, pattern matching,
 * or content analysis to determine which pages should be checked.
 * 
 * Only pages that handle browser routing errors (404, redirects) are excluded
 * from LOW PRIORITY checks. All other pages are checked uniformly.
 * 
 * See COMPLIANCE_CHECKER_DESIGN.md for detailed design principles.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const APP_JS = path.join(SRC_DIR, 'App.js');

// Framework compliance rules
// NOTE: This object is used for documentation. The actual number of checks is calculated
// programmatically in analyzeComponent() using the recordCheck() helper function.
const COMPLIANCE_RULES = {
  PAGE_LAYOUT: 'All page components must be wrapped with PageLayout',
  PAGE_NAME: 'All PageLayout components must have a unique pageName prop',
  FRAMEWORK_HOOKS: 'Use framework hooks instead of direct useParams()',
  NO_MANUAL_HELP: 'No direct ContextualHelpMascot imports in page components',
  NO_CUSTOM_HEADERS: 'Let PageLayout handle headers instead of custom implementations',
  NO_DUPLICATE_LAYOUT: 'Components must not have multiple nested PageLayout wrappers',
  PROFILE_CREATION: 'Profile creation must follow compliance rules (isDemo only for demo-user)',
  USER_ACCESS_INTEGRATION: 'Components should integrate with userAccessService for access control',
  BACKGROUND_STYLING: 'Pages should use consistent WHO blue gradient background',
  STAGING_GROUND_INTEGRATION: 'Asset editors must integrate with stagingGroundService for local changes',
  DATA_ACCESS_LAYER: 'Components with data operations should use dataAccessLayer',
  BRANCH_CONTEXT_AWARENESS: 'DAK components should use branchContextService for branch awareness',
  ISSUE_TRACKING_INTEGRATION: 'Workflow components should integrate with issueTrackingService',
  BOOKMARK_INTEGRATION: 'Navigation components should support bookmarkService for bookmarking',
  HELP_CONTENT_REGISTRATION: 'Complex pages should register help content with helpContentService',
  TUTORIAL_INTEGRATION: 'Feature-rich pages should integrate tutorials for user onboarding'
};

// Calculate total number of compliance rules programmatically
const TOTAL_COMPLIANCE_CHECKS = Object.keys(COMPLIANCE_RULES).length;

// Framework components themselves
const FRAMEWORK_COMPONENTS = [
  'PageLayout.js', 'PageHeader.js', 'PageProvider.js', 
  'ErrorHandler.js', 'usePageParams.js', 'index.js'
];

// Explicit exclusion list for LOW PRIORITY checks
// These pages handle browser routing errors and should not be flagged for optional service integrations
const ROUTING_ERROR_PAGES = [
  'NotFound',        // 404 error page
  'DashboardRedirect' // Redirect utility page
];

/**
 * Get the path to routes-config.json with support for overrides
 * @returns {string} Path to routes-config.json
 */
function getRoutesConfigPath() {
  // Allow overriding the path via env var or command-line argument
  const defaultPath = path.join(__dirname, '../public/routes-config.json');
  const envPath = process.env.ROUTES_CONFIG_PATH;
  
  // Command-line argument: --routes-config=/path/to/routes-config.json
  const argPath = process.argv.find(arg => arg.startsWith('--routes-config=')) 
    ? process.argv.find(arg => arg.startsWith('--routes-config=')).split('=')[1]
    : undefined;
  
  return argPath || envPath || defaultPath;
}

/**
 * Get list of routed page components from routes-config.json
 * This is a deterministic approach - only components explicitly registered in routing are checked
 * @returns {Array} Array of component names that are actually routed as pages
 */
function getRoutedComponents() {
  const ROUTES_CONFIG_PATH = getRoutesConfigPath();
  
  try {
    const configContent = fs.readFileSync(ROUTES_CONFIG_PATH, 'utf8');
    const config = JSON.parse(configContent);
    
    const routedComponents = [];
    
    // Add DAK components (these are all routed pages)
    if (config.dakComponents) {
      Object.values(config.dakComponents).forEach(dakComp => {
        if (dakComp.component) {
          routedComponents.push(dakComp.component);
        }
      });
    }
    
    // Add standard components (these are all routed pages)
    if (config.standardComponents) {
      Object.keys(config.standardComponents).forEach(componentName => {
        routedComponents.push(componentName);
      });
    }
    
    return routedComponents;
  } catch (error) {
    console.error('Error reading routes-config.json:', error.message);
    return [];
  }
}

class ComplianceChecker {
  constructor(options = {}) {
    this.results = {
      compliant: [],
      partiallyCompliant: [],
      nonCompliant: [],
      errors: []
    };
    this.options = {
      format: options.format || 'standard', // 'standard', 'condensed', 'pr-comment', 'json'
      commitSha: options.commitSha || null,
      workflowUrl: options.workflowUrl || null,
      timestamp: options.timestamp || new Date().toISOString()
    };
  }

  /**
   * Main entry point for compliance checking
   */
  async check() {
    // Only show header for non-JSON formats
    if (this.options.format !== 'json') {
      console.log('🔍 SGEX Page Framework Compliance Checker');
      console.log('=========================================\n');
    }

    try {
      // Get all page components from routes
      const routeComponents = await this.getRouteComponents();
      
      if (this.options.format !== 'json') {
        console.log(`Found ${routeComponents.length} routed page components\n`);
      }

      // Check each component
      for (const component of routeComponents) {
        await this.checkComponent(component);
      }

      // Print results
      this.printResults();
      
      // Return exit code
      return this.results.nonCompliant.length === 0 ? 0 : 1;

    } catch (error) {
      console.error('❌ Error running compliance check:', error.message);
      return 1;
    }
  }

  /**
   * Extract route components from routes-config.json (deterministic approach)
   * This is the ONLY method - only components explicitly registered in routing are checked
   * NO FALLBACKS - failure should be clear and explicit
   */
  async getRouteComponents() {
    // Use deterministic approach: read from routes-config.json
    const routedComponents = getRoutedComponents();
    
    if (routedComponents.length === 0) {
      // NO FALLBACKS - If routes-config.json is not available or empty, this is a FAILURE
      const configPath = getRoutesConfigPath();
      throw new Error(
        `❌ FATAL: Failed to load route components from routes-config.json\n\n` +
        `Configuration file: ${configPath}\n` +
        `This is a critical failure - the compliance checker requires a valid routes-config.json file.\n\n` +
        `Possible causes:\n` +
        `  1. The routes-config.json file does not exist at: ${configPath}\n` +
        `  2. The file exists but has no dakComponents or standardComponents defined\n` +
        `  3. The file cannot be read due to permissions or syntax errors\n\n` +
        `To fix:\n` +
        `  1. Ensure routes-config.json exists in the correct location\n` +
        `  2. Verify the file has valid JSON syntax\n` +
        `  3. Check that dakComponents and/or standardComponents are defined\n` +
        `  4. Use --routes-config=/path/to/file to specify a custom location\n`
      );
    }
    
    return routedComponents;
  }

  /**
   * Check a single component for framework compliance
   */
  async checkComponent(componentName) {
    const componentPath = path.join(COMPONENTS_DIR, `${componentName}.js`);
    
    if (!fs.existsSync(componentPath)) {
      this.results.errors.push(`Component file not found: ${componentName}.js`);
      return;
    }

    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Components are filtered by deterministic routing (routes-config.json).
    // If a component is in the routing configuration, it IS a page component by definition.
    
    const compliance = this.analyzeComponent(componentName, content);
    
    // Categorize component
    if (compliance.score === compliance.maxScore) {
      this.results.compliant.push(compliance);
    } else if (compliance.score > 0) {
      this.results.partiallyCompliant.push(compliance);
    } else {
      this.results.nonCompliant.push(compliance);
    }
    
    // Only print individual results for non-JSON formats
    if (this.options.format !== 'json') {
      console.log(this.formatComponentResult(compliance));
    }
  }

  /**
   * Analyze component code for framework compliance
   */
  analyzeComponent(componentName, content) {
    const compliance = {
      name: componentName,
      score: 0,
      maxScore: 0, // Calculated programmatically based on checks performed
      checks: {},
      issues: [],
      suggestions: []
    };

    // Helper function to record a check result
    const recordCheck = (checkName, passed, failureMessage = null) => {
      compliance.maxScore++; // Every check increments maxScore
      compliance.checks[checkName] = passed;
      if (passed) {
        compliance.score++;
      } else if (failureMessage) {
        compliance.issues.push(failureMessage);
      }
    };

    // Check 1: Uses PageLayout (directly or through AssetEditorLayout)
    const hasPageLayout = (content.includes('PageLayout') && 
                         (content.includes('import { PageLayout }') || 
                          content.includes('import PageLayout') ||
                          content.includes('from \'./framework\''))) ||
                         (content.includes('AssetEditorLayout') &&
                          (content.includes('import { AssetEditorLayout }') ||
                           content.includes('from \'./framework\'')));
    const hasAssetEditorLayout = content.includes('AssetEditorLayout');
    recordCheck('pageLayout', hasPageLayout, 'Missing PageLayout wrapper');

    // Check 2: Has pageName prop (PageLayout or AssetEditorLayout)
    const hasPageName = /<PageLayout[^>]+pageName=["']([^"']+)["']/.test(content) ||
                       /<AssetEditorLayout[^>]+pageName=["']([^"']+)["']/.test(content);
    recordCheck('pageName', hasPageName || !hasPageLayout, 
      hasPageLayout ? 'PageLayout missing pageName prop' : null);

    // Check 3: Uses framework hooks instead of useParams
    const usesFrameworkHooks = content.includes('usePageParams') || 
                              content.includes('useDAKParams') || 
                              content.includes('useUserParams');
    const usesDirectParams = content.includes('useParams') && !content.includes('//') && 
                           !content.includes('framework');
    
    recordCheck('frameworkHooks', usesFrameworkHooks || !usesDirectParams,
      usesDirectParams ? 'Uses direct useParams() instead of framework hooks' : null);

    // Check 4: No manual ContextualHelpMascot import
    const hasManualHelpMascot = content.includes('import') && 
                               content.includes('ContextualHelpMascot') &&
                               !content.includes('framework');
    recordCheck('noManualHelp', !hasManualHelpMascot,
      hasManualHelpMascot ? 'Has manual ContextualHelpMascot import (PageLayout provides it)' : null);

    // Check 5: No custom header implementation (basic check)
    const hasCustomHeader = content.includes('header') && 
                           (content.includes('className="header"') || 
                            content.includes('className=\'header\'') ||
                            content.includes('<header'));
    recordCheck('noCustomHeader', !hasCustomHeader,
      hasCustomHeader ? 'May have custom header implementation' : null);

    // Check 6: No duplicate PageLayout wrappers
    const pageLayoutMatches = (content.match(/<PageLayout/g) || []).length;
    const assetEditorLayoutMatches = (content.match(/<AssetEditorLayout/g) || []).length;
    const totalLayoutMatches = pageLayoutMatches + assetEditorLayoutMatches;
    const isNested = totalLayoutMatches > 1;
    recordCheck('noDuplicateLayout', !isNested,
      isNested ? `Found ${totalLayoutMatches} layout components - should only have one` : null);

    // Check 7: Profile creation compliance (HIGH PRIORITY)
    // Check for incorrect isDemo flag usage
    const hasProfileCreation = content.includes('setProfile') || content.includes('profile =');
    const hasIncorrectDemo = hasProfileCreation && (
      // Pattern 1: isDemo set for all unauthenticated users
      (content.includes('isDemo') && content.includes('!githubService.isAuth()') && 
       !content.includes('demo-user')) ||
      // Pattern 2: isDemo based on authentication alone
      /isDemo:\s*!githubService\.isAuth\(\)/.test(content) ||
      // Pattern 3: isDemo for non-demo-user
      (content.includes('isDemo: true') && !content.includes('demo-user'))
    );
    const hasCorrectDemo = hasProfileCreation && 
                          content.includes('demo-user') && 
                          content.includes('isDemo: true');
    
    if (hasIncorrectDemo && !hasCorrectDemo) {
      recordCheck('profileCreation', false, 'Incorrect profile creation: isDemo flag misused');
      compliance.suggestions.push('Set isDemo: true ONLY for user === \'demo-user\'');
    } else {
      recordCheck('profileCreation', true);
    }

    // Check 8: User access integration (MEDIUM PRIORITY)
    // Check if component imports and uses userAccessService for access control
    const hasUserAccessImport = content.includes('userAccessService') || 
                               content.includes('useUserAccess');
    const needsAccessControl = hasPageLayout && 
                              (content.includes('save') || 
                               content.includes('edit') || 
                               content.includes('onSave'));
    
    if (needsAccessControl && !hasUserAccessImport) {
      recordCheck('userAccessIntegration', false, 'Missing userAccessService integration for access control');
      compliance.suggestions.push('Import and use userAccessService to check user permissions');
    } else {
      recordCheck('userAccessIntegration', true);
    }

    // Check 9: Background styling (MEDIUM PRIORITY)
    // Check for WHO blue gradient background in CSS or component
    // Only check for top-level landing/welcome pages, not DAK or asset pages
    const componentCssPath = path.join(COMPONENTS_DIR, `${componentName}.css`);
    let hasBackgroundStyling = false;
    
    if (fs.existsSync(componentCssPath)) {
      const cssContent = fs.readFileSync(componentCssPath, 'utf8');
      hasBackgroundStyling = cssContent.includes('linear-gradient') && 
                            (cssContent.includes('#0078d4') || cssContent.includes('#005a9e'));
    }
    
    // Also check inline styles
    hasBackgroundStyling = hasBackgroundStyling || 
                          (content.includes('linear-gradient') && 
                           content.includes('#0078d4'));
    
    // Only recommend background for Landing/Welcome/Selection pages
    const needsBackground = /Landing|Welcome|Selection/.test(componentName);
    
    if (needsBackground && !hasBackgroundStyling) {
      recordCheck('backgroundStyling', false, 'Landing/selection page should use WHO blue gradient background');
      compliance.suggestions.push('Add background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%)');
    } else {
      recordCheck('backgroundStyling', true);
    }

    // Check 10: Staging Ground Service Integration (HIGH PRIORITY)
    // Asset editors (using AssetEditorLayout) should integrate with stagingGroundService
    const hasStagingGroundImport = content.includes('stagingGroundService') || 
                                   content.includes('useStagingGround');
    const needsStagingGround = hasAssetEditorLayout;
    
    if (needsStagingGround && !hasStagingGroundImport) {
      recordCheck('stagingGroundIntegration', false, 'Asset editor missing stagingGroundService integration');
      compliance.suggestions.push('Import and use stagingGroundService for local change management');
    } else {
      recordCheck('stagingGroundIntegration', true);
    }

    // Check 11: Data Access Layer Integration (MEDIUM PRIORITY)
    // Components performing data operations should use dataAccessLayer
    const hasDataAccessLayer = content.includes('dataAccessLayer') || 
                               content.includes('useDataAccess');
    const hasDirectGitHubCalls = (content.includes('githubService.get') || 
                                 content.includes('githubService.save') ||
                                 content.includes('githubService.create')) &&
                                !content.includes('githubService.isAuth');
    const needsDataAccessLayer = hasDirectGitHubCalls || 
                                (content.includes('getAsset') || content.includes('saveAsset'));
    
    if (needsDataAccessLayer && !hasDataAccessLayer) {
      recordCheck('dataAccessLayer', false, 'Component should use dataAccessLayer for data operations');
      compliance.suggestions.push('Import dataAccessLayer instead of direct githubService calls');
    } else {
      recordCheck('dataAccessLayer', true);
    }

    // Check 12: Branch Context Awareness (MEDIUM PRIORITY)
    // DAK components should use branchContextService for branch awareness
    const hasBranchContext = content.includes('branchContextService') || 
                            content.includes('useBranchContext');
    const isDakComponent = content.includes('{ user') && 
                          content.includes('{ repo') && 
                          content.includes('{ branch');
    
    if (isDakComponent && !hasBranchContext) {
      recordCheck('branchContextAwareness', false, 'DAK component should use branchContextService');
      compliance.suggestions.push('Import and use branchContextService for branch context awareness');
    } else {
      recordCheck('branchContextAwareness', true);
    }

    // Check 13: Issue Tracking Service Integration (LOW PRIORITY)
    // All pages should integrate with issueTrackingService except routing error pages
    const hasIssueTracking = content.includes('issueTrackingService') || 
                             content.includes('useIssueTracking');
    const isExcludedFromIssueTracking = ROUTING_ERROR_PAGES.includes(componentName);
    
    if (!isExcludedFromIssueTracking && hasPageLayout && !hasIssueTracking) {
      recordCheck('issueTrackingIntegration', false, 'Page should integrate with issueTrackingService');
      compliance.suggestions.push('Import and use issueTrackingService for issue tracking features');
    } else {
      recordCheck('issueTrackingIntegration', true);
    }

    // Check 14: Bookmark Service Integration (LOW PRIORITY)
    // All pages should support bookmarkService except routing error pages
    const hasBookmarkService = content.includes('bookmarkService') || 
                               content.includes('useBookmark');
    const isExcludedFromBookmark = ROUTING_ERROR_PAGES.includes(componentName);
    
    if (!isExcludedFromBookmark && hasPageLayout && !hasBookmarkService) {
      recordCheck('bookmarkIntegration', false, 'Page should support bookmarkService');
      compliance.suggestions.push('Import and use bookmarkService to enable page bookmarking');
    } else {
      recordCheck('bookmarkIntegration', true);
    }

    // Check 15: Help Content Registration (LOW PRIORITY)
    // All pages should register help content except routing error pages
    const hasHelpContent = content.includes('helpContentService') ||
                          content.includes('registerHelpContent');
    const isExcludedFromHelpContent = ROUTING_ERROR_PAGES.includes(componentName);
    
    if (!isExcludedFromHelpContent && hasPageLayout && !hasHelpContent) {
      recordCheck('helpContentRegistration', false, 'Page should register help content');
      compliance.suggestions.push('Register help topics with helpContentService for user assistance');
    } else {
      recordCheck('helpContentRegistration', true);
    }

    // Check 16: Tutorial Integration (LOW PRIORITY)
    // All pages should integrate tutorials except routing error pages
    const hasTutorialIntegration = content.includes('tutorialService') ||
                                   content.includes('useTutorial') ||
                                   content.includes('TutorialManager');
    const isExcludedFromTutorial = ROUTING_ERROR_PAGES.includes(componentName);
    
    if (!isExcludedFromTutorial && hasPageLayout && !hasTutorialIntegration) {
      recordCheck('tutorialIntegration', false, 'Page should integrate tutorials');
      compliance.suggestions.push('Add tutorial integration with tutorialService for user onboarding');
    } else {
      recordCheck('tutorialIntegration', true);
    }

    // Add suggestion generation
    if (!hasPageLayout) {
      compliance.suggestions.push('Wrap component with PageLayout or AssetEditorLayout from ./framework');
    }
    if (hasPageLayout && !hasPageName) {
      compliance.suggestions.push('Add unique pageName prop to PageLayout');
    }
    if (usesDirectParams) {
      compliance.suggestions.push('Replace useParams() with usePageParams() or useDAKParams()');
    }
    if (hasManualHelpMascot) {
      compliance.suggestions.push('Remove ContextualHelpMascot import (PageLayout provides it)');
    }
    if (isNested) {
      compliance.suggestions.push('Remove nested PageLayout components - only use one per page');
    }

    // Validation: Ensure maxScore matches TOTAL_COMPLIANCE_CHECKS
    // This ensures the code and documentation stay in sync
    if (compliance.maxScore !== TOTAL_COMPLIANCE_CHECKS) {
      console.warn(`⚠️  WARNING: Component ${componentName} has ${compliance.maxScore} checks but COMPLIANCE_RULES defines ${TOTAL_COMPLIANCE_CHECKS} rules.`);
      console.warn('   This may indicate a mismatch between checks implemented and documented rules.');
    }

    return compliance;
  }

  /**
   * Format individual component result
   */
  formatComponentResult(compliance) {
    const { name, score, maxScore, issues, suggestions } = compliance;
    const percentage = Math.round((score / maxScore) * 100);
    
    let emoji = '❌';
    let status = 'NON-COMPLIANT';
    
    if (score === maxScore) {
      emoji = '✅';
      status = 'COMPLIANT';
    } else if (score > 0) {
      emoji = '⚠️';
      status = 'PARTIAL';
    }

    let result = `${emoji} ${name}: ${score}/${maxScore} (${percentage}%) - ${status}`;
    
    if (issues.length > 0) {
      result += `\n   Issues: ${issues.join(', ')}`;
    }
    
    if (suggestions.length > 0 && score < maxScore) {
      result += `\n   Suggestions: ${suggestions.join(', ')}`;
    }

    return result + '\n';
  }

  /**
   * Print overall results summary
   */
  printResults() {
    // Choose format based on options
    if (this.options.format === 'condensed' || this.options.format === 'pr-comment') {
      this.printCondensedResults();
    } else if (this.options.format === 'json') {
      this.printJsonResults();
    } else {
      this.printStandardResults();
    }
  }

  /**
   * Print results in condensed format for better readability
   */
  printCondensedResults() {
    const total = this.results.compliant.length + 
                  this.results.partiallyCompliant.length + 
                  this.results.nonCompliant.length;

    const overallCompliance = Math.round(
      (this.results.compliant.length / total) * 100
    );

    // Group issues by category
    const issueCategories = {
      nestedLayouts: [],
      missingLayout: [],
      customHeader: [],
      manualHelp: [],
      directParams: []
    };

    this.results.partiallyCompliant.forEach(comp => {
      if (comp.issues.some(i => i.includes('layout components'))) {
        issueCategories.nestedLayouts.push(comp);
      }
      if (comp.issues.some(i => i.includes('Missing PageLayout'))) {
        issueCategories.missingLayout.push(comp);
      }
      if (comp.issues.some(i => i.includes('custom header'))) {
        issueCategories.customHeader.push(comp);
      }
      if (comp.issues.some(i => i.includes('ContextualHelpMascot'))) {
        issueCategories.manualHelp.push(comp);
      }
      if (comp.issues.some(i => i.includes('useParams'))) {
        issueCategories.directParams.push(comp);
      }
    });

    console.log('\n📊 COMPLIANCE SUMMARY');
    console.log('====================');
    console.log(`🟢 Compliant: ${this.results.compliant.length}/${total} (${overallCompliance}%)`);
    console.log(`🟠 Partial: ${this.results.partiallyCompliant.length}/${total}`);
    console.log(`🔴 Non-compliant: ${this.results.nonCompliant.length}/${total}`);

    if (issueCategories.nestedLayouts.length > 0) {
      console.log('\n📦 Nested Layouts (' + issueCategories.nestedLayouts.length + ' components):');
      issueCategories.nestedLayouts
        .sort((a, b) => {
          const aCount = parseInt(a.issues[0].match(/\d+/)?.[0] || '0');
          const bCount = parseInt(b.issues[0].match(/\d+/)?.[0] || '0');
          return bCount - aCount;
        })
        .forEach(comp => {
          const layoutCount = comp.issues[0].match(/Found (\d+)/)?.[1] || '?';
          console.log(`  🟠 ${comp.name} (${layoutCount} layouts)`);
        });
    }

    if (issueCategories.missingLayout.length > 0) {
      console.log('\n📄 Missing PageLayout (' + issueCategories.missingLayout.length + ' components):');
      issueCategories.missingLayout.slice(0, 10).forEach(comp => {
        console.log(`  🟠 ${comp.name}`);
      });
      if (issueCategories.missingLayout.length > 10) {
        console.log(`  ... and ${issueCategories.missingLayout.length - 10} more`);
      }
    }

    if (issueCategories.customHeader.length > 0) {
      console.log('\n🎨 Custom Headers (' + issueCategories.customHeader.length + ' components):');
      issueCategories.customHeader.forEach(comp => {
        console.log(`  🟠 ${comp.name}`);
      });
    }

    if (this.results.nonCompliant.length > 0) {
      console.log('\n🔴 NON-COMPLIANT COMPONENTS:');
      this.results.nonCompliant.forEach(comp => {
        console.log(`  ${comp.name}: ${comp.issues.join(', ')}`);
      });
    }

    // Exit code guidance
    if (this.results.nonCompliant.length > 0) {
      console.log('\n❌ COMPLIANCE CHECK FAILED');
      console.log('Fix non-compliant pages before merging.');
    } else {
      console.log('\n✅ COMPLIANCE CHECK PASSED');
      if (this.results.partiallyCompliant.length > 0) {
        console.log('Consider addressing partial compliance issues.');
      }
    }
  }

  /**
   * Print results in JSON format
   */
  printJsonResults() {
    const output = {
      timestamp: this.options.timestamp,
      commitSha: this.options.commitSha,
      workflowUrl: this.options.workflowUrl,
      summary: {
        total: this.results.compliant.length + this.results.partiallyCompliant.length + this.results.nonCompliant.length,
        compliant: this.results.compliant.length,
        partiallyCompliant: this.results.partiallyCompliant.length,
        nonCompliant: this.results.nonCompliant.length,
        overallCompliance: Math.round(
          (this.results.compliant.length / 
           (this.results.compliant.length + this.results.partiallyCompliant.length + this.results.nonCompliant.length)) * 100
        )
      },
      results: {
        compliant: this.results.compliant,
        partiallyCompliant: this.results.partiallyCompliant,
        nonCompliant: this.results.nonCompliant,
        errors: this.results.errors
      }
    };
    console.log(JSON.stringify(output, null, 2));
  }

  /**
   * Print results in standard format (original verbose output)
   */
  printStandardResults() {
    const total = this.results.compliant.length + 
                  this.results.partiallyCompliant.length + 
                  this.results.nonCompliant.length;

    console.log('\n📊 COMPLIANCE SUMMARY');
    console.log('====================');
    console.log(`✅ Fully Compliant: ${this.results.compliant.length}/${total}`);
    console.log(`⚠️  Partially Compliant: ${this.results.partiallyCompliant.length}/${total}`);
    console.log(`❌ Non-Compliant: ${this.results.nonCompliant.length}/${total}`);
    
    if (this.results.errors.length > 0) {
      console.log(`🚫 Errors: ${this.results.errors.length}`);
      this.results.errors.forEach(error => console.log(`   - ${error}`));
    }

    const overallCompliance = Math.round(
      (this.results.compliant.length / total) * 100
    );
    console.log(`\n📈 Overall Compliance: ${overallCompliance}%`);

    if (this.results.nonCompliant.length > 0) {
      console.log('\n🔧 PRIORITY FIXES NEEDED:');
      this.results.nonCompliant
        .sort((a, b) => b.score - a.score)
        .forEach(component => {
          console.log(`   ${component.name}: ${component.issues.join(', ')}`);
        });
    }

    if (this.results.partiallyCompliant.length > 0) {
      console.log('\n⚠️  IMPROVEMENTS NEEDED:');
      this.results.partiallyCompliant
        .sort((a, b) => b.score - a.score)
        .forEach(component => {
          console.log(`   ${component.name}: ${component.issues.join(', ')}`);
        });
    }

    // Exit code guidance
    if (this.results.nonCompliant.length > 0) {
      console.log('\n❌ COMPLIANCE CHECK FAILED');
      console.log('Fix non-compliant pages before merging.');
    } else {
      console.log('\n✅ COMPLIANCE CHECK PASSED');
      if (this.results.partiallyCompliant.length > 0) {
        console.log('Consider addressing partial compliance issues.');
      }
    }
  }
}

// Run the compliance check if called directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    format: 'standard',
    commitSha: null,
    workflowUrl: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      options.format = args[i + 1];
      i++;
    } else if (args[i] === '--commit-sha' && args[i + 1]) {
      options.commitSha = args[i + 1];
      i++;
    } else if (args[i] === '--workflow-url' && args[i + 1]) {
      options.workflowUrl = args[i + 1];
      i++;
    } else if (args[i] === '--condensed') {
      options.format = 'condensed';
    } else if (args[i] === '--json') {
      options.format = 'json';
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
SGEX Framework Compliance Checker

Usage: node check-framework-compliance.js [options]

Options:
  --format <type>           Output format: standard, condensed, pr-comment, json (default: standard)
  --condensed               Shortcut for --format condensed
  --json                    Shortcut for --format json
  --commit-sha <sha>        Git commit SHA for linking
  --workflow-url <url>      Workflow run URL for linking
  --routes-config <path>    Path to routes-config.json (default: ../public/routes-config.json)
  --help, -h                Show this help message

Environment Variables:
  ROUTES_CONFIG_PATH        Path to routes-config.json (overridden by --routes-config)

Examples:
  node check-framework-compliance.js
  node check-framework-compliance.js --condensed
  node check-framework-compliance.js --format pr-comment --commit-sha abc123
  node check-framework-compliance.js --json > compliance-report.json
  node check-framework-compliance.js --routes-config=/custom/path/routes-config.json
  ROUTES_CONFIG_PATH=/custom/path/routes-config.json node check-framework-compliance.js
`);
      process.exit(0);
    }
  }

  const checker = new ComplianceChecker(options);
  checker.check().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ComplianceChecker;