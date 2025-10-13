# DAK Logical Model Update - Implementation Plan

## Issue Reference
Fixes #1110 - Update DAK Logical Model based on WHO smart-base changes

## Overview
The WHO SMART Guidelines DAK logical model has been updated to include intermediary source types (e.g., `HealthInterventionsSource`, `UserScenarioSource`, etc.) that support multiple source reference types:
1. **IRI/Canonical**: WHO IRIS publication references (e.g., `http://iris.who.int/publication/12345`)
2. **Absolute URL**: External web resources (e.g., `https://example.com/resource.json`)
3. **Relative URL**: Repository-local files relative to `input/` directory (e.g., `fsh/actors/myActor.fsh`)
4. **Inline Data**: Direct instance data embedded in dak.json

## Updated DAK Logical Model Structure

### From WHO smart-base DAK.fsh:
```fsh
* healthInterventions 0..* HealthInterventionsSource "Health Interventions and Recommendations"
* personas 0..* GenericPersonaSource "Generic Personas" 
* userScenarios 0..* UserScenarioSource "User Scenarios"
* businessProcesses 0..* BusinessProcessWorkflowSource "Generic Business Processes and Workflows"
* dataElements 0..* CoreDataElementSource "Core Data Elements"
* decisionLogic 0..* DecisionSupportLogicSource "Decision-Support Logic"
* indicators 0..* ProgramIndicatorSource "Program Indicators"
* requirements 0..* RequirementsSource "Functional and Non-Functional Requirements"
* testScenarios 0..* TestScenarioSource "Test Scenarios"
```

Each `*Source` type supports:
- `canonical`: IRI/canonical reference
- `url`: Absolute or relative URL
- `data`: Inline instance data

## Current State Analysis

### Files to Update

#### 1. Type Definitions
- **`packages/dak-core/src/types.ts`**
  - Current: Direct component types (e.g., `HealthInterventions`)
  - Need: Add Source types with union types for different reference methods

#### 2. DAK Core Services
- **`packages/dak-core/src/dak-service.ts`**
  - Current: Direct component loading
  - Need: Source resolution logic for different source types

- **`packages/dak-core/src/validation.ts`**
  - Current: Basic DAK validation
  - Need: Validate source types and references

#### 3. Staging Ground Services
- **`src/services/stagingGroundService.js`**
  - Current: File-based staging
  - Need: Integration with dak.json source tracking

#### 4. DAK Component Pages
All DAK component pages need to:
- Instantiate a DAK object for the selected repo
- Update dak.json when artifacts are discovered/created
- Add sources to dak.json automatically
- Save to staging ground when needed

**Component Pages to Update:**
- Generic Personas page
- Business Processes page
- User Scenarios page
- Health Interventions page
- Core Data Elements page
- Decision Support Logic page
- Program Indicators page
- Requirements page
- Test Scenarios page

## Implementation Plan

### Phase 1: Update Type Definitions (1-2 days)

#### 1.1 Create Source Type Definitions
**File:** `packages/dak-core/src/types.ts`

```typescript
/**
 * Base source type for DAK component sources
 * Supports IRI/canonical, URL (absolute/relative), or inline data
 */
export interface DAKComponentSource<T> {
  /** Canonical IRI reference (e.g., IRIS publication) */
  canonical?: string;
  
  /** URL reference - absolute or relative to input/ directory */
  url?: string;
  
  /** Inline instance data */
  data?: T;
  
  /** Metadata about the source */
  metadata?: {
    /** When this source was added */
    addedAt?: string;
    /** Who/what added this source */
    addedBy?: string;
    /** Last validation timestamp */
    lastValidated?: string;
    /** Source type for tracking */
    sourceType?: 'canonical' | 'url-absolute' | 'url-relative' | 'inline';
  };
}

/**
 * Specific source types for each of the 9 DAK components
 */
export type HealthInterventionsSource = DAKComponentSource<HealthInterventions>;
export type GenericPersonaSource = DAKComponentSource<GenericPersona>;
export type UserScenarioSource = DAKComponentSource<UserScenario>;
export type BusinessProcessWorkflowSource = DAKComponentSource<BusinessProcessWorkflow>;
export type CoreDataElementSource = DAKComponentSource<CoreDataElement>;
export type DecisionSupportLogicSource = DAKComponentSource<DecisionSupportLogic>;
export type ProgramIndicatorSource = DAKComponentSource<ProgramIndicator>;
export type RequirementsSource = DAKComponentSource<Requirements>;
export type TestScenarioSource = DAKComponentSource<TestScenario>;
```

