# Multi-Branch GitHub Pages Deployment Requirements

## Summary

This document outlines the comprehensive requirements for implementing a safe, robust, and reproducible GitHub Actions workflow system with **compartmentalized deployment workflows**. The system separates branch-specific deployments from landing page deployment, providing multi-branch previews with a discoverable landing page featuring both branch and pull request selectors, all sharing a consistent React-based user interface.

## Deployment Architecture Overview

The deployment system consists of **two separate workflows**:

1. **Branch Preview Deployment** (`branch-deployment.yml`): Automatically deploys each branch's static build to its own subdirectory on the `gh-pages` branch (e.g., `gh-pages/main/`, `gh-pages/feature-x/`)
2. **Landing Page Deployment** (`landing-page-deploy.yml`): Manually triggered workflow that deploys a self-contained landing page to the root of `gh-pages`

This compartmentalization ensures:
- Branch deployments don't interfere with landing page updates
- Landing page has its own self-contained assets (no dependencies on branch-specific directories)
- Manual control over when the landing page is updated
- Ability to use any branch's build scripts for landing page deployment

## 1. Branch Safety & Validation Requirements

### 1.1 Branch Exclusion
- The workflow **MUST NEVER** run on the `gh-pages` branch
- Use `branches-ignore: ['gh-pages']` in workflow configuration
- Implement additional runtime checks to prevent accidental execution

### 1.2 Directory Validation
For every critical operation (clean, copy, stage, commit), the system must validate target directories:

```bash
# Required validation pattern
branch_root="$(readlink -f .)"
branch_dir="$(readlink -f "$branch_root/$safe_branch_name")"

# Safety checks
if [[ "$branch_dir" != "$branch_root"* ]]; then
  echo "ERROR: Target directory is outside repository root"
  exit 1
fi

if [[ ${#branch_dir} -le ${#branch_root} ]]; then
  echo "ERROR: Target directory path is not longer than repository root"
  exit 1
fi
```

### 1.3 Branch Name Sanitization
- Convert unsafe characters in branch names to safe directory names
- Replace forward slashes (`/`) with hyphens (`-`)
- Validate branch names contain only alphanumeric characters, dots, underscores, and hyphens
- Reject branch names with dangerous patterns

## 2. Deployment Logic Requirements

### 2.1 Branch Preview Deployment Workflow

The **Branch Preview Deployment** workflow (`branch-deployment.yml`) handles automatic deployment of individual branches:

#### Triggers
- Push to any branch (except `gh-pages`)
- Pull request events
- Excludes specific paths (e.g., documentation files)

#### Process
1. **Validate** branch directory safety
2. **Build** branch-specific React app with correct base path
3. **Clean** old branch deployment using git
4. **Copy** static build output to validated branch subdirectory
5. **Stage** only the specific branch subdirectory
6. **Commit** with descriptive message including branch name and timestamp
7. **Push** to gh-pages branch

### 2.2 Landing Page Deployment Workflow

The **Landing Page Deployment** workflow (`landing-page-deploy.yml`) handles manual deployment of the root landing page:

#### Triggers
- Manual trigger (`workflow_dispatch`)
- Can be triggered from any branch
- Uses build scripts from the triggering branch

#### Process
1. **Build** self-contained landing page using current branch's build scripts
2. **Preserve** all existing branch directories
3. **Deploy** landing page to gh-pages root
4. **Restore** all branch directories
5. **Commit** and push changes

### 2.3 Git-Managed Cleanup
- Use **only** git commands for destructive operations: `git rm -rf "$branch_dir"`
- **NEVER** use `rm -rf` on repository root or parent directories
- Validate directory paths before any cleanup operation

### 2.4 Self-Contained Landing Page Requirements
- Landing page must include all its own assets (CSS, JS, images, SVGs)
- No dependencies on `/main/` directory or other branch-specific paths
- Assets must be properly referenced with `/sgex/` base path for GitHub Pages
- Manifest and other configuration files must be self-contained

## 3. Multi-Branch Preview Requirements

### 3.1 Directory Structure
```
gh-pages/
├── index.html                    # Self-contained landing page
├── static/                       # Landing page assets (self-contained)
│   ├── css/
│   ├── js/
│   └── media/
├── *.png, *.svg, etc.           # Landing page images (self-contained)
├── main/                         # Main branch deployment  
│   ├── index.html
│   └── static/
├── feature-branch/               # Feature branch deployment
│   ├── index.html
│   └── static/
└── another-feature/              # Another branch deployment
    ├── index.html
    └── static/
```

