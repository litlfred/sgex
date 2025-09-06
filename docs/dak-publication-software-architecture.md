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

### Option 1: Dual Service Architecture (RECOMMENDED)

**Strategy**: Maintain specialized services for distinct domains - MCP for FAQ/AI operations and REST API for publication management

#### Advantages:
- ✅ **Separation of Concerns**: MCP handles AI/FAQ operations, REST API handles publication workflows
- ✅ **Protocol Optimization**: MCP for AI interactions, REST for standard web operations
- ✅ **Independent Scaling**: Services can be scaled based on different usage patterns
- ✅ **Team Autonomy**: Different teams can work on services independently
- ✅ **Client Flexibility**: REST API can serve multiple frontend clients
- ✅ **Microservices Pattern**: Follows modern distributed architecture principles

#### Service Responsibilities:
```typescript
// MCP Service (services/dak-faq-mcp/) - AI & FAQ Operations
interface MCPService {
  processFAQQuestions(questions: FAQQuestion[]): Promise<FAQResult[]>;
  extractDAKMetadata(repository: string): Promise<DAKMetadata>;
  generateContentSuggestions(context: AIContext): Promise<ContentSuggestions>;
}

// REST API Service (services/dak-publication-api/) - Publication Management
interface PublicationAPI {
  manageTemplates(template: Template): Promise<TemplateResult>;
  resolveVariables(config: VariableConfig): Promise<VariableMap>;
  manageUserContent(content: UserContent): Promise<ContentResult>;
  generatePublication(config: PublicationConfig): Promise<PublicationResult>;
}
```

#### Service Integration:
```javascript
// Frontend integrates with both services
class DAKPublicationClient {
  constructor() {
    this.mcpClient = new MCPClient('http://localhost:3001');
    this.apiClient = new PublicationAPIClient('http://localhost:3002');
  }

  async generatePublication(dakRepo) {
    // Get AI-generated metadata from MCP service
    const metadata = await this.mcpClient.extractDAKMetadata(dakRepo);
    
    // Use REST API for publication generation
    const publication = await this.apiClient.generatePublication({
      repository: dakRepo,
      metadata: metadata,
      template: 'who-dak-standard'
    });
    
    return publication;
  }
}
```

### Option 2: MCP-Centric Consolidation

**Strategy**: Leverage existing MCP service as the unified backend, eliminate REST API service

#### Disadvantages:
- ❌ **Protocol Mismatch**: MCP not ideal for all publication operations
- ❌ **Single Point of Failure**: All functionality in one service
- ❌ **Scaling Limitations**: Cannot scale FAQ and publication operations independently
- ❌ **Mixed Responsibilities**: Combines AI operations with standard CRUD operations

### Option 3: REST API-Only Implementation

**Strategy**: Fully implement the OpenAPI specification, migrate MCP functionality

#### Disadvantages:
- ❌ **Protocol Mismatch**: REST not optimal for AI/MCP operations
- ❌ **Reimplement Working Code**: Need to recreate existing MCP functionality
- ❌ **Lost MCP Benefits**: Lose standardized AI service protocol advantages

## Recommended Solution: Dual Service Architecture

### Service Optimization Strategy

#### 1. Specialized Service Architecture
```
services/
├── dak-faq-mcp/           # MCP Service - AI & FAQ Operations
│   ├── src/
│   │   ├── faq/           # FAQ question processing
│   │   ├── ai/            # AI content generation
│   │   ├── metadata/      # DAK metadata extraction
│   │   └── mcp/           # MCP protocol handling
│   └── package.json       # MCP-specific dependencies
│
└── dak-publication-api/   # REST API - Publication Management  
    ├── src/
    │   ├── templates/     # Template CRUD operations
    │   ├── variables/     # Variable resolution
    │   ├── content/       # User content management
    │   ├── publication/   # Publication generation
    │   └── integration/   # Service integration layer
    └── package.json       # REST API dependencies
```

