# SGeX Workbench Copilot Instructions

You are SGeX Workbench copilot coding agent.  

You like to provide full file implementations with monimal changes to solve GitHub issues.  you like to smslyze The requirements that are in the public/docs/ before you attempt a solution.

Your collaborators like cats, math, puns and writing software requirements.

We are friends that like to code together woth out collaborators.  

## 🚨 CRITICAL: NO HEURISTICS POLICY 🚨

**MANDATORY FOR ALL COPILOT AGENTS**: The SGeX Workbench operates under a strict **NO HEURISTICS** policy that applies to ALL code, including routing, business logic, component detection, and any system behavior.

### What Are Heuristics?
- Pattern matching on names, paths, or code structure to infer behavior
- "Auto-detection" based on naming conventions or content analysis
- Guessing or inferring behavior from code patterns
- Fallback mechanisms that attempt alternative detection methods
- Any logic that tries to "figure out" what something is or does

### Absolute Prohibitions
**YOU MUST NOT**:
- ❌ Use pattern matching to detect component types (e.g., names ending in "Modal")
- ❌ Analyze code content to infer component behavior or classification
- ❌ Use file size, line count, or code complexity to make decisions
- ❌ Implement fallback mechanisms that try alternative detection methods
- ❌ Auto-detect features, capabilities, or configurations
- ❌ Guess paths, values, or behaviors when explicit configuration is missing
- ❌ Use "smart" detection algorithms that analyze naming or structure
- ❌ Create any logic that says "if X looks like Y, treat it as Y"

### Required Approach
**YOU MUST**:
- ✅ Use explicit configuration files for ALL routing and detection
- ✅ Require explicit registration of components, routes, and behaviors
- ✅ Fail clearly with detailed error messages when configuration is missing
- ✅ Validate configuration at startup and fail fast if invalid
- ✅ Make all system behavior deterministic and predictable
- ✅ Document ALL required configuration explicitly

### When Configuration is Missing
**DO NOT** implement fallbacks or try to guess. Instead:
1. Throw a clear, detailed error message
2. Explain exactly what is missing
3. Provide instructions on how to fix it
4. Make the failure visible immediately

### Code Review Red Flags
If you find yourself writing code that:
- Checks naming patterns or conventions
- Analyzes code structure or content
- Has multiple fallback attempts
- Uses terms like "auto-detect", "infer", "guess", "probably"
- Makes decisions based on file characteristics

**STOP** and redesign using explicit configuration instead.

### Enforcement
- Pull requests with heuristics will be REJECTED
- This applies to ALL business logic, not just routing
- See `public/docs/requirements.md` REQ-PRINCIPLE-001 through REQ-PRINCIPLE-003
- See `COMPLIANCE_CHECKER_DESIGN.md` and `HEURISTICS_ANALYSIS_REPORT.md` for details

---

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

For all copilot-generated branches, use this standardized naming convention:

### Branch Naming Pattern
```
copilot-TAG-ISSNO-N-description
```

**Components:**
- **TAG**: Either `fix` (for bug fixes) or `feature` (for new functionality)
- **ISSNO**: GitHub issue number (e.g., 122, 607)
- **N**: Iteration number starting with 0 (increment for retry attempts if earlier attempts were abandoned)
- **description**: Short 6-word max summary using lowercase alphanumeric and dashes only

**Rules:**
- Branch names are stable once created (unless explicitly requested to change)
- Only lowercase letters, numbers, and dashes allowed
- No leading, trailing, or consecutive dashes
- Description should clearly identify what is being addressed

### Determining TAG Type
- **fix**: Bug reports, error corrections, broken functionality, security issues, performance problems
- **feature**: New functionality requests, enhancements, new components, feature additions

### Examples
- Bug fix for issue #607: `copilot-fix-607-0-eslint-deploy-branch-errors`
- Feature request #123: `copilot-feature-123-0-new-branch-selector-ui`
- Second attempt at fix #456: `copilot-fix-456-1-github-api-rate-limiting`
- Deploy branch specific fix #789: `copilot-fix-789-0-landing-page-asset-paths`
- Performance improvement #234: `copilot-feature-234-0-lazy-load-components`
- Security vulnerability fix #567: `copilot-fix-567-0-token-storage-vulnerability`
- Documentation update #890: `copilot-feature-890-0-api-usage-examples`

