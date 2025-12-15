# URL Routing Fix Documentation

## Issue Summary

Users editing URLs in the browser or opening links from external apps would get 404 errors and need to manually navigate back to the home page. This affected both authenticated and non-authenticated users trying to access DAK components directly.

## Problem Analysis

The original 404.html had overly complex routing logic that:
1. Dynamically loaded route configuration files
2. Used complex URL parsing with dependency on external configuration
3. Waited for asynchronous script loading before routing
4. Had potential race conditions and failure points

## Solution Implemented

### 1. Simplified 404.html Logic
- Replaced complex configuration loading with hardcoded component lists
- Uses self-contained routing script with no external dependencies
- Immediate execution without async loading delays

### 2. Reliable URL Pattern Detection
- Hardcoded lists of known DAK components and standard components
- Clear distinction between component URLs and branch deployment URLs
- Fallback handling for unrecognized paths

### 3. Standard SPA Redirect Pattern
- Uses proven GitHub Pages SPA redirect mechanism
- Encodes path in query parameter: `/?/dashboard/user/repo/branch`
- Works reliably across all deployment scenarios

## URL Patterns Supported

### GitHub Pages Deployment
- **Direct DAK Component**: `/sgex/dashboard/user/repo/branch` → `/sgex/?/dashboard/user/repo/branch`
- **Branch Deployment**: `/sgex/main/dashboard/user/repo` → `/sgex/main/?/dashboard/user/repo`  
- **Testing Viewer**: `/sgex/testing-viewer/user/repo` → `/sgex/?/testing-viewer/user/repo`

### Standalone Deployment
- **DAK Component**: `/dashboard/user/repo/branch` → `/?/dashboard/user/repo/branch`

## How It Works

### Step 1: 404.html Redirect
When user accesses non-existent path like `/sgex/dashboard/demo-user/test-dak/main`:
1. GitHub Pages serves 404.html
2. JavaScript detects "dashboard" is a known DAK component
3. Redirects to `/sgex/?/dashboard/demo-user/test-dak/main`

### Step 2: SPA Restoration
When React app loads at the redirected URL:
1. index.html SPA script detects query parameter format
2. Restores original path: `/sgex/dashboard/demo-user/test-dak/main`
3. Updates browser history without page reload

### Step 3: React Router Processing
1. React Router matches route pattern: `/dashboard/:user/:repo/:branch?`
2. useParams() extracts: `{user: "demo-user", repo: "test-dak", branch: "main"}`
3. DAKDashboard component receives parameters and loads context

### Step 4: Context Loading
DAKDashboard component handles both scenarios:
- **Authenticated users**: Fetches real repository data via GitHub API
- **Non-authenticated users**: Creates appropriate profile/repository objects for public access or demo mode

## Testing

### Automated Tests
- `scripts/test-404-routing.js`: Tests 404.html redirect behavior
- `scripts/test-url-integration.js`: Tests complete end-to-end flow
- All test cases pass for various URL patterns and deployment scenarios

### Manual Testing
- `public/test-url-routing.html`: Interactive test page for browser validation
- Tests GitHub Pages, standalone, and branch deployment scenarios

## Key Benefits

1. **Robust**: No external dependencies or async loading failures
2. **Simple**: Clear, readable logic with explicit component lists  
3. **Comprehensive**: Handles all deployment scenarios and URL patterns
4. **Compatible**: Works with existing React Router and SPA infrastructure
5. **User-Friendly**: Seamless experience for both authenticated and non-authenticated users

## Components Supported

### DAK Components
- dashboard, testing-viewer, core-data-dictionary-viewer
- health-interventions, actor-editor, business-process-selection  
- bpmn-editor, bpmn-viewer, bpmn-source, decision-support-logic
- questionnaire-editor

### Standard Components
- select_profile, dak-action, dak-selection, organization-selection
- dak-configuration, repositories, test-dashboard, docs, pages
- test-framework, test-documentation, test-asset-editor

## Deployment Scenarios

### GitHub Pages Root (`/sgex/`)
- Landing page deployment from deploy branch
- Handles component redirects to main application

### GitHub Pages Branch (`/sgex/main/`, `/sgex/feature-branch/`)
- Individual branch deployments with their own routing
- Supports feature branch previews

### Standalone Deployment
- Local or custom server deployment
- Root-level routing without `/sgex/` prefix

## Migration Notes

The fix is backward compatible and requires no changes to:
- React components or routing configuration
- Existing URL structures or navigation
- Authentication or session management
- DAK component parameter extraction logic

The solution preserves all existing functionality while fixing the direct URL access issue that was preventing users from editing URLs or accessing external links properly.