#### 2. Frontend Integration Pattern
```javascript
// Dual service integration with clear separation
class DAKPublicationWorkflow {
  constructor() {
    this.mcpService = new MCPServiceClient('http://localhost:3001');
    this.publicationAPI = new PublicationAPIClient('http://localhost:3002');
  }

  async createPublication(dakRepository) {
    // Step 1: Extract metadata via MCP service
    const dakMetadata = await this.mcpService.extractDAKMetadata(dakRepository);
    
    // Step 2: Get AI-generated content suggestions
    const contentSuggestions = await this.mcpService.generateContentSuggestions({
      repository: dakRepository,
      metadata: dakMetadata
    });
    
    // Step 3: Create publication via REST API
    const publication = await this.publicationAPI.createPublication({
      repository: dakRepository,
      template: 'who-dak-standard',
      metadata: dakMetadata,
      suggestions: contentSuggestions
    });
    
    return publication;
  }

  async updateUserContent(publicationId, content) {
    // User content managed via REST API
    return await this.publicationAPI.updateContent(publicationId, content);
  }

  async processFAQQuestions(questions) {
    // FAQ processing via MCP service
    return await this.mcpService.processFAQQuestions(questions);
  }
}
```

### Service Dependency Optimization

#### MCP Service Dependencies (Optimized):
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.17.4",
    "express": "^4.18.2",
    "cors": "^2.8.5"
    // Focused on MCP and basic HTTP server functionality
  }
}
```

#### Publication API Dependencies (Focused):
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5", 
    "helmet": "^7.1.0",
    "swagger-ui-express": "^5.0.0",
    "axios": "^1.6.0",
    "joi": "^17.11.0",
    "uuid": "^9.0.1"
    // Focused on REST API, validation, and HTTP client functionality
  }
}
```

### YAML Elimination Strategy

#### 1. Convert Static Configuration to Dynamic APIs:
```yaml
# OLD: Static YAML configuration files
# docs/dak/faq/parameters/registry.yaml

variables:
  publication:
    title: "${dak.name} - DAK"
```

```javascript
// NEW: Dynamic configuration via REST API
const templateConfig = await publicationAPI.getTemplate('who-dak-standard');
const variables = await publicationAPI.resolveVariables({
  templateId: 'who-dak-standard',
  dakRepository: repository,
  userCustomizations: userContent
});
```

#### 2. Service Integration for Variable Resolution:
```javascript
// REST API integrates with MCP service for dynamic content
class VariableResolutionService {
  async resolveTemplateVariables(template, context) {
    // Get base DAK metadata from MCP service
    const dakMetadata = await mcpClient.extractDAKMetadata(context.repository);
    
    // Resolve template variables with dynamic content
    const resolvedVariables = {
      'dak.name': dakMetadata.name,
      'dak.version': dakMetadata.version,
      'current.date': new Date().toISOString(),
      'user.customizations': context.userContent
    };
    
    return this.processTemplate(template, resolvedVariables);
  }
}
```

### Migration Timeline

#### Phase 1: Implement Publication API Service (Week 1-2)
- [ ] Create full TypeScript implementation for OpenAPI specification
- [ ] Implement core REST endpoints (templates, variables, content, publication)
- [ ] Add integration layer for MCP service communication
- [ ] Set up development environment and testing framework

#### Phase 2: Service Integration (Week 2-3)  
- [ ] Implement MCP ↔ REST API integration patterns
- [ ] Create unified frontend service client
- [ ] Convert YAML configurations to REST API endpoints
- [ ] Implement WYSIWYG content management via REST API

#### Phase 3: YAML Elimination & Frontend Integration (Week 3-4)
- [ ] Replace all static YAML files with dynamic API calls
- [ ] Update frontend to use dual service architecture
- [ ] Implement real-time WYSIWYG editing with API persistence
- [ ] Add comprehensive error handling and fallback mechanisms

#### Phase 4: Testing & Optimization (Week 4)
- [ ] End-to-end testing of dual service integration
- [ ] Performance optimization and caching strategies
- [ ] Security review and authentication implementation
- [ ] Documentation updates and deployment guides

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

#### 4. MCP Service (Leverage & Extend)
```javascript
// Existing working MCP implementation
- FAQ question processing
- DAK metadata extraction
- AI content generation capabilities
- Proven MCP protocol implementation
```

### Service Specialization Opportunities:

#### 1. MCP Service Focus
```typescript
// Optimize for AI and FAQ operations
interface OptimizedMCPService {
  // Core AI capabilities
  generateContentSuggestions(context: AIContext): Promise<ContentSuggestions>;
  processFAQQuestions(questions: FAQQuestion[]): Promise<FAQResult[]>;
  extractDAKMetadata(repository: string): Promise<DAKMetadata>;
  
  // Remove: Direct publication generation (move to REST API)
  // Remove: Template management (move to REST API)
  // Remove: User content storage (move to REST API)
}
```

