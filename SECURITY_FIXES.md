# Security Vulnerability Fixes

This document describes the security fixes applied to address npm audit vulnerabilities.

## Fixed Vulnerabilities

The following vulnerabilities have been resolved using npm overrides in package.json:

### 1. nth-check (High Severity)
- **Issue**: Inefficient Regular Expression Complexity
- **CVE**: GHSA-rp65-9cf3-cjxr
- **Fix**: Upgraded to nth-check@2.1.1 via package.json overrides

### 2. postcss (Moderate Severity)  
- **Issue**: PostCSS line return parsing error
- **CVE**: GHSA-7fh5-64p2-3v2j
- **Fix**: Upgraded to postcss@8.5.6 via package.json overrides

### 3. webpack-dev-server (Moderate Severity)
- **Issue**: Source code theft vulnerability
- **CVE**: GHSA-9jgg-88mc-972h, GHSA-4v9v-hfq4-rm2v
- **Fix**: Upgraded to webpack-dev-server@5.2.1 via package.json overrides

## Resolved Deprecation Warnings

The following deprecated packages have been updated to their modern equivalents via npm overrides to eliminate deprecation warnings:

### Package Updates
- **rimraf**: Upgraded from 3.0.2 to ^5.0.10
- **glob**: Upgraded from 7.2.3 to ^10.4.5
- **sourcemap-codec**: Replaced with @jridgewell/sourcemap-codec@^1.5.4
- **rollup-plugin-terser**: Replaced with @rollup/plugin-terser@^0.4.4
- **@humanwhocodes/config-array**: Replaced with @eslint/config-array@^0.21.0
- **@humanwhocodes/object-schema**: Replaced with @eslint/object-schema@^2.1.6
- **svgo**: Upgraded from 1.3.2 to ^2.8.0

### Remaining Deprecation Warnings

The following deprecation warnings remain and cannot be resolved without major version updates to react-scripts:

- **Babel proposal plugins**: Multiple deprecated @babel/plugin-proposal-* packages that have been merged into ECMAScript standard
- **ESLint**: Version 8.57.1 is deprecated but required by react-scripts@5.0.1
- **Other transitive dependencies**: stable, abab, domexception, w3c-hr-time, q, workbox packages

These warnings originate from react-scripts@5.0.1 and would require upgrading to react-scripts@6.x or later to resolve, which may introduce breaking changes.

## Development Notes

Due to API changes between webpack-dev-server 4.x and 5.x, the `npm start` command may not work properly. This is because react-scripts@5.0.1 was built for webpack-dev-server 4.x.

### Alternative Development Options

1. **Use the build and serve script**:
   ```bash
   npm run serve
   ```
   This builds the project and serves it via Python's built-in HTTP server.

2. **Use the build folder manually**:
   ```bash
   npm run build
   cd build
   python3 -m http.server 3000
   ```

### Production Impact

- **No impact on production builds**: `npm run build` works perfectly
- **No impact on tests**: `npm test` works perfectly  
- **All security vulnerabilities resolved**: `npm audit` shows 0 vulnerabilities
- **Deprecation warnings significantly reduced**: 7+ warnings resolved

The development server issue only affects the development workflow, not the final application functionality.