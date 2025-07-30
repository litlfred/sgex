#!/usr/bin/env node

/**
 * GitHub Issues Analysis Script
 * 
 * This script analyzes GitHub issues and generates insights for testing and quality assurance.
 * It can work with or without GitHub API access, providing static recommendations when offline.
 * 
 * Usage: node scripts/analyze-github-issues.js
 * Output: docs/github-issues-analysis.md
 */

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

console.log('🔍 Starting GitHub Issues Analysis...');

// Configuration
const REPO_OWNER = 'litlfred';
const REPO_NAME = 'sgex';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Ensure docs directory exists
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

async function analyzeIssues() {
  let issuesData = [];
  let hasApiAccess = false;

  // Try to fetch issues from GitHub API
  if (GITHUB_TOKEN) {
    try {
      console.log('🌐 Fetching issues from GitHub API...');
      
      const octokit = new Octokit({
        auth: GITHUB_TOKEN,
      });

      // Fetch recent issues (open and closed)
      const response = await octokit.rest.issues.listForRepo({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        state: 'all',
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      });

      issuesData = response.data;
      hasApiAccess = true;
      console.log(`✅ Fetched ${issuesData.length} issues from GitHub`);
      
    } catch (error) {
      console.warn('⚠️ GitHub API access failed:', error.message);
      console.log('📝 Generating static analysis instead...');
    }
  } else {
    console.log('🔧 No GitHub token provided, generating static analysis...');
  }

// Generate timestamp
const timestamp = new Date().toISOString();
const formattedDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC'
});

// Analyze issues if we have API data
let analysisResults = {
  totalIssues: 0,
  openIssues: 0,
  closedIssues: 0,
  bugReports: 0,
  featureRequests: 0,
  documentation: 0,
  testingOpportunities: [],
  priorityIssues: [],
  recentActivity: [],
  labelStats: {},
  recommendations: []
};

if (hasApiAccess && issuesData.length > 0) {
  console.log('📊 Analyzing issue data...');
  
  // Basic statistics
  analysisResults.totalIssues = issuesData.length;
  analysisResults.openIssues = issuesData.filter(issue => issue.state === 'open').length;
  analysisResults.closedIssues = issuesData.filter(issue => issue.state === 'closed').length;
  
  // Categorize issues by labels
  const allLabels = [];
  issuesData.forEach(issue => {
    if (issue.labels) {
      issue.labels.forEach(label => {
        allLabels.push(label.name.toLowerCase());
      });
    }
  });
  
  // Count label frequencies
  allLabels.forEach(label => {
    analysisResults.labelStats[label] = (analysisResults.labelStats[label] || 0) + 1;
  });
  
  // Categorize by type
  analysisResults.bugReports = issuesData.filter(issue => 
    issue.labels.some(label => 
      label.name.toLowerCase().includes('bug') || 
      label.name.toLowerCase().includes('error') ||
      label.name.toLowerCase().includes('fix')
    )
  ).length;
  
  analysisResults.featureRequests = issuesData.filter(issue => 
    issue.labels.some(label => 
      label.name.toLowerCase().includes('enhancement') || 
      label.name.toLowerCase().includes('feature') ||
      label.name.toLowerCase().includes('improvement')
    )
  ).length;
  
  analysisResults.documentation = issuesData.filter(issue => 
    issue.labels.some(label => 
      label.name.toLowerCase().includes('documentation') || 
      label.name.toLowerCase().includes('docs')
    )
  ).length;
  
  // Find testing opportunities
  analysisResults.testingOpportunities = issuesData
    .filter(issue => issue.state === 'open')
    .filter(issue => 
      issue.title.toLowerCase().includes('test') ||
      issue.body?.toLowerCase().includes('test') ||
      issue.labels.some(label => 
        label.name.toLowerCase().includes('test') ||
        label.name.toLowerCase().includes('bug') ||
        label.name.toLowerCase().includes('qa')
      )
    )
    .slice(0, 10)
    .map(issue => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      labels: issue.labels.map(l => l.name),
      created: issue.created_at
    }));
  
  // Find priority/urgent issues
  analysisResults.priorityIssues = issuesData
    .filter(issue => issue.state === 'open')
    .filter(issue => 
      issue.labels.some(label => 
        label.name.toLowerCase().includes('urgent') ||
        label.name.toLowerCase().includes('critical') ||
        label.name.toLowerCase().includes('high priority') ||
        label.name.toLowerCase().includes('important')
      )
    )
    .slice(0, 5)
    .map(issue => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      labels: issue.labels.map(l => l.name),
      created: issue.created_at
    }));
  
  // Recent activity
  analysisResults.recentActivity = issuesData
    .slice(0, 10)
    .map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      updated: issue.updated_at,
      url: issue.html_url
    }));
}

