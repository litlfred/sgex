# SGEX Workbench Solution Architecture

## 1. Architecture Overview

This document describes the technical solution architecture for the SMART Guidelines Exchange (SGEX) Workbench, a browser-based collaborative editor for WHO SMART Guidelines Digital Adaptation Kits (DAKs).

## 2. System Architecture

### 2.1 High-Level Architecture

```mermaid
flowchart TD
    User[User (Browser)]
    Frontend[SGEX Workbench (SPA on GitHub Pages/CDN)]
    GitHub[GitHub Cloud Services]
    User <--> Frontend
    Frontend <--> GitHub
```

**Components:**
- **User:** Interacts with the app using a modern browser
- **SGEX Workbench Frontend:** Runs entirely client-side as a Single Page Application (SPA), hosted on GitHub Pages or another CDN
- **GitHub Cloud:** Provides authentication, authorization, file storage, versioning, branching, and collaboration tools

### 2.2 DAK Management Workflow Architecture

The SGEX Workbench implements a comprehensive "Manage a DAK" workflow as defined in issue #26, involving five key actors:

**Workflow Actors:**
1. **DAK Author** - L2/L3 author of WHO SMART Guidelines
2. **SGeX Workbench** - The collaborative editing platform
3. **GitHub** - Version control and repository management
4. **OCL (Open Concept Lab)** - Terminology management
5. **PCMT** - Product catalog management

**Workflow Diagrams:**
- **BPMN Diagram:** [`docs/workflows/manage-dak-workflow.bpmn`](workflows/manage-dak-workflow.bpmn)
- **Sequence Diagram:** [`docs/workflows/manage-dak-sequence.puml`](workflows/manage-dak-sequence.puml)

**Workflow Components:**
- **DAK Action Selection:** Choose between edit, fork, or create DAK
- **DAK Selection:** Select source DAK repository with SMART Guidelines filtering
- **Organization Selection:** Choose destination for fork/create operations
- **DAK Configuration:** Configure new DAK parameters and sushi-config.yaml
- **Component Editing:** Edit DAK components with specialized editors

### 2.2 Architecture Principles

1. **Client-Side Only**: No backend server required - all processing happens in the browser
2. **GitHub-Centric**: Leverage GitHub services for all data storage and collaboration
3. **Standards-Compliant**: Use established standards and libraries for consistency
4. **WHO Branded**: Follow WHO SMART Guidelines visual identity and terminology

## 3. Frontend Single Page Application (SPA)

### 3.1 Technology Stack

**Core Framework Options:**
- **React** (recommended) - Mature ecosystem, JSON Forms integration
- Vue.js - Alternative option
- Svelte - Lightweight alternative

**UI Framework:**
- **JSON Forms** - Primary UI rendering engine
  - Schema-driven form rendering
  - JSON Schema and UI Schema based
  - WAI-ARIA compliant
  - Custom renderer support

### 3.2 Key Libraries and Dependencies

