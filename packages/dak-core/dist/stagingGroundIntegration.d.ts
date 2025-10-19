/**
 * Staging Ground Integration Service
 * Bridges DAK Component Objects with the existing StagingGroundService
 * Handles dak.json management and file storage/retrieval
 */
import { DAKComponentSource, DAKComponentType, DAKRepository, DAK } from './types';
/**
 * Interface for staging ground service
 * This matches the existing stagingGroundService.js interface
 */
export interface IStagingGroundService {
    initialize(repository: any, branch: string): void;
    getStagingGround(): any;
    updateFile(path: string, content: string, metadata?: any): boolean;
    removeFile(path: string): boolean;
    hasChanges(): boolean;
    getChangedFilesCount(): number;
    contributeFiles(files: any[], metadata?: any): {
        success: boolean;
        results: any[];
    };
    getStatus(): any;
}
/**
 * Staging Ground Integration Service
 * Provides integration between DAK Component Objects and staging ground
 */
export declare class StagingGroundIntegrationService {
    private stagingGroundService;
    private repository;
    private branch;
    private dakJsonPath;
    constructor(stagingGroundService: IStagingGroundService, repository: DAKRepository, branch: string);
    /**
     * Load dak.json from staging ground or repository
     * Returns null if not found
     */
    loadDakJson(): Promise<Partial<DAK> | null>;
    /**
     * Save dak.json to staging ground
     */
    saveDakJson(dak: Partial<DAK>): Promise<boolean>;
    /**
     * Update component sources in dak.json
     * Loads current dak.json, updates the specified component sources, and saves
     */
    updateComponentSources<T>(componentType: DAKComponentType, sources: DAKComponentSource<T>[]): Promise<boolean>;
    /**
     * Save component artifact to staging ground
     * This handles saving the actual content files (BPMN, FSH, Markdown, etc.)
     */
    saveComponentArtifact(componentType: DAKComponentType, relativePath: string, content: string, metadata?: any): Promise<boolean>;
    /**
     * Load component artifact from staging ground or repository
     */
    loadComponentArtifact(relativePath: string): Promise<string | null>;
    /**
     * Remove component artifact from staging ground
     */
    removeComponentArtifact(relativePath: string): Promise<boolean>;
    /**
     * Get staging ground status
     */
    getStatus(): any;
    /**
     * Check if there are staged changes
     */
    hasChanges(): boolean;
    /**
     * Map component type to dak.json property name
     */
    private getComponentKey;
    /**
     * Create a relative URL source for a file saved to staging ground
     */
    createRelativeUrlSource<T>(relativePath: string, metadata?: any): DAKComponentSource<T>;
    /**
     * Create an inline source for data embedded in dak.json
     */
    createInlineSource<T>(data: T, metadata?: any): DAKComponentSource<T>;
}
