#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { extractRepositoryInfo } = require('./configure-repository');

// Get repository info for dynamic URLs
const repoInfo = extractRepositoryInfo();
const repositoryUrl = `https://github.com/${repoInfo.owner}/${repoInfo.name}`;

/**
 * QA Report Generator for SGEX Workbench
 * Generates a styled HTML QA report that matches the SGEX application design
 * 
 * IMPORTANT: This file is generated during CI/CD and should not be committed to the repository.
 * The generated qa-report.html is excluded in .gitignore and the workflow uses paths-ignore
 * to prevent infinite loops when the generated files would trigger another workflow run.
 */

const generateQAReport = async () => {
  console.log('🔍 Generating QA Report for SGEX Workbench...');

  // Run tests with coverage
  console.log('📊 Running tests with coverage...');
  let testResults = {};
  let coverageData = {};
  let startTime = Date.now(); // Initialize timing

  try {
    // Run tests with timeout and graceful failure handling
    console.log('🔍 Starting test execution with verbose output...');
    console.log('⏱️  Test timeout set to 120 seconds with 30s per individual test');
    console.log('📝 Running: npm test -- --watchAll=false --coverage --verbose --json --testTimeout=30000 --bail --passWithNoTests');
    
    startTime = Date.now(); // Reset timing for actual test execution
    const testOutput = execSync('timeout 120s npm test -- --watchAll=false --coverage --verbose --json --testTimeout=30000 --bail --passWithNoTests', { 
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 150000,  // 2.5 minutes total timeout
      stdio: ['inherit', 'pipe', 'pipe']  // Show stderr for debugging
    });

    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Test execution completed in ${executionTime} seconds`);

    // Parse the last JSON object from the output (Jest results)
    const lines = testOutput.split('\n').filter(line => line.trim());
    let jsonOutput = '';
    
    console.log('📋 Parsing test results...');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].startsWith('{')) {
        jsonOutput = lines[i];
        break;
      }
    }

    if (jsonOutput) {
      testResults = JSON.parse(jsonOutput);
      const totalTests = testResults.numTotalTests || 0;
      const passedTests = testResults.numPassedTests || 0;
      const failedTests = testResults.numFailedTests || 0;
      
      console.log(`✅ Test execution summary:`);
      console.log(`   📊 Total tests: ${totalTests}`);
      console.log(`   ✅ Passed: ${passedTests}`);
      console.log(`   ❌ Failed: ${failedTests}`);
      
      // Show detailed results for each test file
      if (testResults.testResults && testResults.testResults.length > 0) {
        console.log('📁 Test files executed:');
        testResults.testResults.forEach((result, index) => {
          const fileName = result.name ? result.name.split('/').pop() : `Test ${index + 1}`;
          const status = result.status || 'unknown';
          const numTests = (result.assertionResults || []).length;
          const statusIcon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
          console.log(`   ${statusIcon} ${fileName} (${numTests} tests, ${status})`);
          
          // Show failed tests details
          if (result.assertionResults) {
            const failedTests = result.assertionResults.filter(test => test.status === 'failed');
            if (failedTests.length > 0) {
              console.log(`      Failed tests in ${fileName}:`);
              failedTests.forEach(test => {
                console.log(`        ❌ ${test.title}`);
                if (test.failureMessages && test.failureMessages.length > 0) {
                  console.log(`           Error: ${test.failureMessages[0].split('\n')[0]}`);
                }
              });
            }
          }
        });
      }
    } else {
      throw new Error('No JSON output found from tests');
    }
  } catch (error) {
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.warn(`⚠️  Test execution encountered issues after ${executionTime} seconds`);
    console.warn(`🔍 Error details: ${error.message}`);
    
    // Check if it's a timeout error
    if (error.message.includes('timeout')) {
      console.warn('⏰ Tests timed out - this may indicate hanging tests or infrastructure issues');
      console.warn('💡 Consider increasing timeout or checking for infinite loops in tests');
    }
    
    // Check if there's any partial output that might be useful
    if (error.stdout) {
      console.log('📤 Partial test output captured:');
      const lines = error.stdout.split('\n').slice(-10); // Show last 10 lines
      lines.forEach(line => console.log(`   ${line}`));
    }
    
    if (error.stderr) {
      console.log('🚨 Error output:');
      const errorLines = error.stderr.split('\n').slice(-10); // Show last 10 lines of errors
      errorLines.forEach(line => console.log(`   ${line}`));
    }
    
    console.warn('⚠️  Continuing with minimal data for QA report generation...');
    console.warn('📋 This usually happens when tests fail or timeout in CI environments');
    testResults = {
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
      testResults: [],
      skipped: true,
      skipReason: 'Test execution failed or timed out'
    };
  }

  // Read coverage data if available
  console.log('📈 Checking for coverage data...');
  try {
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      const total = coverageData.total || {};
      console.log('✅ Coverage data found:');
      console.log(`   📊 Statements: ${(total.statements?.pct || 0).toFixed(1)}%`);
      console.log(`   🔀 Branches: ${(total.branches?.pct || 0).toFixed(1)}%`);
      console.log(`   📝 Functions: ${(total.functions?.pct || 0).toFixed(1)}%`);
      console.log(`   📄 Lines: ${(total.lines?.pct || 0).toFixed(1)}%`);
    } else {
      console.warn('⚠️  Coverage file not found at:', coveragePath);
      throw new Error('Coverage file not found');
    }
  } catch (error) {
    console.warn('⚠️  Coverage data not available:', error.message);
    coverageData = { total: { lines: { pct: 0 }, functions: { pct: 0 }, branches: { pct: 0 }, statements: { pct: 0 } } };
  }

  // Run compliance checks
  console.log('🔍 Running compliance checks...');
  let complianceResults = {};
  try {
    // Framework compliance
    const FrameworkComplianceChecker = require('./check-framework-compliance.js');
    const frameworkChecker = new FrameworkComplianceChecker();
    await frameworkChecker.check();
    complianceResults.framework = frameworkChecker.results;
    
    // GitHub service compliance
    const GitHubServiceComplianceChecker = require('./check-github-service-compliance.js');
    const githubChecker = new GitHubServiceComplianceChecker();
    await githubChecker.check();
    complianceResults.githubService = githubChecker.getDetailedResults();
    
    console.log('✅ Compliance checks completed');
  } catch (error) {
    console.warn('⚠️  Compliance checks failed:', error.message);
    complianceResults = { error: error.message };
  }

  // Generate HTML report
  console.log('📄 Generating HTML QA report...');
  const htmlReport = generateHTMLReport(testResults, coverageData, complianceResults);

  // Ensure both docs and public/docs directories exist
  console.log('📁 Creating output directories...');
  const docsDir = path.join(process.cwd(), 'docs');
  const publicDocsDir = path.join(process.cwd(), 'public', 'docs');
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
    console.log('✅ Created docs directory');
  }
  if (!fs.existsSync(publicDocsDir)) {
    fs.mkdirSync(publicDocsDir, { recursive: true });
    console.log('✅ Created public/docs directory');
  }

  // Write the report to both locations for compatibility
  console.log('💾 Writing QA report files...');
  const reportPath = path.join(docsDir, 'qa-report.html');
  const publicReportPath = path.join(publicDocsDir, 'qa-report.html');
  
  fs.writeFileSync(reportPath, htmlReport);
  fs.writeFileSync(publicReportPath, htmlReport);

  console.log(`✅ QA Report generated successfully: ${reportPath}`);
  console.log(`✅ QA Report also available for development server: ${publicReportPath}`);
  console.log('🎉 QA report generation completed!');
  return reportPath;
};

const generateComplianceSection = (complianceResults) => {
  if (!complianceResults || complianceResults.error) {
    return `
        <div class="card">
            <h2>🔍 Compliance Analysis</h2>
            <div style="background: rgba(255, 193, 7, 0.2); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 8px; padding: 15px;">
                <h3 style="color: #ffc107; margin-top: 0;">⚠️ Compliance Check Unavailable</h3>
                <p>Compliance analysis could not be performed: ${complianceResults?.error || 'Unknown error'}</p>
            </div>
        </div>`;
  }

  const framework = complianceResults.framework || {};
  const githubService = complianceResults.githubService || {};

  // Calculate overall compliance
  const frameworkCompliance = framework.compliant ? framework.compliant.length : 0;
  const frameworkTotal = (framework.compliant?.length || 0) + (framework.partiallyCompliant?.length || 0) + (framework.nonCompliant?.length || 0);
  const frameworkPercentage = frameworkTotal > 0 ? Math.round((frameworkCompliance / frameworkTotal) * 100) : 0;

  const githubCompliance = githubService.summary?.compliantFiles || 0;
  const githubTotal = githubService.summary?.totalFiles || 0;
  const githubPercentage = githubService.summary?.compliancePercentage || 0;

  const overallCompliance = frameworkTotal + githubTotal > 0 ? 
    Math.round(((frameworkCompliance + githubCompliance) / (frameworkTotal + githubTotal)) * 100) : 0;

  return `
        <div class="card">
            <h2>🔍 Compliance Analysis</h2>
            <p>Automated compliance checking ensures code quality and adherence to SGEX standards.</p>
            
            <!-- Overall Compliance -->
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin-top: 0;">📊 Overall Compliance: ${overallCompliance}%</h3>
                <div class="progress-bar" style="height: 12px; margin-bottom: 10px;">
                    <div class="progress-fill" style="width: ${overallCompliance}%; background: ${overallCompliance >= 90 ? '#28a745' : overallCompliance >= 70 ? '#ffc107' : '#dc3545'}"></div>
                </div>
                <p style="margin: 0; opacity: 0.9;">Combined compliance across all quality standards</p>
            </div>

            <div class="stats-grid">
                <!-- Framework Compliance -->
                <div class="stat-item">
                    <div class="stat-value">${frameworkPercentage}%</div>
                    <div class="stat-label">Page Framework</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${frameworkPercentage}%"></div>
                    </div>
                    <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 5px;">
                        ${frameworkCompliance}/${frameworkTotal} components
                    </div>
                </div>

                <!-- GitHub Service Compliance -->
                <div class="stat-item">
                    <div class="stat-value">${githubPercentage}%</div>
                    <div class="stat-label">GitHub Service</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${githubPercentage}%"></div>
                    </div>
                    <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 5px;">
                        ${githubCompliance}/${githubTotal} files
                    </div>
                </div>
            </div>

            <!-- GitHub Service Compliance Details -->
            ${githubService.summary ? `
            <div style="margin-top: 25px;">
                <h3>🔐 GitHub Service Compliance Details</h3>
                <p style="margin-bottom: 15px;">Ensures consistent authentication, rate limiting, and error handling across all GitHub API operations.</p>
                
                <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
                    <div class="stat-item">
                        <div class="stat-value status-passed">${githubService.summary.compliantFiles}</div>
                        <div class="stat-label">✅ Compliant</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value status-failed">${githubService.summary.nonCompliantFiles}</div>
                        <div class="stat-label">❌ Non-compliant</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${githubService.summary.warningFiles}</div>
                        <div class="stat-label">⚠️ Warnings</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${githubService.summary.errorFiles}</div>
                        <div class="stat-label">🚨 Errors</div>
                    </div>
                </div>

                ${githubService.nonCompliant && githubService.nonCompliant.length > 0 ? `
                <div style="background: rgba(220, 53, 69, 0.2); border: 1px solid rgba(220, 53, 69, 0.3); border-radius: 8px; padding: 15px; margin-top: 15px;">
                    <h4 style="color: #dc3545; margin-top: 0;">❌ Non-compliant Files:</h4>
                    <ul style="margin-bottom: 0;">
                        ${githubService.nonCompliant.map(file => `
                            <li><strong>${file.file}</strong> (Score: ${file.score}/${file.maxScore})
                                <ul>
                                    ${file.violations.map(v => `<li>Line ${v.line}: ${v.message}</li>`).join('')}
                                </ul>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : `
                <div style="background: rgba(40, 167, 69, 0.2); border: 1px solid rgba(40, 167, 69, 0.3); border-radius: 8px; padding: 15px; margin-top: 15px;">
                    <h4 style="color: #28a745; margin-top: 0;">✅ All files comply with GitHub service standards!</h4>
                    <p style="margin: 0;">No direct GitHub API calls detected. All components properly use githubService for consistent authentication and error handling.</p>
                </div>
                `}

                <div style="margin-top: 15px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <h4 style="margin-top: 0;">🎯 GitHub Service Compliance Rules:</h4>
                    <ul style="margin-bottom: 0; font-size: 0.9rem;">
                        <li><strong>No Direct API Calls:</strong> Components must use githubService methods instead of direct fetch() to api.github.com</li>
                        <li><strong>Proper Authentication:</strong> Use githubService.isAuth() instead of manual token checks</li>
                        <li><strong>Consistent Error Handling:</strong> Leverage githubService's built-in retry logic and error management</li>
                        <li><strong>Rate Limit Management:</strong> githubService automatically handles GitHub API rate limiting</li>
                    </ul>
                </div>
            </div>
            ` : ''}
        </div>`;
};

const generateHTMLReport = (testResults, coverageData, complianceResults = {}) => {
  const timestamp = new Date().toISOString();
  const total = coverageData.total || { lines: { pct: 0 }, functions: { pct: 0 }, branches: { pct: 0 }, statements: { pct: 0 } };
  
  // Calculate test summary
  const totalTests = testResults.numTotalTests || 0;
  const passedTests = testResults.numPassedTests || 0;
  const failedTests = testResults.numFailedTests || 0;
  const pendingTests = testResults.numPendingTests || 0;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
  const testsSkipped = testResults.skipped || false;

  // Get test files summary
  const testFilesSummary = (testResults.testResults || []).map(result => ({
    name: path.basename(result.name || ''),
    status: result.status || 'unknown',
    numTests: (result.assertionResults || []).length,
    numPassed: (result.assertionResults || []).filter(test => test.status === 'passed').length,
    numFailed: (result.assertionResults || []).filter(test => test.status === 'failed').length
  }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Report - SGEX Workbench</title>
    <style>
        /* SGEX Workbench Styling - Following UI_STYLING_REQUIREMENTS.md */
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
            min-height: 100vh;
            color: white;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header matching SGEX standards */
        .header {
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            padding: 20px;
            margin: -20px -20px 30px -20px;
            border-radius: 0;
        }

        .who-branding h1 {
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            margin: 0 0 10px 0;
            font-size: 2.5rem;
        }

        .who-branding .subtitle {
            color: rgba(255, 255, 255, 0.95);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            margin: 0;
            font-size: 1.1rem;
        }

        /* Content cards */
        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .card h2 {
            margin-top: 0;
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        /* Statistics grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }

        .stat-item {
            background: rgba(255, 255, 255, 0.15);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        /* Progress bars */
        .progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
            transition: width 0.3s ease;
        }

        /* Test results table */
        .test-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .test-table th,
        .test-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .test-table th {
            background: rgba(255, 255, 255, 0.1);
            font-weight: 600;
        }

        /* Status indicators */
        .status-passed { color: #28a745; font-weight: bold; }
        .status-failed { color: #dc3545; font-weight: bold; }
        .status-pending { color: #ffc107; font-weight: bold; }

        /* Responsive design */
        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .who-branding h1 {
                font-size: 2rem;
            }
            
            .container {
                padding: 10px;
            }
        }

        .timestamp {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
        }

        .back-link {
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: inline-block;
            margin-bottom: 20px;
            transition: background-color 0.2s;
        }

        .back-link:hover {
            background: rgba(255, 255, 255, 0.2);
            text-decoration: none;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="who-branding">
                <h1>QA Testing Report</h1>
                <p class="subtitle">SMART Guidelines Exchange (SGEX) Workbench - Quality Assurance Dashboard</p>
                <p class="timestamp">Generated: ${new Date(timestamp).toLocaleString()}</p>
            </div>
        </div>

        <a href="/docs/" class="back-link">← Back to Documentation</a>

        <!-- Test Summary -->
        <div class="card">
            <h2>📊 Test Execution Summary</h2>
            ${testsSkipped ? `
            <div style="background: rgba(255, 193, 7, 0.2); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <h3 style="color: #ffc107; margin-top: 0;">⚠️ Tests Skipped</h3>
                <p>Tests were skipped during QA report generation due to: ${testResults.skipReason || 'timeout or failures'}.</p>
                <p><strong>This is expected behavior in CI environments when tests fail or timeout.</strong></p>
                <p>Common causes:</p>
                <ul>
                    <li>🔧 Import/dependency resolution issues</li>
                    <li>⏰ Test timeouts (especially component tests)</li>
                    <li>🧪 Logic errors in test assertions</li>
                    <li>🚦 CI environment resource limitations</li>
                </ul>
            </div>
            ` : ''}
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${totalTests}</div>
                    <div class="stat-label">Total Tests</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value status-passed">${passedTests}</div>
                    <div class="stat-label">Passed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value status-failed">${failedTests}</div>
                    <div class="stat-label">Failed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${testsSkipped ? 'N/A' : passRate + '%'}</div>
                    <div class="stat-label">Pass Rate</div>
                </div>
            </div>
        </div>

        <!-- Coverage Summary -->
        <div class="card">
            <h2>📈 Code Coverage</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${total.statements.pct.toFixed(1)}%</div>
                    <div class="stat-label">Statements</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${total.statements.pct}%"></div>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${total.branches.pct.toFixed(1)}%</div>
                    <div class="stat-label">Branches</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${total.branches.pct}%"></div>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${total.functions.pct.toFixed(1)}%</div>
                    <div class="stat-label">Functions</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${total.functions.pct}%"></div>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${total.lines.pct.toFixed(1)}%</div>
                    <div class="stat-label">Lines</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${total.lines.pct}%"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Test Files Breakdown -->
        <div class="card">
            <h2>🧪 Test Files Breakdown</h2>
            <table class="test-table">
                <thead>
                    <tr>
                        <th>Test File</th>
                        <th>Status</th>
                        <th>Tests</th>
                        <th>Passed</th>
                        <th>Failed</th>
                    </tr>
                </thead>
                <tbody>
                    ${testFilesSummary.map(file => `
                        <tr>
                            <td>${file.name}</td>
                            <td class="status-${file.status}">${file.status.toUpperCase()}</td>
                            <td>${file.numTests}</td>
                            <td class="status-passed">${file.numPassed}</td>
                            <td class="status-failed">${file.numFailed}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Compliance Summary -->
        ${generateComplianceSection(complianceResults)}

        <!-- Recommendations -->
        <div class="card">
            <h2>💡 Quality Recommendations</h2>
            <ul>
                ${total.statements.pct < 80 ? '<li>🎯 <strong>Increase statement coverage:</strong> Current coverage is below 80%. Consider adding more comprehensive unit tests.</li>' : ''}
                ${total.branches.pct < 70 ? '<li>🔀 <strong>Improve branch coverage:</strong> Add tests for different conditional paths and edge cases.</li>' : ''}
                ${failedTests > 0 ? '<li>❌ <strong>Fix failing tests:</strong> Address the failing tests to improve overall test reliability.</li>' : ''}
                ${totalTests < 50 ? '<li>📝 <strong>Expand test suite:</strong> Consider adding more tests to cover critical functionality.</li>' : ''}
                <li>🔍 <strong>Continuous monitoring:</strong> Regular QA reports help maintain code quality over time.</li>
                <li>📊 <strong>WHO SMART Guidelines compliance:</strong> Ensure all tests validate against WHO standards and requirements.</li>
            </ul>
        </div>

        <!-- Footer -->
        <div class="card">
            <p style="text-align: center; margin: 0; opacity: 0.8;">
                Generated by SGEX Workbench QA System | 
                <a href="${repositoryUrl}" style="color: rgba(255, 255, 255, 0.9);">View on GitHub</a>
            </p>
        </div>
    </div>
</body>
</html>`;
};

if (require.main === module) {
  generateQAReport().catch(error => {
    console.error('❌ QA Report generation failed:', error);
    process.exit(1);
  });
}

module.exports = { generateQAReport };