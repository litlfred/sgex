#!/usr/bin/env node
/**
 * Bundle Report JSON Generator
 * 
 * Generates a structured JSON report of bundle analysis results.
 * This report can be uploaded as an artifact and parsed by CI/CD systems.
 * 
 * Usage:
 *   node scripts/generate-bundle-report-json.js [output-file]
 * 
 * Default output: bundle-report.json
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_OUTPUT = 'bundle-report.json';

// Bundle size budgets (in bytes) - must match check-bundle-size.js
const SIZE_LIMITS = {
  main: 300 * 1024,
  chunk: 1 * 1024 * 1024,
  totalWarning: 8 * 1024 * 1024,
  totalError: 10 * 1024 * 1024,
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function analyzeBundleSize() {
  const buildDir = path.join(process.cwd(), 'build', 'static', 'js');
  
  if (!fs.existsSync(buildDir)) {
    return {
      error: 'Build directory not found',
      buildDir,
      timestamp: new Date().toISOString(),
    };
  }

  const files = fs.readdirSync(buildDir)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(buildDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      
      // Determine file type
      let type = 'other';
      let exceedsLimit = false;
      let limitBytes = null;
      
      if (file.includes('main')) {
        type = 'main';
        limitBytes = SIZE_LIMITS.main;
        exceedsLimit = size > SIZE_LIMITS.main;
      } else if (file.match(/^\d+\./)) {
        type = 'chunk';
        limitBytes = SIZE_LIMITS.chunk;
        exceedsLimit = size > SIZE_LIMITS.chunk;
      }
      
      return {
        name: file,
        size,
        sizeFormatted: formatSize(size),
        type,
        limit: limitBytes,
        limitFormatted: limitBytes ? formatSize(limitBytes) : null,
        exceedsLimit,
        overage: exceedsLimit && limitBytes ? size - limitBytes : 0,
        overageFormatted: exceedsLimit && limitBytes ? formatSize(size - limitBytes) : null,
      };
    })
    .sort((a, b) => b.size - a.size);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const violations = files.filter(f => f.exceedsLimit);
  
  const summary = {
    totalFiles: files.length,
    totalSize,
    totalSizeFormatted: formatSize(totalSize),
    mainBundles: files.filter(f => f.type === 'main').length,
    chunks: files.filter(f => f.type === 'chunk').length,
    violations: violations.length,
    passed: violations.length === 0 && totalSize <= SIZE_LIMITS.totalError,
    totalExceedsWarning: totalSize > SIZE_LIMITS.totalWarning,
    totalExceedsError: totalSize > SIZE_LIMITS.totalError,
  };

  return {
    timestamp: new Date().toISOString(),
    summary,
    limits: {
      main: SIZE_LIMITS.main,
      mainFormatted: formatSize(SIZE_LIMITS.main),
      chunk: SIZE_LIMITS.chunk,
      chunkFormatted: formatSize(SIZE_LIMITS.chunk),
      totalWarning: SIZE_LIMITS.totalWarning,
      totalWarningFormatted: formatSize(SIZE_LIMITS.totalWarning),
      totalError: SIZE_LIMITS.totalError,
      totalErrorFormatted: formatSize(SIZE_LIMITS.totalError),
    },
    files,
    violations: violations.map(v => ({
      name: v.name,
      size: v.size,
      sizeFormatted: v.sizeFormatted,
      limit: v.limit,
      limitFormatted: v.limitFormatted,
      overage: v.overage,
      overageFormatted: v.overageFormatted,
    })),
  };
}

function main() {
  const outputFile = process.argv[2] || DEFAULT_OUTPUT;
  
  console.log('📊 Generating bundle analysis JSON report...');
  
  const report = analyzeBundleSize();
  
  // Write JSON report
  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
  
  console.log(`✅ Bundle report written to: ${outputFile}`);
  
  if (report.error) {
    console.error(`❌ Error: ${report.error}`);
    process.exit(1);
  }
  
  console.log(`📦 Total files: ${report.summary.totalFiles}`);
  console.log(`📏 Total size: ${report.summary.totalSizeFormatted}`);
  console.log(`⚠️  Violations: ${report.summary.violations}`);
  
  if (!report.summary.passed) {
    console.log(`❌ Bundle size check failed`);
    process.exit(1);
  } else {
    console.log(`✅ Bundle size check passed`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeBundleSize, formatSize };
