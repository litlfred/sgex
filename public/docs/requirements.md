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

**REQ-DAK-001**: The system SHALL display all 9 WHO SMART Guidelines DAK components on the home page
- Visual dashboard with distinctive cards/tiles for each component
- WHO SMART Guidelines branding and color codes  
- WHO-provided icons for each component
- Clear visual distinction between Level 2 (L2) and Level 3 (L3) component representations
- The 9 core WHO SMART Guidelines DAK components are:
  1. **Health interventions and recommendations**
  2. **Generic personas**
  3. **User scenarios**
  4. **Generic business processes and workflows**
  5. **Core data elements**
  6. **Product master data**
  7. **Decision-support logic**
  8. **Program indicators**
  9. **Functional and non-functional requirements**

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
| Core data elements | Open Concept Lab (OCL) at https://openconceptlab.org/ and Product Catalogue Management Tool (PCMT) at https://worldhealthorganization.github.io/smart-pcmt/ and https://productcatalog.io/ | FHIR StructureDefinition profiles and CodeSystems |
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

**REQ-DAK-008**: The system SHALL provide public Decision Support Logic viewing capabilities
- Decision Support Logic component card SHALL always display a 'View' link accessible to all users (authenticated or not)
- The system SHALL provide a dedicated Decision Support Logic view page with two main sections:
  1. **Variables Section**: Dynamic display of DAK.DT code system content as a sortable, searchable table
  2. **Decision Tables Section**: List of DMN files from `input/decision-logic/` directory with comprehensive linking
- Variables table SHALL include columns: Code, Display, Definition, Table, Tab, and CQL (rendered as formatted code blocks)
- Decision tables SHALL provide three types of links per file:
  - **DMN Source**: Pop-up dialog displaying raw DMN content with copy functionality
  - **GitHub Source**: Direct link to the file on GitHub repository
  - **HTML Rendering**: Link to corresponding HTML file in `input/pagecontent/` (when available)