#### 1.2 Update DAK Interface
Update the `DAK` interface to use Source types:

```typescript
export interface DAK extends DAKMetadata {
  resourceType: 'DAK';
  
  // 9 DAK Components now use Source types
  healthInterventions?: HealthInterventionsSource[];
  personas?: GenericPersonaSource[];
  userScenarios?: UserScenarioSource[];
  businessProcesses?: BusinessProcessWorkflowSource[];
  dataElements?: CoreDataElementSource[];
  decisionLogic?: DecisionSupportLogicSource[];
  indicators?: ProgramIndicatorSource[];
  requirements?: RequirementsSource[];
  testScenarios?: TestScenarioSource[];
}
```

#### 1.3 Add Helper Types
```typescript
/**
 * Source resolution result
 */
export interface ResolvedSource<T> {
  /** The resolved data */
  data: T;
  /** The source that was used */
  source: DAKComponentSource<T>;
  /** How the data was resolved */
  resolutionMethod: 'canonical' | 'url-absolute' | 'url-relative' | 'inline' | 'cache';
  /** When resolved */
  resolvedAt: Date;
}

/**
 * Source validation result
 */
export interface SourceValidationResult {
  isValid: boolean;
  sourceType: 'canonical' | 'url-absolute' | 'url-relative' | 'inline';
  errors: string[];
  warnings: string[];
}
```

### Phase 2: Create Core DAK Services (2-3 days)

#### 2.1 Source Resolution Service
**New File:** `packages/dak-core/src/sourceResolution.ts`

Service to resolve different source types:

```typescript
export class SourceResolutionService {
  /**
   * Resolve a component source to its data
   */
  async resolveSource<T>(
    source: DAKComponentSource<T>,
    repositoryContext: DAKRepository
  ): Promise<ResolvedSource<T>>;
  
  /**
   * Determine source type from source object
   */
  determineSourceType(source: DAKComponentSource<any>): 'canonical' | 'url-absolute' | 'url-relative' | 'inline';
  
  /**
   * Resolve canonical IRI reference
   */
  private async resolveCanonical<T>(canonical: string): Promise<T>;
  
  /**
   * Resolve absolute URL
   */
  private async resolveAbsoluteUrl<T>(url: string): Promise<T>;
  
  /**
   * Resolve relative URL (relative to input/ directory)
   */
  private async resolveRelativeUrl<T>(
    url: string, 
    repositoryContext: DAKRepository
  ): Promise<T>;
  
  /**
   * Return inline data directly
   */
  private resolveInline<T>(data: T): T;
}
```

#### 2.2 DAK Object Service
**New File:** `packages/dak-core/src/dakObject.ts`

Core DAK object that manages sources and provides component access:

```typescript
export class DAKObject {
  private dak: DAK;
  private repository: DAKRepository;
  private sourceResolver: SourceResolutionService;
  private cache: Map<string, any>;
  
  constructor(
    dak: DAK,
    repository: DAKRepository,
    sourceResolver: SourceResolutionService
  );
  
  /**
   * Get all sources for a component type
   */
  getSources<T>(componentType: DAKComponentType): DAKComponentSource<T>[];
  
  /**
   * Add a source to a component
   */
  async addSource<T>(
    componentType: DAKComponentType,
    source: DAKComponentSource<T>
  ): Promise<void>;
  
  /**
   * Update an existing source
   */
  async updateSource<T>(
    componentType: DAKComponentType,
    sourceIndex: number,
    updates: Partial<DAKComponentSource<T>>
  ): Promise<void>;
  
  /**
   * Remove a source
   */
  removeSource(componentType: DAKComponentType, sourceIndex: number): void;
  
  /**
   * Resolve all sources for a component and return data
   */
  async resolveComponent<T>(componentType: DAKComponentType): Promise<T[]>;
  
  /**
   * Export to dak.json format
   */
  toJSON(): DAK;
  
  /**
   * Save to staging ground
   */
  async saveToStagingGround(stagingService: any): Promise<void>;
}
```

