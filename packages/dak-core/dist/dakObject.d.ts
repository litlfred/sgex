/**
 * DAK Object
 * Represents a repository instance of a DAK
 * Provides access to all 9 component objects
 */
import { DAK, DAKMetadata, DAKRepository, DAKComponentType, DAKComponentSource } from './types';
import { SourceResolutionService } from './sourceResolution';
import { BaseDAKComponentObject } from './dakComponentObject';
import { GenericPersonaComponent, CoreDataElementComponent, BusinessProcessWorkflowComponent } from './components';
/**
 * DAK Object - represents a repository instance of a DAK
 * Provides access to all component objects (currently 3, will be 9)
 */
export declare class DAKObject {
    private repository;
    private sourceResolver;
    private stagingGroundService;
    private dak;
    private componentObjects;
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, dak?: DAK);
    /**
     * Get component object for a specific component type
     */
    getComponent<TData, TSource extends DAKComponentSource<TData>>(componentType: DAKComponentType): BaseDAKComponentObject<TData, TSource>;
    /**
     * Convenience getter for personas component
     */
    get personas(): GenericPersonaComponent;
    /**
     * Convenience getter for data elements component
     */
    get dataElements(): CoreDataElementComponent;
    /**
     * Convenience getter for business processes component
     */
    get businessProcesses(): BusinessProcessWorkflowComponent;
    /**
     * Get DAK metadata
     */
    getMetadata(): DAKMetadata;
    /**
     * Update DAK metadata
     */
    updateMetadata(metadata: Partial<DAKMetadata>): Promise<void>;
    /**
     * Export to dak.json format
     */
    toJSON(): DAK;
    /**
     * Save dak.json to staging ground
     */
    saveDakJson(): Promise<void>;
    /**
     * Internal method to update component sources (called by components)
     */
    updateComponentSources(componentType: DAKComponentType, sources: DAKComponentSource<any>[]): Promise<void>;
    private initializeComponents;
    private loadSourcesIntoComponents;
    private createEmptyDAK;
    private getDAKPropertyName;
}
