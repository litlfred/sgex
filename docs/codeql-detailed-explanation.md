# GitHub CodeQL - Detailed Explanation

## What is CodeQL?

CodeQL is GitHub's semantic code analysis engine that treats code as data, allowing you to query it to find security vulnerabilities, bugs, and logic errors that traditional tools miss.

## What Does CodeQL Test?

### 1. Language Coverage for SGeX Workbench

CodeQL supports the following languages used in this project:

#### JavaScript/TypeScript (Primary Focus)
- **React Components** - All `.js` and `.jsx` files in `src/`
- **Node.js Scripts** - Build scripts, test utilities, CI/CD scripts
- **Service Files** - GitHub API integrations, caching services
- **Utility Functions** - Helper functions, validators, formatters

#### Specifically for SGeX:
- **React App** (`src/**/*.js`, `src/**/*.jsx`)
- **Node Scripts** (`scripts/**/*.js`)
- **Build Configuration** (`package.json`, webpack configs)
- **Test Files** (`**/*.test.js`)

### 2. Types of Security Issues CodeQL Detects

#### A. Injection Vulnerabilities
**What it tests:**
- **SQL Injection** - Dynamic SQL queries with unsanitized input
- **Command Injection** - Shell commands with user input (e.g., `child_process.exec()`)
- **Code Injection** - `eval()`, `Function()` constructor with untrusted data
- **Path Traversal** - File operations with unsanitized paths
- **XSS (Cross-Site Scripting)** - Unsafe DOM manipulation, `dangerouslySetInnerHTML`

**Example findings in React:**
```javascript
// ❌ BAD - CodeQL would flag this
function UserProfile({ username }) {
  return <div dangerouslySetInnerHTML={{ __html: username }} />;
}

// ✅ GOOD
function UserProfile({ username }) {
  return <div>{username}</div>; // React auto-escapes
}
```

**Example findings in Node scripts:**
```javascript
// ❌ BAD - CodeQL would flag this
const { exec } = require('child_process');
exec(`git commit -m "${userMessage}"`); // Command injection risk

// ✅ GOOD
execSync('git', ['commit', '-m', userMessage]); // Parameterized
```

#### B. Authentication & Authorization
**What it tests:**
- **Missing authentication checks** - Unprotected API endpoints
- **Weak password policies** - Hardcoded credentials
- **Insecure token storage** - localStorage without encryption
- **Session management issues** - Token expiration, refresh logic

**Example findings in SGeX:**
```javascript
// ❌ BAD - CodeQL would flag this
const token = "ghp_hardcoded_token_12345"; // Hardcoded secret

// ✅ GOOD
const token = process.env.GITHUB_TOKEN; // Environment variable
```

#### C. Data Flow Analysis
**What it tests:**
- **Tainted data flow** - User input reaching sensitive operations
- **Information disclosure** - Sensitive data in logs or error messages
- **Insecure data transmission** - Unencrypted sensitive data
- **Memory leaks** - Improper cleanup of sensitive data

**Example findings:**
```javascript
// ❌ BAD - CodeQL tracks tainted data flow
function processUserInput(input) {
  console.log(`Processing: ${input}`); // Logs might contain sensitive data
  localStorage.setItem('userData', input); // Unencrypted storage
}

// ✅ GOOD
function processUserInput(input) {
  const sanitized = sanitizeInput(input);
  console.log('Processing user data'); // No sensitive info logged
  encryptedStorage.setItem('userData', sanitized);
}
```

#### D. React-Specific Security Issues
**What it tests:**
- **Unsafe lifecycle methods** - `componentWillMount` with side effects
- **Props validation** - Missing PropTypes or TypeScript types
- **Key prop issues** - Using array indices as keys (potential XSS)
- **Ref misuse** - Direct DOM manipulation bypassing React
- **State mutation** - Direct state modification (security context)

**Example findings:**
```javascript
// ❌ BAD - CodeQL would flag this
class UserList extends React.Component {
  render() {
    return this.props.users.map((user, index) => (
      <div key={index} dangerouslySetInnerHTML={{ __html: user.bio }} />
    ));
  }
}

// ✅ GOOD
function UserList({ users }) {
  return users.map(user => (
    <div key={user.id}>{user.bio}</div>
  ));
}
```

