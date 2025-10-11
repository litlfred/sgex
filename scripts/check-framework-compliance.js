#!/usr/bin/env node

/**
 * SGEX Page Framework Compliance Checker
 * 
 * This script validates that all pages in the SGEX Workbench comply with
 * the Page Framework requirements.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const APP_JS = path.join(SRC_DIR, 'App.js');

// Framework compliance rules
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

// Legacy manual exclusion list - kept for reference but now uses automatic detection
// based on component naming patterns and code structure (see isUtilityComponent function)
// Utility components that don't need full framework compliance
const LEGACY_UTILITY_COMPONENTS = [
  // These are now automatically detected by isUtilityComponent()
  // Kept here for documentation purposes only
];

// Framework components themselves
const FRAMEWORK_COMPONENTS = [
  'PageLayout.js', 'PageHeader.js', 'PageProvider.js', 
  'ErrorHandler.js', 'usePageParams.js', 'index.js'
];

/**
 * Get list of routed page components from routes-config.json
 * This is a deterministic approach - only components explicitly registered in routing are checked
 * @returns {Array} Array of component names that are actually routed as pages
 */
function getRoutedComponents() {
  const ROUTES_CONFIG_PATH = path.join(__dirname, '../public/routes-config.json');
  
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

/**
 * Automatically detect if a component is a utility component based on its code structure
 * This eliminates the need to maintain a manual exclusion list
 * @param {string} componentName - Name of the component
 * @param {string} content - Component file content
 * @returns {boolean} True if component should be excluded from compliance checks
 */
function isUtilityComponent(componentName, content) {
  // 1. Check for Example/Demo components that should be excluded
  if (/Example|Demo/i.test(componentName)) {
    return true;
  }
  
  // 2. Check naming conventions for common utility patterns
  const namingPatterns = [
    /Modal$/,          // LoginModal, CollaborationModal, etc.
    /Dialog$/,         // SaveDialog, etc.
    /Button$/,         // HelpButton, etc.
    /Badge$/,          // PreviewBadge, etc.
    /Bar$/,            // ForkStatusBar, etc.
    /Box$/,            // DAKStatusBox, etc.
    /Card$/,           // DAKComponentCard, etc.
    /Selector$/,       // BranchSelector, LanguageSelector, etc.
    /Slider$/,         // CommitsSlider, etc.
    /Enhanced$/,       // BPMNViewerEnhanced, etc.
    /Preview$/,        // BPMNPreview - embedded viewer component
    /_old$/i,          // Old/deprecated components
  ];
  
  for (const pattern of namingPatterns) {
    if (pattern.test(componentName)) {
      return true;
    }
  }
  
  // 3. Check for modal/dialog characteristics (takes onClose, isOpen props)
  const hasModalProps = content.includes('onClose') && 
                       (content.includes('isOpen') || content.includes('open'));
  
  // 4. Check for embedded component characteristics (takes props like file, repository, etc.)
  const hasEmbeddedProps = (content.includes('{ file') || content.includes('{ repository')) &&
                           content.includes('profile') &&
                           !content.includes('usePage()');
  
  // 5. Check for widget/embedded characteristics (no routing, exported but not a page)
  const hasNoRouting = !content.includes('useNavigate') && 
                       !content.includes('Navigate') &&
                       !content.includes('PageLayout') &&
                       !content.includes('AssetEditorLayout');
  
  // 6. Check if it's a small utility component (< 200 lines typically)
  const isSmallComponent = content.split('\n').length < 200;
  
  // 7. Framework components (ContextualHelpMascot, etc.)
  const frameworkUtilities = ['ContextualHelpMascot', 'HelpButton', 'HelpModal'];
  if (frameworkUtilities.includes(componentName)) {
    return true;
  }
  
  // Component is a utility if it has modal props OR embedded props OR (is small AND has no routing)
  return hasModalProps || hasEmbeddedProps || (isSmallComponent && hasNoRouting && content.includes('export'));
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
   * This is the primary method - only components explicitly registered in routing are checked
   */
  async getRouteComponents() {
    // Use deterministic approach: read from routes-config.json
    const routedComponents = getRoutedComponents();
    
    if (routedComponents.length > 0) {
      return routedComponents;
    }
    
    // Fallback only if routes-config.json is not available
    if (this.options.format !== 'json') {
      console.warn('⚠️  Could not read routes-config.json, falling back to heuristic detection');
    }
    
    const components = [];

    // Fallback Method 1: Extract from componentRouteService.js
    try {
      const componentRouteServicePath = path.join(SRC_DIR, 'services', 'componentRouteService.js');
      if (fs.existsSync(componentRouteServicePath)) {
        const serviceContent = fs.readFileSync(componentRouteServicePath, 'utf8');
        
        // Find component names in switch statement
        const switchMatches = serviceContent.match(/case\s+'([^']+)':\s*LazyComponent\s*=\s*React\.lazy\(\(\)\s*=>\s*import\('([^']+)'\)\);/g);
        if (switchMatches) {
          switchMatches.forEach(match => {
            const componentMatch = match.match(/case\s+'([^']+)'/);
            if (componentMatch) {
              components.push(componentMatch[1]);
            }
          });
        }
      }
    } catch (error) {
      if (this.options.format !== 'json') {
        console.warn('Could not parse componentRouteService.js:', error.message);
      }
    }

    // Fallback Method 2: Extract from App.js
    if (components.length === 0) {
      try {
        const appContent = fs.readFileSync(APP_JS, 'utf8');
        
        // Find all Route elements and extract component names
        const routeRegex = /<Route[^>]+element=\{<([A-Za-z0-9_]+)/g;
        let match;

        while ((match = routeRegex.exec(appContent)) !== null) {
          const componentName = match[1].trim();
          components.push(componentName);
        }
      } catch (error) {
        if (this.options.format !== 'json') {
          console.warn('Could not parse App.js:', error.message);
        }
      }
    }

    return [...new Set(components)]; // Remove duplicates
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
    
    // Note: We don't apply utility detection here because components are already
    // filtered by deterministic routing (routes-config.json). If a component is
    // in the routing configuration, it IS a page component by definition.
    
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
      maxScore: 16, // Increased from 12 to 16 for additional service integration checks
      checks: {},
      issues: [],
      suggestions: []
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
    compliance.checks.pageLayout = hasPageLayout;
    if (hasPageLayout) compliance.score++;
    else compliance.issues.push('Missing PageLayout wrapper');

    // Check 2: Has pageName prop (PageLayout or AssetEditorLayout)
    const hasPageName = /<PageLayout[^>]+pageName=["']([^"']+)["']/.test(content) ||
                       /<AssetEditorLayout[^>]+pageName=["']([^"']+)["']/.test(content);
    compliance.checks.pageName = hasPageName;
    if (hasPageName) compliance.score++;
    else if (hasPageLayout) compliance.issues.push('PageLayout missing pageName prop');

    // Check 3: Uses framework hooks instead of useParams
    const usesFrameworkHooks = content.includes('usePageParams') || 
                              content.includes('useDAKParams') || 
                              content.includes('useUserParams');
    const usesDirectParams = content.includes('useParams') && !content.includes('//') && 
                           !content.includes('framework');
    
    if (usesFrameworkHooks && !usesDirectParams) {
      compliance.checks.frameworkHooks = true;
      compliance.score++;
    } else if (!usesDirectParams) {
      compliance.checks.frameworkHooks = true; // No params used, OK
      compliance.score++;
    } else {
      compliance.checks.frameworkHooks = false;
      compliance.issues.push('Uses direct useParams() instead of framework hooks');
    }

    // Check 4: No manual ContextualHelpMascot import
    const hasManualHelpMascot = content.includes('import') && 
                               content.includes('ContextualHelpMascot') &&
                               !content.includes('framework');
    compliance.checks.noManualHelp = !hasManualHelpMascot;
    if (!hasManualHelpMascot) compliance.score++;
    else compliance.issues.push('Has manual ContextualHelpMascot import (PageLayout provides it)');

    // Check 5: No custom header implementation (basic check)
    const hasCustomHeader = content.includes('header') && 
                           (content.includes('className="header"') || 
                            content.includes('className=\'header\'') ||
                            content.includes('<header'));
    compliance.checks.noCustomHeader = !hasCustomHeader;
    if (!hasCustomHeader) compliance.score++;
    else compliance.issues.push('May have custom header implementation');

    // Check 6: No duplicate PageLayout wrappers
    const pageLayoutMatches = (content.match(/<PageLayout/g) || []).length;
    const assetEditorLayoutMatches = (content.match(/<AssetEditorLayout/g) || []).length;
    const totalLayoutMatches = pageLayoutMatches + assetEditorLayoutMatches;
    const isNested = totalLayoutMatches > 1;
    compliance.checks.noDuplicateLayout = !isNested;
    if (!isNested) compliance.score++;
    else compliance.issues.push(`Found ${totalLayoutMatches} layout components - should only have one`);

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
    
    compliance.checks.profileCreation = !hasIncorrectDemo || hasCorrectDemo;
    if (!hasIncorrectDemo) {
      compliance.score++;
    } else {
      compliance.issues.push('Incorrect profile creation: isDemo flag misused');
      compliance.suggestions.push('Set isDemo: true ONLY for user === \'demo-user\'');
    }

    // Check 8: User access integration (MEDIUM PRIORITY)
    // Check if component imports and uses userAccessService for access control
    const hasUserAccessImport = content.includes('userAccessService') || 
                               content.includes('useUserAccess');
    const needsAccessControl = hasPageLayout && 
                              (content.includes('save') || 
                               content.includes('edit') || 
                               content.includes('onSave'));
    
    compliance.checks.userAccessIntegration = !needsAccessControl || hasUserAccessImport;
    if (!needsAccessControl || hasUserAccessImport) {
      compliance.score++;
    } else {
      compliance.issues.push('Missing userAccessService integration for access control');
      compliance.suggestions.push('Import and use userAccessService to check user permissions');
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
    
    compliance.checks.backgroundStyling = !needsBackground || hasBackgroundStyling;
    if (!needsBackground || hasBackgroundStyling) {
      compliance.score++;
    } else {
      compliance.issues.push('Landing/selection page should use WHO blue gradient background');
      compliance.suggestions.push('Add background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%)');
    }

    // Check 10: Staging Ground Service Integration (HIGH PRIORITY)
    // Asset editors (using AssetEditorLayout) should integrate with stagingGroundService
    const hasStagingGroundImport = content.includes('stagingGroundService') || 
                                   content.includes('useStagingGround');
    const needsStagingGround = hasAssetEditorLayout;
    
    compliance.checks.stagingGroundIntegration = !needsStagingGround || hasStagingGroundImport;
    if (!needsStagingGround || hasStagingGroundImport) {
      compliance.score++;
    } else {
      compliance.issues.push('Asset editor missing stagingGroundService integration');
      compliance.suggestions.push('Import and use stagingGroundService for local change management');
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
    
    compliance.checks.dataAccessLayer = !needsDataAccessLayer || hasDataAccessLayer;
    if (!needsDataAccessLayer || hasDataAccessLayer) {
      compliance.score++;
    } else {
      compliance.issues.push('Component should use dataAccessLayer for data operations');
      compliance.suggestions.push('Import dataAccessLayer instead of direct githubService calls');
    }

    // Check 12: Branch Context Awareness (MEDIUM PRIORITY)
    // DAK components should use branchContextService for branch awareness
    const hasBranchContext = content.includes('branchContextService') || 
                            content.includes('useBranchContext');
    const isDakComponent = content.includes('{ user') && 
                          content.includes('{ repo') && 
                          content.includes('{ branch');
    
    compliance.checks.branchContextAwareness = !isDakComponent || hasBranchContext;
    if (!isDakComponent || hasBranchContext) {
      compliance.score++;
    } else {
      compliance.issues.push('DAK component should use branchContextService');
      compliance.suggestions.push('Import and use branchContextService for branch context awareness');
    }

    // Check 13: Issue Tracking Service Integration (LOW PRIORITY)
    // Workflow components should integrate with issueTrackingService
    const hasIssueTracking = content.includes('issueTrackingService') || 
                             content.includes('useIssueTracking');
    const isWorkflowComponent = /Workflow|Issue|Bug|Tracking/.test(componentName) ||
                               content.includes('workflow') ||
                               content.includes('issue tracking');
    
    compliance.checks.issueTrackingIntegration = !isWorkflowComponent || hasIssueTracking;
    if (!isWorkflowComponent || hasIssueTracking) {
      compliance.score++;
    } else {
      compliance.issues.push('Workflow component should use issueTrackingService');
      compliance.suggestions.push('Import and use issueTrackingService for issue tracking features');
    }

    // Check 14: Bookmark Service Integration (LOW PRIORITY)
    // Navigation components should support bookmarkService for bookmarking
    const hasBookmarkService = content.includes('bookmarkService') || 
                               content.includes('useBookmark');
    const isNavigationComponent = /Navigation|Selection|Dashboard|Manager/.test(componentName) ||
                                 content.includes('navigation') ||
                                 (content.includes('useNavigate') && content.length > 500);
    
    compliance.checks.bookmarkIntegration = !isNavigationComponent || hasBookmarkService;
    if (!isNavigationComponent || hasBookmarkService) {
      compliance.score++;
    } else {
      compliance.issues.push('Navigation component should support bookmarkService');
      compliance.suggestions.push('Import and use bookmarkService to enable page bookmarking');
    }

    // Check 15: Help Content Registration (LOW PRIORITY)
    // Complex pages should register help content with helpContentService
    const hasHelpContent = content.includes('helpContentService') ||
                          content.includes('registerHelpContent');
    const isComplexPage = content.length > 800 || // Large component
                         content.includes('Form') ||
                         content.includes('Editor') ||
                         content.includes('Manager');
    
    compliance.checks.helpContentRegistration = !isComplexPage || hasHelpContent;
    if (!isComplexPage || hasHelpContent) {
      compliance.score++;
    } else {
      compliance.issues.push('Complex page should register help content');
      compliance.suggestions.push('Register help topics with helpContentService for user assistance');
    }

    // Check 16: Tutorial Integration (LOW PRIORITY)
    // Feature-rich pages should integrate tutorials for user onboarding
    const hasTutorialIntegration = content.includes('tutorialService') ||
                                   content.includes('useTutorial') ||
                                   content.includes('TutorialManager');
    const isFeatureRichPage = /Editor|Manager|Configuration|Selection/.test(componentName) ||
                             (content.includes('save') && content.includes('edit'));
    
    compliance.checks.tutorialIntegration = !isFeatureRichPage || hasTutorialIntegration;
    if (!isFeatureRichPage || hasTutorialIntegration) {
      compliance.score++;
    } else {
      compliance.issues.push('Feature-rich page should integrate tutorials');
      compliance.suggestions.push('Add tutorial integration with tutorialService for user onboarding');
    }

    // Generate suggestions
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
  --format <type>       Output format: standard, condensed, pr-comment, json (default: standard)
  --condensed           Shortcut for --format condensed
  --json                Shortcut for --format json
  --commit-sha <sha>    Git commit SHA for linking
  --workflow-url <url>  Workflow run URL for linking
  --help, -h            Show this help message

Examples:
  node check-framework-compliance.js
  node check-framework-compliance.js --condensed
  node check-framework-compliance.js --format pr-comment --commit-sha abc123
  node check-framework-compliance.js --json > compliance-report.json
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