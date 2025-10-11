#!/usr/bin/env node
/**
 * Comprehensive Security Check Script for PR Builds
 * 
 * This script runs multiple security checks and outputs results in a
 * structured JSON format that can be consumed by the PR comment manager.
 * 
 * Checks performed:
 * 1. NPM Audit - Dependency vulnerabilities
 * 2. Outdated Dependencies - Security risk from old packages
 * 3. ESLint Security Rules - Code security issues
 * 4. Security Headers - Verification of security headers
 * 5. License Compliance - Check for problematic licenses
 * 6. Git Secrets Scan - Detect hardcoded secrets
 * 7. Framework Compliance - Security-related framework checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Execute a command and return the result
 */
function execCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    });
    return { success: true, output, error: null };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || '', 
      error: error.stderr || error.message 
    };
  }
}

/**
 * Run NPM audit check
 */
function runNpmAudit() {
  console.log('🔍 Running npm audit...');
  
  const result = execCommand('npm audit --json');
  let auditData = { vulnerabilities: { total: 0 } };
  
  try {
    auditData = JSON.parse(result.output || '{}');
  } catch (e) {
    console.error('Failed to parse npm audit JSON:', e.message);
  }
  
  const vulns = auditData.metadata?.vulnerabilities || auditData.vulnerabilities || {};
  const total = vulns.total || 0;
  const critical = vulns.critical || 0;
  const high = vulns.high || 0;
  const moderate = vulns.moderate || 0;
  const low = vulns.low || 0;
  
  return {
    name: 'NPM Audit',
    id: 'npm-audit',
    status: total === 0 ? 'pass' : (critical > 0 || high > 0) ? 'fail' : 'warn',
    severity: total === 0 ? 'none' : (critical > 0) ? 'critical' : (high > 0) ? 'high' : (moderate > 0) ? 'moderate' : 'low',
    summary: total === 0 
      ? 'No vulnerabilities found' 
      : `${total} vulnerabilities found (Critical: ${critical}, High: ${high}, Moderate: ${moderate}, Low: ${low})`,
    details: {
      total,
      critical,
      high,
      moderate,
      low
    },
    recommendation: total > 0 ? 'Run `npm audit fix` to automatically fix vulnerabilities' : null
  };
}

/**
 * Check for outdated dependencies
 */
function checkOutdatedDependencies() {
  console.log('🔍 Checking outdated dependencies...');
  
  const result = execCommand('npm outdated --json');
  let outdatedData = {};
  
  try {
    outdatedData = JSON.parse(result.output || '{}');
  } catch (e) {
    // npm outdated returns non-zero exit code when there are outdated packages
    // but we still want to parse the JSON
  }
  
  const outdatedCount = Object.keys(outdatedData).length;
  const criticalPackages = Object.entries(outdatedData)
    .filter(([name, info]) => {
      // Check if the package is significantly outdated (major version behind)
      const current = info.current || '';
      const latest = info.latest || '';
      const currentMajor = parseInt(current.split('.')[0]) || 0;
      const latestMajor = parseInt(latest.split('.')[0]) || 0;
      return latestMajor > currentMajor;
    })
    .map(([name]) => name);
  
  return {
    name: 'Outdated Dependencies',
    id: 'outdated-deps',
    status: outdatedCount === 0 ? 'pass' : criticalPackages.length > 0 ? 'warn' : 'info',
    severity: criticalPackages.length > 0 ? 'moderate' : 'low',
    summary: outdatedCount === 0 
      ? 'All dependencies are up to date' 
      : `${outdatedCount} outdated packages (${criticalPackages.length} major versions behind)`,
    details: {
      total: outdatedCount,
      criticalPackages: criticalPackages.slice(0, 5) // Limit to first 5
    },
    recommendation: outdatedCount > 0 
      ? 'Review outdated packages and update where possible' 
      : null
  };
}

/**
 * Run ESLint security rules
 */
