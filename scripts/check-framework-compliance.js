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
  NO_DUPLICATE_LAYOUT: 'Components must not have multiple nested PageLayout wrappers'
};

// Utility components that don't need full framework compliance
const UTILITY_COMPONENTS = [
  'PATLogin.js', 'HelpButton.js', 'HelpModal.js', 'SaveDialog.js',
  'PageEditModal.js', 'PageViewModal.js', 'BranchSelector.js',
  'DAKStatusBox.js', 'Publications.js', 'CommitsSlider.js',
  'GitHubActionsIntegration.js', 'WHODigitalLibrary.js',
  'ContextualHelpMascot.js', 'BPMNViewerEnhanced.js'
];

// Framework components themselves
const FRAMEWORK_COMPONENTS = [
  'PageLayout.js', 'PageHeader.js', 'PageProvider.js', 
  'ErrorHandler.js', 'usePageParams.js', 'index.js'
];

class ComplianceChecker {
  constructor() {
    this.results = {
      compliant: [],
      partiallyCompliant: [],
      nonCompliant: [],
      errors: []
    };
  }

  /**
   * Main entry point for compliance checking
   */
  async check() {
    console.log('🔍 SGEX Page Framework Compliance Checker');
    console.log('=========================================\n');

    try {
      // Get all page components from routes
      const routeComponents = await this.getRouteComponents();
      console.log(`Found ${routeComponents.length} routed page components\n`);

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
   * Extract route components from App.js and lazyRouteUtils.js
   */
  async getRouteComponents() {
    const components = [];

    // Method 1: Extract from lazyRouteUtils.js (primary method)
    try {
      const lazyRouteUtilsPath = path.join(SRC_DIR, 'utils', 'lazyRouteUtils.js');
      if (fs.existsSync(lazyRouteUtilsPath)) {
        const lazyContent = fs.readFileSync(lazyRouteUtilsPath, 'utf8');
        
        // Find component names in switch statement
        const switchMatches = lazyContent.match(/case\s+'([^']+)':\s*LazyComponent\s*=\s*React\.lazy\(\(\)\s*=>\s*import\('([^']+)'\)\);/g);
        if (switchMatches) {
          switchMatches.forEach(match => {
            const componentMatch = match.match(/case\s+'([^']+)'/);
            if (componentMatch && !UTILITY_COMPONENTS.includes(`${componentMatch[1]}.js`)) {
              components.push(componentMatch[1]);
            }
          });
        }
      }
    } catch (error) {
      console.warn('Could not parse lazyRouteUtils.js:', error.message);
    }

    // Method 2: Extract from App.js as fallback
    if (components.length === 0) {
      try {
        const appContent = fs.readFileSync(APP_JS, 'utf8');
        
        // Find all Route elements and extract component names
        const routeRegex = /<Route[^>]+element=\{<([A-Za-z0-9_]+)/g;
        let match;

        while ((match = routeRegex.exec(appContent)) !== null) {
          const componentName = match[1].trim();
          // Skip if it's a utility component we don't expect to be framework-compliant
          if (!UTILITY_COMPONENTS.includes(`${componentName}.js`)) {
            components.push(componentName);
          }
        }
      } catch (error) {
        console.warn('Could not parse App.js:', error.message);
      }
    }

    // Method 3: Scan components directory for React components
    if (components.length === 0) {
      console.log('Falling back to directory scan...');
      try {
        const componentFiles = fs.readdirSync(COMPONENTS_DIR)
          .filter(file => file.endsWith('.js') && !file.endsWith('.test.js'))
          .filter(file => !UTILITY_COMPONENTS.includes(file))
          .filter(file => !FRAMEWORK_COMPONENTS.includes(file))
          .map(file => file.replace('.js', ''));
        
        // Filter to components that likely are page components (contain JSX and PageLayout or return statements)
        for (const componentName of componentFiles) {
          const componentPath = path.join(COMPONENTS_DIR, `${componentName}.js`);
          const content = fs.readFileSync(componentPath, 'utf8');
          
          // Check if it looks like a page component
          if (content.includes('return') && 
              (content.includes('PageLayout') || content.includes('<div') || content.includes('function') || content.includes('const'))) {
            components.push(componentName);
          }
        }
      } catch (error) {
        console.warn('Could not scan components directory:', error.message);
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
    const compliance = this.analyzeComponent(componentName, content);
    
    // Categorize component
    if (compliance.score === compliance.maxScore) {
      this.results.compliant.push(compliance);
    } else if (compliance.score > 0) {
      this.results.partiallyCompliant.push(compliance);
    } else {
      this.results.nonCompliant.push(compliance);
    }
    
    console.log(this.formatComponentResult(compliance));
  }

  /**
   * Analyze component code for framework compliance
   */
  analyzeComponent(componentName, content) {
    const compliance = {
      name: componentName,
      score: 0,
      maxScore: 6, // Increased from 5 to 6 for new duplicate layout check
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

    // Check 6: No duplicate PageLayout wrappers (NEW CHECK)
    const pageLayoutMatches = (content.match(/<PageLayout/g) || []).length;
    const assetEditorLayoutMatches = (content.match(/<AssetEditorLayout/g) || []).length;
    const totalLayoutMatches = pageLayoutMatches + assetEditorLayoutMatches;
    const isNested = totalLayoutMatches > 1;
    compliance.checks.noDuplicateLayout = !isNested;
    if (!isNested) compliance.score++;
    else compliance.issues.push(`Found ${totalLayoutMatches} layout components - should only have one`);

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
  const checker = new ComplianceChecker();
  checker.check().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ComplianceChecker;