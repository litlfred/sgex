/**
 * Demo Removal Compliance Test
 * 
 * Validates that demo mode has been completely removed from the codebase:
 * - No components should set isDemo flags
 * - No demo-user special handling should exist
 * - No USER_TYPES.DEMO references should exist
 * 
 * This test scans all JavaScript/JSX files for demo-related patterns.
 */

const fs = require('fs');
const path = require('path');

class DemoRemovalComplianceTest {
  constructor() {
    this.violations = [];
    this.scannedFiles = [];
    this.totalFiles = 0;
  }

  /**
   * Main compliance check entry point
   */
  async runCompliance() {
    console.log('🔍 Starting Demo Removal Compliance Check...\n');
    
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
        // Skip node_modules, build directories
        if (!['node_modules', 'build', 'dist', '.git'].includes(entry.name)) {
          await this.scanDirectory(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
        // Skip test files and this compliance file itself
        if (!entry.name.includes('.test.') && 
            !entry.name.includes('.spec.') &&
            !entry.name.includes('Compliance.js')) {
          await this.scanFile(fullPath);
        }
      }
    }
  }

  /**
   * Scan individual file for demo-related patterns
   */
  async scanFile(filePath) {
    this.totalFiles++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.scannedFiles.push(filePath);
      
      this.checkDemoRemovalPatterns(content, filePath);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
    }
  }

  /**
   * Check for demo-related violations in file content
   */
  checkDemoRemovalPatterns(content, filePath) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Skip comments and documentation
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }
      
      // Check for isDemo usage
      if (line.includes('isDemo')) {
        this.violations.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          type: 'ISDEMO_USAGE_FORBIDDEN',
          message: 'Demo mode has been removed. No code should use isDemo flags.'
        });
      }
      
      // Check for demo-user special handling
      if (line.includes('demo-user') && 
          (line.includes('===') || line.includes('==') || line.includes('if'))) {
        this.violations.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          type: 'DEMO_USER_HANDLING_FORBIDDEN',
          message: 'Demo user special handling has been removed.'
        });
      }
      
      // Check for USER_TYPES.DEMO
      if (line.includes('USER_TYPES.DEMO')) {
        this.violations.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          type: 'DEMO_USER_TYPE_FORBIDDEN',
          message: 'USER_TYPES.DEMO has been removed from the system.'
        });
      }
      
      // Check for demo mode methods
      const demoMethods = ['enableDemoMode', 'disableDemoMode', 'isDemoUser', 'createDemoUser', 'getDemoData', 'isDemoDAK'];
      for (const method of demoMethods) {
        if (line.includes(method)) {
          this.violations.push({
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            type: 'DEMO_METHOD_FORBIDDEN',
            message: `Demo method ${method} has been removed.`
          });
        }
      }
    }
  }

  /**
   * Report compliance check results
   */
  reportResults() {
    console.log('📊 Demo Removal Compliance Report');
    console.log('==================================\n');
    
    console.log(`📁 Files scanned: ${this.totalFiles}`);
    console.log(`🔍 Files analyzed: ${this.scannedFiles.length}`);
    console.log(`⚠️  Violations found: ${this.violations.length}\n`);
    
    if (this.violations.length === 0) {
      console.log('✅ COMPLIANCE PASSED: No demo-related code found!');
      return;
    }
    
    console.log('❌ COMPLIANCE FAILED: Demo-related code still exists\n');
    
    // Group violations by type
    const violationsByType = {};
    this.violations.forEach(violation => {
      if (!violationsByType[violation.type]) {
        violationsByType[violation.type] = [];
      }
      violationsByType[violation.type].push(violation);
    });
    
    // Report violations by type
    Object.entries(violationsByType).forEach(([type, violations]) => {
      console.log(`\n🚨 ${type} (${violations.length} violations):`);
      violations.forEach(violation => {
        const relativePath = path.relative(process.cwd(), violation.file);
        console.log(`   ${relativePath}:${violation.line}`);
        console.log(`   ${violation.content}`);
        console.log(`   → ${violation.message}\n`);
      });
    });
  }
}

// Run the compliance test if called directly
if (require.main === module) {
  const test = new DemoRemovalComplianceTest();
  test.runCompliance().then(passed => {
    process.exit(passed ? 0 : 1);
  });
}

module.exports = DemoRemovalComplianceTest;