// Generate recommendations based on analysis
const recommendations = [];

if (hasApiAccess) {
  if (analysisResults.bugReports > 0) {
    recommendations.push({
      type: 'testing',
      priority: 'high',
      title: 'Regression Testing',
      description: `${analysisResults.bugReports} bug reports found. Create regression tests to prevent similar issues.`
    });
  }
  
  if (analysisResults.featureRequests > 0) {
    recommendations.push({
      type: 'testing',
      priority: 'medium',
      title: 'Feature Testing',
      description: `${analysisResults.featureRequests} feature requests identified. Plan comprehensive testing for new features.`
    });
  }
  
  const openIssueRatio = analysisResults.totalIssues > 0 ? 
    (analysisResults.openIssues / analysisResults.totalIssues) * 100 : 0;
  
  if (openIssueRatio > 30) {
    recommendations.push({
      type: 'process',
      priority: 'medium',
      title: 'Issue Resolution',
      description: `${openIssueRatio.toFixed(1)}% of issues are open. Consider prioritizing issue resolution.`
    });
  }
} else {
  // Static recommendations when no API access
  recommendations.push(
    {
      type: 'testing',
      priority: 'high', 
      title: 'Core Functionality Testing',
      description: 'Implement comprehensive tests for BPMN editor, decision table editor, and DAK management features.'
    },
    {
      type: 'testing',
      priority: 'high',
      title: 'User Interface Testing',
      description: 'Create UI tests for critical user workflows including GitHub integration and file management.'
    },
    {
      type: 'testing',
      priority: 'medium',
      title: 'Integration Testing', 
      description: 'Test GitHub API integration, CORS handling, and multi-branch deployment functionality.'
    },
    {
      type: 'qa',
      priority: 'medium',
      title: 'Performance Testing',
      description: 'Establish performance benchmarks for large BPMN diagrams and decision tables.'
    },
    {
      type: 'qa',
      priority: 'low',
      title: 'Accessibility Testing',
      description: 'Ensure compliance with WHO accessibility standards and WCAG guidelines.'
    }
  );
}

analysisResults.recommendations = recommendations;

// Generate Markdown report
const markdownReport = `# GitHub Issues Analysis Report

**Generated:** ${formattedDate} UTC  
**Repository:** [${REPO_OWNER}/${REPO_NAME}](https://github.com/${REPO_OWNER}/${REPO_NAME})  
**Analysis Type:** ${hasApiAccess ? 'Live API Data' : 'Static Analysis'}

## 📊 Summary Statistics

${hasApiAccess ? `
| Metric | Count |
|--------|-------|
| Total Issues | ${analysisResults.totalIssues} |
| Open Issues | ${analysisResults.openIssues} |
| Closed Issues | ${analysisResults.closedIssues} |
| Bug Reports | ${analysisResults.bugReports} |
| Feature Requests | ${analysisResults.featureRequests} |
| Documentation Issues | ${analysisResults.documentation} |

### Issue State Distribution
- **Open:** ${analysisResults.openIssues} (${analysisResults.totalIssues > 0 ? ((analysisResults.openIssues / analysisResults.totalIssues) * 100).toFixed(1) : 0}%)
- **Closed:** ${analysisResults.closedIssues} (${analysisResults.totalIssues > 0 ? ((analysisResults.closedIssues / analysisResults.totalIssues) * 100).toFixed(1) : 0}%)
` : `
*Live GitHub data not available. Generating static recommendations based on project structure.*
`}

## 🎯 Testing Opportunities

${analysisResults.testingOpportunities.length > 0 ? `
The following issues present opportunities for improving test coverage:

${analysisResults.testingOpportunities.map(issue => `
### [#${issue.number}](${issue.url}) ${issue.title}
- **Labels:** ${issue.labels.join(', ') || 'None'}
- **Created:** ${new Date(issue.created).toLocaleDateString()}
`).join('')}
` : `
### Recommended Testing Areas

Based on the project structure, focus testing efforts on:

1. **BPMN Editor Component**
   - Test BPMN diagram creation, editing, and validation
   - Verify BPMN XML import/export functionality
   - Test integration with bpmn-js library

2. **Decision Table Editor**
   - Test decision table creation and rule management
   - Verify decision logic validation
   - Test export to various formats

3. **GitHub Integration**
   - Test repository selection and branch management
   - Verify file synchronization and conflict resolution
   - Test Personal Access Token authentication

4. **Multi-language Support**
   - Test internationalization (i18n) functionality
   - Verify language switching and content localization
   - Test translation file management
`}

${analysisResults.priorityIssues.length > 0 ? `
## 🚨 Priority Issues

High-priority issues that require immediate attention:

${analysisResults.priorityIssues.map(issue => `
### [#${issue.number}](${issue.url}) ${issue.title}
- **Labels:** ${issue.labels.join(', ')}
- **Created:** ${new Date(issue.created).toLocaleDateString()}
`).join('')}
` : ''}

${hasApiAccess && analysisResults.recentActivity.length > 0 ? `
## 📈 Recent Activity

Latest issue updates:

${analysisResults.recentActivity.map(issue => `
- [#${issue.number}](${issue.url}) **${issue.title}** (${issue.state}) - Updated ${new Date(issue.updated).toLocaleDateString()}
`).join('')}
` : ''}

${hasApiAccess && Object.keys(analysisResults.labelStats).length > 0 ? `
## 🏷️ Label Statistics

Most common issue labels:

${Object.entries(analysisResults.labelStats)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([label, count]) => `- **${label}:** ${count} issues`)
  .join('\n')}
` : ''}

## 🔧 QA Recommendations

### High Priority
${recommendations.filter(r => r.priority === 'high').map(r => `
- **${r.title}** (${r.type})
  ${r.description}
`).join('')}

### Medium Priority  
${recommendations.filter(r => r.priority === 'medium').map(r => `
- **${r.title}** (${r.type})
  ${r.description}
`).join('')}

### Low Priority
${recommendations.filter(r => r.priority === 'low').map(r => `
- **${r.title}** (${r.type})
  ${r.description}
`).join('')}

## 📋 Action Items

1. **Immediate Actions**
   - Review and address any critical/urgent open issues
   - Implement regression tests for recent bug fixes
   - Set up automated testing for core user workflows

2. **Short-term Goals**
   - Increase test coverage to 80%+
   - Implement integration tests for GitHub API interactions
   - Add performance benchmarks for large files

3. **Long-term Objectives**
   - Establish comprehensive end-to-end testing suite
   - Implement automated accessibility testing
   - Set up continuous monitoring and alerting

---

*This analysis was generated automatically by the SGEX Workbench QA system.*  
*For questions or suggestions, please [create an issue](https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new).*`;

// Write the analysis report
const reportPath = path.join(docsDir, 'github-issues-analysis.md');
fs.writeFileSync(reportPath, markdownReport, 'utf8');

console.log('✅ GitHub Issues Analysis completed!');
console.log(`📄 Report saved to: ${reportPath}`);

if (hasApiAccess) {
  console.log(`📊 Analyzed ${analysisResults.totalIssues} issues`);
  console.log(`🐛 Found ${analysisResults.bugReports} bug reports`);
  console.log(`💡 Found ${analysisResults.featureRequests} feature requests`);
} else {
  console.log('📝 Generated static recommendations for testing and QA');
}

console.log(`🎯 Generated ${recommendations.length} QA recommendations`);

// Always exit successfully - this is for reporting, not validation
process.exit(0);
}

// Run the analysis
analyzeIssues().catch(error => {
  console.error('❌ Analysis failed:', error.message);
  process.exit(1);
});