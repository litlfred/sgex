# DAK Publication System - Software Solution Architecture

## Executive Summary

This document provides a comprehensive analysis of software architecture options for the WHO SMART Guidelines DAK Publication System, focusing on existing tool utilization, dependency reduction, and migration paths from the current implementation.

## Current State Analysis

### Existing Services Inventory

#### 1. DAK FAQ MCP Service (`services/dak-faq-mcp/`)
```typescript
// Current Implementation
- TypeScript-based MCP (Model Context Protocol) server
- Port: 3001
- Dependencies: @modelcontextprotocol/sdk, express, cors, js-yaml
- Functionality: FAQ question processing, DAK metadata extraction
- Status: ✅ Fully implemented and functional
```

#### 2. DAK Publication API Service (`services/dak-publication-api/`)
```yaml
# Current Implementation  
- OpenAPI 3.0.3 specification only
- No actual implementation
- Port: 3002 (planned)
- Status: ❌ Specification-only, no code implementation
```

#### 3. Frontend React Application
```javascript
// Current Dependencies Analysis
Core React Stack: ✅ Optimal
- react@19.1.0, react-dom@19.1.0, react-router-dom@7.8.1
- Modern, stable versions

Specialized Editors: ✅ Necessary  
- bpmn-js@18.6.2 (BPMN diagrams)
- @uiw/react-md-editor@4.0.8 (Markdown editing)

GitHub Integration: ✅ Necessary
- @octokit/rest@22.0.0 (GitHub API)

Utility Libraries: ⚠️ Can be optimized
- ajv@8.17.1 + ajv-formats@3.0.1 (JSON validation)
- dompurify@3.2.6 (HTML sanitization) 
- html2canvas@1.4.1 (Screenshots)
- i18next@25.4.2 + react-i18next@15.7.2 (Internationalization)
```

### Current Functionality Gaps

1. **Dual Service Architecture**: MCP service and REST API service create redundancy
2. **Incomplete Implementation**: Publication API has specification but no implementation
3. **YAML Dependencies**: Services still use js-yaml for configuration parsing
4. **Service Communication**: No clear integration pattern between services

## Architecture Options Analysis

### Option 1: MCP-Centric Consolidation (RECOMMENDED)

**Strategy**: Leverage existing MCP service as the unified backend, eliminate REST API service

#### Advantages:
- ✅ **Builds on working code**: MCP service is already implemented and functional
- ✅ **Reduces complexity**: Single service architecture
- ✅ **Protocol standardization**: MCP is an emerging standard for AI service integration
- ✅ **Existing investment**: Utilizes current working MCP implementation

#### Implementation Plan:
```typescript
// Extend existing MCP service with publication functionality
// services/dak-faq-mcp/enhanced-mcp-server.ts

interface MCPPublicationService extends MCPService {
  // Existing FAQ functionality
  processFAQQuestions(questions: FAQQuestion[]): Promise<FAQResult[]>;
  
  // New publication functionality  
  generatePublication(config: PublicationConfig): Promise<PublicationResult>;
  resolveTemplateVariables(template: Template, context: DAKContext): Promise<VariableMap>;
  manageUserContent(userId: string, content: UserContent): Promise<void>;
}
```

#### Migration Steps:
1. **Phase 1**: Extend MCP service with publication endpoints
2. **Phase 2**: Implement template variable resolution in MCP
3. **Phase 3**: Add user content management to MCP  
4. **Phase 4**: Remove REST API service specification

#### Dependency Reduction:
```json
// Remove from services/dak-publication-api/package.json (eliminate entire service)
// Keep lean MCP service dependencies:
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.17.4",
    "express": "^4.18.2", 
    "cors": "^2.8.5"
    // Remove: js-yaml (eliminate YAML dependencies)
  }
}
```

### Option 2: REST API Implementation

**Strategy**: Fully implement the OpenAPI specification, migrate MCP functionality

#### Advantages:
- ✅ **Standard REST patterns**: Familiar HTTP/JSON API
- ✅ **OpenAPI documentation**: Self-documenting API
- ✅ **Tool ecosystem**: Rich tooling for REST APIs

#### Disadvantages:
- ❌ **Duplicate effort**: Need to reimplement working MCP functionality
- ❌ **More complex**: Requires implementing full REST service from scratch
- ❌ **Protocol mismatch**: MCP is better suited for AI/FAQ operations

### Option 3: Hybrid Architecture

**Strategy**: Keep MCP for AI/FAQ, implement REST for publication generation

#### Disadvantages:
- ❌ **Dual maintenance**: Two services to maintain
- ❌ **Integration complexity**: Service-to-service communication
- ❌ **Deployment complexity**: Multiple services to deploy

## Recommended Solution: Enhanced MCP Architecture

### Service Consolidation Strategy

#### 1. Enhanced MCP Service Structure
```
services/dak-publication-mcp/  (renamed from dak-faq-mcp)
├── src/
│   ├── faq/              # Existing FAQ functionality
│   ├── publication/      # New publication functionality
│   ├── templates/        # Template management
│   ├── variables/        # Variable resolution
│   └── integration/      # External service integration
├── schemas/              # JSON schemas (replace YAML)
├── tests/               # Test suites
└── package.json         # Minimal dependencies
```

