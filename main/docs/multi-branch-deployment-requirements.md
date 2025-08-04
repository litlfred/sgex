# Multi-Branch GitHub Pages Deployment Requirements

## Summary

This document outlines the comprehensive requirements for implementing a safe, robust, and reproducible GitHub Actions workflow that deploys each branch's static build to its own subdirectory on the `gh-pages` branch (e.g., `gh-pages/sgex/feature-x/`). The system provides multi-branch previews with a discoverable landing page featuring both branch and pull request selectors, all sharing a consistent React-based user interface.

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

### 2.1 Git-Managed Cleanup
- Use **only** git commands for destructive operations: `git rm -rf "$branch_dir"`
- **NEVER** use `rm -rf` on repository root or parent directories
- Validate directory paths before any cleanup operation

### 2.2 Atomic Deployment Process
1. **Validate** branch directory safety
2. **Clean** old deployment using git
3. **Copy** static build output to validated branch subdirectory
4. **Stage** only the specific branch subdirectory
5. **Commit** with descriptive message including branch name and timestamp
6. **Push** to gh-pages branch

### 2.3 Build Output Requirements
- Static build output must be generated in `build/` directory
- Each branch deployment must contain valid `index.html` at root
- Preserve all assets (CSS, JS, images) in deployment directory

## 3. Multi-Branch Preview Requirements

### 3.1 Directory Structure
```
gh-pages/
├── index.html                    # Landing page
├── assets/                       # Landing page assets
├── sgex/
│   ├── main/                     # Main branch deployment
│   │   └── index.html
│   ├── feature-branch/           # Feature branch deployment
│   │   └── index.html
│   └── another-feature/          # Another branch deployment
│       └── index.html
```

### 3.2 Branch Isolation
- Each branch deployed to its own subdirectory under `sgex/`
- No cross-contamination between branch deployments
- Automatic cleanup of orphaned files from previous builds

### 3.3 URL Structure
- Landing page: `https://litlfred.github.io/sgex/`
- Branch previews: `https://litlfred.github.io/sgex/sgex/{safe-branch-name}/`
- Consistent URL patterns for predictable access

## 4. Landing Page Requirements

### 4.1 User Interface Consistency
- **MUST** use the same React framework as the main branch
- Share common styling, components, and user experience patterns
- Integrate with existing PageLayout and framework components
- Include ContextualHelpMascot for consistent help experience

### 4.2 Header and Branding
- Header shows only SGEX icon and subtitle: "a collaborative workbench for WHO SMART Guidelines"
- No additional navigation elements in header
- Consistent branding with main application

### 4.3 Branch Selector Interface
- Tabbed interface with "Branch Previews" and "Pull Request Previews" tabs
- Branch cards display:
  - Branch name
  - Commit hash (7 characters)
  - Last updated date
  - Direct link to preview
  - Preview URL for reference
- Grid layout with responsive design
- Empty state messages when no branches available

### 4.4 Pull Request Selector Interface
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

### 4.5 Action Buttons
- **"How to Contribute"** button triggering modal slideshow
- **"Documentation"** link to `/sgex/main/public/docs/`
- **"Report a Bug"** link to GitHub issues with pre-filled template
- Prominent placement above preview tabs

### 4.6 Footer Requirements
- Source code link in bottom left: Links to `https://github.com/litlfred/sgex`
- Central informational text about preview system
- Link to main application branch

## 5. "How to Contribute" Modal Requirements

### 5.1 Modal Slideshow Structure
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

### 5.2 Modal Technical Requirements
- Use existing HelpModal component for consistency
- Implement proper slideshow navigation (previous/next)
- Support keyboard navigation (arrow keys, escape)
- Responsive design for mobile devices
- Proper focus management for accessibility

## 6. GitHub API Integration Requirements

### 6.1 Branch Data Fetching
- Use GitHub REST API: `GET /repos/litlfred/sgex/branches`
- Filter out `gh-pages` branch from results
- Handle API rate limiting gracefully
- Provide fallback content when API unavailable

### 6.2 Pull Request Data Fetching
- Use GitHub REST API: `GET /repos/litlfred/sgex/pulls?state=all&sort=updated&per_page=100`
- Support both open and closed PRs
- Sort by most recently updated
- Cache results appropriately to avoid excessive API calls

### 6.3 Error Handling
- Graceful degradation when GitHub API unavailable
- Clear error messages for users
- Retry mechanisms for transient failures
- Loading states during API calls

## 7. Security and Safety Requirements

### 7.1 Path Traversal Prevention
- All directory operations must use `readlink -f` for path resolution
- Validate all paths are within repository boundaries
- Reject any paths containing `..` or other traversal attempts
- Log security violations for monitoring

### 7.2 Branch Name Validation
- Sanitize branch names before filesystem operations
- Prevent injection attacks through branch names
- Validate against allowlist of safe characters
- Reject branches with empty or invalid names

### 7.3 Git Operations Security
- Use git commands exclusively for repository operations
- Never execute shell commands with user-controlled input
- Validate all git operations complete successfully
- Implement rollback mechanisms for failed deployments

## 8. Performance Requirements

### 8.1 Build Performance
- Branch builds must complete within 10 minutes
- Parallel processing where possible
- Efficient caching of dependencies
- Incremental builds when feasible

### 8.2 Landing Page Performance
- Initial load time under 3 seconds
- Lazy loading of preview thumbnails if implemented
- Efficient API data caching
- Progressive enhancement for JavaScript features

### 8.3 Storage Efficiency
- Clean up old deployments automatically
- Compress assets where possible
- Implement retention policy for branch previews
- Monitor repository size growth

## 9. Accessibility Requirements

### 9.1 WCAG Compliance
- Landing page must meet WCAG 2.1 AA standards
- Proper heading hierarchy and semantic markup
- Keyboard navigation support throughout
- Screen reader compatible content

### 9.2 Responsive Design
- Mobile-first responsive design approach
- Support for viewport widths from 320px to 2560px
- Touch-friendly interface elements
- Readable text at all zoom levels

## 10. Documentation Requirements

### 10.1 User Documentation
- Clear instructions for accessing branch previews
- Explanation of PR preview system
- Troubleshooting guide for common issues
- Screenshots of key interface elements

### 10.2 Developer Documentation
- Workflow configuration documentation
- API integration examples
- Security considerations and best practices
- Contribution guidelines for the deployment system

### 10.3 README Integration
- Update main README with mission statement
- Include "how to contribute" summary
- Link to comprehensive documentation
- Maintain consistency with landing page messaging

## 11. Monitoring and Alerting Requirements

### 11.1 Deployment Monitoring
- Track successful/failed deployments
- Monitor build times and resource usage
- Alert on deployment failures
- Log all security-related events

### 11.2 Landing Page Monitoring
- Monitor GitHub API usage and rate limits
- Track page load performance
- Monitor for broken preview links
- Alert on prolonged API outages

## Implementation Priority

1. **Phase 1**: Enhanced landing page with branch/PR selectors ✅
2. **Phase 2**: "How to Contribute" modal implementation ✅
3. **Phase 3**: Requirements documentation creation ✅
4. **Phase 4**: README mission statement update
5. **Phase 5**: Security audit and testing
6. **Phase 6**: Performance optimization and monitoring

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-XX  
**Next Review**: 2024-02-XX