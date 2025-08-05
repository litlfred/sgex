# Deploy Branch Setup for React-based Landing Page

This document provides detailed instructions for setting up the deploy branch to use React-based branch listing functionality as the landing page.

## Overview

The deploy branch has been restructured to contain a React application that builds to a landing page with branch-listing functionality. This replaces the previous approach of using standalone HTML files.

## Key Changes

### From Standalone HTML to React Build
- **Previous**: Standalone `index.html` with embedded JavaScript
- **New**: React application that builds to production-ready static files
- **Benefit**: Proper build process, optimized assets, maintainable code structure

### Deploy Branch Structure
The deploy branch now contains:
- **React source code** (`src/` directory)
- **Build configuration** (`package.json`, build scripts)
- **Component-based architecture** (BranchDeploymentSelector component)
- **No build artifacts** in source control (clean separation)

## Automated Setup

### Quick Setup (Recommended)

Run the automated setup script:

```bash
./setup-deploy-branch-react.sh
```

This script will:
1. ✅ Switch to the deploy branch
2. ✅ Create the BranchDeploymentSelector React component
3. ✅ Create associated CSS styles
4. ✅ Update App.js to use the new component
5. ✅ Clean up standalone files and build artifacts
6. ✅ Test the React build process
7. ✅ Commit changes to the deploy branch
8. ✅ Return to your original branch

### Manual Setup

If you prefer manual setup or the script fails:

#### 1. Switch to Deploy Branch
```bash
git checkout deploy
```

#### 2. Create BranchDeploymentSelector Component
Create `src/components/BranchDeploymentSelector.js` with the branch listing React component code.

#### 3. Create Component Styles
Create `src/components/BranchDeploymentSelector.css` with the styling for the component.

#### 4. Update App.js
Update `src/App.js` to use BranchDeploymentSelector as the main component:

```javascript
import React from 'react';
import BranchDeploymentSelector from './components/BranchDeploymentSelector';
import './App.css';

function App() {
  return (
    <div className="App">
      <BranchDeploymentSelector />
    </div>
  );
}

export default App;
```

#### 5. Update Package.json
Set homepage to root since this will be the landing page:
```json
{
  "homepage": "/"
}
```

#### 6. Clean Up Deploy Branch
Remove standalone files:
```bash
# Remove standalone index.html
rm -f index.html

# Remove build artifacts
rm -f asset-manifest.json service-worker.js robots.txt

# Remove root static directory if it exists
rm -rf static
```

#### 7. Test the Build
```bash
npm install
npm run build
```

#### 8. Commit Changes
```bash
git add -A
git commit -m "🚀 Restructure deploy branch for React-based branch listing"
```

## Workflow Integration

### Updated Deployment Process

The landing page deployment workflow now:

1. **Checks out** the deploy branch
2. **Installs** Node.js dependencies (`npm ci`)
3. **Builds** the React application (`npm run build`)
4. **Deploys** the build output to gh-pages root
5. **Preserves** all existing branch subdirectories

### Build Output

The React build generates:
- **`build/index.html`** - Main landing page
- **`build/static/`** - Optimized CSS and JavaScript bundles
- **`build/assets/`** - Static assets (images, icons, etc.)

### Key Workflow Changes

**Before (Standalone HTML):**
```yaml
- name: Prepare landing page files
  # Copy standalone index.html and assets
  
- name: Deploy to gh-pages
  # Copy static files directly
```

**After (React Build):**
```yaml
- name: Install dependencies
  # npm ci
  
- name: Build React application
  # npm run build
  
- name: Deploy to gh-pages
  # Copy build output
```

## Benefits

### Development Benefits
- **Component-based architecture** - Maintainable, reusable code
- **Modern tooling** - Hot reload, bundling, optimization
- **Type safety** - Can add TypeScript support if needed
- **Testing framework** - Built-in Jest testing support

### Deployment Benefits
- **Optimized assets** - Minified, compressed, cached
- **Build-time optimization** - Dead code elimination, tree shaking
- **Progressive enhancement** - Better performance and SEO
- **Consistent workflow** - Same build process as other React apps

### Maintenance Benefits
- **Single source of truth** - Deploy branch contains source, not build artifacts
- **Version control** - All changes tracked in source, not generated files
- **Clean separation** - Source code vs. build output clearly separated
- **Automated testing** - Build process validates code before deployment

## Troubleshooting

### Build Failures

If the React build fails:

1. **Check Node.js version** - Ensure compatible version
2. **Install dependencies** - Run `npm install` or `npm ci`
3. **Check for errors** - Review build output for specific errors
4. **Validate code** - Ensure valid React/JavaScript syntax

### Missing Assets

If assets don't load properly:

1. **Check public directory** - Ensure assets are in `public/`
2. **Verify paths** - Check that component references correct asset paths
3. **Build output** - Verify assets are copied to `build/` directory
4. **Deployment** - Ensure assets are deployed to gh-pages

### Component Issues

If the BranchDeploymentSelector doesn't work:

1. **Check API calls** - Verify GitHub API requests work
2. **Check console** - Look for JavaScript errors in browser console
3. **Check network** - Verify network requests succeed
4. **Check data** - Ensure PR data is loaded correctly

## Migration Notes

### From Previous Setup

If you previously had the standalone HTML setup:

1. **Backup existing index.html** - The script creates automatic backups
2. **Test thoroughly** - Ensure all functionality works in React version
3. **Update any custom modifications** - Port changes to React component
4. **Verify asset paths** - Ensure all images and links work correctly

### Rollback Procedure

If you need to rollback to standalone HTML:

1. **Restore backup** - Use the created `.backup` file
2. **Revert commits** - Use `git revert` to undo React changes
3. **Update workflow** - Revert workflow to previous configuration
4. **Test deployment** - Ensure standalone version works

## Additional Resources

- **React Documentation** - https://reactjs.org/docs/
- **Create React App** - https://create-react-app.dev/docs/
- **GitHub Pages** - https://pages.github.com/
- **SGEX Repository** - https://github.com/litlfred/sgex

## Support

For issues with the deploy branch setup:

1. **Check this documentation** - Review troubleshooting section
2. **Check workflow logs** - Review GitHub Actions logs for errors
3. **Create an issue** - Open issue in SGEX repository with details
4. **Ask for help** - Contact the development team