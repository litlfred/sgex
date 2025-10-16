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

/**
 * Base interface for DAK Component Objects
 * Each of the 9 DAK components will have its own Component Object
 */
export interface DAKComponentObject<TData, TSource extends DAKComponentSource<TData>> {
  /** Component type identifier */
  componentType: DAKComponentType;
  
  /** Get all sources for this component */
  getSources(): TSource[];
  
  /** Add a source to this component */
  addSource(source: TSource): Promise<void>;
  
  /** Update a source at index */
  updateSource(index: number, updates: Partial<TSource>): Promise<void>;
  
  /** Remove a source at index */
  removeSource(index: number): Promise<void>;
  
  /** Retrieve and resolve all instance data from all sources */
  retrieveAll(): Promise<TData[]>;
  
  /** Retrieve single instance by ID or index */
  retrieveById(id: string): Promise<TData | null>;
  
  /** Save instance data (to staging ground and update sources) */
  save(data: TData, options?: SaveOptions): Promise<void>;
  
  /** Validate instance data */
  validate(data: TData): Promise<ValidationResult>;
  
  /** Validate all instances */
  validateAll(): Promise<ValidationResult[]>;
}

/**
 * Save options for component instances
 */
export interface SaveOptions {
  /** Path for file-based saves (relative to input/) */
  path?: string;
  
  /** Whether to save as inline data in dak.json */
  inline?: boolean;
  
  /** Commit message for staging ground */
  message?: string;
  
  /** Update existing source or create new */
  updateExisting?: boolean;
}
```

### Phase 2: Create Core DAK Services (3-4 days)

#### 2.1 Source Resolution Service
**New File:** `packages/dak-core/src/sourceResolution.ts`

Service to resolve different source types (internal, used by Component Objects):

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

#### 2.2 Base DAK Component Object
**New File:** `packages/dak-core/src/components/baseComponent.ts`

Base class for all 9 DAK component objects:

```typescript
/**
 * Base implementation for DAK Component Objects
 * Handles retrieval, saving, and validation for a specific component type
 */
export abstract class BaseDAKComponent<TData, TSource extends DAKComponentSource<TData>> 
  implements DAKComponentObject<TData, TSource> {
  
  protected sources: TSource[] = [];
  protected cache: Map<string, TData> = new Map();
  
  constructor(
    public readonly componentType: DAKComponentType,
    protected repository: DAKRepository,
    protected sourceResolver: SourceResolutionService,
    protected stagingGroundService: any, // Will be typed properly
    protected validationService: any // Component-specific validation
  ) {}
  
  /** Get all sources for this component */
  getSources(): TSource[] {
    return [...this.sources];
  }
  
  /** Add a source to this component */
  async addSource(source: TSource): Promise<void> {
    this.sources.push(source);
    await this.syncToDAK();
  }
  
  /** Update a source at index */
  async updateSource(index: number, updates: Partial<TSource>): Promise<void> {
    if (index < 0 || index >= this.sources.length) {
      throw new Error(`Invalid source index: ${index}`);
    }
    this.sources[index] = { ...this.sources[index], ...updates };
    await this.syncToDAK();
  }
  
  /** Remove a source at index */
  async removeSource(index: number): Promise<void> {
    if (index < 0 || index >= this.sources.length) {
      throw new Error(`Invalid source index: ${index}`);
    }
    this.sources.splice(index, 1);
    await this.syncToDAK();
  }
  
  /** Retrieve and resolve all instance data from all sources */
  async retrieveAll(): Promise<TData[]> {
    const allData: TData[] = [];
    
    for (const source of this.sources) {
      try {
        const resolved = await this.sourceResolver.resolveSource(source, this.repository);
        allData.push(resolved.data);
      } catch (error) {
        console.error(`Failed to resolve source for ${this.componentType}:`, error);
        // Continue with other sources
      }
    }
    
    return allData;
  }
  
  /** Retrieve single instance by ID */
  async retrieveById(id: string): Promise<TData | null> {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    
    // Retrieve all and find by ID
    const allData = await this.retrieveAll();
    const found = allData.find((data: any) => data.id === id);
    
    if (found) {
      this.cache.set(id, found);
    }
    
    return found || null;
  }
  
  /** Save instance data */
  async save(data: TData, options: SaveOptions = {}): Promise<void> {
    const {
      path,
      inline = false,
      message = `Update ${this.componentType}`,
      updateExisting = true
    } = options;
    
    // Determine how to save
    if (inline) {
      // Save as inline data in dak.json
      await this.saveInline(data, updateExisting);
    } else if (path) {
      // Save to file in repository
      await this.saveToFile(data, path, message);
    } else {
      // Auto-determine path and save
      const autoPath = await this.determineFilePath(data);
      await this.saveToFile(data, autoPath, message);
    }
  }
  
  /** Validate instance data */
  async validate(data: TData): Promise<ValidationResult> {
    return await this.validationService.validate(data);
  }
  
  /** Validate all instances */
  async validateAll(): Promise<ValidationResult[]> {
    const allData = await this.retrieveAll();
    const results: ValidationResult[] = [];
    
    for (const data of allData) {
      results.push(await this.validate(data));
    }
    
    return results;
  }
  
  /** Abstract methods to be implemented by specific components */
  protected abstract determineFilePath(data: TData): Promise<string>;
  protected abstract serializeToFile(data: TData): string;
  protected abstract parseFromFile(content: string): TData;
  
  /** Internal helper methods */
  
  private async saveInline(data: TData, updateExisting: boolean): Promise<void> {
    if (updateExisting) {
      // Find existing inline source and update
      const inlineIndex = this.sources.findIndex(s => s.data !== undefined);
      if (inlineIndex >= 0) {
        await this.updateSource(inlineIndex, { data } as Partial<TSource>);
        return;
      }
    }
    
    // Add new inline source
    await this.addSource({ data } as TSource);
  }
  
  private async saveToFile(data: TData, path: string, message: string): Promise<void> {
    // Serialize data to file format
    const content = this.serializeToFile(data);
    
    // Save to staging ground
    await this.stagingGroundService.updateFile(path, content, {
      message,
      componentType: this.componentType
    });
    
    // Update or add source with relative URL
    const existingIndex = this.sources.findIndex(s => s.url === path);
    if (existingIndex >= 0) {
      await this.updateSource(existingIndex, { 
        url: path,
        metadata: { 
          ...this.sources[existingIndex].metadata,
          lastValidated: new Date().toISOString() 
        }
      } as Partial<TSource>);
    } else {
      await this.addSource({
        url: path,
        metadata: {
          addedAt: new Date().toISOString(),
          addedBy: 'sgex-workbench',
          sourceType: 'url-relative'
        }
      } as TSource);
    }
  }
  
  private async syncToDAK(): Promise<void> {
    // Update parent DAK object with current sources
    // This will trigger dak.json update in staging ground
    await this.repository.updateComponentSources(this.componentType, this.sources);
  }
}
```

#### 2.3 Specific Component Objects
**New Files:** One for each of the 9 DAK components

**`packages/dak-core/src/components/healthInterventions.ts`:**
```typescript
export class HealthInterventionsComponent extends BaseDAKComponent<
  HealthInterventions,
  HealthInterventionsSource
