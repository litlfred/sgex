# SGEX Workbench Documentation Index

## Overview

This document provides an index and summary of all documentation for the SMART Guidelines Exchange (SGEX) Workbench project.

## Documentation Structure

### Core Documentation

1. **[Project Plan](project-plan.md)**
   - Project overview and scope
   - Development phases and timeline
   - Stakeholder information
   - Risk management
   - Success criteria

2. **[Requirements](requirements.md)**  
   - Functional requirements (authentication, repository management, editing)
   - Non-functional requirements (performance, accessibility, security)
   - User experience requirements
   - Integration requirements
   - Constraints and assumptions

3. **[Solution Architecture](solution-architecture.md)**
   - High-level system architecture
   - Frontend SPA design
   - GitHub services integration
   - Security and deployment architecture
   - Performance and scalability considerations

4. **[DAK Components](dak-components.md)**
   - Comprehensive guide to the 9 WHO SMART Guidelines DAK components
   - Detailed component descriptions and purposes
   - Level 2 (Business Logic) vs Level 3 (Technical Implementation) organization
   - Editor capabilities and file type specifications

5. **[L2/L3 Architecture](l2-l3-architecture.md)**
   - Comprehensive guide to WHO SMART Guidelines L2/L3 methodology
   - Operational vs Executable layer implementation details
   - Component transformation processes and best practices
   - External system integration patterns

6. **[Asset Management](asset-management.md)**
   - Complete asset lifecycle management workflows
   - Asset creation, modification, and distribution processes
   - Quality assurance and governance frameworks
   - External system integration (IRIS, OCL, PCMT)

7. **[Page Framework](page-framework.md)**
   - Consistent page functionality framework for all pages
   - URL patterns and page types (Top-Level, User, DAK, Asset)
   - Header components and navigation patterns
   - Error handling and automatic bug reporting
   - Developer requirements and implementation examples

## Key Concepts

### SGEX Workbench
A browser-based, static web application for collaborative editing of WHO SMART Guidelines Digital Adaptation Kits (DAKs) content stored in GitHub repositories.

### DAK Components (9 Total)
The system supports editing of all 9 WHO SMART Guidelines DAK components:
1. Health Interventions and Recommendations
2. Generic Personas
3. User Scenarios
4. Generic Business Processes and Workflows
5. Core Data Elements (includes Terminology Services via OCL and Product Master Data via PCMT)
6. Decision-Support Logic
7. Program Indicators
8. Functional and Non-Functional Requirements
9. Test Scenarios

See [DAK Components](dak-components.md) for comprehensive details.

### Technology Stack
- **Frontend**: React-based Single Page Application
- **Forms**: JSON Forms for schema-driven UI
- **Editors**: bpmn-js (BPMN), dmn-js (DMN), Monaco Editor (XML)
- **Integration**: GitHub Personal Access Tokens + REST API via Octokit
- **Deployment**: GitHub Pages

### WHO Compliance
All UI components, terminology, and branding follow WHO SMART Guidelines specifications.

## Architecture Highlights

### Client-Side Only
- No backend server required
- All processing in browser
- GitHub handles storage and collaboration

### GitHub-Centric
- Personal Access Token authentication
- Repository-based permissions
- Native GitHub collaboration tools integration

### Standards-Compliant
- JSON Forms for accessibility (WAI-ARIA)
- Modern web standards
- Progressive enhancement

## Development Approach

### Current Phase: Documentation
- Requirements definition ✓
- Solution architecture ✓  
- Project planning ✓
- Documentation structure ✓

### Future Phases
- Architecture refinement
- Implementation planning
- Development and testing

## Key Features

### Authentication & Access
- GitHub Personal Access Token integration
- Repository permission inheritance
- Post-authentication redirect to intended view

### Editing Capabilities
- BPMN diagram editing with SVG generation
- DMN decision table editing
- Markdown content editing
- Raw XML editing for advanced users

### User Experience
- WHO SMART Guidelines branding
- Dashboard with 9 DAK component tiles
- Contextual navigation
- Accessibility support for visual impairments
- Internationalization ready (multilingual support)

### Collaboration
- GitHub Issues integration
- GitHub Projects/Kanban linking
- GitHub Discussions access
- Pull request workflow

## Security Model

- Client-side only architecture
- No secrets in codebase
- GitHub Personal Access Tokens for authentication
- Repository permissions for authorization
- HTTPS-only communication

## Deployment Strategy

- Primary: GitHub Pages (smart-base repo)
- Alternative: Netlify, Vercel, or similar CDN
- Static site deployment
- Automatic deployment pipeline

## Accessibility & Internationalization

- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Locale-based content support (e.g., fr_FR)
- WHO terminology consistency

## Quality Assurance

- Technical accuracy through architectural review
- WHO SMART Guidelines compliance
- Consistent documentation formatting
- Accessibility considerations throughout

---

*For detailed information on any topic, refer to the specific documentation files listed above.*