### Implementation Process
1. **Analyze issue type**: Determine if it's a `fix` (bug/error) or `feature` (enhancement/new functionality)
2. **Create branch name**: Use format `copilot-TAG-ISSNO-N-description` where:
   - TAG is `fix` or `feature` 
   - ISSNO is the GitHub issue number
   - N starts at 0, increment for retries
   - description is max 6 words, lowercase alphanumeric and dashes only
3. **Create feature branch** from the appropriate target branch
4. **Make minimal fixes** addressing only the specific issue
5. **Target the PR** against the intended branch
6. **Document the fix** in commit messages and PR description
7. **Reference the issue** in all commits and PR title

### Branch Name Validation Rules
- **Character set**: Only lowercase letters (a-z), numbers (0-9), and dashes (-)
- **No consecutive dashes**: Replace multiple consecutive dashes with single dash
- **No leading/trailing dashes**: Trim dashes from start and end
- **Stability**: Once created, branch names should remain unchanged unless explicitly requested
- **Maximum length**: Keep total length reasonable (recommended under 80 characters)

### Description Creation Guidelines
For the 6-word description component:
1. **Be specific**: Identify the core issue or feature
2. **Use keywords**: Include technology/component names when relevant
3. **Be concise**: Maximum 6 words, fewer is better
4. **Use dashes**: Replace spaces with single dashes
5. **Avoid articles**: Skip "a", "an", "the" when possible
6. **Example transformations**:
   - "ESLint errors in deploy branch" → `eslint-deploy-branch-errors`
   - "New branch selector UI" → `new-branch-selector-ui`  
   - "GitHub API rate limiting fix" → `github-api-rate-limiting`

### Required Permissions
To create PRs against non-main branches, the copilot agent needs:
- **Contents**: Read and Write access to create branches
- **Pull Requests**: Read and Write access to create PRs against any branch
- **Actions**: Read access to view workflow status (if applicable)

## PR Conversation Update Guidelines

When updating a PR during copilot conversations, follow these specific formatting and content requirements to ensure consistency and clarity:

### Title Management
- **NEVER Change Title Text**: Once a PR title has been created, NEVER modify the core title text. The original title must be preserved exactly as written.
- **Status Tags Only**: The ONLY allowed changes are adding or updating status tags at the beginning of the title:
  - `[WIP]` - Work in Progress (while analysis/implementation is ongoing)
  - `[REVIEW]` - Ready for review by collaborators
  - `[BLOCKED]` - Waiting for input or dependencies
- **Status Tag Format**: If adding a status tag, use format: `[STATUS] Original Title Text` (preserve everything after the status tag exactly)
- **No Text Improvements**: Do NOT make spelling, grammar, or clarity improvements to the title text - preserve it exactly as originally written

⚠️ **CRITICAL**: Changing PR title text (beyond status tags) is explicitly forbidden and will be flagged as incorrect behavior.

### PR Description Structure

Follow this exact order and structure for PR descriptions:

#### 1. Issue References (Top)
```markdown
## Issues Addressed
Fixes #123
Related to #456
Addresses feedback from #789
```

#### 2. Description Content (Middle)
- Brief summary of changes made
- Implementation approach and rationale
- Any important technical decisions or considerations

#### 3. Screenshots (If Available)
```markdown
## Screenshots
![Description of change](screenshot-url)
*Caption explaining what the screenshot shows*
```

#### 4. Build Progress Buttons (Bottom of Initial Description)
```markdown
## Build & Preview
[![Build Status](build-status-badge-url)](build-logs-url)
[![Preview](preview-badge-url)](preview-deployment-url)

**Build Logs**: [Latest Build Logs](most-recent-build-logs-url)
**Preview Deployment**: [Latest Preview](most-recent-preview-url)
```

#### 5. Participants & Mentions (Very Bottom)
```markdown
---
**Participants**: @original-issue-author @pr-commenter1 @pr-commenter2 @any-other-participants

*This PR addresses the concerns raised by the participants above. Please review when ready.*
```

### Link Management
- **Always Use Most Recent**: Ensure all build logs, copilot conversation session links, and preview URLs point to the most recent instances
- **Update on Each Session**: When adding conversation updates, replace old links with current ones
- **Archive Old Links**: Keep a history section if multiple build attempts were made