> {
  constructor(
    repository: DAKRepository,
    sourceResolver: SourceResolutionService,
    stagingGroundService: any,
    validationService: any
  ) {
    super(
      DAKComponentType.HEALTH_INTERVENTIONS,
      repository,
      sourceResolver,
      stagingGroundService,
      validationService
    );
  }
  
  protected async determineFilePath(data: HealthInterventions): Promise<string> {
    // Logic to determine file path for health interventions
    // E.g., input/pagecontent/l2-dak.md
    return `input/pagecontent/health-intervention-${data.id || 'new'}.md`;
  }
  
  protected serializeToFile(data: HealthInterventions): string {
    // Serialize to Markdown format
    return `# ${data.title}\n\n${data.description}`;
  }
  
  protected parseFromFile(content: string): HealthInterventions {
    // Parse from Markdown
    // Implementation details...
    return {} as HealthInterventions;
  }
}
```

**Similar implementations for:**
- `GenericPersonaComponent` - `packages/dak-core/src/components/personas.ts`
- `UserScenarioComponent` - `packages/dak-core/src/components/userScenarios.ts`
- `BusinessProcessWorkflowComponent` - `packages/dak-core/src/components/businessProcesses.ts`
- `CoreDataElementComponent` - `packages/dak-core/src/components/dataElements.ts`
- `DecisionSupportLogicComponent` - `packages/dak-core/src/components/decisionLogic.ts`
- `ProgramIndicatorComponent` - `packages/dak-core/src/components/indicators.ts`
- `RequirementsComponent` - `packages/dak-core/src/components/requirements.ts`
- `TestScenarioComponent` - `packages/dak-core/src/components/testScenarios.ts`

#### 2.4 DAK Object
**New File:** `packages/dak-core/src/dakObject.ts`

The DAK Object represents a repository instance and provides access to Component Objects:

```typescript
/**
 * DAK Object - represents a repository instance of a DAK
 * Provides access to all 9 component objects
 */
export class DAKObject {
  private dak: DAK;
  private componentObjects: Map<DAKComponentType, DAKComponentObject<any, any>>;
  
  constructor(
    private repository: DAKRepository,
    private sourceResolver: SourceResolutionService,
    private stagingGroundService: any,
    dak?: DAK
  ) {
    this.dak = dak || this.createEmptyDAK();
    this.componentObjects = new Map();
    this.initializeComponents();
  }
  
