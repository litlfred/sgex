# Compliance Framework

The SGeX Workbench includes a comprehensive compliance framework to ensure all components follow the established framework requirements. This framework includes automated tests, CI/CD integration, and developer tools.

## Overview

The compliance framework validates:

1. **Profile Creation Compliance**: Ensures components create user profiles correctly
2. **Page Framework Compliance**: Validates page structure and layout usage
3. **GitHub Service Compliance**: Checks proper GitHub API usage patterns

## Profile Creation Compliance

### Requirements

Components that create user profiles **MUST** follow these rules:

#### ✅ CORRECT Patterns:

1. **Demo Users Only**: Set `isDemo: true` ONLY for explicit demo mode (`user === 'demo-user'`)
   ```javascript
   if (user === 'demo-user') {
     setProfile({
       login: user,
       isDemo: true  // ✅ Only for demo-user
     });
   }
   ```

2. **Unauthenticated Users**: Create profiles WITHOUT `isDemo` flag for real user access
   ```javascript
   if (!githubService.isAuth() && user !== 'demo-user') {
     setProfile({
       login: user,
       // ✅ NO isDemo flag for real public repositories
     });
   }
   ```

3. **Authenticated Users**: Never set `isDemo` flag
   ```javascript
   const profile = await githubService.getUser(user);
   setProfile(profile); // ✅ GitHub API returns real profile
   ```

#### ❌ INCORRECT Patterns:

```javascript
// ❌ Setting isDemo for all unauthenticated users
if (!githubService.isAuth()) {
  setProfile({ login: user, isDemo: true });
}

// ❌ Setting isDemo based on authentication alone  
setProfile({ login: user, isDemo: !githubService.isAuth() });
```

### Violation Types

The compliance test detects these violation types:

- **INCORRECT_SETPROFILE_ISDEMO**: `setProfile()` calls that set `isDemo` incorrectly
- **UNCONDITIONAL_ISDEMO_TRUE**: Profile objects that set `isDemo: true` without proper conditions
- **INCORRECT_ISDEMO_PATTERN**: Direct assignment patterns that conflate authentication with demo mode

## Running Compliance Tests

### Manual Testing

```bash
# Run profile creation compliance only
npm run compliance:profile

# Run all compliance tests
npm run compliance:all

# Run compliance tests through Jest
npm run test:compliance
```

### CI/CD Integration

The compliance framework is integrated into the GitHub Actions workflow:

- **Trigger**: Pull requests that modify component, hook, or service files
- **Process**: Runs both framework and profile creation compliance checks
- **Output**: Comments on PR with detailed compliance report
- **Enforcement**: Prevents merging if compliance violations are found

### Workflow File

The compliance checks are defined in `.github/workflows/framework-compliance.yml` and include:

1. Framework structure compliance check
2. Profile creation compliance check  
3. Automated PR comments with results
4. Required status checks for merging

## Test Implementation

### ProfileCreationComplianceTest Class

Located in `src/tests/compliance/profileCreationCompliance.js`, this class:

- Scans all JavaScript/JSX files in the repository
- Analyzes profile creation patterns using AST-like parsing
- Detects violations and categorizes them by severity
- Provides detailed violation reports with context
- Supports both standalone and Jest test runner execution

### Key Methods

- `runCompliance()`: Main entry point for compliance checking
- `scanDirectory()`: Recursively scans source directories  
- `checkProfileCreationPatterns()`: Analyzes file content for violations
- `reportResults()`: Generates human-readable compliance reports
- `getComplianceStatus()`: Returns machine-readable status for CI/CD

## Developer Workflow

### Before Committing

1. Run compliance checks locally:
   ```bash
   npm run compliance:all
   ```

2. Fix any violations identified

3. Commit changes

### During PR Review

1. Automated compliance check runs on PR creation
2. Review compliance results in PR comments
3. Address any violations before merging
4. Compliance status must pass for PR approval

### Common Violations and Fixes

#### Violation: Unauthenticated users getting demo content

**Problem:**
```javascript
if (!githubService.isAuth()) {
  setProfile({ login: user, isDemo: true }); // ❌ Wrong
}
```

**Fix:**
```javascript
if (!githubService.isAuth()) {
  if (user === 'demo-user') {
    setProfile({ login: user, isDemo: true }); // ✅ Demo only
  } else {
    setProfile({ login: user }); // ✅ Public access
  }
}
```

#### Violation: Direct isDemo assignment

**Problem:**
```javascript
profile.isDemo = !githubService.isAuth(); // ❌ Wrong
```

**Fix:**
```javascript
if (user === 'demo-user') {
  profile.isDemo = true; // ✅ Demo only
}
// ✅ Otherwise, no isDemo flag
```

## Extending the Compliance Framework

### Adding New Compliance Rules

1. Create a new compliance test class in `src/tests/compliance/`
2. Follow the pattern of `ProfileCreationComplianceTest`
3. Add npm script to `package.json`
4. Update CI/CD workflow to include new check
5. Document new requirements in `public/docs/page-framework.md`

### Test Class Structure

```javascript
class MyComplianceTest {
  constructor() {
    this.violations = [];
    this.scannedFiles = [];
  }

  async runCompliance() {
    // Scan files and check patterns
    this.reportResults();
    return this.violations.length === 0;
  }

  checkPatterns(content, filePath) {
    // Analyze file content for violations
  }

  reportResults() {
    // Generate compliance report
  }

  getComplianceStatus() {
    // Return machine-readable status
  }
}
```

### Integration Checklist

- [ ] Test class implements required methods
- [ ] Jest wrapper test created  
- [ ] npm script added to package.json
- [ ] CI/CD workflow updated
- [ ] Documentation updated
- [ ] Manual testing completed

## Benefits

The compliance framework provides:

1. **Consistency**: Ensures all components follow established patterns
2. **Quality**: Prevents common mistakes through automated detection
3. **Documentation**: Serves as executable documentation of requirements
4. **Enforcement**: Prevents non-compliant code from entering main branch
5. **Education**: Helps developers understand framework requirements
6. **Maintenance**: Scales compliance checking as codebase grows

## Future Enhancements

Potential additions to the compliance framework:

- **Accessibility compliance**: Check for ARIA attributes and semantic HTML
- **Performance compliance**: Validate lazy loading and optimization patterns
- **Security compliance**: Check for secure coding practices
- **Testing compliance**: Ensure adequate test coverage for components
- **Documentation compliance**: Validate component documentation standards