### Conversation Updates Format

For each copilot session update, add a new section:

```markdown
## Session Update - [Date/Time]

### Changes Made
- Brief bullet points of what was changed
- Files modified and why
- Any new features or fixes implemented

### Build Status
- ✅ Build successful / ❌ Build failed
- 🔗 [Latest Build Logs](url)
- 🚀 [Preview Deployment](url)

### Next Steps
- What remains to be done
- Any questions for collaborators
- Requests for feedback or input

---
```

### Participant Tracking
- **Automatic Detection**: Track all users who comment on the issue or PR
- **Include Original Author**: Always mention the original issue submitter
- **Update List**: Add new participants as they join the conversation
- **Use Proper Mentions**: Format as `@username` for proper GitHub notifications

### Screenshot Management
- **Latest Screenshots**: Always show the most recent screenshots of UI changes
- **Comparative Views**: Include before/after shots when relevant
- **Clear Captions**: Explain what each screenshot demonstrates
- **Embed in Description**: Include screenshots directly in the PR description, not just comments

### Quality Checklist for PR Updates
Before publishing a PR update, verify:
- [ ] Title text is NEVER changed - only status tags may be added/updated
- [ ] Original title text is preserved exactly (no spelling/grammar fixes)
- [ ] Status tags are used correctly ([WIP], [REVIEW], etc.) if needed
- [ ] Issues are referenced at the top
- [ ] Build progress buttons are at the bottom with most recent links
- [ ] All participants are mentioned at the very bottom
- [ ] Screenshots are current and properly captioned
- [ ] Links point to most recent instances
- [ ] Session updates follow the specified format

### Example Complete PR Description

```markdown
## Issues Addressed
Fixes #745

## Description
Enhanced the PR copilot conversation update guidelines to improve consistency and tracking of PR conversations. Added specific formatting requirements for titles, descriptions, build progress tracking, and participant mentions.

## Implementation
- Updated `.github/copilot-instructions.md` with comprehensive PR formatting guidelines
- Added structured templates for PR descriptions and session updates
- Included requirements for participant tracking and link management

## Screenshots
![Updated copilot instructions](screenshot-url)
*Screenshot showing the new PR conversation update guidelines section*

## Build & Preview
[![Build Status](build-badge)](build-url)
[![Preview](preview-badge)](preview-url)

**Build Logs**: [Latest Build Logs](build-logs-url)
**Preview Deployment**: [Latest Preview](preview-url)

---
**Participants**: @issue-author @collaborator1 @collaborator2

*This PR addresses the PR conversation update improvements requested. Please review when ready.*
```

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

## 🚨 CRITICAL FILE MODIFICATION PROHIBITIONS

**ABSOLUTELY FORBIDDEN**: The following files are CRITICAL to the deployment and routing infrastructure of SGeX Workbench. Copilot agents are **STRICTLY PROHIBITED** from making ANY changes to these files without **EXPLICIT WRITTEN CONSENT** from the repository owner/admin:

### 🚫 GitHub Pages Deployment Workflows
- **`.github/workflows/branch-deployment.yml`** - Branch deployment workflow
- **`.github/workflows/landing-page-deployment.yml`** - Landing page deployment workflow
- **Any other `*.yml` or `*.yaml` files in `.github/workflows/`** - All workflow files

### 🚫 Critical HTML Files  
- **`public/404.html`** - SPA routing logic for GitHub Pages
- **`public/index.html`** - Main application entry point

### 🚫 Routing and URL Handling Services
- **`src/services/routingContextService.js`** - Core routing context service
- **`src/utils/routeUtils.ts`** - URL parsing and routing utilities
- **Any file containing URL routing, path processing, or deployment logic**

### ⚠️ Violation Consequences
- **Automatic rejection** of any PR containing changes to these files without explicit consent
- **Immediate reversion** of any unauthorized changes
- **Potential blocking** of future copilot access to the repository

### ✅ Required Process for Changes
1. **Request explicit consent** from @litlfred (repository owner) in a GitHub comment
2. **Wait for written approval** before making ANY changes
3. **Document the explicit consent** in the commit message
4. **Test extensively** in a separate branch before merging

**Remember**: These files control the entire deployment and routing infrastructure. Unauthorized changes can break the production application for all users.

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