  /** Get component object for a specific component type */
  getComponent<TData, TSource extends DAKComponentSource<TData>>(
    componentType: DAKComponentType
  ): DAKComponentObject<TData, TSource> {
    const component = this.componentObjects.get(componentType);
    if (!component) {
      throw new Error(`Component not found: ${componentType}`);
    }
    return component;
  }
  
  /** Convenience getters for each component */
  get healthInterventions(): HealthInterventionsComponent {
    return this.getComponent(DAKComponentType.HEALTH_INTERVENTIONS);
  }
  
  get personas(): GenericPersonaComponent {
    return this.getComponent(DAKComponentType.PERSONAS);
  }
  
  get userScenarios(): UserScenarioComponent {
    return this.getComponent(DAKComponentType.USER_SCENARIOS);
  }
  
  get businessProcesses(): BusinessProcessWorkflowComponent {
    return this.getComponent(DAKComponentType.BUSINESS_PROCESSES);
  }
  
  get dataElements(): CoreDataElementComponent {
    return this.getComponent(DAKComponentType.DATA_ELEMENTS);
  }
  
  get decisionLogic(): DecisionSupportLogicComponent {
    return this.getComponent(DAKComponentType.DECISION_LOGIC);
  }
  
  get indicators(): ProgramIndicatorComponent {
    return this.getComponent(DAKComponentType.INDICATORS);
  }
  
  get requirements(): RequirementsComponent {
    return this.getComponent(DAKComponentType.REQUIREMENTS);
  }
  
  get testScenarios(): TestScenarioComponent {
    return this.getComponent(DAKComponentType.TEST_SCENARIOS);
  }
  
  /** Get DAK metadata */
  getMetadata(): DAKMetadata {
    return {
      id: this.dak.id,
      name: this.dak.name,
      title: this.dak.title,
      description: this.dak.description,
      version: this.dak.version,
      status: this.dak.status,
      publicationUrl: this.dak.publicationUrl,
      license: this.dak.license,
      copyrightYear: this.dak.copyrightYear,
      publisher: this.dak.publisher
    };
  }
  
  /** Update DAK metadata */
  async updateMetadata(metadata: Partial<DAKMetadata>): Promise<void> {
    this.dak = { ...this.dak, ...metadata };
    await this.saveDakJson();
  }
  
  /** Export to dak.json format */
  toJSON(): DAK {
    // Collect sources from all components
    const dakJson: DAK = {
      ...this.dak,
      resourceType: 'DAK'
    };
    
    // Add sources from each component
    for (const [componentType, component] of this.componentObjects) {
      const sources = component.getSources();
      if (sources.length > 0) {
        // Map component type to DAK property name
        const propertyName = this.getDAKPropertyName(componentType);
        (dakJson as any)[propertyName] = sources;
      }
    }
    
    return dakJson;
  }
  
  /** Save dak.json to staging ground */
  async saveDakJson(): Promise<void> {
    const dakJson = this.toJSON();
    await this.stagingGroundService.updateFile(
      'dak.json',
      JSON.stringify(dakJson, null, 2),
      {
        message: 'Update DAK metadata',
        componentType: 'metadata'
      }
    );
  }
  
  /** Internal method to update component sources (called by components) */
  async updateComponentSources(
    componentType: DAKComponentType,
    sources: DAKComponentSource<any>[]
  ): Promise<void> {
    // Update internal DAK structure
    const propertyName = this.getDAKPropertyName(componentType);
    (this.dak as any)[propertyName] = sources;
    
    // Save to staging ground
    await this.saveDakJson();
  }
  
  private initializeComponents(): void {
    // Create component objects for each of the 9 types
    this.componentObjects.set(
      DAKComponentType.HEALTH_INTERVENTIONS,
      new HealthInterventionsComponent(
        this.repository,
        this.sourceResolver,
        this.stagingGroundService,
        null // Validation service - to be added
      )
    );
    
    // Similar initialization for all 9 components...
    // Each component gets its sources from this.dak
    
    // Load existing sources into components
    this.loadSourcesIntoComponents();
  }
  
  private loadSourcesIntoComponents(): void {
    // Load sources from dak into component objects
    if (this.dak.healthInterventions) {
      const component = this.componentObjects.get(DAKComponentType.HEALTH_INTERVENTIONS);
      this.dak.healthInterventions.forEach(source => component?.addSource(source));
    }
    // Similar for all 9 components...
  }
  
  private createEmptyDAK(): DAK {
    return {
      resourceType: 'DAK',
      id: '',
      name: '',
      title: '',
      description: '',
      version: '0.1.0',
      status: 'draft',
      publicationUrl: '',
      license: '',
      copyrightYear: new Date().getFullYear().toString(),
      publisher: { name: '', url: '' }
    };
  }
  
