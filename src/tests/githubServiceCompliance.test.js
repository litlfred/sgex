/**
 * GitHub Service Compliance Tests
 * 
 * These tests validate that all components in the SGEX Workbench properly use
 * the githubService for GitHub API operations instead of direct fetch() calls.
 * This ensures consistent authentication, rate limiting, and error handling.
 */

describe('GitHub Service Compliance', () => {
  
  describe('GitHub Service Usage Compliance', () => {
    test('All components use githubService instead of direct GitHub API calls', async () => {
      const GitHubServiceComplianceChecker = require('../../scripts/check-github-service-compliance.js');
      const checker = new GitHubServiceComplianceChecker();
      
      const exitCode = await checker.check();
      
      // Test should pass (exit code 0) meaning all components are compliant
      expect(exitCode).toBe(0);
      
      // No components should be non-compliant
      expect(checker.results.nonCompliant.length).toBe(0);
      
      // Should have some compliant components
      expect(checker.results.compliant.length).toBeGreaterThan(0);
      
      // Overall compliance should be 100%
      const totalFiles = checker.results.compliant.length + 
                        checker.results.nonCompliant.length + 
                        checker.results.warnings.length;
      
      if (totalFiles > 0) {
        const compliancePercentage = Math.round(
          (checker.results.compliant.length / totalFiles) * 100
        );
        expect(compliancePercentage).toBe(100);
      }
    });

    test('Components use proper GitHub service authentication methods', async () => {
      const GitHubServiceComplianceChecker = require('../../scripts/check-github-service-compliance.js');
      const checker = new GitHubServiceComplianceChecker();
      
      await checker.check();
      
      // Check that no components have manual authentication violations
      const authViolations = checker.results.nonCompliant.filter(file => 
        file.violations.some(v => v.type === 'manual-auth')
      );
      
      expect(authViolations.length).toBe(0);
      
      // If any components handle auth, they should use proper methods
      const authComponents = checker.results.compliant.filter(file =>
        file.positives.some(p => p.type === 'proper-auth-usage')
      );
      
      // This is informational - not all components need auth
      console.log(`Components with proper auth usage: ${authComponents.length}`);
    });

    test('No direct GitHub API fetch calls in components', async () => {
      const GitHubServiceComplianceChecker = require('../../scripts/check-github-service-compliance.js');
      const checker = new GitHubServiceComplianceChecker();
      
      await checker.check();
      
      // Check that no components have direct API call violations
      const directApiViolations = checker.results.nonCompliant.filter(file => 
        file.violations.some(v => v.type === 'direct-api-call')
      );
      
      expect(directApiViolations.length).toBe(0);
      
      // Log any violations for debugging
      if (directApiViolations.length > 0) {
        console.error('Components with direct GitHub API calls:');
        directApiViolations.forEach(file => {
          console.error(`  - ${file.path}`);
          file.violations.forEach(v => {
            if (v.type === 'direct-api-call') {
              console.error(`    Line ${v.line}: ${v.content}`);
            }
          });
        });
      }
    });

    test('Previously non-compliant components are now fixed', async () => {
      const GitHubServiceComplianceChecker = require('../../scripts/check-github-service-compliance.js');
      const checker = new GitHubServiceComplianceChecker();
      
      await checker.check();
      
      // Components that were specifically mentioned in issue #705 as having direct API calls
      const previouslyNonCompliantComponents = [
        'BranchListingPage.js',
        'BranchListing.js'
      ];
      
      // These components should now be fully compliant
      previouslyNonCompliantComponents.forEach(componentName => {
        const componentResult = checker.results.compliant.find(c => c.file === componentName);
        
        // Component should be in compliant list
        expect(componentResult).toBeDefined();
        
        if (componentResult) {
          // Should have perfect or near-perfect score
          expect(componentResult.score).toBeGreaterThanOrEqual(componentResult.maxScore * 0.9);
          
          // Should have no direct API call violations
          const directApiViolations = componentResult.violations?.filter(v => v.type === 'direct-api-call') || [];
          expect(directApiViolations.length).toBe(0);
        }
      });
    });
  });

  describe('GitHub Service Integration Validation', () => {
    test('githubService is properly imported and used in components', async () => {
      const fs = require('fs');
      const path = require('path');
      
      const componentsDir = path.join(__dirname, '../components');
      const componentFiles = fs.readdirSync(componentsDir)
        .filter(file => file.endsWith('.js') || file.endsWith('.jsx'))
        .filter(file => !file.includes('test'));
      
      // Track components that use GitHub-related functionality
      const githubRelatedComponents = [];
      
      componentFiles.forEach(file => {
        const filePath = path.join(componentsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if component deals with GitHub functionality
        const hasGitHubFunctionality = (
          content.includes('github') ||
          content.includes('GitHub') ||
          content.includes('pull request') ||
          content.includes('pullRequest') ||
          content.includes('branch') ||
          content.includes('commit') ||
          content.includes('repository') ||
          content.includes('repo')
        );
        
        if (hasGitHubFunctionality) {
          githubRelatedComponents.push({
            file,
            hasGitHubServiceImport: (
              content.includes('import') && content.includes('githubService')
            ) || (
              content.includes('require') && content.includes('githubService')
            ),
            hasDirectApiCall: content.includes('api.github.com') && !content.includes('//'),
            content: content
          });
        }
      });
      
      // Components with GitHub functionality should use githubService
      githubRelatedComponents.forEach(component => {
        if (component.hasDirectApiCall) {
          console.warn(`Component ${component.file} has direct GitHub API calls`);
          expect(component.hasDirectApiCall).toBe(false);
        }
        
        // If component has GitHub functionality and API calls, it should use githubService
        const hasApiCallsPattern = /fetch\s*\(|axios\.|XMLHttpRequest/.test(component.content);
        if (hasApiCallsPattern && component.content.includes('github')) {
          expect(component.hasGitHubServiceImport).toBe(true);
        }
      });
      
      console.log(`Analyzed ${githubRelatedComponents.length} GitHub-related components`);
    });

    test('Components handle GitHub service errors properly', async () => {
      const GitHubServiceComplianceChecker = require('../../scripts/check-github-service-compliance.js');
      const checker = new GitHubServiceComplianceChecker();
      
      await checker.check();
      
      // This test ensures our compliance checker itself works correctly
      expect(checker.results).toBeDefined();
      expect(checker.results.summary).toBeDefined();
      expect(checker.results.summary.totalFiles).toBeGreaterThan(0);
      
      // Validate the checker found no critical issues
      expect(checker.results.errors.length).toBe(0);
    });
  });

  describe('Specific Component Compliance', () => {
    test('BranchListingPage uses githubService for all GitHub operations', () => {
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join(__dirname, '../components/BranchListingPage.js');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Should import or use githubService
      expect(content).toMatch(/import.*githubService|require.*githubService|githubService\./);
      
      // Should not have direct API calls
      expect(content).not.toMatch(/fetch\s*\(\s*['"`]https:\/\/api\.github\.com/);
      
      // Should use githubService methods for GitHub operations
      const githubOperations = [
        'getPullRequests',
        'getPullRequestIssueComments', 
        'createPullRequestComment',
        'getWorkflowRuns',
        'isAuth'
      ];
      
      // At least some of these should be present if it's doing GitHub operations
      const hasGitHubServiceMethods = githubOperations.some(method => 
        content.includes(`githubService.${method}`)
      );
      
      // If the file does GitHub operations, it should use githubService methods
      if (content.includes('github') || content.includes('pullRequest') || content.includes('workflow')) {
        expect(hasGitHubServiceMethods).toBe(true);
      }
    });

    test('BranchListing uses githubService for all GitHub operations', () => {
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join(__dirname, '../components/BranchListing.js');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Should import or use githubService
      expect(content).toMatch(/import.*githubService|require.*githubService|githubService\./);
      
      // Should not have direct API calls (except commented ones)
      const lines = content.split('\n');
      const nonCommentedLines = lines.filter(line => 
        !line.trim().startsWith('//') && 
        !line.trim().startsWith('*') && 
        !line.trim().startsWith('/*')
      );
      const nonCommentedContent = nonCommentedLines.join('\n');
      
      expect(nonCommentedContent).not.toMatch(/fetch\s*\(\s*['"`]https:\/\/api\.github\.com/);
      
      // Should use githubService methods for GitHub operations
      const githubOperations = [
        'getBranches',
        'getPullRequests',
        'getPullRequestIssueComments',
        'createPullRequestComment',
        'authenticate',
        'logout',
        'isAuth'
      ];
      
      // At least some of these should be present if it's doing GitHub operations
      const hasGitHubServiceMethods = githubOperations.some(method => 
        content.includes(`githubService.${method}`)
      );
      
      // If the file does GitHub operations, it should use githubService methods
      if (content.includes('github') || content.includes('branch') || content.includes('pullRequest')) {
        expect(hasGitHubServiceMethods).toBe(true);
      }
    });
  });

  describe('GitHub Service Compliance Documentation', () => {
    test('QA testing documentation mentions GitHub service compliance', () => {
      const fs = require('fs');
      const path = require('path');
      
      const qaDocPath = path.join(__dirname, '../../public/docs/qa-testing.md');
      expect(fs.existsSync(qaDocPath)).toBe(true);
      
      const qaContent = fs.readFileSync(qaDocPath, 'utf8');
      
      // Should mention GitHub service compliance
      expect(qaContent).toMatch(/github.*service.*compliance|GitHub.*Service.*Compliance/i);
    });
  });
});