### 3.2 Asset Isolation
- **Landing page assets**: Self-contained in root and `/static/` directory
- **Branch assets**: Contained within each branch's subdirectory
- **No cross-references**: Landing page does not reference branch-specific assets
- **Independent updates**: Landing page and branch deployments can be updated independently

### 3.3 Branch Isolation
- Each branch deployed to its own subdirectory
- No cross-contamination between branch deployments
- Automatic cleanup of orphaned files from previous builds

### 3.4 URL Structure
- Landing page: `https://litlfred.github.io/sgex/`
- Branch previews: `https://litlfred.github.io/sgex/{safe-branch-name}/`
- Consistent URL patterns for predictable access

## 4. Workflow Separation Requirements

### 4.1 Branch Preview Workflow (`branch-deployment.yml`)
- **Name**: "Branch Preview Deployment"
- **Triggers**: Automatic (push, PR events)
- **Scope**: Single branch deployment only
- **No landing page logic**: Removes all root landing page build/deploy code
- **Simplified**: Focus solely on branch-specific deployment

### 4.2 Landing Page Workflow (`landing-page-deploy.yml`)
- **Name**: "Deploy Landing Page"
- **Triggers**: Manual (`workflow_dispatch`)
- **Source flexibility**: Can be triggered from any branch
- **Self-contained**: Uses current branch's build scripts but produces independent landing page
- **Preservation**: Maintains all existing branch directories during deployment

### 4.3 Independence Requirements
- Workflows must operate independently
- Branch deployments don't trigger landing page updates
- Landing page updates don't affect branch deployments
- Each workflow has distinct responsibilities and scope

### 5.1 User Interface Consistency
- **MUST** use the same React framework as the main branch
- Share common styling, components, and user experience patterns
- Integrate with existing PageLayout and framework components
- Include ContextualHelpMascot for consistent help experience

### 5.2 Header and Branding
- Header shows only SGEX icon and subtitle: "a collaborative workbench for WHO SMART Guidelines"
- No additional navigation elements in header
- Consistent branding with main application

### 5.3 Branch Selector Interface
- Tabbed interface with "Branch Previews" and "Pull Request Previews" tabs
- Branch cards display:
  - Branch name
  - Commit hash (7 characters)
  - Last updated date
  - Direct link to preview
  - Preview URL for reference
- Grid layout with responsive design
- Empty state messages when no branches available

### 5.4 Pull Request Selector Interface
- Display last 5 PRs by default with pagination controls
- PR cards display:
  - PR number and title
  - State indicator (open/closed)
  - Branch name and author
  - Created and updated dates
  - Links to both preview and GitHub PR
- Search functionality by PR title or author
- Pagination with "Previous/Next" controls and page indicator
- Clear visual distinction from branch cards

### 5.5 Action Buttons
- **"How to Contribute"** button triggering modal slideshow
- **"Documentation"** link to `/sgex/main/public/docs/`
- **"Report a Bug"** link to GitHub issues with pre-filled template
- Prominent placement above preview tabs

### 5.6 Footer Requirements
- Source code link in bottom left: Links to `https://github.com/litlfred/sgex`
- Central informational text about preview system
- Link to main application branch

## 6. "How to Contribute" Modal Requirements

### 6.1 Modal Slideshow Structure
The modal must present a 5-slide slideshow explaining the collaborative process:

#### Slide 1: Welcome
- SGEX mascot in neutral pose
- Introduction to SGEX as experimental collaborative workbench
- Mission statement about making SMART Guidelines DAK development easier

#### Slide 2: Bug Reports and Feature Requests  
- SGEX mascot examining a bug closely (visual effect: sepia/hue-rotate filter)
- Explanation of how users can contribute through bug reports
- Reference to mascot help button for quick issue reporting

#### Slide 3: AI Coding Agents
- Robotic/cyborg version of SGEX mascot (visual effect: blue/tech filter)
- Explanation of AI-powered development process
- Matrix-style code visualization elements

#### Slide 4: Community Collaboration
- Three SGEX mascots sharing a common thought bubble with magic lamp/genie bottle
- Explanation of real-time collaborative evolution
- Emphasis on community-driven improvement