  private getDAKPropertyName(componentType: DAKComponentType): string {
    const map: Record<DAKComponentType, string> = {
      [DAKComponentType.HEALTH_INTERVENTIONS]: 'healthInterventions',
      [DAKComponentType.PERSONAS]: 'personas',
      [DAKComponentType.USER_SCENARIOS]: 'userScenarios',
      [DAKComponentType.BUSINESS_PROCESSES]: 'businessProcesses',
      [DAKComponentType.DATA_ELEMENTS]: 'dataElements',
      [DAKComponentType.DECISION_LOGIC]: 'decisionLogic',
      [DAKComponentType.INDICATORS]: 'indicators',
      [DAKComponentType.REQUIREMENTS]: 'requirements',
      [DAKComponentType.TEST_SCENARIOS]: 'testScenarios'
    };
    return map[componentType];
  }
}
```

#### 2.5 DAK Factory Service
**New File:** `packages/dak-core/src/dakFactory.ts`

Factory for creating DAK objects from repositories:

```typescript
export class DAKFactory {
  constructor(
    private sourceResolver: SourceResolutionService,
    private stagingGroundService: any
  ) {}
  
  /**
   * Create DAK object from repository
   */
  async createFromRepository(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<DAKObject> {
    const repository: DAKRepository = { owner, repo, branch };
    
    // Try to load existing dak.json from staging ground or repository
    const dakJson = await this.loadDakJson(repository);
    
    return new DAKObject(
      repository,
      this.sourceResolver,
      this.stagingGroundService,
      dakJson
    );
  }
  
  /**
   * Create DAK object from existing dak.json
   */
  async createFromDakJson(
    dakJson: DAK,
    repository: DAKRepository
  ): Promise<DAKObject> {
    return new DAKObject(
      repository,
      this.sourceResolver,
      this.stagingGroundService,
      dakJson
    );
  }
  
  /**
   * Initialize empty DAK object for new repository
   */
  createEmpty(repository: DAKRepository, metadata?: Partial<DAKMetadata>): DAKObject {
    const emptyDak: DAK = {
      resourceType: 'DAK',
      id: metadata?.id || `${repository.owner}.${repository.repo}`,
      name: metadata?.name || repository.repo,
      title: metadata?.title || repository.repo,
      description: metadata?.description || '',
      version: metadata?.version || '0.1.0',
      status: metadata?.status || 'draft',
      publicationUrl: metadata?.publicationUrl || '',
      license: metadata?.license || 'CC-BY-4.0',
      copyrightYear: metadata?.copyrightYear || new Date().getFullYear().toString(),
      publisher: metadata?.publisher || { name: repository.owner, url: '' }
    };
    
    return new DAKObject(
      repository,
      this.sourceResolver,
      this.stagingGroundService,
      emptyDak
    );
  }
  
  private async loadDakJson(repository: DAKRepository): Promise<DAK | undefined> {
    // Try staging ground first
    const staged = await this.stagingGroundService.getFile('dak.json');
    if (staged) {
      return JSON.parse(staged.content);
    }
    
    // Try remote repository
    // Implementation depends on GitHub service
    return undefined;
  }
}
```

### Phase 3: Update Staging Ground Integration (1-2 days)

#### 3.1 Extend Staging Ground Service
**File:** `src/services/stagingGroundService.js`

Update to work with DAK objects (but asset editors should NOT access this directly):

```javascript
class StagingGroundService {
  /**
   * Get file content from staging ground
   */
  getFile(path) {
    const stagingGround = this.getStagingGround();
    return stagingGround.files.find(f => f.path === path);
  }
  
  /**
   * Update file in staging ground
   * NOTE: This should primarily be called by Component Objects, not directly by editors
   */
  updateFile(filePath, content, metadata = {}) {
    const stagingGround = this.getStagingGround();
    
    // Find existing file or create new one
    const existingFileIndex = stagingGround.files.findIndex(f => f.path === filePath);
    const fileObject = {
      path: filePath,
      content: content,
      metadata: {
        ...metadata,
        lastModified: Date.now()
      },
      timestamp: Date.now()
    };
    
    if (existingFileIndex >= 0) {
      stagingGround.files[existingFileIndex] = fileObject;
    } else {
      stagingGround.files.push(fileObject);
    }
    
    return this.saveStagingGround(stagingGround);
  }
  
  /**
   * Check if a file exists in staging ground
   */
  hasFile(path) {
    const stagingGround = this.getStagingGround();
    return stagingGround.files.some(f => f.path === path);
  }
  
  /**
   * List all files for a component type
   */
  getFilesForComponent(componentType) {
    const stagingGround = this.getStagingGround();
    return stagingGround.files.filter(
      f => f.metadata?.componentType === componentType
    );
  }
}
```

#### 3.2 Create DAK Management Service
**New File:** `src/services/dakManagementService.js`

Service to manage DAK objects in the React application (bridge to DAK core):

```javascript
import { DAKFactory, SourceResolutionService } from '../../packages/dak-core/src';
import stagingGroundService from './stagingGroundService';

class DAKManagementService {
  constructor() {
    this.sourceResolver = new SourceResolutionService();
    this.dakFactory = new DAKFactory(this.sourceResolver, stagingGroundService);
    this.currentDAK = null;
  }
  
