# SGEX Workbench - Documentation Index

**Last Updated**: December 12, 2024  
**Total Documents**: 125+  
**Organization**: 8 Main Categories

---

## 🚀 Quick Start

**New to SGEX?** Start here:
- [Getting Started](01-getting-started/README.md) - Installation, setup, and first steps
- [User Guides](02-user-guides/README.md) - How-to guides for using SGEX features
- [Troubleshooting](01-getting-started/troubleshooting.md) - Common issues and solutions

**For Developers:**
- [Development Setup](04-development/README.md) - Development environment and standards
- [Architecture Overview](03-architecture/README.md) - System design and components
- [Deployment Guide](05-deployment/README.md) - Deployment procedures and CI/CD

---

## 📚 Documentation Structure

### 👤 **User Documentation**

#### [01-getting-started/](01-getting-started/)
First-stop documentation for new users
- Installation and setup
- Authentication configuration  
- Quick start guide
- Troubleshooting basics

#### [02-user-guides/](02-user-guides/)
Comprehensive guides for using SGEX features
- **[DAK Usage Guide](02-user-guides/dak-usage-guide.md)** - Working with Digital Adaptation Kits
- **[Build Logging](02-user-guides/build-logging.md)** - Understanding build logs
- **[Image Optimization](02-user-guides/image-optimization.md)** - Optimizing images
- **[SAML Workflow](02-user-guides/saml-workflow.md)** - SAML authentication
- **[Workflow Automation](02-user-guides/workflow-automation.md)** - Automating workflows

---

### 🏗️ **System Documentation**

#### [03-architecture/](03-architecture/)
System design and architecture documentation
- **System Overview** - High-level architecture
- **[Page Framework](03-architecture/page-framework.md)** - Page framework design
- **[DAK Publication Architecture](03-architecture/dak-publication-architecture.md)** - Publication system
- **MCP Services** - Model Context Protocol services
  - [FAQ Service](03-architecture/mcp-services/faq-service.md)
  - [FAQ Documentation](03-architecture/mcp-services/faq-documentation.md)

#### [04-development/](04-development/)
Developer guides and coding standards
- **[TypeScript Migration](04-development/typescript-migration.md)** - TypeScript adoption guide
- **[Compliance Framework](04-development/compliance-framework.md)** - Compliance checking
- **[Framework Hooks](04-development/framework-hooks.md)** - Using framework hooks
- **[Accessibility](04-development/accessibility.md)** - Accessibility standards

#### [05-deployment/](05-deployment/)
Deployment procedures and CI/CD
- **[Overview](05-deployment/overview.md)** - Deployment strategy
- **[GitHub Pages](05-deployment/github-pages.md)** - GitHub Pages deployment
- **[Workflows Analysis](05-deployment/workflows-analysis.md)** - CI/CD workflows

#### [06-security/](06-security/)
Security practices and implementation
- **[Security Checks](06-security/security-checks.md)** - Automated security scanning
- **[CodeQL Analysis](06-security/codeql-analysis.md)** - Static analysis
- **[Security Examples](06-security/security-check-examples.md)** - Security examples
- **[Security Implementation](06-security/security-check-implementation.md)** - Implementation guide

#### [07-features/](07-features/)
Feature-specific technical documentation
- **[Future Enhancements](07-features/future-enhancements.md)** - Planned features
- **[Persona Viewer](07-features/persona-viewer-enhancements.md)** - Persona viewer features

---

### 📜 **Development History**

#### [08-development-history/](08-development-history/)
Historical record of development decisions and implementations

##### **Ticket Fixes** (20+ fixes)
- [404 Routing Fixes](08-development-history/ticket-fixes/404-routing/) (4 fixes)
- [Authentication Fixes](08-development-history/ticket-fixes/authentication/) (5 fixes)
- [Deployment Fixes](08-development-history/ticket-fixes/deployment/) (6 fixes)
- [UI Fixes](08-development-history/ticket-fixes/ui-fixes/) (2 fixes)
- [Workflow Fixes](08-development-history/ticket-fixes/workflow-fixes/) (4 fixes)
- [Other Fixes](08-development-history/ticket-fixes/other-fixes/) (3 fixes)

