# Deploy Branch Fix Required

The `deploy` branch needs to be updated with the same ESLint fix that was applied to this PR.

## Issue
The `deploy` branch currently has an unused parameter in `src/components/BranchListingPage.js` that causes ESLint errors when building with `CI=true` (as in the landing page deployment workflow).

## Required Change
In `src/components/BranchListingPage.js`, line 33:

### Before (Current deploy branch):
```javascript
const handleAuthSuccess = (token, octokitInstance) => {
    setGithubToken(token);
    setIsAuthenticated(true);
    sessionStorage.setItem('github_token', token);
};
```

### After (Required fix):
```javascript
const handleAuthSuccess = (token) => {
    setGithubToken(token);
    setIsAuthenticated(true);
    sessionStorage.setItem('github_token', token);
};
```

## Why This Fix is Needed
1. The landing page deployment workflow (`landing-page-deployment.yml`) defaults to deploying from the `deploy` branch
2. The build process runs with `CI=true` which treats ESLint warnings as errors
3. The unused `octokitInstance` parameter causes an ESLint warning that fails the build
4. This prevents the landing page from being deployed successfully

## How to Apply the Fix
```bash
git checkout deploy
# Edit src/components/BranchListingPage.js to remove the unused parameter
git add src/components/BranchListingPage.js
git commit -m "Fix ESLint error: Remove unused octokitInstance parameter"
git push origin deploy
```

## Verification
After applying this fix, the landing page deployment workflow should build successfully when deploying from the `deploy` branch.