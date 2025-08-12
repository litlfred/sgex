# SGEX Workbench (WHO SMART Guidelines Exchange)

<div align="center">
  <img src="public/sgex-mascot.png" alt="SGEX Workbench Helper" width="200" height="200">
  <p><em>Meet your SGEX Workbench Helper - here to guide you through WHO SMART Guidelines DAK editing!</em></p>
</div>

## Mission Statement

SGEX is an experimental collaborative project developing a workbench of tools to make it easier and faster to develop high fidelity SMART Guidelines Digital Adaptation Kits (DAKs). Our mission is to empower healthcare organizations worldwide to create and maintain standards-compliant digital health implementations through:

- **Collaborative Development**: Every contribution matters, whether reporting bugs, testing features, or sharing feedback
- **AI-Powered Assistance**: Hybrid approach combining human insight with AI coding agents for efficient development
- **Community-Driven Evolution**: Real-time improvement through collaborative discussion and iterative refinement
- **Real-World Impact**: Building tools that help healthcare workers worldwide deliver better patient care

## How to Contribute

Contributing to SGEX is a collaborative journey that combines human creativity with AI assistance:

1. **🐛 Start with Feedback**: Report bugs, request features, or suggest improvements through our issue tracker
2. **🤖 AI-Powered Development**: Issues may be assigned to coding agents for initial analysis and implementation
3. **🌟 Community Collaboration**: The community reviews, tests, and refines changes through collaborative discussion
4. **🚀 Real-Time Evolution**: The workbench continuously evolves based on actual usage and feedback from healthcare professionals

Every contribution helps improve digital health tools for healthcare workers worldwide. Whether you're reporting a bug, testing a feature, or sharing feedback, you're part of building the future of digital health tooling.

