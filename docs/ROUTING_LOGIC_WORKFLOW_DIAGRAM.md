# SGEX Routing Logic Workflow Diagram

## Overview
This document provides detailed diagrams and explanations of the SGEX routing logic workflow, showing how URLs are processed and routed through the system.

## Main Routing Logic Flow

```mermaid
flowchart TD
    A[User enters URL] --> B{404.html triggered?}
    B -->|No| C[index.html loads normally]
    B -->|Yes| D[404.html routing logic]
    
    D --> E{Check for redirect loop}
    E -->|Found loop| F[Show error page]
    E -->|No loop| G[Record redirect attempt]
    
    G --> H{Determine deployment type}
    H -->|GitHub Pages| I[GitHub Pages Logic]
    H -->|Local/Other| J[Local Deployment Logic]
    
    I --> K{Path starts with /sgex/?}
    K -->|No| L[Show invalid path error]
    K -->|Yes| M[Parse URL segments]
    
    J --> N[Parse URL segments]
    
    M --> O[Route Analysis]
    N --> O
    
    O --> P{URL Pattern Type}
    P -->|/sgex/| Q[Root redirect]
    P -->|/sgex/docs/| R[Documentation route]
    P -->|/sgex/{branch}/| S[Branch deployment]
    P -->|/sgex/{component}/{user}/{repo}/| T[DAK component route]
    P -->|Unknown| U[Error page]
    
    Q --> V[redirectToSPA with empty route]
    R --> W[handleDocumentationRoute]
    S --> X[Branch context routing]
    T --> Y[handleDAKComponentRoute]
    
    V --> Z[Build final URL with ?/ prefix]
    W --> Z
    X --> Z
    Y --> Z
    
    Z --> AA[Store context in sessionStorage]
    AA --> BB[window.location.replace to SPA]
    BB --> CC[React app takes over]
    
    style F fill:#ff6b6b
    style L fill:#ff6b6b
    style U fill:#ff6b6b
    style CC fill:#51cf66
```

## Detailed Component Flow Analysis

### 1. Initial URL Processing

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant GitHub Pages
    participant 404.html
    participant routeConfig.js
    participant React App

    User->>Browser: Enter URL: /sgex/main/dashboard/litlfred/smart-ips/main
    Browser->>GitHub Pages: HTTP GET request
    GitHub Pages->>GitHub Pages: File not found (no physical file)
    GitHub Pages->>404.html: Serve 404.html as fallback
    404.html->>routeConfig.js: Load route configuration
    routeConfig.js-->>404.html: Return config object
    404.html->>404.html: Parse URL and determine routing
    404.html->>Browser: Redirect to /?/main/dashboard/litlfred/smart-ips/main
    Browser->>GitHub Pages: HTTP GET request for index.html
    GitHub Pages->>React App: Serve index.html
    React App->>React App: Parse ?/ parameter and restore route
    React App->>User: Display dashboard component
```

### 2. Deployment Type Detection

```mermaid
flowchart TD
    A[URL Analysis] --> B{hostname ends with .github.io?}
    B -->|Yes| C[GitHub Pages Deployment]
    B -->|No| D[Local/Custom Deployment]
    
    C --> E{Path starts with /sgex/?}
    E -->|Yes| F[Standard GitHub Pages]
    E -->|No| G[Root GitHub Pages]
    
    D --> H{Path has /sgex/ prefix?}
    H -->|Yes| I[Development with prefix]
    H -->|No| J[Root development]
    
    F --> K[Use /sgex/ base path]
    G --> L[Use / base path]
    I --> K
    J --> L
    
    K --> M[GitHub Pages Logic]
    L --> N[Local Deployment Logic]
    
    style C fill:#e3f2fd
    style D fill:#f3e5f5
```

### 3. URL Pattern Recognition

```mermaid
flowchart TD
    A[URL Segments Array] --> B{segments.length}
    
    B -->|0-1| C[Root Path]
    B -->|2| D{Second segment type}
    B -->|3+| E{Pattern Analysis}
    
    D -->|"docs"| F[Documentation Route]
    D -->|Other| G[Branch Root]
    
    E --> H{Is DAK Component Pattern?}
    H -->|Yes| I[DAK Component Route]
    H -->|No| J{Is Branch + Component?}
    
    J -->|Yes| K[Branch Deployment Route]
    J -->|No| L[Unknown Pattern Error]
    
    C --> M[redirectToSPA('/', '')]
    F --> N[handleDocumentationRoute]
    G --> O[redirectToSPA with branch path]
    I --> P[handleDAKComponentRoute]
    K --> Q[Branch + Component routing]
    L --> R[showErrorPage]
    
    style R fill:#ff6b6b
    style M fill:#51cf66
    style N fill:#51cf66
    style O fill:#51cf66
    style P fill:#51cf66
    style Q fill:#51cf66
