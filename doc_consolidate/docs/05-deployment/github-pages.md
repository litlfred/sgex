# Multi-Branch GitHub Pages Deployment

This repository now supports safe, robust multi-branch deployment to GitHub Pages with the following features:

## Overview

- **Multi-Branch Previews**: Each branch is automatically deployed to its own subdirectory (`/sgex/branch-name/`)
- **Discoverable Landing Page**: Root page lists all branch previews with cards/buttons
- **Safety Validation**: All operations use `readlink -f` validation to prevent dangerous operations
- **Git-Based Cleanup**: Uses `git rm -rf` for safe cleanup (never `rm -rf` on repo root)
- **React Framework Consistency**: Landing page and previews use the same React framework

## Deployment Structure

```
https://litlfred.github.io/sgex/
├── index.html                    # Root landing page (lists all branches)
├── sgex/
│   ├── main/
│   │   └── index.html           # Main branch preview
│   ├── feature-x/
│   │   └── index.html           # Feature branch preview (if branch is "feature/x", becomes "feature-x")
│   └── develop/
│       └── index.html           # Develop branch preview
└── [other GitHub Pages files]
```

## How It Works

### 1. Branch-Specific Builds
When code is pushed to any branch (except `gh-pages`):
- React app is built with `/sgex/` basename for branch preview
- Branch names with slashes are converted to safe directory names (e.g., `feature/test` → `feature-test`)
- Deployed to `gh-pages/sgex/safe-branch-name/`
- Previous deployment for that branch is safely cleaned up

### 2. Root Landing Page
- Built with `/` basename for root deployment
- Uses GitHub API to enumerate all branches
- Displays interactive cards/buttons for each branch preview
- Updates automatically as branches are added/removed

### 3. Safety Features
- **Branch Validation**: `readlink -f` ensures target directories are safe
- **Path Validation**: Prevents operations outside repository root
- **Git-Based Operations**: Uses `git rm -rf` for cleanup (not `rm -rf`)
- **Never Runs on gh-pages**: Workflow specifically excludes `gh-pages` branch

## Build Scripts

### `npm run build:multi-branch branch`
Builds branch-specific React app for deployment to subdirectory:
- Uses `/sgex/` basename
- Standard React build output
- Ready for deployment to `/sgex/branch-name/`

### `npm run build:multi-branch root`
Builds root landing page for GitHub Pages root:
- Uses `/` basename  
- Only renders `BranchListing` component
- Includes branch enumeration and cards

## Workflow Features

The GitHub Actions workflow (`.github/workflows/pages.yml`) includes:

1. **Safety Validation**: Multiple checks before any destructive operations
2. **Branch Directory Validation**: Ensures paths are safe using `readlink -f`
3. **Git-Based Cleanup**: Uses `git rm -rf` to safely remove old deployments
4. **Atomic Deployment**: All changes committed and pushed together
5. **Detailed Logging**: Clear output for debugging and monitoring

## Branch Listing Component

The `BranchListing` component:
- Fetches branches using GitHub API (no authentication required for public repo)
- Displays cards with branch name, commit hash, and last modified date
- Provides links to branch previews
- Handles loading and error states gracefully
- Uses responsive design for mobile/desktop

## Security Considerations

- All directory operations validated with `readlink -f`
- Branch names with slashes converted to safe directory names (replace `/` with `-`)
- Branch names sanitized for safe filesystem operations
- No operations performed on repository root
- Git-managed cleanup prevents accidental deletions
- Workflow never runs on `gh-pages` branch

## Files Added/Modified

### New Files:
- `src/components/BranchListing.js` - Root landing page component
- `src/components/BranchListing.css` - Styling for branch cards
- `scripts/build-multi-branch.js` - Multi-mode build script
- `docs/DEPLOYMENT.md` - This documentation

### Modified Files:
- `.github/workflows/pages.yml` - New multi-branch workflow
- `package.json` - Added build:multi-branch script

### Backup Files:
- `.github/workflows/pages-old.yml.backup` - Original workflow backup

## Testing

The implementation can be tested by:
1. Pushing to any branch (triggers branch-specific deployment)
2. Checking the landing page at `https://litlfred.github.io/sgex/`
3. Clicking branch preview cards to view individual branches
4. Verifying safety with unusual branch names

## Cat-Themed Fun 🐱

As requested for litlfred, the landing page includes:
- Cat emoji (🐱) in the title
- Paw print emoji (🐾) in footer text
- Cat-friendly language throughout
- SGEX mascot integration

## Support

For issues or questions about the multi-branch deployment:
1. Check workflow logs in GitHub Actions
2. Verify branch names don't contain unsafe characters
3. Ensure builds complete successfully locally
4. Review safety validation output in logs