  /**
   * Initialize or get DAK for repository
   */
  async getDAK(owner, repo, branch = 'main') {
    const key = `${owner}/${repo}/${branch}`;
    
    // Return cached if same repository
    if (this.currentDAK && this.currentDAK.key === key) {
      return this.currentDAK.dak;
    }
    
    // Create new DAK object
    const dak = await this.dakFactory.createFromRepository(owner, repo, branch);
    this.currentDAK = { key, dak };
    
    return dak;
  }
  
  /**
   * Get component object for a specific component type
   */
  async getComponent(owner, repo, branch, componentType) {
    const dak = await this.getDAK(owner, repo, branch);
    return dak.getComponent(componentType);
  }
  
  /**
   * Scan repository for artifacts of a component type
   * This adds sources to the component if not already present
   */
  async scanForArtifacts(owner, repo, branch, componentType) {
    const component = await this.getComponent(owner, repo, branch, componentType);
    
    // Scan repository directory structure (implementation depends on GitHub service)
    const artifacts = await this.scanRepositoryDirectory(owner, repo, branch, componentType);
    
    // Register artifacts not already in sources
    const existingSources = component.getSources();
    const existingPaths = existingSources
      .map(s => s.url)
      .filter(url => url !== undefined);
    
    for (const artifact of artifacts) {
      if (!existingPaths.includes(artifact.path)) {
        await component.addSource({
          url: artifact.path,
          metadata: {
            addedAt: new Date().toISOString(),
            addedBy: 'artifact-scanner',
            sourceType: 'url-relative'
          }
        });
      }
    }
    
    return artifacts;
  }
  
