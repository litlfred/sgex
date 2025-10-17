/**
 * DAK Object
 * Represents a repository instance of a DAK
 * Provides access to all 9 component objects
 */
import { DAK, DAKMetadata, DAKRepository, DAKComponentType, DAKComponentSource } from './types';
import { SourceResolutionService } from './sourceResolution';
import { StagingGroundIntegrationService } from './stagingGroundIntegration';
import { BaseDAKComponentObject } from './dakComponentObject';
import { GenericPersonaComponent, CoreDataElementComponent, BusinessProcessWorkflowComponent, DecisionSupportLogicComponent, HealthInterventionsComponent, UserScenarioComponent, ProgramIndicatorComponent, RequirementsComponent, TestScenarioComponent } from './components';
/**
 * DAK Object - represents a repository instance of a DAK
 * Provides access to all component objects (all 9 components)
 */
export declare class DAKObject {
    private repository;
    private sourceResolver;
    private stagingGroundIntegration;
    private dak;
    private componentObjects;
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundIntegration: StagingGroundIntegrationService, dak?: DAK);
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
     * Convenience getter for health interventions component
     */
    get healthInterventions(): HealthInterventionsComponent;
    /**
     * Convenience getter for user scenarios component
     */
    get userScenarios(): UserScenarioComponent;
    /**
     * Convenience getter for decision logic component
     */
    get decisionLogic(): DecisionSupportLogicComponent;
    /**
     * Convenience getter for indicators component
     */
    get indicators(): ProgramIndicatorComponent;
    /**
     * Convenience getter for requirements component
     */
    get requirements(): RequirementsComponent;
    /**
     * Convenience getter for test scenarios component
     */
    get testScenarios(): TestScenarioComponent;
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