```

### 4. Context Storage and Preservation

```mermaid
flowchart TD
    A[Route Parsing Complete] --> B[Extract Context Information]
    
    B --> C{DAK Component Pattern?}
    C -->|Yes| D[Extract: component, user, repo, branch]
    C -->|No| E{Branch Deployment Pattern?}
    
    E -->|Yes| F[Extract: branch, component, user, repo]
    E -->|No| G[No context to store]
    
    D --> H[Store in sessionStorage]
    F --> H
    
    H --> I[sgex_selected_user = user]
    I --> J[sgex_selected_repo = repo]
    J --> K[sgex_selected_branch = branch]
    
    K --> L[Build Route Path]
    L --> M[Preserve Query Parameters]
    M --> N[Preserve Hash Fragment]
    N --> O[Build Final Redirect URL]
    
    G --> L
    
    style H fill:#e8f5e8
```

## Route Configuration System

```mermaid
flowchart TD
    A[routeConfig.js loaded] --> B[Detect Deployment Type]
    
    B --> C{Deployment Type}
    C -->|Deploy Branch| D[Load routes-config.deploy.json]
    C -->|Main/Feature| E[Load routes-config.json]
    
    D --> F[Minimal Component Set]
    E --> G[Full Component Set]
    
    F --> H[Landing page functionality only]
    G --> I[Full DAK editing capabilities]
    
    H --> J[Available for 404.html routing]
    I --> J
    
    J --> K[isValidDAKComponent() function]
    K --> L[standardComponents object]
    L --> M[Route validation in 404.html]
    
    style F fill:#fff3cd
    style G fill:#d4edda
```

## Error Handling and Loop Prevention

```mermaid
flowchart TD
    A[Routing Request] --> B{Check for ?/ in search}
    B -->|Found| C[Redirect loop detected]
    B -->|Not found| D[Check sessionStorage attempts]
    
    C --> E[Show error page with bug report]
    
    D --> F[Get recent redirect attempts]
    F --> G{Attempts for this path > 2?}
    G -->|Yes| H[Redirect loop prevention]
    G -->|No| I[Record new attempt]
    
    H --> J{Branch deployment attempt?}
    J -->|Yes| K[Try branch root first]
    J -->|No| L[Fall back to main]
    
    K --> M{Branch root also failed?}
    M -->|Yes| L
    M -->|No| N[Redirect to branch root]
    
    L --> O[Clear attempts and redirect to /sgex/]
    
    I --> P[Continue normal routing]
    
    style E fill:#ff6b6b
    style O fill:#ffd43b
    style P fill:#51cf66
```

## React App Integration

```mermaid
sequenceDiagram
    participant 404.html
    participant Browser
    participant React Router
    participant SessionStorage
    participant React Components

    404.html->>Browser: window.location.replace with ?/ parameter
    Browser->>React Router: Load index.html
    React Router->>React Router: Parse ?/ parameter from URL
    React Router->>SessionStorage: Check for stored context
    SessionStorage-->>React Router: Return user/repo/branch data
    React Router->>React Router: Restore route state
    React Router->>React Components: Navigate to target component
    React Components->>React Components: Load with restored context
```

## Deployment-Specific Behavior

### GitHub Pages Main Deployment
```mermaid
flowchart LR
    A[URL: /sgex/main/dashboard/user/repo] --> B[404.html on GitHub Pages]
    B --> C[Detect: GitHub Pages + /sgex/ prefix]
    C --> D[Parse: branch=main, component=dashboard]
    D --> E[Redirect: /sgex/?/main/dashboard/user/repo]
    E --> F[React app loads with route]
```

### GitHub Pages Feature Branch
```mermaid
flowchart LR
    A[URL: /sgex/feature-x/dashboard/user/repo] --> B[404.html on GitHub Pages]
    B --> C[Detect: GitHub Pages + /sgex/ prefix]
    C --> D[Parse: branch=feature-x, component=dashboard]
    D --> E[Redirect: /sgex/feature-x/?/dashboard/user/repo]
    E --> F[React app loads in branch context]
```

### Local Development
```mermaid
flowchart LR
    A[URL: /sgex/dashboard/user/repo] --> B[404.html locally]
    B --> C[Detect: Local deployment]
    C --> D[Parse: component=dashboard, user/repo context]
    D --> E[Redirect: /sgex/?/dashboard/user/repo]
    E --> F[React app loads locally]
```

## Key Benefits of Current Approach

1. **Unified Handling**: Single 404.html handles all deployment scenarios
2. **Context Preservation**: User/repo/branch information extracted and stored
3. **Loop Prevention**: Sophisticated cycle detection prevents infinite redirects
4. **Dynamic Configuration**: Route validation uses loaded configuration, not hardcoded lists
5. **Graceful Fallbacks**: Multiple fallback strategies for failed routes
6. **Query/Hash Preservation**: URL parameters and fragments maintained through redirects

## Identified Issues

1. **Complexity**: The 404.html file is very complex (600+ lines)
2. **Performance**: Synchronous XHR loading of route configuration
3. **Maintenance**: Complex logic requires careful testing for each change
4. **Error Recovery**: While sophisticated, error recovery could be simpler
5. **Documentation**: The logic flow could benefit from better inline documentation

This workflow demonstrates both the sophistication and complexity of the current routing solution, highlighting areas for potential simplification while maintaining functionality.