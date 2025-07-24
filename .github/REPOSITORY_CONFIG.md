# Repository Configuration

This document outlines the recommended GitHub repository settings for optimal management of the SGEX Workbench project.

## Repository Settings

### General

- **Repository name**: sgex
- **Description**: SGEX Workbench - Browser-based collaborative editor for WHO SMART Guidelines Digital Adaptation Kits (DAKs)
- **Website**: https://litlfred.github.io/sgex (GitHub Pages)
- **Topics/Tags**: 
  - who-smart-guidelines
  - digital-adaptation-kits
  - healthcare
  - collaborative-editing
  - github-pages
  - json-forms
  - bpmn
  - dmn

### Features

- **Wikis**: Disabled (use docs/ directory instead)
- **Issues**: Enabled
- **Sponsorships**: Disabled
- **Preserve this repository**: Disabled
- **Projects**: Enabled (for project management)
- **Discussions**: Enabled (for community discussions)

### Pull Requests

- **Allow merge commits**: Enabled
- **Allow squash merging**: Enabled
- **Allow rebase merging**: Enabled
- **Always suggest updating pull request branches**: Enabled
- **Allow auto-merge**: Disabled (require manual review)
- **Automatically delete head branches**: Enabled

### Branch Protection Rules

### Main Branch (`main`)

Recommended protection rules for the main branch:

- **Require a pull request before merging**: Enabled
  - **Require approvals**: 1 required reviewer
  - **Dismiss stale reviews**: Enabled
  - **Require review from code owners**: Enabled (when CODEOWNERS file is added)
- **Require status checks to pass**: Enabled
  - **Require branches to be up to date**: Enabled
  - **Status checks**: pages-build-deployment (when available)
- **Require conversation resolution**: Enabled
- **Require signed commits**: Recommended but optional
- **Require linear history**: Disabled (allow merge commits)
- **Include administrators**: Enabled (admins follow same rules)
- **Allow force pushes**: Disabled
- **Allow deletions**: Disabled

## Pages Configuration

### Settings

- **Source**: Deploy from a branch
- **Branch**: `gh-pages` (created by workflow)
- **Folder**: `/` (root)
- **Custom domain**: Optional (can be configured later)
- **Enforce HTTPS**: Enabled

### Build and Deployment

- **GitHub Actions**: Uses custom workflow (`.github/workflows/pages.yml`)
- **Build source**: GitHub Actions workflow
- **Deployment**: Automatic on push to main branch

## Security

### Security Advisories

- **Enable**: Enabled
- **Allow security advisories**: Enabled

### Dependabot

- **Configuration**: Defined in `.github/dependabot.yml`
- **Security updates**: Enabled
- **Version updates**: Enabled for GitHub Actions and npm

### Security Analysis

- **Dependency review**: Enabled (GitHub Advanced Security feature)
- **Secret scanning**: Enabled if available
- **Code scanning**: Can be enabled for future code implementation

## Collaborators and Teams

### Repository Roles

- **Maintainer**: @litlfred (admin access)
- **Contributors**: Community members with write access (as needed)
- **Triagers**: Community members with triage access for issue management

### CODEOWNERS (Future)

Create `.github/CODEOWNERS` file when implementation begins:

```
# Global owners
* @litlfred

# Documentation
/docs/ @litlfred
*.md @litlfred

# GitHub configuration
/.github/ @litlfred

# Future code areas
/src/ @litlfred
```

## Issue and PR Management

### Labels

Recommended labels for issue management:

**Type Labels:**
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `question` - Further information is requested

**Priority Labels:**
- `priority: low` - Low priority
- `priority: medium` - Medium priority  
- `priority: high` - High priority
- `priority: critical` - Critical priority

**Component Labels:**
- `component: auth` - Authentication related
- `component: repo` - Repository management
- `component: editors` - File editors (BPMN/DMN/Markdown)
- `component: github` - GitHub integration
- `component: ui` - User interface and forms
- `component: docs` - Documentation

**Status Labels:**
- `status: triage` - Needs triage
- `status: blocked` - Blocked by external dependency
- `status: wontfix` - Won't be fixed
- `status: duplicate` - Duplicate issue

### Milestones

Create milestones for project phases:

- **Phase 1: Documentation** (Current)
- **Phase 2: Architecture Refinement**
- **Phase 3: Implementation Planning**
- **Phase 4: MVP Development** (Future)

## Automation

### GitHub Actions

Current workflows:
- **GitHub Pages Deployment** (`.github/workflows/pages.yml`)

Future workflows (for implementation phase):
- **CI/CD Pipeline** - Build, test, and deploy
- **Code Quality** - Linting, formatting, security checks
- **Dependency Updates** - Automated dependency management

### Apps and Integrations

Recommended GitHub Apps:
- **Dependabot** - Automated dependency updates
- **GitHub Pages** - Static site deployment

Optional apps for future development:
- **CodeQL** - Security code analysis
- **Lighthouse CI** - Performance monitoring

## Monitoring and Analytics

### Insights

Enable and monitor:
- **Traffic** - Page views and unique visitors
- **Clones** - Repository clones
- **Forks** - Repository forks
- **Issues and PRs** - Activity metrics

### Community Health

Ensure all community health files are present:
- `README.md` ✅
- `CONTRIBUTING.md` ✅
- `LICENSE` ✅
- `CODE_OF_CONDUCT.md` (to be added)
- Issue templates ✅
- Pull request template ✅

---

*This configuration should be reviewed and updated as the project evolves and requirements change.*