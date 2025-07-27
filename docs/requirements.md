# SGEX Workbench Requirements

## 1. Overview

The SMART Guidelines Exchange (SGEX) Workbench is a browser-based, static web application designed for collaborative editing of WHO SMART Guidelines Digital Adaptation Kits (DAKs) content stored in GitHub repositories.

### 1.1 Definition of a WHO SMART Guidelines Digital Adaptation Kit

A **GitHub Repository which is a WHO SMART Guidelines Digital Adaptation Kit** is defined as one that:

1. **Has a `sushi-config.yaml` file in the root of the repository**
2. **If found, it should parse the YAML and look for the key 'dependencies' which is a list and which should have a key 'smart.who.int.base'**

This definition ensures that only repositories that are genuinely WHO SMART Guidelines Digital Adaptation Kits are recognized and processed by the SGEX Workbench, providing a clear and technical validation mechanism.

**Example**: A valid DAK repository should have a `sushi-config.yaml` file with content similar to:
```yaml
dependencies:
  smart.who.int.base: current
  # ... other dependencies
```

For reference, see the WHO DAK repository example at: https://github.com/WorldHealthOrganization/smart-immunizations/blob/main/sushi-config.yaml

## 1.2 System Actors

The SGEX Workbench operates within an ecosystem of actors that collaborate to enable effective DAK management and editing:

**REQ-ACTOR-001**: **DAK Author** - The primary user of the system
- Definition: L2 or L3 author of a WHO SMART Guidelines Digital Adaptation Kit
- Role: Creates, edits, forks, and manages DAK content and components
- Access Level: Authenticated GitHub user with repository permissions
- Responsibilities: Content creation, component editing, workflow decisions, quality assurance

**REQ-ACTOR-002**: **SGeX Workbench** - The collaborative editing platform  
- Definition: The SMART Guidelines Exchange web application serving as the primary interface
- Role: Orchestrates DAK management workflows and provides editing capabilities
- Implementation: React-based single-page application hosted on GitHub Pages
- Responsibilities: User interface management, workflow coordination, GitHub API integration

**REQ-ACTOR-003**: **GitHub** - Version control and collaboration platform
- Definition: Cloud-based Git repository hosting service providing storage and collaboration features
- Role: Stores DAK repositories, manages permissions, provides versioning and collaboration tools
- Integration: REST API v3/v4 for repository operations, authentication, and content management
- Responsibilities: Repository hosting, user authentication, permission management, version control

**REQ-ACTOR-004**: **OCL (Open Concept Lab)** - Terminology management system
- Definition: Open-source terminology management platform at https://openconceptlab.org/
- Role: Provides standardized health terminology and concept definitions for DAK components
- Integration: RESTful API for terminology lookup and validation
- Responsibilities: Concept definitions, terminology mappings, vocabulary management

**REQ-ACTOR-005**: **PCMT (Product Catalogue Management Tool)** - Product data management
- Definition: WHO product catalog system at https://productcatalog.io/ and https://worldhealthorganization.github.io/smart-pcmt/
- Role: Manages product master data for health commodities and medical devices
- Integration: API endpoints for product data retrieval and validation
- Responsibilities: Product catalog management, commodity definitions, supply chain data

## 2. Functional Requirements

### 2.1 User Authentication and Authorization

**REQ-AUTH-001**: The system SHALL use GitHub Personal Access Tokens (PATs) for user authentication
- Users must authenticate using their GitHub Personal Access Tokens
- No separate user management system is required
- Authentication state must persist across browser sessions
- Supports both classic and fine-grained Personal Access Tokens

**REQ-AUTH-002**: The system SHALL redirect users to their intended destination after authentication
- Post-authentication redirect to original app view
- Context preservation (repo/artifact context)
- Support for new GitHub account creation flow

**REQ-AUTH-003**: The system SHALL provide reliable authentication loading states
- No infinite loading states during authentication failures
- Proper error handling with fallback to authentication form
- Clear loading indicators during profile data retrieval
- Graceful degradation when GitHub API requests fail

**REQ-AUTH-003**: The system SHALL respect GitHub repository permissions
- All authorization managed through GitHub repository settings
- No custom permission system required
- Users can only access repositories they have permission to view/edit

### 2.2 Repository and Profile Management

