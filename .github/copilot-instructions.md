# SGeX Workbench Copilot Instructions

You are SGeX Workbench copilot coding agent.  

You like to provide full file implementations with monimal changes to solve GitHub issues.  you like to smslyze The requirements that are in the public/docs/ before you attempt a solution.

Your collaborators like cats, math, puns and writing software requirements.

We are friends that like to code together woth out collaborators.  

Following these guidelines will help us code together better:
* If a branch is mentioned in a request, issue or bug report, then please update the context to refer to the branch mentioned. If no branch is mentioned, then assume it is main.
* If there is no issue mentioned in a prompt or already in context, then propose to create an issue with an appropriate summary and title.   
* When making proposed commits or PRs you should mention the issue.
* If you start looking at a PR, then it should be updated to [WIP] if it is not already until your analysis is done; when done mark it as [REVIEW] if it is ready for review by your collaborators.
* In a session with a coding agent for a pull request, if a screenshot is taken, please show it in the session.
* At the end of every session in the PR please create a summary table of the files changed and the changes made to it and the reasons for the changes. This should be an ongoing table that is updated after every new comment/session in the PR.
* in a pull request conversation, keep an ongoing requirements.md file, summarize the initial requirements and any synthesize any further requirements that come in during the course of the conversation. when making a proposed commit, if there are any functional requirements that came out. they should be incorporated into the public/docs/
* when woeking on a PR, it is OK to be unsure of a correct approach and ask your collaborators for input. When you are unsure, please provide a clear prompt back to the collaborators so that they can provide you the needed information for you to continue. Your collaborators are happier when you ask for help.
* if a page is added then it SHALL confirm to the page requirements on public/docs/

## Branch-Specific PR Workflow

For issues that need to be fixed on branches other than `main`, use this naming convention:

### Branch Naming Pattern
- **For main branch fixes**: `copilot/fix-{issue_number}`
- **For other branch fixes**: `copilot/{target_branch}-fix-{issue_number}`

### Examples
- Fix issue #607 on main: `copilot/fix-607`
- Fix issue #607 on deploy branch: `copilot/deploy-fix-607`
- Fix issue #123 on feature/new-ui: `copilot/feature-new-ui-fix-123`

### Implementation Process
1. **Create feature branch** from the target branch (not main)
2. **Make minimal fixes** addressing only the specific issue
3. **Target the PR** against the intended branch
4. **Document the fix** in commit messages and PR description
5. **Reference the issue** in all commits and PR title

### Required Permissions
To create PRs against non-main branches, the copilot agent needs:
- **Contents**: Read and Write access to create branches
- **Pull Requests**: Read and Write access to create PRs against any branch
- **Actions**: Read access to view workflow status (if applicable)

## Project Overview

**SGeX Workbench** (WHO SMART Guidelines Exchange) is a browser-based, collaborative editor for WHO SMART Guidelines Digital Adaptation Kits (DAKs). It's a React-based single-page application that runs entirely client-side with no backend server required.

### Key Characteristics
- **Client-side only**: All processing happens in the browser
- **GitHub-centric**: Uses GitHub for authentication, storage, version control, and collaboration
- **WHO SMART Guidelines compliant**: Follows official WHO terminology, branding, and standards
- **Standards-based**: Uses JSON Forms, BPMN 2.0, DMN 1.3, FHIR R4
- **Static deployment**: Designed for GitHub Pages deployment

## Architecture Overview

```
User (Browser) ↔ SGeX Workbench (React SPA) ↔ GitHub (APIs & Storage)
                           ↓
              External Services (OCL, PCMT, IRIS)
```

### Core Technologies
- **React 19.1.0** with React Router for SPA navigation
- **GitHub Integration**: Octokit REST API for repository operations
- **BPMN Editing**: bpmn-js for business process diagrams
- **DMN Editing**: dmn-js for decision support logic
- **Forms**: JSON Forms for schema-driven UI rendering
- **Authentication**: GitHub Personal Access Tokens (PATs)
- **Deployment**: GitHub Pages (specifically smart-base repo)

## WHO SMART Guidelines Digital Adaptation Kits (DAKs)

### DAK Definition
A GitHub repository is considered a WHO SMART Guidelines DAK if it:
1. Has a `sushi-config.yaml` file in the root
2. The YAML contains a `dependencies` key with `smart.who.int.base` dependency

### The 8 Core DAK Components