function runEslintSecurityCheck() {
  console.log('🔍 Running ESLint security checks...');
  
  // Check if eslint is available
  const eslintPath = path.join(process.cwd(), 'node_modules', '.bin', 'eslint');
  if (!fs.existsSync(eslintPath)) {
    return {
      name: 'ESLint Security',
      id: 'eslint-security',
      status: 'skip',
      severity: 'none',
      summary: 'ESLint not configured',
      details: {},
      recommendation: null
    };
  }
  
  // Run ESLint and save output to file to avoid command line buffer issues
  const outputFile = path.join(process.cwd(), 'eslint-results.json');
  const result = execCommand(`${eslintPath} src --format json --output-file ${outputFile}`, { cwd: process.cwd() });
  
  let eslintData = [];
  try {
    if (fs.existsSync(outputFile)) {
      const content = fs.readFileSync(outputFile, 'utf8');
      eslintData = JSON.parse(content);
      // Clean up temp file
      fs.unlinkSync(outputFile);
    }
  } catch (e) {
    console.error('Failed to parse ESLint JSON:', e.message);
    // Try to parse from stdout as fallback
    try {
      eslintData = JSON.parse(result.output || '[]');
    } catch (e2) {
      // Give up
    }
  }
  
  // Count security-related warnings/errors
  let securityIssues = 0;
  let errorCount = 0;
  let warningCount = 0;
  
  eslintData.forEach(file => {
    file.messages?.forEach(msg => {
      // Look for security-related rules
      if (msg.ruleId?.includes('security') || 
          msg.ruleId?.includes('no-eval') || 
          msg.ruleId?.includes('no-dangerous')) {
        securityIssues++;
      }
      if (msg.severity === 2) errorCount++;
      if (msg.severity === 1) warningCount++;
    });
  });
  
  return {
    name: 'ESLint Security',
    id: 'eslint-security',
    status: securityIssues === 0 ? 'pass' : errorCount > 0 ? 'fail' : 'warn',
    severity: errorCount > 0 ? 'high' : securityIssues > 0 ? 'moderate' : 'none',
    summary: securityIssues === 0 
      ? 'No security-related linting issues' 
      : `${securityIssues} security-related issues found`,
    details: {
      securityIssues,
      errors: errorCount,
      warnings: warningCount
    },
    recommendation: securityIssues > 0 ? 'Review and fix ESLint security warnings' : null
  };
}

/**
 * Check security headers implementation
 */
function checkSecurityHeaders() {
  console.log('🔍 Checking security headers...');
  
  const headerScript = path.join(process.cwd(), 'scripts', 'verify-security-headers.sh');
  
  if (!fs.existsSync(headerScript)) {
    return {
      name: 'Security Headers',
      id: 'security-headers',
      status: 'skip',
      severity: 'none',
      summary: 'Security headers verification script not found',
      details: {},
      recommendation: null
    };
  }
  
  // Check if build directory exists (needed for full verification)
  const buildDir = path.join(process.cwd(), 'build');
  if (!fs.existsSync(buildDir)) {
    // Check source files only
    const indexHtml = path.join(process.cwd(), 'public', 'index.html');
    if (!fs.existsSync(indexHtml)) {
      return {
        name: 'Security Headers',
        id: 'security-headers',
        status: 'skip',
        severity: 'none',
        summary: 'Build artifacts not available for verification',
        details: {},
        recommendation: null
      };
    }
    
    // Just verify source files have the meta tags
    const content = fs.readFileSync(indexHtml, 'utf8');
    const hasCSP = content.includes('Content-Security-Policy');
    const hasXFrame = content.includes('X-Frame-Options');
    
    if (hasCSP && hasXFrame) {
      return {
        name: 'Security Headers',
        id: 'security-headers',
        status: 'pass',
        severity: 'none',
        summary: 'Security headers defined in source (build verification skipped)',
        details: { sourceOnly: true },
        recommendation: null
      };
    } else {
      return {
        name: 'Security Headers',
        id: 'security-headers',
        status: 'warn',
        severity: 'moderate',
        summary: 'Some security headers missing in source',
        details: { hasCSP, hasXFrame, sourceOnly: true },
        recommendation: 'Ensure all security headers are properly defined'
      };
    }
  }
  
  const result = execCommand(`bash ${headerScript}`);
  
  // Parse the output to check for success
  const output = result.output || '';
  const hasErrors = output.includes('ERROR') || output.includes('❌');
  const hasWarnings = output.includes('WARNING') || output.includes('⚠️');
  
  return {
    name: 'Security Headers',
    id: 'security-headers',
    status: hasErrors ? 'fail' : hasWarnings ? 'warn' : 'pass',
    severity: hasErrors ? 'high' : hasWarnings ? 'moderate' : 'none',
    summary: hasErrors 
      ? 'Security headers configuration has errors' 
      : hasWarnings 
        ? 'Security headers have warnings' 
        : 'Security headers properly configured',
    details: {
      hasErrors,
      hasWarnings
    },
    recommendation: hasErrors || hasWarnings 
      ? 'Review security headers implementation' 
      : null
  };
}