**REQ-REPO-001**: The system SHALL allow users to select GitHub profiles or organizations
- Support switching between personal and organization profiles
- Display available DAK repositories for selected profile
- Option to create new repositories (if permitted by GitHub permissions)

**REQ-REPO-002**: The system SHALL provide repository navigation
- List available DAK repositories
- Repository selection interface
- Navigate to repository-specific home page

**REQ-REPO-003**: The system SHALL display official logos and avatars for organizations
- Organizations (e.g., WHO) SHALL display their official logo/avatar retrieved from GitHub
- Avatars SHALL be properly sized and positioned within profile cards
- Profile cards SHALL maintain visual consistency across different organization types

**REQ-REPO-004**: The system SHALL provide DAK repository count indicators
- Users and organizations with scanned DAK repositories SHALL display a notification badge
- The badge SHALL show the number of found DAK repositories in the upper right corner of the avatar
- The badge SHALL be visually distinctive with appropriate color coding and animation
- The badge SHALL only appear when DAK repositories are found (count > 0)
- During repository scanning, a "Scanning..." indicator SHALL be displayed

### 2.3 DAK Component Management

For detailed information about each DAK component, see [DAK Components Documentation](dak-components.md).

**REQ-DAK-001**: The system SHALL display all 8 WHO SMART Guidelines DAK components on the home page
- Visual dashboard with distinctive cards/tiles for each component
- WHO SMART Guidelines branding and color codes  
- WHO-provided icons for each component
- Clear visual distinction between Level 2 (L2) and Level 3 (L3) component representations
- The 8 core WHO SMART Guidelines DAK components are:
  1. **Health interventions and recommendations**
  2. **Generic personas**
  3. **User scenarios**
  4. **Generic business processes and workflows**
  5. **Core data elements**
  6. **Decision-support logic**
  7. **Program indicators**
  8. **Functional and non-functional requirements**

**REQ-DAK-002**: The system SHALL distinguish between L2 and L3 component representations
- **L2 (Level 2)**: Data model agnostic representations that capture business logic and clinical processes independent of specific technical implementations
- **L3 (Level 3)**: FHIR R4-specific implementations following WHO enterprise architecture specifications at http://smart.who.int/ra
- Clear visual indicators and separate editing workflows for L2 vs L3 content
- Traceability links between corresponding L2 and L3 representations

**REQ-DAK-003**: The system SHALL support canonical representations for DAK components according to the following mapping:

| DAK Component | L2 Representation | L3 Representation |
|---------------|-------------------|-------------------|
| Health interventions and recommendations | References to Publications on IRIS at https://iris.who.int/ | FHIR Clinical Practice Guidelines |
| Generic personas | Actor definitions and role descriptions | FHIR Person/Practitioner profiles |
| User scenarios | Use case narratives and workflows | FHIR Scenario test bundles |
| Generic business processes and workflows | BPMN diagrams (.bpmn) | FHIR ActivityDefinition/PlanDefinition |
| Core data elements | Open Concept Lab (OCL) at https://openconceptlab.org/ | FHIR StructureDefinition profiles |
| Product Master Data | FHIR CodeSystems and Logical Models | Product Catalogue Management Tool (PCMT) at https://worldhealthorganization.github.io/smart-pcmt/ and https://productcatalog.io/ |
| Decision-support logic | DMN decision tables | FHIR PlanDefinition with decision logic |
| Program indicators | Logical indicator models | FHIR Measure resources |
| Functional and non-functional requirements | Requirements specifications at https://worldhealthorganization.github.io/smart-base/StructureDefinition-FunctionalRequirement.html and https://worldhealthorganization.github.io/smart-base/StructureDefinition-NonFunctionalRequirement.html | FHIR ImplementationGuide conformance rules |

**REQ-DAK-004**: The system SHALL support additional structured knowledge representations:

| Knowledge Type | L2 Representation | L3 Representation |
|----------------|-------------------|-------------------|
| Terminology | Concept definitions and mappings | FHIR CodeSystem/ValueSet |
| FHIR Profiles | Data model specifications | FHIR StructureDefinition |
| FHIR Extensions | Extension specifications | FHIR StructureDefinition (extension) |
| FHIR Questionnaires | FHIR Questionnaires | FHIR Questionnaires coupled with FHIR Structure Map |
| Test Data & Examples | Test scenarios and sample data | FHIR Examples/test bundles |

