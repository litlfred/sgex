# Additional Security Scanning Tools for SGeX Workbench

This document provides recommendations for additional security scanning tools that can be integrated into the PR security check system.

## Currently Implemented

The current security check system includes:
1. NPM Audit - Dependency vulnerabilities
2. Outdated Dependencies - Version freshness
3. ESLint Security - Code security issues
4. Security Headers - Configuration validation
5. License Compliance - Restrictive licenses
6. Secret Scanning - Hardcoded credentials
7. Framework Compliance - Best practices

## Recommended Additional Tools

### 1. OWASP Dependency-Check

**What it does:** Identifies known vulnerabilities in project dependencies using the National Vulnerability Database (NVD).

**Why use it:** More comprehensive than npm audit alone, checks against broader vulnerability databases.

**Implementation:**
```bash
# Install
npm install -g @owasp/dependency-check

# Run check
dependency-check --project "SGeX" --scan . --format JSON --out ./dependency-check-report.json
```

**Integration Priority:** HIGH - Complements npm audit with additional vulnerability sources

**Estimated effort:** 2-4 hours

---

### 2. Snyk

**What it does:** Advanced vulnerability scanning with fix suggestions, license checks, and container scanning.

**Why use it:** Industry-leading tool with extensive vulnerability database and automated fix PRs.

**Implementation:**
```bash
# Install
npm install -g snyk

# Authenticate (requires account)
snyk auth

# Run test
snyk test --json > snyk-report.json
```

**Integration Priority:** HIGH - Free tier available, excellent developer experience

**Estimated effort:** 3-5 hours (includes account setup)

---

### 3. GitHub CodeQL

**What it does:** Semantic code analysis to find security vulnerabilities in source code.

**Why use it:** Deep static analysis, finds logic errors and security issues npm audit can't detect.

**Implementation:**
```yaml
# Add to .github/workflows/pr-security-check.yml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v2
  with:
    languages: javascript

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v2
```

**Integration Priority:** VERY HIGH - Native GitHub integration, free for public repos

**Estimated effort:** 2-3 hours

---

### 4. Semgrep

**What it does:** Fast, customizable static analysis tool for finding bugs and security issues.

**Why use it:** Lightweight alternative to CodeQL, easy to customize rules for project-specific patterns.

**Implementation:**
```bash
# Install
npm install -g @semgrep/cli

# Run with security rules
semgrep --config=auto --json --output=semgrep-report.json
```

**Integration Priority:** MEDIUM - Good balance of speed and accuracy

**Estimated effort:** 2-4 hours

---

### 5. TruffleHog

**What it does:** Advanced secret scanning that searches git history for accidentally committed secrets.

**Why use it:** More thorough than basic regex patterns, scans entire git history.

**Implementation:**
```bash
# Install
pip install trufflehog

# Scan repository
trufflehog git file://. --json > trufflehog-report.json
```

**Integration Priority:** MEDIUM - Current secret scanning is basic regex-based

**Estimated effort:** 2-3 hours

---

### 6. GitGuardian

**What it does:** Real-time secret detection with policy enforcement.

**Why use it:** Prevents secrets from being committed, not just detecting after the fact.

**Implementation:**
```bash
# Install pre-commit hook
npm install -g @gitguardian/ggshield

# Configure in .github/workflows
ggshield secret scan ci
```

**Integration Priority:** MEDIUM - Requires API key, but has free tier

**Estimated effort:** 3-4 hours

---

### 7. SonarQube / SonarCloud

**What it does:** Comprehensive code quality and security analysis platform.

**Why use it:** Industry standard for continuous code quality inspection, tracks technical debt.

**Implementation:**
```yaml
# SonarCloud GitHub Action
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**Integration Priority:** LOW-MEDIUM - More suited for mature projects, requires setup

**Estimated effort:** 4-8 hours (includes configuration)

---

### 8. npm-audit-resolver

**What it does:** Interactive tool to resolve npm audit issues with better UX than `npm audit fix`.

**Why use it:** Helps manage and track exceptions for known vulnerabilities.

**Implementation:**
```bash
# Install
npm install -g npm-audit-resolver

