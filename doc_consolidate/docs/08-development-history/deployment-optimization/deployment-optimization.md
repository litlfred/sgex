# Landing Page Deployment Optimization

## Problem Fixed

The landing page deployment was creating massive git commits (86,955+ files) that caused git warnings about exhaustive rename detection being skipped. This was due to the deployment strategy including `node_modules` and other development artifacts in the gh-pages branch.

## Solution Implemented

### Optimized Deployment Strategy

1. **Build Isolation**: Build files are preserved in `/tmp/deployment-build` before any git operations
2. **Source Cleanup**: Remove `node_modules`, `build`, and artifacts before git checkout to prevent tracking
3. **Rebase-First Approach**: Follow `git pull --rebase` strategy as requested in issue
4. **Selective File Management**: 
   - Remove only root-level conflicting files
   - Preserve all branch subdirectories (e.g., `main-branch/`, `feature-xyz/`)
   - Deploy only built React files (~145 files instead of 86,955+)
5. **Branch Filtering**: Skip deployments for copilot-* branches as requested

### File Count Reduction

- **Before**: 86,955 files (including node_modules, source files, etc.)
- **After**: ~145 files (only React build output)
- **Reduction**: 99.8% fewer files per deployment

### Git Operation Improvements

- Eliminates "exhaustive rename detection" warnings
- Dramatically reduces commit size and processing time
- Cleaner git history with meaningful changes only
- Proper rebase handling for concurrent deployments

## Workflow Steps

1. **Checkout source branch** (e.g., `deploy`)
2. **Build React app** with proper PUBLIC_URL
3. **Preserve build** in temp directory 
4. **Clean source workspace** to avoid git conflicts
5. **Checkout gh-pages** with latest rebase
6. **Deploy selectively** preserving branch subdirectories
7. **Commit minimal changes** with clear messaging

## Expected Results

- ✅ Fast deployments with minimal file changes
- ✅ No more git rename detection warnings  
- ✅ Preserved branch preview functionality
- ✅ Clean git history focused on actual deployment changes
- ✅ Compatibility with existing branch structure

This optimization addresses issue #662 by implementing the exact deployment strategy requested in the issue description.