#### 2.3 DAK Factory Service
**New File:** `packages/dak-core/src/dakFactory.ts`

Factory for creating DAK objects from repositories:

```typescript
export class DAKFactory {
  /**
   * Create DAK object from repository
   */
  async createFromRepository(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<DAKObject>;
  
  /**
   * Create DAK object from existing dak.json
   */
  async createFromDakJson(
    dakJson: DAK,
    repository: DAKRepository
  ): Promise<DAKObject>;
  
  /**
   * Initialize empty DAK object for new repository
   */
  createEmpty(repository: DAKRepository, metadata: DAKMetadata): DAKObject;
}
```

#### 2.4 Update Existing DAK Service
**File:** `packages/dak-core/src/dak-service.ts`

Integrate with new source resolution:

```typescript
export class DAKService {
  private sourceResolver: SourceResolutionService;
  private dakFactory: DAKFactory;
  
  /**
   * Load DAK object from repository with source resolution
   */
  async loadDAKObject(dakRepo: DAKRepository): Promise<DAKObject>;
  
  /**
   * Scan repository for artifacts and create sources
   */
  async scanAndCreateSources(
    dakRepo: DAKRepository,
    componentType: DAKComponentType
  ): Promise<DAKComponentSource<any>[]>;
}
```

### Phase 3: Update Staging Ground Integration (1-2 days)

#### 3.1 Extend Staging Ground Service
**File:** `src/services/stagingGroundService.js`

Add DAK object management:

```javascript
class StagingGroundService {
  /**
   * Load or create DAK object for current repository
   */
  async getDAKObject() {
    // Load from staging ground or create new
  }
  
  /**
   * Update dak.json in staging ground
   */
  updateDAKJson(dakObject) {
    const dakJson = dakObject.toJSON();
    this.updateFile('dak.json', JSON.stringify(dakJson, null, 2), {
      source: 'dak-object',
      component: 'metadata'
    });
  }
  
  /**
   * Add artifact source to dak.json
   */
  addArtifactSource(componentType, artifactPath, artifactData = null) {
    const dakObject = this.getDAKObject();
    
    // Determine source type based on path/data
    const source = this.createSourceFromArtifact(
      componentType,
      artifactPath,
      artifactData
    );
    
    dakObject.addSource(componentType, source);
    this.updateDAKJson(dakObject);
  }
  
  /**
   * Create source object from artifact
   */
  createSourceFromArtifact(componentType, artifactPath, artifactData) {
    // If artifactPath is relative to input/, create url source
    // If artifactData provided, create inline source
    // If external URL, create url source
    // If canonical IRI, create canonical source
  }
}
```

#### 3.2 Create DAK Management Service
**New File:** `src/services/dakManagementService.js`

Bridge between React components and DAK core:

```javascript
class DAKManagementService {
  constructor(stagingGroundService, dakFactory) {
    this.stagingGroundService = stagingGroundService;
    this.dakFactory = dakFactory;
  }
  
  /**
   * Initialize DAK for repository
   */
  async initializeDAK(owner, repo, branch) {
    // Load or create DAK object
  }
  
  /**
   * Scan repository for artifacts of a component type
   */
  async scanForArtifacts(componentType) {
    // Scan repository directory structure
    // Return found artifacts
  }
  
  /**
   * Register artifact in DAK
   */
  async registerArtifact(componentType, artifact) {
    // Create source
    // Add to DAK object
    // Update staging ground
  }
  
  /**
   * Get all registered artifacts for component
   */
  async getRegisteredArtifacts(componentType) {
    // Get sources from DAK object
    // Resolve sources to data
  }
}
```

### Phase 4: Update DAK Component Pages (3-4 days)

Each DAK component page needs to integrate with the new DAK object system.

#### 4.1 Generic Pattern for Component Pages

**Standard Integration Pattern:**

