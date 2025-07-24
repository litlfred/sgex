# SGEX Workbench Requirements

## 1. Overview

The SMART Guidelines Exchange (SGEX) Workbench is a browser-based, static web application designed for collaborative editing of WHO SMART Guidelines Digital Adaptation Kits (DAKs) content stored in GitHub repositories.

## 2. Functional Requirements

### 2.1 User Authentication and Authorization

**REQ-AUTH-001**: The system SHALL use GitHub OAuth for user authentication
- Users must authenticate using their GitHub credentials
- No separate user management system is required
- Authentication state must persist across browser sessions

**REQ-AUTH-002**: The system SHALL redirect users to their intended destination after authentication
- Post-authentication redirect to original app view
- Context preservation (repo/artifact context)
- Support for new GitHub account creation flow

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

### 2.3 DAK Component Management

**REQ-DAK-001**: The system SHALL display all 8 DAK components on the home page
- Visual dashboard with distinctive cards/tiles for each component
- WHO SMART Guidelines branding and color codes
- WHO-provided icons for each component
- Clear visual distinction between Level 2 and Level 3 content

**REQ-DAK-002**: The system SHALL support navigation to component-specific editors
- Click-through navigation from home page to relevant editors
- Context-aware navigation based on content type
- Breadcrumb navigation for user orientation

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
- All authentication via GitHub OAuth

**REQ-SEC-002**: The system SHALL enforce security through GitHub
- Repository permissions enforced by GitHub
- No custom security implementation
- OAuth token management

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

### 4.2 Navigation

**REQ-UX-003**: The system SHALL provide intuitive navigation
- Clear visual hierarchy
- Consistent navigation patterns
- Context-sensitive UI elements
- Breadcrumb navigation

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

- GitHub OAuth service availability
- GitHub REST API stability
- Third-party library maintenance (bpmn-js, dmn-js, JSON Forms)
- WHO SMART Guidelines branding materials availability

---

*This requirements document will be updated as the project evolves and stakeholder feedback is incorporated.*