#### E. API & Network Security
**What it tests:**
- **Unvalidated redirects** - Open redirect vulnerabilities
- **CORS misconfigurations** - Overly permissive origins
- **Insecure HTTP** - Missing HTTPS enforcement
- **Missing rate limiting** - API abuse potential
- **Improper error handling** - Information leakage in errors

**Example findings in GitHub API calls:**
```javascript
// ❌ BAD - CodeQL would flag this
async function fetchRepo(url) {
  const response = await fetch(url); // No validation
  return response.json();
}

// ✅ GOOD
async function fetchRepo(repoName) {
  const url = `https://api.github.com/repos/${validateRepoName(repoName)}`;
  const response = await fetch(url, { headers: authHeaders });
  if (!response.ok) throw new Error('Fetch failed');
  return response.json();
}
```

#### F. Cryptography Issues
**What it tests:**
- **Weak algorithms** - MD5, SHA1 for security purposes
- **Insecure random** - `Math.random()` for security tokens
- **Hardcoded keys** - Encryption keys in source code
- **Improper encryption** - ECB mode, no IV

**Example findings:**
```javascript
// ❌ BAD - CodeQL would flag this
function generateToken() {
  return Math.random().toString(36); // Weak randomness
}

// ✅ GOOD
function generateToken() {
  return crypto.randomBytes(32).toString('hex'); // Cryptographically secure
}
```

### 3. CodeQL Query Categories

CodeQL organizes checks into severity levels:

#### Critical Severity
- Remote code execution vulnerabilities
- SQL injection in critical paths
- Authentication bypass
- Sensitive data exposure

#### High Severity
- XSS vulnerabilities
- Path traversal
- Insecure deserialization
- Weak cryptography

#### Medium Severity
- Information disclosure
- Missing input validation
- Insecure defaults
- Exception handling issues

#### Low Severity
- Code quality issues with security implications
- Deprecated APIs with security risks
- Missing security headers recommendations

### 4. What CodeQL Tests in SGeX Workbench Specifically

#### React Application (`src/` directory)
```
Tested Files:
├── src/App.js
├── src/components/**/*.js
│   ├── Authentication components (PATLogin.js)
│   ├── Editor components (BPMN, DMN editors)
│   ├── Dashboard components
│   └── Helper components
├── src/services/**/*.js
│   ├── githubService.js (API calls, authentication)
│   ├── repositoryCacheService.js (data storage)
│   └── bugReportService.js (user input handling)
└── src/utils/**/*.js
    └── Helper functions, validators

Security Focus Areas:
1. GitHub API authentication and token handling
2. User input sanitization in bug reports
3. Repository URL validation
4. Local storage usage (cache, tokens)
5. DOM manipulation in editors
6. File upload/download operations
7. Markdown rendering (potential XSS)
8. Query parameter parsing
```

#### Node.js Scripts (`scripts/` directory)
```
Tested Files:
├── scripts/run-security-checks.js
├── scripts/check-framework-compliance.js
├── scripts/manage-pr-comment.py (if JS version exists)
└── Build and deployment scripts

Security Focus Areas:
1. Command injection in shell commands
2. File system operations (path traversal)
3. Environment variable handling
4. External process execution
5. Dependency resolution
6. Configuration file parsing
```

#### GitHub Actions Workflows (`.github/workflows/`)
```
Tested Files:
├── .github/workflows/branch-deployment.yml
├── .github/workflows/pr-security-check.yml
└── Other workflow files

Security Focus Areas:
1. Secret exposure in logs
2. Privilege escalation
3. Workflow injection
4. Insecure artifact handling
5. Third-party action security
```

## How CodeQL Works

### 1. Code as Data
CodeQL creates a database representing your codebase:
```
Source Code → Parse → Abstract Syntax Tree (AST) → CodeQL Database
```

### 2. Query Execution
Runs predefined security queries against the database:
```
CodeQL Queries → Pattern Matching → Vulnerability Detection → Results
```

### 3. Data Flow Analysis
Tracks how data moves through your application:
```
User Input → Function Calls → Operations → Sinks (dangerous operations)
```

**Example trace:**
```javascript
// CodeQL traces this data flow:
1. [SOURCE] const userInput = req.query.name
2. [STEP] const message = `Hello ${userInput}`
3. [STEP] const html = `<div>${message}</div>`
4. [SINK] element.innerHTML = html  // ⚠️ XSS vulnerability
```

## Implementation for SGeX Workbench

### Option 1: Separate Workflow (Recommended)

Create `.github/workflows/codeql-analysis.yml`:

```yaml
name: "CodeQL Security Analysis"

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 1' # Weekly Monday at midnight

