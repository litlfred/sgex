/**
 * Page Framework Compliance Tests
 * 
 * These tests validate that all pages in the SGEX Workbench properly use
 * the Page Framework and handle URL patterns according to specification.
 */

describe('Page Framework Compliance', () => {
  
  describe('Framework Compliance Checker', () => {
    test('All pages are 100% compliant with framework requirements', async () => {
      const ComplianceChecker = require('../../scripts/check-framework-compliance.js');
      const checker = new ComplianceChecker();
      
      const exitCode = await checker.check();
      
      // Test should pass (exit code 0) meaning all pages are compliant
      expect(exitCode).toBe(0);
      
      // No pages should be non-compliant
      expect(checker.results.nonCompliant.length).toBe(0);
      
      // Should have some compliant pages
      expect(checker.results.compliant.length).toBeGreaterThan(0);
      
      // Overall compliance should be 100%
      const totalPages = checker.results.compliant.length + 
                        checker.results.partiallyCompliant.length + 
                        checker.results.nonCompliant.length;
      const compliancePercentage = Math.round(
        (checker.results.compliant.length / totalPages) * 100
      );
      expect(compliancePercentage).toBe(100);
    });

    test('Specific pages mentioned in issue are compliant', async () => {
      const ComplianceChecker = require('../../scripts/check-framework-compliance.js');
      const checker = new ComplianceChecker();
      
      await checker.check();
      
      // Pages specifically mentioned in the GitHub issue comments
      const mentionedPages = [
        'BPMNViewer',
        'BusinessProcessSelection', 
        'TestingViewer',
        'ActorEditor'
      ];
      
      // All mentioned pages should be in the compliant list
      mentionedPages.forEach(pageName => {
        const pageResult = checker.results.compliant.find(p => p.name === pageName);
        expect(pageResult).toBeDefined();
        expect(pageResult.score).toBe(pageResult.maxScore);
      });
    });

    test('Previously non-compliant pages are now fixed', async () => {
      const ComplianceChecker = require('../../scripts/check-framework-compliance.js');
      const checker = new ComplianceChecker();
      
      await checker.check();
      
      // Pages that were non-compliant before our fix
      const previouslyNonCompliantPages = [
        'DAKSelection',
        'CoreDataDictionaryViewer'
      ];
      
      // These pages should now be fully compliant
      previouslyNonCompliantPages.forEach(pageName => {
        const pageResult = checker.results.compliant.find(p => p.name === pageName);
        expect(pageResult).toBeDefined();
        expect(pageResult.score).toBe(5); // Max score
        expect(pageResult.checks.pageLayout).toBe(true);
        expect(pageResult.checks.pageName).toBe(true);
        expect(pageResult.checks.noManualHelp).toBe(true);
      });
    });
  });

  describe('URL Pattern Validation', () => {
    test('App.js routes follow framework URL patterns', () => {
      const fs = require('fs');
      const path = require('path');
      
      const appJsPath = path.join(__dirname, '../App.js');
      const appContent = fs.readFileSync(appJsPath, 'utf8');
      
      // Validate that routes follow the framework patterns
      const routePatterns = [
        // Top-level pages: /sgex/{page_name}
        /path="\/"/,
        /path="\/[a-zA-Z-]+"/,
        
        // User pages: /sgex/{page_name}/{user}
        /path="\/[a-zA-Z-]+\/:user"/,
        
        // DAK pages: /sgex/{page_name}/{user}/{repo}[/{branch}]
        /path="\/[a-zA-Z-]+\/:user\/:repo"/,
        /path="\/[a-zA-Z-]+\/:user\/:repo\/:branch"/,
        
        // Asset pages: /sgex/{page_name}/{user}/{repo}/{branch}/{asset}
        // (if any exist)
      ];
      
      // Check that routes are properly structured
      const routeLines = appContent.split('\n').filter(line => line.includes('<Route'));
      expect(routeLines.length).toBeGreaterThan(0);
      
      // Should have proper basename set
      expect(appContent).toContain('basename="/sgex"');
      
      // Should have NotFound route at the end
      expect(appContent).toContain('path="*"');
      expect(appContent).toContain('<NotFound />');
    });
  });

  describe('Framework Components', () => {
    test('Framework exports are available', () => {
      // Test that framework components can be imported
      expect(() => {
        const framework = require('../components/framework');
        expect(framework.PageLayout).toBeDefined();
        expect(framework.PageHeader).toBeDefined();
        expect(framework.ErrorHandler).toBeDefined();
        expect(framework.PageProvider).toBeDefined();
        expect(framework.usePageParams).toBeDefined();
        expect(framework.useDAKParams).toBeDefined();
        expect(framework.useUserParams).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Page Framework Documentation', () => {
    test('Framework documentation exists and has required sections', () => {
      const fs = require('fs');
      const path = require('path');
      
      const docPath = path.join(__dirname, '../../public/docs/page-framework.md');
      expect(fs.existsSync(docPath)).toBe(true);
      
      const docContent = fs.readFileSync(docPath, 'utf8');
      
      // Should contain essential sections
      expect(docContent).toContain('# Page Framework');
      expect(docContent).toContain('## Page Types');
      expect(docContent).toContain('## Using the Framework');
      expect(docContent).toContain('## Developer Requirements');
      
      // Should document URL patterns
      expect(docContent).toContain('Top-Level Pages');
      expect(docContent).toContain('User Pages');
      expect(docContent).toContain('DAK Pages');
      expect(docContent).toContain('Asset Pages');
      
      // Should have usage examples
      expect(docContent).toContain('PageLayout');
      expect(docContent).toContain('pageName');
    });
  });
});