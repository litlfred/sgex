# System Architecture

Technical documentation about SGEX Workbench architecture, design patterns, and system components.

## 📐 Architecture Overview

SGEX Workbench is a browser-based, static web application built on modern web technologies with a focus on standards compliance, performance, and maintainability.

### Core Principles
- **Static-First**: No backend required - fully client-side
- **Standards-Based**: Follows WHO SMART Guidelines specifications
- **Modular**: Organized as a monorepo with independent packages
- **GitHub-Native**: Deep integration with GitHub APIs
- **Type-Safe**: Migrating to TypeScript for improved reliability

## 📚 Documentation Contents

### System Design
- **[Page Framework](page-framework.md)** - Page framework architecture and design patterns
- **[DAK Publication Architecture](dak-publication-architecture.md)** - Publication system design
- **System Overview** *(Coming Soon)* - High-level architecture and component relationships
- **Component Architecture** *(Coming Soon)* - Component design patterns

### Services
- **[MCP Services](mcp-services/)** - Model Context Protocol services
  - [FAQ Service](mcp-services/faq-service.md)
  - [FAQ Documentation](mcp-services/faq-documentation.md)

### Packages
- **DAK Core Package** *(See [packages/dak-core/](../../packages/dak-core/))* - Core business logic
- **Storage Services** *(See [packages/storage-services/](../../packages/storage-services/))* - Caching and persistence
- **VCS Services** *(See [packages/vcs-services/](../../packages/vcs-services/))* - GitHub integration
- **Utilities** *(See [packages/utils/](../../packages/utils/))* - Shared utilities

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SGEX Workbench UI                        │
│                   (React Application)                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│   DAK Core    │  │   Storage     │  │  VCS Services │
│   Package     │  │   Services    │  │   (GitHub)    │
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Utilities    │
                    │   Package     │
                    └───────────────┘
```

### Layer Responsibilities

#### Presentation Layer (React UI)
- User interface components
- State management
- Routing and navigation
- Form validation and rendering

#### Business Logic Layer (DAK Core)
- WHO SMART Guidelines compliance
- DAK validation and processing
- Component discovery and management
- Schema validation

#### Storage Layer
- Browser localStorage management
- Caching strategies
- Repository caching
- Bookmark management

#### Integration Layer (VCS Services)
- GitHub API integration
- Authentication management
- Repository operations
- Pull request management

## 🎯 Key Design Decisions

### 1. Monorepo Architecture
**Decision**: Use a monorepo with independent packages  
**Rationale**:
- Code reusability across services
- Consistent versioning
- Easier dependency management
- Simplified development workflow

### 2. Static Deployment
**Decision**: No backend server required  
**Rationale**:
- Simplified deployment
- Lower operational costs
- Better scalability
- GitHub Pages compatible

### 3. GitHub-Native Approach
**Decision**: Direct GitHub API integration  
**Rationale**:
- Native version control
- Collaboration features built-in
- No additional infrastructure
- Familiar workflow for developers

### 4. React + TypeScript
**Decision**: Modern React with TypeScript migration  
**Rationale**:
- Type safety and better IDE support
- Improved maintainability
- Better error detection
- Industry standard tooling

### 5. JSON Forms for UI
**Decision**: Use JSON Forms for rendering schemas  
**Rationale**:
- Standards-compliant form generation
- Accessibility built-in
- Consistent UI patterns
- Schema-driven development

## 📦 Package Organization

### Dependency Hierarchy
```
@sgex/dak-core (pure business logic, no dependencies)
├── @sgex/utils (lazy loading, factories)
├── @sgex/storage-services (caching, bookmarks)
├── @sgex/vcs-services (GitHub operations)
└── @sgex/web-services (React UI components)
```

### Package Roles

**@sgex/dak-core**
- Core DAK business logic
- WHO SMART Guidelines integration
- Validation services
- Component discovery

**@sgex/storage-services**
- Browser localStorage abstraction
- Caching mechanisms
- Repository caching
- Bookmark management

**@sgex/vcs-services**
- Git/GitHub operations
- Authentication handling
- Repository management
- Pull request operations

**@sgex/utils**
- Lazy loading patterns
- Factory patterns
- Performance optimization
- Shared utilities

## 🔐 Security Architecture

### Authentication
- GitHub Personal Access Token (PAT) based
- Secure token storage in browser
- No server-side authentication
- Token encryption at rest

### Data Storage
- Browser localStorage for caching
- No sensitive data persistence
- Secure token handling
- CORS-compliant requests

### Content Security
- Content Security Policy (CSP) headers
- XSS prevention
- Input sanitization
- Safe HTML rendering

## 🚀 Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Route-based code splitting
- **Caching**: Aggressive caching of repository data
- **Memoization**: React hooks for expensive computations

### Build Optimization
- Tree shaking for smaller bundles
- Minification and compression
- Asset optimization
- Source map generation for debugging

## 🔄 Data Flow

### Read Operations
```
User Action → React Component → Service Layer → GitHub API
              ↓
          Cache Check
              ↓
        Return Cached Data (if available)
```

### Write Operations
```
User Action → Form Validation → DAK Core Validation
              ↓
         GitHub API Call
              ↓
        Update Cache
              ↓
        Notify UI
```

## 📊 Component Interaction

### Component Communication
- Props for parent-child communication
- Context API for cross-cutting concerns
- Custom hooks for shared logic
- Event emitters for loose coupling

### State Management
- React Context for global state
- Local state for component-specific data
- Derived state through useMemo
- Side effects through useEffect

## 🔍 Integration Points

### External Systems
- **GitHub API**: Repository operations
- **WHO SMART Guidelines**: Schema validation
- **FHIR Specifications**: Resource validation
- **MCP Services**: FAQ and publication services

### Browser APIs
- **localStorage**: Data persistence
- **fetch**: HTTP requests
- **History API**: Routing
- **Web Workers**: Background processing (future)

## 📖 Further Reading

### Architecture Documents
- [Page Framework](page-framework.md) - Detailed page framework design
- [DAK Publication Architecture](dak-publication-architecture.md) - Publication system
- [MCP Services](mcp-services/) - Service architecture

### Related Documentation
- [Development Guide](../04-development/) - Development practices
- [Deployment Guide](../05-deployment/) - Deployment architecture
- [Security](../06-security/) - Security implementation

### Package Documentation
- [DAK Core README](../../packages/dak-core/README.md)
- [Storage Services README](../../packages/storage-services/README.md)
- [VCS Services README](../../packages/vcs-services/README.md)
- [Utils README](../../packages/utils/README.md)

## 🔗 Quick Links

- [Back to Documentation Index](../INDEX.md)
- [Development Guide](../04-development/)
- [Deployment Guide](../05-deployment/)
- [Main README](../../README.md)

---

**Last Updated**: December 2024  
**Architecture Version**: 2.0  
**Maintained By**: SGEX Workbench Engineering Team