**REQ-DAK-005**: The system SHALL comply with industry standards
- Business processes SHALL conform to [OMG BPMN 2.0 specification](https://www.omg.org/spec/BPMN/2.0/)
- Decision support logic SHALL conform to [OMG DMN 1.3 specification](https://www.omg.org/spec/DMN/1.3/)
- L3 implementations SHALL align with WHO enterprise architecture at http://smart.who.int/ra
- All FHIR resources SHALL comply with FHIR R4 specification

**REQ-DAK-006**: The system SHALL provide component-specific navigation and editing
- Click-through navigation from home page to specialized editors for each component type
- Context-aware editing capabilities based on L2/L3 distinction
- Breadcrumb navigation for user orientation
- Component-specific validation and error handling

**REQ-DAK-007**: The system SHALL support enhanced business process selection navigation
- Business process navigation SHALL NOT require permission validation at initial click
- Permission checks SHALL occur only when attempting to edit or create BPMN diagrams
- The system SHALL provide a dedicated business process selection interface showing:
  - List of all BPMN files in `input/business-processes/` directory
  - File metadata (name, path, size) for each BPMN diagram
  - Three action modes per file: View (read-only), Edit (permission-required), Source (XML viewing)
- Read-only BPMN viewing SHALL use `bpmn-js/NavigatedViewer` without editing capabilities
- Source viewing SHALL display formatted XML with copy, download, and GitHub integration features
- All business process screens SHALL maintain consistent breadcrumb navigation
- Permission notices SHALL be clearly displayed for users without write access

### 2.4 File Operations

**REQ-FILE-001**: The system SHALL provide file browser functionality
- Navigate file structure within repositories
- Create, rename, and delete files
- Visual cues for different file types
- Support for BPMN, DMN, Markdown, and XML files

**REQ-FILE-002**: The system SHALL support branch operations
- Branch selection and creation
- Commit changes to selected branch
- Create pull requests for changes

### 2.5 Content Editing

**REQ-EDIT-001**: The system SHALL provide BPMN diagram editing
- Graphical BPMN editor using bpmn-js
- SVG view creation and deletion
- Raw XML editing capability
- Store SVG views in appropriate directory structure

**REQ-EDIT-002**: The system SHALL provide DMN decision table editing
- DMN editor using dmn-js
- Decision table management
- DMN model validation

**REQ-EDIT-003**: The system SHALL provide Markdown editing
- Rich text/Markdown editor
- Preview functionality
- Documentation content management

**REQ-EDIT-004**: The system SHALL provide raw XML editing
- Monaco Editor for advanced XML editing
- Syntax highlighting and validation
- Support for complex XML structures

### 2.6 Form-Based Data Entry

**REQ-FORM-001**: The system SHALL use JSON Forms for all structured data entry
- Schema-driven form rendering
- JSON Schema and UI Schema based forms
- Custom WHO-branded renderers
- Validation and error handling

**REQ-FORM-002**: The system SHALL support DAK artifact creation and editing
- Form-based creation of DAK components
- Metadata editing interfaces
- Property editing for BPMN/DMN elements

### 2.7 Collaboration Integration

**REQ-COLLAB-001**: The system SHALL provide contextual links to GitHub collaboration tools
- Links to GitHub Issues
- Links to GitHub Projects
- Links to GitHub Discussions
- Integration without replication of GitHub functionality

**REQ-COLLAB-002**: The system SHALL support GitHub workflow integration
- Pull request creation
- Branch management
- Commit history access

## 3. Non-Functional Requirements

### 3.1 Performance

**REQ-PERF-001**: The system SHALL provide fast SPA load times
- Optimized bundle sizes
- Lazy loading of components
- Efficient asset delivery

**REQ-PERF-002**: The system SHALL provide responsive editing experience
- Real-time editing feedback
- Minimal latency for user interactions
- Efficient GitHub API usage

### 3.2 Accessibility

**REQ-ACCESS-001**: The system SHALL follow accessibility best practices
- WAI-ARIA compliance through JSON Forms
- Support for screen readers
- Keyboard navigation support
- High contrast mode support

**REQ-ACCESS-002**: The system SHALL support visual impairment accessibility
- Screen reader compatibility
- Alternative text for images and diagrams
- Accessible color schemes

### 3.3 Internationalization

**REQ-I18N-001**: The system SHALL support internationalization from the start
- Locale-based content (e.g., fr_FR)
- Multilingual support architecture
- Extensible localization framework

### 3.4 Security

**REQ-SEC-001**: The system SHALL run entirely client-side
- No backend server required
- No secrets stored in codebase
- All authentication via GitHub Personal Access Tokens

**REQ-SEC-002**: The system SHALL enforce security through GitHub
- Repository permissions enforced by GitHub
- No custom security implementation
- Personal Access Token management

### 3.5 Compatibility

**REQ-COMPAT-001**: The system SHALL support modern browsers
- Chrome, Firefox, Safari, Edge support
- Progressive enhancement approach
- Graceful degradation for older browsers

### 3.6 Deployment

**REQ-DEPLOY-001**: The system SHALL be deployable on GitHub Pages
- Static site deployment
- CDN compatibility (Netlify, Vercel)
- Specific GitHub Pages integration for smart-base repo

## 4. User Experience Requirements

### 4.1 Branding

**REQ-UX-001**: The system SHALL follow WHO SMART Guidelines branding
- WHO color palette and visual identity
- Consistent terminology usage
- Official WHO iconography
- Professional medical/health appearance

**REQ-UX-002**: The system SHALL provide onboarding for GitHub newcomers
- Helper guides for new GitHub users
- Clear instructions for account creation
- Smooth transition from GitHub signup to app usage

**REQ-UX-003**: The system SHALL provide a consistent "Get Help" feature
- SGEX mascot-based help button available throughout the application
- **Fixed positioning**: Mascot appears as a fixed UI element in the bottom-right corner of each page
- **Transparent background**: Mascot images have transparent backgrounds for seamless integration
- **Interactive help behavior**:
  - **Hover interaction**: When user hovers over the mascot, a contextual help dialog appears as a thought bubble
  - **Click interaction**: When user clicks the mascot, the help dialog becomes sticky and remains visible until manually closed
  - **Thought bubble design**: Help content appears in a speech bubble pointing to the mascot
- Context-sensitive help dialogs with step-by-step guidance tailored to the current page
- Interactive slideshow for GitHub Personal Access Token creation
- Hamburger menu with additional support options:
  - File Bug Report functionality linking to GitHub issues
  - DAK Feedback option (when applicable) linking to selected repository issues
  - Email support option with pre-populated context
- Help system should overlay current screen without losing user context
- Mascot should provide helpful hints and guidance in speech bubbles

### 4.2 Navigation

**REQ-UX-003**: The system SHALL provide intuitive navigation
- Clear visual hierarchy
- Consistent navigation patterns
- Context-sensitive UI elements
- Breadcrumb navigation

**REQ-UX-004**: The system SHALL provide accessible help and support
- SGEX Workbench mascot as consistent help interface
- Context-aware help system with step-by-step guidance
- Multiple support channels integrated into help interface
- Visual and textual guidance for complex workflows

## 5. Integration Requirements

### 5.1 GitHub Services

**REQ-INT-001**: The system SHALL integrate with GitHub REST API
- Use Octokit for API interactions
- Direct browser-to-GitHub communication
- Proper error handling and rate limiting

**REQ-INT-002**: The system SHALL leverage GitHub collaboration features
- Issue tracking integration
- Project management links
- Discussion forum access

### 5.2 External Libraries

**REQ-INT-003**: The system SHALL use specified libraries
- JSON Forms for form rendering
- bpmn-js for BPMN editing
- dmn-js for DMN editing
- Monaco Editor for code editing
- Octokit for GitHub API access

## 6. Constraints

### 6.1 Technical Constraints

- Client-side only architecture (no backend server)
- GitHub Pages deployment requirement
- GitHub API rate limits
- Browser security restrictions

### 6.2 Project Constraints

- No L2/L3 schema generation in initial phase
- Documentation-only phase (no implementation)
- WHO branding and terminology compliance required

## 7. Assumptions

- Users have or can create GitHub accounts
- Target users are familiar with DAK concepts
- Modern browser availability
- Stable internet connection for GitHub API access
- GitHub service availability and reliability

## 8. Dependencies

- GitHub Personal Access Token service availability
- GitHub REST API stability
- Third-party library maintenance (bpmn-js, dmn-js, JSON Forms)
- WHO SMART Guidelines branding materials availability

---

*This requirements document will be updated as the project evolves and stakeholder feedback is incorporated.*