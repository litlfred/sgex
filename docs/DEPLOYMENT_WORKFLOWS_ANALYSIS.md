# SGEX Deployment Workflows and File Distribution Analysis

## Overview
This document provides a comprehensive analysis of how SGEX deploys across different scenarios and how the critical files (`index.html` and `404.html`) are distributed and function in each deployment type.

## Deployment Architecture Overview

```mermaid
flowchart TD
    A[SGEX Repository] --> B{Branch Type}
    
    B -->|deploy branch| C[Landing Page Deployment]
    B -->|main branch| D[Main Application Deployment]
    B -->|feature-* branch| E[Feature Branch Deployment]
    
    C --> F[GitHub Pages: litlfred.github.io/sgex/]
    D --> G[GitHub Pages: litlfred.github.io/sgex/main/]
    E --> H[GitHub Pages: litlfred.github.io/sgex/feature-branch/]
    
    F --> I[Minimal functionality<br/>Branch selection only]
    G --> J[Full SGEX application<br/>All DAK components]
    H --> K[Full SGEX application<br/>Feature preview]
    
    I --> L[Uses routes-config.deploy.json]
    J --> M[Uses routes-config.json]
    K --> M
    
    style C fill:#fff3cd
    style D fill:#d4edda
    style E fill:#cce5ff
```

## Detailed Deployment Scenarios

### 1. Landing Page Deployment (Deploy Branch)

**Location**: `https://litlfred.github.io/sgex/`
**Source Branch**: `deploy`
**Purpose**: Minimal entry point for branch selection

#### File Structure:
```
/sgex/
├── index.html                 # Main React app entry point
├── 404.html                   # Routing fallback for all URLs
├── routeConfig.js             # Route configuration loader
├── routes-config.deploy.json  # Minimal component configuration
├── static/                    # React build assets
│   ├── css/
│   ├── js/
│   └── media/
└── manifest.json             # PWA manifest
```

#### Deployment Workflow:
```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Deploy as Deploy Branch
    participant Action as GitHub Action
    participant Pages as GitHub Pages

    Dev->>Deploy: Push changes to deploy branch
    Deploy->>Action: Trigger sgex-deploy-branch.yml workflow
    Action->>Action: npm run build (with deploy branch config)
    Action->>Action: Copy routes-config.deploy.json
    Action->>Pages: Deploy to litlfred.github.io/sgex/
    Pages->>Pages: Serve index.html at root
    Pages->>Pages: Use 404.html for SPA routing
```

#### Key Characteristics:
- **Limited Functionality**: Only basic branch selection and navigation
- **Simplified Configuration**: Uses `routes-config.deploy.json` with minimal components
- **Entry Point Role**: Primary entry for users to select working branches
- **Static Asset Base**: All assets served from `/sgex/` path

### 2. Main Branch Deployment

**Location**: `https://litlfred.github.io/sgex/main/`
**Source Branch**: `main`
**Purpose**: Full production application

#### File Structure:
```
/sgex/main/
├── index.html                 # Full React app entry point
├── 404.html                   # Routing fallback (same as deploy)
├── routeConfig.js             # Route configuration loader
├── routes-config.json         # Full component configuration
├── static/                    # React build assets
│   ├── css/
│   ├── js/
│   └── media/
└── manifest.json             # PWA manifest
```

#### Deployment Workflow:
```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Main as Main Branch
    participant Action as GitHub Action
    participant Pages as GitHub Pages

    Dev->>Main: Merge PR to main branch
    Main->>Action: Trigger sgex-main-deploy.yml workflow
    Action->>Action: npm run build (with full config)
    Action->>Action: Copy routes-config.json
    Action->>Pages: Deploy to litlfred.github.io/sgex/main/
    Pages->>Pages: Serve index.html at /main/
    Pages->>Pages: Use same 404.html for routing
```

#### Key Characteristics:
- **Full Functionality**: All DAK components and features available
- **Complete Configuration**: Uses `routes-config.json` with all components
- **Production Environment**: Stable, tested version of the application
- **Shared 404.html**: Uses the same routing logic as deploy branch

### 3. Feature Branch Deployments

**Location**: `https://litlfred.github.io/sgex/{branch-name}/`
**Source Branch**: Any `feature-*` or custom branch
**Purpose**: Preview deployments for development

