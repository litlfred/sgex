#!/usr/bin/env node

/**
 * SGEX GitHub Service Compliance Checker
 * 
 * This script validates that all components in the SGEX Workbench use
 * the githubService for GitHub API calls instead of direct fetch() calls.
 * This ensures consistent authentication, rate limiting, and error handling.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const SERVICES_DIR = path.join(SRC_DIR, 'services');

// GitHub service compliance rules
const COMPLIANCE_RULES = {
  NO_DIRECT_API_CALLS: 'Components must not make direct fetch() calls to api.github.com',
  USE_GITHUB_SERVICE: 'Components should use githubService methods for GitHub API operations',
  PROPER_AUTH_HANDLING: 'Use githubService.isAuth() instead of manual token checks',
  NO_HARDCODED_URLS: 'No hardcoded GitHub API URLs in component code'
};

// Files that are allowed to have direct GitHub API calls
const ALLOWED_DIRECT_API_FILES = [
  // Test files
  'githubActionsService.test.js',
  'CSP.test.js', 
  'GitHubServiceRepositoryStats.test.js',
  
  // Service files that legitimately need direct API access
  'githubActionsService.js',
  'githubService.js', // The service itself can make direct calls
  
  // Any other legitimate service files
];

// Patterns to detect direct GitHub API usage
const DIRECT_API_PATTERNS = [
  /fetch\(\s*['"]['"]https:\/\/api\.github\.com/,
  /fetch\(\s*['"`]\$\{[^}]*api\.github\.com/,
  /fetch\(\s*['"`]https:\/\/api\.github\.com/,
  /axios\.get\(\s*['"`]https:\/\/api\.github\.com/,
  /axios\.post\(\s*['"`]https:\/\/api\.github\.com/,
  /['"`]https:\/\/api\.github\.com\/repos\/[^'"`]*['"`]/
];

// Patterns to detect preferred githubService usage
const GITHUB_SERVICE_PATTERNS = [
  /githubService\./,
  /import.*githubService/,
  /require.*githubService/
];

// Authentication patterns
const AUTH_PATTERNS = {
  MANUAL_TOKEN: [
    /localStorage\.getItem\(['"`]githubToken['"`]\)/,
    /sessionStorage\.getItem\(['"`]githubToken['"`]\)/,
    /githubToken\s*&&/,
    /token\s*:\s*githubToken/
  ],
  GITHUB_SERVICE_AUTH: [
    /githubService\.isAuth\(\)/,
    /githubService\.authenticate\(/,
    /githubService\.logout\(\)/
  ]
};

class GitHubServiceComplianceChecker {
  constructor() {
    this.results = {
      compliant: [],
      nonCompliant: [],
      warnings: [],
      errors: [],
      summary: {
        totalFiles: 0,
        compliantFiles: 0,
        nonCompliantFiles: 0,
        warningFiles: 0
      }
    };
  }

  /**
   * Check compliance for all relevant files
   */
  async check() {
    console.log('🔍 Checking GitHub Service compliance...');
    
    try {
      // Check components
      await this.checkDirectory(COMPONENTS_DIR, 'component');
      
      // Check other source files (excluding services and tests)
      const srcFiles = this.getJavaScriptFiles(SRC_DIR, ['services', 'tests']);
      for (const file of srcFiles) {
        await this.checkFile(file, 'source');
      }
      
      // Generate summary
      this.generateSummary();
      
      // Print results
      this.printResults();
      
      // Return exit code (0 = success, 1 = has violations)
      return this.results.nonCompliant.length === 0 ? 0 : 1;
      
    } catch (error) {
      console.error('❌ Error during compliance check:', error.message);
      this.results.errors.push({
        type: 'system',
        message: error.message,
        file: 'system'
      });
      return 1;
    }
  }

  /**
   * Check all files in a directory
   */
  async checkDirectory(dirPath, type) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const files = this.getJavaScriptFiles(dirPath);
    for (const file of files) {
      await this.checkFile(file, type);
    }
  }

  /**
   * Check individual file for GitHub service compliance
   */
  async checkFile(filePath, type) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(SRC_DIR, filePath);
    
    // Skip files that are allowed to have direct API calls
    if (this.isAllowedFile(fileName, relativePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const compliance = this.analyzeFileCompliance(content, fileName);
      
      compliance.file = fileName;
      compliance.path = relativePath;
      compliance.type = type;
      
      // Categorize the result
      if (compliance.violations.length === 0 && compliance.warnings.length === 0) {
        this.results.compliant.push(compliance);
      } else if (compliance.violations.length > 0) {
        this.results.nonCompliant.push(compliance);
      } else {
        this.results.warnings.push(compliance);
      }
      
    } catch (error) {
      this.results.errors.push({
        type: 'file-read',
        message: error.message,
        file: fileName,
        path: relativePath
      });
    }
  }

  /**
   * Analyze file content for compliance issues
   */
  analyzeFileCompliance(content, fileName) {
    const result = {
      violations: [],
      warnings: [],
      positives: [],
      score: 0,
      maxScore: 4
    };

    // Check for direct API calls (violations)
    const directApiViolations = this.findDirectApiCalls(content);
    result.violations.push(...directApiViolations);

    // Check for manual auth handling (violations)
    const authViolations = this.findManualAuthUsage(content);
    result.violations.push(...authViolations);

    // Check for positive patterns (good practices)
    const positivePatterns = this.findGitHubServiceUsage(content);
    result.positives.push(...positivePatterns);

    // Check for proper auth usage
    const properAuth = this.findProperAuthUsage(content);
    result.positives.push(...properAuth);

    // Calculate score
    result.score = this.calculateComplianceScore(result);

    return result;
  }

  /**
   * Find direct GitHub API calls in content
   */
  findDirectApiCalls(content) {
    const violations = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Skip commented lines
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
        return;
      }

      DIRECT_API_PATTERNS.forEach(pattern => {
        if (pattern.test(line)) {
          violations.push({
            type: 'direct-api-call',
            rule: 'NO_DIRECT_API_CALLS',
            line: index + 1,
            content: line.trim(),
            message: 'Direct GitHub API call detected. Use githubService instead.'
          });
        }
      });
    });

    return violations;
  }

  /**
   * Find manual authentication handling
   */
  findManualAuthUsage(content) {
    const violations = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Skip commented lines
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
        return;
      }

      AUTH_PATTERNS.MANUAL_TOKEN.forEach(pattern => {
        if (pattern.test(line)) {
          violations.push({
            type: 'manual-auth',
            rule: 'PROPER_AUTH_HANDLING',
            line: index + 1,
            content: line.trim(),
            message: 'Manual token handling detected. Use githubService.isAuth() instead.'
          });
        }
      });
    });

    return violations;
  }

  /**
   * Find proper GitHub service usage
   */
  findGitHubServiceUsage(content) {
    const positives = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      GITHUB_SERVICE_PATTERNS.forEach(pattern => {
        if (pattern.test(line)) {
          positives.push({
            type: 'github-service-usage',
            line: index + 1,
            content: line.trim(),
            message: 'Proper githubService usage detected.'
          });
        }
      });
    });

    return positives;
  }

  /**
   * Find proper authentication service usage
   */
  findProperAuthUsage(content) {
    const positives = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      AUTH_PATTERNS.GITHUB_SERVICE_AUTH.forEach(pattern => {
        if (pattern.test(line)) {
          positives.push({
            type: 'proper-auth-usage',
            line: index + 1,
            content: line.trim(),
            message: 'Proper githubService authentication usage detected.'
          });
        }
      });
    });

    return positives;
  }

  /**
   * Calculate compliance score
   */
  calculateComplianceScore(result) {
    let score = result.maxScore;
    
    // Subtract points for violations
    score -= result.violations.filter(v => v.type === 'direct-api-call').length;
    score -= result.violations.filter(v => v.type === 'manual-auth').length * 0.5;
    
    // Bonus points for positive patterns (but cap at maxScore)
    const bonusPoints = Math.min(1, result.positives.length * 0.1);
    score = Math.min(result.maxScore, score + bonusPoints);
    
    return Math.max(0, score);
  }

  /**
   * Check if file is allowed to have direct API calls
   */
  isAllowedFile(fileName, relativePath) {
    // Check if it's in the allowed list
    if (ALLOWED_DIRECT_API_FILES.includes(fileName)) {
      return true;
    }
    
    // Check if it's in tests directory
    if (relativePath.includes('/tests/') || relativePath.includes('\\tests\\')) {
      return true;
    }
    
    // Check if it's a test file
    if (fileName.endsWith('.test.js') || fileName.endsWith('.spec.js')) {
      return true;
    }
    
    return false;
  }

  /**
   * Get JavaScript files from directory
   */
  getJavaScriptFiles(dirPath, excludeDirs = []) {
    const files = [];
    
    if (!fs.existsSync(dirPath)) {
      return files;
    }

    const processDirectory = (currentPath) => {
      const items = fs.readdirSync(currentPath);
      
      items.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Skip excluded directories
          if (!excludeDirs.includes(item)) {
            processDirectory(itemPath);
          }
        } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
          files.push(itemPath);
        }
      });
    };

    processDirectory(dirPath);
    return files;
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    this.results.summary = {
      totalFiles: this.results.compliant.length + this.results.nonCompliant.length + this.results.warnings.length,
      compliantFiles: this.results.compliant.length,
      nonCompliantFiles: this.results.nonCompliant.length,
      warningFiles: this.results.warnings.length,
      errorFiles: this.results.errors.length,
      compliancePercentage: 0
    };

    if (this.results.summary.totalFiles > 0) {
      this.results.summary.compliancePercentage = Math.round(
        (this.results.summary.compliantFiles / this.results.summary.totalFiles) * 100
      );
    }
  }

  /**
   * Print results to console
   */
  printResults() {
    console.log('\n📊 GitHub Service Compliance Results:');
    console.log('=====================================');
    
    const { summary } = this.results;
    console.log(`📈 Overall Compliance: ${summary.compliancePercentage}% (${summary.compliantFiles}/${summary.totalFiles} files)`);
    console.log(`✅ Compliant: ${summary.compliantFiles} files`);
    console.log(`❌ Non-compliant: ${summary.nonCompliantFiles} files`);
    console.log(`⚠️  Warnings: ${summary.warningFiles} files`);
    console.log(`🚨 Errors: ${summary.errorFiles} files`);

    // Show non-compliant files
    if (this.results.nonCompliant.length > 0) {
      console.log('\n❌ Non-compliant files:');
      this.results.nonCompliant.forEach(file => {
        console.log(`   📄 ${file.path} (Score: ${file.score}/${file.maxScore})`);
        file.violations.forEach(violation => {
          console.log(`      • Line ${violation.line}: ${violation.message}`);
          console.log(`        ${violation.content}`);
        });
      });
    }

    // Show warnings
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Files with warnings:');
      this.results.warnings.forEach(file => {
        console.log(`   📄 ${file.path} (Score: ${file.score}/${file.maxScore})`);
        file.warnings.forEach(warning => {
          console.log(`      • Line ${warning.line}: ${warning.message}`);
        });
      });
    }

    // Show errors
    if (this.results.errors.length > 0) {
      console.log('\n🚨 Errors during analysis:');
      this.results.errors.forEach(error => {
        console.log(`   📄 ${error.file}: ${error.message}`);
      });
    }
  }

  /**
   * Get detailed results for external use (like QA reports)
   */
  getDetailedResults() {
    return {
      ...this.results,
      timestamp: new Date().toISOString(),
      rules: COMPLIANCE_RULES
    };
  }
}

// Export for use in other scripts
module.exports = GitHubServiceComplianceChecker;

// Run directly if called from command line
if (require.main === module) {
  const checker = new GitHubServiceComplianceChecker();
  checker.check().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}