**Form Rendering:**
- [JSON Forms](https://jsonforms.io/) - Schema-driven UI forms
- [JSON Forms React bindings](https://jsonforms.io/docs/react) - React integration

**File Editors:**
- [bpmn-js](https://github.com/bpmn-io/bpmn-js) - BPMN diagram editing and SVG generation
- [dmn-js](https://github.com/bpmn-io/dmn-js) - DMN decision table editing
- Monaco Editor - Advanced XML and code editing
- Rich text/Markdown editor (TBD)

**GitHub Integration:**
- [Octokit](https://github.com/octokit/rest.js) - GitHub REST API client
- GitHub OAuth integration

**Development Tools:**
- TypeScript (recommended) - Type safety
- ESLint - Code quality
- Prettier - Code formatting

### 3.3 Application Structure

```
src/
├── components/           # React components
│   ├── common/          # Shared UI components
│   ├── editors/         # File editors (BPMN, DMN, Markdown)
│   ├── forms/           # JSON Forms components
│   └── layout/          # Layout components
├── services/            # Business logic and API services
│   ├── github/          # GitHub API integration
│   ├── auth/            # Authentication services
│   └── storage/         # Local storage utilities
├── schemas/             # JSON Schemas for forms
├── styles/              # CSS and styling
├── hooks/               # React custom hooks
├── utils/               # Utility functions
├── locales/             # Internationalization files
└── types/               # TypeScript type definitions
```

### 3.4 User Interface Design

**Branding Requirements:**
- WHO SMART Guidelines color palette
- Official WHO iconography
- Professional medical/health appearance
- Consistent terminology from WHO documentation

**Home Page Layout:**
- Dashboard/grid layout featuring 8 DAK components
- Each component as navigable card/tile
- Visual distinction between Level 2 and Level 3 content
- Clear component identification with WHO-provided icons

**Navigation Patterns:**
- Context-aware breadcrumb navigation
- Consistent header/footer across views
- Side navigation for component-specific features
- Contextual action menus

### 3.5 Form Architecture with JSON Forms

**Schema-Driven Approach:**
- All structured data entry uses JSON Schema definitions stored in `src/schemas/`
- UI Schema controls presentation and validation
- Custom WHO-branded renderers for specialized controls
- Consistent validation and error handling

**Workflow Schemas:**
- [`dak-action-form.json`](../src/schemas/dak-action-form.json) - DAK action selection (edit/fork/create)
- [`dak-selection-form.json`](../src/schemas/dak-selection-form.json) - Repository selection with SMART Guidelines filtering
- [`organization-selection-form.json`](../src/schemas/organization-selection-form.json) - GitHub organization selection
- [`dak-config-form.json`](../src/schemas/dak-config-form.json) - DAK configuration and sushi-config.yaml parameters

**Implementation Pattern:**
```javascript
// Example JSON Forms integration
import { JsonForms } from '@jsonforms/react';
import { materialRenderers } from '@jsonforms/material-renderers';

const DAKComponentForm = ({ schema, uischema, data, onChange }) => (
  <JsonForms
    schema={schema}
    uischema={uischema}
    data={data}
    renderers={[...materialRenderers, ...whoCustomRenderers]}
    onChange={onChange}
  />
);
```

## 4. GitHub Services Integration

### 4.1 Authentication and Authorization

**OAuth Flow:**
1. User accesses SGEX Workbench
2. Redirect to GitHub OAuth if not authenticated
3. GitHub authentication/account creation
4. Redirect back to original context (repo/artifact specific)
5. Access token stored securely in browser

**Permission Model:**
- All permissions managed by GitHub repository settings
- Users inherit GitHub-based access controls
- No custom permission system required

### 4.2 Repository Operations

**GitHub API Integration:**
- Direct browser-to-GitHub API communication via Octokit
- Repository listing and selection
- File operations (CRUD)
- Branch management
- Commit operations
- Pull request creation

**API Usage Patterns:**
```javascript
// Example GitHub API usage
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: userToken,
});

// Get repository contents
const { data } = await octokit.rest.repos.getContent({
  owner: 'org',
  repo: 'dak-repo',
  path: 'input/business-processes'
});
```

### 4.3 Collaboration Features

**GitHub-Native Tools:**
- Issues - Link to GitHub Issues interface
- Projects - Link to GitHub Projects/Kanban
- Discussions - Link to GitHub Discussions
- Pull Requests - Created through SGEX, managed in GitHub

**Integration Approach:**
- Contextual links from SGEX to GitHub tools
- No replication of GitHub functionality
- Seamless transition between SGEX and GitHub interfaces

## 5. File Editing Architecture

### 5.1 BPMN Editor Integration

**Features:**
- Graphical BPMN diagram editing using bpmn-js
- SVG view generation and management
- Raw XML editing capability
- Property panels for BPMN elements

**Implementation:**
```javascript
// BPMN Editor component structure
import BpmnModeler from 'bpmn-js/lib/Modeler';

const BPMNEditor = ({ initialXml, onSave }) => {
  const modeler = useRef(new BpmnModeler());
  
  // Editor initialization and event handling
  // SVG export functionality  
  // GitHub save operations
};
```

### 5.2 DMN Editor Integration

**Features:**
- Decision table editing using dmn-js
- DMN model validation
- Decision requirement diagram support

### 5.3 Content Editors

**Markdown Editor:**
- Rich text editing with Markdown support
- Preview functionality
- Documentation-focused interface

**XML Editor:**
- Monaco Editor for advanced XML editing
- Syntax highlighting and validation
- Auto-completion support

## 6. Data Architecture

### 6.1 State Management

**Client-Side State:**
- React Context or Redux for global state
- Local state for component-specific data
- GitHub API response caching

**Data Flow:**
1. User authentication state
2. Repository and branch context
3. File content and editing state
4. Form data and validation state

### 6.2 Caching Strategy

**Browser Storage:**
- SessionStorage for temporary data
- LocalStorage for user preferences
- IndexedDB for large file caching (if needed)

**API Caching:**
- HTTP cache headers from GitHub API
- Client-side response caching
- Optimistic updates for better UX

## 7. Security Architecture

### 7.1 Security Model

**Client-Side Security:**
- No secrets stored in application code
- OAuth tokens managed securely in browser
- HTTPS-only communication
- CSP headers for XSS protection

**GitHub-Based Security:**
- Authentication via GitHub OAuth
- Authorization via GitHub repository permissions
- Audit trail through GitHub commit history

### 7.2 Privacy Considerations

**Data Handling:**
- No user data stored outside GitHub
- All processing happens client-side
- No server-side logging or analytics
- User consent for GitHub OAuth access

## 8. Deployment Architecture

### 8.1 Hosting Strategy

**Primary Deployment: GitHub Pages**
- Static site deployment to gh-pages branch of smart-base repo
- Automatic deployment via GitHub Actions
- CDN distribution through GitHub's infrastructure

**Alternative Deployments:**
- Netlify for development/staging
- Vercel for alternative hosting
- Any static site CDN

### 8.2 Build and Deployment

**Build Process:**
- React application bundling
- Asset optimization and minification
- Environment-specific configuration
- Static site generation

**Deployment Pipeline:**
```yaml
# Example GitHub Actions workflow
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm install
      - name: Build application
        run: npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
```

## 9. Performance Architecture

### 9.1 Performance Strategy

**Frontend Optimization:**
- Code splitting and lazy loading
- Bundle size optimization
- Asset compression and caching
- Progressive web app features

**API Optimization:**
- Efficient GitHub API usage
- Request batching where possible
- Response caching
- Rate limit management

### 9.2 Scalability Considerations

**Client-Side Scaling:**
- Efficient memory management
- Large file handling strategies
- Background processing for heavy operations

**GitHub API Scaling:**
- Rate limit compliance
- Efficient API usage patterns
- Error handling and retry logic

## 10. Accessibility Architecture

### 10.1 Accessibility Standards

**Compliance Requirements:**
- WCAG 2.1 AA compliance
- WAI-ARIA implementation via JSON Forms
- Screen reader compatibility
- Keyboard navigation support

**Implementation Strategy:**
- Semantic HTML structure
- ARIA labels and roles
- Focus management
- High contrast mode support

## 11. Internationalization Architecture

### 11.1 i18n Framework

**Localization Support:**
- React i18next for internationalization
- Locale-based content management (e.g., fr_FR)
- RTL language support preparation
- Date/time localization

**Content Strategy:**
- Externalized strings in locale files
- Dynamic language switching
- Fallback language support
- WHO terminology consistency across languages

## 12. Monitoring and Analytics

### 12.1 Application Monitoring

**Client-Side Monitoring:**
- Error tracking (e.g., Sentry)
- Performance monitoring
- User experience metrics
- GitHub API usage tracking

**Privacy-Compliant Analytics:**
- No personal data collection
- Usage pattern analysis
- Performance metrics
- Error reporting

## 13. Future Architecture Considerations

### 13.1 Extensibility

**Plugin Architecture:**
- Custom renderer system for JSON Forms
- Editor extension points
- Component modularity for future features

**Integration Opportunities:**
- Additional file format support
- Advanced collaboration features
- Workflow automation hooks

### 13.2 Evolution Path

**Architectural Evolution:**
- Microservice transition possibilities
- Advanced offline capabilities
- Real-time collaboration features
- Mobile application adaptation

---

*This solution architecture will be refined as the project progresses and technical requirements are validated through implementation.*