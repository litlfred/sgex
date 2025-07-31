# SGEX Workbench Troubleshooting Guide

## Common Build Issues

### 1. ESLint Scope Module Not Found Error

**Error Message:**
```
Cannot find module '/path/to/node_modules/webpack/node_modules/eslint-scope/lib/index.js'. 
Please verify that the package.json has a valid "main" entry
```

**Cause:** This is a dependency resolution issue that can occur due to:
- Corrupted node_modules installation
- npm cache conflicts
- Node.js/npm version incompatibilities
- Working in temporary directories with restricted access

**Solutions (try in order):**

#### Solution 1: Clean Reinstall
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

#### Solution 2: Use npm ci for Clean Install
```bash
# Delete node_modules only (keep package-lock.json)
rm -rf node_modules

# Install using package-lock.json exactly
npm ci
```

#### Solution 3: Check Node.js/npm Versions
Ensure you're using compatible versions:
```bash
node --version  # Should be 16.x or higher
npm --version   # Should be 8.x or higher
```

If versions are incompatible, use nvm to switch:
```bash
nvm use 18
npm install
```

#### Solution 4: Work in Permanent Directory
If working in `/tmp` or temporary directories, move to a permanent location:
```bash
# Copy project to permanent location
cp -r /path/to/temp/project ~/sgex-workbench
cd ~/sgex-workbench
rm -rf node_modules package-lock.json
npm install
```

#### Solution 5: Platform-Specific Fixes

**macOS:**
```bash
# If using Homebrew node, try switching to nvm
brew uninstall node
brew install nvm
nvm install 18
nvm use 18
```

**Windows:**
```bash
# Run as administrator and clear all caches
npm cache clean --force
npm config delete cache
npm install
```

### 2. React Version Compatibility

The project uses React 19 with react-scripts 5.0.1. If you encounter compatibility issues:

```bash
# Check for peer dependency warnings
npm install --verbose

# If needed, update react-scripts (may require ejecting)
npm update react-scripts
```

### 3. Build Warnings

The following warnings are expected and do not affect functionality:
- Deprecated Babel plugins (they still work correctly)
- Deprecated packages (inflight, rimraf, etc.)
- Moderate security vulnerabilities in dev dependencies

To suppress warnings during development:
```bash
CI=true npm start
```

## Getting Help

If none of these solutions work:

1. Check the GitHub Issues page for similar problems
2. Provide the following information when reporting:
   - Operating system and version
   - Node.js and npm versions
   - Complete error message
   - Whether you're working in a temporary directory
   - Output of `npm list` command

## Verified Working Environment

The project is tested and working with:
- Node.js 18.x
- npm 8.x+
- macOS, Linux, and Windows
- Permanent directory (not /tmp)