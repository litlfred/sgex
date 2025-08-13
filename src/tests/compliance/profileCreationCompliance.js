/**
 * Profile Creation Compliance Test
 * 
 * Validates that all components follow the profile creation compliance requirements:
 * - Only demo-user gets isDemo: true
 * - Unauthenticated users accessing real repositories should NOT have isDemo flag
 * - Authenticated users should NOT have isDemo flag
 * 
 * This test scans all JavaScript/JSX files for profile creation patterns and validates compliance.
 */

const fs = require('fs');
const path = require('path');

class ProfileCreationComplianceTest {
  constructor() {
    this.violations = [];
    this.scannedFiles = [];
    this.totalFiles = 0;
  }

  /**
   * Main compliance check entry point
   */
  async runCompliance() {
    console.log('🔍 Starting Profile Creation Compliance Check...\n');
    
    const srcDir = path.join(__dirname, '../../');
    await this.scanDirectory(srcDir);
    
    this.reportResults();
    return this.violations.length === 0;
  }

  /**
   * Recursively scan directory for JavaScript/JSX files
   */
  async scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, build directories, and test directories (except compliance)
        if (!['node_modules', 'build', 'dist', '.git', 'tests'].includes(entry.name) || 
            entry.name === 'compliance') {
          await this.scanDirectory(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
        // Skip test files (except compliance tests)
        if (!entry.name.includes('.test.') && !entry.name.includes('.spec.') || 
            fullPath.includes('/compliance/')) {
          await this.scanFile(fullPath);
        }
      }
    }
  }

  /**
   * Scan individual file for profile creation compliance violations
   */
  async scanFile(filePath) {
    this.totalFiles++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(path.join(__dirname, '../../'), filePath);
      
      // Track that we scanned this file
      this.scannedFiles.push(relativePath);
      
      // Check for profile creation patterns
      this.checkProfileCreationPatterns(content, relativePath);
      
    } catch (error) {
      console.warn(`⚠️  Could not read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check for profile creation compliance violations in file content
   */
  checkProfileCreationPatterns(content, filePath) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Pattern 1: Check for setProfile calls with isDemo
      if (this.containsSetProfileWithIsDemo(line)) {
        this.analyzeSetProfileCall(lines, i, filePath, lineNumber);
      }
      
      // Pattern 2: Check for profile object creation with isDemo
      if (this.containsProfileObjectWithIsDemo(line)) {
        this.analyzeProfileObjectCreation(lines, i, filePath, lineNumber);
      }
      
      // Pattern 3: Check for incorrect isDemo assignment patterns
      if (this.containsIncorrectIsDemoPattern(line)) {
        this.analyzeIsDemoAssignment(lines, i, filePath, lineNumber);
      }
    }
  }

  /**
   * Check if line contains setProfile call with isDemo
   */
  containsSetProfileWithIsDemo(line) {
    return line.includes('setProfile') && 
           (line.includes('isDemo') || this.hasMultiLineProfileObject(line));
  }

  /**
   * Check if line contains profile object creation with isDemo
   */
  containsProfileObjectWithIsDemo(line) {
    return line.includes('isDemo') && 
           (line.includes('profile') || line.includes('Profile')) &&
           !line.includes('setProfile') &&
           !line.includes('//') && // Skip comments
           !line.includes('*'); // Skip block comments
  }

  /**
   * Check for common incorrect isDemo patterns
   */
  containsIncorrectIsDemoPattern(line) {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return false;
    }
    
    // Skip legitimate authentication + demo mode checks (like conditional rendering)
    if (line.includes('!githubService.isAuth()') && line.includes('profile?.isDemo') && 
        (line.includes('&&') || line.includes('||'))) {
      return false; // This is legitimate conditional rendering
    }
    
    // Pattern: isDemo: !githubService.isAuth() (direct assignment)
    if (line.includes('isDemo:') && line.includes('!githubService.isAuth()')) {
      return true;
    }
    
    // Pattern: isDemo: !isAuth (direct assignment)
    if (line.includes('isDemo:') && line.includes('!isAuth') && !line.includes('&&') && !line.includes('||')) {
      return true;
    }
    
    // Pattern: profile.isDemo = !githubService.isAuth() (direct assignment)
    if (line.includes('.isDemo') && line.includes('=') && line.includes('!githubService.isAuth()')) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if line starts a multi-line profile object
   */
  hasMultiLineProfileObject(line) {
    return line.includes('{') && !line.includes('}');
  }

  /**
   * Analyze setProfile call for compliance violations
   */
  analyzeSetProfileCall(lines, startIndex, filePath, lineNumber) {
    // Get the full setProfile call (may span multiple lines)
    const fullCall = this.extractMultiLineStatement(lines, startIndex, 'setProfile');
    
    // Check for violations
    this.checkSetProfileCompliance(fullCall, filePath, lineNumber);
  }

  /**
   * Analyze profile object creation for compliance violations  
   */
  analyzeProfileObjectCreation(lines, startIndex, filePath, lineNumber) {
    const line = lines[startIndex];
    
    // Skip if this is a comment or in a test file
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || 
        filePath.includes('.test.') || filePath.includes('.spec.')) {
      return;
    }
    
    // Get context around the line
    const context = this.getContextAroundLine(lines, startIndex, 5);
    
    // Check if this is setting isDemo inappropriately
    this.checkProfileObjectCompliance(line, context, filePath, lineNumber);
  }

  /**
   * Analyze isDemo assignment for compliance violations
   */
  analyzeIsDemoAssignment(lines, startIndex, filePath, lineNumber) {
    const line = lines[startIndex];
    const context = this.getContextAroundLine(lines, startIndex, 3);
    
    this.addViolation({
      type: 'INCORRECT_ISDEMO_PATTERN',
      filePath,
      lineNumber,
      line: line.trim(),
      context: context.join('\n'),
      severity: 'HIGH',
      message: 'Incorrect isDemo assignment pattern detected. isDemo should only be true for demo-user, not based on authentication status.'
    });
  }

  /**
   * Check setProfile call for compliance violations
   */
  checkSetProfileCompliance(fullCall, filePath, lineNumber) {
    // If the call contains isDemo, check if it's properly conditional
    if (fullCall.includes('isDemo')) {
      // Good pattern: checking for demo-user
      if (fullCall.includes("user === 'demo-user'") || 
          fullCall.includes('user === "demo-user"') ||
          fullCall.includes("'demo-user'") ||
          fullCall.includes('"demo-user"')) {
        // This is likely correct - setting isDemo only for demo-user
        return;
      }
      
      // Check for bad patterns
      if (fullCall.includes('!githubService.isAuth()') || 
          fullCall.includes('!isAuth') ||
          fullCall.includes('isDemo: true') && !fullCall.includes('demo-user')) {
        
        this.addViolation({
          type: 'INCORRECT_SETPROFILE_ISDEMO',
          filePath,
          lineNumber,
          line: fullCall.split('\n')[0].trim(),
          context: fullCall,
          severity: 'HIGH',
          message: 'setProfile() call sets isDemo incorrectly. isDemo should only be true for demo-user, not for all unauthenticated users.'
        });
      }
    }
  }

  /**
   * Check profile object creation for compliance violations
   */
  checkProfileObjectCompliance(line, context, filePath, lineNumber) {
    // If setting isDemo: true, check if it's conditional on demo-user
    if (line.includes('isDemo:') && line.includes('true')) {
      // Check if there's proper demo-user checking in context
      const hasProperDemoCheck = context.some(contextLine => 
        contextLine.includes("user === 'demo-user'") || 
        contextLine.includes('user === "demo-user"') ||
        contextLine.includes("'demo-user'") ||
        contextLine.includes('"demo-user"')
      );
      
      if (!hasProperDemoCheck) {
        this.addViolation({
          type: 'UNCONDITIONAL_ISDEMO_TRUE',
          filePath,
          lineNumber,
          line: line.trim(),
          context: context.join('\n'),
          severity: 'HIGH',
          message: 'Profile object sets isDemo: true without proper demo-user condition. This may cause unauthenticated users to receive demo content.'
        });
      }
    }
  }

  /**
   * Extract multi-line statement (like setProfile call)
   */
  extractMultiLineStatement(lines, startIndex, keyword) {
    let statement = '';
    let braceCount = 0;
    let inStatement = false;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      if (!inStatement && line.includes(keyword)) {
        inStatement = true;
      }
      
      if (inStatement) {
        statement += line + '\n';
        
        // Count braces to find end of statement
        for (const char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        // If we've closed all braces and hit a semicolon, we're done
        if (braceCount === 0 && line.includes(';')) {
          break;
        }
      }
    }
    
    return statement;
  }

  /**
   * Get context lines around a specific line
   */
  getContextAroundLine(lines, lineIndex, contextSize) {
    const start = Math.max(0, lineIndex - contextSize);
    const end = Math.min(lines.length, lineIndex + contextSize + 1);
    return lines.slice(start, end);
  }

  /**
   * Add a compliance violation
   */
  addViolation(violation) {
    this.violations.push(violation);
  }

  /**
   * Report compliance check results
   */
  reportResults() {
    console.log('📊 Profile Creation Compliance Report');
    console.log('=====================================\n');
    
    console.log(`📁 Files scanned: ${this.totalFiles}`);
    console.log(`🔍 Files analyzed: ${this.scannedFiles.length}`);
    console.log(`⚠️  Violations found: ${this.violations.length}\n`);
    
    if (this.violations.length === 0) {
      console.log('✅ COMPLIANCE PASSED: No profile creation violations found!\n');
      return;
    }
    
    console.log('❌ COMPLIANCE FAILED: Profile creation violations detected:\n');
    
    // Group violations by type
    const violationsByType = this.violations.reduce((acc, violation) => {
      acc[violation.type] = acc[violation.type] || [];
      acc[violation.type].push(violation);
      return acc;
    }, {});
    
    for (const [type, violations] of Object.entries(violationsByType)) {
      console.log(`\n🚨 ${type} (${violations.length} violations):`);
      console.log('─'.repeat(50));
      
      violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.filePath}:${violation.lineNumber}`);
        console.log(`   Severity: ${violation.severity}`);
        console.log(`   Message: ${violation.message}`);
        console.log(`   Line: ${violation.line}`);
        
        if (violation.context && violation.context !== violation.line) {
          console.log(`   Context:`);
          violation.context.split('\n').forEach(line => {
            if (line.trim()) {
              console.log(`     ${line}`);
            }
          });
        }
      });
    }
    
    console.log('\n📋 Compliance Fix Guidelines:');
    console.log('─'.repeat(30));
    console.log('1. Only set isDemo: true for user === "demo-user"');
    console.log('2. Unauthenticated users should NOT have isDemo flag');
    console.log('3. Authenticated users should NOT have isDemo flag');
    console.log('4. Use githubService.isAuth() for authentication checks, not isDemo');
    console.log('\nSee public/docs/page-framework.md for detailed compliance requirements.\n');
  }

  /**
   * Get compliance status for CI/CD
   */
  getComplianceStatus() {
    return {
      passed: this.violations.length === 0,
      totalFiles: this.totalFiles,
      scannedFiles: this.scannedFiles.length,
      violations: this.violations.length,
      violationTypes: [...new Set(this.violations.map(v => v.type))],
      highSeverityViolations: this.violations.filter(v => v.severity === 'HIGH').length
    };
  }
}

module.exports = ProfileCreationComplianceTest;

// Allow running directly
if (require.main === module) {
  const test = new ProfileCreationComplianceTest();
  test.runCompliance().then(passed => {
    process.exit(passed ? 0 : 1);
  });
}