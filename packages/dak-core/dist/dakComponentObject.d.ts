/**
 * DAK Component Object
 * Object-oriented interface for managing DAK component instances
 * Handles retrieval (staging ground, remote), saving, and validation
 */
import { DAKComponentSource, DAKComponentType, DAKRepository, SaveOptions, DAKValidationResult } from './types';
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
export declare abstract class BaseDAKComponentObject<TData, TSource extends DAKComponentSource<TData>> implements DAKComponentObject<TData, TSource> {
    readonly componentType: DAKComponentType;
    protected repository: DAKRepository;
    protected sourceResolver: SourceResolutionService;
    protected stagingGroundService: any;
    protected sources: TSource[];
    protected cache: Map<string, TData>;
    protected onSourcesChanged?: (sources: TSource[]) => Promise<void>;
    constructor(componentType: DAKComponentType, repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, // Will be typed properly
    onSourcesChanged?: (sources: TSource[]) => Promise<void>);
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
    /** Save instance data */
    save(data: TData, options?: SaveOptions): Promise<void>;
    /** Validate instance data */
    validate(data: TData): Promise<DAKValidationResult>;
    /** Validate all instances */
    validateAll(): Promise<DAKValidationResult[]>;
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
    /**
     * Save as inline data in source
     */
    private saveInline;
    /**
     * Save to file in repository
     */
    private saveToFile;
    /**
     * Sync sources to parent DAK object
     */
    private syncSources;
    /**
     * Initialize sources (called by DAK Object when loading)
     */
    initializeSources(sources: TSource[]): void;
}