#### File Structure:
```
/sgex/feature-branch/
├── index.html                 # Full React app entry point
├── 404.html                   # Routing fallback (same as others)
├── routeConfig.js             # Route configuration loader
├── routes-config.json         # Full component configuration
├── static/                    # React build assets
│   ├── css/
│   ├── js/
│   └── media/
└── manifest.json             # PWA manifest
```

#### Deployment Workflow:
```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Feature as Feature Branch
    participant Action as GitHub Action
    participant Pages as GitHub Pages

    Dev->>Feature: Push changes to feature branch
    Feature->>Action: Trigger sgex-feature-deploy.yml workflow
    Action->>Action: npm run build (with full config)
    Action->>Action: Copy routes-config.json
    Action->>Pages: Deploy to litlfred.github.io/sgex/branch-name/
    Pages->>Pages: Serve index.html at /branch-name/
    Pages->>Pages: Use same 404.html for routing
```

#### Key Characteristics:
- **Development Preview**: Allows testing features before merge
- **Full Functionality**: Same as main branch but isolated
- **Temporary**: May be cleaned up when branch is merged/deleted
- **Independent**: Each feature branch gets its own deployment path

## Critical File Analysis

### index.html Distribution and Function

#### Common Structure Across All Deployments:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>SGEX Workbench</title>
    <!-- Security headers -->
    <!-- Load SGEX route configuration service -->
    <script src="./routeConfig.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <!-- React app bundle scripts injected here by build process -->
  </body>
</html>
```

#### Deployment-Specific Differences:

| Aspect | Deploy Branch | Main Branch | Feature Branch |
|--------|---------------|-------------|----------------|
| **Base Path** | `/sgex/` | `/sgex/main/` | `/sgex/branch-name/` |
| **Asset Paths** | `./static/` | `./static/` | `./static/` |
| **Route Config** | `./routeConfig.js` | `./routeConfig.js` | `./routeConfig.js` |
| **Bundle Size** | Minimal | Full | Full |
| **Component Access** | Limited | Complete | Complete |

### 404.html Distribution and Function

#### Universal 404.html Strategy:
The 404.html file is **identical across all deployments** and contains the complete routing logic to handle any URL pattern.

```mermaid
flowchart TD
    A[Single 404.html Source] --> B[Deploy Branch Copy]
    A --> C[Main Branch Copy]
    A --> D[Feature Branch Copy]
    
    B --> E[Handles /sgex/ URLs]
    C --> F[Handles /sgex/main/ URLs]
    D --> G[Handles /sgex/branch/ URLs]
    
    E --> H[Same routing logic]
    F --> H
    G --> H
    
    H --> I[Dynamic deployment detection]
    I --> J[Appropriate redirect strategy]
```

#### 404.html Deployment Detection Logic:
```javascript
// Deployment type detection in 404.html
function detectDeploymentType(pathSegments, hostname) {
  if (hostname.endsWith('.github.io')) {
    if (pathSegments[0] === 'sgex') {
      if (pathSegments.length === 1) return 'landing';
      if (pathSegments[1] === 'main') return 'main';
      return 'feature-branch';
    }
  }
  return 'local';
}
```

## Route Configuration System

### Configuration File Distribution:

```mermaid
flowchart TD
    A[Source Configurations] --> B[routes-config.json<br/>Full configuration]
    A --> C[routes-config.deploy.json<br/>Minimal configuration]
    
    B --> D[Main Branch Deployment]
    B --> E[Feature Branch Deployments]
    C --> F[Deploy Branch Deployment]
    
    D --> G[All DAK components available]
    E --> G
    F --> H[Limited to branch selection]
    
    style B fill:#d4edda
    style C fill:#fff3cd
```

### routeConfig.js Behavior:
```javascript
// Automatic configuration selection
function getDeploymentType() {
  var path = window.location.pathname;
  
  // Check for full feature access
  if (path.includes('/docs/') || path.includes('/dashboard/') || 
      path.includes('/bpmn-') || path.includes('/decision-support-')) {
    return 'main'; // Load routes-config.json
  }
  
  // Root access suggests deploy branch
  if (path === '/' || path === '/sgex/') {
    return 'deploy'; // Load routes-config.deploy.json
  }
  
  return 'main'; // Default to full configuration
}
```

## URL Processing Flow by Deployment

### 1. Landing Page URL Processing:
```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Landing as Landing Page
    participant Main as Main Deployment

    User->>Browser: Enter: /sgex/main/dashboard/user/repo
    Browser->>Landing: Request (404 - file not found)
    Landing->>Landing: 404.html detects main branch request
    Landing->>Main: Redirect to /sgex/main/?/dashboard/user/repo
    Main->>Main: React Router processes route
    Main->>User: Display dashboard component
