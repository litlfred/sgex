# Manual Verification Guide for Branch Preview Fix

## Prerequisites

- GitHub Personal Access Token with appropriate permissions
- Access to https://litlfred.github.io/sgex/

## Testing Steps

### 1. Verify Main Deployment
1. Navigate to: https://litlfred.github.io/sgex/main/
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Look for: `SGEX route configuration loaded successfully - main`
5. Verify no "No routes matched location" errors
6. Verify the application loads correctly

**Expected:** Application loads without routing errors

### 2. Verify Branch Preview (doc_consolidate)
1. Navigate to: https://litlfred.github.io/sgex/doc_consolidate/
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Look for: 
   - `Loading SGEX route config from: /sgex/doc_consolidate/routes-config.json`
   - `SGEX route configuration loaded successfully - main`
5. Verify no "No routes matched location" errors
6. Verify the application loads correctly

**Expected:** Application loads without routing errors

### 3. Verify Branch Preview (Current Branch)
Once this branch is deployed:
1. Navigate to: https://litlfred.github.io/sgex/copilot-fix-branch-previews-issue/
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Look for: `Loading SGEX route config from: /sgex/copilot-fix-branch-previews-issue/routes-config.json`
5. Verify no routing errors

**Expected:** Application loads without routing errors

### 4. Verify Landing Page
1. Navigate to: https://litlfred.github.io/sgex/
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Look for: `SGEX route configuration loaded successfully - deploy`
5. Verify landing page loads correctly

**Expected:** Landing page loads correctly with deploy config

### 5. Verify Deep Linking
1. Navigate to: https://litlfred.github.io/sgex/doc_consolidate/dashboard
2. Verify the URL is handled correctly by 404.html
3. Check that routing works and config is loaded
4. Verify the dashboard page loads (or appropriate component)

**Expected:** Deep links work correctly

### 6. Network Tab Verification
1. Navigate to any branch preview
2. Open Developer Tools → Network tab
3. Filter by "config"
4. Verify request for `routes-config.json` returns 200 OK
5. Verify the path is absolute (e.g., `/sgex/{branch}/routes-config.json`)

**Expected:** Config file loaded successfully with 200 status

## Troubleshooting

### If you see "No routes matched location"
- Check Console for "Loading SGEX route config from: ..." message
- Verify the path shown matches the expected path
- Check Network tab to see if config file request failed (404)
- Verify the branch was built and deployed correctly

### If config file returns 404
- Check that the branch deployment workflow completed successfully
- Verify the build included the `routes-config.json` file
- Check that the workflow deployed to the correct directory

### If you see "Failed to load SGEX route configuration"
- Check the Console for detailed error message
- Verify the config file exists in the build output
- Check that `routeConfig.js` is loaded correctly
- Look for any JavaScript errors that might prevent execution

## Success Criteria

✅ No "No routes matched location" errors in console
✅ No "Failed to load SGEX route configuration" errors  
✅ Config files load with HTTP 200 status
✅ Absolute paths used for all config requests
✅ All deployment types work (main, branches, landing)
✅ Deep linking works correctly
✅ Application UI loads and is functional

## Reporting Issues

If you encounter any issues during verification:

1. Open browser Developer Tools
2. Copy the entire Console output
3. Go to Network tab and check the failed request (if any)
4. Take a screenshot showing the issue
5. Create a GitHub issue with:
   - URL you were testing
   - Console output
   - Network tab screenshot
   - Description of expected vs actual behavior