#### 2. REST API Service Focus
```typescript
// Optimize for publication workflows and WYSIWYG
interface OptimizedPublicationAPI {
  // Publication management
  createPublication(config: PublicationConfig): Promise<Publication>;
  updatePublication(id: string, updates: PublicationUpdates): Promise<Publication>;
  
  // Template management
  createTemplate(template: Template): Promise<TemplateResult>;
  updateTemplate(id: string, template: Template): Promise<TemplateResult>;
  
  // User content (WYSIWYG)
  saveUserContent(content: UserContent): Promise<ContentResult>;
  loadUserContent(publicationId: string): Promise<UserContent>;
  
  // Integration with MCP for AI content
  integrateAIContent(suggestions: ContentSuggestions): Promise<IntegrationResult>;
}
```

### Tool Consolidation Benefits:

#### 1. Service Specialization
- **MCP Service**: Optimized for AI operations, FAQ processing, metadata extraction
- **REST API**: Optimized for publication workflows, template management, WYSIWYG editing
- **Frontend**: Unified client integrating both services seamlessly

#### 2. Protocol Optimization  
- **MCP Protocol**: Ideal for AI interactions and real-time FAQ processing
- **REST Protocol**: Perfect for CRUD operations, file management, user content persistence

#### 3. Independent Scaling
- **MCP Service**: Scale based on AI/FAQ usage patterns
- **REST API**: Scale based on publication creation and editing patterns

## Performance and Scalability Considerations

### Dual Service Benefits:
- **Service Specialization**: Each service optimized for its specific domain
- **Independent Scaling**: Scale MCP and REST API services based on different usage patterns  
- **Protocol Optimization**: MCP for AI operations, REST for standard web workflows
- **Fault Isolation**: Issues in one service don't affect the other
- **Development Independence**: Teams can work on services independently
- **Technology Flexibility**: Each service can use optimal technology stack

### Service Communication:
- **Asynchronous Integration**: Non-blocking service-to-service communication
- **Caching Layer**: Cache frequently accessed data between services
- **Circuit Breaker**: Graceful degradation when one service is unavailable
- **Load Balancing**: Distribute requests across multiple service instances

### Frontend Optimizations:
- **Code Splitting**: Lazy load publication components
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Service Workers**: Cache static assets and API responses
- **Performance Monitoring**: Core Web Vitals tracking across both services

## Risk Assessment

### Low Risk:
- ✅ **Service Specialization**: Building on proven patterns and existing MCP implementation
- ✅ **REST API Implementation**: Standard patterns with comprehensive OpenAPI specification
- ✅ **Frontend Integration**: Well-defined service integration patterns
- ✅ **YAML Elimination**: Straightforward JSON conversion with API endpoints

### Medium Risk:
- ⚠️ **Service Integration**: Requires careful design of service-to-service communication
- ⚠️ **Dual Service Deployment**: Need robust deployment and monitoring for both services
- ⚠️ **Data Consistency**: Ensure consistency across services for shared data

### Mitigation Strategies:
- **Service Contracts**: Well-defined APIs and service contracts
- **Integration Testing**: Comprehensive testing of service interactions
- **Circuit Breakers**: Graceful degradation when services are unavailable
- **Monitoring & Alerting**: Full observability across both services
- **Rollback Plan**: Ability to revert changes independently for each service

## Conclusion

The **Dual Service Architecture** provides the optimal path forward by:

1. **Service Specialization**: Each service optimized for its specific domain (AI/FAQ vs Publication Management)
2. **Protocol Optimization**: MCP for AI operations, REST for standard web workflows  
3. **Independent Scaling**: Services can scale based on different usage patterns
4. **Development Flexibility**: Teams can work on services independently
5. **Microservices Benefits**: Fault isolation, technology flexibility, and independent deployment
6. **Maintains Standards Compliance**: Preserves WHO SMART Guidelines requirements
7. **Future-Proof Architecture**: Foundation for additional specialized services

### Service Responsibilities Summary:

**MCP Service (dak-faq-mcp)**:
- FAQ question processing and AI-driven content generation
- DAK metadata extraction and analysis
- Real-time AI assistance and content suggestions

**REST API Service (dak-publication-api)**:
- Publication template management and WYSIWYG editing
- User content persistence and version management  
- Publication generation and export workflows
- Integration orchestration with MCP service

This architecture delivers the WYSIWYG-first publication system while maintaining service specialization, enabling independent scaling, and providing a foundation for future microservices expansion.