#### Slide 5: Call to Action
- Celebrating SGEX mascot (bouncing animation)
- Action buttons for:
  - Report a Bug (GitHub issues)
  - Request a Feature (GitHub feature request template)
  - Read Documentation (main branch docs)

### 6.2 Modal Technical Requirements
- Use existing HelpModal component for consistency
- Implement proper slideshow navigation (previous/next)
- Support keyboard navigation (arrow keys, escape)
- Responsive design for mobile devices
- Proper focus management for accessibility

## 7. GitHub API Integration Requirements

### 7.1 Branch Data Fetching
- Use GitHub REST API: `GET /repos/litlfred/sgex/branches`
- Filter out `gh-pages` branch from results
- Handle API rate limiting gracefully
- Provide fallback content when API unavailable

### 7.2 Pull Request Data Fetching
- Use GitHub REST API: `GET /repos/litlfred/sgex/pulls?state=all&sort=updated&per_page=100`
- Support both open and closed PRs
- Sort by most recently updated
- Cache results appropriately to avoid excessive API calls

### 7.3 Error Handling
- Graceful degradation when GitHub API unavailable
- Clear error messages for users
- Retry mechanisms for transient failures
- Loading states during API calls

## 8. Security and Safety Requirements

### 8.1 Path Traversal Prevention
- All directory operations must use `readlink -f` for path resolution
- Validate all paths are within repository boundaries
- Reject any paths containing `..` or other traversal attempts
- Log security violations for monitoring

### 8.2 Branch Name Validation
- Sanitize branch names before filesystem operations
- Prevent injection attacks through branch names
- Validate against allowlist of safe characters
- Reject branches with empty or invalid names

### 8.3 Git Operations Security
- Use git commands exclusively for repository operations
- Never execute shell commands with user-controlled input
- Validate all git operations complete successfully
- Implement rollback mechanisms for failed deployments

## 9. Performance Requirements

### 9.1 Build Performance
- Branch builds must complete within 10 minutes
- Parallel processing where possible
- Efficient caching of dependencies
- Incremental builds when feasible

### 9.2 Landing Page Performance
- Initial load time under 3 seconds
- Lazy loading of preview thumbnails if implemented
- Efficient API data caching
- Progressive enhancement for JavaScript features

### 9.3 Storage Efficiency
- Clean up old deployments automatically
- Compress assets where possible
- Implement retention policy for branch previews
- Monitor repository size growth

## 10. Accessibility Requirements

### 10.1 WCAG Compliance
- Landing page must meet WCAG 2.1 AA standards
- Proper heading hierarchy and semantic markup
- Keyboard navigation support throughout
- Screen reader compatible content

### 10.2 Responsive Design
- Mobile-first responsive design approach
- Support for viewport widths from 320px to 2560px
- Touch-friendly interface elements
- Readable text at all zoom levels

## 11. Documentation Requirements

### 11.1 User Documentation
- Clear instructions for accessing branch previews
- Explanation of PR preview system
- Troubleshooting guide for common issues
- Screenshots of key interface elements

### 11.2 Developer Documentation
- Workflow configuration documentation
- API integration examples
- Security considerations and best practices
- Contribution guidelines for the deployment system

### 11.3 README Integration
- Update main README with mission statement
- Include "how to contribute" summary
- Link to comprehensive documentation
- Maintain consistency with landing page messaging

## 12. Monitoring and Alerting Requirements

### 12.1 Deployment Monitoring
- Track successful/failed deployments
- Monitor build times and resource usage
- Alert on deployment failures
- Log all security-related events

### 12.2 Landing Page Monitoring
- Monitor GitHub API usage and rate limits
- Track page load performance
- Monitor for broken preview links
- Alert on prolonged API outages

## Implementation Priority

1. **Phase 1**: Workflow compartmentalization ✅
   - [x] Create separate landing page deployment workflow
   - [x] Simplify branch preview deployment workflow
   - [x] Update build scripts for self-contained landing page
   
2. **Phase 2**: Enhanced landing page with branch/PR selectors ✅
3. **Phase 3**: "How to Contribute" modal implementation ✅
4. **Phase 4**: Requirements documentation update ✅
5. **Phase 5**: README mission statement update
6. **Phase 6**: Security audit and testing
7. **Phase 7**: Performance optimization and monitoring

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-XX  
**Next Review**: 2024-02-XX