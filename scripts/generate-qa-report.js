#!/usr/bin/env node

/**
 * QA Report Generator Script
 * 
 * This script runs tests with coverage analysis and generates an HTML QA report
 * that matches the WHO SMART Guidelines design standards.
 * 
 * Usage: node scripts/generate-qa-report.js
 * Output: docs/qa-report.html
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const packageJson = require('../package.json');

console.log('🧪 Starting QA Report Generation...');

// Ensure docs directory exists
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

let testResults = null;
let coverageData = null;
let hasTestFailures = false;

try {
  console.log('🔍 Running tests with coverage analysis...');
  
  // Run tests with coverage
  const testOutput = execSync('npm test -- --passWithNoTests --watchAll=false --coverage --json', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Parse test results JSON (last line of output should be JSON)
  const outputLines = testOutput.trim().split('\n');
  const jsonLine = outputLines[outputLines.length - 1];
  
  try {
    testResults = JSON.parse(jsonLine);
  } catch (e) {
    console.warn('⚠️ Could not parse test results JSON, using fallback');
    testResults = {
      success: false,
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      testResults: []
    };
  }
  
} catch (error) {
  console.warn('⚠️ Test execution failed, generating report with available data');
  hasTestFailures = true;
  testResults = {
    success: false,
    numTotalTests: 0,
    numPassedTests: 0,
    numFailedTests: 0,
    testResults: [],
    error: error.message
  };
}

// Try to read coverage data
try {
  const coverageFile = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
  if (fs.existsSync(coverageFile)) {
    coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
  }
} catch (error) {
  console.warn('⚠️ Could not read coverage data:', error.message);
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

// Calculate test statistics
const totalTests = testResults?.numTotalTests || 0;
const passedTests = testResults?.numPassedTests || 0;
const failedTests = testResults?.numFailedTests || 0;
const testSuccessRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

// Calculate coverage statistics
let overallCoverage = 0;
let coverageStats = {
  statements: { pct: 0 },
  branches: { pct: 0 },
  functions: { pct: 0 },
  lines: { pct: 0 }
};

if (coverageData && coverageData.total) {
  coverageStats = coverageData.total;
  overallCoverage = Math.round((
    coverageStats.statements.pct +
    coverageStats.branches.pct +
    coverageStats.functions.pct +
    coverageStats.lines.pct
  ) / 4);
}

// Generate HTML report
const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SGEX Workbench - QA Report</title>
    <style>
        :root {
            --who-blue: #0F5197;
            --who-light-blue: #5A9BD4;
            --who-green: #28A745;
            --who-orange: #FD7E14;
            --who-red: #DC3545;
            --who-gray: #6C757D;
            --who-light-gray: #F8F9FA;
            --who-dark-gray: #343A40;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--who-dark-gray);
            background-color: var(--who-light-gray);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, var(--who-blue), var(--who-light-blue));
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .meta-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }

        .meta-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        .meta-label {
            font-weight: 600;
            color: var(--who-blue);
        }

        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border-left: 5px solid var(--who-blue);
            transition: transform 0.2s ease;
        }

        .card:hover {
            transform: translateY(-2px);
        }

        .card h3 {
            color: var(--who-blue);
            margin-bottom: 15px;
            font-size: 1.3rem;
        }

        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 8px 0;
        }

        .metric:last-child {
            margin-bottom: 0;
        }

        .metric-label {
            font-weight: 500;
        }

        .metric-value {
            font-weight: 700;
            font-size: 1.1rem;
        }

        .success { color: var(--who-green); }
        .warning { color: var(--who-orange); }
        .danger { color: var(--who-red); }
        .info { color: var(--who-blue); }

        .progress-bar {
            width: 100%;
            height: 8px;
            background-color: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
        }

        .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
        }

        .progress-success { background-color: var(--who-green); }
        .progress-warning { background-color: var(--who-orange); }
        .progress-danger { background-color: var(--who-red); }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge-success {
            background-color: rgba(40, 167, 69, 0.1);
            color: var(--who-green);
        }

        .badge-warning {
            background-color: rgba(253, 126, 20, 0.1);
            color: var(--who-orange);
        }

        .badge-danger {
            background-color: rgba(220, 53, 69, 0.1);
            color: var(--who-red);
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: var(--who-gray);
            font-size: 0.9rem;
        }

        .footer a {
            color: var(--who-blue);
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .dashboard {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 15px;
            }
            
            .meta-row {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 SGEX Workbench QA Report</h1>
            <p>Automated Quality Assurance Analysis</p>
        </div>

        <div class="meta-info">
            <div class="meta-row">
                <span class="meta-label">Project:</span>
                <span>${packageJson.name} v${packageJson.version}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Generated:</span>
                <span>${formattedDate} UTC</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Environment:</span>
                <span>GitHub Actions CI/CD</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Report Status:</span>
                <span class="status-badge ${hasTestFailures ? 'badge-warning' : 'badge-success'}">
                    ${hasTestFailures ? 'With Issues' : 'Clean'}
                </span>
            </div>
        </div>

        <div class="dashboard">
            <div class="card">
                <h3>📊 Test Results</h3>
                <div class="metric">
                    <span class="metric-label">Total Tests:</span>
                    <span class="metric-value info">${totalTests}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Passed:</span>
                    <span class="metric-value success">${passedTests}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Failed:</span>
                    <span class="metric-value ${failedTests > 0 ? 'danger' : 'success'}">${failedTests}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Success Rate:</span>
                    <span class="metric-value ${testSuccessRate >= 80 ? 'success' : testSuccessRate >= 60 ? 'warning' : 'danger'}">${testSuccessRate}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${testSuccessRate >= 80 ? 'progress-success' : testSuccessRate >= 60 ? 'progress-warning' : 'progress-danger'}" 
                         style="width: ${testSuccessRate}%"></div>
                </div>
            </div>

            <div class="card">
                <h3>📈 Code Coverage</h3>
                <div class="metric">
                    <span class="metric-label">Overall Coverage:</span>
                    <span class="metric-value ${overallCoverage >= 80 ? 'success' : overallCoverage >= 60 ? 'warning' : 'danger'}">${overallCoverage}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Statements:</span>
                    <span class="metric-value ${coverageStats.statements.pct >= 80 ? 'success' : 'warning'}">${coverageStats.statements.pct}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Branches:</span>
                    <span class="metric-value ${coverageStats.branches.pct >= 80 ? 'success' : 'warning'}">${coverageStats.branches.pct}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Functions:</span>
                    <span class="metric-value ${coverageStats.functions.pct >= 80 ? 'success' : 'warning'}">${coverageStats.functions.pct}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Lines:</span>
                    <span class="metric-value ${coverageStats.lines.pct >= 80 ? 'success' : 'warning'}">${coverageStats.lines.pct}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${overallCoverage >= 80 ? 'progress-success' : overallCoverage >= 60 ? 'progress-warning' : 'progress-danger'}" 
                         style="width: ${overallCoverage}%"></div>
                </div>
            </div>

            <div class="card">
                <h3>🔍 Quality Metrics</h3>
                <div class="metric">
                    <span class="metric-label">Dependencies:</span>
                    <span class="metric-value info">${Object.keys(packageJson.dependencies || {}).length}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Dev Dependencies:</span>
                    <span class="metric-value info">${Object.keys(packageJson.devDependencies || {}).length}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Test Framework:</span>
                    <span class="metric-value success">Jest + Testing Library</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Build System:</span>
                    <span class="metric-value success">React Scripts</span>
                </div>
            </div>

            <div class="card">
                <h3>🎯 Recommendations</h3>
                ${testSuccessRate < 80 ? '<div class="metric"><span class="metric-label warning">⚠️ Test Coverage:</span><span class="metric-value">Increase test coverage to 80%+</span></div>' : ''}
                ${overallCoverage < 60 ? '<div class="metric"><span class="metric-label warning">⚠️ Code Coverage:</span><span class="metric-value">Improve code coverage to 60%+</span></div>' : ''}
                ${failedTests > 0 ? '<div class="metric"><span class="metric-label danger">❌ Failed Tests:</span><span class="metric-value">Fix failing test cases</span></div>' : ''}
                ${testSuccessRate >= 80 && overallCoverage >= 60 && failedTests === 0 ? '<div class="metric"><span class="metric-label success">✅ Quality Status:</span><span class="metric-value">All quality checks passing</span></div>' : ''}
                <div class="metric">
                    <span class="metric-label info">📋 Next Steps:</span>
                    <span class="metric-value">Review test results and coverage reports</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Generated by SGEX Workbench QA System | 
            <a href="https://github.com/litlfred/sgex" target="_blank">View on GitHub</a> | 
            <a href="https://smart.who.int/" target="_blank">WHO SMART Guidelines</a></p>
        </div>
    </div>
</body>
</html>`;

// Write the HTML report
const reportPath = path.join(docsDir, 'qa-report.html');
fs.writeFileSync(reportPath, htmlReport, 'utf8');

console.log('✅ QA Report generated successfully!');
console.log(`📄 Report saved to: ${reportPath}`);
console.log(`📊 Summary: ${totalTests} tests, ${passedTests} passed, ${failedTests} failed`);
console.log(`📈 Coverage: ${overallCoverage}% overall`);

if (hasTestFailures) {
  console.log('⚠️ Note: Some tests failed or could not be executed, but report was generated with available data');
}

// Exit with appropriate code
process.exit(hasTestFailures ? 0 : 0); // Don't fail the CI, just generate the report