#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * QA Report Generator for SGEX Workbench
 * Generates a styled HTML QA report that matches the SGEX application design
 * 
 * IMPORTANT: This file is generated during CI/CD and should not be committed to the repository.
 * The generated qa-report.html is excluded in .gitignore and the workflow uses paths-ignore
 * to prevent infinite loops when the generated files would trigger another workflow run.
 */

const generateQAReport = () => {
  console.log('🔍 Generating QA Report for SGEX Workbench...');

  // Run tests with coverage
  console.log('📊 Running tests with coverage...');
  let testResults = {};
  let coverageData = {};

  try {
    // Run tests and capture output
    const testOutput = execSync('npm test -- --watchAll=false --coverage --verbose --json 2>/dev/null || true', { 
      encoding: 'utf8',
      cwd: process.cwd()
    });

    // Parse the last JSON object from the output (Jest results)
    const lines = testOutput.split('\n').filter(line => line.trim());
    let jsonOutput = '';
    
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].startsWith('{')) {
        jsonOutput = lines[i];
        break;
      }
    }

    if (jsonOutput) {
      testResults = JSON.parse(jsonOutput);
    }
  } catch (error) {
    console.warn('⚠️  Test execution encountered issues, continuing with partial data...');
    testResults = {
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
      testResults: []
    };
  }

  // Read coverage data if available
  try {
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    }
  } catch (error) {
    console.warn('⚠️  Coverage data not available');
    coverageData = { total: { lines: { pct: 0 }, functions: { pct: 0 }, branches: { pct: 0 }, statements: { pct: 0 } } };
  }

  // Generate HTML report
  const htmlReport = generateHTMLReport(testResults, coverageData);

  // Ensure both docs and public/docs directories exist
  const docsDir = path.join(process.cwd(), 'docs');
  const publicDocsDir = path.join(process.cwd(), 'public', 'docs');
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  if (!fs.existsSync(publicDocsDir)) {
    fs.mkdirSync(publicDocsDir, { recursive: true });
  }

  // Write the report to both locations for compatibility
  const reportPath = path.join(docsDir, 'qa-report.html');
  const publicReportPath = path.join(publicDocsDir, 'qa-report.html');
  
  fs.writeFileSync(reportPath, htmlReport);
  fs.writeFileSync(publicReportPath, htmlReport);

  console.log(`✅ QA Report generated successfully: ${reportPath}`);
  console.log(`✅ QA Report also available for development server: ${publicReportPath}`);
  return reportPath;
};

const generateHTMLReport = (testResults, coverageData) => {
  const timestamp = new Date().toISOString();
  const total = coverageData.total || { lines: { pct: 0 }, functions: { pct: 0 }, branches: { pct: 0 }, statements: { pct: 0 } };
  
  // Calculate test summary
  const totalTests = testResults.numTotalTests || 0;
  const passedTests = testResults.numPassedTests || 0;
  const failedTests = testResults.numFailedTests || 0;
  const pendingTests = testResults.numPendingTests || 0;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';

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
                    <div class="stat-value">${passRate}%</div>
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
                <a href="https://github.com/litlfred/sgex" style="color: rgba(255, 255, 255, 0.9);">View on GitHub</a>
            </p>
        </div>
    </div>
</body>
</html>`;
};

if (require.main === module) {
  generateQAReport();
}

module.exports = { generateQAReport };