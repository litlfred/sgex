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
Access and edit the 9 core DAK components organized according to the WHO SMART Guidelines framework, including Health Interventions, Generic Personas, User Scenarios, Business Processes, Core Data Elements, Decision-Support Logic, Program Indicators, Requirements, and Test Scenarios.

![DAK Components](https://github.com/user-attachments/assets/2b3c8e7d-cdd2-4a61-a482-a2c1bc6cb0cb)

## About

The SGEX Workbench is a browser-based, static web application for collaborative editing of WHO SMART Guidelines Digital Adaptation Kits (DAKs) content stored in GitHub repositories.

- All UI schemas are rendered using [JSON Forms](https://jsonforms.io/) for standards compliance and accessibility.
- All schemas and documentation follow the terminology and branding of [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines).

## 📚 Documentation

All project documentation is now organized in the `docs/` directory with clear categories:

### 👤 User Documentation
- **[📖 Documentation Index](docs/INDEX.md)** - Comprehensive documentation catalog
- **[🚀 Getting Started](docs/01-getting-started/)** - Installation, authentication, and first steps
- **[📘 User Guides](docs/02-user-guides/)** - How-to guides for using SGEX features

### 🏗️ System Documentation
- **[🏛️ Architecture](docs/03-architecture/)** - System design and architecture
- **[💻 Development Guide](docs/04-development/)** - Development standards and practices
- **[🚀 Deployment Guide](docs/05-deployment/)** - Deployment procedures and CI/CD
- **[🔐 Security](docs/06-security/)** - Security practices and compliance
- **[✨ Features](docs/07-features/)** - Feature-specific documentation

### 📜 Development History
- **[📜 Development History](docs/08-development-history/)** - Historical context, bug fixes, and implementation details
  - 24 ticket fixes organized by category
  - 27 implementation summaries
  - 21 technical analysis documents
  - Complete audit trail of development decisions

### 📄 Public Documentation
For public-facing documentation, see [public/docs/](public/docs/) including:
- Project Plan
- Requirements
- Solution Architecture
- DAK Components Guide

## Development Setup

### Prerequisites

- **Node.js**: Version 20.x or higher
- **npm**: Version 10.x or higher

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

For detailed deployment information, see [docs/05-deployment/](docs/05-deployment/).

## MCP Services

SGEX Workbench includes Model Context Protocol (MCP) services that provide structured API access to DAK information:

### DAK FAQ MCP Service
- **Location**: `services/dak-faq-mcp/`
- **URL**: `http://127.0.0.1:3001/mcp` (local development only)
- **Purpose**: REST API for accessing DAK components and FAQ questions

#### Quick Start
```bash
cd services/dak-faq-mcp
npm install
npm start
```

#### Available Endpoints
- FAQ questions catalog and execution
- DAK value sets, decision tables, business processes
- Personas/actors and questionnaires
- Service health checks

#### Deployment Options
- **Local Development**: Localhost binding (127.0.0.1:8080) for development
- **Fly.io Production**: Public HTTPS deployment with GitHub OAuth authentication

#### Documentation
- Complete MCP documentation: [`public/docs/mcp/`](public/docs/mcp/)
- Deployment guide: [`services/dak-faq-mcp/DEPLOYMENT.md`](services/dak-faq-mcp/DEPLOYMENT.md)
- Architecture: [`docs/03-architecture/mcp-services/`](docs/03-architecture/mcp-services/)

**Security**: Local development bypasses authentication. Production deployment requires GitHub OAuth and collaborator access to `litlfred/sgex`.

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

## Project Structure

```
sgex/
├── docs/                # 📚 All documentation (organized by category)
│   ├── INDEX.md         # Master documentation index
│   ├── 01-getting-started/
│   ├── 02-user-guides/
│   ├── 03-architecture/
│   ├── 04-development/
│   ├── 05-deployment/
│   ├── 06-security/
│   ├── 07-features/
│   └── 08-development-history/
├── packages/            # Monorepo packages
│   ├── dak-core/       # Core DAK business logic
│   ├── storage-services/ # Caching and persistence
│   ├── vcs-services/   # GitHub integration
│   └── utils/          # Shared utilities
├── services/           # MCP services
│   ├── dak-faq-mcp/   # FAQ service
│   └── dak-publication-api/ # Publication API
├── src/                # Main application source
│   ├── components/     # React components
│   ├── services/       # Application services
│   ├── hooks/          # Custom React hooks
│   └── styles/         # Global styles
├── public/             # Static assets
│   └── docs/           # Public-facing documentation
└── scripts/            # Build and utility scripts
```

## Available Scripts

### Core Development
- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner in interactive watch mode
- `npm run build` - Builds the app for production (includes TypeScript type checking and schema generation)

### Code Quality
- `npm run lint` - Runs ESLint on all source files (supports JavaScript and TypeScript)
- `npm run lint:a11y` - Shows only accessibility (jsx-a11y) warnings
- `npm run lint:fix` - Automatically fixes linting issues where possible
- `npm run type-check` - Runs TypeScript type checking without compilation
- `npm run type-check:watch` - Runs TypeScript type checking in watch mode

### Advanced
- `npm run generate-schemas` - Generates JSON schemas from TypeScript types
- `npm run check-framework-compliance` - Check framework compliance
- `npm run generate-service-table` - Generate service documentation table

### Testing
- `npm run compliance:profile` - Test profile creation compliance
- `npm run compliance:all` - Run all compliance tests
- `npm run test:compliance` - Run compliance test suite

## TypeScript Migration

SGEX Workbench is currently undergoing a phased migration to TypeScript for improved type safety, better IDE support, and enhanced developer experience. The migration includes:

- **Runtime Validation**: AJV + TypeScript integration for JSON data validation
- **Schema Generation**: Automated JSON schema generation from TypeScript types
- **Type Safety**: Gradual adoption of TypeScript across the codebase
- **Documentation**: Generated type documentation and schemas

For detailed information about the TypeScript migration, see [docs/04-development/typescript-migration.md](docs/04-development/typescript-migration.md).

### Current TypeScript Features

- **Core Types**: Comprehensive type definitions for GitHub API, DAK structures, and application state
- **Runtime Validation**: Type-safe JSON validation using generated schemas
- **Schema Publishing**: Automated schema generation and publishing to `public/docs/schemas/`
- **Development Tools**: TypeScript-aware linting, type checking, and IDE support

### Using TypeScript Features

```typescript
// Import types for better development experience
import { GitHubUser, DAKRepository } from './types/core';
import { validateAndCast } from './services/runtimeValidationService';

// Type-safe data validation
const user = validateAndCast<GitHubUser>('GitHubUser', userData);
```

## Accessibility & Security

### Accessibility Linting

The project uses `eslint-plugin-jsx-a11y` to enforce accessibility best practices. See [docs/04-development/accessibility.md](docs/04-development/accessibility.md) for detailed information about accessibility rules and how to fix common issues.

### Security Checks

The project includes comprehensive automated security checks that run on every PR build. These checks include:

- **NPM Audit** - Scans for known vulnerabilities in dependencies
- **Outdated Dependencies** - Identifies packages needing updates
- **ESLint Security Rules** - Detects security issues in code
- **Security Headers** - Verifies security header configuration
- **License Compliance** - Checks for restrictive licenses
- **Secret Scanning** - Detects hardcoded secrets
- **Framework Compliance** - Ensures security best practices

See [docs/06-security/](docs/06-security/) for comprehensive security documentation.

## Troubleshooting

If you encounter build or installation issues:

- **eslint-scope module not found**: See [docs/01-getting-started/troubleshooting.md](docs/01-getting-started/troubleshooting.md) for detailed solutions
- **Port 3000 already in use**: The development server will automatically try to use an alternative port (3001, 3002, etc.)
- **Build issues**: Try deleting `node_modules/` and `package-lock.json`, then run `npm install` again
- **Memory issues**: If you encounter JavaScript heap out of memory errors, try setting `NODE_OPTIONS=--max-old-space-size=4096` before running build commands

For more detailed troubleshooting guidance, see [docs/01-getting-started/troubleshooting.md](docs/01-getting-started/troubleshooting.md).

For information about contributing, see [CONTRIBUTING.md](CONTRIBUTING.md).

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

For detailed information about each component, see the [public/docs/dak-components.md](public/docs/dak-components.md).

*Note: Scheduling tables are considered a special case of decision tables and are included within the Decision Support Logic component.*

For more information on DAK authoring, see the [WHO SMART Guidelines IG Starter Kit](https://smart.who.int/ig-starter-kit/l2_dak_authoring.html).

## Deployment

The SGEX Workbench uses a **compartmentalized multi-branch GitHub Pages deployment system** with separate workflows for branch previews and landing page deployment.

### Deployment Architecture

The system consists of **two independent workflows**:

1. **Deploy Feature Branch**: Automatically deploys each branch to its own preview URL
2. **Landing Page Deployment**: Manually triggered deployment of the main landing page

This separation ensures:
- Branch deployments don't interfere with landing page updates
- Landing page has self-contained assets (no dependencies on branch directories)
- Manual control over landing page updates
- Independent operation of each deployment type

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

For detailed deployment documentation, see [docs/05-deployment/](docs/05-deployment/).

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## References

- [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines)
- [JSON Forms](https://jsonforms.io/)
- [bpmn-js](https://github.com/bpmn-io/bpmn-js)
- [dmn-js](https://github.com/bpmn-io/dmn-js)
- [Octokit](https://github.com/octokit/rest.js)
- [GitHub REST API](https://docs.github.com/en/rest)