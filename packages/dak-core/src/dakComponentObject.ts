/**
 * DAK Component Object
 * Object-oriented interface for managing DAK component instances
 * Handles retrieval (staging ground, remote), saving, and validation
 */

import {
  DAKComponentSource,
  DAKComponentType,
  DAKRepository,
  ResolvedSource,
  SaveOptions,
  DAKValidationResult
} from './types';
import { SourceResolutionService } from './sourceResolution';

/**
 * Base interface for DAK Component Objects
 * Each of the 9 DAK components will implement this interface
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
  
  /** Retrieve single instance by ID */
  retrieveById(id: string): Promise<TData | null>;
  
  /** Save instance data (to staging ground and update sources) */
  save(data: TData, options?: SaveOptions): Promise<void>;
  
  /** Validate instance data */
  validate(data: TData): Promise<DAKValidationResult>;
  
  /** Validate all instances */
  validateAll(): Promise<DAKValidationResult[]>;
}

/**
 * Base implementation for DAK Component Objects
 * Provides common functionality for all 9 components
 */
export abstract class BaseDAKComponentObject<TData, TSource extends DAKComponentSource<TData>> 
  implements DAKComponentObject<TData, TSource> {
  
  protected sources: TSource[] = [];
  protected cache: Map<string, TData> = new Map();
  protected onSourcesChanged?: (sources: TSource[]) => Promise<void>;
  
  constructor(
    public readonly componentType: DAKComponentType,
    protected repository: DAKRepository,
    protected sourceResolver: SourceResolutionService,
    protected stagingGroundService: any, // Will be typed properly
    onSourcesChanged?: (sources: TSource[]) => Promise<void>
  ) {
    this.onSourcesChanged = onSourcesChanged;
  }
  
  /** Get all sources for this component */
  getSources(): TSource[] {
    return [...this.sources];
  }
  
  /** Add a source to this component */
  async addSource(source: TSource): Promise<void> {
    // Validate source first
    const validation = this.sourceResolver.validateSource(source);
    if (!validation.isValid) {
      throw new Error(`Invalid source: ${validation.errors.join(', ')}`);
    }
    
    this.sources.push(source);
    await this.syncSources();
  }
  
  /** Update a source at index */
  async updateSource(index: number, updates: Partial<TSource>): Promise<void> {
    if (index < 0 || index >= this.sources.length) {
      throw new Error(`Invalid source index: ${index}`);
    }
    
    this.sources[index] = { ...this.sources[index], ...updates } as TSource;
    await this.syncSources();
  }
  
  /** Remove a source at index */
  async removeSource(index: number): Promise<void> {
    if (index < 0 || index >= this.sources.length) {
      throw new Error(`Invalid source index: ${index}`);
    }
    
    this.sources.splice(index, 1);
    await this.syncSources();
  }
  
  /** Retrieve and resolve all instance data from all sources */
  async retrieveAll(): Promise<TData[]> {
    const allData: TData[] = [];
    
    for (let i = 0; i < this.sources.length; i++) {
      const source = this.sources[i];
      try {
        const resolved = await this.sourceResolver.resolveSource(source, this.repository);
        allData.push(resolved.data);
        
        // Cache the data if it has an ID
        const data = resolved.data as any;
        if (data && data.id) {
          this.cache.set(data.id, resolved.data);
        }
      } catch (error) {
        console.error(`Failed to resolve source ${i} for ${this.componentType}:`, error);
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
  async validate(data: TData): Promise<DAKValidationResult> {
    // Default validation - subclasses can override
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // Check for required ID
    const dataWithId = data as any;
    if (!dataWithId.id) {
      warnings.push({
        code: 'MISSING_ID',
        message: 'Instance data should have an id property'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date()
    };
  }
  
  /** Validate all instances */
  async validateAll(): Promise<DAKValidationResult[]> {
    const allData = await this.retrieveAll();
    const results: DAKValidationResult[] = [];
    
    for (const data of allData) {
      results.push(await this.validate(data));
    }
    
    return results;
  }
  
  // ============================================================================
  // Abstract methods - must be implemented by subclasses
  // ============================================================================
  
  /**
   * Determine file path for instance data
   * Subclasses implement component-specific path logic
   */
  protected abstract determineFilePath(data: TData): Promise<string>;
  
  /**
   * Serialize instance data to file format
   * Subclasses implement component-specific serialization
   */
  protected abstract serializeToFile(data: TData): string;
  
  /**
   * Parse instance data from file content
   * Subclasses implement component-specific parsing
   */
  protected abstract parseFromFile(content: string): TData;
  
  // ============================================================================
  // Private helper methods
  // ============================================================================
  
  /**
   * Save as inline instance data in source
   */
  private async saveInline(data: TData, updateExisting: boolean): Promise<void> {
    if (updateExisting) {
      // Find existing inline source and update
      const inlineIndex = this.sources.findIndex(s => s.instance !== undefined);
      if (inlineIndex >= 0) {
        await this.updateSource(inlineIndex, { instance: data } as Partial<TSource>);
        return;
      }
    }
    
    // Add new inline source
    await this.addSource({ 
      instance: data,
      metadata: {
        addedAt: new Date().toISOString(),
        addedBy: 'sgex-workbench',
        sourceType: 'inline'
      }
    } as TSource);
  }
  
  /**
   * Save to file in repository
   */
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
    
    // Update cache
    const dataWithId = data as any;
    if (dataWithId.id) {
      this.cache.set(dataWithId.id, data);
    }
  }
  
  /**
   * Sync sources to parent DAK object
   */
  private async syncSources(): Promise<void> {
    if (this.onSourcesChanged) {
      await this.onSourcesChanged(this.sources);
    }
  }
  
  /**
   * Initialize sources (called by DAK Object when loading)
   */
  initializeSources(sources: TSource[]): void {
    this.sources = sources;
  }
}
