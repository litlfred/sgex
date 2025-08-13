# Landing Page Deployment Branch Selection Test

This document demonstrates that the landing page deployment workflow now respects the source branch selection.

## Issue Fixed

Previously, the landing page deployment workflow was hardcoded to always checkout and deploy from the `main` branch, regardless of which branch the workflow was triggered from.

## Changes Made

### 1. Added `source_branch` Input Parameter

```yaml
workflow_dispatch:
  inputs:
    source_branch:
      description: 'Branch to deploy from (defaults to main)'
      required: false
      type: string
      default: 'main'
```

### 2. Made Checkout Dynamic

**Before:**
```yaml
- name: Checkout main branch
  uses: actions/checkout@v4
  with:
    ref: main
```

**After:**
```yaml
- name: Checkout source branch
  uses: actions/checkout@v4
  with:
    ref: ${{ github.event.inputs.source_branch || 'main' }}
```

### 3. Updated All References

All build messages, commit messages, and deployment summaries now show the actual source branch being used instead of hardcoded "main".

## How to Test

1. Go to **Actions** → **Deploy Landing Page** in the GitHub repository
2. Click **"Run workflow"**
3. You will now see a **"Branch to deploy from"** input field
4. Select a different branch (e.g., a feature branch)
5. The workflow will:
   - Checkout the selected branch
   - Use that branch's source code and build scripts
   - Build the React application from that branch
   - Deploy the landing page built from that branch

## Expected Behavior

- **Default behavior**: If no branch is specified, it defaults to `main` (backward compatible)
- **Custom branch**: When a branch is specified, it uses that branch's source code
- **Build messages**: Show "Building from source branch: {branch-name}"
- **Commit messages**: Reflect the actual source branch used
- **Deployment summary**: Shows the correct source branch

## User Benefits

1. **Test landing page changes**: Users can test landing page modifications from feature branches before merging to main
2. **Safe experimentation**: Deploy from experimental branches without affecting the main deployment
3. **PR validation**: Validate that landing page changes work correctly before committing to main

## Compatibility

- **Backward compatible**: Existing workflows continue to work (defaults to main)
- **No breaking changes**: All existing functionality preserved
- **Enhanced flexibility**: New capability to deploy from any branch

This fix enables the workflow to behave as documented in `DEPLOYMENT.md` where it states the workflow "Can be triggered from any branch" and "Uses build scripts from the triggering branch".