/**
 * Check license compliance
 */
function checkLicenseCompliance() {
  console.log('🔍 Checking license compliance...');
  
  const result = execCommand('npm ls --json --all');
  let depsData = {};
  
  try {
    depsData = JSON.parse(result.output || '{}');
  } catch (e) {
    console.error('Failed to parse npm ls JSON:', e.message);
  }
  
  // List of problematic licenses (GPL, AGPL require disclosure)
  const problematicLicenses = ['GPL', 'AGPL', 'LGPL'];
  const issues = [];
  
  function checkDependency(dep, name) {
    const license = dep.license || '';
    if (problematicLicenses.some(l => license.includes(l))) {
      issues.push({ name, license });
    }
  }
  
  // Check dependencies recursively (limit depth for performance)
  function walkDeps(deps, depth = 0) {
    if (!deps || depth > 2) return;
    Object.entries(deps).forEach(([name, dep]) => {
      checkDependency(dep, name);
      if (dep.dependencies) {
        walkDeps(dep.dependencies, depth + 1);
      }
    });
  }
  
  if (depsData.dependencies) {
    walkDeps(depsData.dependencies);
  }
  
  return {
    name: 'License Compliance',
    id: 'license-check',
    status: issues.length === 0 ? 'pass' : 'warn',
    severity: issues.length > 0 ? 'low' : 'none',
    summary: issues.length === 0 
      ? 'No problematic licenses detected' 
      : `${issues.length} packages with restrictive licenses`,
    details: {
      issues: issues.slice(0, 5) // Limit to first 5
    },
    recommendation: issues.length > 0 
      ? 'Review packages with GPL/AGPL licenses for compliance' 
      : null
  };
}

/**
 * Scan for potential secrets in code
 */