  /**
   * Helper to scan repository directory
   */
  async scanRepositoryDirectory(owner, repo, branch, componentType) {
    // Implementation depends on GitHub service
    // Returns list of { path, name, type } objects
    return [];
  }
}

// Export singleton
const dakManagementService = new DAKManagementService();
export default dakManagementService;
```

### Phase 4: Update Asset Editors to Use Component Objects (3-4 days)

Asset editors (BPMN editor, Generic Persona editor, etc.) should use Component Objects instead of directly accessing staging ground or files.

#### 4.1 Generic Pattern for Asset Editors

**Standard Integration Pattern for Editors:**

```javascript
// Example: GenericPersonaEditor.js
import { useState, useEffect } from 'react';
import { useDAKUrlParams } from '../hooks/useDAKUrlParams';
import dakManagementService from '../services/dakManagementService';
import { DAKComponentType } from '../../packages/dak-core/src/types';

function GenericPersonaEditor({ personaId }) {
  const [persona, setPersona] = useState(null);
  const [personaComponent, setPersonaComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  const { user, repo, branch } = useDAKUrlParams();
  
  useEffect(() => {
    loadPersona();
  }, [user, repo, branch, personaId]);
  
  const loadPersona = async () => {
    try {
      setLoading(true);
      
      // Get the personas component object
      const component = await dakManagementService.getComponent(
        user,
        repo,
        branch,
        DAKComponentType.PERSONAS
      );
      setPersonaComponent(component);
      
      if (personaId) {
        // Load existing persona
        const data = await component.retrieveById(personaId);
        setPersona(data);
      } else {
        // New persona
        setPersona(createEmptyPersona());
      }
    } catch (error) {
      console.error('Failed to load persona:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async (personaData) => {
    try {
      setSaving(true);
      
      // Validate first
      const validationResult = await personaComponent.validate(personaData);
      if (!validationResult.isValid) {
        setValidationErrors(validationResult.errors);
        return;
      }
      
      // Save using component object (handles file creation and source registration)
      await personaComponent.save(personaData, {
        path: `input/actors/persona-${personaData.id}.fsh`,
        message: `Update persona: ${personaData.name}`
      });
      
      // Update local state
      setPersona(personaData);
      setValidationErrors([]);
      
      // Show success message
      alert('Persona saved successfully!');
    } catch (error) {
      console.error('Failed to save persona:', error);
      alert('Failed to save persona: ' + error.message);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this persona?')) {
      return;
    }
    
    try {
      // Find source index for this persona
      const sources = personaComponent.getSources();
      const sourceIndex = sources.findIndex(s => {
        // Logic to match source to this persona
        // Could be by URL path or inline data ID
        return s.url && s.url.includes(personaId);
      });
      
      if (sourceIndex >= 0) {
        await personaComponent.removeSource(sourceIndex);
        // Navigate back to list
        window.history.back();
      }
    } catch (error) {
      console.error('Failed to delete persona:', error);
      alert('Failed to delete persona: ' + error.message);
    }
  };
  
  if (loading) {
    return <div>Loading persona...</div>;
  }
  
  return (
    <div className="persona-editor">
      <h2>{personaId ? 'Edit Persona' : 'Create Persona'}</h2>
      
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h3>Validation Errors:</h3>
          <ul>
            {validationErrors.map((error, i) => (
              <li key={i}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
      
      <PersonaForm
        persona={persona}
        onSave={handleSave}
        onDelete={personaId ? handleDelete : null}
        saving={saving}
      />
    </div>
  );
}

function createEmptyPersona() {
  return {
    id: `persona-${Date.now()}`,
    name: '',
    description: '',
    type: 'human',
    roles: []
  };
}
```

**Example: BPMNEditor.js (Business Process Editor)**

```javascript
import { useState, useEffect } from 'react';
import { useDAKUrlParams } from '../hooks/useDAKUrlParams';
import dakManagementService from '../services/dakManagementService';
import { DAKComponentType } from '../../packages/dak-core/src/types';
import BpmnModeler from 'bpmn-js/lib/Modeler';

function BPMNEditor({ processId }) {
  const [bpmnComponent, setBpmnComponent] = useState(null);
  const [bpmnXML, setBpmnXML] = useState(null);
  const [modeler, setModeler] = useState(null);
  const { user, repo, branch } = useDAKUrlParams();
  
  useEffect(() => {
    loadBPMN();
  }, [user, repo, branch, processId]);
  
  const loadBPMN = async () => {
    try {
      // Get the business processes component object
      const component = await dakManagementService.getComponent(
        user,
        repo,
        branch,
        DAKComponentType.BUSINESS_PROCESSES
      );
      setBpmnComponent(component);
      
      if (processId) {
        // Load existing BPMN
        const processData = await component.retrieveById(processId);
        setBpmnXML(processData.bpmnXML);
      } else {
        // Create new BPMN
        setBpmnXML(createEmptyBPMN());
      }
    } catch (error) {
      console.error('Failed to load BPMN:', error);
    }
  };
  
  const handleSave = async () => {
    try {
      // Get current XML from modeler
      const { xml } = await modeler.saveXML({ format: true });
      
      // Save using component object
      await bpmnComponent.save(
        { id: processId, bpmnXML: xml },
        {
          path: `input/business-processes/${processId}.bpmn`,
          message: `Update business process: ${processId}`
        }
      );
      
      alert('BPMN saved successfully!');
    } catch (error) {
      console.error('Failed to save BPMN:', error);
      alert('Failed to save BPMN: ' + error.message);
    }
  };
  
  return (
    <div className="bpmn-editor">
      <div className="toolbar">
        <button onClick={handleSave}>Save</button>
      </div>
      <div id="bpmn-canvas" style={{ height: '600px' }}></div>
    </div>
  );
}
```

#### 4.2 Component List Pages

Component list pages show all instances and use Component Objects for retrieval:

```javascript
// Example: GenericPersonasListPage.js
import { useState, useEffect } from 'react';
import { useDAKUrlParams } from '../hooks/useDAKUrlParams';
import dakManagementService from '../services/dakManagementService';
import { DAKComponentType } from '../../packages/dak-core/src/types';

function GenericPersonasListPage() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const { user, repo, branch } = useDAKUrlParams();
  
  useEffect(() => {
    loadPersonas();
  }, [user, repo, branch]);
  
  const loadPersonas = async () => {
    try {
      setLoading(true);
      
      // Get the personas component object
      const component = await dakManagementService.getComponent(
        user,
        repo,
        branch,
        DAKComponentType.PERSONAS
      );
      
      // Retrieve all personas
      const allPersonas = await component.retrieveAll();
      setPersonas(allPersonas);
    } catch (error) {
      console.error('Failed to load personas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleScan = async () => {
    try {
      setScanning(true);
      
      // Scan repository for persona artifacts
      // This will automatically add sources to the component
      await dakManagementService.scanForArtifacts(
        user,
        repo,
        branch,
        DAKComponentType.PERSONAS
      );
      
      // Reload personas
      await loadPersonas();
    } catch (error) {
      console.error('Failed to scan for personas:', error);
    } finally {
      setScanning(false);
    }
  };
  
  const handleValidateAll = async () => {
    try {
      const component = await dakManagementService.getComponent(
        user,
        repo,
        branch,
        DAKComponentType.PERSONAS
      );
      
      const results = await component.validateAll();
      
      // Show validation results
      const errors = results.filter(r => !r.isValid);
      if (errors.length === 0) {
        alert('All personas are valid!');
      } else {
        alert(`${errors.length} personas have validation errors.`);
      }
    } catch (error) {
      console.error('Failed to validate personas:', error);
    }
  };
  
  return (
    <div className="personas-list-page">
      <div className="header">
        <h1>Generic Personas</h1>
        <div className="actions">
          <button onClick={handleScan} disabled={scanning}>
            {scanning ? 'Scanning...' : 'Scan Repository'}
          </button>
          <button onClick={handleValidateAll}>Validate All</button>
          <button onClick={() => navigate('new')}>Create New</button>
        </div>
      </div>
      
      {loading ? (
        <div>Loading personas...</div>
      ) : (
        <div className="personas-grid">
          {personas.map(persona => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onClick={() => navigate(persona.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 4.3 Asset Editors to Update

**Priority Order (with Component Object integration):**

1. **Generic Persona Editor** (Pilot implementation)
   - Uses `GenericPersonaComponent` for all operations
   - No direct file/staging ground access
   - Test pattern thoroughly

2. **Business Process Editor (BPMN)**
   - Uses `BusinessProcessWorkflowComponent`
   - BPMN XML saved via component object
   - Component handles file path determination

3. **Decision Logic Editor (DMN)**
   - Uses `DecisionSupportLogicComponent`
   - DMN XML saved via component object

4. **User Scenarios Editor**
   - Uses `UserScenarioComponent`
   - Markdown or structured format

5. **Core Data Elements Editor**
   - Uses `CoreDataElementComponent`
   - FSH file generation via component

6. **Health Interventions Editor**
   - Uses `HealthInterventionsComponent`
   - Markdown with IRIS references

7. **Program Indicators Editor**
   - Uses `ProgramIndicatorComponent`
   - FHIR Measure format

8. **Requirements Editor**
   - Uses `RequirementsComponent`
   - Structured requirements format

9. **Test Scenarios Editor**
   - Uses `TestScenarioComponent`
   - FHIR example bundles

#### 4.4 Key Principles for Editors

**DO:**
- ✅ Use Component Objects for all data operations
- ✅ Call `component.retrieveAll()` to list instances
- ✅ Call `component.retrieveById()` to load specific instance
- ✅ Call `component.save()` to save changes
- ✅ Call `component.validate()` before saving
- ✅ Use `dakManagementService` to get component objects

**DON'T:**
- ❌ Directly access `stagingGroundService` from editors
- ❌ Manually create/update dak.json
- ❌ Bypass component validation
- ❌ Hard-code file paths (let component determine)
- ❌ Directly call GitHub API for file operations

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

## Architecture Summary

### Object-Oriented Design

The implementation follows a clean object-oriented architecture:

1. **DAK Object** - Represents a repository instance
   - Contains metadata
   - Provides access to 9 Component Objects
   - Manages dak.json serialization

2. **Component Objects** - One for each of the 9 DAK components
   - Handles retrieval (from staging ground, remote, canonical sources)
   - Handles saving (to files or inline in dak.json)
   - Handles validation (component-specific rules)
   - Manages sources (add, update, remove)

3. **Asset Editors** - UI components for editing DAK artifacts
   - Use Component Objects exclusively
   - No direct access to staging ground or files
   - Simple interface: retrieve, save, validate

### Component Object Hierarchy

```
DAKObject (repository instance)
├── HealthInterventionsComponent
├── GenericPersonaComponent
├── UserScenarioComponent
├── BusinessProcessWorkflowComponent
├── CoreDataElementComponent
├── DecisionSupportLogicComponent
├── ProgramIndicatorComponent
├── RequirementsComponent
└── TestScenarioComponent
```

### Data Flow

```
Asset Editor (e.g., BPMN Editor)
    ↓ (retrieve/save/validate)
Component Object (e.g., BusinessProcessWorkflowComponent)
    ↓ (resolve sources / update sources)
Source Resolution Service
    ↓ (load from staging/remote)
Staging Ground Service / GitHub Service
    ↓
Files / dak.json
```

### Key Benefits

1. **Separation of Concerns**: Editors don't need to know about files, staging ground, or dak.json
2. **Reusability**: Component Objects can be used by any editor or service
3. **Consistency**: All components follow the same interface
4. **Validation**: Built into component objects, not scattered across editors
5. **Testability**: Component objects can be easily unit tested
6. **Maintainability**: Changes to storage mechanism only affect component objects

## Implementation Timeline

### Week 1
- **Days 1-2:** Phase 1 - Type definitions and interfaces
- **Days 3-5:** Phase 2 - Source resolution service and base component class

### Week 2
- **Days 1-3:** Phase 2 - Implement all 9 Component Objects
- **Days 4-5:** Phase 2 - DAK Object and Factory

### Week 3
- **Days 1-2:** Phase 3 - Staging ground integration and DAK management service
- **Days 3-5:** Phase 4 - Update first 3 asset editors (Personas, BPMN, DMN)

### Week 4
- **Days 1-3:** Phase 4 - Update remaining 6 asset editors
- **Days 4-5:** Phase 5 - Unit tests for component objects

### Week 5
- **Days 1-2:** Phase 5 - Integration tests and validation
- **Days 3-5:** Phase 6 - Migration plan and PR updates

### Week 6
- **Days 1-3:** Phase 7 - Documentation and examples
- **Days 4-5:** Final review and refinement

**Total Estimated Time:** 5-6 weeks

## Key Design Decisions

### 1. Component Object Architecture
**Decision:** Create dedicated Component Objects for each of the 9 DAK components, each handling retrieval, saving, and validation.

**Rationale:**
- Clean separation of concerns between UI (editors) and business logic (components)
- Editors don't need to know about storage details (files, staging ground, dak.json)
- Consistent interface across all components
- Easy to add new components in the future
- Better testability and maintainability

### 2. Base Component Class
**Decision:** Use abstract base class with template methods for component-specific behavior.

**Benefits:**
- Code reuse for common operations (retrieve, save, validate, source management)
- Consistent behavior across all 9 components
- Component-specific logic isolated in subclasses
- Single place to update core functionality

### 3. Asset Editors Use Component Objects
**Decision:** Asset editors (BPMN, Persona, etc.) only interact with Component Objects, never directly with staging ground or files.

**Benefits:**
- Simplified editor code - just call retrieve/save/validate
- Centralized validation and business logic in components
- Easier to change storage mechanism without touching editors
- Better separation of UI and business logic
- Consistent error handling

### 4. Source Type Priority
When multiple source types are present in one source object:
1. Inline data (highest priority - most specific)
2. Relative URL (local repository data)
3. Absolute URL (external resources)
4. Canonical IRI (lowest priority - most general)

### 5. Relative URL Resolution
- Always relative to `input/` directory
- Example: `fsh/actors/myActor.fsh` → `{repo}/input/fsh/actors/myActor.fsh`
- Validate path existence during resolution
- Component Objects determine appropriate paths for new files

### 6. Automatic dak.json Management
**Decision:** Component Objects automatically update dak.json when sources change.

**Rationale:**
- No manual dak.json editing required
- Always in sync with actual sources
- Reduced chance of inconsistencies
- dak.json visible in staging ground for review
- Clear indication when dak.json is out of sync

### 7. Caching Strategy
- Cache resolved sources in Component Objects
- Invalidate on source updates
- Configurable TTL for external URLs
- Cache key: (component type + source index + instance ID)

### 8. Error Handling
- Graceful degradation for failed source resolution
- Clear error messages indicating which source failed
- Continue resolving other sources on individual failures
- Validation errors collected and reported as a group
- Component-specific error messages

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

1. ✅ All 9 DAK Component Objects implemented and tested
2. ✅ DAK Object provides access to all component objects
3. ✅ Asset editors use Component Objects exclusively (no direct file/staging access)
4. ✅ Artifacts are automatically registered in dak.json via Component Objects
5. ✅ Relative URLs resolve correctly to repository files
6. ✅ Staging ground shows updated dak.json automatically
7. ✅ All existing tests pass
8. ✅ New tests achieve 80%+ coverage for component objects
9. ✅ Documentation is complete and clear
10. ✅ In-progress PRs are migrated successfully
11. ✅ No regressions in existing functionality
12. ✅ Performance is acceptable (< 500ms for retrieve operations)
13. ✅ Validation works consistently across all components
14. ✅ Source resolution works for all 4 source types (canonical, absolute URL, relative URL, inline)

## Next Steps

1. **Review and Approval:** Present this plan for review
2. **Refinement:** Incorporate feedback
3. **Prototype:** Build proof-of-concept for one component
4. **Validation:** Test approach with real repository
5. **Full Implementation:** Execute phases sequentially
6. **Migration:** Update in-progress PRs
7. **Release:** Deploy with comprehensive documentation

## Questions for Review

1. Should Component Objects support nested sources (sources that reference other sources)?
2. What caching TTL is appropriate for external URLs?
3. Should dak.json be committed automatically or require explicit action from staging ground?
4. How to handle conflicts between inline data and file-based data in the same source?
5. Should Component Objects support batch operations for adding multiple sources?
6. What validation level is required for canonical IRIs?
7. Should source metadata include version information?
8. How to handle migration of existing repositories without dak.json?
9. Should Component Objects provide transaction-like semantics (rollback on save failure)?
10. What level of caching is appropriate for Component Objects?
11. Should editors be able to override file paths determined by Component Objects?
12. How should Component Objects handle merge conflicts in collaborative scenarios?

## References

- WHO SMART Guidelines DAK.fsh: https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/DAK.fsh
- Issue #1110: Update DAK Logical Model
- Existing DAK Architecture: `services/dak-faq-mcp/DAK_ARCHITECTURE.md`
- Current Types: `packages/dak-core/src/types.ts`