##### **Implementation Summaries** (30+ docs)
- [Feature Implementations](08-development-history/implementation-summaries/feature-implementations/) (7 docs)
- [TypeScript Refactoring](08-development-history/implementation-summaries/migration-summaries/typescript-refactoring/) (4 docs)
- [MCP Migration](08-development-history/implementation-summaries/migration-summaries/mcp-migration/) (3 docs)
- [Editor Migration](08-development-history/implementation-summaries/migration-summaries/editor-migration/) (4 docs)
- [Service Refactoring](08-development-history/implementation-summaries/migration-summaries/service-refactoring/) (4 docs)
- [CSS Phases](08-development-history/implementation-summaries/css-phases/) (5 docs)

##### **Technical Analysis** (19 docs)
- [Architecture Analysis](08-development-history/technical-analysis/architecture-analysis/) (1 doc)
- [Routing Analysis](08-development-history/technical-analysis/routing-analysis/) (10 docs)
- [Security Analysis](08-development-history/technical-analysis/security-analysis/) (2 docs)
- [Compliance Analysis](08-development-history/technical-analysis/compliance-analysis/) (3 docs)
- [Other Analysis](08-development-history/technical-analysis/other-analysis/) (5 docs)

##### **Test Documentation** (8 docs)
- [Test Documentation](08-development-history/test-documentation/) (3 docs)
- [PR Feedback Tests](08-development-history/test-documentation/pr-feedback-tests/) (5 docs)

##### **Other History**
- [Deployment Optimization](08-development-history/deployment-optimization/) (4 docs)
- [Miscellaneous](08-development-history/miscellaneous/) (13 docs)

---

## 🔍 Documentation by Topic

### Authentication
- **User Guide**: [Getting Started - Authentication](01-getting-started/authentication.md)
- **Security**: [Token Storage](06-security/token-storage.md)
- **History**: [Authentication Fixes](08-development-history/ticket-fixes/authentication/)
  - PAT Token Debugging
  - PAT Token Investigation
  - Token Loss Analysis
  - Token Flow Analysis

### Deployment
- **System Docs**: [Deployment Guide](05-deployment/README.md)
  - [GitHub Pages Deployment](05-deployment/github-pages.md)
  - [Workflows Analysis](05-deployment/workflows-analysis.md)
- **History**: [Deployment Fixes](08-development-history/ticket-fixes/deployment/)
  - Branch Deployment Fix
  - Deploy Branch Fix
  - Preview Builds Fix
  - Deployment Fix 625
  - Deployment Fix 691

### Routing
- **Architecture**: [Routing Architecture](03-architecture/routing-architecture.md)
- **History**: [Routing Analysis](08-development-history/technical-analysis/routing-analysis/)
  - Routing Analysis
  - Routing Consolidation Proposal
  - Routing Documentation Audit
  - Routing Plan Finalized
  - Routing Solution Proposal
  - Routing Implementation Guide

### TypeScript Migration
- **Development**: [TypeScript Migration Guide](04-development/typescript-migration.md)
- **History**: [TypeScript Refactoring](08-development-history/implementation-summaries/migration-summaries/typescript-refactoring/)
  - Phase 6: Editor Integration
  - Phase 7: Migration Status
  - DAK TypeScript Refactoring
  - FAQ TypeScript Integration

### Security
- **System Docs**: [Security](06-security/)
  - Security Checks
  - CodeQL Analysis
  - Security Examples
  - Security Implementation
- **History**: [Security Analysis](08-development-history/technical-analysis/security-analysis/)
  - LocalStorage Security Analysis
  - SessionStorage Cross-Tab Solution

### MCP Services
- **Architecture**: [MCP Services](03-architecture/mcp-services/)
  - FAQ Service
  - FAQ Documentation
- **History**: [MCP Migration](08-development-history/implementation-summaries/migration-summaries/mcp-migration/)
  - MCP Migration Implementation
  - MCP Improvements Summary
  - MCP Upstream Improvements

### WYSIWYG Editor
- **History**: [Editor Migration](08-development-history/implementation-summaries/migration-summaries/editor-migration/)
  - TinyMCE Migration Plan
  - TinyMCE Migration Implementation
  - WYSIWYG Editor Comparison
  - WYSIWYG Implementation Guide

### UI & Design
- **User Guide**: [Image Optimization](02-user-guides/image-optimization.md)
- **History**: [UI Fixes](08-development-history/ticket-fixes/ui-fixes/)
  - BPMN Display Fix
  - Dark Mode Image Audit

