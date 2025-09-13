/**
 * Global Teardown for Tutorial Generation
 * Cleans up after screen recording
 */

const fs = require('fs');
const path = require('path');

async function globalTeardown(config) {
  console.log('🧹 Cleaning up tutorial recording environment...');
  
  // Generate summary report
  const summaryReport = generateSummaryReport();
  
  const reportPath = path.join('test-results', 'tutorial-summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2));
  console.log(`  📄 Summary report saved: ${reportPath}`);
  
  // Log final statistics
  console.log('  📊 Final Statistics:');
  console.log(`    • Recordings created: ${summaryReport.recordings.count}`);
  console.log(`    • Total recording size: ${formatBytes(summaryReport.recordings.totalSize)}`);
  console.log(`    • Audio files: ${summaryReport.audio.count}`);
  console.log(`    • Total audio size: ${formatBytes(summaryReport.audio.totalSize)}`);
  console.log(`    • Videos processed: ${summaryReport.videos.count}`);
  console.log(`    • Total video size: ${formatBytes(summaryReport.videos.totalSize)}`);
  
  console.log('✅ Tutorial recording cleanup completed');
}

function generateSummaryReport() {
  const summary = {
    timestamp: new Date().toISOString(),
    environment: {
      baseURL: process.env.SGEX_BASE_URL || 'http://localhost:3000/sgex',
      videoWidth: parseInt(process.env.VIDEO_WIDTH) || 1280,
      videoHeight: parseInt(process.env.VIDEO_HEIGHT) || 720,
      recordVideo: process.env.RECORD_VIDEO === 'true',
      tutorialMode: process.env.TUTORIAL_MODE === 'true'
    },
    recordings: getDirectoryStats('recordings'),
    audio: getDirectoryStats('audio'),
    videos: getDirectoryStats('tutorials'),
    scripts: getDirectoryStats('scripts/playwright')
  };
  
  return summary;
}

function getDirectoryStats(dirPath) {
  const stats = { count: 0, totalSize: 0, files: [] };
  
  if (!fs.existsSync(dirPath)) {
    return stats;
  }
  
  function processDirectory(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item.name);
      
      if (item.isDirectory()) {
        processDirectory(itemPath);
      } else if (item.isFile()) {
        const fileStats = fs.statSync(itemPath);
        stats.count++;
        stats.totalSize += fileStats.size;
        stats.files.push({
          path: itemPath,
          size: fileStats.size,
          modified: fileStats.mtime.toISOString()
        });
      }
    }
  }
  
  processDirectory(dirPath);
  return stats;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = globalTeardown;