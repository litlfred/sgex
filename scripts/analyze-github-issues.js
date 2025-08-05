#!/usr/bin/env node

/**
 * GitHub Issues & PRs Analysis for Test Case Generation
 * Analyzes GitHub issues and pull requests to identify potential bugs and generate test plans
 */

const fs = require('fs');
const path = require('path');

// Sample data based on recent issues and PRs from the repository
const issuesAndPRs = [
  {
    number: 110,
    title: "integrate testing QA repoert in github actions",
    type: "issue",
    labels: ["enhancement", "testing"],
    body: "there are a number of tests in the repo (e.g. under src/tests) that could be used as part of CI/CD process for this repo.",
    potentialBugs: ["Test coverage gaps", "CI/CD integration issues", "Report generation failures"],
    status: "open"
  },
  {
    number: 109,
    title: "Improve header visibility: update background color and subtitle styling",
    type: "pull_request",
    labels: ["ui", "styling"],
    body: "Updated header styling across all pages to improve visibility and readability",
    potentialBugs: ["Header visibility issues", "Inconsistent styling across pages", "Poor contrast"],
    status: "closed",
    merged: true
  },
  {
    number: 108,
    title: "improve header visibility",
    type: "issue",
    labels: ["ui", "bug"],
    body: "Logo text should stay white, WHO SMART Guidelines Exchange should be white, background should be rgb(4,11,118)",
    potentialBugs: ["Text visibility issues", "Color contrast problems", "Branding consistency"],
    status: "closed"
  },
  {
    number: 107,
    title: "duplicate get help on ladning page",
    type: "issue",
    labels: ["ui", "bug"],
    body: "help desk system appears twice, should only appear once in lower right",
    potentialBugs: ["Duplicate UI elements", "Help system positioning", "Component mounting issues"],
    status: "open"
  },
  {
    number: 106,
    title: "improve mascot appearance",
    type: "issue",
    labels: ["ui", "enhancement"],
    body: "mascot should use thought bubble instead of speech bubble, notification badge should be white",
    potentialBugs: ["Mascot styling issues", "Badge color inconsistency", "UI element theming"],
    status: "open"
  },
  {
    number: 102,
    title: "fix up get help bug reports",
    type: "issue",
    labels: ["bug", "help-system"],
    body: "bug report links should use templates, carry contextual information",
    potentialBugs: ["Bug reporting system failures", "Missing contextual data", "Template routing issues"],
    status: "closed"
  },
  {
    number: 104,
    title: "lost behaviour git help mascot",
    type: "issue",
    labels: ["regression", "help-system"],
    body: "get help mascot functionality seems to have reverted",
    potentialBugs: ["Feature regression", "Component state loss", "Help system initialization"],
    status: "closed"
  },
  {
    number: 98,
    title: "repository scanning performance issues",
    type: "issue", 
    labels: ["performance", "github-api"],
    body: "Repository scanning triggered every time user selects profile",
    potentialBugs: ["Performance degradation", "Excessive API calls", "Cache invalidation issues"],
    status: "open"
  },
  {
    number: 96,
    title: "background color inconsistencies across pages", 
    type: "issue",
    labels: ["ui", "consistency"],
    body: "Several pages using inconsistent background colors",
    potentialBugs: ["UI consistency issues", "Theme application failures", "CSS inheritance problems"],
    status: "closed"
  },
  {
    number: 94,
    title: "breadcrumb visibility issues",
    type: "issue",
    labels: ["ui", "accessibility"],
    body: "Breadcrumb links barely visible against blue background",
    potentialBugs: ["Accessibility issues", "Poor color contrast", "Navigation visibility"],
    status: "closed"
  },
  {
    number: 92,
    title: "white background on DAK selection page",
    type: "issue",
    labels: ["ui", "styling"],
    body: "DAK selection showing white background instead of blue gradient",
    potentialBugs: ["Styling inconsistencies", "CSS loading issues", "Component initialization"],
    status: "closed"
  },
  {
    number: 90,
    title: "WHO organization avatar display issues",
    type: "issue",
    labels: ["ui", "github-api"],
    body: "WHO organization displaying default avatar instead of logo",
    potentialBugs: ["Avatar loading failures", "API data staleness", "Image caching issues"],
    status: "closed"
  }
];

const analyzeIssuesForTestCases = () => {
  console.log('🔍 Analyzing GitHub Issues and PRs for Test Case Generation...');
  
  const analysis = {
    totalIssues: issuesAndPRs.length,
    categories: {},
    testCases: [],
    recommendations: []
  };

  // Categorize issues
  issuesAndPRs.forEach(item => {
    item.labels.forEach(label => {
      if (!analysis.categories[label]) {
        analysis.categories[label] = [];
      }
      analysis.categories[label].push(item);
    });

    // Generate test cases for each potential bug
    item.potentialBugs.forEach(bug => {
      const testCase = generateTestCase(item, bug);
      if (testCase) {
        analysis.testCases.push(testCase);
      }
    });
  });

  // Generate recommendations
  analysis.recommendations = generateRecommendations(analysis);

  return analysis;
};