#### 
1. **Business Processes** - BPMN workflows and business process definitions
2. **Decision Support Logic** - DMN decision tables and clinical decision support 
3. **Indicators & Measures** - Performance indicators and measurement definitions
4. **Data Entry Forms** - Structured data collection forms and questionnaires
5. **Terminology** - Code systems, value sets, and concept maps
6. **FHIR Profiles** - FHIR resource profiles and structure definitions
7. **FHIR Extensions** - Custom FHIR extensions and data elements
8. **Test Data & Examples** - Sample data and test cases for validation


DAK components have two implementation levels:
- **L2 (Level 2)**: Data model agnostic business logic representations
- **L3 (Level 3)**: FHIR R4-specific technical implementations


### Component Representations

| Component | L2 Representation | L3 Representation |
|-----------|-------------------|-------------------|
| Health interventions | IRIS Publications | FHIR Clinical Practice Guidelines |
| Generic personas | Actor definitions | FHIR Person/Practitioner profiles |
| User scenarios | Use case narratives | FHIR Scenario test bundles |
| Business processes | BPMN diagrams | FHIR ActivityDefinition/PlanDefinition |
| Core data elements | OCL concepts | FHIR StructureDefinition profiles |
| Decision support logic | DMN decision tables | FHIR PlanDefinition with logic |
| Program indicators | Logical indicator models | FHIR Measure resources |
| Requirements | Requirements specs | FHIR ImplementationGuide conformance |

## Development Workflow

### Getting Started
```bash
npm install          # Install dependencies
npm start           # Development server (http://localhost:3000/sgex)
npm test            # Run tests
npm run build       # Production build
```

### Authentication Flow
1. User provides GitHub Personal Access Token
2. App validates token and loads user profile
3. App scans for DAK repositories using sushi-config.yaml detection
4. User selects organization/profile and DAK repository
5. User navigates to DAK component editors

### Required GitHub Permissions
**Fine-grained tokens:**
- Contents: Read and Write
- Metadata: Read  
- Pull requests: Read and Write

**Classic tokens:**
- repo: Full control of private repositories
- read:org: Read org and team membership

## Key Services & Integrations

### External Services
- **OCL (Open Concept Lab)**: Terminology management at https://openconceptlab.org/
- **PCMT**: Product catalog at https://productcatalog.io/
- **IRIS**: WHO publications at https://iris.who.int/
- **GitHub**: Repository hosting, authentication, collaboration

### Core Services (src/services/)
- **githubService.js**: GitHub API integration and DAK detection
- **repositoryCacheService.js**: Repository data caching
- **Authentication services**: GitHub PAT management

## UI/UX Guidelines

### WHO SMART Guidelines Branding
- Use official WHO color palette and visual identity
- Include WHO iconography and professional medical appearance
- Follow consistent terminology from WHO guidelines
- Maintain accessibility standards (WCAG compliance via JSON Forms)

### User Experience Features
- **SGEX Mascot**: Fixed help button in bottom-right corner with contextual guidance
- **Responsive design**: Works across modern browsers
- **Internationalization**: Built with i18n support from the start
- **Progressive enhancement**: Graceful degradation for older browsers

## Standards Compliance

### Technical Standards
- **BPMN 2.0**: Business process diagrams (OMG specification)
- **DMN 1.3**: Decision support logic (OMG specification)  
- **FHIR R4**: Healthcare data exchange standard
- **JSON Forms**: Schema-driven form rendering
- **WHO Enterprise Architecture**: http://smart.who.int/ra

### URL Patterns and Routing
DAK component pages MUST follow consistent URL patterns for navigation and context preservation:

#### Standard URL Pattern
```
/{component}/{user}/{repo}/{branch?}
```

**Examples:**
- `/core-data-dictionary-viewer/litlfred/anc-dak/main`
- `/business-process-selection/who/immunization-dak/feature-branch`
- `/dashboard/demo-user/maternal-health-dak`

#### Implementation Guidelines:
- **URL Parameters**: Use `useParams()` to extract `user`, `repo`, and `branch` from URL
- **State Fallback**: Support `location.state` for backward compatibility
- **Navigation**: Always preserve URL context when navigating between components
- **GitHub Pages**: Generate artifact URLs using pattern `https://{user}.github.io/{repo}/branches/{branch}`

#### Required Route Patterns:
```javascript
// Add these route patterns to App.js for new DAK components:
<Route path="/{component}" element={<Component />} />
<Route path="/{component}/:user/:repo" element={<Component />} />
<Route path="/{component}/:user/:repo/:branch" element={<Component />} />
```

### Code Quality
- **ESLint**: Code style and error checking
- **Jest + React Testing Library**: Component and service testing
- **Accessibility**: WAI-ARIA compliance through JSON Forms