**Ready to contribute?** Visit our [landing page](https://litlfred.github.io/sgex/) to get started or use the help mascot on any page to quickly report issues.

This repository contains the source code, schemas, and documentation for the SGEX Workbench—a browser-based, standards-compliant collaborative editor for WHO SMART Guidelines Digital Adaptation Kits (DAKs).

## Overview

The SGEX Workbench provides an intuitive interface for collaborative editing of WHO SMART Guidelines Digital Adaptation Kits (DAKs). Here's what you can expect:

### Repository Selection
Browse and select from available DAK repositories with enhanced scanning display showing repository details, tags, and metadata.

![Repository Selection](https://github.com/user-attachments/assets/1c606285-519f-4985-91a1-52739069ae39)

### DAK Component Management
Access and edit the 8 core DAK components organized according to the WHO SMART Guidelines framework, including Health Interventions, Generic Personas, User Scenarios, Business Processes, Core Data Elements, Decision-Support Logic, Program Indicators, and Requirements.

![DAK Components](https://github.com/user-attachments/assets/2b3c8e7d-cdd2-4a61-a482-a2c1bc6cb0cb)

## About

The SGEX Workbench is a browser-based, static web application for collaborative editing of WHO SMART Guidelines Digital Adaptation Kits (DAKs) content stored in GitHub repositories.

- All UI schemas are rendered using [JSON Forms](https://jsonforms.io/) for standards compliance and accessibility.
- All schemas and documentation follow the terminology and branding of [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines).

## Development Setup

### Prerequisites

- **Node.js**: Version 16.x or higher (tested with Node.js 18.x and 20.x)
- **npm**: Version 8.x or higher (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/litlfred/sgex.git
   cd sgex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Authentication Setup**
   
   SGEX Workbench uses GitHub Personal Access Tokens (PATs) for authentication. No additional setup is required - the application will guide you through creating a PAT when you first sign in.
   
   **Note**: The app will show helpful step-by-step instructions for creating a Personal Access Token when you try to sign in.

### Development

1. **Start the development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000/sgex`

2. **Build for production**
   ```bash
   npm run build
   ```
   The build artifacts will be created in the `build/` directory.

3. **Run tests**
   ```bash
   npm test
   ```

4. **Verify 404.html for GitHub Pages**
   ```bash
   npm run verify-404
   ```
   This ensures the 404.html file is properly configured for GitHub Pages SPA routing.

### TypeScript Migration

SGEX is undergoing a phased migration from JavaScript to TypeScript for improved type safety and developer experience:

**Current Implementation:**
- ✅ TypeScript infrastructure and build integration
- ✅ Core type definitions (`src/types/common.ts`)
- ✅ Utilities and services migration
- ✅ JSON schema generation from TypeScript interfaces  
- ✅ Runtime validation framework with AJV

**Migration Benefits:**
- **Type Safety**: Compile-time error detection and prevention
- **Enhanced IDE Support**: Autocomplete, IntelliSense, and refactoring tools
- **Self-Documenting Code**: Type annotations serve as living documentation
- **Runtime Validation**: JSON schemas generated from types enable safe API data handling

**Development Commands:**
```bash
npm run type-check          # TypeScript compilation check
npm run generate-schemas    # Generate JSON schemas from TypeScript types
npm run lint               # ESLint for both JavaScript and TypeScript
npm test                   # Run test suite with mixed JS/TS support
```

For detailed migration strategy, see [TYPESCRIPT_MIGRATION_ROADMAP.md](TYPESCRIPT_MIGRATION_ROADMAP.md).

## GitHub Pages Deployment

SGEX Workbench includes a comprehensive 404.html file that enables proper Single Page Application (SPA) routing on GitHub Pages. The 404.html file:

- ✅ Handles direct URL navigation (e.g., `/sgex/dashboard/user/repo`)
- ✅ Supports multiple deployment scenarios (main branch, feature branches, standalone)
- ✅ Automatically redirects to the correct React Router routes
- ✅ Preserves query parameters and hash fragments
- ✅ Meets GitHub Pages requirements (>512 bytes for IE compatibility)

### Verification

To verify the 404.html configuration:
```bash
npm run build:verify  # Build and verify in one command
# OR
npm run verify-404    # Verify existing build
```

For detailed implementation information, see [docs/404-implementation.md](docs/404-implementation.md).
### Docker

1. **Build the docker image**
```bash
docker build -t sgex .
```

2. **Start the docker image**
```bash
docker run --rm -p 3000:3000 sgex
```

## Authentication

SGEX Workbench uses **GitHub Personal Access Tokens (PATs)** for secure authentication. This provides a secure authentication method without requiring any backend server setup.

### How it works:
1. Users click "Sign in with Personal Access Token"
2. The app displays step-by-step instructions for creating a GitHub Personal Access Token
3. Users create their PAT with the required permissions and paste it into the app
4. The app stores the token securely in the browser and loads the user's repositories

### Required GitHub Permissions:
For **fine-grained tokens**:
- **Contents**: Read and Write (for editing DAK content)
- **Metadata**: Read (for repository information)
- **Pull requests**: Read and Write (for creating pull requests)

For **classic tokens**:
- **repo**: Full control of private repositories (for editing DAK content)
- **read:org**: Read org and team membership (for listing organization repositories)

This authentication method is fully compatible with static deployments and requires no backend server.

### Project Structure

```
sgex/
├── public/          # Static assets
├── src/             # Source code
│   ├── components/  # React components
│   ├── App.js       # Main application component
│   └── index.js     # Application entry point
├── public/docs/     # Project documentation
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner in interactive watch mode
- `npm run build` - Builds the app for production
- `npm run lint` - Runs ESLint on all source files
- `npm run lint:a11y` - Shows only accessibility (jsx-a11y) warnings
- `npm run lint:fix` - Automatically fixes linting issues where possible
- `npm run eject` - **Note: This is a one-way operation. Don't do this unless you know what you're doing!**

### Accessibility Linting

The project uses `eslint-plugin-jsx-a11y` to enforce accessibility best practices. See [docs/accessibility-linting.md](docs/accessibility-linting.md) for detailed information about accessibility rules and how to fix common issues.

### Troubleshooting

If you encounter build or installation issues:

- **eslint-scope module not found**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions
- **Port 3000 already in use**: The development server will automatically try to use an alternative port (3001, 3002, etc.)
- **Build issues**: Try deleting `node_modules/` and `package-lock.json`, then run `npm install` again
- **Memory issues**: If you encounter JavaScript heap out of memory errors, try setting `NODE_OPTIONS=--max-old-space-size=4096` before running build commands

For more detailed troubleshooting guidance, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

For more information about contributing, see [CONTRIBUTING.md](CONTRIBUTING.md).

## WHO SMART Guidelines DAK Components

The SGEX Workbench supports editing of the **9 core Digital Adaptation Kit (DAK) components** as defined by the WHO SMART Guidelines framework. These components are organized according to the official DAK authoring sequence:

### The 9 Core DAK Components
1. **Health Interventions and Recommendations** - Clinical guidelines and health intervention specifications
2. **Generic Personas** - Standardized user roles and actor definitions  
3. **User Scenarios** - Narrative descriptions of user interactions with the system
4. **Generic Business Processes and Workflows** - BPMN workflows and business process definitions
5. **Core Data Elements** - Essential data structures and terminology for clinical data (includes Terminology Services via OCL and Product Master Data via PCMT)
6. **Decision-Support Logic** - DMN decision tables and clinical decision support
7. **Program Indicators** - Performance indicators and measurement definitions
8. **Functional and Non-Functional Requirements** - System requirements and specifications
9. **Test Scenarios** - Feature files and test scenarios for validating the DAK implementation

### Additional Components
The SGEX Workbench also supports additional structured knowledge representations including Terminology, FHIR Profiles, FHIR Extensions, FHIR Questionnaires, and Test Data & Examples.

For detailed information about each component, see the [DAK Components Documentation](public/docs/dak-components.md).

*Note: Scheduling tables are considered a special case of decision tables and are included within the Decision Support Logic component.*

For more information on DAK authoring, see the [WHO SMART Guidelines IG Starter Kit](https://smart.who.int/ig-starter-kit/l2_dak_authoring.html).

## Deployment

The SGEX Workbench uses a **compartmentalized multi-branch GitHub Pages deployment system** with separate workflows for branch previews and landing page deployment.

### Deployment Architecture

The system consists of **two independent workflows**:

1. **Branch Preview Deployment**: Automatically deploys each branch to its own preview URL
2. **Landing Page Deployment**: Manually triggered deployment of the main landing page

This separation ensures:
- Branch deployments don't interfere with landing page updates
- Landing page has self-contained assets (no dependencies on branch directories)
- Manual control over landing page updates
- Independent operation of each deployment type

### Branch Preview Deployment

**Workflow**: `Branch Preview Deployment` (`.github/workflows/pages.yml`)

**Automatic Triggers**:
- Push to any branch (except `gh-pages`)  
- Pull request events
- Excludes documentation-only changes

**Process**:
1. **Builds** branch-specific React app with correct base path
2. **Deploys** to branch subdirectory (e.g., `/main/`, `/feature-branch/`)
3. **Posts** deployment URLs to associated pull request comments
4. **Preserves** existing branch directories and landing page

### Landing Page Deployment

**Workflow**: `Deploy Landing Page` (`.github/workflows/landing-page-deploy.yml`)

**Manual Triggers**:
- GitHub Actions manual trigger (`workflow_dispatch`)
- Can be triggered from any branch
- Uses build scripts from the triggering branch

**Process**:
1. **Builds** self-contained landing page with branch/PR selectors
2. **Preserves** all existing branch deployments
3. **Deploys** landing page to root of GitHub Pages
4. **Maintains** independent assets (CSS, JS, images)

### URL Structure and Access

#### Main Application
- **URL**: https://litlfred.github.io/sgex/main/
- **Purpose**: Primary stable version of the workbench
- **Deployment**: Automatic via branch preview workflow

#### Feature Branch Previews
- **URL Pattern**: https://litlfred.github.io/sgex/{branch-name}/
- **Purpose**: Individual feature development and testing
- **Deployment**: Automatic on every push to any branch
- **Naming**: Branch names with slashes converted to dashes (e.g., `feature/new-editor` → `feature-new-editor`)

#### Landing Page
- **URL**: https://litlfred.github.io/sgex/
- **Purpose**: Browse and access all available branch deployments
- **Features**: Branch selector, pull request previews, contribution portal
- **Deployment**: Manual via landing page deployment workflow

### Branch Preview Workflow Details

**Triggered by**: Push to any branch, pull request events

1. **Build** → Installs dependencies, builds branch-specific React app
2. **Deploy** → Updates branch subdirectory on GitHub Pages
3. **Notify** → Posts deployment URLs to associated pull request comments
4. **Complete** → Branch preview available within 2-3 minutes

### Landing Page Update Process

**Triggered by**: Manual workflow dispatch in GitHub Actions

1. **Build** → Creates self-contained landing page with updated branch listings
2. **Preserve** → Maintains all existing branch directories
3. **Deploy** → Updates root landing page with independent assets
4. **Complete** → Updated landing page available within 2-3 minutes

#### How to Update the Landing Page

To manually update the landing page:

1. **Navigate to GitHub Actions** in the repository
2. **Select "Deploy Landing Page"** workflow
3. **Click "Run workflow"** 
4. **Choose source branch** (optional - defaults to current branch)
5. **Run** the workflow

The landing page will be updated with latest branch listings, pull request previews, and self-contained assets.

### Workflow Independence Benefits

The compartmentalized approach provides several advantages:

- **Isolated Updates**: Branch deployments don't trigger landing page rebuilds
- **Selective Control**: Landing page can be updated independently when needed
- **Asset Isolation**: Landing page has its own CSS, JS, and image assets
- **Build Optimization**: Landing page build is ~83% smaller (only includes BranchListing component)
- **Deployment Flexibility**: Landing page can use build scripts from any branch
- **Reduced Complexity**: Each workflow has a single, clear responsibility

### Pull Request Integration

When you push to a branch with an associated pull request:

- **Auto-detects** PR by branch name or commit SHA
- **Posts comment** with deployment URLs in PR conversation
- **Updates existing** comments instead of creating duplicates
- **Includes** branch preview URL and deployment metadata
- **Provides** direct access for reviewers to test changes

## Documentation

All project documentation is located in the `public/docs/` directory:

- [Project Plan](public/docs/project-plan.md) - Overall project planning and milestones
- [Requirements](public/docs/requirements.md) - Detailed functional and non-functional requirements
- [Solution Architecture](public/docs/solution-architecture.md) - Technical architecture and design decisions
- [DAK Components](public/docs/dak-components.md) - Comprehensive guide to the 8 WHO SMART Guidelines DAK components

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## References

- [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines)
- [JSON Forms](https://jsonforms.io/)
- [bpmn-js](https://github.com/bpmn-io/bpmn-js)
- [dmn-js](https://github.com/bpmn-io/dmn-js)
- [Octokit](https://github.com/octokit/rest.js)
- [GitHub REST API](https://docs.github.com/en/rest)