```

### 2. Main Branch URL Processing:
```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Main as Main Deployment

    User->>Browser: Enter: /sgex/main/docs/overview
    Browser->>Main: Request (404 - file not found)
    Main->>Main: 404.html processes local route
    Main->>Main: Redirect to /sgex/main/?/docs/overview
    Main->>Main: React Router loads docs component
    Main->>User: Display documentation
```

### 3. Feature Branch URL Processing:
```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Feature as Feature Deployment
    participant Main as Main Fallback

    User->>Browser: Enter: /sgex/feature-x/dashboard/user/repo
    Browser->>Feature: Request (404 - file not found)
    Feature->>Feature: 404.html detects feature branch
    alt Feature branch deployed
        Feature->>Feature: Redirect to /sgex/feature-x/?/dashboard/user/repo
        Feature->>User: Display in feature context
    else Feature branch not deployed
        Feature->>Main: Fallback to /sgex/main/?/dashboard/user/repo
        Main->>User: Display in main context
    end
```

## Asset and Resource Management

### Static Asset Distribution:
```mermaid
flowchart TD
    A[React Build Process] --> B[Generate Static Assets]
    
    B --> C[CSS Files]
    B --> D[JS Bundles]
    B --> E[Media Files]
    B --> F[Service Worker]
    
    C --> G[Deploy to static/css/]
    D --> H[Deploy to static/js/]
    E --> I[Deploy to static/media/]
    F --> J[Deploy to root/]
    
    G --> K[Available at base-path/static/css/]
    H --> L[Available at base-path/static/js/]
    I --> M[Available at base-path/static/media/]
    J --> N[Available at base-path/]
    
    style K fill:#e3f2fd
    style L fill:#e3f2fd
    style M fill:#e3f2fd
    style N fill:#e3f2fd
```

### Cross-Deployment Resource Sharing:
- **404.html**: Identical logic across all deployments
- **routeConfig.js**: Same file, different configuration loading
- **Static Assets**: Independent per deployment to avoid conflicts
- **Configuration Files**: Deployment-specific (deploy vs. full)

## Deployment Coordination and Dependencies

### GitHub Actions Workflow Coordination:
```mermaid
flowchart TD
    A[Code Changes] --> B{Branch Type}
    
    B -->|deploy| C[Deploy Branch Workflow]
    B -->|main| D[Main Branch Workflow]
    B -->|feature-*| E[Feature Branch Workflow]
    
    C --> F[Build with minimal config]
    D --> G[Build with full config]
    E --> H[Build with full config]
    
    F --> I[Deploy to /sgex/]
    G --> J[Deploy to /sgex/main/]
    H --> K[Deploy to /sgex/branch/]
    
    I --> L[Update landing page]
    J --> M[Update production app]
    K --> N[Create/update preview]
    
    L --> O[All deployments share 404.html logic]
    M --> O
    N --> O
```

### Dependency Management:
1. **Shared 404.html**: Must handle all deployment patterns
2. **Configuration Sync**: Route configs must stay synchronized
3. **Asset Versioning**: Each deployment has independent asset versions
4. **Fallback Strategy**: Feature branches fall back to main when not deployed

## Key Insights and Implications

### Strengths of Current Architecture:
1. **Unified Routing**: Single 404.html handles all scenarios
2. **Independent Deployments**: Each branch deployment is isolated
3. **Graceful Fallbacks**: Missing feature branches fall back to main
4. **Flexible Configuration**: Deploy vs. full configurations for different needs

### Challenges and Complexities:
1. **404.html Complexity**: Single file handles all deployment logic (600+ lines)
2. **Configuration Sync**: Must keep multiple config files synchronized
3. **URL Pattern Complexity**: Multiple URL patterns to support all scenarios
4. **Debug Difficulty**: Complex routing logic makes debugging challenging

### Maintenance Considerations:
1. **Testing Requirements**: All deployment scenarios must be tested
2. **Documentation Needs**: Complex logic requires comprehensive documentation
3. **Change Impact**: Routing changes affect all deployment types
4. **Performance Impact**: Complex 404.html logic runs on every unmatched URL

This analysis reveals both the sophistication and complexity of the SGEX deployment architecture, showing how a single routing system supports multiple deployment scenarios while maintaining functionality and user experience across all contexts.