- All DMN and HTML renderings SHALL use styling from WHO DMN stylesheet (https://github.com/WorldHealthOrganization/smart-base/blob/main/input/scripts/includes/dmn.css)
- All Decision Support Logic features SHALL be accessible without authentication
- Navigation SHALL support direct URL access with repository parameters: `/decision-support-logic/:user/:repo/:branch`

### 2.4 URL Patterns and Routing

**REQ-URL-001**: The system SHALL use consistent URL patterns for DAK component pages
- DAK component pages SHALL follow the pattern: `/{component}/{user}/{repo}` or `/{component}/{user}/{repo}/{branch}`
- Core Data Dictionary viewer SHALL use: `/core-data-dictionary-viewer/{user}/{repo}/{branch}`
- Business process selection SHALL use: `/business-process-selection/{user}/{repo}/{branch}`
- Dashboard SHALL use: `/dashboard/{user}/{repo}/{branch}`
- URL parameters SHALL take precedence over location state for navigation context
- Components SHALL support both URL-based and state-based navigation for backward compatibility

**REQ-URL-002**: The system SHALL maintain URL parameter consistency
- `{user}`: GitHub username or organization name (owner of the repository)
- `{repo}`: Repository name
- `{branch}`: Git branch name (optional, defaults to repository default branch)
- URL patterns SHALL be used for shareable links and direct navigation
- Navigation between DAK components SHALL preserve URL parameter context

**REQ-URL-003**: The system SHALL support GitHub Pages URL generation
- Branch-based URL generation for FHIR IG Publisher artifacts:
  - Main branch: `https://{user}.github.io/{repo}/`
  - Other branches: `https://{user}.github.io/{repo}/branches/{branch}`
- Artifact links for Code Systems, Value Sets, Logical Models, and Concept Maps
- Standard Dictionaries section with Core Data Dictionary CodeSystem link

### 2.5 File Operations

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

**REQ-EDIT-005**: The system SHALL provide Core Data Dictionary viewing capabilities
- Dedicated viewer for Component 2 Core Data Dictionary (DAK Component: Core Data Elements)
- Accessible from "Core Data Elements" (9 Core Components)
- URL pattern following REQ-URL-001: `/core-data-dictionary-viewer/{user}/{repo}/{branch}`
- Context preservation through URL parameters with fallback to location state
- FHIR FSH file detection and display from `input/fsh/` directory
- Source code modal viewer with syntax highlighting for FSH files
- Direct GitHub source code links for each FSH file
- Publications section with automated gh-pages branch detection
- Branch-based URL generation for FHIR IG Publisher artifacts (per REQ-URL-003)
- Artifact links for Code Systems, Value Sets, Logical Models, and Concept Maps
- Standard Dictionaries section with Core Data Dictionary CodeSystem link
- Help integration with contextual help topics and notification badges for repositories without gh-pages
- Consistent blue background styling matching DAK Dashboard component pages

**REQ-EDIT-006**: The system SHALL provide enhanced asset editor framework
- All asset editors (BPMN, DMN, CQL, Feature Files, etc.) SHALL use the common page framework
- Asset editors SHALL provide consistent save functionality with two independent save operations:
  - "Save Local": Saves content to browser localStorage
  - "Save to GitHub": Commits content to GitHub repository
- Independent button states: Local and GitHub save buttons SHALL maintain separate disabled/loading states
- Save confirmation: Local save SHALL provide success confirmation and then disable until content changes
- GitHub commit workflow: GitHub save SHALL prompt for commit message, allow cancellation, show progress, and disable upon success
- Error handling: Both save operations SHALL display clear error messages with dismissal capability
- Demo mode support: Asset editors SHALL function in demo mode with local save only
- Authentication integration: GitHub save functionality SHALL only be available to authenticated users
- Content change detection: Asset editors SHALL accurately track and display unsaved changes
- Asset editors SHALL support loading and discarding local versions of files

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

### 5.3 FHIR IG Publisher and GitHub Workflows

**REQ-INT-004**: The system SHALL support FHIR Implementation Guide Publisher integration
- DAK repositories use the FHIR IG Publisher to generate published artifacts from FSH source files
- Each branch (except gh-pages) triggers the IG Publisher on every commit via GitHub Actions
- Published content is deployed to the gh-pages branch for web access
- The Core Data Dictionary viewer integrates with this publishing workflow to provide artifact links

**REQ-INT-005**: The system SHALL understand branch-to-publication relationships
- **Main branch publication**: Content accessible at `https://{user}.github.io/{repo}/`
- **Feature branch publication**: Content accessible at `https://{user}.github.io/{repo}/branches/{branch}`
- **Source files**: FHIR FSH files stored in `input/fsh/` directory
- **Published artifacts**: Generated HTML documentation and FHIR resources
- **Artifact categories**: Code Systems, Value Sets, Logical Models, Concept Maps available at standardized paths

**REQ-INT-006**: The system SHALL provide GitHub Pages setup guidance
- Detect repositories without gh-pages branch configuration
- Provide contextual help links to WHO IG Starter Kit documentation
- Reference setup instructions at https://smart.who.int/ig-starter-kit/v1.0.0/ig_setup.html#ghpages-build
- Display notification badges in help system for repositories requiring setup
- Guide users through common setup and troubleshooting scenarios

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

## 9. Staging Ground for DAK Changes

### 9.1 Overview

**REQ-STAGING-001**: The system SHALL provide a "Staging Ground" for managing local DAK changes before committing to GitHub
- The staging ground serves as a temporary workspace for DAK authors to make and validate changes
- All changes must pass compliance validation before being committed to the repository
- Local changes are stored in browser localStorage with timestamp and rollback capabilities
- Staging ground integrates with all DAK component editing tools

### 9.2 Data Structure

**REQ-STAGING-002**: The system SHALL maintain a structured data dictionary for staging ground with the following properties:
- **message**: A commit message provided by the DAK Author when saving changes
- **files**: Array of file objects containing:
  - **path**: Relative path of the file within the repository
  - **content**: Full file content (editing tools provide complete files, not diffs)
  - **metadata**: Additional metadata necessary for commit operations
  - **timestamp**: When the file was last modified in staging
- **timestamp**: Overall timestamp when the staging ground was last updated
- **branch**: Target branch for the changes

**REQ-STAGING-003**: The system SHALL support multiple timestamped saves in local storage
- Each save operation creates a separate entry with timestamp
- DAK authors can roll back to earlier saved versions
- Local storage manages versioning and cleanup of old saves

### 9.3 Compliance Validation

**REQ-STAGING-004**: The system SHALL provide comprehensive compliance validation with three severity levels:
- **Error**: Compliance failures that block commit/save operations
- **Warning**: Issues that should be addressed but don't prevent saving
- **Info**: Informational messages about best practices or suggestions

**REQ-STAGING-005**: The system SHALL support validation execution in multiple environments:
- **Client-side in React**: Real-time validation in SGeX Workbench interface
- **Command-line**: For users working with git checkout and command-line tools
- **IDE integration**: For users editing in their preferred development environment

**REQ-STAGING-006**: The system SHALL block save operations when error-level validation failures exist
- Save button remains disabled until errors are resolved
- Optional override mechanism (disabled by default) allows saving despite errors
- Clear error messages guide users toward resolution

### 9.4 User Interface

**REQ-STAGING-007**: The system SHALL display staging ground status in the DAK Dashboard through a collapsible interface:
- **Title bar** (always visible) showing:
  - Status indicator badge with number of files changed
  - Horizontal stoplight validation indicator with severity badges:
    - Red: Number of error-level compliance test failures
    - Amber/Orange: Number of warning-level compliance test failures  
    - Green: Number of info-level compliance test results
  - Colors light up only when no failures exist for that severity level
- **Expanded content** (initially collapsed) showing:
  - Detailed list of changed files
  - Validation results with specific messages
  - Save button and commit message interface

**REQ-STAGING-008**: The system SHALL provide a save dialog interface:
- Commit message input field (required)
- Validation status display with expansion for details
- Option to override error-level validations (disabled by default)
- Clear error handling with user-friendly resolution guidance

### 9.5 Integration Interfaces

**REQ-STAGING-009**: The system SHALL provide standardized interfaces for DAK component editing tools:
- **File contribution interface**: Allows editing tools to add/update files in staging ground
- **Status query interface**: Tools can check current staging ground state
- **Validation trigger interface**: Tools can request validation of their contributions

**REQ-STAGING-010**: The system SHALL support integration with existing DAK editing workflows:
- BPMN editor integration for business process files
- DMN editor integration for decision support logic
- Form-based editors for structured DAK components
- File browser integration for direct file modifications

### 9.6 Persistence and Versioning

**REQ-STAGING-011**: The system SHALL implement robust local storage management:
- Browser localStorage for client-side persistence
- Automatic cleanup of old saves (configurable retention period)
- Conflict detection when multiple browser tabs modify the same DAK
- Export/import functionality for staging ground state

**REQ-STAGING-012**: The system SHALL support rollback to previous saves:
- List of available save points with timestamps
- Preview capability showing changes between saves
- One-click rollback to any previous save state
- Confirmation dialogs to prevent accidental data loss

### 9.7 GitHub Integration

**REQ-STAGING-013**: The system SHALL seamlessly integrate staging ground with GitHub operations:
- Staging ground changes translate directly to GitHub commit operations
- Branch selection and creation through staging ground interface
- Pull request creation workflow incorporating staged changes
- Conflict resolution when remote changes affect staged files

**REQ-STAGING-014**: The system SHALL maintain consistency between staging ground and repository state:
- Detection of conflicts with remote changes
- Merge capabilities for non-conflicting changes
- Clear indicators when staging ground is out of sync with selected branch

---

*This requirements document will be updated as the project evolves and stakeholder feedback is incorporated.*