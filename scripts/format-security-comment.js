#!/usr/bin/env node
/**
 * Format security check results into a condensed PR comment
 * 
 * This script reads the security check results JSON and formats it
 * into a GitHub-styled comment with buttons/badges similar to the
 * GH Pages build/deploy workflow.
 */

const fs = require('fs');
const path = require('path');

/**
 * Get status emoji and color
 */
function getStatusDisplay(status, severity) {
  switch (status) {
    case 'pass':
      return { emoji: '✅', color: 'brightgreen', circle: '🟢' };
    case 'fail':
      if (severity === 'critical') return { emoji: '❌', color: 'critical', circle: '🔴' };
      if (severity === 'high') return { emoji: '❌', color: 'red', circle: '🔴' };
      return { emoji: '❌', color: 'orange', circle: '🟠' };
    case 'warn':
      return { emoji: '⚠️', color: 'yellow', circle: '🟡' };
    case 'info':
      return { emoji: 'ℹ️', color: 'blue', circle: '🔵' };
    case 'skip':
      return { emoji: '⏭️', color: 'lightgrey', circle: '⚪' };
    default:
      return { emoji: '❓', color: 'lightgrey', circle: '⚪' };
  }
}

/**
 * Generate badge URL
 */
function generateBadgeUrl(label, message, color) {
  const encodedLabel = encodeURIComponent(label);
  const encodedMessage = encodeURIComponent(message);
  return `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${color}?style=flat-square`;
}

/**
 * Format security check results as PR comment
 */
function formatSecurityComment(results) {
  const { timestamp, summary, checks } = results;
  
  // Overall status badge
  let overallColor = 'brightgreen';
  let overallLabel = 'SECURE';
  
  if (summary.overallStatus === 'fail') {
    overallColor = summary.overallSeverity === 'critical' ? 'critical' : 'red';
    overallLabel = 'ISSUES FOUND';
  } else if (summary.overallStatus === 'warn') {
    overallColor = 'yellow';
    overallLabel = 'WARNINGS';
  }
  
  const overallBadge = generateBadgeUrl('Security Status', overallLabel, overallColor);
  
  // Build comment
  let comment = `## 🔒 Security Check Report\n\n`;
  comment += `![Security Status](${overallBadge})\n\n`;
  
  // Summary line with circles
  const summaryParts = [];
  if (summary.passed > 0) summaryParts.push(`🟢 ${summary.passed} passed`);
  if (summary.warned > 0) summaryParts.push(`🟡 ${summary.warned} warnings`);
  if (summary.failed > 0) summaryParts.push(`🔴 ${summary.failed} failed`);
  if (summary.skipped > 0) summaryParts.push(`⚪ ${summary.skipped} skipped`);
  
  comment += `**${summaryParts.join(' • ')}**\n\n`;
  
  // Individual check results in compact format
  comment += `### Security Checks\n\n`;
  comment += `<table>\n`;
  comment += `<tr><th>Check</th><th>Status</th><th>Details</th></tr>\n`;
  
  checks.forEach(check => {
    const display = getStatusDisplay(check.status, check.severity);
    const statusBadge = generateBadgeUrl(check.name, check.status.toUpperCase(), display.color);
    
    comment += `<tr>`;
    comment += `<td><strong>${check.name}</strong></td>`;
    comment += `<td align="center">${display.circle}</td>`;
    comment += `<td>${check.summary}</td>`;
    comment += `</tr>\n`;
  });
  
  comment += `</table>\n\n`;
  
  // Detailed findings for failed/warned checks
  const criticalChecks = checks.filter(c => c.status === 'fail' || c.status === 'warn');
  
  if (criticalChecks.length > 0) {
    comment += `### 🔍 Action Items\n\n`;
    
    criticalChecks.forEach(check => {
      const display = getStatusDisplay(check.status, check.severity);
      comment += `<details>\n`;
      comment += `<summary>${display.emoji} <strong>${check.name}</strong> - ${check.summary}</summary>\n\n`;
      
      if (check.details && Object.keys(check.details).length > 0) {
        comment += `**Details:**\n`;
        const details = check.details;
        
        // Format details based on check type
        if (check.id === 'npm-audit' && details.total > 0) {
          comment += `- Critical: ${details.critical}\n`;
          comment += `- High: ${details.high}\n`;
          comment += `- Moderate: ${details.moderate}\n`;
          comment += `- Low: ${details.low}\n`;
        } else if (check.id === 'outdated-deps' && details.criticalPackages?.length > 0) {
          comment += `Major version updates needed for:\n`;
          details.criticalPackages.forEach(pkg => {
            comment += `- \`${pkg}\`\n`;
          });
        } else if (check.id === 'eslint-security' && details.securityIssues > 0) {
          comment += `- Security issues: ${details.securityIssues}\n`;
          comment += `- Errors: ${details.errors}\n`;
          comment += `- Warnings: ${details.warnings}\n`;
        } else if (check.id === 'secret-scan' && details.findings?.length > 0) {
          comment += `Potential secrets found in:\n`;
          details.findings.forEach(finding => {
            comment += `- \`${finding.file}\` (${finding.type})\n`;
          });
        } else if (check.id === 'license-check' && details.issues?.length > 0) {
          comment += `Packages with restrictive licenses:\n`;
          details.issues.forEach(issue => {
            comment += `- \`${issue.name}\` (${issue.license})\n`;
          });
        }
      }
      
      if (check.recommendation) {
        comment += `\n**Recommendation:** ${check.recommendation}\n`;
      }
      
      comment += `\n</details>\n\n`;
    });
  }
  
  // Footer with additional info
  comment += `---\n\n`;
  
  if (summary.overallStatus === 'pass') {
    comment += `### ✅ Security Status: CLEAN\n\n`;
    comment += `All security checks passed successfully. Your changes maintain the security posture of the project.\n`;
  } else if (summary.overallStatus === 'warn') {
    comment += `### ⚠️ Security Status: WARNINGS\n\n`;
    comment += `Some security warnings were detected. Please review the action items above.\n`;
  } else {
    comment += `### ❌ Security Status: ACTION REQUIRED\n\n`;
    comment += `Security issues were detected that need to be addressed before merging.\n`;
  }
  
  comment += `\n*Last checked: ${new Date(timestamp).toUTCString()}*\n`;
  
  return comment;
}

/**
 * Generate condensed status for PR comment marker
 */
function generateCondensedStatus(results) {
  const { summary } = results;
  
  // Create compact status line
  const parts = [];
  if (summary.passed > 0) parts.push(`${summary.passed}✅`);
  if (summary.warned > 0) parts.push(`${summary.warned}⚠️`);
  if (summary.failed > 0) parts.push(`${summary.failed}❌`);
  
  return parts.join(' ');
}

/**
 * Main execution
 */
function main() {
  const resultsPath = process.argv[2] || path.join(process.cwd(), 'security-check-results.json');
  
  if (!fs.existsSync(resultsPath)) {
    console.error(`Error: Security check results not found at ${resultsPath}`);
    console.error('Run run-security-checks.js first to generate results.');
    process.exit(1);
  }
  
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const comment = formatSecurityComment(results);
  
  // Output formatted comment
  console.log(comment);
  
  // Also write to file for easy consumption
  const outputPath = path.join(process.cwd(), 'security-comment.md');
  fs.writeFileSync(outputPath, comment);
  
  console.error(`\n✅ Formatted comment written to: ${outputPath}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { formatSecurityComment, generateCondensedStatus };