#### 2. Frontend Integration Pattern
```javascript
// Single service integration point
class MCPServiceClient {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  // FAQ operations (existing)
  async processFAQ(questions) {
    return this.callMCP('faq.process', { questions });
  }

  // Publication operations (new)
  async generatePublication(config) {
    return this.callMCP('publication.generate', config);
  }

  async resolveVariables(template, context) {
    return this.callMCP('variables.resolve', { template, context });
  }
}
```

### Dependency Reduction Plan

#### Frontend Optimizations:
```javascript
// Current: Multiple validation libraries
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Optimized: Use built-in browser APIs + JSON Schema
// Reduce bundle size by ~50KB
```

#### Service Simplification:
```json
// Target minimal service dependencies
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.17.4",
    "express": "^4.18.2",
    "cors": "^2.8.5"
    // Removed: js-yaml, glob, @xmldom/xmldom
    // Use JSON configs instead of YAML
    // Use native file operations instead of glob
    // Use browser DOM APIs instead of xmldom
  }
}
```

### YAML Elimination Strategy

#### 1. Convert Configuration Files:
```yaml
# OLD: YAML configuration files
# docs/dak/faq/parameters/registry.yaml

variables:
  publication:
    title: "${dak.name} - DAK"
```

```json
// NEW: JSON configuration via API
// Served dynamically by MCP service
{
  "variables": {
    "publication": {
      "title": "${dak.name} - DAK"
    }
  }
}
```

#### 2. API-Driven Configuration:
```javascript
// Replace static YAML files with dynamic API calls
const template = await mcpClient.callMCP('templates.get', { 
  templateId: 'who-dak-standard' 
});
```

### Migration Timeline

#### Phase 1: Service Consolidation (Week 1-2)
- [ ] Rename `dak-faq-mcp` to `dak-publication-mcp`
- [ ] Add publication endpoints to MCP service
- [ ] Create unified service client in frontend
- [ ] Remove OpenAPI service specification

#### Phase 2: YAML Elimination (Week 2-3)  
- [ ] Convert YAML configs to JSON schemas
- [ ] Implement dynamic configuration via MCP endpoints
- [ ] Remove js-yaml dependency from service
- [ ] Update frontend to use API-driven configuration

#### Phase 3: Dependency Optimization (Week 3-4)
- [ ] Audit frontend dependencies for consolidation opportunities
- [ ] Implement native alternatives where possible
- [ ] Bundle size optimization
- [ ] Performance testing and validation

#### Phase 4: Integration Testing (Week 4)
- [ ] End-to-end testing of consolidated architecture
- [ ] Performance benchmarking
- [ ] Documentation updates
- [ ] Production deployment validation

## Tool Utilization Analysis

### Leverage Existing Tools:

#### 1. React Ecosystem (Keep)
```javascript
// Optimal current stack
- React 19.1.0 (latest stable)
- React Router 7.8.1 (latest stable)  
- Modern React patterns (hooks, context)
```

#### 2. GitHub Integration (Keep)
```javascript
// Octokit provides comprehensive GitHub API access
- Repository operations
- Authentication handling
- File content management
- Branch and commit operations
```

#### 3. Specialized Editors (Keep)
```javascript
// Domain-specific editors that provide significant value
- bpmn-js: BPMN diagram editing
- dmn-js: DMN decision table editing  
- @uiw/react-md-editor: Markdown editing
```

### Consolidation Opportunities:

#### 1. Validation Libraries
```javascript
// Current: Multiple validation approaches
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Proposed: Unified validation via MCP service
const validation = await mcpClient.validateSchema(data, schema);
```

#### 2. Utility Libraries
```javascript
// Current: Multiple utility libraries
import DOMPurify from 'dompurify';
import html2canvas from 'html2canvas';

// Consider: Built-in browser APIs or consolidated utility service
```

## Performance and Scalability Considerations

### Single Service Benefits:
- **Reduced Network Overhead**: One service connection instead of multiple
- **Simplified Deployment**: Single service to deploy and maintain
- **Consistent Error Handling**: Unified error handling patterns
- **Simplified Authentication**: Single authentication point

### Frontend Optimizations:
- **Code Splitting**: Lazy load publication components
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching Strategy**: Service worker for static assets
- **Performance Monitoring**: Core Web Vitals tracking

## Risk Assessment

### Low Risk:
- ✅ **MCP Service Extension**: Building on proven, working code
- ✅ **Frontend Optimization**: Standard React optimization patterns
- ✅ **YAML Elimination**: Straightforward JSON conversion

### Medium Risk:
- ⚠️ **Service Consolidation**: Requires careful migration planning
- ⚠️ **Dependency Changes**: Need thorough testing of alternatives

### Mitigation Strategies:
- **Phased Migration**: Implement changes incrementally
- **Feature Flags**: Toggle between old and new implementations  
- **Rollback Plan**: Maintain ability to revert changes
- **Comprehensive Testing**: Unit, integration, and E2E testing

## Conclusion

The **Enhanced MCP Architecture** provides the optimal path forward by:

1. **Leveraging Existing Investment**: Building on the working MCP service
2. **Reducing Complexity**: Single service architecture eliminates duplication
3. **Minimizing Dependencies**: Consolidates functionality and reduces maintenance overhead
4. **Maintaining Standards Compliance**: Preserves WHO SMART Guidelines requirements
5. **Enabling Future Growth**: Provides foundation for additional AI/ML integrations

This approach delivers the WYSIWYG-first publication system while minimizing technical debt and maximizing reuse of existing, proven components.