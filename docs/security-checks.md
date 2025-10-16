# Security Check System

The SGeX Workbench implements a comprehensive security check system that automatically runs on every pull request build to ensure code quality and security standards are maintained.

## Overview

The security check system consists of three main components:

1. **Security Check Script** (`scripts/run-security-checks.js`) - Executes multiple security checks
2. **Comment Formatter** (`scripts/format-security-comment.js`) - Formats results as GitHub PR comment
3. **Comment Manager** (`scripts/manage-security-comment.py`) - Updates PR comments with results

## Security Checks Performed

### 1. NPM Audit 🔍
**What it checks:** Scans all npm dependencies for known security vulnerabilities using the npm audit database.

**Severity levels:** Critical, High, Moderate, Low

**Action items:** 
- Run `npm audit fix` to automatically fix vulnerabilities
- For vulnerabilities requiring manual intervention, update affected packages or add overrides

### 2. Outdated Dependencies 📦
**What it checks:** Identifies packages that are outdated, especially those with major version updates available.

**Why it matters:** Outdated packages may contain security vulnerabilities that have been fixed in newer versions.

**Action items:**
- Review outdated packages and update where possible
- Prioritize packages that are multiple major versions behind

### 3. ESLint Security Rules 🔒
**What it checks:** Runs ESLint with focus on security-related rules including:
- `no-eval` - Prevents dangerous eval() usage
- `no-dangerous-*` - Prevents dangerous HTML/DOM operations
- Security-specific ESLint plugins

**Action items:**
- Fix ESLint errors related to security
- Review and address security warnings

### 4. Security Headers 🛡️
**What it checks:** Verifies that security headers are properly configured in the application:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy
- Permissions Policy

**Action items:**
- Ensure all required security headers are present in `public/index.html`
- Review and update CSP directives as needed

### 5. License Compliance ⚖️
**What it checks:** Scans dependencies for restrictive licenses (GPL, AGPL, LGPL) that may have legal implications.

**Why it matters:** Some licenses require source code disclosure or have other restrictions.

**Action items:**
- Review packages with restrictive licenses
- Consider alternative packages with more permissive licenses
- Ensure compliance with license requirements

### 6. Secret Scanning 🔐
**What it checks:** Scans source code for potential hardcoded secrets including:
- API keys
- Authentication tokens
- Passwords
- Private keys
- AWS credentials

**Critical:** Any detected secrets should be removed immediately and rotated.

**Action items:**
- Remove any hardcoded secrets from source code
- Use environment variables or secret management systems
- Rotate any exposed credentials

### 7. Framework Compliance ✅
**What it checks:** Ensures components follow the project's framework standards and security best practices.

**Action items:**
- Review framework compliance issues
- Update components to follow project standards

## PR Comment Format

The security check system posts a condensed, easy-to-read comment on pull requests with the following structure:

```markdown
## 🔒 Security Check Report

![Security Status](badge)

**🟢 5 passed • 🟡 1 warnings • 🔴 0 failed**

### Security Checks

| Check | Status | Details |
|-------|--------|---------|
| NPM Audit | 🟢 | No vulnerabilities found |
| Outdated Dependencies | 🔵 | 9 outdated packages |
| ESLint Security | 🟢 | No security issues |
| Security Headers | 🟡 | Some headers missing |
| License Compliance | 🟢 | No problematic licenses |
| Secret Scanning | 🟢 | No secrets detected |
| Framework Compliance | 🟢 | Checks passed |

### 🔍 Action Items
[Expandable details for each failed/warned check]

---
### ✅ Security Status: CLEAN
```

### Status Indicators

- 🟢 **Pass** - Check completed successfully with no issues
- 🟡 **Warning** - Check found non-critical issues that should be reviewed
- 🔴 **Fail** - Check found critical issues that must be addressed
- 🔵 **Info** - Check completed with informational findings
- ⚪ **Skip** - Check was skipped (e.g., build artifacts not available)

## Workflow Integration

The security checks run automatically via the `.github/workflows/pr-security-check.yml` workflow:

**Triggers:**
- Pull request events (opened, synchronize, reopened) targeting main
- Pushes to feature branches

**Process:**
1. Checkout code and install dependencies
2. Run comprehensive security checks
3. Format results as PR comment
4. Update or create comment on PR
5. Set workflow status based on results

**Status behavior:**
- ✅ **Success** - All checks passed
- ⚠️ **Neutral** - Warnings detected but not critical
- ❌ **Failure** - Critical security issues found

## Running Locally

You can run security checks locally before pushing code:

```bash
# Install dependencies
npm ci --legacy-peer-deps

# Run security checks
node scripts/run-security-checks.js

# View formatted results
node scripts/format-security-comment.js
cat security-comment.md
```

## Configuration

### Adding New Security Checks

To add a new security check:

1. Add a new check function in `scripts/run-security-checks.js`:
```javascript
function checkNewSecurity() {
  console.log('🔍 Running new security check...');
  
  // Perform check logic
  
  return {
    name: 'Check Name',
    id: 'check-id',
    status: 'pass', // or 'fail', 'warn', 'info', 'skip'
    severity: 'none', // or 'critical', 'high', 'moderate', 'low'
    summary: 'Description of results',
    details: {
      // Additional details object
    },
    recommendation: 'What to do if issues found'
  };
}
```

2. Add the check to the main execution:
```javascript
checks.push(checkNewSecurity());
```

3. (Optional) Add custom formatting in `scripts/format-security-comment.js` if needed

### Customizing Check Behavior

You can adjust check behavior by modifying the check functions:

- **Thresholds**: Adjust what counts as a failure vs warning
- **Patterns**: Modify regex patterns for secret scanning
- **Severity mapping**: Change how issues are classified

## Best Practices

1. **Review all security warnings** - Even warnings can indicate potential issues
2. **Don't ignore secret scanning alerts** - These are critical security risks
3. **Keep dependencies updated** - Regularly update to get security fixes
4. **Test security headers** - Verify headers work correctly in deployed environment
5. **Document exceptions** - If you must use a flagged pattern, document why

## Troubleshooting

### Check fails unexpectedly
- Ensure all dependencies are installed: `npm ci --legacy-peer-deps`
- Check that the build directory exists if needed
- Review the full output in the workflow logs

### Comment not updating
- Verify the PR has proper permissions
- Check that the GitHub token has `pull-requests: write` permission
- Look for errors in the "Update PR comment" step

### False positives
- Review the check logic in the security check script
- Consider adjusting thresholds or patterns
- Document why a finding is not a real issue

## Additional Resources

- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [OWASP Security Guidelines](https://owasp.org/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

## Future Enhancements

Potential additions to the security check system:

- [ ] Integration with GitHub CodeQL
- [ ] OWASP Dependency-Check
- [ ] Docker image scanning (when containerized)
- [ ] SAST (Static Application Security Testing) tools
- [ ] Supply chain security checks
- [ ] Automated dependency updates via Dependabot
- [ ] Security scorecard integration

For a comprehensive guide to additional security scanning tools (OWASP, Snyk, CodeQL, Semgrep, TruffleHog, and more), see [Additional Security Tools Guide](additional-security-tools.md).
