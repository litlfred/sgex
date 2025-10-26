#!/usr/bin/env node
/**
 * Bundle Size Checker
 * 
 * Checks that bundle sizes don't exceed defined thresholds.
 * Helps enforce bundle size budgets and catch regressions early.
 * 
 * Usage:
 *   node scripts/check-bundle-size.js
 * 
 * Exit codes:
 *   0 - All bundles within size limits
 *   1 - One or more bundles exceed size limits
 */

const fs = require('fs');
const path = require('path');

// Bundle size budgets (in bytes)
const SIZE_LIMITS = {
  // Main bundle should stay under 300 KB (compressed ~100 KB)
  main: 300 * 1024,
  
  // Individual chunks should stay under 1 MB (compressed ~300 KB)  
  chunk: 1 * 1024 * 1024,
  
  // Total JS size warning threshold: 8 MB
  totalWarning: 8 * 1024 * 1024,
  
  // Total JS size error threshold: 10 MB
  totalError: 10 * 1024 * 1024,
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function checkBundleSize() {
  const buildDir = path.join(__dirname, '..', 'build', 'static', 'js');
  
  if (!fs.existsSync(buildDir)) {
    console.error(`${colors.red}❌ Build directory not found: ${buildDir}${colors.reset}`);
    console.error('Run "npm run build" first');
    return 1;
  }

  const files = fs.readdirSync(buildDir);
  const jsFiles = files.filter(f => f.endsWith('.js') && !f.endsWith('.map'));
  
  if (jsFiles.length === 0) {
    console.error(`${colors.red}❌ No JavaScript files found in build directory${colors.reset}`);
    return 1;
  }

  console.log(`${colors.cyan}${colors.bold}Bundle Size Check${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);

  let totalSize = 0;
  let hasErrors = false;
  const violations = [];
  const mainBundles = [];
  const chunks = [];

  // Analyze all JS files
  jsFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalSize += size;

    const isMainBundle = file.startsWith('main.');
    const isChunk = file.includes('.chunk.');
    
    if (isMainBundle) {
      mainBundles.push({ file, size });
    } else if (isChunk) {
      chunks.push({ file, size });
    }
  });

  // Check main bundle
  console.log(`${colors.bold}Main Bundle:${colors.reset}`);
  if (mainBundles.length === 0) {
    console.log(`  ${colors.yellow}⚠  No main bundle found${colors.reset}\n`);
  } else {
    mainBundles.forEach(({ file, size }) => {
      const status = size > SIZE_LIMITS.main 
        ? `${colors.red}❌ EXCEEDS LIMIT${colors.reset}`
        : `${colors.green}✅ OK${colors.reset}`;
      const sizeStr = formatSize(size);
      const limitStr = formatSize(SIZE_LIMITS.main);
      
      console.log(`  ${file}`);
      console.log(`  Size: ${sizeStr} / ${limitStr} ${status}`);
      
      if (size > SIZE_LIMITS.main) {
        const overage = size - SIZE_LIMITS.main;
        console.log(`  ${colors.red}Exceeds limit by ${formatSize(overage)}${colors.reset}`);
        violations.push({
          file,
          size,
          limit: SIZE_LIMITS.main,
          type: 'main bundle'
        });
        hasErrors = true;
      }
    });
    console.log('');
  }

  // Check chunks
  console.log(`${colors.bold}Chunks:${colors.reset}`);
  const largeChunks = chunks.filter(c => c.size > SIZE_LIMITS.chunk);
  const okChunks = chunks.filter(c => c.size <= SIZE_LIMITS.chunk);
  
  if (largeChunks.length > 0) {
    console.log(`  ${colors.red}❌ ${largeChunks.length} chunk(s) exceed size limit:${colors.reset}`);
    largeChunks
      .sort((a, b) => b.size - a.size)
      .forEach(({ file, size }) => {
        const overage = size - SIZE_LIMITS.chunk;
        console.log(`     ${file}: ${formatSize(size)} (exceeds by ${formatSize(overage)})`);
        violations.push({
          file,
          size,
          limit: SIZE_LIMITS.chunk,
          type: 'chunk'
        });
        hasErrors = true;
      });
  }
  
  if (okChunks.length > 0) {
    console.log(`  ${colors.green}✅ ${okChunks.length} chunk(s) within size limit${colors.reset}`);
    // Show largest 3 OK chunks
    const topOk = okChunks.sort((a, b) => b.size - a.size).slice(0, 3);
    if (topOk.length > 0) {
      console.log(`     Largest:`);
      topOk.forEach(({ file, size }) => {
        console.log(`     ${file}: ${formatSize(size)}`);
      });
    }
  }
  console.log('');

  // Check total size
  console.log(`${colors.bold}Total JavaScript:${colors.reset}`);
  console.log(`  Size: ${formatSize(totalSize)}`);
  
  if (totalSize > SIZE_LIMITS.totalError) {
    console.log(`  ${colors.red}❌ CRITICAL: Total size exceeds ${formatSize(SIZE_LIMITS.totalError)}${colors.reset}`);
    hasErrors = true;
  } else if (totalSize > SIZE_LIMITS.totalWarning) {
    console.log(`  ${colors.yellow}⚠  WARNING: Total size exceeds ${formatSize(SIZE_LIMITS.totalWarning)}${colors.reset}`);
  } else {
    console.log(`  ${colors.green}✅ OK${colors.reset}`);
  }
  console.log('');

  // Summary
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  
  if (hasErrors) {
    console.log(`${colors.red}${colors.bold}Bundle Size Check FAILED${colors.reset}`);
    console.log('');
    console.log(`${colors.yellow}Violations:${colors.reset}`);
    violations.forEach(({ file, size, limit, type }) => {
      const overage = size - limit;
      console.log(`  • ${file} (${type})`);
      console.log(`    ${formatSize(size)} exceeds ${formatSize(limit)} by ${formatSize(overage)}`);
    });
    console.log('');
    console.log(`${colors.cyan}Recommendations:${colors.reset}`);
    console.log('  1. Run "npm run analyze" to identify what\'s in large chunks');
    console.log('  2. Review BUNDLE_ANALYSIS_REPORT.md for optimization strategies');
    console.log('  3. Consider lazy loading, code splitting, or removing unused dependencies');
    console.log('');
    return 1;
  } else {
    console.log(`${colors.green}${colors.bold}✅ All bundles within size limits${colors.reset}`);
    console.log('');
    return 0;
  }
}

// Run the check
process.exit(checkBundleSize());
