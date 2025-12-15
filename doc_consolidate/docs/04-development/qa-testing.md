# QA Testing Documentation

## Overview

The SGEX Workbench includes a comprehensive Quality Assurance (QA) testing system that automatically generates detailed reports on code quality, test coverage, and system reliability.

## Accessing the QA Report

The QA report is automatically generated during the CI/CD pipeline and is available on the deployed site at: **[/docs/qa-report.html](/docs/qa-report.html)**

> **Note**: The QA report is generated dynamically during deployment and is not committed to the repository to prevent infinite loops in the CI/CD pipeline. The report is always available on the live site after successful deployment.

## Report Generation Process

1. **Automated Generation**: The QA report is generated on every push to the main branch or pull request
2. **CI/CD Integration**: Generated as part of the GitHub Actions workflow (`.github/workflows/pages.yml`)
3. **Deployment Only**: The report files are created during build time and deployed to GitHub Pages but not committed to the repository
4. **Path Exclusion**: The workflow uses `paths-ignore` to prevent triggering when generated files would be committed

## What's Included in the QA Report

### 📊 Test Execution Summary
- **Total Tests**: Complete count of all automated tests
- **Passed Tests**: Number of tests that executed successfully
- **Failed Tests**: Number of tests that encountered issues
- **Pass Rate**: Percentage of tests that passed successfully

### 📈 Code Coverage Analysis
The report provides detailed code coverage metrics including:
- **Statements Coverage**: Percentage of code statements executed during testing
- **Branches Coverage**: Percentage of conditional branches tested
- **Functions Coverage**: Percentage of functions called during testing
- **Lines Coverage**: Percentage of code lines executed

### 🧪 Test File Breakdown
Detailed breakdown of each test file showing:
- Test file name and status
- Number of individual tests per file
- Pass/fail status for each test file

### 🔍 Compliance Analysis
Automated compliance checking ensures adherence to SGEX coding standards:
- **Page Framework Compliance**: Validates proper use of the page framework across all components
- **GitHub Service Compliance**: Ensures consistent GitHub API usage through githubService
- **Authentication Standards**: Verifies proper authentication handling and token management
- **API Integration**: Checks for direct API calls and enforces service layer usage

### 💡 Quality Recommendations
Automated recommendations for improving code quality based on:
- Coverage thresholds
- Test reliability metrics
- WHO SMART Guidelines compliance standards

## GitHub Service Compliance Testing

### Overview
The SGEX Workbench includes specialized compliance testing to ensure all components properly use the `githubService` for GitHub API operations instead of making direct API calls. This ensures consistent authentication, rate limiting, and error handling across the application.

### GitHub Service Compliance Rules

#### 1. No Direct GitHub API Calls
- **Rule**: Components must not make direct `fetch()` calls to `api.github.com`
- **Purpose**: Prevents inconsistent authentication and rate limit violations
- **Instead Use**: `githubService.getBranches()`, `githubService.getPullRequests()`, etc.

#### 2. Proper Authentication Handling  
- **Rule**: Use `githubService.isAuth()` instead of manual token checks
- **Purpose**: Centralized authentication state management
- **Instead of**: `localStorage.getItem('githubToken')` checks

#### 3. Consistent Error Handling
- **Rule**: Leverage githubService's built-in retry logic and error management
- **Purpose**: Graceful handling of GitHub API rate limits and network issues
- **Benefit**: Automatic retry logic and user-friendly error messages

#### 4. Rate Limit Management
- **Rule**: All GitHub operations must go through githubService
- **Purpose**: Automatic rate limit detection and backoff
- **Benefit**: Prevents 403 Forbidden errors and improves reliability

### Compliance Testing Process

#### Automated Detection
The compliance checker automatically scans all component files for:
- Direct `fetch()` calls to GitHub API endpoints
- Manual authentication token handling
- Hardcoded GitHub API URLs
- Missing githubService imports where needed

#### Test Integration
GitHub service compliance tests run as part of the main test suite:
```bash
npm test -- githubServiceCompliance.test.js
```

#### QA Report Integration
Compliance results appear in the QA report with:
- Overall compliance percentage
- Detailed breakdown by file
- Specific violations with line numbers
- Recommendations for fixes

### Components Fixed in Issue #705

The following components were updated to use githubService:
- **BranchListingPage.js**: Replaced direct PR and comment API calls
- **BranchListing.js**: Replaced direct branch/PR fetching and authentication