```javascript
// In each component page (e.g., GenericPersonasPage.js)
import { useMemo, useEffect, useState } from 'react';
import dakManagementService from '../services/dakManagementService';

function GenericPersonasPage() {
  const [dakObject, setDakObject] = useState(null);
  const [personas, setPersonas] = useState([]);
  const { user, repo, branch } = useDAKUrlParams(); // From URL
  
  useEffect(() => {
    // Initialize DAK object for this repository
    const initDAK = async () => {
      const dak = await dakManagementService.initializeDAK(user, repo, branch);
      setDakObject(dak);
      
      // Load existing personas from sources
      const personaData = await dak.resolveComponent('personas');
      setPersonas(personaData);
    };
    
    initDAK();
  }, [user, repo, branch]);
  
  // When scanning discovers artifacts
  const handleScanComplete = async (discoveredArtifacts) => {
    for (const artifact of discoveredArtifacts) {
      // Check if already in DAK sources
      const sources = dakObject.getSources('personas');
      const exists = sources.some(s => s.url === artifact.path);
      
      if (!exists) {
        // Add to DAK object
        await dakManagementService.registerArtifact('personas', {
          path: artifact.path,
          name: artifact.name
        });
      }
    }
  };
  
  // When saving new/edited artifact
  const handleSaveArtifact = async (artifactData, filePath) => {
    // Save file to staging ground
    stagingGroundService.updateFile(filePath, artifactData);
    
    // Register in DAK object
    await dakManagementService.registerArtifact('personas', {
      path: filePath,
      data: artifactData // Optional inline data
    });
  };
  
  return (
    // Component UI
  );
}
```

#### 4.2 Component Pages to Update

**Priority Order:**

1. **Generic Personas Page** (Pilot implementation)
   - Test the pattern
   - Validate source tracking
   - Ensure staging ground integration works

2. **Business Processes Page**
   - BPMN file scanning
   - Source registration for .bpmn files

3. **User Scenarios Page**
   - Scenario file scanning
   - Source registration

4. **Core Data Elements Page**
   - Profile/extension scanning
   - OCL integration
   - Source registration

5. **Decision Support Logic Page**
   - DMN file scanning
   - Source registration for .dmn files

6. **Health Interventions Page**
   - IRIS publication references
   - Canonical URL sources

7. **Program Indicators Page**
   - Measure scanning
   - Source registration

8. **Requirements Page**
   - Requirements file scanning
   - Source registration

9. **Test Scenarios Page**
   - Example file scanning
   - Source registration

#### 4.3 Shared Component Updates

**DAK Dashboard:**
- Display DAK object status
- Show source counts by component
- Validation status

**Staging Ground UI:**
- Show dak.json in file list
- Highlight when dak.json changes
- Preview dak.json structure

### Phase 5: Validation and Testing (2-3 days)

#### 5.1 Unit Tests
**New Test Files:**
- `packages/dak-core/src/sourceResolution.test.ts`
- `packages/dak-core/src/dakObject.test.ts`
- `packages/dak-core/src/dakFactory.test.ts`

**Test Coverage:**
- Source type determination
- Source resolution (all 4 types)
- DAK object CRUD operations
- dak.json serialization/deserialization
- Error handling for invalid sources

#### 5.2 Integration Tests
- End-to-end artifact discovery and registration
- Staging ground integration
- Component page interactions
- Cross-component consistency

#### 5.3 Validation Tests
- Validate generated dak.json against schema
- Relative URL resolution
- Canonical URL resolution
- Inline data handling

### Phase 6: Migration Plan for In-Progress PRs (1 day)

#### 6.1 Identify Affected PRs
Scan for PRs that:
- Modify DAK component pages
- Touch staging ground service
- Work with DAK types/services

#### 6.2 Migration Strategy
1. **Document Breaking Changes:**
   - List all API changes
   - Provide migration examples
   - Update component integration guide

2. **Create Migration Helper Script:**
   ```javascript
   // scripts/migrate-to-dak-sources.js
   // Helps update component pages to use new DAK object API
   ```

3. **Update PR Template:**
   - Add checklist for DAK source integration
   - Link to migration guide

4. **Communication:**
   - Comment on affected PRs with migration guide
   - Offer to help with migration
   - Set timeline for updates

#### 6.3 Backward Compatibility
- Maintain old APIs temporarily with deprecation warnings
- Provide adapters/wrappers for gradual migration
- Clear deprecation timeline

### Phase 7: Documentation Updates (1-2 days)

#### 7.1 Technical Documentation
- **`packages/dak-core/README.md`**: DAK object usage guide
- **`docs/DAK_SOURCES.md`**: Source types and resolution
- **`docs/COMPONENT_INTEGRATION.md`**: How to integrate components