# Create audit exceptions
npm-audit-resolver --audit-report
```

**Integration Priority:** LOW - Nice to have, mainly for workflow improvement

**Estimated effort:** 1-2 hours

---

### 9. Retire.js

**What it does:** Scanner detecting use of vulnerable JavaScript libraries.

**Why use it:** Checks for known vulnerabilities in client-side JavaScript dependencies.

**Implementation:**
```bash
# Install
npm install -g retire

# Scan
retire --js --path . --outputformat json --outputpath retire-report.json
```

**Integration Priority:** MEDIUM - Useful for React applications

**Estimated effort:** 2-3 hours

---

### 10. Trivy

**What it does:** Comprehensive vulnerability scanner for containers, filesystems, and git repositories.

**Why use it:** All-in-one scanner, includes npm audit functionality plus OS package scanning.

**Implementation:**
```bash
# Install
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Scan
trivy fs --format json --output trivy-report.json .
```

**Integration Priority:** LOW-MEDIUM - Overkill for current needs, better for containerized apps

**Estimated effort:** 3-5 hours

---

### 11. Socket Security

**What it does:** Detects supply chain attacks in dependencies, analyzes package behavior.

**Why use it:** Emerging threat detection for malicious packages and suspicious behavior.

**Implementation:**
```bash
# GitHub Action available
- uses: SocketDev/socket-security-action@v1
  with:
    token: ${{ secrets.SOCKET_TOKEN }}
```

**Integration Priority:** LOW - Newer tool, addresses emerging threats

**Estimated effort:** 2-3 hours

---

### 12. Checkmarx KICS

**What it does:** Infrastructure as Code security scanner (YAML, JSON, Terraform, etc.).

**Why use it:** Scans workflow files and configuration for security issues.

**Implementation:**
```bash
# Install
docker pull checkmarx/kics:latest

# Scan
docker run -v $(pwd):/path checkmarx/kics:latest scan -p /path --output-path results
```

**Integration Priority:** LOW - More relevant if using IaC heavily

**Estimated effort:** 3-4 hours

---

## Recommended Implementation Plan

### Phase 1: Quick Wins (2-4 weeks)
1. **GitHub CodeQL** - Best ROI, native integration
2. **Snyk** - Comprehensive vulnerability scanning
3. **TruffleHog** - Enhanced secret detection

### Phase 2: Enhanced Coverage (4-6 weeks)
4. **Semgrep** - Custom security rules
5. **Retire.js** - JavaScript library vulnerabilities
6. **OWASP Dependency-Check** - Additional vulnerability sources

### Phase 3: Advanced Features (6-8 weeks)
7. **GitGuardian** - Pre-commit secret prevention
8. **SonarCloud** - Code quality tracking
9. **Socket Security** - Supply chain attack detection

## Integration Considerations

### Performance Impact
- Running all tools would significantly increase build time
- Consider running some tools only on main branch or scheduled basis
- Use caching to speed up repeated scans

### False Positives
- More tools = more potential false positives
- Implement suppression/exception mechanisms
- Maintain a `.securityignore` or similar file

### Cost Considerations
- Most tools have free tiers for open source projects
- Some require API keys or accounts
- GitHub CodeQL is free for public repos

### Workflow Structure
```yaml
# Suggested approach: Separate workflows by priority
jobs:
  critical-checks:  # Fast, runs on every PR
    - npm audit
    - CodeQL
    - Secret scanning
  
  extended-checks:  # Slower, runs on main or scheduled
    - Snyk
    - OWASP Dependency-Check
    - SonarCloud
```

## Summary

**Immediate Recommendations:**
1. **GitHub CodeQL** - Add semantic code analysis (highest priority)
2. **Snyk** - Enhanced vulnerability detection with fixes
3. **TruffleHog** - Better secret scanning

**Long-term Enhancements:**
- Semgrep for custom security patterns
- SonarCloud for code quality tracking
- Socket Security for supply chain attacks

All recommended tools integrate well with GitHub Actions and most offer free tiers for open source projects.

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Features](https://github.com/features/security)
- [npm Security Best Practices](https://docs.npmjs.com/security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
