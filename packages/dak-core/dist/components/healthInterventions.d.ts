/**
 * Health Interventions Component Object
 * Handles retrieval, saving, and validation of Health Interventions instances
 */
import { HealthInterventions, HealthInterventionsSource, DAKRepository, DAKValidationResult } from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';
export declare class HealthInterventionsComponent extends BaseDAKComponentObject<HealthInterventions, HealthInterventionsSource> {
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, onSourcesChanged?: (sources: HealthInterventionsSource[]) => Promise<void>);
    /**
     * Determine file path for Health Interventions
     * Health interventions are typically stored in markdown or JSON format
     */
    protected determineFilePath(data: HealthInterventions): Promise<string>;
    /**
     * Serialize Health Interventions to markdown format
     */
    protected serializeToFile(data: HealthInterventions): string;
    /**
     * Parse Health Interventions from markdown content
     */
    protected parseFromFile(content: string): HealthInterventions;
    /**
     * Validate Health Interventions instance
     */
    validate(data: HealthInterventions): Promise<DAKValidationResult>;
}