jobs:
  analyze:
    name: Analyze JavaScript/TypeScript
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: javascript
        queries: security-extended, security-and-quality

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
      with:
        category: "/language:javascript"
```

### Option 2: Integrate into Existing Security Check

Add to `.github/workflows/pr-security-check.yml`:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript
    
- name: Install dependencies
  run: npm ci --legacy-peer-deps

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
```

## CodeQL Results Format

### 1. GitHub Security Tab
Results appear in: `https://github.com/litlfred/sgex/security/code-scanning`

### 2. PR Annotations
Inline comments on the exact lines with vulnerabilities

### 3. JSON Output
```json
{
  "results": [
    {
      "ruleId": "js/sql-injection",
      "level": "error",
      "message": {
        "text": "This query depends on a user-provided value."
      },
      "locations": [{
        "physicalLocation": {
          "artifactLocation": {
            "uri": "src/services/githubService.js"
          },
          "region": {
            "startLine": 42,
            "startColumn": 15
          }
        }
      }]
    }
  ]
}
```

## Comparison: CodeQL vs Current Security Checks

| Feature | Current Checks | CodeQL |
|---------|---------------|--------|
| **Scope** | Dependencies, configs | Source code logic |
| **Language** | Package metadata | JavaScript/TypeScript AST |
| **Depth** | Surface-level | Deep semantic analysis |
| **React Support** | ✅ ESLint rules | ✅ React-specific queries |
| **Node.js Support** | ✅ npm audit | ✅ Node.js-specific queries |
| **Data Flow** | ❌ No | ✅ Yes - traces tainted data |
| **False Positives** | Low | Medium (but more accurate) |
| **Runtime** | ~30 seconds | ~5-10 minutes |
| **Cost** | Free | Free for public repos |

## Benefits for SGeX Workbench

1. **Complements npm audit** - Finds logic bugs npm audit can't detect
2. **React security** - Detects XSS in component rendering
3. **GitHub API security** - Validates token handling, API calls
4. **Node script safety** - Prevents command injection in build scripts
5. **Data flow tracking** - Ensures user input is sanitized
6. **Native integration** - Built into GitHub, no external services

## Example Findings CodeQL Might Report

Based on SGeX codebase:

### 1. GitHub Token Exposure
```javascript
// Location: src/services/githubService.js
// Severity: CRITICAL
console.log(`Using token: ${token}`); // Token in logs
```

### 2. Unsafe DOM Manipulation
```javascript
// Location: src/components/BPMNEditor.js
// Severity: HIGH
element.innerHTML = userProvidedBPMN; // XSS risk
```

### 3. Command Injection
```javascript
// Location: scripts/deployment.js
// Severity: CRITICAL
exec(`git checkout ${branchName}`); // Unsanitized branch name
```

### 4. Path Traversal
```javascript
// Location: src/services/fileService.js
// Severity: HIGH
fs.readFile(`./dak/${userFilename}`); // No path validation
```

### 5. Insecure Random
```javascript
// Location: src/utils/helpers.js
// Severity: MEDIUM
const sessionId = Math.random().toString(); // Weak randomness
```

## Recommended Configuration

For SGeX Workbench, use:

```yaml
queries: security-extended, security-and-quality
```

This includes:
- All standard security queries
- Additional quality checks with security implications
- React-specific patterns
- Node.js-specific patterns

## Timeline & Effort

- **Initial Setup:** 30 minutes
- **First Scan:** 5-10 minutes (one-time)
- **Subsequent Scans:** 2-5 minutes
- **Reviewing Results:** 1-2 hours (initial triage)
- **Fixing Issues:** Variable (depends on findings)

## Conclusion

CodeQL provides deep semantic analysis of JavaScript/React/Node.js code, finding security vulnerabilities that dependency scanners miss. It's particularly valuable for SGeX Workbench because:

1. **React Security** - Validates component rendering, props, state management
2. **GitHub Integration** - Analyzes GitHub API usage and authentication
3. **Build Scripts** - Secures Node.js scripts for deployment and CI/CD
4. **Data Flow** - Tracks user input from GitHub through the application
5. **Free for Public Repos** - No cost, native GitHub integration

It complements (not replaces) the existing npm audit and security header checks by focusing on code logic rather than dependency vulnerabilities.