### Best Practices for Developers

#### When Adding GitHub Functionality
1. **Import githubService**: `import githubService from '../services/githubService';`
2. **Use Service Methods**: Replace direct API calls with service methods
3. **Handle Authentication**: Use `githubService.isAuth()` for auth checks
4. **Error Handling**: Rely on service-level error handling and user feedback

#### Service Method Examples
```javascript
// ✅ Correct - Using githubService
const branches = await githubService.getBranches(user, repo);
const prs = await githubService.getPullRequests(user, repo);
const isAuthenticated = githubService.isAuth();

// ❌ Incorrect - Direct API calls
const response = await fetch('https://api.github.com/repos/user/repo/branches');
const token = localStorage.getItem('githubToken');
```

### Monitoring and Maintenance

#### Continuous Compliance
- Compliance tests run on every push and PR
- QA reports show compliance trends over time
- Pre-commit hooks can prevent non-compliant code

#### Issue Prevention
- New components automatically checked for compliance
- Template components use githubService by default
- Code review guidelines emphasize service layer usage

---

*GitHub Service Compliance ensures reliable, consistent, and secure GitHub API integration across the SGEX Workbench.*

## Testing Philosophy

### WHO SMART Guidelines Compliance
All tests are designed to validate compliance with WHO SMART Guidelines standards, ensuring:
- Digital Adaptation Kit (DAK) component integrity
- FHIR resource validation
- Business process workflow compliance
- Data quality and consistency

### Test Categories

#### Unit Tests
- Component functionality testing
- Service layer validation
- Utility function verification

#### Integration Tests
- GitHub API integration testing
- End-to-end workflow validation
- Cross-component interaction testing

#### UI/UX Tests
- User interface component testing
- Accessibility compliance validation
- Cross-browser compatibility checks

## Continuous Quality Monitoring

### GitHub Actions Integration
The QA report generation is integrated into our GitHub Actions workflow:
1. **Triggered**: On every push to main branch and pull requests
2. **Execution**: Runs complete test suite with coverage analysis
3. **Generation**: Creates styled HTML report matching SGEX design
4. **Deployment**: Automatically published to GitHub Pages documentation

### Report Styling
The QA report follows the same design standards as the main SGEX application:
- WHO SMART Guidelines branding
- Consistent blue gradient background (`#0078d4` to `#005a9e`)
- Accessible typography and color contrast
- Responsive design for mobile and desktop viewing

## Understanding Test Results

### Coverage Thresholds
We aim for the following minimum coverage levels:
- **Statements**: 80% or higher
- **Branches**: 70% or higher
- **Functions**: 75% or higher
- **Lines**: 80% or higher

### Test Reliability
- **Pass Rate Target**: 95% or higher
- **Zero Tolerance**: Critical functionality must have 100% passing tests
- **Performance**: Tests should complete within reasonable time limits

## Contributing to Test Quality

### Adding New Tests
When contributing new features:
1. Write tests for new functionality
2. Ensure tests follow existing patterns
3. Verify tests pass locally before submitting PR
4. Update test documentation as needed

### Test File Locations
- **Unit Tests**: `src/tests/`
- **Integration Tests**: `src/tests/`
- **Test Utilities**: `src/utils/`
- **Test Configuration**: `package.json` Jest configuration

### Best Practices
- Write descriptive test names
- Test both success and error conditions
- Mock external dependencies appropriately
- Maintain test independence (no test should depend on another)

## Issue Analysis and Test Planning

### GitHub Issues Review Process
As part of our QA process, we regularly review:
- Pull requests for potential bug sources
- Issue reports for testing opportunities
- Code changes that might require additional test coverage

### Test Plan Development
For each identified potential issue:
1. **Relevance Check**: Verify the functionality still exists in current code
2. **Risk Assessment**: Evaluate the potential impact of the issue
3. **Test Design**: Create specific tests to prevent the issue
4. **Implementation**: Add tests to the appropriate test suite

## Automated Quality Gates

### Pre-deployment Validation
Before any deployment:
- All tests must pass
- Coverage must meet minimum thresholds
- No critical security vulnerabilities
- Performance benchmarks must be met

### Continuous Monitoring
- Daily automated test runs
- Weekly comprehensive quality reports
- Monthly test suite review and optimization

---

*This QA system helps ensure the SGEX Workbench maintains high quality standards while supporting WHO SMART Guidelines implementation worldwide.*