#### 7.2 Developer Guide
- Update component development guide
- Add source registration examples
- Document best practices

#### 7.3 Schema Updates
- Update `packages/dak-core/schemas/dak.schema.json`
- Update `packages/dak-core/schemas/dak-model.fsh`
- Add source type schemas

## Implementation Timeline

### Week 1
- **Days 1-2:** Phase 1 - Type definitions
- **Days 3-5:** Phase 2 - Core services (partial)

### Week 2
- **Days 1-2:** Phase 2 - Core services (complete)
- **Days 3-5:** Phase 3 - Staging ground integration

### Week 3
- **Days 1-5:** Phase 4 - Component pages (5 pages)

### Week 4
- **Days 1-2:** Phase 4 - Component pages (4 remaining pages)
- **Days 3-5:** Phase 5 - Testing and validation

### Week 5
- **Days 1-2:** Phase 6 - Migration plan and PR updates
- **Days 3-5:** Phase 7 - Documentation and cleanup

**Total Estimated Time:** 4-5 weeks

## Key Design Decisions

### 1. Source Type Priority
When multiple source types are present in one source object:
1. Inline data (highest priority - most specific)
2. Relative URL (local repository data)
3. Absolute URL (external resources)
4. Canonical IRI (lowest priority - most general)

### 2. Relative URL Resolution
- Always relative to `input/` directory
- Example: `fsh/actors/myActor.fsh` → `{repo}/input/fsh/actors/myActor.fsh`
- Validate path existence during resolution

### 3. Caching Strategy
- Cache resolved sources by (component type + source index)
- Invalidate on source updates
- Configurable TTL for external URLs

### 4. Error Handling
- Graceful degradation for failed source resolution
- Clear error messages indicating which source failed
- Continue resolving other sources on individual failures

### 5. Staging Ground Integration
- dak.json is auto-generated, not manually edited
- Component pages auto-update dak.json on artifact changes
- User sees dak.json in staging ground for review
- Clear indication when dak.json is out of sync

## Risks and Mitigations

### Risk 1: Breaking Changes in Active PRs
**Mitigation:** 
- Maintain backward compatibility layer
- Provide migration scripts
- Clear communication and timeline

### Risk 2: Performance Impact of Source Resolution
**Mitigation:**
- Implement caching strategy
- Lazy loading of sources
- Background prefetching

### Risk 3: Complex Source Type Logic
**Mitigation:**
- Comprehensive unit tests
- Clear documentation
- Example implementations

### Risk 4: dak.json Sync Issues
**Mitigation:**
- Automatic validation on load
- Clear UI indicators for sync status
- Recovery mechanisms

## Success Criteria

1. ✅ All 9 DAK components support source types
2. ✅ Artifacts are automatically registered in dak.json
3. ✅ Relative URLs resolve correctly to repository files
4. ✅ Staging ground shows updated dak.json
5. ✅ All existing tests pass
6. ✅ New tests achieve 80%+ coverage
7. ✅ Documentation is complete and clear
8. ✅ In-progress PRs are migrated successfully
9. ✅ No regressions in existing functionality
10. ✅ Performance is acceptable (< 500ms source resolution)

## Next Steps

1. **Review and Approval:** Present this plan for review
2. **Refinement:** Incorporate feedback
3. **Prototype:** Build proof-of-concept for one component
4. **Validation:** Test approach with real repository
5. **Full Implementation:** Execute phases sequentially
6. **Migration:** Update in-progress PRs
7. **Release:** Deploy with comprehensive documentation

## Questions for Review

1. Should we support nested sources (sources that reference other sources)?
2. What caching TTL is appropriate for external URLs?
3. Should dak.json be committed automatically or require explicit action?
4. How to handle conflicts between inline data and file-based data?
5. Should we support batch operations for adding multiple sources?
6. What validation level is required for canonical IRIs?
7. Should source metadata include version information?
8. How to handle migration of existing repositories without dak.json?

## References

- WHO SMART Guidelines DAK.fsh: https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/DAK.fsh
- Issue #1110: Update DAK Logical Model
- Existing DAK Architecture: `services/dak-faq-mcp/DAK_ARCHITECTURE.md`
- Current Types: `packages/dak-core/src/types.ts`