### Workflows & CI/CD
- **User Guide**: [Workflow Automation](02-user-guides/workflow-automation.md)
- **Deployment**: [Workflows Analysis](05-deployment/workflows-analysis.md)
- **History**: [Workflow Fixes](08-development-history/ticket-fixes/workflow-fixes/)
  - PR Title Preservation Fix
  - Workflow Comment Marker Fix
  - Workflow Comment Fix
  - Workflow Concurrency Fix

### DAK (Digital Adaptation Kits)
- **User Guide**: [DAK Usage Guide](02-user-guides/dak-usage-guide.md)
- **Architecture**: [DAK Publication Architecture](03-architecture/dak-publication-architecture.md)
- **History**: [DAK Implementation Status](08-development-history/implementation-summaries/feature-implementations/dak-implementation-status.md)

### Compliance & Quality
- **Development**: [Compliance Framework](04-development/compliance-framework.md)
- **History**: [Compliance Analysis](08-development-history/technical-analysis/compliance-analysis/)
  - Compliance Analysis
  - Compliance Checker Design
  - Heuristics Analysis Report

### Testing
- **History**: [Test Documentation](08-development-history/test-documentation/)
  - Phase 7 Testing
  - Test Failure Notification Example
  - Debug FAQ Test
  - PR Feedback Tests (5 docs)

---

## 📊 Documentation Statistics

### By Category
- **User Documentation**: 15 documents
  - Getting Started: 4 docs
  - User Guides: 11 docs
- **System Documentation**: 42 documents
  - Architecture: 6 docs
  - Development: 4 docs
  - Deployment: 3 docs
  - Security: 7 docs
  - Features: 2 docs
- **Development History**: 68 documents
  - Ticket Fixes: 24 docs
  - Implementation Summaries: 27 docs
  - Technical Analysis: 21 docs
  - Test Documentation: 8 docs
  - Deployment Optimization: 4 docs
  - Miscellaneous: 13 docs

### By Type
- **Guides**: 15 documents
- **Architecture**: 6 documents
- **Bug Fixes**: 24 documents
- **Implementation**: 27 documents
- **Analysis**: 21 documents
- **Security**: 7 documents
- **Testing**: 8 documents
- **Miscellaneous**: 17 documents

---

## 🔗 External Documentation

### Public Facing
- **[public/docs/](../public/docs/)** - User-facing documentation
  - Project Plan
  - Requirements
  - Solution Architecture
  - DAK Components Guide

### Package Documentation
- **[packages/dak-core/](../packages/dak-core/)** - DAK Core package
- **[packages/storage-services/](../packages/storage-services/)** - Storage services
- **[packages/vcs-services/](../packages/vcs-services/)** - VCS services
- **[packages/utils/](../packages/utils/)** - Utility packages

### Service Documentation
- **[services/dak-faq-mcp/](../services/dak-faq-mcp/)** - DAK FAQ MCP service
- **[services/dak-publication-api/](../services/dak-publication-api/)** - Publication API

---

## 📝 Documentation Standards

### File Naming
- Use lowercase with hyphens: `feature-name.md`
- Be descriptive: `routing-consolidation-proposal.md` not `routing.md`
- Include context: `pat-token-debugging.md` not `debugging.md`

### Structure
- Start with purpose/overview
- Include table of contents for long docs
- Use clear headings and sections
- Include examples and code snippets
- End with next steps or references

### Categories
- **User Documentation**: How-to guides for end users
- **System Documentation**: Technical architecture and design
- **Development History**: Historical context and decisions

---

## 🆘 Need Help?

### Finding Documentation
1. **Search by topic** using the topic index above
2. **Browse by category** using the structure section
3. **Check development history** for context on specific features

### Contributing
See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on:
- Adding new documentation
- Updating existing documentation
- Documentation review process
- Style guide and standards

### Questions
- **Issues**: [GitHub Issues](https://github.com/litlfred/sgex/issues)
- **Discussions**: [GitHub Discussions](https://github.com/litlfred/sgex/discussions)

---

## 📅 Maintenance

### Review Schedule
- **Monthly**: Review and update getting started guides
- **Quarterly**: Review architecture and system documentation
- **As Needed**: Update development history when completing features

### Ownership
- **User Documentation**: Product team
- **System Documentation**: Engineering team
- **Development History**: Automated (via development process)

---