const generateTestCase = (issue, potentialBug) => {
  const testCase = {
    issueNumber: issue.number,
    title: issue.title,
    bugDescription: potentialBug,
    priority: determinePriority(issue, potentialBug),
    testPlan: generateTestPlan(issue, potentialBug),
    relevantCode: identifyRelevantCode(issue, potentialBug),
    currentlyRelevant: checkCurrentRelevance(issue, potentialBug)
  };

  return testCase;
};

const determinePriority = (issue, bug) => {
  // High priority for accessibility, security, and core functionality
  if (bug.includes('accessibility') || bug.includes('security') || 
      issue.labels.includes('regression') || issue.labels.includes('bug')) {
    return 'High';
  }
  
  // Medium priority for UI consistency and performance
  if (issue.labels.includes('ui') || issue.labels.includes('performance')) {
    return 'Medium';
  }
  
  return 'Low';
};

const generateTestPlan = (issue, bug) => {
  const plans = {
    'Header visibility issues': `
1. **Component Rendering Test**
   - Verify header component renders with correct background color
   - Test text color contrast ratios meet WCAG standards
   - Validate responsive behavior across screen sizes

2. **Visual Regression Test**
   - Compare header appearance against baseline screenshots
   - Test on multiple browsers (Chrome, Firefox, Safari)
   - Verify consistency across all pages

3. **Accessibility Test**
   - Run automated accessibility checks
   - Test with screen readers
   - Verify keyboard navigation`,

    'Duplicate UI elements': `
1. **Component Mounting Test**
   - Verify help system appears only once per page
   - Test component cleanup on page navigation
   - Check for memory leaks with repeated mounting

2. **DOM Structure Test**
   - Assert single instance of help mascot in DOM
   - Verify correct positioning (lower right)
   - Test z-index and overlay behavior`,

    'Performance degradation': `
1. **API Call Monitoring**
   - Track number of GitHub API requests per user action
   - Verify caching prevents unnecessary rescanning
   - Test with network throttling

2. **User Experience Test**
   - Measure page load times with repository scanning
   - Test cache hit/miss scenarios
   - Verify smooth user experience during scanning`,

    'UI consistency issues': `
1. **Theme Application Test**
   - Verify blue gradient background on all pages
   - Test WHO branding consistency
   - Check color palette adherence

2. **Cross-Page Consistency**
   - Compare styling across all components
   - Test navigation state preservation
   - Verify responsive design consistency`,

    'Feature regression': `
1. **Regression Detection Test**
   - Test help mascot functionality after updates
   - Verify all help topics are accessible
   - Check contextual help content loading

2. **Integration Test**
   - Test help system with different user states
   - Verify bug reporting functionality
   - Test modal interactions`
  };

  // Find matching test plan or generate generic one
  for (const [key, plan] of Object.entries(plans)) {
    if (bug.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(bug.toLowerCase())) {
      return plan.trim();
    }
  }

  // Generic test plan
  return `
1. **Unit Test**
   - Test component behavior related to: ${bug}
   - Verify expected vs actual behavior
   - Test edge cases and error conditions

2. **Integration Test**
   - Test functionality in realistic user scenarios
   - Verify interaction with other components
   - Test with different data states

3. **User Acceptance Test**
   - Validate fix resolves user-reported issue
   - Test accessibility and usability
   - Verify no negative side effects`.trim();
};

const identifyRelevantCode = (issue, bug) => {
  const codeMapping = {
    'header': ['src/components/LandingPage.js', 'src/components/*/header sections', '**/*.css files with header styles'],
    'help': ['src/components/ContextualHelpMascot.js', 'src/components/HelpModal.js', 'src/services/helpContentService.js'],
    'mascot': ['src/components/ContextualHelpMascot.js', 'src/components/HelpModal.js'],
    'background': ['**/*.css files', 'src/components/*/background styles'],
    'api': ['src/services/githubService.js', 'src/services/repositoryCacheService.js'],
    'performance': ['src/services/githubService.js', 'src/services/repositoryCacheService.js'],
    'ui': ['src/components/**/*.js', 'src/components/**/*.css'],
    'avatar': ['src/services/githubService.js', 'src/components/OrganizationSelection.js'],
    'breadcrumb': ['src/components/*/breadcrumb sections', '**/*.css breadcrumb styles'],
    'styling': ['**/*.css', 'Theme-related components']
  };

  const relevantFiles = [];
  
  Object.keys(codeMapping).forEach(keyword => {
    if (bug.toLowerCase().includes(keyword) || 
        issue.title.toLowerCase().includes(keyword) ||
        issue.body.toLowerCase().includes(keyword)) {
      relevantFiles.push(...codeMapping[keyword]);
    }
  });

  return relevantFiles.length > 0 ? [...new Set(relevantFiles)] : ['Needs investigation'];
};

