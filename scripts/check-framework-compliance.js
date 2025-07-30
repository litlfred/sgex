#!/usr/bin/env node

/**
 * Framework Compliance Check Script
 * 
 * This script checks the project for compliance with WHO SMART Guidelines framework standards.
 * It validates code structure, documentation, and adherence to established patterns.
 * 
 * Usage: node scripts/check-framework-compliance.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Framework Compliance Check...');

// Track compliance results
const results = {
  checks: [],
  errors: [],
  warnings: [],
  passed: 0,
  failed: 0,
  score: 0
};

function addCheck(name, status, message, level = 'info') {
  const check = { name, status, message, level };
  results.checks.push(check);
  
  if (status === 'pass') {
    results.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else if (status === 'fail') {
    results.failed++;
    results.errors.push({ name, message });
    console.log(`❌ ${name}: ${message}`);
  } else if (status === 'warn') {
    results.warnings.push({ name, message });
    console.log(`⚠️ ${name}: ${message}`);
  }
}

// Project root
const projectRoot = path.join(__dirname, '..');

console.log('\n📋 Checking Project Structure...');

// Check 1: Essential directories exist
const requiredDirs = ['src', 'public', 'docs', 'scripts'];
requiredDirs.forEach(dir => {
  const dirPath = path.join(projectRoot, dir);
  if (fs.existsSync(dirPath)) {
    addCheck('Directory Structure', 'pass', `${dir}/ directory exists`);
  } else {
    addCheck('Directory Structure', 'fail', `Missing required directory: ${dir}/`);
  }
});

// Check 2: Essential files exist
const requiredFiles = [
  'package.json',
  'README.md',
  'src/App.js',
  'src/index.js',
  'public/index.html'
];

requiredFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    addCheck('Required Files', 'pass', `${file} exists`);
  } else {
    addCheck('Required Files', 'fail', `Missing required file: ${file}`);
  }
});

console.log('\n📚 Checking Documentation...');

// Check 3: Documentation files
const docFiles = [
  'docs/README.md',
  'docs/requirements.md',
  'docs/solution-architecture.md'
];

docFiles.forEach(file => {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.length > 100) {
      addCheck('Documentation', 'pass', `${file} exists and has content`);
    } else {
      addCheck('Documentation', 'warn', `${file} exists but is very short`);
    }
  } else {
    addCheck('Documentation', 'warn', `Recommended documentation missing: ${file}`);
  }
});

console.log('\n🏗️ Checking Code Structure...');

// Check 4: React components structure
const componentsDir = path.join(projectRoot, 'src', 'components');
if (fs.existsSync(componentsDir)) {
  const components = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
  if (components.length > 0) {
    addCheck('Components', 'pass', `Found ${components.length} component files`);
    
    // Check for key components
    const keyComponents = ['LandingPage.js', 'DAKDashboard.js', 'BPMNEditor.js'];
    keyComponents.forEach(comp => {
      if (components.includes(comp)) {
        addCheck('Key Components', 'pass', `${comp} exists`);
      } else {
        addCheck('Key Components', 'warn', `Key component missing: ${comp}`);
      }
    });
  } else {
    addCheck('Components', 'fail', 'No React components found');
  }
} else {
  addCheck('Components', 'fail', 'Components directory missing');
}

// Check 5: Services structure
const servicesDir = path.join(projectRoot, 'src', 'services');
if (fs.existsSync(servicesDir)) {
  const services = fs.readdirSync(servicesDir).filter(f => f.endsWith('.js'));
  addCheck('Services', 'pass', `Found ${services.length} service files`);
  
  // Check for GitHub service (important for SGEX)
  if (services.includes('githubService.js')) {
    addCheck('GitHub Integration', 'pass', 'GitHub service exists');
  } else {
    addCheck('GitHub Integration', 'warn', 'GitHub service missing');
  }
} else {
  addCheck('Services', 'warn', 'Services directory missing');
}

console.log('\n🔧 Checking Configuration...');

// Check 6: Package.json validation
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check required fields
    if (packageJson.name) {
      addCheck('Package Config', 'pass', 'Package name defined');
    } else {
      addCheck('Package Config', 'fail', 'Package name missing');
    }
    
    if (packageJson.version) {
      addCheck('Package Config', 'pass', 'Version defined');
    } else {
      addCheck('Package Config', 'fail', 'Version missing');
    }
    
    // Check for React dependencies
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps.react) {
      addCheck('React Framework', 'pass', 'React dependency found');
    } else {
      addCheck('React Framework', 'fail', 'React dependency missing');
    }
    
    // Check for testing setup
    if (deps['@testing-library/react'] || deps.jest) {
      addCheck('Testing Setup', 'pass', 'Testing libraries found');
    } else {
      addCheck('Testing Setup', 'warn', 'Testing libraries missing');
    }
    
    // Check for WHO-specific dependencies
    if (deps['bpmn-js']) {
      addCheck('BPMN Support', 'pass', 'BPMN.js library found');
    } else {
      addCheck('BPMN Support', 'warn', 'BPMN.js library missing');
    }
    
    if (deps['@octokit/rest']) {
      addCheck('GitHub API', 'pass', 'Octokit library found');
    } else {
      addCheck('GitHub API', 'warn', 'Octokit library missing');
    }
    
  } catch (error) {
    addCheck('Package Config', 'fail', 'package.json is invalid JSON');
  }
} else {
  addCheck('Package Config', 'fail', 'package.json missing');
}

console.log('\n🌐 Checking Internationalization...');

// Check 7: i18n support
const i18nFile = path.join(projectRoot, 'src', 'i18n.js');
if (fs.existsSync(i18nFile)) {
  addCheck('Internationalization', 'pass', 'i18n configuration exists');
} else {
  addCheck('Internationalization', 'warn', 'i18n configuration missing');
}

const localesDir = path.join(projectRoot, 'locales');
if (fs.existsSync(localesDir)) {
  const locales = fs.readdirSync(localesDir);
  if (locales.length > 0) {
    addCheck('Translation Files', 'pass', `Found ${locales.length} locale directories`);
  } else {
    addCheck('Translation Files', 'warn', 'No translation files found');
  }
} else {
  addCheck('Translation Files', 'warn', 'Locales directory missing');
}

console.log('\n🚀 Checking Deployment Configuration...');

// Check 8: GitHub workflows
const workflowsDir = path.join(projectRoot, '.github', 'workflows');
if (fs.existsSync(workflowsDir)) {
  const workflows = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  if (workflows.length > 0) {
    addCheck('CI/CD Setup', 'pass', `Found ${workflows.length} workflow files`);
    
    // Check for pages workflow
    const hasPages = workflows.some(w => w.includes('pages'));
    if (hasPages) {
      addCheck('Pages Deployment', 'pass', 'GitHub Pages workflow found');
    } else {
      addCheck('Pages Deployment', 'warn', 'GitHub Pages workflow missing');
    }
  } else {
    addCheck('CI/CD Setup', 'warn', 'No workflow files found');
  }
} else {
  addCheck('CI/CD Setup', 'warn', 'No GitHub workflows directory');
}

console.log('\n🔒 Checking Security & Best Practices...');

// Check 9: Gitignore
const gitignorePath = path.join(projectRoot, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('node_modules')) {
    addCheck('Security', 'pass', '.gitignore excludes node_modules');
  } else {
    addCheck('Security', 'warn', '.gitignore should exclude node_modules');
  }
  
  if (gitignoreContent.includes('build')) {
    addCheck('Security', 'pass', '.gitignore excludes build directory');
  } else {
    addCheck('Security', 'warn', '.gitignore should exclude build directory');
  }
} else {
  addCheck('Security', 'warn', '.gitignore file missing');
}

// Check 10: License
const licenseFiles = ['LICENSE', 'LICENSE.md', 'LICENSE.txt'];
const hasLicense = licenseFiles.some(file => fs.existsSync(path.join(projectRoot, file)));
if (hasLicense) {
  addCheck('Legal', 'pass', 'License file found');
} else {
  addCheck('Legal', 'warn', 'License file missing');
}

console.log('\n📊 Calculating Compliance Score...');

// Calculate compliance score
const totalChecks = results.passed + results.failed;
if (totalChecks > 0) {
  results.score = Math.round((results.passed / totalChecks) * 100);
}

console.log('\n' + '='.repeat(60));
console.log('📋 FRAMEWORK COMPLIANCE REPORT');
console.log('='.repeat(60));
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️ Warnings: ${results.warnings.length}`);
console.log(`📊 Compliance Score: ${results.score}%`);

if (results.score >= 90) {
  console.log('🎉 Excellent! Framework compliance is very high.');
} else if (results.score >= 70) {
  console.log('👍 Good! Framework compliance is acceptable.');
} else if (results.score >= 50) {
  console.log('⚠️ Fair! Some framework compliance issues need attention.');
} else {
  console.log('🚨 Poor! Significant framework compliance issues detected.');
}

// Show critical errors
if (results.errors.length > 0) {
  console.log('\n🚨 Critical Issues:');
  results.errors.forEach(error => {
    console.log(`   • ${error.name}: ${error.message}`);
  });
}

// Show warnings
if (results.warnings.length > 0 && results.warnings.length <= 5) {
  console.log('\n⚠️ Warnings:');
  results.warnings.forEach(warning => {
    console.log(`   • ${warning.name}: ${warning.message}`);
  });
} else if (results.warnings.length > 5) {
  console.log(`\n⚠️ ${results.warnings.length} warnings found (see detailed output above)`);
}

console.log('\n📋 Recommendations:');
if (results.failed > 0) {
  console.log('   1. Address all critical errors first');
}
if (results.warnings.length > 3) {
  console.log('   2. Review and address warnings to improve compliance');
}
if (results.score < 80) {
  console.log('   3. Focus on project structure and documentation improvements');
}
console.log('   4. Regularly run compliance checks during development');
console.log('   5. Follow WHO SMART Guidelines technical specifications');

console.log('\n' + '='.repeat(60));

// Exit with appropriate code
// For compliance checking, we want to pass if score is reasonable
// but still show issues for improvement
if (results.score >= 60) {
  console.log('✅ Framework compliance check completed');
  process.exit(0);
} else {
  console.log('❌ Framework compliance check failed - score too low');
  process.exit(1);
}