# Deploy Branch Setup for Landing Page

This document explains the changes made to move the branch-listing functionality from the main branch to the deploy branch.

## What Changed

1. **Workflow Configuration**: The landing page deployment workflow now defaults to using the `deploy` branch instead of `main`
2. **File Location**: The workflow now looks for `index.html` at the root of the deploy branch instead of `public/branch-listing.html` in the main branch
3. **Deploy Branch Content**: The `deploy` branch now contains the branch-listing functionality as its `index.html`

## Setup Instructions

To complete the setup of the deploy branch with the branch-listing functionality:

### Option 1: Use the Setup Script (Recommended)

```bash
./setup-deploy-branch.sh
```

This script will:
- Fetch the latest main and deploy branches
- Copy `branch-listing.html` from main to deploy branch
- Replace the current `index.html` on deploy branch with the branch-listing functionality
- Backup the previous `index.html` as `index.html.backup`
- Commit the changes

### Option 2: Manual Setup

```bash
# Fetch latest branches
git fetch origin main:main
git fetch origin deploy:deploy

# Switch to deploy branch
git checkout deploy

# Copy branch-listing.html from main
git show main:public/branch-listing.html > index.html

# Commit the changes
git add index.html
git commit -m "Replace index.html with branch-listing functionality"

# Push to origin
git push origin deploy
```

## Benefits of This Approach

1. **Centralized Landing Page**: The deploy branch serves as the canonical source for the landing page
2. **Simplified Workflow**: No need to copy files from subdirectories during deployment
3. **Clear Separation**: Deploy branch contains exactly what should be deployed
4. **Maintained Flexibility**: Users can still specify any branch via the workflow input parameter

## Workflow Behavior

After setup:
- **Default**: Workflow uses `deploy` branch and deploys its `index.html`
- **Custom**: Users can still specify any other branch via the `source_branch` input
- **Assets**: Required assets (`sgex-mascot.png`, `favicon.ico`) are copied from the `public/` directory of the source branch

## Testing

To test the deployment:
1. Complete the setup above
2. Push the deploy branch: `git push origin deploy`
3. Run the "Deploy Branch Selector Landing Page" workflow manually
4. Verify the landing page at https://litlfred.github.io/sgex/

## Rollback

If you need to rollback to the previous behavior:
1. Change the workflow default back to `main`
2. Update the workflow to look for `public/branch-listing.html` instead of `index.html`
3. Restore the original `index.html` on the deploy branch from `index.html.backup`