const checkCurrentRelevance = (issue, bug) => {
  // Issues that are closed/merged are likely still relevant for testing
  if (issue.status === 'closed' && issue.merged) {
    return {
      relevant: true,
      reason: 'Recently fixed - tests needed to prevent regression'
    };
  }
  
  if (issue.status === 'open') {
    return {
      relevant: true, 
      reason: 'Active issue - tests needed to validate fix'
    };
  }

  // Check for common indicators of relevance
  const stillRelevantKeywords = ['ui', 'styling', 'performance', 'accessibility', 'bug'];
  const hasRelevantKeywords = issue.labels.some(label => 
    stillRelevantKeywords.includes(label.toLowerCase())
  );

  return {
    relevant: hasRelevantKeywords,
    reason: hasRelevantKeywords ? 
      'Core functionality - likely still relevant' : 
      'May need verification of current relevance'
  };
};

const generateRecommendations = (analysis) => {
  const recommendations = [];

  // Analyze most common categories
  const categoryCount = Object.keys(analysis.categories).map(cat => ({
    category: cat,
    count: analysis.categories[cat].length
  })).sort((a, b) => b.count - a.count);

  // High-priority recommendations
  if (categoryCount.find(c => c.category === 'ui')?.count > 3) {
    recommendations.push({
      priority: 'High',
      category: 'UI Testing',
      recommendation: 'Implement visual regression testing to catch UI inconsistencies early',
      rationale: 'Multiple UI-related issues indicate need for automated visual testing'
    });
  }

  if (categoryCount.find(c => c.category === 'bug')?.count > 2) {
    recommendations.push({
      priority: 'High',
      category: 'Regression Testing',
      recommendation: 'Add comprehensive regression test suite to prevent feature reversions',
      rationale: 'Multiple regression bugs suggest insufficient testing of existing functionality'
    });
  }

  if (categoryCount.find(c => c.category === 'performance')?.count > 0) {
    recommendations.push({
      priority: 'Medium',
      category: 'Performance Testing',
      recommendation: 'Implement performance monitoring and testing for GitHub API interactions',
      rationale: 'Performance issues with API calls need ongoing monitoring'
    });
  }

  // General recommendations
  recommendations.push({
    priority: 'Medium',
    category: 'Test Coverage',
    recommendation: 'Focus testing on WHO branding and styling consistency',
    rationale: 'Multiple issues related to visual consistency and branding'
  });

  recommendations.push({
    priority: 'Low',
    category: 'Documentation',
    recommendation: 'Create visual style guide with automated tests',
    rationale: 'Prevent future styling inconsistencies through clear guidelines'
  });

  return recommendations;
};

const generateReport = () => {
  const analysis = analyzeIssuesForTestCases();
  
  const report = `# GitHub Issues Analysis for Test Case Generation

## Summary

- **Total Issues/PRs Analyzed**: ${analysis.totalIssues}
- **Test Cases Generated**: ${analysis.testCases.length}
- **High Priority Test Cases**: ${analysis.testCases.filter(tc => tc.priority === 'High').length}

## Test Cases by Priority

### High Priority
${analysis.testCases
  .filter(tc => tc.priority === 'High')
  .map(tc => `
#### Issue #${tc.issueNumber}: ${tc.title}
**Bug**: ${tc.bugDescription}
**Relevance**: ${tc.currentlyRelevant.relevant ? '✅' : '❌'} - ${tc.currentlyRelevant.reason}
**Code Areas**: ${tc.relevantCode.join(', ')}

**Test Plan**:
${tc.testPlan}
`).join('\n---\n')}

### Medium Priority
${analysis.testCases
  .filter(tc => tc.priority === 'Medium')
  .map(tc => `
#### Issue #${tc.issueNumber}: ${tc.title}
**Bug**: ${tc.bugDescription}
**Relevance**: ${tc.currentlyRelevant.relevant ? '✅' : '❌'} - ${tc.currentlyRelevant.reason}
**Code Areas**: ${tc.relevantCode.join(', ')}
`).join('\n')}

## Recommendations

${analysis.recommendations.map(rec => `
### ${rec.priority} Priority: ${rec.category}
${rec.recommendation}

*Rationale*: ${rec.rationale}
`).join('\n')}

## Category Analysis

${Object.entries(analysis.categories)
  .sort(([,a], [,b]) => b.length - a.length)
  .map(([category, items]) => `- **${category}**: ${items.length} issues`)
  .join('\n')}

## Implementation Priority

1. **Immediate**: Add visual regression tests for UI consistency
2. **Short-term**: Implement comprehensive help system testing
3. **Medium-term**: Add performance monitoring for GitHub API calls
4. **Long-term**: Create automated accessibility testing pipeline

---

*Generated by SGEX QA Analysis System*
*Last updated: ${new Date().toISOString()}*
`;

  return report;
};

// Generate and save the analysis report
const generateAnalysisReport = () => {
  console.log('📊 Generating Issues Analysis Report...');
  
  const report = generateReport();
  
  // Ensure docs directory exists
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Write the analysis report
  const reportPath = path.join(docsDir, 'github-issues-analysis.md');
  fs.writeFileSync(reportPath, report);

  console.log(`✅ Issues Analysis Report generated: ${reportPath}`);
  return reportPath;
};

if (require.main === module) {
  generateAnalysisReport();
}

module.exports = { generateAnalysisReport, analyzeIssuesForTestCases };