## File Structure Overview

```
sgex/
├── public/              # Static assets, WHO branding, mascot images
├── src/
│   ├── components/      # React components for DAK editing
│   ├── services/        # GitHub API, caching, external integrations
│   ├── schemas/         # JSON schemas for form rendering
│   ├── config/          # Application configuration
│   ├── tests/           # Test utilities and fixtures
│   └── utils/           # Helper functions
├── public/docs/         # Comprehensive project documentation
│   ├── requirements.md      # Detailed functional requirements
│   ├── solution-architecture.md  # Technical architecture
│   ├── dak-components.md    # DAK component specifications
│   ├── project-plan.md      # Project planning and milestones
│   └── workflows/           # BPMN and sequence diagrams
└── package.json         # Dependencies and build scripts
```

## Important Documentation

### Essential Reading
- **[public/docs/requirements.md](public/docs/requirements.md)**: Comprehensive functional and non-functional requirements
- **[public/docs/solution-architecture.md](public/docs/solution-architecture.md)**: Technical architecture and design decisions
- **[public/docs/dak-components.md](public/docs/dak-components.md)**: Detailed guide to the 8 DAK components
- **[public/docs/project-plan.md](public/docs/project-plan.md)**: Project milestones and planning
- **[README.md](README.md)**: Development setup and basic usage

### WHO SMART Guidelines Resources
- **WHO SMART Guidelines**: https://www.who.int/teams/digital-health-and-innovation/smart-guidelines
- **IG Starter Kit**: https://smart.who.int/ig-starter-kit/l2_dak_authoring.html
- **WHO Enterprise Architecture**: http://smart.who.int/ra
- **Example DAK Repository**: https://github.com/WorldHealthOrganization/smart-immunizations

## Testing Strategy

### Test Structure
- **Unit tests**: Services and utilities (src/services/*.test.js)
- **Component tests**: React component behavior (src/tests/*.test.js)
- **Integration tests**: GitHub API interactions and workflows
- **Accessibility tests**: WAI-ARIA compliance validation

### Test Environment
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode for development
npm test -- --coverage     # Generate coverage report
```

## Common Development Patterns

### GitHub API Usage
- Always use Octokit service wrapper (`src/services/githubService.js`)
- Implement proper error handling and rate limiting
- Cache repository data to minimize API calls
- Handle authentication state and token validation

### Component Development
- Use JSON Forms for any structured data entry
- Follow WHO branding guidelines for visual elements
- Implement proper loading states and error boundaries
- Maintain accessibility standards

#### DAK Component Page Standards:
- **Styling**: Use blue gradient background matching DAK Dashboard (`background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%)`)
- **Header**: Use `rgb(4, 11, 118)` header background with white text and proper WHO branding
- **URL Pattern**: Follow standard `/{component}/{user}/{repo}/{branch?}` routing
- **Help Topics**: Add contextual help topics to `helpContentService.js` for the page ID
- **Navigation**: Support both URL parameters and location state for context
- **Notification Badge**: Use `notificationBadge` prop on ContextualHelpMascot for important alerts

#### Help Topic Structure:
```javascript
// Add to helpContentService.js helpTopics object:
'{page-id}': [
  {
    id: '{topic-id}',
    title: 'Topic Title',
    badge: '/sgex/cat-paw-icon.svg',
    type: 'slideshow',
    content: [
      {
        title: 'Step Title',
        content: `<p>HTML content with help information</p>`
      }
      // Additional slides...
    ]
  }
]
```

### DAK Repository Operations
- Validate DAK compatibility using sushi-config.yaml detection
- Respect GitHub repository permissions
- Support both fine-grained and classic Personal Access Tokens
- Implement proper branch and commit workflows

## Troubleshooting Common Issues

### Authentication Issues
- Verify Personal Access Token has correct permissions
- Check GitHub API rate limits and implement backoff
- Handle network timeouts and connection errors gracefully

### Performance Optimization
- Use lazy loading for component editors
- Implement proper caching for repository data
- Optimize bundle sizes for GitHub Pages deployment
- Monitor GitHub API usage to avoid rate limiting

### Build and Deployment
- Ensure all assets use relative paths for GitHub Pages
- Test build locally before deployment
- Verify all external dependencies are properly bundled
- Check for any hardcoded localhost references

---

*This copilot instruction document is designed to help AI agents quickly understand and contribute to the SGeX Workbench project while maintaining code quality, WHO standards compliance, and collaborative development practices.*