function scanForSecrets() {
  console.log('🔍 Scanning for potential secrets...');
  
  // Simple regex patterns for common secrets
  const patterns = [
    { name: 'API Keys', regex: /['"](api[_-]?key|apikey)['"]:\s*['"][^'"]{20,}['"]/ },
    { name: 'Tokens', regex: /['"](token|auth[_-]?token)['"]:\s*['"][^'"]{20,}['"]/ },
    { name: 'Passwords', regex: /(password|passwd|pwd)['"]?\s*[:=]\s*['"][^'"]+['"]/ },
    { name: 'Private Keys', regex: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
    { name: 'AWS Keys', regex: /AKIA[0-9A-Z]{16}/ }
  ];
  
  let findings = [];
  
  // Scan src directory
  const srcDir = path.join(process.cwd(), 'src');
  if (fs.existsSync(srcDir)) {
    const files = execCommand('find src -type f \\( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \\)');
    const fileList = (files.output || '').trim().split('\n').filter(Boolean);
    
    fileList.slice(0, 50).forEach(file => { // Limit to 50 files for performance
      try {
        const content = fs.readFileSync(file, 'utf8');
        patterns.forEach(pattern => {
          if (pattern.regex.test(content)) {
            findings.push({ file, type: pattern.name });
          }
        });
      } catch (e) {
        // Skip files that can't be read
      }
    });
  }
  
  return {
    name: 'Secret Scanning',
    id: 'secret-scan',
    status: findings.length === 0 ? 'pass' : 'fail',
    severity: findings.length > 0 ? 'critical' : 'none',
    summary: findings.length === 0 
      ? 'No potential secrets detected in code' 
      : `${findings.length} potential secrets found`,
    details: {
      findings: findings.slice(0, 3) // Limit to first 3
    },
    recommendation: findings.length > 0 
      ? 'Review flagged files and remove any hardcoded secrets' 
      : null
  };
}

/**
 * Run framework compliance checks (security-related)
 */
function checkFrameworkCompliance() {
  console.log('🔍 Checking framework compliance...');
  
  const complianceScript = path.join(process.cwd(), 'scripts', 'check-framework-compliance.js');
  
  if (!fs.existsSync(complianceScript)) {
    return {
      name: 'Framework Compliance',
      id: 'framework-compliance',
      status: 'skip',
      severity: 'none',
      summary: 'Framework compliance script not found',
      details: {},
      recommendation: null
    };
  }
  
  const result = execCommand(`node ${complianceScript}`);
  const hasErrors = !result.success || result.output?.includes('FAILED');
  
  return {
    name: 'Framework Compliance',
    id: 'framework-compliance',
    status: hasErrors ? 'warn' : 'pass',
    severity: hasErrors ? 'low' : 'none',
    summary: hasErrors 
      ? 'Some framework compliance issues detected' 
      : 'Framework compliance checks passed',
    details: {},
    recommendation: hasErrors ? 'Review framework compliance report' : null
  };
}

/**
 * Generate security summary badge
 */
function generateSecuritySummary(checks) {
  const failed = checks.filter(c => c.status === 'fail').length;
  const warned = checks.filter(c => c.status === 'warn').length;
  const passed = checks.filter(c => c.status === 'pass').length;
  const skipped = checks.filter(c => c.status === 'skip').length;
  const info = checks.filter(c => c.status === 'info').length;
  
  let overallStatus = 'pass';
  let overallSeverity = 'none';
  
  if (failed > 0) {
    overallStatus = 'fail';
    // Find highest severity
    const severities = checks.filter(c => c.status === 'fail').map(c => c.severity);
    if (severities.includes('critical')) overallSeverity = 'critical';
    else if (severities.includes('high')) overallSeverity = 'high';
    else if (severities.includes('moderate')) overallSeverity = 'moderate';
    else overallSeverity = 'low';
  } else if (warned > 0) {
    overallStatus = 'warn';
    const severities = checks.filter(c => c.status === 'warn').map(c => c.severity);
    if (severities.includes('high')) overallSeverity = 'high';
    else if (severities.includes('moderate')) overallSeverity = 'moderate';
    else overallSeverity = 'low';
  }
  
  return {
    overallStatus,
    overallSeverity,
    passed,
    warned,
    failed,
    skipped,
    info,
    total: checks.length
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🔒 Starting comprehensive security checks...\n');
  
  const checks = [];
  
  // Run all security checks
  checks.push(runNpmAudit());
  checks.push(checkOutdatedDependencies());
  checks.push(runEslintSecurityCheck());
  checks.push(checkSecurityHeaders());
  checks.push(checkLicenseCompliance());
  checks.push(scanForSecrets());
  checks.push(checkFrameworkCompliance());
  
  const summary = generateSecuritySummary(checks);
  
  // Output results as JSON
  const results = {
    timestamp: new Date().toISOString(),
    summary,
    checks
  };
  
  // Write to file for consumption by other scripts
  const outputPath = path.join(process.cwd(), 'security-check-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n✅ Security checks complete!');
  console.log(`Results written to: ${outputPath}`);
  console.log(`\nSummary: ${summary.passed} passed, ${summary.warned} warnings, ${summary.failed} failed, ${summary.skipped} skipped`);
  
  // Exit with non-zero if there are failures
  process.exit(summary.failed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
